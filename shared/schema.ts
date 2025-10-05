import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  businessName: text("business_name"),
  ownerName: text("owner_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  serviceArea: text("service_area"),
  serviceAreaRadius: integer("service_area_radius"),
  businessType: text("business_type"),
  specializations: json("specializations").$type<string[]>().default([]),
  targetHourlyRate: decimal("target_hourly_rate", { precision: 10, scale: 2 }),
  location: text("location"),
  teamSize: integer("team_size").default(1),
  yearsInBusiness: integer("years_in_business"),
  subscriptionTier: text("subscription_tier").default("free"),
  onboardingStatus: text("onboarding_status").default("incomplete"),
  monthlyRevenueGoal: decimal("monthly_revenue_goal", { precision: 10, scale: 2 }),
  weeklyHoursTarget: integer("weekly_hours_target"),
  notifications: json("notifications").$type<{
    competitorAlerts: boolean;
    insightDigest: boolean;
    jobReminders: boolean;
    marketingTips: boolean;
  }>().default({
    competitorAlerts: true,
    insightDigest: true,
    jobReminders: false,
    marketingTips: true
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Jobs table
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  customerId: varchar("customer_id").references(() => customers.id, { onDelete: "set null" }),
  customerName: text("customer_name").notNull(),
  jobType: text("job_type").notNull(),
  description: text("description"),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).notNull(),
  expenses: decimal("expenses", { precision: 10, scale: 2 }).default("0"),
  hours: decimal("hours", { precision: 5, scale: 2 }).notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  profitMargin: decimal("profit_margin", { precision: 5, scale: 2 }),
  status: text("status").notNull().default("Quoted"), // Quoted, Booked, In Progress, Completed, Cancelled
  projectDuration: text("project_duration"),
  date: timestamp("date").notNull(),
  startDate: timestamp("start_date"),
  estimatedCompletionDate: timestamp("estimated_completion_date"),
  actualCompletionDate: timestamp("actual_completion_date"),
  location: text("location"),
  satisfactionRating: integer("satisfaction_rating"),
  materials: json("materials").$type<{ name: string; cost: number; quantity: number }[]>().default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customers table
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  totalJobs: integer("total_jobs").default(0),
  totalRevenue: decimal("total_revenue", { precision: 10, scale: 2 }).default("0"),
  averageJobValue: decimal("average_job_value", { precision: 10, scale: 2 }).default("0"),
  lifetimeValue: decimal("lifetime_value", { precision: 10, scale: 2 }).default("0"),
  firstJobDate: timestamp("first_job_date"),
  lastJobDate: timestamp("last_job_date"),
  satisfactionScore: integer("satisfaction_score").default(85),
  contactPreference: text("contact_preference").default("email"),
  status: text("status").notNull().default("New"), // New, Active, Inactive
  preferredServices: json("preferred_services").$type<string[]>().default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Competitors table
export const competitors = pgTable("competitors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  location: text("location"),
  services: json("services").$type<string[]>().default([]),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  averageRate: decimal("average_rate", { precision: 10, scale: 2 }),
  emergencyCalloutFee: decimal("emergency_callout_fee", { precision: 10, scale: 2 }),
  calloutFee: decimal("callout_fee", { precision: 10, scale: 2 }),
  marketPositioning: text("market_positioning"),
  phone: text("phone"),
  website: text("website"),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  reviewCount: integer("review_count"),
  isActive: boolean("is_active").default(true),
  strengths: json("strengths").$type<string[]>().default([]),
  weaknesses: json("weaknesses").$type<string[]>().default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Insights table
export const insights = pgTable("insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // pricing, efficiency, customer, market, competitor
  priority: text("priority").notNull(), // high, medium, low
  title: text("title").notNull(),
  description: text("description").notNull(),
  recommendation: text("recommendation"),
  impact: text("impact"),
  impactScore: integer("impact_score"),
  urgencyLevel: text("urgency_level"),
  action: text("action"),
  status: text("status").notNull().default("active"), // active, completed, dismissed
  category: text("category"),
  viewed: boolean("viewed").default(false),
  actionTaken: boolean("action_taken").default(false),
  aiGenerated: boolean("ai_generated").default(false),
  data: json("data").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  jobs: many(jobs),
  customers: many(customers),
  competitors: many(competitors),
  insights: many(insights),
}));

export const jobsRelations = relations(jobs, ({ one }) => ({
  user: one(users, {
    fields: [jobs.userId],
    references: [users.id],
  }),
  customer: one(customers, {
    fields: [jobs.customerId],
    references: [customers.id],
  }),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  user: one(users, {
    fields: [customers.userId],
    references: [users.id],
  }),
  jobs: many(jobs),
}));

export const competitorsRelations = relations(competitors, ({ one }) => ({
  user: one(users, {
    fields: [competitors.userId],
    references: [users.id],
  }),
}));

export const insightsRelations = relations(insights, ({ one }) => ({
  user: one(users, {
    fields: [insights.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const updateUserProfileSchema = createInsertSchema(users).omit({
  id: true,
  username: true,
  password: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Transform date string from frontend to Date object for database
  date: z.union([
    z.date(),
    z.string().datetime().transform((val) => new Date(val)),
    z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/).transform((val) => new Date(val))
  ])
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompetitorSchema = createInsertSchema(competitors).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInsightSchema = createInsertSchema(insights).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Competitor = typeof competitors.$inferSelect;
export type InsertCompetitor = z.infer<typeof insertCompetitorSchema>;
export type Insight = typeof insights.$inferSelect;
export type InsertInsight = z.infer<typeof insertInsightSchema>;
