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
  Bell
} from "lucide-react";

interface BusinessProfile {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  serviceArea: string;
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

const tradeSpecializations = [
  "Plumbing Repairs",
  "Emergency Plumbing", 
  "Bathroom Installation",
  "Kitchen Plumbing",
  "Boiler Service",
  "Drain Cleaning",
  "Pipe Installation",
  "Water Heater Service",
  "Leak Detection",
  "General Maintenance",
];

export default function Profile() {
  const [profile, setProfile] = useState<BusinessProfile>({
    businessName: "Manchester Plumbing Pro",
    ownerName: "John Smith",
    email: "john@plumbingpro.co.uk",
    phone: "0161 123 4567",
    address: "45 Trade Street, Manchester, M1 2AB",
    serviceArea: "Greater Manchester",
    specializations: ["Emergency Plumbing", "Bathroom Installation", "Boiler Service"],
    targetHourlyRate: 55,
    monthlyRevenueGoal: 8000,
    weeklyHoursTarget: 35,
    notifications: {
      competitorAlerts: true,
      insightDigest: true,
      jobReminders: false,
      marketingTips: true,
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field: keyof BusinessProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: keyof BusinessProfile['notifications'], value: boolean) => {
    setProfile(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value }
    }));
  };

  const handleAddSpecialization = (specialization: string) => {
    if (!profile.specializations.includes(specialization)) {
      setProfile(prev => ({
        ...prev,
        specializations: [...prev.specializations, specialization]
      }));
    }
  };

  const handleRemoveSpecialization = (specialization: string) => {
    setProfile(prev => ({
      ...prev,
      specializations: prev.specializations.filter(s => s !== specialization)
    }));
  };

  const handleSave = () => {
    console.log("Saving profile:", profile);
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
                  {profile.ownerName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-heading font-semibold" data-testid="text-owner-name">
                  {profile.ownerName}
                </h3>
                <p className="text-sm text-muted-foreground">{profile.businessName}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{profile.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{profile.address}</span>
              </div>
            </div>

            {/* Goals */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-foreground">Current Goals</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Target Rate:</span>
                  <span className="font-medium">£{profile.targetHourlyRate}/hour</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Monthly Goal:</span>
                  <span className="font-medium">£{profile.monthlyRevenueGoal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Weekly Hours:</span>
                  <span className="font-medium">{profile.weeklyHoursTarget}h</span>
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
                  value={profile.businessName}
                  onChange={(e) => handleInputChange("businessName", e.target.value)}
                  disabled={!isEditing}
                  data-testid="input-business-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input
                  id="ownerName"
                  value={profile.ownerName}
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
                  value={profile.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!isEditing}
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
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
                value={profile.address}
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
                value={profile.serviceArea}
                onChange={(e) => handleInputChange("serviceArea", e.target.value)}
                disabled={!isEditing}
                data-testid="input-service-area"
              />
            </div>

            {/* Specializations */}
            <div className="space-y-3">
              <Label>Specializations</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {profile.specializations.map((spec) => (
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
                    {tradeSpecializations
                      .filter(spec => !profile.specializations.includes(spec))
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
                value={profile.targetHourlyRate}
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
                value={profile.monthlyRevenueGoal}
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
                value={profile.weeklyHoursTarget}
                onChange={(e) => handleInputChange("weeklyHoursTarget", parseInt(e.target.value))}
                disabled={!isEditing}
                data-testid="input-weekly-hours"
              />
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
                checked={profile.notifications.competitorAlerts}
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
                checked={profile.notifications.insightDigest}
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
                checked={profile.notifications.jobReminders}
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
                checked={profile.notifications.marketingTips}
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