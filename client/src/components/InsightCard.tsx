import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Users, DollarSign, LucideIcon } from "lucide-react";

type InsightType = "pricing" | "efficiency" | "customer" | "market";
type InsightPriority = "high" | "medium" | "low";

interface InsightCardProps {
  type: InsightType;
  priority: InsightPriority;
  problem: string;
  action: string;
  impact: string;
  onTakeAction?: () => void;
  className?: string;
}

const typeConfig: Record<InsightType, { icon: LucideIcon; color: string; bgColor: string }> = {
  pricing: { icon: DollarSign, color: "text-chart-1", bgColor: "bg-chart-1/10" },
  efficiency: { icon: TrendingUp, color: "text-chart-2", bgColor: "bg-chart-2/10" },
  customer: { icon: Users, color: "text-chart-4", bgColor: "bg-chart-4/10" },
  market: { icon: AlertTriangle, color: "text-chart-3", bgColor: "bg-chart-3/10" },
};

const priorityConfig: Record<InsightPriority, { color: string; label: string }> = {
  high: { color: "bg-destructive text-destructive-foreground", label: "High Priority" },
  medium: { color: "bg-chart-2 text-chart-2-foreground", label: "Medium Priority" },
  low: { color: "bg-muted text-muted-foreground", label: "Low Priority" },
};

export default function InsightCard({
  type,
  priority,
  problem,
  action,
  impact,
  onTakeAction,
  className = "",
}: InsightCardProps) {
  const typeSettings = typeConfig[type];
  const prioritySettings = priorityConfig[priority];
  const Icon = typeSettings.icon;

  const handleAction = () => {
    console.log(`Taking action: ${action}`);
    onTakeAction?.();
  };

  return (
    <Card className={`hover-elevate ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className={`p-2 rounded-lg ${typeSettings.bgColor}`}>
            <Icon className={`h-4 w-4 ${typeSettings.color}`} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium mb-2">
              {problem}
            </p>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${prioritySettings.color}`}>
                  {prioritySettings.label}
                </Badge>
                <span className="text-xs font-medium text-chart-1">
                  {impact}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleAction}
          className="w-full"
          data-testid={`button-take-action-${type}`}
        >
          {action}
        </Button>
      </CardContent>
    </Card>
  );
}