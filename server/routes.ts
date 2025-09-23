import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import { generateCompetitorAnalysis, generatePricingAnalysis } from "./ai";
import { z } from "zod";

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

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
