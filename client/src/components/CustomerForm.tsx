import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, MapPin, FileText } from "lucide-react";

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  customerType: "new" | "repeat";
  notes: string;
}

interface CustomerFormProps {
  onSubmit?: (data: CustomerFormData) => void;
  onCancel?: () => void;
}

export default function CustomerForm({ onSubmit, onCancel }: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    customerType: "new",
    notes: "",
  });

  const handleInputChange = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return; // Name is required
    }
    
    onSubmit?.(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Customer Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          Customer Name *
        </Label>
        <Input
          id="name"
          placeholder="e.g., Sarah Matthews"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          required
          data-testid="input-customer-name"
        />
      </div>

      {/* Email and Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="customer@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            data-testid="input-customer-email"
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
            data-testid="input-customer-phone"
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address" className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Address
        </Label>
        <Input
          id="address"
          placeholder="123 Oak Street, Manchester"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          data-testid="input-customer-address"
        />
      </div>

      {/* Customer Type */}
      <div className="space-y-2">
        <Label htmlFor="customerType" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          Customer Type
        </Label>
        <Select 
          value={formData.customerType} 
          onValueChange={(value) => handleInputChange("customerType", value)}
        >
          <SelectTrigger data-testid="select-customer-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new" data-testid="option-customer-type-new">New Customer</SelectItem>
            <SelectItem value="repeat" data-testid="option-customer-type-repeat">Repeat Customer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Notes
        </Label>
        <Textarea
          id="notes"
          placeholder="Any additional notes about this customer..."
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          rows={3}
          data-testid="textarea-customer-notes"
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 justify-end pt-4">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            data-testid="button-cancel-customer"
          >
            Cancel
          </Button>
        )}
        <Button type="submit" data-testid="button-submit-customer">
          Add Customer
        </Button>
      </div>
    </form>
  );
}
