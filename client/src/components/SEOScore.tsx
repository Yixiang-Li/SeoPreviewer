import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface SEOScoreProps {
  score: number;
  issues: {
    type: 'error' | 'warning' | 'success';
    message: string;
  }[];
}

export default function SEOScore({ score, issues }: SEOScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-error";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-success/10";
    if (score >= 60) return "bg-warning/10";
    return "bg-error/10";
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-error" />;
      default:
        return null;
    }
  };

  const getIssueVariant = (type: string) => {
    switch (type) {
      case 'success':
        return "default";
      case 'warning':
        return "secondary";
      case 'error':
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          SEO Score
          <div className={`text-2xl font-bold ${getScoreColor(score)}`} data-testid="text-seo-score">
            {score}/100
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`relative h-2 rounded-full ${getScoreBackground(score)}`}>
          <div
            className={`h-full rounded-full transition-all duration-500 ${score >= 80 ? 'bg-success' : score >= 60 ? 'bg-warning' : 'bg-error'}`}
            style={{ width: `${score}%` }}
          />
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Issues Found</h4>
          <div className="space-y-2">
            {issues.map((issue, index) => (
              <div key={index} className="flex items-start gap-2">
                {getIssueIcon(issue.type)}
                <Badge variant={getIssueVariant(issue.type) as any} className="text-xs">
                  {issue.message}
                </Badge>
              </div>
            ))}
            {issues.length === 0 && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <CheckCircle className="h-4 w-4" />
                No issues found
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}