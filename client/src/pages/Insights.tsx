import { useState } from "react";
import InsightCard from "@/components/InsightCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Filter
} from "lucide-react";

interface Insight {
  id: string;
  type: "pricing" | "efficiency" | "customer" | "market";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  action: string;
  status: "active" | "completed" | "dismissed";
  dateGenerated: string;
  category: string;
}

// Mock insights data - TODO: remove mock functionality
const mockInsights: Insight[] = [
  {
    id: "1",
    type: "pricing",
    priority: "high",
    title: "Emergency Rate Below Market",
    description: "You're charging £15/hour less than competitors for emergency calls. Market analysis shows you could increase rates without losing customers.",
    impact: "£850 additional monthly revenue",
    action: "Increase Emergency Rate to £70/hour",
    status: "active",
    dateGenerated: "2024-01-18",
    category: "Revenue Optimization",
  },
  {
    id: "2",
    type: "customer",
    priority: "medium",
    title: "High-Value Customer Focus",
    description: "Sarah M. generates 40% more revenue per hour than your average customer. Prioritizing her projects could boost profitability.",
    impact: "Strengthen key relationship worth £2,400/year",
    action: "Schedule Follow-up Meeting with Sarah",
    status: "active",
    dateGenerated: "2024-01-17",
    category: "Customer Relations",
  },
  {
    id: "3",
    type: "efficiency",
    priority: "low",
    title: "Peak Season Planning",
    description: "Winter months show 25% higher demand for emergency plumbing. Plan resource allocation to maximize availability.",
    impact: "Optimize seasonal revenue potential",
    action: "Review Winter Schedule & Availability",
    status: "active",
    dateGenerated: "2024-01-15",
    category: "Operational Planning",
  },
  {
    id: "4",
    type: "pricing",
    priority: "medium",
    title: "Bathroom Installation Opportunity",
    description: "Your bathroom installation rate is 20% below market average. Consider raising prices for new bathroom projects.",
    impact: "£300 additional revenue per bathroom job",
    action: "Update Bathroom Installation Pricing",
    status: "completed",
    dateGenerated: "2024-01-10",
    category: "Service Pricing",
  },
  {
    id: "5",
    type: "market",
    priority: "high",
    title: "Competitor Rate Increase Alert",
    description: "Elite Plumbing Services increased their emergency rates by £10/hour. This creates an opportunity for you to raise prices.",
    impact: "Market positioning improvement",
    action: "Review and Adjust Your Emergency Rates",
    status: "active",
    dateGenerated: "2024-01-16",
    category: "Market Analysis",
  },
  {
    id: "6",
    type: "customer",
    priority: "low",
    title: "Customer Retention Strategy",
    description: "3 customers haven't booked in 90+ days. A follow-up campaign could re-engage dormant customers.",
    impact: "Potential to recover £1,200 in lost revenue",
    action: "Launch Re-engagement Campaign",
    status: "dismissed",
    dateGenerated: "2024-01-12",
    category: "Customer Retention",
  },
];

const statusConfig = {
  active: { color: "bg-chart-1 text-chart-1-foreground", label: "Active", icon: AlertTriangle },
  completed: { color: "bg-chart-1 text-chart-1-foreground", label: "Completed", icon: CheckCircle },
  dismissed: { color: "bg-muted text-muted-foreground", label: "Dismissed", icon: AlertTriangle },
};

const priorityConfig = {
  high: { count: 0, color: "text-destructive" },
  medium: { count: 0, color: "text-chart-2" },
  low: { count: 0, color: "text-muted-foreground" },
};

export default function Insights() {
  const [insights, setInsights] = useState(mockInsights);
  const [activeTab, setActiveTab] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const handleTakeAction = (insightId: string) => {
    console.log("Taking action on insight:", insightId);
    setInsights(prev => 
      prev.map(insight => 
        insight.id === insightId 
          ? { ...insight, status: "completed" as const }
          : insight
      )
    );
  };

  const handleDismissInsight = (insightId: string) => {
    console.log("Dismissing insight:", insightId);
    setInsights(prev =>
      prev.map(insight =>
        insight.id === insightId
          ? { ...insight, status: "dismissed" as const }
          : insight
      )
    );
  };

  const handleRefreshInsights = () => {
    console.log("Refreshing insights...");
  };

  const filteredInsights = insights.filter(insight => {
    const matchesTab = activeTab === "all" || insight.status === activeTab;
    const matchesPriority = priorityFilter === "all" || insight.priority === priorityFilter;
    return matchesTab && matchesPriority;
  });

  // Calculate stats
  const activeInsights = insights.filter(i => i.status === "active");
  const completedInsights = insights.filter(i => i.status === "completed");
  const highPriorityActive = activeInsights.filter(i => i.priority === "high").length;

  // Update priority counts
  priorityConfig.high.count = activeInsights.filter(i => i.priority === "high").length;
  priorityConfig.medium.count = activeInsights.filter(i => i.priority === "medium").length;
  priorityConfig.low.count = activeInsights.filter(i => i.priority === "low").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Business Insights
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered recommendations to grow your business
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshInsights} data-testid="button-refresh-insights">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" data-testid="button-insight-settings">
            <Filter className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Active Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeInsights.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {highPriorityActive} high priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">{completedInsights.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Actions taken
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Potential Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">£1,150</div>
            <p className="text-xs text-muted-foreground mt-1">
              Monthly revenue upside
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className={priorityConfig.high.color}>High Priority</span>
                <span className="font-medium">{priorityConfig.high.count}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={priorityConfig.medium.color}>Medium Priority</span>
                <span className="font-medium">{priorityConfig.medium.count}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={priorityConfig.low.color}>Low Priority</span>
                <span className="font-medium">{priorityConfig.low.count}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Management */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TabsList className="grid w-full sm:w-auto grid-cols-3">
            <TabsTrigger value="all">All Insights</TabsTrigger>
            <TabsTrigger value="active">Active ({activeInsights.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedInsights.length})</TabsTrigger>
          </TabsList>
          
          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Priority:</span>
            <div className="flex gap-1">
              {["all", "high", "medium", "low"].map((priority) => (
                <Badge
                  key={priority}
                  variant={priorityFilter === priority ? "default" : "secondary"}
                  className="cursor-pointer hover-elevate text-xs"
                  onClick={() => setPriorityFilter(priority)}
                  data-testid={`filter-priority-${priority}`}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  {priority !== "all" && priorityFilter === "all" && (
                    <span className="ml-1">
                      ({priorityConfig[priority as keyof typeof priorityConfig]?.count || 0})
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredInsights.map((insight) => (
              <div key={insight.id} className="relative">
                <InsightCard
                  type={insight.type}
                  priority={insight.priority}
                  title={insight.title}
                  description={insight.description}
                  impact={insight.impact}
                  action={insight.action}
                  onTakeAction={() => handleTakeAction(insight.id)}
                />
                <div className="absolute top-2 right-2">
                  <Badge className={`text-xs ${statusConfig[insight.status].color}`}>
                    {statusConfig[insight.status].label}
                  </Badge>
                </div>
                {insight.status === "active" && (
                  <div className="absolute top-2 left-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={() => handleDismissInsight(insight.id)}
                      data-testid={`button-dismiss-insight-${insight.id}`}
                    >
                      ×
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredInsights.filter(i => i.status === "active").map((insight) => (
              <div key={insight.id} className="relative">
                <InsightCard
                  type={insight.type}
                  priority={insight.priority}
                  title={insight.title}
                  description={insight.description}
                  impact={insight.impact}
                  action={insight.action}
                  onTakeAction={() => handleTakeAction(insight.id)}
                />
                <div className="absolute top-2 left-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => handleDismissInsight(insight.id)}
                    data-testid={`button-dismiss-insight-${insight.id}`}
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredInsights.filter(i => i.status === "completed").map((insight) => (
              <InsightCard
                key={insight.id}
                type={insight.type}
                priority={insight.priority}
                title={insight.title}
                description={insight.description}
                impact={insight.impact}
                action="Completed ✓"
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredInsights.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-heading font-semibold mb-2">No insights available</h3>
            <p className="text-muted-foreground mb-4">
              {priorityFilter !== "all" || activeTab !== "all"
                ? "Try adjusting your filters to see more insights"
                : "Add more job data to generate personalized insights"}
            </p>
            <Button onClick={handleRefreshInsights}>
              Generate New Insights
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}