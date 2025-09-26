import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDot, TrendingUp, Target, Banknote, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type HealthStatus = "good" | "warning" | "critical";

interface HealthIndicator {
  title: string;
  status: HealthStatus;
  message: string;
  icon: React.ComponentType<{ className?: string }>;
}

const getStatusStyles = (status: HealthStatus) => {
  switch (status) {
    case "good":
      return {
        indicator: "bg-green-500",
        card: "border-green-200 bg-green-50/50",
        text: "text-green-700"
      };
    case "warning":
      return {
        indicator: "bg-yellow-500",
        card: "border-yellow-200 bg-yellow-50/50",
        text: "text-yellow-700"
      };
    case "critical":
      return {
        indicator: "bg-red-500",
        card: "border-red-200 bg-red-50/50",
        text: "text-red-700"
      };
  }
};

export default function BusinessHealthCheck() {
  // Calculate health indicators based on mock data
  // TODO: Replace with real data calculations
  const healthIndicators: HealthIndicator[] = [
    {
      title: "Revenue Status",
      status: "good",
      message: "On track - £6,240 this month",
      icon: TrendingUp
    },
    {
      title: "Pricing vs Market",
      status: "critical",
      message: "Below market - missing £850/mo",
      icon: Target
    },
    {
      title: "Pipeline Strength",
      status: "warning",
      message: "3 overdue follow-ups",
      icon: Clock
    },
    {
      title: "Cash Flow",
      status: "good",
      message: "Healthy - 18 active clients",
      icon: Banknote
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-semibold">Business Health Check</h2>
        <p className="text-sm text-muted-foreground">
          Real-time status of your business performance
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthIndicators.map((indicator) => {
          const IconComponent = indicator.icon;
          const styles = getStatusStyles(indicator.status);
          
          return (
            <Card 
              key={indicator.title}
              className={cn("transition-all duration-200 hover-elevate", styles.card)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <IconComponent className="w-5 h-5 text-muted-foreground" />
                  <div 
                    className={cn("w-3 h-3 rounded-full", styles.indicator)}
                    data-testid={`health-indicator-${indicator.title.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                </div>
                <CardTitle className="text-sm font-medium">
                  {indicator.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className={cn("text-sm font-medium", styles.text)}>
                  {indicator.message}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}