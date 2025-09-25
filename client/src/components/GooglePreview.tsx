import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface GooglePreviewProps {
  title?: string;
  description?: string;
  url: string;
}

export default function GooglePreview({ title, description, url }: GooglePreviewProps) {
  const displayUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const domain = displayUrl.split('/')[0];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Google Preview
          <Badge variant="secondary" className="text-xs">SERP</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 p-4 bg-muted/30 rounded-md border-l-2 border-primary/20">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            {displayUrl}
          </div>
          
          <h3 className="text-blue-600 dark:text-blue-400 text-lg font-normal hover:underline cursor-pointer" data-testid="text-google-title">
            {title || 'No title tag found'}
          </h3>
          
          <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-google-description">
            {description || 'No meta description found'}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{domain}</span>
            {title && description && (
              <Badge variant="outline" className="text-xs">
                Optimized
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}