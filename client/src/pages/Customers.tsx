import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CustomerForm from "@/components/CustomerForm";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getCurrentUserId } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useBusinessContext } from "@/contexts/BusinessContext";
import type { Customer } from "@shared/schema";
import { 
  Users, 
  Search, 
  Star, 
  DollarSign, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Plus
} from "lucide-react";

const statusConfig = {
  "Active": { color: "bg-chart-1 text-chart-1-foreground", label: "Active" },
  "Inactive": { color: "bg-muted text-muted-foreground", label: "Inactive" },
  "New": { color: "bg-chart-2 text-chart-2-foreground", label: "New" },
};

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const userId = getCurrentUserId();
  const { toast } = useToast();
  const { getCurrentBusiness } = useBusinessContext();
  const currentBusiness = getCurrentBusiness();

  // Fetch customers from API
  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: [`/api/customers/${userId}`],
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    ((customer.preferredServices ?? []) as string[]).some(service => 
      service.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalRevenue = customers.reduce((sum, customer) => sum + parseFloat(customer.totalRevenue ?? "0"), 0);
  const totalJobs = customers.reduce((sum, c) => sum + (c.totalJobs ?? 0), 0);
  const activeCustomers = customers.filter(c => c.status === "Active").length;
  const avgSatisfaction = customers.length > 0 
    ? customers.reduce((sum, customer) => sum + (customer.satisfactionScore ?? 85), 0) / customers.length 
    : 0;
  const avgJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0;

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      const response = await apiRequest("POST", `/api/customers/${userId}`, {
        name: customerData.name,
        email: customerData.email || null,
        phone: customerData.phone || null,
        address: customerData.address || null,
        customerType: customerData.customerType,
        notes: customerData.notes || null,
        totalRevenue: "0",
        totalJobs: 0,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/customers/${userId}`] });
      toast({
        title: "Success",
        description: "Customer added successfully",
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add customer",
        variant: "destructive",
      });
      console.error("Error creating customer:", error);
    },
  });

  const handleAddCustomer = () => {
    setIsDialogOpen(true);
  };

  const handleSubmitCustomer = (customerData: any) => {
    createCustomerMutation.mutate(customerData);
  };

  const handleContactCustomer = (customerId: string, method: 'phone' | 'email') => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    if (method === 'phone') {
      if (customer.phone) {
        // Open phone dialer with customer's phone number
        window.location.href = `tel:${customer.phone}`;
      } else {
        toast({
          title: "No phone number",
          description: `${customer.name} doesn't have a phone number on record.`,
          variant: "destructive",
        });
      }
    } else if (method === 'email') {
      if (customer.email) {
        // Open email client with customer's email
        window.location.href = `mailto:${customer.email}?subject=Follow-up from ${currentBusiness?.name || 'Your Business'}`;
      } else {
        toast({
          title: "No email address",
          description: `${customer.name} doesn't have an email address on record.`,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Customers
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage relationships and track customer value
          </p>
        </div>
        <Button onClick={handleAddCustomer} data-testid="button-add-customer">
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{customers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeCustomers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">£{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Avg. Job Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalJobs > 0 ? `£${Math.round(avgJobValue)}` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per job
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="w-4 h-4" />
              Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{avgSatisfaction.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average score
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search customers by name, email, or services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-customers"
            />
          </div>
        </CardContent>
      </Card>
      {/* Customers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => {
          const statusSettings = statusConfig[(customer.status ?? "New") as keyof typeof statusConfig];
          const daysSinceLastJob = customer.lastJobDate 
            ? Math.floor((new Date().getTime() - new Date(customer.lastJobDate).getTime()) / (1000 * 3600 * 24))
            : null;

          return (
            <Card key={customer.id} className="hover-elevate">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg font-heading" data-testid={`text-customer-name-${customer.id}`}>
                        {customer.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {customer.address}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="whitespace-nowrap inline-flex items-center rounded-md border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover-elevate border-transparent shadow-xs text-xs bg-chart-1 text-[#ffffff]">
                    {statusSettings.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">{customer.totalJobs ?? 0}</div>
                    <div className="text-xs text-muted-foreground">Total Jobs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-chart-1">£{parseFloat(customer.totalRevenue ?? "0").toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Revenue</div>
                  </div>
                </div>

                {/* Satisfaction Score */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Satisfaction</span>
                    <span className="font-medium">{customer.satisfactionScore ?? 85}%</span>
                  </div>
                  <Progress value={customer.satisfactionScore ?? 85} className="h-2" />
                </div>

                {/* Preferred Services */}
                {((customer.preferredServices ?? []) as string[]).length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-foreground mb-2">Preferred Services</div>
                    <div className="flex flex-wrap gap-1">
                      {((customer.preferredServices ?? []) as string[]).map((service) => (
                        <Badge key={service} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Last Job */}
                {daysSinceLastJob !== null && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Last job
                    </span>
                    <span className="font-medium">
                      {daysSinceLastJob === 0 ? "Today" : `${daysSinceLastJob} days ago`}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleContactCustomer(customer.id, 'phone')}
                    data-testid={`button-call-customer-${customer.id}`}
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleContactCustomer(customer.id, 'email')}
                    data-testid={`button-email-customer-${customer.id}`}
                  >
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {filteredCustomers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-heading font-semibold mb-2">No customers found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Start by adding your first customer"}
            </p>
            <Button onClick={handleAddCustomer}>
              Add Your First Customer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Customer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm
            onSubmit={handleSubmitCustomer}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}