import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, DollarSign, User, Wrench } from "lucide-react";

interface JobFormData {
  customerName: string;
  jobType: string;
  description: string;
  revenue: string;
  hours: string;
  expenses: string;
  status: string;
  duration: string;
  date: string;
}

interface JobFormProps {
  onSubmit?: (data: JobFormData) => void;
  onCancel?: () => void;
  className?: string;
}

const jobTypes = [
  "Plumbing Repair",
  "Electrical Installation", 
  "HVAC Maintenance",
  "Emergency Call",
  "Kitchen Renovation",
  "Bathroom Repair",
  "General Maintenance",
  "Consultation",
];

const jobDurations = [
  "Quick Job (< 2 hours)",
  "Day Project (2-8 hours)", 
  "Multi-day (2-5 days)",
  "Weekly Project",
  "Monthly Contract",
];

const jobStatuses = [
  "Quoted",
  "Booked", 
  "In Progress",
  "Completed",
];

export default function JobForm({ onSubmit, onCancel, className = "" }: JobFormProps) {
  const [formData, setFormData] = useState<JobFormData>({
    customerName: "",
    jobType: "",
    description: "",
    revenue: "",
    hours: "",
    expenses: "",
    status: "Quoted",
    duration: "",
    date: new Date().toISOString().split('T')[0],
  });

  const handleInputChange = (field: keyof JobFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Job form submitted:", formData);
    onSubmit?.(formData);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="font-heading">Add New Job</CardTitle>
        <CardDescription>
          Enter job details to track performance and generate insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer & Job Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Name
              </Label>
              <Input
                id="customerName"
                placeholder="e.g., Sarah Matthews"
                value={formData.customerName}
                onChange={(e) => handleInputChange("customerName", e.target.value)}
                data-testid="input-customer-name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Job Type
              </Label>
              <Select value={formData.jobType} onValueChange={(value) => handleInputChange("jobType", value)}>
                <SelectTrigger data-testid="select-job-type">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the work performed..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              data-testid="input-job-description"
            />
          </div>

          {/* Financial Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revenue" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Revenue (£)
              </Label>
              <Input
                id="revenue"
                type="number"
                min="0"
                step="0.01"
                placeholder="450.00"
                value={formData.revenue}
                onChange={(e) => handleInputChange("revenue", e.target.value)}
                data-testid="input-revenue"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Hours Worked
              </Label>
              <Input
                id="hours"
                type="number"
                min="0.1"
                step="0.5"
                placeholder="8.5"
                value={formData.hours}
                onChange={(e) => handleInputChange("hours", e.target.value)}
                data-testid="input-hours"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenses">Expenses (£)</Label>
              <Input
                id="expenses"
                type="number"
                min="0"
                step="0.01"
                placeholder="50.00"
                value={formData.expenses}
                onChange={(e) => handleInputChange("expenses", e.target.value)}
                data-testid="input-expenses"
              />
            </div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Project Duration</Label>
              <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                <SelectTrigger data-testid="select-duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {jobDurations.map(duration => (
                    <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {jobStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                data-testid="input-date"
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" data-testid="button-submit-job">
              Save Job
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                data-testid="button-cancel-job"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}