import DashboardCard from "@/components/DashboardCard";
import InsightCard from "@/components/InsightCard";
import ChartContainer from "@/components/ChartContainer";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Clock, 
  Users, 
  TrendingUp, 
  Calendar,
  Target,
  RefreshCw
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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

export default function Dashboard() {
  const handleRefreshData = () => {
    console.log("Refreshing dashboard data...");
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
          <Button data-testid="button-add-job">
            Add New Job
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Monthly Revenue"
          value="£6,240"
          subtitle="This month"
          icon={DollarSign}
          trend={{ value: "12.5%", isPositive: true }}
        />
        <DashboardCard
          title="Hours Worked"
          value="142"
          subtitle="This month"
          icon={Clock}
          trend={{ value: "8.2%", isPositive: true }}
        />
        <DashboardCard
          title="Active Customers"
          value="18"
          subtitle="Regular clients"
          icon={Users}
          trend={{ value: "2", isPositive: true }}
        />
        <DashboardCard
          title="Avg. Hourly Rate"
          value="£52.50"
          subtitle="This month"
          icon={TrendingUp}
          trend={{ value: "3.2%", isPositive: true }}
        />
      </div>

      {/* Top Insights */}
      <div>
        <h2 className="text-xl font-heading font-semibold mb-4">Top Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <InsightCard
            type="pricing"
            priority="high"
            title="Emergency Rate Below Market"
            description="You're charging £5/hour less than competitors for emergency calls"
            impact="£850 additional monthly revenue"
            action="Increase Emergency Rate to £70/hour"
          />
          <InsightCard
            type="customer"
            priority="medium"
            title="Focus on High-Value Customers"
            description="Sarah M. generates 40% more revenue per hour than average"
            impact="Strengthen key relationship"
            action="Schedule Follow-up Meeting"
          />
          <InsightCard
            type="efficiency"
            priority="low"
            title="Peak Season Opportunity"
            description="Winter months show 25% higher demand for emergency services"
            impact="Plan resource allocation"
            action="Review Winter Availability"
          />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Efficiency Matrix */}
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

        {/* Competitor Pricing */}
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

        {/* Customer Lifetime Value */}
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

        {/* Resource Utilization */}
        <ChartContainer
          title="Resource Utilization by Job Type"
          description="Time and revenue breakdown"
          className="lg:col-span-2"
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
      </div>
    </div>
  );
}