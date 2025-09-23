import DashboardCard from '../DashboardCard';
import { DollarSign, Clock, Users, TrendingUp } from 'lucide-react';

export default function DashboardCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      <DashboardCard
        title="Total Revenue"
        value="£45,231"
        subtitle="This month"
        icon={DollarSign}
        trend={{ value: "12.5%", isPositive: true }}
      />
      <DashboardCard
        title="Hours Worked"
        value="187.5"
        subtitle="This month"
        icon={Clock}
        trend={{ value: "8.2%", isPositive: true }}
      />
      <DashboardCard
        title="Active Customers"
        value="24"
        subtitle="Regular clients"
        icon={Users}
        trend={{ value: "2.1%", isPositive: false }}
      />
      <DashboardCard
        title="Hourly Rate"
        value="£45.50"
        subtitle="Average"
        icon={TrendingUp}
        trend={{ value: "5.4%", isPositive: true }}
      />
    </div>
  );
}