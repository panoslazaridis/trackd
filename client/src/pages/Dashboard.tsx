import DashboardCard from "@/components/DashboardCard";
import BusinessHealthCheck from "@/components/BusinessHealthCheck";
import DailyFocus from "@/components/DailyFocus";
import InsightCard from "@/components/InsightCard";
import ChartContainer from "@/components/ChartContainer";
import ChartInsight from "@/components/ChartInsight";
import AIInsights from "@/components/AIInsights";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserId } from "@/lib/auth";
import { 
  DollarSign, 
  Clock, 
  Users, 
  TrendingUp, 
  Calendar,
  Target,
  RefreshCw,
  Plus,
  BarChart3,
  Zap,
  AlertCircle
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

// Mock data for charts - TODO: remove mock functionality
const revenueData = [
  { month: 'Jan', revenue: 4200, forecast: 4500 },
  { month: 'Feb', revenue: 3800, forecast: 4100 },
  { month: 'Mar', revenue: 5200, forecast: 5000 },
  { month: 'Apr', revenue: 4600, forecast: 4800 },
  { month: 'May', revenue: 5800, forecast: 5500 },
  { month: 'Jun', revenue: 6200, forecast: 6000 },
];

// Chart data for selected dashboard charts
const efficiencyData = [
  { hours: 2, revenue: 180, customer: 'Quick Fix', type: 'Emergency' },
  { hours: 8, revenue: 600, customer: 'Sarah M.', type: 'Renovation' },
  { hours: 4, revenue: 320, customer: 'David W.', type: 'Repair' },
  { hours: 12, revenue: 900, customer: 'Emma J.', type: 'Installation' },
  { hours: 6, revenue: 450, customer: 'Michael B.', type: 'Maintenance' },
];

const competitorData = [
  { service: 'Emergency Plumbing', yourRate: 65, marketAvg: 70 },
  { service: 'Bathroom Install', yourRate: 45, marketAvg: 50 },
  { service: 'Kitchen Plumbing', yourRate: 55, marketAvg: 60 },
  { service: 'Boiler Service', yourRate: 40, marketAvg: 45 },
];

const customerValueData = [
  { name: 'Sarah M.', value: 2400 },
  { name: 'David W.', value: 1800 },
  { name: 'Emma J.', value: 1200 },
  { name: 'Michael B.', value: 900 },
  { name: 'Others', value: 3200 },
];

const jobTypeData = [
  { type: 'Emergency', hours: 45, revenue: 3200 },
  { type: 'Maintenance', hours: 32, revenue: 1800 },
  { type: 'Installation', hours: 28, revenue: 2100 },
  { type: 'Repair', hours: 24, revenue: 1600 },
];

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];


// Available charts that can be added to dashboard
const availableCharts = [
  {
    id: "efficiency",
    title: "Job Efficiency Matrix",
    description: "Hours vs Revenue analysis for optimal job identification",
    icon: Zap,
    category: "Performance"
  },
  {
    id: "competitor",
    title: "Competitor Pricing Comparison", 
    description: "Your rates vs market average comparison",
    icon: BarChart3,
    category: "Market Analysis"
  },
  {
    id: "customers",
    title: "Top Customers by Revenue",
    description: "Lifetime value breakdown of your best customers",
    icon: Users,
    category: "Customer Analytics"
  },
  {
    id: "utilization",
    title: "Resource Utilization by Job Type",
    description: "Time and revenue breakdown across service types",
    icon: BarChart3,
    category: "Resource Management"
  }
];

export default function Dashboard() {
  const { businessType, getCurrentBusiness, userProfile } = useBusinessContext();
  const currentBusiness = getCurrentBusiness();
  const [, setLocation] = useLocation();
  const [selectedChartsForModal, setSelectedChartsForModal] = useState<string[]>([]);
  const [dashboardCharts, setDashboardCharts] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch jobs to check if empty
  const userId = getCurrentUserId();
  const { data: jobs = [] } = useQuery<any[]>({
    queryKey: [`/api/jobs/${userId}`],
  });

  // Load dashboard charts from localStorage on mount
  useEffect(() => {
    const savedCharts = localStorage.getItem('trackd-dashboard-charts');
    if (savedCharts) {
      try {
        const parsedCharts = JSON.parse(savedCharts);
        if (Array.isArray(parsedCharts)) {
          setDashboardCharts(parsedCharts);
        }
      } catch (error) {
        console.error('Failed to parse saved dashboard charts:', error);
      }
    }
  }, []);

  // Save dashboard charts to localStorage whenever they change
  useEffect(() => {
    if (dashboardCharts.length > 0) {
      localStorage.setItem('trackd-dashboard-charts', JSON.stringify(dashboardCharts));
    } else {
      localStorage.removeItem('trackd-dashboard-charts');
    }
  }, [dashboardCharts]);
  
  const handleRefreshData = () => {
    console.log("Refreshing dashboard data...");
  };

  const handleAddCharts = () => {
    console.log("Updating dashboard with charts:", selectedChartsForModal);
    setDashboardCharts([...selectedChartsForModal]);
    setIsDialogOpen(false);
    setSelectedChartsForModal([]);
  };

  const handleOpenModal = () => {
    // Pre-populate modal with currently selected dashboard charts
    setSelectedChartsForModal([...dashboardCharts]);
    setIsDialogOpen(true);
  };

  const toggleChartSelection = (chartId: string) => {
    setSelectedChartsForModal(prev => 
      prev.includes(chartId) 
        ? prev.filter(id => id !== chartId)
        : [...prev, chartId]
    );
  };

  const renderChart = (chartId: string) => {
    switch (chartId) {
      case "efficiency":
        return (
          <div key={chartId}>
            <ChartContainer
              title="Job Efficiency Matrix"
              description="Hours vs Revenue - aim for upper left quadrant"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={efficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hours" type="number" domain={[0, 'dataMax + 2']} />
                  <YAxis dataKey="revenue" type="number" />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
                            <p className="font-medium">{data.customer}</p>
                            <p className="text-sm text-muted-foreground">{data.type}</p>
                            <p className="text-sm">£{data.revenue} in {data.hours} hours</p>
                            <p className="text-sm font-medium">£{(data.revenue / data.hours).toFixed(0)}/hr</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter dataKey="revenue" fill="hsl(var(--chart-1))" />
                </ScatterChart>
              </ResponsiveContainer>
            </ChartContainer>
            <ChartInsight
              explanation="This scatter plot shows the relationship between time spent and revenue earned for each job, helping you identify your most efficient work patterns."
              insight="Your emergency jobs (Sarah M.) deliver the highest revenue per hour at £71, while maintenance jobs show lower efficiency at around £30/hour."
              callToAction="Focus on booking more emergency and installation jobs, which offer better hourly rates than general maintenance work."
            />
          </div>
        );

      case "competitor":
        return (
          <div key={chartId}>
            <ChartContainer
              title="Competitor Pricing Comparison"
              description="Your rates vs market average"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={competitorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="service" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="yourRate" fill="hsl(var(--chart-1))" name="Your Rate" />
                  <Bar dataKey="marketAvg" fill="hsl(var(--chart-2))" name="Market Average" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <ChartInsight
              explanation="This comparison shows how your hourly rates stack up against local competitors across different service types."
              insight="You're undercharging by £5-10/hour across all services, with emergency plumbing showing the biggest gap at £5/hour below market rate."
              callToAction="Increase your emergency plumbing rate to £70/hour to match the market - this could add £850 in monthly revenue."
              onActionClick={() => console.log("Navigate to pricing settings")}
            />
          </div>
        );

      case "customers":
        return (
          <div key={chartId}>
            <ChartContainer
              title="Top Customers by Revenue"
              description="Lifetime value of your best customers"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerValueData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: £${value}`}
                  >
                    {customerValueData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <ChartInsight
              explanation="This pie chart breaks down your revenue by individual customers, showing which clients contribute most to your business success."
              insight="Sarah M. represents 24% of your total revenue (£2,400), making her your most valuable customer relationship worth protecting."
              callToAction="Schedule a check-in call with Sarah M. this month to discuss upcoming projects and ensure you maintain this key relationship."
              onActionClick={() => console.log("Schedule customer call")}
            />
          </div>
        );

      case "utilization":
        return (
          <div key={chartId} className="lg:col-span-2">
            <ChartContainer
              title="Resource Utilization by Job Type"
              description="Time and revenue breakdown"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" fill="hsl(var(--chart-4))" name="Hours Worked" />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-1))" name="Revenue (£)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <ChartInsight
              explanation="This analysis compares how much time you invest in different job types versus the revenue they generate, revealing your most profitable service areas."
              insight="Emergency work delivers the best ROI with £3,200 revenue from 45 hours (£71/hour), while maintenance jobs offer lower returns at £56/hour."
              callToAction="Shift 20% of your maintenance hours to emergency services by marketing 24/7 availability - this could boost monthly revenue by £900."
              onActionClick={() => console.log("Update service marketing")}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your business performance and get actionable insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshData} data-testid="button-refresh-dashboard">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button variant="outline" data-testid="button-add-chart" onClick={handleOpenModal}>
              <Plus className="w-4 h-4 mr-2" />
              Add Chart
            </Button>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Manage Dashboard Charts</DialogTitle>
                <DialogDescription>
                  Choose which charts to display on your dashboard for quick access to your most important business insights. Your selection will persist between sessions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {availableCharts.map((chart) => {
                  const IconComponent = chart.icon;
                  const isSelected = selectedChartsForModal.includes(chart.id);
                  return (
                    <Card 
                      key={chart.id}
                      className={`cursor-pointer transition-all hover-elevate ${
                        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => toggleChartSelection(chart.id)}
                      data-testid={`chart-option-${chart.id}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-lg">
                              <IconComponent className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                              <CardTitle className="text-sm font-medium">{chart.title}</CardTitle>
                              <Badge variant="secondary" className="text-xs mt-1">
                                {chart.category}
                              </Badge>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-primary-foreground text-xs">✓</span>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm">
                          {chart.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddCharts} 
                  data-testid="button-confirm-add-charts"
                >
                  Update Dashboard ({selectedChartsForModal.length} chart{selectedChartsForModal.length !== 1 ? 's' : ''})
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={() => setLocation("/jobs")} data-testid="button-add-job">
            Add New Job
          </Button>
        </div>
      </div>

      {/* Empty State Banner */}
      {jobs.length === 0 && (
        <Alert className="bg-primary/10 border-primary/20" data-testid="alert-empty-state">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertTitle className="text-foreground">Get Started with TrackD</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Add jobs to start getting valuable insights about your business performance, pricing, and efficiency.
            <Button 
              variant="link" 
              className="px-1 h-auto text-primary" 
              onClick={() => setLocation("/jobs")}
              data-testid="link-add-first-job"
            >
              Add your first job
            </Button>
            to unlock powerful analytics.
          </AlertDescription>
        </Alert>
      )}

      {/* Business Health Check */}
      <BusinessHealthCheck />

      {/* Daily Focus */}
      <DailyFocus />

      {/* Top Insights */}
      <div>
        <h2 className="text-xl font-heading font-semibold mb-4">Top Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <InsightCard
            type="pricing"
            priority="high"
            problem="You're charging £5/hour less than competitors for emergency calls"
            action="Increase Emergency Rate to £70/hour"
            impact="+£850/month"
          />
          <InsightCard
            type="customer"
            priority="medium"
            problem="Sarah M. generates 40% more revenue per hour than average"
            action="Schedule Follow-up Meeting"
            impact="Strengthen key relationship"
          />
          <InsightCard
            type="efficiency"
            priority="low"
            problem="Winter months show 25% higher demand for emergency services"
            action="Review Winter Availability"
            impact="Plan resource allocation"
          />
        </div>
      </div>

      {/* Primary Chart */}
      <div className="max-w-4xl">
        {/* Revenue Trends */}
        <ChartContainer
          title="Revenue & Forecast Trends"
          description="Monthly performance with predictions"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" name="Actual Revenue" strokeWidth={2} />
              <Line type="monotone" dataKey="forecast" stroke="hsl(var(--chart-2))" name="Forecast" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <ChartInsight
          explanation="This trend line tracks your actual monthly revenue against AI-powered forecasts to help you understand business trajectory and plan ahead."
          insight="Your revenue is trending upward with 48% growth from January (£4,200) to June (£6,200), consistently beating forecasts by 3-5%."
          callToAction="Based on this growth trend, set a £7,000 revenue target for July and increase marketing efforts to maintain momentum."
          onActionClick={() => console.log("Set revenue target")}
        />
      </div>

      {/* User Selected Charts */}
      {dashboardCharts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-semibold">Your Dashboard Charts</h2>
            <p className="text-sm text-muted-foreground">
              Charts selected for quick access • {dashboardCharts.length} active
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboardCharts.map(chartId => renderChart(chartId))}
          </div>
        </div>
      )}

      {/* AI Insights Section */}
      <div className="mt-8">
        <AIInsights
          businessType={businessType}
          location={userProfile.location}
          currentRate={userProfile.targetHourlyRate}
          services={userProfile.specializations}
        />
      </div>
    </div>
  );
}