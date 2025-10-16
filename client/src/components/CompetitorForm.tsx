import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, MapPin, Globe, Phone, FileText, DollarSign } from "lucide-react";

interface CompetitorFormData {
  businessName: string;
  location: string;
  servicesOffered: string[];
  websiteUrl: string;
  phone: string;
  notes: string;
  emergencyCallRate: string;
  standardHourlyRate: string;
  callOutFee: string;
}

interface CompetitorFormProps {
  onSubmit?: (data: CompetitorFormData) => void;
  onCancel?: () => void;
}

const serviceOptions = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Painting",
  "General Contracting",
  "Other",
];

export default function CompetitorForm({ onSubmit, onCancel }: CompetitorFormProps) {
  const [formData, setFormData] = useState<CompetitorFormData>({
    businessName: "",
    location: "",
    servicesOffered: [],
    websiteUrl: "",
    phone: "",
    notes: "",
    emergencyCallRate: "",
    standardHourlyRate: "",
    callOutFee: "",
  });

  const handleInputChange = (field: keyof CompetitorFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      servicesOffered: prev.servicesOffered.includes(service)
        ? prev.servicesOffered.filter(s => s !== service)
        : [...prev.servicesOffered, service],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.businessName.trim() || !formData.location.trim()) {
      return; // Business name and location are required
    }
    
    onSubmit?.(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Business Name */}
      <div className="space-y-2">
        <Label htmlFor="businessName" className="flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Business Name *
        </Label>
        <Input
          id="businessName"
          placeholder="e.g., Manchester Plumbing Services"
          value={formData.businessName}
          onChange={(e) => handleInputChange("businessName", e.target.value)}
          required
          data-testid="input-competitor-name"
        />
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location" className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Location *
        </Label>
        <Input
          id="location"
          placeholder="e.g., Manchester, UK"
          value={formData.location}
          onChange={(e) => handleInputChange("location", e.target.value)}
          required
          data-testid="input-competitor-location"
        />
      </div>

      {/* Services Offered */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Services Offered</Label>
        <div className="grid grid-cols-2 gap-3">
          {serviceOptions.map((service) => (
            <div key={service} className="flex items-center space-x-2">
              <Checkbox
                id={`service-${service}`}
                checked={formData.servicesOffered.includes(service)}
                onCheckedChange={() => handleServiceToggle(service)}
                data-testid={`checkbox-service-${service.toLowerCase().replace(/\s+/g, '-')}`}
              />
              <label
                htmlFor={`service-${service}`}
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {service}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Website and Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="websiteUrl" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Website URL
          </Label>
          <Input
            id="websiteUrl"
            type="url"
            placeholder="https://example.com"
            value={formData.websiteUrl}
            onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
            data-testid="input-competitor-website"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="07123 456789"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            data-testid="input-competitor-phone"
          />
        </div>
      </div>

      {/* Pricing Section */}
      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Pricing Information (Optional)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyCallRate">Emergency Call Rate (£)</Label>
            <Input
              id="emergencyCallRate"
              type="number"
              step="0.01"
              placeholder="65.00"
              value={formData.emergencyCallRate}
              onChange={(e) => handleInputChange("emergencyCallRate", e.target.value)}
              data-testid="input-competitor-emergency-rate"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="standardHourlyRate">Standard Hourly Rate (£)</Label>
            <Input
              id="standardHourlyRate"
              type="number"
              step="0.01"
              placeholder="55.00"
              value={formData.standardHourlyRate}
              onChange={(e) => handleInputChange("standardHourlyRate", e.target.value)}
              data-testid="input-competitor-hourly-rate"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="callOutFee">Call-out Fee (£)</Label>
            <Input
              id="callOutFee"
              type="number"
              step="0.01"
              placeholder="40.00"
              value={formData.callOutFee}
              onChange={(e) => handleInputChange("callOutFee", e.target.value)}
              data-testid="input-competitor-callout-fee"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Notes
        </Label>
        <Textarea
          id="notes"
          placeholder="Any additional notes about this competitor..."
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          rows={3}
          data-testid="textarea-competitor-notes"
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 justify-end pt-4">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            data-testid="button-cancel-competitor"
          >
            Cancel
          </Button>
        )}
        <Button type="submit" data-testid="button-submit-competitor">
          Add Competitor
        </Button>
      </div>
    </form>
  );
}
