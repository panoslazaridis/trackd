import { 
  users, customers, jobs, competitors, insights,
  type User, type InsertUser, type UpdateUserProfile,
  type Job, type InsertJob,
  type Customer, type InsertCustomer,
  type Competitor, type InsertCompetitor,
  type Insight, type InsertInsight
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

// Storage interface for all business entities
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: string, profile: UpdateUserProfile): Promise<User>;
  
  // Job operations  
  getJobs(userId: string): Promise<Job[]>;
  getJob(id: string, userId: string): Promise<Job | undefined>;
  createJob(userId: string, job: InsertJob): Promise<Job>;
  updateJob(id: string, userId: string, job: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: string, userId: string): Promise<void>;
  
  // Customer operations
  getCustomers(userId: string): Promise<Customer[]>;
  getCustomer(id: string, userId: string): Promise<Customer | undefined>;
  createCustomer(userId: string, customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, userId: string, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: string, userId: string): Promise<void>;
  
  // Competitor operations
  getCompetitors(userId: string): Promise<Competitor[]>;
  getCompetitor(id: string, userId: string): Promise<Competitor | undefined>;
  createCompetitor(userId: string, competitor: InsertCompetitor): Promise<Competitor>;
  updateCompetitor(id: string, userId: string, competitor: Partial<InsertCompetitor>): Promise<Competitor>;
  deleteCompetitor(id: string, userId: string): Promise<void>;
  
  // Insight operations
  getInsights(userId: string): Promise<Insight[]>;
  createInsight(userId: string, insight: InsertInsight): Promise<Insight>;
  updateInsightStatus(id: string, userId: string, status: "active" | "completed" | "dismissed"): Promise<Insight>;
  deleteInsight(id: string, userId: string): Promise<void>;
  
  // Dashboard aggregations
  getDashboardMetrics(userId: string): Promise<{
    totalRevenue: number;
    totalHours: number;
    activeCustomers: number;
    averageHourlyRate: number;
    completedJobs: number;
    monthlyRevenue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUserProfile(id: string, profile: UpdateUserProfile): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        businessName: profile.businessName,
        ownerName: profile.ownerName,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        serviceArea: profile.serviceArea,
        businessType: profile.businessType,
        specializations: profile.specializations || [],
        targetHourlyRate: profile.targetHourlyRate,
        location: profile.location,
        monthlyRevenueGoal: profile.monthlyRevenueGoal,
        weeklyHoursTarget: profile.weeklyHoursTarget,
        notifications: profile.notifications || {
          competitorAlerts: true,
          insightDigest: true,
          jobReminders: false,
          marketingTips: true
        },
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Job operations
  async getJobs(userId: string): Promise<Job[]> {
    return await db
      .select()
      .from(jobs)
      .where(eq(jobs.userId, userId))
      .orderBy(desc(jobs.date));
  }

  async getJob(id: string, userId: string): Promise<Job | undefined> {
    const [job] = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.id, id), eq(jobs.userId, userId)));
    return job || undefined;
  }

  async createJob(userId: string, job: InsertJob): Promise<Job> {
    const [newJob] = await db
      .insert(jobs)
      .values({
        userId,
        customerId: job.customerId,
        customerName: job.customerName,
        jobType: job.jobType,
        description: job.description,
        revenue: job.revenue,
        hours: job.hours,
        hourlyRate: job.hourlyRate,
        status: job.status,
        date: job.date,
        location: job.location,
        materials: job.materials || [],
        notes: job.notes
      })
      .returning();
    
    // Update customer stats if linked
    if (newJob.customerId) {
      await this.updateCustomerStats(newJob.customerId, userId);
    }
    
    return newJob;
  }

  async updateJob(id: string, userId: string, job: Partial<InsertJob>): Promise<Job> {
    const [updatedJob] = await db
      .update(jobs)
      .set({
        customerId: job.customerId,
        customerName: job.customerName,
        jobType: job.jobType,
        description: job.description,
        revenue: job.revenue,
        hours: job.hours,
        hourlyRate: job.hourlyRate,
        status: job.status,
        date: job.date,
        location: job.location,
        materials: job.materials || [],
        notes: job.notes,
        updatedAt: new Date()
      })
      .where(and(eq(jobs.id, id), eq(jobs.userId, userId)))
      .returning();
    
    // Update customer stats if linked
    if (updatedJob.customerId) {
      await this.updateCustomerStats(updatedJob.customerId, userId);
    }
    
    return updatedJob;
  }

  async deleteJob(id: string, userId: string): Promise<void> {
    const [deletedJob] = await db
      .delete(jobs)
      .where(and(eq(jobs.id, id), eq(jobs.userId, userId)))
      .returning();
    
    // Update customer stats if was linked
    if (deletedJob?.customerId) {
      await this.updateCustomerStats(deletedJob.customerId, userId);
    }
  }

  // Customer operations
  async getCustomers(userId: string): Promise<Customer[]> {
    return await db
      .select()
      .from(customers)
      .where(eq(customers.userId, userId))
      .orderBy(desc(customers.updatedAt));
  }

  async getCustomer(id: string, userId: string): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.id, id), eq(customers.userId, userId)));
    return customer || undefined;
  }

  async createCustomer(userId: string, customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db
      .insert(customers)
      .values({
        userId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        totalJobs: customer.totalJobs,
        totalRevenue: customer.totalRevenue,
        averageJobValue: customer.averageJobValue,
        lastJobDate: customer.lastJobDate,
        satisfactionScore: customer.satisfactionScore,
        status: customer.status,
        preferredServices: customer.preferredServices || [],
        notes: customer.notes
      })
      .returning();
    return newCustomer;
  }

  async updateCustomer(id: string, userId: string, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        totalJobs: customer.totalJobs,
        totalRevenue: customer.totalRevenue,
        averageJobValue: customer.averageJobValue,
        lastJobDate: customer.lastJobDate,
        satisfactionScore: customer.satisfactionScore,
        status: customer.status,
        preferredServices: customer.preferredServices || [],
        notes: customer.notes,
        updatedAt: new Date()
      })
      .where(and(eq(customers.id, id), eq(customers.userId, userId)))
      .returning();
    return updatedCustomer;
  }

  async deleteCustomer(id: string, userId: string): Promise<void> {
    await db
      .delete(customers)
      .where(and(eq(customers.id, id), eq(customers.userId, userId)));
  }

  // Competitor operations
  async getCompetitors(userId: string): Promise<Competitor[]> {
    return await db
      .select()
      .from(competitors)
      .where(eq(competitors.userId, userId))
      .orderBy(desc(competitors.updatedAt));
  }

  async getCompetitor(id: string, userId: string): Promise<Competitor | undefined> {
    const [competitor] = await db
      .select()
      .from(competitors)
      .where(and(eq(competitors.id, id), eq(competitors.userId, userId)));
    return competitor || undefined;
  }

  async createCompetitor(userId: string, competitor: InsertCompetitor): Promise<Competitor> {
    const [newCompetitor] = await db
      .insert(competitors)
      .values({
        userId,
        name: competitor.name,
        location: competitor.location,
        services: competitor.services,
        averageRate: competitor.averageRate,
        phone: competitor.phone,
        website: competitor.website,
        rating: competitor.rating,
        reviewCount: competitor.reviewCount,
        strengths: competitor.strengths || [],
        weaknesses: competitor.weaknesses || [],
        notes: competitor.notes
      })
      .returning();
    return newCompetitor;
  }

  async updateCompetitor(id: string, userId: string, competitor: Partial<InsertCompetitor>): Promise<Competitor> {
    const [updatedCompetitor] = await db
      .update(competitors)
      .set({
        name: competitor.name,
        location: competitor.location,
        services: competitor.services,
        averageRate: competitor.averageRate,
        phone: competitor.phone,
        website: competitor.website,
        rating: competitor.rating,
        reviewCount: competitor.reviewCount,
        strengths: competitor.strengths || [],
        weaknesses: competitor.weaknesses || [],
        notes: competitor.notes,
        updatedAt: new Date()
      })
      .where(and(eq(competitors.id, id), eq(competitors.userId, userId)))
      .returning();
    return updatedCompetitor;
  }

  async deleteCompetitor(id: string, userId: string): Promise<void> {
    await db
      .delete(competitors)
      .where(and(eq(competitors.id, id), eq(competitors.userId, userId)));
  }

  // Insight operations
  async getInsights(userId: string): Promise<Insight[]> {
    return await db
      .select()
      .from(insights)
      .where(eq(insights.userId, userId))
      .orderBy(desc(insights.createdAt));
  }

  async createInsight(userId: string, insight: InsertInsight): Promise<Insight> {
    const [newInsight] = await db
      .insert(insights)
      .values({
        userId,
        type: insight.type,
        priority: insight.priority,
        title: insight.title,
        description: insight.description,
        impact: insight.impact,
        action: insight.action,
        status: insight.status,
        category: insight.category,
        aiGenerated: insight.aiGenerated,
        data: insight.data
      })
      .returning();
    return newInsight;
  }

  async updateInsightStatus(id: string, userId: string, status: "active" | "completed" | "dismissed"): Promise<Insight> {
    const [updatedInsight] = await db
      .update(insights)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(insights.id, id), eq(insights.userId, userId)))
      .returning();
    return updatedInsight;
  }

  async deleteInsight(id: string, userId: string): Promise<void> {
    await db
      .delete(insights)
      .where(and(eq(insights.id, id), eq(insights.userId, userId)));
  }

  // Dashboard metrics aggregation
  async getDashboardMetrics(userId: string): Promise<{
    totalRevenue: number;
    totalHours: number;
    activeCustomers: number;
    averageHourlyRate: number;
    completedJobs: number;
    monthlyRevenue: number;
  }> {
    // Get job aggregations
    const [jobStats] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${jobs.revenue} AS DECIMAL)), 0)`,
        totalHours: sql<number>`COALESCE(SUM(CAST(${jobs.hours} AS DECIMAL)), 0)`,
        completedJobs: sql<number>`COUNT(CASE WHEN ${jobs.status} = 'Completed' THEN 1 END)`,
        avgRate: sql<number>`COALESCE(AVG(CAST(${jobs.hourlyRate} AS DECIMAL)), 0)`,
      })
      .from(jobs)
      .where(eq(jobs.userId, userId));
    
    // Get current month revenue
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const [monthlyStats] = await db
      .select({
        monthlyRevenue: sql<number>`COALESCE(SUM(CAST(${jobs.revenue} AS DECIMAL)), 0)`,
      })
      .from(jobs)
      .where(and(
        eq(jobs.userId, userId),
        sql`${jobs.date} >= ${currentMonth.toISOString()}`
      ));
    
    // Get active customers count
    const [customerStats] = await db
      .select({
        activeCustomers: sql<number>`COUNT(*)`,
      })
      .from(customers)
      .where(and(
        eq(customers.userId, userId),
        eq(customers.status, "Active")
      ));
    
    return {
      totalRevenue: Number(jobStats?.totalRevenue || 0),
      totalHours: Number(jobStats?.totalHours || 0),
      activeCustomers: Number(customerStats?.activeCustomers || 0),
      averageHourlyRate: Number(jobStats?.avgRate || 0),
      completedJobs: Number(jobStats?.completedJobs || 0),
      monthlyRevenue: Number(monthlyStats?.monthlyRevenue || 0),
    };
  }

  // Helper method to update customer statistics
  private async updateCustomerStats(customerId: string, userId: string): Promise<void> {
    const [stats] = await db
      .select({
        totalJobs: sql<number>`COUNT(*)`,
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${jobs.revenue} AS DECIMAL)), 0)`,
        lastJobDate: sql<Date>`MAX(${jobs.date})`,
      })
      .from(jobs)
      .where(and(
        eq(jobs.customerId, customerId),
        eq(jobs.userId, userId)
      ));
    
    if (stats) {
      const averageJobValue = stats.totalJobs > 0 ? stats.totalRevenue / stats.totalJobs : 0;
      
      await db
        .update(customers)
        .set({
          totalJobs: stats.totalJobs,
          totalRevenue: stats.totalRevenue.toString(),
          averageJobValue: averageJobValue.toString(),
          lastJobDate: stats.lastJobDate,
          updatedAt: new Date(),
        })
        .where(and(
          eq(customers.id, customerId),
          eq(customers.userId, userId)
        ));
    }
  }
}

export const storage = new DatabaseStorage();

// Legacy MemStorage for reference - can be removed once database is working
export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      businessName: null,
      ownerName: null,
      email: null,
      phone: null,
      address: null,
      serviceArea: null,
      businessType: null,
      specializations: [],
      targetHourlyRate: null,
      location: null,
      monthlyRevenueGoal: null,
      weeklyHoursTarget: null,
      notifications: {
        competitorAlerts: true,
        insightDigest: true,
        jobReminders: false,
        marketingTips: true
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  // Stub implementations for compatibility
  async updateUserProfile(): Promise<User> { throw new Error("Not implemented in MemStorage"); }
  async getJobs(): Promise<Job[]> { return []; }
  async getJob(): Promise<Job | undefined> { return undefined; }
  async createJob(): Promise<Job> { throw new Error("Not implemented in MemStorage"); }
  async updateJob(): Promise<Job> { throw new Error("Not implemented in MemStorage"); }
  async deleteJob(): Promise<void> { return; }
  async getCustomers(): Promise<Customer[]> { return []; }
  async getCustomer(): Promise<Customer | undefined> { return undefined; }
  async createCustomer(): Promise<Customer> { throw new Error("Not implemented in MemStorage"); }
  async updateCustomer(): Promise<Customer> { throw new Error("Not implemented in MemStorage"); }
  async deleteCustomer(): Promise<void> { return; }
  async getCompetitors(): Promise<Competitor[]> { return []; }
  async getCompetitor(): Promise<Competitor | undefined> { return undefined; }
  async createCompetitor(): Promise<Competitor> { throw new Error("Not implemented in MemStorage"); }
  async updateCompetitor(): Promise<Competitor> { throw new Error("Not implemented in MemStorage"); }
  async deleteCompetitor(): Promise<void> { return; }
  async getInsights(): Promise<Insight[]> { return []; }
  async createInsight(): Promise<Insight> { throw new Error("Not implemented in MemStorage"); }
  async updateInsightStatus(): Promise<Insight> { throw new Error("Not implemented in MemStorage"); }
  async deleteInsight(): Promise<void> { return; }
  async getDashboardMetrics(): Promise<any> { 
    return {
      totalRevenue: 0,
      totalHours: 0,
      activeCustomers: 0,
      averageHourlyRate: 0,
      completedJobs: 0,
      monthlyRevenue: 0,
    };
  }
}
