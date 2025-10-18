import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import { generateCompetitorAnalysis, generatePricingAnalysis } from "./ai";
import { registerStripeRoutes } from "./stripe";
import { registerConfigRoutes } from "./config";
import { z } from "zod";
import bcrypt from "bcrypt";
import { 
  insertJobSchema, 
  insertCustomerSchema, 
  insertCompetitorSchema, 
  insertInsightSchema,
  updateUserProfileSchema,
  type Job 
} from "@shared/schema";

// Schema for signup request
const signupSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  businessName: z.string().min(1),
  ownerName: z.string().min(1),
  businessType: z.string().min(1),
  businessTypeOther: z.string().optional(),
  phone: z.string().min(1),
  postcode: z.string().min(1),
  location: z.string().min(1),
  serviceArea: z.string().min(1),
});

// Schema for AI analysis requests
const competitorAnalysisSchema = z.object({
  businessType: z.string(),
  location: z.string(),
  services: z.array(z.string()),
});

const pricingAnalysisSchema = z.object({
  businessType: z.string(),
  location: z.string(),
  currentRate: z.number(),
  services: z.array(z.string()),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });

  // Signup endpoint
  app.post("/api/auth/signup", async (req, res) => {
    try {
      // Validate request body
      const signupData = signupSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(signupData.username);
      if (existingUser) {
        return res.status(400).json({ error: "An account with this email already exists. Please login instead." });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(signupData.password, 10);

      // Create user
      const user = await storage.createUser({
        username: signupData.username,
        password: hashedPassword,
        email: signupData.email,
        businessName: signupData.businessName,
        ownerName: signupData.ownerName,
        businessType: signupData.businessType,
        businessTypeOther: signupData.businessTypeOther,
        phone: signupData.phone,
        postcode: signupData.postcode,
        location: signupData.location,
        serviceArea: signupData.serviceArea,
        subscriptionTier: "trial", // Set to trial tier
        onboardingStatus: "incomplete",
        teamSize: 1,
        specializations: [],
        notifications: {
          competitorAlerts: true,
          insightDigest: true,
          jobReminders: false,
          marketingTips: true,
          emailNotifications: true,
          smsNotifications: false,
        },
      });

      // Create trial subscription (30 days)
      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 30);

      await storage.updateUserSubscription(user.id, {
        subscriptionTier: "trial",
        subscriptionStatus: "trialing",
        trialActive: true,
        trialStartDate,
        trialEndDate,
        currency: "GBP", // Default to GBP, can be changed in settings
        billingCycle: "monthly",
        monthlyPriceGbp: "0",
        maxJobsPerMonth: 50, // Trial limits
        maxCompetitors: 3,
        aiParsingCreditsMonthly: 3,
      });

      console.log(`✅ New user signed up: ${user.username} (${user.id}) - 30-day trial created`);

      res.status(201).json({
        success: true,
        message: "Account created successfully",
        userId: user.id,
      });
    } catch (error) {
      console.error("Signup error:", error);
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ 
          error: `Please check your information: ${fieldErrors}` 
        });
      }
      if (error instanceof Error) {
        return res.status(500).json({ error: `Failed to create account: ${error.message}` });
      }
      res.status(500).json({ error: "Failed to create account. Please try again." });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      // Find user by username
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      console.log(`✅ User logged in: ${user.username} (${user.id})`);

      res.json({
        success: true,
        message: "Login successful",
        userId: user.id,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // AI Analysis routes
  app.post("/api/ai/competitor-analysis", async (req, res) => {
    try {
      const data = competitorAnalysisSchema.parse(req.body);
      const analysis = await generateCompetitorAnalysis(data);
      res.json(analysis);
    } catch (error) {
      console.error("Competitor analysis error:", error);
      res.status(500).json({ 
        error: "Failed to generate competitor analysis",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/ai/pricing-analysis", async (req, res) => {
    try {
      const data = pricingAnalysisSchema.parse(req.body);
      const analysis = await generatePricingAnalysis(data);
      res.json(analysis);
    } catch (error) {
      console.error("Pricing analysis error:", error);
      res.status(500).json({ 
        error: "Failed to generate pricing analysis",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // User profile routes
  app.get("/api/user/:userId", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.put("/api/user/:userId/profile", async (req, res) => {
    try {
      const profileData = updateUserProfileSchema.parse(req.body);
      const user = await storage.updateUserProfile(req.params.userId, profileData);
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid profile data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Job routes
  app.get("/api/jobs/:userId", async (req, res) => {
    try {
      const jobs = await storage.getJobs(req.params.userId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  app.post("/api/jobs/:userId", async (req, res) => {
    try {
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(req.params.userId, jobData);
      res.json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid job data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create job" });
    }
  });

  app.put("/api/jobs/:userId/:id", async (req, res) => {
    try {
      const { userId, id } = req.params;
      const jobData = insertJobSchema.partial().parse(req.body);
      const job = await storage.updateJob(id, userId, jobData);
      res.json(job);
    } catch (error) {
      console.error("Error updating job:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid job data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update job" });
    }
  });

  app.delete("/api/jobs/:userId/:id", async (req, res) => {
    try {
      const { userId, id } = req.params;
      await storage.deleteJob(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ error: "Failed to delete job" });
    }
  });

  // Customer routes
  app.get("/api/customers/:userId", async (req, res) => {
    try {
      const customers = await storage.getCustomers(req.params.userId);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers/:userId", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(req.params.userId, customerData);
      res.json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid customer data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:userId/:id", async (req, res) => {
    try {
      const { userId, id } = req.params;
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, userId, customerData);
      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid customer data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:userId/:id", async (req, res) => {
    try {
      const { userId, id } = req.params;
      await storage.deleteCustomer(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ error: "Failed to delete customer" });
    }
  });

  // Competitor routes
  app.get("/api/competitors/:userId", async (req, res) => {
    try {
      const competitors = await storage.getCompetitors(req.params.userId);
      res.json(competitors);
    } catch (error) {
      console.error("Error fetching competitors:", error);
      res.status(500).json({ error: "Failed to fetch competitors" });
    }
  });

  app.post("/api/competitors/:userId", async (req, res) => {
    try {
      const competitorData = insertCompetitorSchema.parse(req.body);
      const competitor = await storage.createCompetitor(req.params.userId, competitorData);
      res.json(competitor);
    } catch (error) {
      console.error("Error creating competitor:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid competitor data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create competitor" });
    }
  });

  app.put("/api/competitors/:userId/:id", async (req, res) => {
    try {
      const { userId, id } = req.params;
      const competitorData = insertCompetitorSchema.partial().parse(req.body);
      const competitor = await storage.updateCompetitor(id, userId, competitorData);
      res.json(competitor);
    } catch (error) {
      console.error("Error updating competitor:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid competitor data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update competitor" });
    }
  });

  app.delete("/api/competitors/:userId/:id", async (req, res) => {
    try {
      const { userId, id } = req.params;
      await storage.deleteCompetitor(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting competitor:", error);
      res.status(500).json({ error: "Failed to delete competitor" });
    }
  });

  // Insight routes
  app.get("/api/insights/:userId", async (req, res) => {
    try {
      const insights = await storage.getInsights(req.params.userId);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      res.status(500).json({ error: "Failed to fetch insights" });
    }
  });

  // Regenerate insights with OpenAI - MUST come before generic POST route
  app.post("/api/insights/:userId/regenerate", async (req, res) => {
    console.log("🔄 Regenerate insights endpoint called for userId:", req.params.userId);
    try {
      const { userId } = req.params;
      const startTime = Date.now();

      // Fetch last 30 days of data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const jobs = await storage.getJobs(userId);
      const customers = await storage.getCustomers(userId);
      const competitors = await storage.getCompetitors(userId);

      // Filter jobs to last 30 days
      const recentJobs = jobs.filter(job => new Date(job.date) >= thirtyDaysAgo);

      // Calculate metrics
      const jobsByType: { [key: string]: { totalRevenue: number; totalHours: number; count: number } } = {};
      recentJobs.forEach(job => {
        if (!jobsByType[job.jobType]) {
          jobsByType[job.jobType] = { totalRevenue: 0, totalHours: 0, count: 0 };
        }
        jobsByType[job.jobType].totalRevenue += parseFloat(job.revenue);
        jobsByType[job.jobType].totalHours += parseFloat(job.hours);
        jobsByType[job.jobType].count += 1;
      });

      const avgRatesByType = Object.entries(jobsByType).map(([type, data]) => ({
        type,
        avgRate: data.totalHours > 0 ? data.totalRevenue / data.totalHours : 0,
        jobCount: data.count,
      }));

      const customerRevenue = customers.map(c => ({
        name: c.name,
        revenue: parseFloat(c.totalRevenue ?? "0"),
        jobs: c.totalJobs ?? 0,
      })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

      const competitorRates = competitors.map(c => ({
        name: c.name,
        hourlyRate: parseFloat(c.hourlyRate as any ?? "0"),
      }));

      // Prepare prompt for OpenAI
      const prompt = `You are a business analyst for a trades business (plumbing, electrical, HVAC, or handyman). Analyze the following data and provide 3-5 actionable business insights.

**Business Data (Last 30 Days):**

**Jobs by Type:**
${avgRatesByType.map(t => `- ${t.type}: ${t.jobCount} jobs, avg rate £${t.avgRate.toFixed(2)}/hr`).join('\n')}

**Top Customers by Revenue:**
${customerRevenue.map(c => `- ${c.name}: £${c.revenue.toFixed(2)} (${c.jobs} jobs)`).join('\n')}

**Competitor Rates:**
${competitorRates.map(c => `- ${c.name}: £${c.hourlyRate}/hr`).join('\n')}

**Total Jobs:** ${recentJobs.length}
**Total Revenue:** £${recentJobs.reduce((sum, j) => sum + parseFloat(j.revenue), 0).toFixed(2)}
**Total Hours:** ${recentJobs.reduce((sum, j) => sum + parseFloat(j.hours), 0).toFixed(1)}

Provide 3-5 insights focusing on:
1. Pricing opportunities (undercharging or overcharging)
2. Customer value analysis (which customers to prioritize)
3. Efficiency gaps (where time is wasted)
4. Competitive positioning

For each insight, return a JSON object with:
- title (string, max 60 chars)
- description (string, max 200 chars)
- action (string, specific recommendation, max 100 chars)
- impact (string, quantifiable benefit, max 80 chars)
- priority ("high", "medium", or "low")
- type ("pricing", "customer", "efficiency", or "market")
- category (string, max 40 chars)

Return ONLY a valid JSON array of insights, no additional text.`;

      // Call OpenAI
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a business analyst providing actionable insights for trades businesses. Always respond with valid JSON arrays only." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const aiResponse = await response.json();
      const content = aiResponse.choices[0].message.content;
      
      // Parse AI response
      let aiInsights;
      try {
        aiInsights = JSON.parse(content);
        
        // Validate each insight has required fields
        if (!Array.isArray(aiInsights)) {
          throw new Error("AI response is not an array");
        }
        
        aiInsights = aiInsights.filter(insight => {
          if (!insight.title || !insight.action || !insight.impact) {
            console.warn("Skipping invalid insight:", insight);
            return false;
          }
          return true;
        });

        if (aiInsights.length === 0) {
          throw new Error("No valid insights in AI response");
        }
      } catch (parseError) {
        console.error("Failed to parse AI response:", content);
        throw new Error("Invalid AI response format");
      }

      const duration = Date.now() - startTime;
      const inputTokens = aiResponse.usage?.prompt_tokens ?? 0;
      const outputTokens = aiResponse.usage?.completion_tokens ?? 0;

      // Track AI usage - TODO: Implement trackAIRequest method in storage
      // await storage.trackAIRequest({
      //   userId,
      //   model: "gpt-4",
      //   inputTokens,
      //   outputTokens,
      //   cost: ((inputTokens * 0.00003) + (outputTokens * 0.00006)).toFixed(4),
      //   duration,
      //   success: true,
      // });

      // Delete old insights
      const oldInsights = await storage.getInsights(userId);
      for (const insight of oldInsights) {
        await storage.deleteInsight(insight.id, userId);
      }

      // Save new insights
      const savedInsights = [];
      for (const aiInsight of aiInsights) {
        const insight = await storage.createInsight(userId, {
          type: aiInsight.type ?? "pricing",
          priority: aiInsight.priority ?? "medium",
          title: aiInsight.title,
          description: aiInsight.description,
          impact: aiInsight.impact,
          action: aiInsight.action,
          category: aiInsight.category ?? "Business Analysis",
          status: "active",
        });
        savedInsights.push(insight);
      }

      res.json({ insights: savedInsights, success: true });
    } catch (error) {
      console.error("❌ Error regenerating insights:", error);
      console.error("Error details:", error instanceof Error ? error.message : String(error));
      console.error("Stack:", error instanceof Error ? error.stack : "No stack trace");
      
      // Track failed AI request - TODO: Implement trackAIRequest method in storage
      // try {
      //   await storage.trackAIRequest({
      //     userId: req.params.userId,
      //     model: "gpt-4",
      //     inputTokens: 0,
      //     outputTokens: 0,
      //     cost: "0",
      //     duration: Date.now() - Date.now(),
      //     success: false,
      //   });
      // } catch (trackError) {
      //   console.error("Error tracking failed AI request:", trackError);
      // }

      res.status(500).json({ 
        error: "Failed to regenerate insights",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/insights/:userId", async (req, res) => {
    try {
      const insightData = insertInsightSchema.parse(req.body);
      const insight = await storage.createInsight(req.params.userId, insightData);
      res.json(insight);
    } catch (error) {
      console.error("Error creating insight:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid insight data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create insight" });
    }
  });

  app.patch("/api/insights/:userId/:id/status", async (req, res) => {
    try {
      const { userId, id } = req.params;
      const { status } = req.body;
      if (!["active", "completed", "dismissed"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      const insight = await storage.updateInsightStatus(id, userId, status);
      res.json(insight);
    } catch (error) {
      console.error("Error updating insight status:", error);
      res.status(500).json({ error: "Failed to update insight status" });
    }
  });

  app.patch("/api/insights/:userId/:id", async (req, res) => {
    try {
      const { userId, id } = req.params;
      
      // Validate request body with Zod
      const updateSchema = z.object({
        viewed: z.boolean()
      });
      
      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: validationResult.error.errors 
        });
      }
      
      const { viewed } = validationResult.data;
      const insight = await storage.updateInsightViewed(id, userId, viewed);
      
      // Return 404 if no insight was found/updated
      if (!insight) {
        return res.status(404).json({ error: "Insight not found" });
      }
      
      res.json(insight);
    } catch (error) {
      console.error("Error updating insight:", error);
      res.status(500).json({ error: "Failed to update insight" });
    }
  });

  app.delete("/api/insights/:userId/:id", async (req, res) => {
    try {
      const { userId, id } = req.params;
      await storage.deleteInsight(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting insight:", error);
      res.status(500).json({ error: "Failed to delete insight" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/dashboard/:userId", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics(req.params.userId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
  });

  app.get("/api/analytics/efficiency/:userId", async (req, res) => {
    try {
      const matrix = await storage.getEfficiencyMatrix(req.params.userId);
      res.json(matrix);
    } catch (error) {
      console.error("Error fetching efficiency matrix:", error);
      res.status(500).json({ error: "Failed to fetch efficiency matrix" });
    }
  });

  app.get("/api/analytics/customers/:userId", async (req, res) => {
    try {
      const ranking = await storage.getCustomerValueRanking(req.params.userId);
      res.json(ranking);
    } catch (error) {
      console.error("Error fetching customer value ranking:", error);
      res.status(500).json({ error: "Failed to fetch customer value ranking" });
    }
  });

  app.get("/api/analytics/trends/:userId", async (req, res) => {
    try {
      const trends = await storage.getSeasonalTrends(req.params.userId);
      res.json(trends);
    } catch (error) {
      console.error("Error fetching seasonal trends:", error);
      res.status(500).json({ error: "Failed to fetch seasonal trends" });
    }
  });

  app.get("/api/analytics/competitors/:userId", async (req, res) => {
    try {
      const comparison = await storage.getCompetitorComparison(req.params.userId);
      res.json(comparison);
    } catch (error) {
      console.error("Error fetching competitor comparison:", error);
      res.status(500).json({ error: "Failed to fetch competitor comparison" });
    }
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Register Stripe routes
  await registerStripeRoutes(app);
  
  // Register config routes
  await registerConfigRoutes(app);

  const httpServer = createServer(app);

  return httpServer;
}
