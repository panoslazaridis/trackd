import CompetitorCard from "@/components/CompetitorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, MapPin, TrendingUp, AlertTriangle } from "lucide-react";
import { useState } from "react";

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
  const [competitors] = useState(mockCompetitors);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const yourAverageRate = 55; // TODO: Calculate from actual job data

  const filteredCompetitors = competitors
    .filter(comp => {
      const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           comp.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLocation = locationFilter === "all" || comp.location.toLowerCase().includes(locationFilter);
      return matchesSearch && matchesLocation;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "rate":
          return b.averageRate - a.averageRate;
        case "reviews":
          return b.reviewCount - a.reviewCount;
        default:
          return 0;
      }
    });

  const handleAddCompetitor = () => {
    console.log("Add new competitor manually");
  };

  const handleDiscoverCompetitors = () => {
    console.log("Auto-discover competitors");
  };

  // Market analysis
  const avgMarketRate = competitors.reduce((sum, comp) => sum + comp.averageRate, 0) / competitors.length;
  const competitorsAboveYou = competitors.filter(comp => comp.averageRate > yourAverageRate).length;
  const competitorsBelowYou = competitors.filter(comp => comp.averageRate < yourAverageRate).length;

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
            location={competitor.location}
            services={competitor.services}
            averageRate={competitor.averageRate}
            yourRate={yourAverageRate}
            phone={competitor.phone}
            website={competitor.website}
            rating={competitor.rating}
            reviewCount={competitor.reviewCount}
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
    </div>
  );
}