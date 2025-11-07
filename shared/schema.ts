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
  postcode: text("postcode"),
  serviceArea: text("service_area"),
  serviceAreaRadius: integer("service_area_radius"),
  businessType: text("business_type"),
  businessTypeOther: text("business_type_other"),
  specializations: json("specializations").$type<string[]>().default([]),
  targetHourlyRate: decimal("target_hourly_rate", { precision: 10, scale: 2 }),
  location: text("location"),
  teamSize: integer("team_size").default(1),
  yearsInBusiness: integer("years_in_business"),
  subscriptionTier: text("subscription_tier").default("trial"),
  onboardingStatus: text("onboarding_status").default("incomplete"),
  onboardingStep: integer("onboarding_step").default(0), // 0=not started, 1=business, 2=first job, 3=competitors, 4=complete
  preferredCurrency: text("preferred_currency").default("GBP"), // GBP, EUR, USD
  monthlyRevenueGoal: decimal("monthly_revenue_goal", { precision: 10, scale: 2 }),
  weeklyHoursTarget: integer("weekly_hours_target"),
  notifications: json("notifications").$type<{
    competitorAlerts: boolean;
    insightDigest: boolean;
    jobReminders: boolean;
    marketingTips: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
  }>().default({
    competitorAlerts: true,
    insightDigest: true,
    jobReminders: false,
    marketingTips: true,
    emailNotifications: true,
    smsNotifications: false
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
  satisfactionEmoji: text("satisfaction_emoji"), // '😞', '😐', '😊'
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
  description: text("description"), // Optional - not displayed in current UI
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

// AI Requests table - track all AI API calls for usage monitoring
export const aiRequests = pgTable("ai_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Entitlement tracking
  entitlementTier: text("entitlement_tier").notNull(), // free, basic, professional, premium, enterprise
  
  // Request details
  requestType: text("request_type").notNull(), // competitor_analysis, pricing_optimization, insight_generation, job_parsing
  endpoint: text("endpoint"), // API endpoint called
  
  // AI model information
  model: text("model").notNull(), // gpt-4, gpt-3.5-turbo, etc.
  provider: text("provider").notNull().default("openai"), // openai, anthropic, etc.
  
  // Token usage
  tokensInput: integer("tokens_input").default(0),
  tokensOutput: integer("tokens_output").default(0),
  tokensTotal: integer("tokens_total").default(0),
  
  // Cost tracking
  costEstimateGbp: decimal("cost_estimate_gbp", { precision: 10, scale: 6 }), // in £
  
  // Performance metrics
  responseTimeMs: integer("response_time_ms"), // milliseconds
  
  // Success/failure tracking
  success: boolean("success").notNull().default(true),
  errorMessage: text("error_message"),
  errorCode: text("error_code"),
  
  // Request/response metadata
  promptLength: integer("prompt_length"),
  responseLength: integer("response_length"),
  temperature: decimal("temperature", { precision: 3, scale: 2 }),
  maxTokens: integer("max_tokens"),
  
  // Context
  relatedJobId: varchar("related_job_id").references(() => jobs.id, { onDelete: "set null" }),
  relatedCompetitorId: varchar("related_competitor_id").references(() => competitors.id, { onDelete: "set null" }),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// User Subscriptions table - comprehensive subscription management
export const userSubscriptions = pgTable("user_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  
  // Stripe integration
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  
  // Subscription tier & status
  subscriptionTier: text("subscription_tier").notNull().default("free"), // free, basic, professional, premium, enterprise
  subscriptionStatus: text("subscription_status").notNull().default("active"), // active, trialing, past_due, canceled, incomplete, paused
  
  // Pricing
  monthlyPriceGbp: decimal("monthly_price_gbp", { precision: 10, scale: 2 }).default("0"),
  annualPriceGbp: decimal("annual_price_gbp", { precision: 10, scale: 2 }),
  billingCycle: text("billing_cycle").default("monthly"), // monthly, annual
  currency: text("currency").default("GBP"),
  
  // Trial management
  trialActive: boolean("trial_active").default(false),
  trialStartDate: timestamp("trial_start_date"),
  trialEndDate: timestamp("trial_end_date"),
  trialConvertedToPaid: boolean("trial_converted_to_paid").default(false),
  trialConversionDate: timestamp("trial_conversion_date"),
  
  // Discounts
  activeDiscountCode: text("active_discount_code"),
  discountPercentage: integer("discount_percentage"),
  discountAmountGbp: decimal("discount_amount_gbp", { precision: 10, scale: 2 }),
  discountValidUntil: timestamp("discount_valid_until"),
  lifetimeDiscount: boolean("lifetime_discount").default(false),
  
  // Billing dates
  subscriptionStartDate: timestamp("subscription_start_date").defaultNow(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  nextBillingDate: timestamp("next_billing_date"),
  lastPaymentDate: timestamp("last_payment_date"),
  lastPaymentAmountGbp: decimal("last_payment_amount_gbp", { precision: 10, scale: 2 }),
  
  // Cancellation
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  canceledAt: timestamp("canceled_at"),
  cancellationReason: text("cancellation_reason"),
  
  // Feature entitlements
  maxJobsPerMonth: integer("max_jobs_per_month"), // NULL = unlimited
  maxCompetitors: integer("max_competitors").default(3),
  aiParsingCreditsMonthly: integer("ai_parsing_credits_monthly").default(10),
  
  // Feature flags
  featureAdvancedAnalytics: boolean("feature_advanced_analytics").default(false),
  featureCompetitorAlerts: boolean("feature_competitor_alerts").default(false),
  featureExportReports: boolean("feature_export_reports").default(false),
  featureApiAccess: boolean("feature_api_access").default(false),
  featureWhatsappIntegration: boolean("feature_whatsapp_integration").default(false),
  featureWhiteLabel: boolean("feature_white_label").default(false),
  featureMultiUser: boolean("feature_multi_user").default(false),
  
  // Usage tracking (current billing period)
  usageJobsCreatedThisMonth: integer("usage_jobs_created_this_month").default(0),
  usageAiParsingThisMonth: integer("usage_ai_parsing_this_month").default(0),
  usageReportsExportedThisMonth: integer("usage_reports_exported_this_month").default(0),
  usagePeriodStart: timestamp("usage_period_start"),
  
  // Revenue metrics
  totalRevenueAllTime: decimal("total_revenue_all_time", { precision: 10, scale: 2 }).default("0"),
  monthsAsCustomer: integer("months_as_customer").default(0),
  
  // Acquisition tracking
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  referralCode: text("referral_code"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscription Events table - audit trail for MRR/churn analysis
export const subscriptionEvents = pgTable("subscription_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subscriptionId: varchar("subscription_id").notNull().references(() => userSubscriptions.id, { onDelete: "cascade" }),
  
  // Event type
  eventType: text("event_type").notNull(), // subscription_created, trial_started, trial_converted, trial_expired, upgraded, downgraded, canceled, reactivated, payment_succeeded, payment_failed, discount_applied, discount_removed, paused, resumed
  
  // State changes
  previousTier: text("previous_tier"),
  newTier: text("new_tier"),
  previousMonthlyPrice: decimal("previous_monthly_price", { precision: 10, scale: 2 }),
  newMonthlyPrice: decimal("new_monthly_price", { precision: 10, scale: 2 }),
  
  // MRR impact
  mrrChange: decimal("mrr_change", { precision: 10, scale: 2 }), // Monthly Recurring Revenue change
  isExpansion: boolean("is_expansion").default(false), // upgrade
  isContraction: boolean("is_contraction").default(false), // downgrade or churn
  
  // Context
  stripeEventId: text("stripe_event_id"),
  triggeredBy: text("triggered_by"), // user, admin, stripe, system
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  jobs: many(jobs),
  customers: many(customers),
  competitors: many(competitors),
  insights: many(insights),
  aiRequests: many(aiRequests),
  subscription: one(userSubscriptions),
  subscriptionEvents: many(subscriptionEvents),
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

export const aiRequestsRelations = relations(aiRequests, ({ one }) => ({
  user: one(users, {
    fields: [aiRequests.userId],
    references: [users.id],
  }),
  relatedJob: one(jobs, {
    fields: [aiRequests.relatedJobId],
    references: [jobs.id],
  }),
  relatedCompetitor: one(competitors, {
    fields: [aiRequests.relatedCompetitorId],
    references: [competitors.id],
  }),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id],
  }),
  events: many(subscriptionEvents),
}));

export const subscriptionEventsRelations = relations(subscriptionEvents, ({ one }) => ({
  user: one(users, {
    fields: [subscriptionEvents.userId],
    references: [users.id],
  }),
  subscription: one(userSubscriptions, {
    fields: [subscriptionEvents.subscriptionId],
    references: [userSubscriptions.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  businessName: true,
  ownerName: true,
  businessType: true,
  businessTypeOther: true,
  postcode: true,
  phone: true,
  location: true,
  serviceArea: true,
  subscriptionTier: true,
  onboardingStatus: true,
  teamSize: true,
  specializations: true,
  notifications: true,
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

export const insertAiRequestSchema = createInsertSchema(aiRequests).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionEventSchema = createInsertSchema(subscriptionEvents).omit({
  id: true,
  createdAt: true,
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
export type AiRequest = typeof aiRequests.$inferSelect;
export type InsertAiRequest = z.infer<typeof insertAiRequestSchema>;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
export type SubscriptionEvent = typeof subscriptionEvents.$inferSelect;
export type InsertSubscriptionEvent = z.infer<typeof insertSubscriptionEventSchema>;
