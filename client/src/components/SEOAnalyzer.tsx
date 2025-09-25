import { useState } from "react";
import URLInput from "./URLInput";
import SEOScore from "./SEOScore";
import GooglePreview from "./GooglePreview";
import SocialPreview from "./SocialPreview";
import MetaTagDetails from "./MetaTagDetails";
import ThemeToggle from "./ThemeToggle";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchCheck, Globe, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SEOAnalysisResponse } from "@shared/schema";

export default function SEOAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SEOAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    
    try {
      console.log('Analyzing URL:', url);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      const analysisResult = await response.json();
      setResult(analysisResult);
      console.log('Analysis completed:', analysisResult);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetry = () => {
    if (result?.url) {
      handleAnalyze(result.url);
    }
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

        {error && !isAnalyzing && (
          <Card className="max-w-2xl mx-auto border-destructive">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-destructive mb-2">Analysis Failed</h3>
                  <p className="text-sm text-muted-foreground mb-4" data-testid="text-error-message">
                    {error}
                  </p>
                  <Button onClick={handleRetry} size="sm" variant="outline" data-testid="button-retry">
                    Try Again
                  </Button>
                </div>
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
                    title={result.twitterTitle || result.ogTitle || result.title}
                    description={result.twitterDescription || result.ogDescription || result.description}
                    image={result.twitterImage || result.ogImage}
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