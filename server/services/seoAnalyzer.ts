import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';
import { promisify } from 'util';
import { resolve4, resolve6 } from 'dns';
import type { SEOAnalysisResponse, SEOIssue, MetaTag } from '@shared/schema';

const dnsResolve4 = promisify(resolve4);
const dnsResolve6 = promisify(resolve6);

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
  private readonly USER_AGENT = 'Mozilla/5.0 (compatible; SEO-Analyzer-Bot/1.0; +https://seo-analyzer.example.com)';
  private readonly TIMEOUT = 10000; // 10 seconds
  private readonly MAX_CONTENT_LENGTH = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_PORTS = new Set([80, 443, 8080, 8443]);
  
  // Private IP ranges to block (SSRF protection)
  private readonly BLOCKED_IP_RANGES = [
    // IPv4 private ranges
    /^0\./,                           // 0.0.0.0/8 (reserved)
    /^10\./,                          // 10.0.0.0/8 (private)
    /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./,  // 100.64.0.0/10 (carrier-grade NAT)
    /^127\./,                         // 127.0.0.0/8 (localhost)
    /^169\.254\./,                    // 169.254.0.0/16 (link-local)
    /^172\.(1[6-9]|2[0-9]|3[01])\./,  // 172.16.0.0/12 (private)
    /^192\.0\.0\./,                   // 192.0.0.0/24 (reserved)
    /^192\.168\./,                    // 192.168.0.0/16 (private)
    /^198\.(1[8-9])\./,               // 198.18.0.0/15 (benchmark testing)
    /^22[4-9]\./,                     // 224.0.0.0/4 (multicast)
    /^2[3-5][0-9]\./,                 // 224.0.0.0/4 continued
    /^255\.255\.255\.255$/,           // 255.255.255.255 (broadcast)
    
    // IPv6 ranges
    /^::1$/,                          // IPv6 localhost
    /^::ffff:127\./,                  // IPv4-mapped IPv6 localhost
    /^::ffff:10\./,                   // IPv4-mapped IPv6 private
    /^::ffff:172\.(1[6-9]|2[0-9]|3[01])\./,  // IPv4-mapped IPv6 private
    /^::ffff:192\.168\./,             // IPv4-mapped IPv6 private
    /^fc00:/,                         // IPv6 unique local (fc00::/8)
    /^fd00:/,                         // IPv6 unique local (fd00::/8)
    /^fe80:/,                         // IPv6 link-local
  ];
  
  // Metadata service IPs
  private readonly METADATA_IPS = new Set([
    '169.254.169.254',  // AWS/GCP/Azure metadata
    '169.254.169.123',  // Oracle Cloud metadata
    '100.100.100.200',  // Alibaba Cloud metadata
  ]);

  async analyzeWebsite(url: string): Promise<SEOAnalysisResponse> {
    try {
      // Validate and sanitize URL
      const validatedUrl = await this.validateAndSanitizeUrl(url);
      
      // Preflight check to verify content type and size
      await this.preflightCheck(validatedUrl);
      
      // Fetch the HTML content
      const html = await this.fetchHTML(validatedUrl);
      
      // Parse meta tags
      const metaData = this.parseMetaTags(html);
      
      // Generate SEO score and issues
      const { score, issues, tags } = this.calculateSEOScore(metaData, validatedUrl);

      return {
        url: validatedUrl,
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

  private async validateAndSanitizeUrl(url: string): Promise<string> {
    let parsedUrl: URL;
    
    try {
      parsedUrl = new URL(url);
    } catch (error) {
      throw new Error('Invalid URL format');
    }

    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Only HTTP and HTTPS protocols are allowed');
    }

    // Check port restrictions
    const port = parsedUrl.port ? parseInt(parsedUrl.port) : (parsedUrl.protocol === 'https:' ? 443 : 80);
    if (!this.ALLOWED_PORTS.has(port)) {
      throw new Error(`Port ${port} is not allowed`);
    }

    // Resolve hostname to IP and check for blocked ranges
    await this.validateHostname(parsedUrl.hostname);

    return parsedUrl.toString();
  }

  private async validateHostname(hostname: string): Promise<void> {
    let ipv4Success = false;
    let ipv6Success = false;
    
    // Check if hostname is already an IP address
    if (this.isIPAddress(hostname)) {
      if (this.isBlockedIP(hostname)) {
        throw new Error(`Access to IP ${hostname} is blocked for security reasons`);
      }
      if (this.METADATA_IPS.has(hostname)) {
        throw new Error('Access to metadata services is blocked');
      }
      return;
    }
    
    try {
      // Try IPv4 resolution
      try {
        const ipv4Addresses = await dnsResolve4(hostname);
        for (const ip of ipv4Addresses) {
          if (this.isBlockedIP(ip)) {
            throw new Error(`Access to IP ${ip} is blocked for security reasons`);
          }
          if (this.METADATA_IPS.has(ip)) {
            throw new Error('Access to metadata services is blocked');
          }
        }
        ipv4Success = true;
      } catch (dnsError) {
        // IPv4 resolution failed
      }

      // Try IPv6 resolution (optional if IPv4 succeeded)
      try {
        const ipv6Addresses = await dnsResolve6(hostname);
        for (const ip of ipv6Addresses) {
          if (this.isBlockedIP(ip)) {
            throw new Error(`Access to IP ${ip} is blocked for security reasons`);
          }
        }
        ipv6Success = true;
      } catch (dnsError) {
        // IPv6 resolution failed - acceptable if IPv4 succeeded
      }

      // Require at least one successful resolution
      if (!ipv4Success && !ipv6Success) {
        throw new Error(`Unable to resolve hostname: ${hostname}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`DNS resolution failed for hostname: ${hostname}`);
    }
  }

  private isIPAddress(hostname: string): boolean {
    // Simple check for IP addresses (IPv4 and IPv6)
    return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) || 
           /^(?:[0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}$/.test(hostname);
  }

  private isBlockedIP(ip: string): boolean {
    return this.BLOCKED_IP_RANGES.some(range => range.test(ip));
  }

  private async preflightCheck(url: string): Promise<void> {
    try {
      const response = await axios.head(url, {
        timeout: this.TIMEOUT,
        headers: {
          'User-Agent': this.USER_AGENT,
        },
        maxRedirects: 0, // Disable automatic redirects for security
        validateStatus: (status) => status < 400,
      });

      // Check content type
      const contentType = response.headers['content-type'];
      if (contentType && !contentType.includes('text/html')) {
        throw new Error('URL does not serve HTML content');
      }

      // Check content length
      const contentLength = response.headers['content-length'];
      if (contentLength && parseInt(contentLength) > this.MAX_CONTENT_LENGTH) {
        throw new Error(`Content too large (${contentLength} bytes). Maximum allowed: ${this.MAX_CONTENT_LENGTH} bytes`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 405) {
          // HEAD method not allowed, proceed with GET but be cautious
          return;
        }
      }
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
        maxRedirects: 0, // Disable automatic redirects for security
        maxContentLength: this.MAX_CONTENT_LENGTH,
        maxBodyLength: this.MAX_CONTENT_LENGTH,
        responseType: 'text',
        validateStatus: (status) => status < 400 || (status >= 300 && status < 400), // Allow redirects
      });

      // Handle redirects manually for security
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.location;
        if (location) {
          // Only follow one redirect to reduce complexity
          const redirectUrl = new URL(location, url).toString();
          console.log(`Following redirect from ${url} to ${redirectUrl}`);
          
          // Validate redirect target
          const validatedRedirectUrl = await this.validateAndSanitizeUrl(redirectUrl);
          return this.fetchHTML(validatedRedirectUrl);
        }
      }

      // Verify content type for non-preflight requests
      const contentType = response.headers['content-type'];
      if (contentType && !contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        throw new Error(`URL does not serve HTML content (Content-Type: ${contentType})`);
      }

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