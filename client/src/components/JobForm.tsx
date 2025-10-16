import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarDays, Check, ChevronsUpDown, Clock, DollarSign, User, UserPlus, Wrench } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { businessTypes } from "./BusinessTypeSelector";
import { useBusinessContext } from "@/contexts/BusinessContext";
import CustomerForm from "./CustomerForm";
import type { Customer } from "@shared/schema";

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

// Get job types based on business type
const getJobTypesForBusiness = (businessType: string) => {
  const business = businessTypes.find(b => b.id === businessType);
  return business?.specializations || [
    "Emergency Call-out",
    "Installation",
    "Repair", 
    "Maintenance",
    "Consultation",
    "Other"
  ];
};

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
  const { businessType, getCurrentBusiness } = useBusinessContext();
  const currentBusiness = getCurrentBusiness();
  const userId = currentBusiness?.id || "test-user-plumber"; // TODO: Get from auth
  
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

  // Customer autocomplete state
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearchValue, setCustomerSearchValue] = useState("");
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  const [addAsNewCustomer, setAddAsNewCustomer] = useState(false);

  // Fetch customers for autocomplete
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: [`/api/customers/${userId}`],
  });

  const handleInputChange = (field: keyof JobFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerSelect = (customerName: string) => {
    setFormData(prev => ({ ...prev, customerName }));
    setCustomerSearchValue(customerName);
    setCustomerSearchOpen(false);
  };

  const handleNewCustomerCreated = (customerData: any) => {
    setFormData(prev => ({ ...prev, customerName: customerData.name }));
    setCustomerSearchValue(customerData.name);
    setShowNewCustomerDialog(false);
    setAddAsNewCustomer(false);
  };

  const jobTypesForBusiness = getJobTypesForBusiness(businessType);

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
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Name
              </Label>
              
              {addAsNewCustomer ? (
                <Input
                  placeholder="Enter new customer name"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange("customerName", e.target.value)}
                  data-testid="input-new-customer-name"
                  required
                />
              ) : (
                <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={customerSearchOpen}
                      className="w-full justify-between"
                      data-testid="button-customer-search"
                    >
                      {formData.customerName || "Select customer..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput 
                        placeholder="Search customers..." 
                        value={customerSearchValue}
                        onValueChange={setCustomerSearchValue}
                      />
                      <CommandList>
                        <CommandEmpty>No customer found.</CommandEmpty>
                        <CommandGroup>
                          {customers
                            .filter(customer => 
                              customer.name.toLowerCase().includes(customerSearchValue.toLowerCase())
                            )
                            .map((customer) => (
                              <CommandItem
                                key={customer.id}
                                value={customer.name}
                                onSelect={() => handleCustomerSelect(customer.name)}
                                data-testid={`option-customer-${customer.id}`}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    formData.customerName === customer.name ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                                <div className="flex flex-col">
                                  <span>{customer.name}</span>
                                  {customer.email && (
                                    <span className="text-xs text-muted-foreground">{customer.email}</span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
              
              <div className="flex items-center space-x-2 pt-1">
                <Checkbox 
                  id="addNewCustomer" 
                  checked={addAsNewCustomer}
                  onCheckedChange={(checked) => {
                    setAddAsNewCustomer(checked as boolean);
                    if (checked) {
                      setFormData(prev => ({ ...prev, customerName: "" }));
                      setCustomerSearchValue("");
                    }
                  }}
                  data-testid="checkbox-add-new-customer"
                />
                <Label 
                  htmlFor="addNewCustomer" 
                  className="text-sm font-normal cursor-pointer flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  Add as new customer
                </Label>
              </div>
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
                  {jobTypesForBusiness.map(type => (
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