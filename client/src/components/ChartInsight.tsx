import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingUp, ArrowRight } from "lucide-react";

interface ChartInsightProps {
  explanation: string;
  insight: string;
  callToAction: string;
  onActionClick?: () => void;
  className?: string;
}

export default function ChartInsight({
  explanation,
  insight,
  callToAction,
  onActionClick,
  className = "",
}: ChartInsightProps) {
  const handleAction = () => {
    console.log("Chart insight action clicked:", callToAction);
    onActionClick?.();
  };

  return (
    <Card className={`mt-4 border-l-4 border-l-chart-1 ${className}`}>
      <CardContent className="p-4 space-y-3">
        {/* What This Shows */}
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-muted-foreground" />
            <Badge variant="secondary" className="text-xs">What This Shows</Badge>
          </div>
          <p className="text-sm text-foreground">{explanation}</p>
        </div>

        {/* Your Data Insight */}
        <div className="bg-chart-1/10 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-chart-1" />
            <Badge className="bg-chart-1 text-chart-1-foreground text-xs">Your Data Insight</Badge>
          </div>
          <p className="text-sm text-foreground">{insight}</p>
        </div>

        {/* Action Required */}
        <div className="bg-chart-2/10 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight className="w-4 h-4 text-chart-2" />
            <Badge className="bg-chart-2 text-chart-2-foreground text-xs">Action Required</Badge>
          </div>
          <p className="text-sm text-foreground mb-3">{callToAction}</p>
          {onActionClick && (
            <Button 
              size="sm" 
              onClick={handleAction}
              className="w-full"
              data-testid="button-chart-action"
            >
              Take Action
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}