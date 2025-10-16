import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { businessTypes, BusinessType } from "@/components/BusinessTypeSelector";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getCurrentUserId } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { CURRENCIES, type Currency } from "@shared/currency";
import { 
  User, 
  Building2, 
  MapPin, 
  Phone, 
  Mail,
  Target,
  DollarSign,
  Clock,
  Settings,
  Bell,
  Zap,
  Wrench,
  Hammer,
  Wind
} from "lucide-react";

interface BusinessProfile {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  serviceArea: string;
  businessType: string;
  specializations: string[];
  targetHourlyRate: number;
  monthlyRevenueGoal: number;
  weeklyHoursTarget: number;
  notifications: {
    competitorAlerts: boolean;
    insightDigest: boolean;
    jobReminders: boolean;
    marketingTips: boolean;
  };
}

// Get current business type and available specializations
const getCurrentBusinessType = (typeId: string): BusinessType | null => {
  return businessTypes.find(type => type.id === typeId) || null;
};

const getBusinessTypeIcon = (typeId: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    electrical: Zap,
    plumbing: Wrench,
    carpentry: Hammer,
    hvac: Wind,
    building: Hammer,
    painting: Settings,
    roofing: Settings,
    landscaping: Settings,
    handyman: Settings,
    glazing: Settings,
    flooring: Settings,
    security: Settings
  };
  return iconMap[typeId] || Settings;
};

export default function Profile() {
  const { businessType, setBusinessType, userProfile, updateProfile } = useBusinessContext();
  const userId = getCurrentUserId();
  const { toast } = useToast();
  
  // Fetch user data from API
  const { data: userData } = useQuery<{ preferredCurrency: Currency }>({
    queryKey: [`/api/user/${userId}`],
  });
  
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('GBP');
  
  // Update selected currency when data loads
  if (userData?.preferredCurrency && selectedCurrency !== userData.preferredCurrency) {
    setSelectedCurrency(userData.preferredCurrency as Currency);
  }
  
  // Currency update mutation
  const updateCurrencyMutation = useMutation({
    mutationFn: async (currency: Currency) => {
      const response = await apiRequest("PUT", `/api/user/${userId}/profile`, {
        preferredCurrency: currency,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Currency Updated",
        description: "Your preferred currency has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update currency preference.",
        variant: "destructive",
      });
    },
  });
  
  // Only local state for editing mode and notifications (not in context)
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState({
    competitorAlerts: true,
    insightDigest: true,
    jobReminders: false,
    marketingTips: true,
  });

  const handleInputChange = (field: keyof typeof userProfile, value: any) => {
    updateProfile({ [field]: value });
  };

  const handleNotificationChange = (field: keyof typeof notifications, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  const currentBusinessType = getCurrentBusinessType(businessType);
  const availableSpecializations = currentBusinessType?.specializations || [];
  const BusinessTypeIcon = getBusinessTypeIcon(businessType);

  const handleAddSpecialization = (specialization: string) => {
    if (!userProfile.specializations.includes(specialization)) {
      const newSpecializations = [...userProfile.specializations, specialization];
      updateProfile({ specializations: newSpecializations });
    }
  };

  const handleBusinessTypeChange = (newBusinessType: string) => {
    const businessTypeData = getCurrentBusinessType(newBusinessType);
    const newRate = businessTypeData?.avgHourlyRate || userProfile.targetHourlyRate;
    
    setBusinessType(newBusinessType);
    updateProfile({
      targetHourlyRate: newRate,
      specializations: [] // Clear specializations when changing business type
    });
  };

  const handleRemoveSpecialization = (specialization: string) => {
    const newSpecializations = userProfile.specializations.filter(s => s !== specialization);
    updateProfile({ specializations: newSpecializations });
  };

  const handleSave = () => {
    console.log("Saving profile:", userProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    console.log("Cancel editing profile");
    setIsEditing(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Business Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your business information and preferences
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} data-testid="button-cancel-profile">
                Cancel
              </Button>
              <Button onClick={handleSave} data-testid="button-save-profile">
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} data-testid="button-edit-profile">
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {userProfile.ownerName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-heading font-semibold" data-testid="text-owner-name">
                  {userProfile.ownerName}
                </h3>
                <p className="text-sm text-muted-foreground">{userProfile.businessName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <BusinessTypeIcon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {currentBusinessType?.name || "Trade Business"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{userProfile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{userProfile.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{userProfile.address}</span>
              </div>
            </div>

            {/* Goals */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-foreground">Current Goals</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Target Rate:</span>
                  <span className="font-medium">£{userProfile.targetHourlyRate}/hour</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Monthly Goal:</span>
                  <span className="font-medium">£{userProfile.monthlyRevenueGoal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Weekly Hours:</span>
                  <span className="font-medium">{userProfile.weeklyHoursTarget}h</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Business Details
            </CardTitle>
            <CardDescription>
              Update your business information and service preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={userProfile.businessName}
                  onChange={(e) => handleInputChange("businessName", e.target.value)}
                  disabled={!isEditing}
                  data-testid="input-business-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input
                  id="ownerName"
                  value={userProfile.ownerName}
                  onChange={(e) => handleInputChange("ownerName", e.target.value)}
                  disabled={!isEditing}
                  data-testid="input-owner-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!isEditing}
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={userProfile.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={!isEditing}
                  data-testid="input-phone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Textarea
                id="address"
                value={userProfile.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                disabled={!isEditing}
                data-testid="input-address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceArea">Service Area</Label>
              <Input
                id="serviceArea"
                placeholder="e.g., Greater Manchester, 20-mile radius"
                value={userProfile.serviceArea}
                onChange={(e) => handleInputChange("serviceArea", e.target.value)}
                disabled={!isEditing}
                data-testid="input-service-area"
              />
            </div>

            {/* Business Type */}
            <div className="space-y-2">
              <Label>Business Type</Label>
              <Select 
                value={businessType} 
                onValueChange={handleBusinessTypeChange}
                disabled={!isEditing}
              >
                <SelectTrigger data-testid="select-business-type">
                  <div className="flex items-center gap-2">
                    <BusinessTypeIcon className="w-4 h-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{type.name}</span>
                          <Badge variant="secondary" className="text-xs ml-auto">
                            £{type.avgHourlyRate}/hr
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {currentBusinessType && (
                <p className="text-xs text-muted-foreground">
                  Industry average: £{currentBusinessType.avgHourlyRate}/hour • {currentBusinessType.description}
                </p>
              )}
            </div>

            {/* Specializations */}
            <div className="space-y-3">
              <Label>Specializations</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {userProfile.specializations.map((spec) => (
                  <Badge key={spec} variant="secondary" className="gap-1">
                    {spec}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveSpecialization(spec)}
                        className="text-muted-foreground hover:text-foreground"
                        data-testid={`button-remove-spec-${spec.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        ×
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              {isEditing && (
                <Select onValueChange={handleAddSpecialization}>
                  <SelectTrigger data-testid="select-add-specialization">
                    <SelectValue placeholder="Add specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSpecializations
                      .filter(spec => !userProfile.specializations.includes(spec))
                      .map(spec => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Business Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Target className="w-5 h-5" />
              Business Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetRate" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Target Hourly Rate
              </Label>
              <Input
                id="targetRate"
                type="number"
                min="0"
                step="0.50"
                value={userProfile.targetHourlyRate}
                onChange={(e) => handleInputChange("targetHourlyRate", parseFloat(e.target.value))}
                disabled={!isEditing}
                data-testid="input-target-rate"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyGoal" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Monthly Revenue Goal
              </Label>
              <Input
                id="monthlyGoal"
                type="number"
                min="0"
                step="100"
                value={userProfile.monthlyRevenueGoal}
                onChange={(e) => handleInputChange("monthlyRevenueGoal", parseInt(e.target.value))}
                disabled={!isEditing}
                data-testid="input-monthly-goal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weeklyHours" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Weekly Hours Target
              </Label>
              <Input
                id="weeklyHours"
                type="number"
                min="0"
                max="168"
                value={userProfile.weeklyHoursTarget}
                onChange={(e) => handleInputChange("weeklyHoursTarget", parseInt(e.target.value))}
                disabled={!isEditing}
                data-testid="input-weekly-hours"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Preferred Currency
              </Label>
              <Select 
                value={selectedCurrency} 
                onValueChange={(value) => {
                  setSelectedCurrency(value as Currency);
                  updateCurrencyMutation.mutate(value as Currency);
                }}
                disabled={!isEditing}
              >
                <SelectTrigger data-testid="select-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CURRENCIES).map(([code, info]) => (
                    <SelectItem key={code} value={code} data-testid={`option-currency-${code}`}>
                      {info.symbol} {info.name} ({code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Used for subscription pricing and financial reports
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Control what notifications you receive from trackd
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Competitor Alerts</div>
                <div className="text-sm text-muted-foreground">
                  Get notified when competitors change their pricing
                </div>
              </div>
              <Switch
                checked={notifications.competitorAlerts}
                onCheckedChange={(checked) => handleNotificationChange("competitorAlerts", checked)}
                disabled={!isEditing}
                data-testid="switch-competitor-alerts"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Weekly Insight Digest</div>
                <div className="text-sm text-muted-foreground">
                  Receive a weekly summary of business insights and recommendations
                </div>
              </div>
              <Switch
                checked={notifications.insightDigest}
                onCheckedChange={(checked) => handleNotificationChange("insightDigest", checked)}
                disabled={!isEditing}
                data-testid="switch-insight-digest"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Job Reminders</div>
                <div className="text-sm text-muted-foreground">
                  Reminders for upcoming jobs and follow-ups
                </div>
              </div>
              <Switch
                checked={notifications.jobReminders}
                onCheckedChange={(checked) => handleNotificationChange("jobReminders", checked)}
                disabled={!isEditing}
                data-testid="switch-job-reminders"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Marketing Tips</div>
                <div className="text-sm text-muted-foreground">
                  Receive tips and strategies to grow your business
                </div>
              </div>
              <Switch
                checked={notifications.marketingTips}
                onCheckedChange={(checked) => handleNotificationChange("marketingTips", checked)}
                disabled={!isEditing}
                data-testid="switch-marketing-tips"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}