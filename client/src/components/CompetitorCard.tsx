import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Building2, MapPin, Phone, Globe } from "lucide-react";

interface CompetitorCardProps {
  name: string;
  location: string;
  services: string[];
  averageRate: number;
  yourRate: number;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  onViewDetails?: () => void;
  className?: string;
}

export default function CompetitorCard({
  name,
  location,
  services,
  averageRate,
  yourRate,
  phone,
  website,
  rating,
  reviewCount,
  onViewDetails,
  className = "",
}: CompetitorCardProps) {
  const rateDifference = yourRate - averageRate;
  const isHigher = rateDifference > 0;
  const differencePercent = Math.abs((rateDifference / averageRate) * 100);

  const handleViewDetails = () => {
    console.log(`View details for ${name}`);
    onViewDetails?.();
  };

  return (
    <Card className={`hover-elevate ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              {name}
            </CardTitle>
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {location}
            </div>
          </div>
          {rating && (
            <div className="text-right">
              <div className="text-lg font-bold text-chart-1">{rating}</div>
              <div className="text-xs text-muted-foreground">
                {reviewCount} reviews
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Services */}
        <div>
          <div className="text-sm font-medium text-foreground mb-2">Services</div>
          <div className="flex flex-wrap gap-1">
            {services.slice(0, 3).map((service) => (
              <Badge key={service} variant="secondary" className="text-xs">
                {service}
              </Badge>
            ))}
            {services.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{services.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Comparison */}
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Average Rate</span>
            <span className="font-bold">£{averageRate}/hr</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Your Rate</span>
            <span className="font-medium">£{yourRate}/hr</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Difference</span>
            <div className={`flex items-center gap-1 font-medium text-sm ${
              isHigher ? "text-chart-1" : "text-destructive"
            }`}>
              {isHigher ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {isHigher ? "+" : "-"}£{Math.abs(rateDifference).toFixed(0)} ({differencePercent.toFixed(1)}%)
            </div>
          </div>
        </div>

        {/* Contact Info */}
        {(phone || website) && (
          <div className="flex gap-2 text-sm">
            {phone && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Phone className="w-4 h-4" />
                {phone}
              </div>
            )}
            {website && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Globe className="w-4 h-4" />
                Website
              </div>
            )}
          </div>
        )}

        {/* Action */}
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleViewDetails}
          data-testid={`button-view-competitor-${name.toLowerCase().replace(/\s+/g, '-')}`}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}