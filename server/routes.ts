import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import { generateCompetitorAnalysis, generatePricingAnalysis } from "./ai";
import { z } from "zod";
import { 
  insertJobSchema, 
  insertCustomerSchema, 
  insertCompetitorSchema, 
  insertInsightSchema,
  updateUserProfileSchema,
  type Job 
} from "@shared/schema";

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

  const httpServer = createServer(app);

  return httpServer;
}
