import { useState } from "react";
import URLInput from "./URLInput";
import SEOScore from "./SEOScore";
import GooglePreview from "./GooglePreview";
import SocialPreview from "./SocialPreview";
import MetaTagDetails from "./MetaTagDetails";
import ThemeToggle from "./ThemeToggle";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchCheck, Globe } from "lucide-react";

// TODO: Remove mock functionality when integrating with real backend
interface AnalysisResult {
  url: string;
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  score: number;
  issues: {
    type: 'error' | 'warning' | 'success';
    message: string;
  }[];
  tags: {
    name: string;
    content: string;
    status: 'good' | 'warning' | 'missing';
    recommendation?: string;
  }[];
}

export default function SEOAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true);
    console.log('Analyzing URL:', url);
    
    // TODO: Replace with real API call
    setTimeout(() => {
      const mockResult: AnalysisResult = {
        url,
        title: `${new URL(url).hostname} - Professional Website`,
        description: `Discover amazing content and services at ${new URL(url).hostname}. Join thousands of satisfied customers.`,
        ogTitle: `${new URL(url).hostname} - Social Media Ready`,
        ogDescription: `Professional website with great content at ${new URL(url).hostname}`,
        ogImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop",
        score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
        issues: [
          { type: 'success', message: 'Title tag optimized' },
          { type: 'warning', message: 'Meta description could be longer' },
          { type: 'error', message: 'Missing canonical URL' }
        ],
        tags: [
          {
            name: 'title',
            content: `${new URL(url).hostname} - Professional Website`,
            status: 'good'
          },
          {
            name: 'description',
            content: `Discover amazing content at ${new URL(url).hostname}`,
            status: 'warning',
            recommendation: 'Consider expanding to 150-160 characters for better SERP display'
          },
          {
            name: 'canonical',
            content: '',
            status: 'missing',
            recommendation: 'Add canonical URL to avoid duplicate content issues'
          },
          {
            name: 'og:title',
            content: `${new URL(url).hostname} - Social Media Ready`,
            status: 'good'
          },
          {
            name: 'og:description',
            content: `Professional website with great content`,
            status: 'good'
          },
          {
            name: 'og:image',
            content: 'https://example.com/og-image.jpg',
            status: 'good'
          }
        ]
      };
      
      setResult(mockResult);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <SearchCheck className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold" data-testid="text-app-title">
                  SEO Meta Tag Analyzer
                </h1>
              </div>
              <Badge variant="secondary" className="text-xs">
                Professional Analysis
              </Badge>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="max-w-2xl mx-auto">
          <URLInput onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
        </div>

        {isAnalyzing && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-3 text-muted-foreground">
                <Globe className="h-5 w-5 animate-spin" />
                <span>Fetching website data and analyzing SEO tags...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {result && !isAnalyzing && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-medium text-muted-foreground">
                Analysis Results for
              </h2>
              <p className="text-sm text-primary font-mono mt-1" data-testid="text-analyzed-url">
                {result.url}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <SEOScore score={result.score} issues={result.issues} />
                <MetaTagDetails tags={result.tags} />
              </div>
              
              <div className="lg:col-span-2 space-y-6">
                <GooglePreview 
                  title={result.title}
                  description={result.description}
                  url={result.url}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SocialPreview
                    platform="facebook"
                    title={result.ogTitle || result.title}
                    description={result.ogDescription || result.description}
                    image={result.ogImage}
                    url={result.url}
                  />
                  <SocialPreview
                    platform="twitter"
                    title={result.ogTitle || result.title}
                    description={result.ogDescription || result.description}
                    image={result.ogImage}
                    url={result.url}
                  />
                </div>
                
                <SocialPreview
                  platform="linkedin"
                  title={result.ogTitle || result.title}
                  description={result.ogDescription || result.description}
                  image={result.ogImage}
                  url={result.url}
                />
              </div>
            </div>
          </div>
        )}

        {!result && !isAnalyzing && (
          <div className="text-center py-12">
            <SearchCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Ready to Analyze
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Enter a website URL above to get comprehensive SEO analysis with Google search and social media previews.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}