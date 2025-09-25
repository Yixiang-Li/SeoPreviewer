import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Facebook, Twitter, Share2 } from "lucide-react";

interface SocialPreviewProps {
  platform: 'facebook' | 'twitter' | 'linkedin';
  title?: string;
  description?: string;
  image?: string;
  url: string;
}

export default function SocialPreview({ platform, title, description, image, url }: SocialPreviewProps) {
  const getPlatformIcon = () => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      case 'linkedin':
        return <Share2 className="h-4 w-4" />;
    }
  };

  const getPlatformName = () => {
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  const domain = url.replace(/^https?:\/\//, '').split('/')[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getPlatformIcon()}
          {getPlatformName()} Preview
          <Badge variant="secondary" className="text-xs">Social</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden bg-card">
          {image && (
            <div className="aspect-video bg-muted flex items-center justify-center" data-testid="img-social-preview">
              <img 
                src={image} 
                alt="Preview" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<div class="text-muted-foreground text-sm">Image not available</div>';
                }}
              />
            </div>
          )}
          
          <div className="p-3 space-y-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              {domain}
            </div>
            
            <h4 className="font-medium text-sm leading-tight" data-testid="text-social-title">
              {title || 'No Open Graph title found'}
            </h4>
            
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2" data-testid="text-social-description">
              {description || 'No Open Graph description found'}
            </p>
          </div>
        </div>
        
        {!image && (
          <div className="mt-2 text-xs text-muted-foreground">
            No Open Graph image specified
          </div>
        )}
      </CardContent>
    </Card>
  );
}