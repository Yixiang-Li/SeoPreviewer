import { z } from "zod";

// SEO Analysis Types
export const seoIssueSchema = z.object({
  type: z.enum(['error', 'warning', 'success']),
  message: z.string(),
});

export const metaTagSchema = z.object({
  name: z.string(),
  content: z.string(),
  status: z.enum(['good', 'warning', 'missing']),
  recommendation: z.string().optional(),
});

export const seoAnalysisRequestSchema = z.object({
  url: z.string().url(),
});

export const seoAnalysisResponseSchema = z.object({
  url: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterImage: z.string().optional(),
  canonical: z.string().optional(),
  robots: z.string().optional(),
  viewport: z.string().optional(),
  score: z.number().min(0).max(100),
  issues: z.array(seoIssueSchema),
  tags: z.array(metaTagSchema),
  analyzedAt: z.string(),
});

// Type exports
export type SEOIssue = z.infer<typeof seoIssueSchema>;
export type MetaTag = z.infer<typeof metaTagSchema>;
export type SEOAnalysisRequest = z.infer<typeof seoAnalysisRequestSchema>;
export type SEOAnalysisResponse = z.infer<typeof seoAnalysisResponseSchema>;
