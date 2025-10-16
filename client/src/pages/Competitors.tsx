import CompetitorCard from "@/components/CompetitorCard";
import CompetitorForm from "@/components/CompetitorForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, MapPin, TrendingUp, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getCurrentUserId } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { Competitor } from "@shared/schema";

// Mock competitor data - TODO: remove mock functionality
const mockCompetitors = [
  {
    id: "1",
    name: "Elite Plumbing Services",
    location: "Central Manchester", 
    services: ["Emergency Plumbing", "Bathroom Installation", "Boiler Repair", "Pipe Fitting"],
    averageRate: 65,
    phone: "0161 123 4567",
    website: "www.eliteplumbing.co.uk",
    rating: 4.8,
    reviewCount: 147,
  },
  {
    id: "2",
    name: "Quick Fix Handyman",
    location: "North Manchester",
    services: ["General Repairs", "Electrical Work", "Plumbing", "Maintenance"],
    averageRate: 45,
    phone: "0161 987 6543", 
    rating: 4.2,
    reviewCount: 89,
  },
  {
    id: "3",
    name: "Premium Home Solutions",
    location: "South Manchester",
    services: ["HVAC Installation", "Kitchen Renovation", "Bathroom Design", "Emergency Service"],
    averageRate: 75,
    website: "www.premiumhome.co.uk",
    rating: 4.9,
    reviewCount: 203,
  },
  {
    id: "4",
    name: "City Maintenance Co",
    location: "East Manchester", 
    services: ["Plumbing Repairs", "Heating Systems", "Drain Cleaning"],
    averageRate: 52,
    phone: "0161 456 7890",
    rating: 4.1,
    reviewCount: 67,
  },
  {
    id: "5",
    name: "ProTrades Manchester",
    location: "West Manchester",
    services: ["Multi-Trade", "Emergency Callout", "Property Maintenance", "Gas Safety"],
    averageRate: 68,
    website: "www.protrades.co.uk",
    rating: 4.6,
    reviewCount: 134,
  },
];

export default function Competitors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const userId = getCurrentUserId();
  const { toast } = useToast();
  const yourAverageRate = 55; // TODO: Calculate from actual job data

  // Fetch competitors from API
  const { data: competitors = [], isLoading } = useQuery<Competitor[]>({
    queryKey: [`/api/competitors/${userId}`],
  });

  const filteredCompetitors = competitors
    .filter(comp => {
      const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ((comp.services ?? []) as string[]).some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLocation = locationFilter === "all" || (comp.location && comp.location.toLowerCase().includes(locationFilter));
      return matchesSearch && matchesLocation;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (parseFloat(b.rating as any ?? "0") - parseFloat(a.rating as any ?? "0"));
        case "rate":
          return (parseFloat(b.hourlyRate as any ?? "0") - parseFloat(a.hourlyRate as any ?? "0"));
        case "reviews":
          return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
        default:
          return 0;
      }
    });

  // Create competitor mutation
  const createCompetitorMutation = useMutation({
    mutationFn: async (competitorData: any) => {
      const response = await apiRequest("POST", `/api/competitors/${userId}`, {
        name: competitorData.businessName,
        location: competitorData.location,
        services: competitorData.servicesOffered,
        website: competitorData.websiteUrl || null,
        phone: competitorData.phone || null,
        notes: competitorData.notes || null,
        emergencyCalloutFee: competitorData.emergencyCallRate ? parseFloat(competitorData.emergencyCallRate) : null,
        hourlyRate: competitorData.standardHourlyRate ? parseFloat(competitorData.standardHourlyRate) : null,
        calloutFee: competitorData.callOutFee ? parseFloat(competitorData.callOutFee) : null,
        isActive: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/competitors/${userId}`] });
      toast({
        title: "Success",
        description: "Competitor added successfully",
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add competitor",
        variant: "destructive",
      });
      console.error("Error creating competitor:", error);
    },
  });

  const handleAddCompetitor = () => {
    setIsDialogOpen(true);
  };

  const handleSubmitCompetitor = (competitorData: any) => {
    createCompetitorMutation.mutate(competitorData);
  };

  const handleDiscoverCompetitors = () => {
    console.log("Auto-discover competitors");
  };

  // Market analysis
  const avgMarketRate = competitors.length > 0
    ? competitors.reduce((sum, comp) => sum + parseFloat(comp.hourlyRate as any ?? "0"), 0) / competitors.length
    : 0;
  const competitorsAboveYou = competitors.filter(comp => parseFloat(comp.hourlyRate as any ?? "0") > yourAverageRate).length;
  const competitorsBelowYou = competitors.filter(comp => parseFloat(comp.hourlyRate as any ?? "0") < yourAverageRate).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Competitors
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor local competition and market positioning
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDiscoverCompetitors} data-testid="button-discover-competitors">
            <Search className="w-4 h-4 mr-2" />
            Auto-Discover
          </Button>
          <Button onClick={handleAddCompetitor} data-testid="button-add-competitor">
            <Plus className="w-4 h-4 mr-2" />
            Add Competitor
          </Button>
        </div>
      </div>

      {/* Market Analysis Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Market Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              £{avgMarketRate.toFixed(0)}/hr
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {competitors.length} competitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Your Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              £{yourAverageRate}/hr
            </div>
            <p className={`text-xs mt-1 ${yourAverageRate > avgMarketRate ? 'text-chart-1' : 'text-destructive'}`}>
              {yourAverageRate > avgMarketRate ? 'Above' : 'Below'} market average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Higher Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {competitorsAboveYou}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Competitors charge more
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Price Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">
              2
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Recent rate changes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading">Find Competitors</CardTitle>
          <CardDescription>
            Search and filter competitors by location, services, or ratings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-competitors"
              />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-location-filter">
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="central">Central Manchester</SelectItem>
                <SelectItem value="north">North Manchester</SelectItem>
                <SelectItem value="south">South Manchester</SelectItem>
                <SelectItem value="east">East Manchester</SelectItem>
                <SelectItem value="west">West Manchester</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[140px]" data-testid="select-sort-by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Sort by Rating</SelectItem>
                <SelectItem value="rate">Sort by Rate</SelectItem>
                <SelectItem value="reviews">Sort by Reviews</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Competitors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompetitors.map((competitor) => (
          <CompetitorCard
            key={competitor.id}
            name={competitor.name}
            location={competitor.location ?? "Unknown"}
            services={((competitor.services ?? []) as string[])}
            averageRate={parseFloat(competitor.hourlyRate as any ?? "0")}
            yourRate={yourAverageRate}
            phone={competitor.phone}
            website={competitor.website}
            rating={parseFloat(competitor.rating as any ?? "0")}
            reviewCount={competitor.reviewCount ?? 0}
            onViewDetails={() => console.log(`View details for ${competitor.name}`)}
          />
        ))}
      </div>

      {filteredCompetitors.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-heading font-semibold mb-2">No competitors found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || locationFilter !== "all" 
                ? "Try adjusting your search filters"
                : "Add competitors manually or use auto-discovery"}
            </p>
            <Button onClick={handleAddCompetitor}>
              Add Your First Competitor
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Competitor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Competitor</DialogTitle>
          </DialogHeader>
          <CompetitorForm
            onSubmit={handleSubmitCompetitor}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}