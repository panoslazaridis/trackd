import { 
  users, customers, jobs, competitors, insights, userSubscriptions,
  type User, type InsertUser, type UpdateUserProfile,
  type Job, type InsertJob,
  type Customer, type InsertCustomer,
  type Competitor, type InsertCompetitor,
  type Insight, type InsertInsight,
  type UserSubscription
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
  createUserFromSupabase(supabaseId: string, data: { email: string; businessName: string | null; ownerName: string | null }): Promise<User>;
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
  
  // Analytics functions
  getDashboardMetrics(userId: string): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    totalProfit: number;
    totalHours: number;
    averageHourlyRate: number;
    profitMargin: number;
    totalJobs: number;
    completedJobs: number;
  }>;
  
  getEfficiencyMatrix(userId: string): Promise<Array<{
    id: string;
    customerName: string;
    jobType: string;
    hours: number;
    revenue: number;
    hourlyRate: number;
  }>>;
  
  getCustomerValueRanking(userId: string): Promise<Array<{
    id: string;
    customerName: string;
    totalJobs: number;
    lifetimeRevenue: number;
    averageJobValue: number;
    lastJobDate: Date | null;
    valueQuartile: number;
  }>>;
  
  getSeasonalTrends(userId: string): Promise<Array<{
    month: string;
    totalRevenue: number;
    totalJobs: number;
    averageHourlyRate: number;
  }>>;
  
  getCompetitorComparison(userId: string): Promise<Array<{
    id: string;
    competitorName: string;
    theirHourlyRate: number | null;
    theirEmergencyFee: number | null;
    userAverageRate: number;
    priceDifference: number;
  }>>;
  
  // Subscription operations
  getUserSubscription(userId: string): Promise<UserSubscription | undefined>;
  updateUserSubscription(userId: string, data: Partial<Omit<UserSubscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<UserSubscription>;
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

  async createUserFromSupabase(
    supabaseId: string,
    data: { email: string; businessName: string | null; ownerName: string | null }
  ): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        id: supabaseId,
        username: data.email,
        password: '',
        email: data.email,
        businessName: data.businessName,
        ownerName: data.ownerName,
        subscriptionTier: 'free',
        onboardingStatus: 'incomplete',
        teamSize: 1,
        specializations: [],
        notifications: {
          competitorAlerts: true,
          insightDigest: true,
          jobReminders: false,
          marketingTips: true
        }
      })
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
        serviceAreaRadius: profile.serviceAreaRadius,
        businessType: profile.businessType,
        specializations: profile.specializations as any,
        targetHourlyRate: profile.targetHourlyRate,
        location: profile.location,
        teamSize: profile.teamSize,
        yearsInBusiness: profile.yearsInBusiness,
        subscriptionTier: profile.subscriptionTier,
        onboardingStatus: profile.onboardingStatus,
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
        expenses: job.expenses,
        hours: job.hours,
        hourlyRate: job.hourlyRate,
        profitMargin: job.profitMargin,
        status: job.status,
        projectDuration: job.projectDuration,
        date: job.date,
        startDate: job.startDate,
        estimatedCompletionDate: job.estimatedCompletionDate,
        actualCompletionDate: job.actualCompletionDate,
        location: job.location,
        satisfactionRating: job.satisfactionRating,
        materials: job.materials as any,
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
        expenses: job.expenses,
        hours: job.hours,
        hourlyRate: job.hourlyRate,
        profitMargin: job.profitMargin,
        status: job.status,
        projectDuration: job.projectDuration,
        date: job.date,
        startDate: job.startDate,
        estimatedCompletionDate: job.estimatedCompletionDate,
        actualCompletionDate: job.actualCompletionDate,
        location: job.location,
        satisfactionRating: job.satisfactionRating,
        materials: job.materials as any,
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
        lifetimeValue: customer.lifetimeValue,
        firstJobDate: customer.firstJobDate,
        lastJobDate: customer.lastJobDate,
        satisfactionScore: customer.satisfactionScore,
        contactPreference: customer.contactPreference,
        status: customer.status,
        preferredServices: customer.preferredServices as any,
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
        lifetimeValue: customer.lifetimeValue,
        firstJobDate: customer.firstJobDate,
        lastJobDate: customer.lastJobDate,
        satisfactionScore: customer.satisfactionScore,
        contactPreference: customer.contactPreference,
        status: customer.status,
        preferredServices: customer.preferredServices as any,
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
        services: competitor.services as any,
        hourlyRate: competitor.hourlyRate,
        averageRate: competitor.averageRate,
        emergencyCalloutFee: competitor.emergencyCalloutFee,
        calloutFee: competitor.calloutFee,
        marketPositioning: competitor.marketPositioning,
        phone: competitor.phone,
        website: competitor.website,
        rating: competitor.rating,
        reviewCount: competitor.reviewCount,
        isActive: competitor.isActive,
        strengths: competitor.strengths as any,
        weaknesses: competitor.weaknesses as any,
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
        services: competitor.services as any,
        hourlyRate: competitor.hourlyRate,
        averageRate: competitor.averageRate,
        emergencyCalloutFee: competitor.emergencyCalloutFee,
        calloutFee: competitor.calloutFee,
        marketPositioning: competitor.marketPositioning,
        phone: competitor.phone,
        website: competitor.website,
        rating: competitor.rating,
        reviewCount: competitor.reviewCount,
        isActive: competitor.isActive,
        strengths: competitor.strengths as any,
        weaknesses: competitor.weaknesses as any,
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

  // Analytics Function 1: Dashboard Metrics
  async getDashboardMetrics(userId: string): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    totalProfit: number;
    totalHours: number;
    averageHourlyRate: number;
    profitMargin: number;
    totalJobs: number;
    completedJobs: number;
  }> {
    const [stats] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${jobs.revenue} AS DECIMAL)), 0)`,
        totalExpenses: sql<number>`COALESCE(SUM(CAST(${jobs.expenses} AS DECIMAL)), 0)`,
        totalHours: sql<number>`COALESCE(SUM(CAST(${jobs.hours} AS DECIMAL)), 0)`,
        totalJobs: sql<number>`COUNT(*)`,
        completedJobs: sql<number>`COUNT(CASE WHEN ${jobs.status} = 'Completed' THEN 1 END)`,
      })
      .from(jobs)
      .where(eq(jobs.userId, userId));
    
    const totalRevenue = Number(stats?.totalRevenue || 0);
    const totalExpenses = Number(stats?.totalExpenses || 0);
    const totalProfit = totalRevenue - totalExpenses;
    const totalHours = Number(stats?.totalHours || 0);
    const averageHourlyRate = totalHours > 0 ? totalRevenue / totalHours : 0;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    return {
      totalRevenue,
      totalExpenses,
      totalProfit,
      totalHours,
      averageHourlyRate,
      profitMargin,
      totalJobs: Number(stats?.totalJobs || 0),
      completedJobs: Number(stats?.completedJobs || 0),
    };
  }

  // Analytics Function 2: Efficiency Matrix
  async getEfficiencyMatrix(userId: string): Promise<Array<{
    id: string;
    customerName: string;
    jobType: string;
    hours: number;
    revenue: number;
    hourlyRate: number;
  }>> {
    const result = await db
      .select({
        id: jobs.id,
        customerName: jobs.customerName,
        jobType: jobs.jobType,
        hours: jobs.hours,
        revenue: jobs.revenue,
        hourlyRate: jobs.hourlyRate,
      })
      .from(jobs)
      .where(and(
        eq(jobs.userId, userId),
        eq(jobs.status, "Completed")
      ))
      .orderBy(desc(jobs.date));
    
    return result.map(job => ({
      id: job.id,
      customerName: job.customerName,
      jobType: job.jobType,
      hours: Number(job.hours),
      revenue: Number(job.revenue),
      hourlyRate: Number(job.hourlyRate),
    }));
  }

  // Analytics Function 3: Customer Value Ranking
  async getCustomerValueRanking(userId: string): Promise<Array<{
    id: string;
    customerName: string;
    totalJobs: number;
    lifetimeRevenue: number;
    averageJobValue: number;
    lastJobDate: Date | null;
    valueQuartile: number;
  }>> {
    const customerStats = await db
      .select({
        customerId: jobs.customerId,
        customerName: jobs.customerName,
        totalJobs: sql<number>`COUNT(*)`,
        lifetimeRevenue: sql<number>`COALESCE(SUM(CAST(${jobs.revenue} AS DECIMAL)), 0)`,
        lastJobDate: sql<Date>`MAX(${jobs.date})`,
      })
      .from(jobs)
      .where(eq(jobs.userId, userId))
      .groupBy(jobs.customerId, jobs.customerName)
      .orderBy(desc(sql`COALESCE(SUM(CAST(${jobs.revenue} AS DECIMAL)), 0)`));
    
    const totalCustomers = customerStats.length;
    
    return customerStats.map((customer, index) => {
      const lifetimeRevenue = Number(customer.lifetimeRevenue);
      const totalJobs = Number(customer.totalJobs);
      const averageJobValue = totalJobs > 0 ? lifetimeRevenue / totalJobs : 0;
      const quartilePosition = (index + 1) / totalCustomers;
      let valueQuartile = 4;
      if (quartilePosition <= 0.25) valueQuartile = 1;
      else if (quartilePosition <= 0.50) valueQuartile = 2;
      else if (quartilePosition <= 0.75) valueQuartile = 3;
      
      return {
        id: customer.customerId || '',
        customerName: customer.customerName,
        totalJobs,
        lifetimeRevenue,
        averageJobValue,
        lastJobDate: customer.lastJobDate,
        valueQuartile,
      };
    });
  }

  // Analytics Function 4: Seasonal Trends
  async getSeasonalTrends(userId: string): Promise<Array<{
    month: string;
    totalRevenue: number;
    totalJobs: number;
    averageHourlyRate: number;
  }>> {
    const trends = await db
      .select({
        month: sql<string>`TO_CHAR(${jobs.date}, 'YYYY-MM')`,
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${jobs.revenue} AS DECIMAL)), 0)`,
        totalJobs: sql<number>`COUNT(*)`,
        totalHours: sql<number>`COALESCE(SUM(CAST(${jobs.hours} AS DECIMAL)), 0)`,
      })
      .from(jobs)
      .where(and(
        eq(jobs.userId, userId),
        sql`${jobs.date} >= NOW() - INTERVAL '12 months'`
      ))
      .groupBy(sql`TO_CHAR(${jobs.date}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${jobs.date}, 'YYYY-MM')`);
    
    return trends.map(trend => {
      const totalRevenue = Number(trend.totalRevenue);
      const totalHours = Number(trend.totalHours);
      const averageHourlyRate = totalHours > 0 ? totalRevenue / totalHours : 0;
      
      return {
        month: trend.month,
        totalRevenue,
        totalJobs: Number(trend.totalJobs),
        averageHourlyRate,
      };
    });
  }

  // Analytics Function 5: Competitor Price Comparison
  async getCompetitorComparison(userId: string): Promise<Array<{
    id: string;
    competitorName: string;
    theirHourlyRate: number | null;
    theirEmergencyFee: number | null;
    userAverageRate: number;
    priceDifference: number;
  }>> {
    // Get user's average hourly rate
    const [userStats] = await db
      .select({
        avgRate: sql<number>`COALESCE(AVG(CAST(${jobs.hourlyRate} AS DECIMAL)), 0)`,
      })
      .from(jobs)
      .where(and(
        eq(jobs.userId, userId),
        eq(jobs.status, "Completed")
      ));
    
    const userAverageRate = Number(userStats?.avgRate || 0);
    
    // Get all active competitors
    const competitorList = await db
      .select({
        id: competitors.id,
        name: competitors.name,
        hourlyRate: competitors.hourlyRate,
        emergencyCalloutFee: competitors.emergencyCalloutFee,
      })
      .from(competitors)
      .where(and(
        eq(competitors.userId, userId),
        eq(competitors.isActive, true)
      ));
    
    return competitorList.map(competitor => {
      const theirRate = competitor.hourlyRate ? Number(competitor.hourlyRate) : null;
      const priceDifference = theirRate ? userAverageRate - theirRate : 0;
      
      return {
        id: competitor.id,
        competitorName: competitor.name,
        theirHourlyRate: theirRate,
        theirEmergencyFee: competitor.emergencyCalloutFee ? Number(competitor.emergencyCalloutFee) : null,
        userAverageRate,
        priceDifference,
      };
    });
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

  // Subscription operations
  async getUserSubscription(userId: string): Promise<UserSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId));
    return subscription || undefined;
  }

  async updateUserSubscription(
    userId: string, 
    data: Partial<Omit<UserSubscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<UserSubscription> {
    // Check if subscription exists
    const existing = await this.getUserSubscription(userId);
    
    if (existing) {
      // Update existing subscription
      const [updated] = await db
        .update(userSubscriptions)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(userSubscriptions.userId, userId))
        .returning();
      return updated;
    } else {
      // Create new subscription
      const [created] = await db
        .insert(userSubscriptions)
        .values({ userId, ...data } as any)
        .returning();
      return created;
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
      serviceAreaRadius: null,
      businessType: null,
      specializations: [],
      targetHourlyRate: null,
      location: null,
      teamSize: 1,
      yearsInBusiness: null,
      subscriptionTier: "free",
      onboardingStatus: "incomplete",
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

  async createUserFromSupabase(
    supabaseId: string,
    data: { email: string; businessName: string | null; ownerName: string | null }
  ): Promise<User> {
    const user: User = {
      id: supabaseId,
      username: data.email,
      password: '',
      businessName: data.businessName,
      ownerName: data.ownerName,
      email: data.email,
      phone: null,
      address: null,
      serviceArea: null,
      serviceAreaRadius: null,
      businessType: null,
      specializations: [],
      targetHourlyRate: null,
      location: null,
      teamSize: 1,
      yearsInBusiness: null,
      subscriptionTier: "free",
      onboardingStatus: "incomplete",
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
    this.users.set(supabaseId, user);
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
      totalExpenses: 0,
      totalProfit: 0,
      totalHours: 0,
      averageHourlyRate: 0,
      profitMargin: 0,
      totalJobs: 0,
      completedJobs: 0,
    };
  }
  async getEfficiencyMatrix(): Promise<any[]> { return []; }
  async getCustomerValueRanking(): Promise<any[]> { return []; }
  async getSeasonalTrends(): Promise<any[]> { return []; }
  async getCompetitorComparison(): Promise<any[]> { return []; }
  async getUserSubscription(): Promise<UserSubscription | undefined> { return undefined; }
  async updateUserSubscription(): Promise<UserSubscription> { throw new Error("Not implemented in MemStorage"); }
}
