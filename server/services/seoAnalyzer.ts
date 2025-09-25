import axios from 'axios';
import * as cheerio from 'cheerio';
import type { SEOAnalysisResponse, SEOIssue, MetaTag } from '@shared/schema';

interface HTMLMetaData {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  robots?: string;
  viewport?: string;
  [key: string]: string | undefined;
}

export class SEOAnalyzerService {
  private readonly USER_AGENT = 'SEO-Analyzer-Bot/1.0 (Website SEO Analysis Tool)';
  private readonly TIMEOUT = 10000; // 10 seconds

  async analyzeWebsite(url: string): Promise<SEOAnalysisResponse> {
    try {
      // Fetch the HTML content
      const html = await this.fetchHTML(url);
      
      // Parse meta tags
      const metaData = this.parseMetaTags(html);
      
      // Generate SEO score and issues
      const { score, issues, tags } = this.calculateSEOScore(metaData, url);

      return {
        url,
        ...metaData,
        score,
        issues,
        tags,
        analyzedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('SEO Analysis error:', error);
      throw error;
    }
  }

  private async fetchHTML(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        timeout: this.TIMEOUT,
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        maxRedirects: 5,
        validateStatus: (status) => status < 400,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ENOTFOUND') {
          throw new Error('Website not found. Please check the URL and try again.');
        }
        if (error.code === 'ECONNREFUSED') {
          throw new Error('Connection refused. The website may be down.');
        }
        if (error.response?.status === 403) {
          throw new Error('Access denied. The website is blocking our analysis tool.');
        }
        if (error.response?.status === 404) {
          throw new Error('Page not found. Please check the URL.');
        }
        if (error.code === 'ETIMEDOUT') {
          throw new Error('Request timed out. The website is taking too long to respond.');
        }
      }
      throw new Error(`Failed to fetch website: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseMetaTags(html: string): HTMLMetaData {
    const $ = cheerio.load(html);
    const metaData: HTMLMetaData = {};

    // Basic meta tags
    metaData.title = $('title').first().text().trim() || undefined;
    metaData.description = $('meta[name="description"]').attr('content')?.trim() || undefined;
    metaData.robots = $('meta[name="robots"]').attr('content')?.trim() || undefined;
    metaData.viewport = $('meta[name="viewport"]').attr('content')?.trim() || undefined;

    // Canonical URL
    metaData.canonical = $('link[rel="canonical"]').attr('href')?.trim() || undefined;

    // Open Graph tags
    metaData.ogTitle = $('meta[property="og:title"]').attr('content')?.trim() || undefined;
    metaData.ogDescription = $('meta[property="og:description"]').attr('content')?.trim() || undefined;
    metaData.ogImage = $('meta[property="og:image"]').attr('content')?.trim() || undefined;

    // Twitter Card tags
    metaData.twitterTitle = $('meta[name="twitter:title"]').attr('content')?.trim() || undefined;
    metaData.twitterDescription = $('meta[name="twitter:description"]').attr('content')?.trim() || undefined;
    metaData.twitterImage = $('meta[name="twitter:image"]').attr('content')?.trim() || undefined;

    return metaData;
  }

  private calculateSEOScore(metaData: HTMLMetaData, url: string): { 
    score: number; 
    issues: SEOIssue[]; 
    tags: MetaTag[] 
  } {
    const issues: SEOIssue[] = [];
    const tags: MetaTag[] = [];
    let score = 100;

    // Title tag analysis
    if (metaData.title) {
      const titleLength = metaData.title.length;
      if (titleLength < 30) {
        score -= 15;
        issues.push({ type: 'warning', message: `Title too short (${titleLength} chars)` });
        tags.push({
          name: 'title',
          content: metaData.title,
          status: 'warning',
          recommendation: 'Title should be 30-60 characters long for optimal display in search results'
        });
      } else if (titleLength > 60) {
        score -= 10;
        issues.push({ type: 'warning', message: `Title too long (${titleLength} chars)` });
        tags.push({
          name: 'title',
          content: metaData.title,
          status: 'warning',
          recommendation: 'Title should be 30-60 characters long to avoid truncation in search results'
        });
      } else {
        issues.push({ type: 'success', message: 'Title tag length is optimal' });
        tags.push({
          name: 'title',
          content: metaData.title,
          status: 'good'
        });
      }
    } else {
      score -= 25;
      issues.push({ type: 'error', message: 'Missing title tag' });
      tags.push({
        name: 'title',
        content: '',
        status: 'missing',
        recommendation: 'Add a unique, descriptive title tag (30-60 characters) to help search engines understand your page'
      });
    }

    // Meta description analysis
    if (metaData.description) {
      const descLength = metaData.description.length;
      if (descLength < 120) {
        score -= 10;
        issues.push({ type: 'warning', message: `Meta description too short (${descLength} chars)` });
        tags.push({
          name: 'description',
          content: metaData.description,
          status: 'warning',
          recommendation: 'Meta description should be 120-160 characters for optimal SERP display'
        });
      } else if (descLength > 160) {
        score -= 8;
        issues.push({ type: 'warning', message: `Meta description too long (${descLength} chars)` });
        tags.push({
          name: 'description',
          content: metaData.description,
          status: 'warning',
          recommendation: 'Meta description should be 120-160 characters to avoid truncation'
        });
      } else {
        issues.push({ type: 'success', message: 'Meta description length is optimal' });
        tags.push({
          name: 'description',
          content: metaData.description,
          status: 'good'
        });
      }
    } else {
      score -= 20;
      issues.push({ type: 'error', message: 'Missing meta description' });
      tags.push({
        name: 'description',
        content: '',
        status: 'missing',
        recommendation: 'Add a compelling meta description (120-160 characters) to improve click-through rates'
      });
    }

    // Open Graph analysis
    if (metaData.ogTitle && metaData.ogDescription) {
      issues.push({ type: 'success', message: 'Open Graph tags configured' });
      tags.push({
        name: 'og:title',
        content: metaData.ogTitle,
        status: 'good'
      });
      tags.push({
        name: 'og:description',
        content: metaData.ogDescription,
        status: 'good'
      });
    } else {
      score -= 15;
      issues.push({ type: 'warning', message: 'Incomplete Open Graph tags' });
      if (!metaData.ogTitle) {
        tags.push({
          name: 'og:title',
          content: '',
          status: 'missing',
          recommendation: 'Add Open Graph title for better social media sharing'
        });
      }
      if (!metaData.ogDescription) {
        tags.push({
          name: 'og:description',
          content: '',
          status: 'missing',
          recommendation: 'Add Open Graph description for better social media sharing'
        });
      }
    }

    // Open Graph image
    if (metaData.ogImage) {
      tags.push({
        name: 'og:image',
        content: metaData.ogImage,
        status: 'good'
      });
    } else {
      score -= 10;
      issues.push({ type: 'warning', message: 'Missing Open Graph image' });
      tags.push({
        name: 'og:image',
        content: '',
        status: 'missing',
        recommendation: 'Add an Open Graph image (1200x630px recommended) for better social media sharing'
      });
    }

    // Canonical URL
    if (metaData.canonical) {
      issues.push({ type: 'success', message: 'Canonical URL specified' });
      tags.push({
        name: 'canonical',
        content: metaData.canonical,
        status: 'good'
      });
    } else {
      score -= 8;
      issues.push({ type: 'warning', message: 'Missing canonical URL' });
      tags.push({
        name: 'canonical',
        content: '',
        status: 'missing',
        recommendation: 'Add canonical URL to avoid duplicate content issues'
      });
    }

    // Viewport
    if (metaData.viewport) {
      tags.push({
        name: 'viewport',
        content: metaData.viewport,
        status: 'good'
      });
    } else {
      score -= 5;
      issues.push({ type: 'warning', message: 'Missing viewport meta tag' });
      tags.push({
        name: 'viewport',
        content: '',
        status: 'missing',
        recommendation: 'Add viewport meta tag for mobile responsiveness'
      });
    }

    // Robots
    if (metaData.robots) {
      tags.push({
        name: 'robots',
        content: metaData.robots,
        status: 'good'
      });
    } else {
      // Not critical, just informational
      tags.push({
        name: 'robots',
        content: '',
        status: 'missing',
        recommendation: 'Consider adding robots meta tag to control search engine crawling'
      });
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    return { score, issues, tags };
  }
}

export const seoAnalyzer = new SEOAnalyzerService();