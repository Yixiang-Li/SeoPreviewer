import type { Express } from "express";
import { createServer, type Server } from "http";
import { seoAnalysisRequestSchema } from "@shared/schema";
import { seoAnalyzer } from "./services/seoAnalyzer";

export async function registerRoutes(app: Express): Promise<Server> {
  // SEO Analysis endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      // Validate request body
      const parseResult = seoAnalysisRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: parseResult.error.errors
        });
      }

      const { url } = parseResult.data;
      console.log(`Analyzing URL: ${url}`);

      // Perform SEO analysis
      const analysis = await seoAnalyzer.analyzeWebsite(url);
      
      console.log(`Analysis completed for ${url} with score: ${analysis.score}`);
      res.json(analysis);
    } catch (error) {
      console.error('SEO analysis error:', error);
      
      // Return user-friendly error messages
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      res.status(500).json({
        error: "Analysis failed",
        message: errorMessage
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "seo-analyzer" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
