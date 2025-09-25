import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Tag, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

interface MetaTag {
  name: string;
  content: string;
  status: 'good' | 'warning' | 'missing';
  recommendation?: string;
}

interface MetaTagDetailsProps {
  tags: MetaTag[];
}

export default function MetaTagDetails({ tags }: MetaTagDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'missing':
        return <XCircle className="h-4 w-4 text-error" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good':
        return <Badge variant="default" className="bg-success/10 text-success border-success/20">Good</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">Warning</Badge>;
      case 'missing':
        return <Badge variant="destructive" className="bg-error/10 text-error border-error/20">Missing</Badge>;
    }
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover-elevate" data-testid="button-meta-details-toggle">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Meta Tag Details
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {tags.map((tag, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(tag.status)}
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded" data-testid={`text-meta-name-${index}`}>
                      {tag.name}
                    </code>
                  </div>
                  {getStatusBadge(tag.status)}
                </div>
                
                <div className="pl-6 space-y-2">
                  <div className="text-sm" data-testid={`text-meta-content-${index}`}>
                    <span className="font-medium">Content:</span>
                    <div className="mt-1 p-2 bg-muted/50 rounded text-xs font-mono break-words">
                      {tag.content || <span className="text-muted-foreground italic">Not found</span>}
                    </div>
                  </div>
                  
                  {tag.recommendation && (
                    <div className="text-xs text-muted-foreground p-2 bg-info/5 border-l-2 border-info/20 rounded-r">
                      <strong>Recommendation:</strong> {tag.recommendation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}