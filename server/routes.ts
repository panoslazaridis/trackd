import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import { generateCompetitorAnalysis, generatePricingAnalysis } from "./ai";
import { z } from "zod";
import { insertJobSchema, type Job } from "@shared/schema";

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

  // Job routes
  app.get("/api/jobs", async (req, res) => {
    // For now, we'll use a test user ID since authentication is not implemented
    const userId = "test-user-id";
    
    try {
      const jobs = await storage.getJobs(userId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    // For now, we'll use a test user ID since authentication is not implemented
    const userId = "test-user-id";
    
    try {
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(userId, jobData);
      res.json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid job data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create job" });
    }
  });

  app.put("/api/jobs/:id", async (req, res) => {
    // For now, we'll use a test user ID since authentication is not implemented
    const userId = "test-user-id";
    
    try {
      const jobId = req.params.id;
      const jobData = insertJobSchema.partial().parse(req.body);
      const job = await storage.updateJob(jobId, userId, jobData);
      res.json(job);
    } catch (error) {
      console.error("Error updating job:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid job data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update job" });
    }
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    // For now, we'll use a test user ID since authentication is not implemented
    const userId = "test-user-id";
    
    try {
      const jobId = req.params.id;
      await storage.deleteJob(jobId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ error: "Failed to delete job" });
    }
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
