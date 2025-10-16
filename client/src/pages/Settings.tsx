import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { CURRENCIES, type Currency, formatPrice } from "@shared/currency";
import { 
  User, 
  Building2, 
  MapPin, 
  Phone, 
  Mail,
  Target,
  DollarSign,
  Clock,
  Settings as SettingsIcon,
  Bell,
  Zap,
  Wrench,
  Hammer,
  Wind,
  CreditCard,
  Check,
  X
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
  currency: Currency;
  notifications: {
    competitorAlerts: boolean;
    insightDigest: boolean;
    jobReminders: boolean;
    marketingTips: boolean;
  };
}

interface TierConfig {
  tierName: string;
  displayName: string;
  pricing: {
    gbp: number;
    eur: number;
    usd: number;
  };
  trialDurationDays?: number;
  maxJobsPerMonth: number | null;
  maxCompetitors: number;
  aiCreditsPerMonth: number;
  insightGenerationSchedule: string;
  insightGenerationTime: string;
  features: {
    advancedAnalytics: boolean;
    competitorAlerts: boolean;
    exportReports: boolean;
    apiAccess: boolean;
    whatsappIntegration: boolean;
    prioritySupport: boolean;
  };
}

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
    painting: SettingsIcon,
    roofing: SettingsIcon,
    landscaping: SettingsIcon,
    handyman: SettingsIcon,
    glazing: SettingsIcon,
    flooring: SettingsIcon,
    security: SettingsIcon
  };
  return iconMap[typeId] || SettingsIcon;
};

function getTierFeatureList(tier: TierConfig): string[] {
  const features: string[] = [];
  
  if (tier.maxJobsPerMonth === null) {
    features.push("Unlimited jobs");
  } else {
    features.push(`${tier.maxJobsPerMonth} jobs per month`);
  }
  
  features.push(`${tier.maxCompetitors} competitors tracked`);
  features.push(`${tier.aiCreditsPerMonth} AI credits`);
  
  const scheduleMap: Record<string, string> = {
    'daily': 'Daily insights',
    'every_3_days': 'Insights every 3 days',
    'weekly': 'Weekly insights',
    'monthly': 'Monthly insights',
  };
  features.push(scheduleMap[tier.insightGenerationSchedule] || 'Regular insights');
  
  if (tier.features.advancedAnalytics) features.push("Advanced analytics");
  if (tier.features.competitorAlerts) features.push("Competitor alerts");
  if (tier.features.exportReports) features.push("Export reports");
  if (tier.features.apiAccess) features.push("API access");
  if (tier.features.whatsappIntegration) features.push("WhatsApp integration");
  if (tier.features.prioritySupport) features.push("Priority support");
  
  return features;
}

export default function Settings() {
  const { businessType, setBusinessType, userProfile, updateProfile } = useBusinessContext();
  const userId = getCurrentUserId();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("business");
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user data from backend
  const { data: userData, isLoading: userLoading } = useQuery<any>({
    queryKey: [`/api/user/${userId}`],
  });

  // Fetch subscription data
  const { data: subscriptionData, isLoading: subLoading } = useQuery<any>({
    queryKey: ["/api/subscription/current"],
  });

  // Fetch tier configurations
  const { data: tiersData, isLoading: tiersLoading } = useQuery<any>({
    queryKey: ["/api/config/tiers"],
  });

  const [formData, setFormData] = useState<BusinessProfile>({
    businessName: userProfile.businessName,
    ownerName: userProfile.ownerName,
    email: userProfile.email,
    phone: userProfile.phone,
    address: userProfile.address,
    serviceArea: userProfile.serviceArea,
    businessType: businessType,
    specializations: userProfile.specializations,
    targetHourlyRate: userProfile.targetHourlyRate,
    monthlyRevenueGoal: userProfile.monthlyRevenueGoal,
    weeklyHoursTarget: userProfile.weeklyHoursTarget,
    currency: 'GBP',
    notifications: {
      competitorAlerts: true,
      insightDigest: true,
      jobReminders: false,
      marketingTips: true,
    }
  });

  // Synchronize form data when userData or userProfile changes
  useEffect(() => {
    if (userData || userProfile) {
      setFormData(prev => ({
        ...prev,
        businessName: userProfile.businessName,
        ownerName: userProfile.ownerName,
        email: userProfile.email,
        phone: userProfile.phone,
        address: userProfile.address,
        serviceArea: userProfile.serviceArea,
        businessType: businessType,
        specializations: userProfile.specializations,
        targetHourlyRate: userProfile.targetHourlyRate,
        monthlyRevenueGoal: userProfile.monthlyRevenueGoal,
        weeklyHoursTarget: userProfile.weeklyHoursTarget,
        currency: (userData?.currency as Currency) || prev.currency,
        notifications: userData?.notifications || prev.notifications
      }));
    }
  }, [userData, userProfile, businessType]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<BusinessProfile>) => {
      return await apiRequest('PUT', `/api/user/${userId}/profile`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${userId}`] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfile({
      businessName: formData.businessName,
      ownerName: formData.ownerName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      serviceArea: formData.serviceArea,
      specializations: formData.specializations,
      targetHourlyRate: formData.targetHourlyRate,
      monthlyRevenueGoal: formData.monthlyRevenueGoal,
      weeklyHoursTarget: formData.weeklyHoursTarget,
    });
    
    setBusinessType(formData.businessType);

    updateProfileMutation.mutate({
      businessName: formData.businessName,
      ownerName: formData.ownerName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      serviceArea: formData.serviceArea,
      businessType: formData.businessType,
      specializations: formData.specializations,
      targetHourlyRate: formData.targetHourlyRate,
      monthlyRevenueGoal: formData.monthlyRevenueGoal,
      weeklyHoursTarget: formData.weeklyHoursTarget,
      currency: formData.currency,
      notifications: formData.notifications
    });
  };

  const handleCancel = () => {
    setFormData({
      businessName: userProfile.businessName,
      ownerName: userProfile.ownerName,
      email: userProfile.email,
      phone: userProfile.phone,
      address: userProfile.address,
      serviceArea: userProfile.serviceArea,
      businessType: businessType,
      specializations: userProfile.specializations,
      targetHourlyRate: userProfile.targetHourlyRate,
      monthlyRevenueGoal: userProfile.monthlyRevenueGoal,
      weeklyHoursTarget: userProfile.weeklyHoursTarget,
      currency: (userData?.currency as Currency) || 'GBP',
      notifications: userData?.notifications || formData.notifications
    });
    setIsEditing(false);
  };

  const currentBusiness = getCurrentBusinessType(formData.businessType);
  const BusinessIcon = getBusinessTypeIcon(formData.businessType);

  const currentTier = subscriptionData?.tier || "trial";
  const currency = formData.currency;
  const tiers = tiersData?.tiers || [];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-settings-title">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account, business profile, and subscription</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
            <TabsTrigger value="business" data-testid="tab-business">
              <Building2 className="w-4 h-4 mr-2" />
              Business Profile
            </TabsTrigger>
            <TabsTrigger value="account" data-testid="tab-account">
              <User className="w-4 h-4 mr-2" />
              Account Settings
            </TabsTrigger>
            <TabsTrigger value="billing" data-testid="tab-billing">
              <CreditCard className="w-4 h-4 mr-2" />
              Subscription & Billing
            </TabsTrigger>
          </TabsList>

          {/* Business Profile Tab */}
          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Business Information</CardTitle>
                    <CardDescription>Your business details and contact information</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} data-testid="button-edit-profile">
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="businessName"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        disabled={!isEditing}
                        data-testid="input-business-name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner Name</Label>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="ownerName"
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        disabled={!isEditing}
                        data-testid="input-owner-name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing}
                        data-testid="input-email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        data-testid="input-phone"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Business Address</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        disabled={!isEditing}
                        rows={2}
                        data-testid="input-address"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serviceArea">Service Area</Label>
                    <Input
                      id="serviceArea"
                      value={formData.serviceArea}
                      onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                      disabled={!isEditing}
                      placeholder="e.g., Greater Manchester"
                      data-testid="input-service-area"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select 
                      value={formData.businessType} 
                      onValueChange={(value) => setFormData({ ...formData, businessType: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger data-testid="select-business-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {businessTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Business Goals</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="targetHourlyRate" className="text-sm text-muted-foreground">Target Hourly Rate</Label>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <Input
                          id="targetHourlyRate"
                          type="number"
                          value={formData.targetHourlyRate}
                          onChange={(e) => setFormData({ ...formData, targetHourlyRate: parseFloat(e.target.value) })}
                          disabled={!isEditing}
                          data-testid="input-target-hourly-rate"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="monthlyRevenueGoal" className="text-sm text-muted-foreground">Monthly Revenue Goal</Label>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <Input
                          id="monthlyRevenueGoal"
                          type="number"
                          value={formData.monthlyRevenueGoal}
                          onChange={(e) => setFormData({ ...formData, monthlyRevenueGoal: parseFloat(e.target.value) })}
                          disabled={!isEditing}
                          data-testid="input-monthly-revenue-goal"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weeklyHoursTarget" className="text-sm text-muted-foreground">Weekly Hours Target</Label>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <Input
                          id="weeklyHoursTarget"
                          type="number"
                          value={formData.weeklyHoursTarget}
                          onChange={(e) => setFormData({ ...formData, weeklyHoursTarget: parseFloat(e.target.value) })}
                          disabled={!isEditing}
                          data-testid="input-weekly-hours-target"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} disabled={updateProfileMutation.isPending} data-testid="button-save-profile">
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={updateProfileMutation.isPending} data-testid="button-cancel-edit">
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Manage your account preferences and notification settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currency">Preferred Currency</Label>
                    <Select 
                      value={formData.currency} 
                      onValueChange={(value) => {
                        setFormData({ ...formData, currency: value as Currency });
                        updateProfileMutation.mutate({ currency: value as Currency });
                      }}
                    >
                      <SelectTrigger className="mt-2" data-testid="select-currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(CURRENCIES).map((curr) => (
                          <SelectItem key={curr.code} value={curr.code}>
                            {curr.code} ({curr.symbol}) - {curr.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-2">
                      This will affect how pricing and revenue data is displayed throughout the app
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <Bell className="w-5 h-5 inline mr-2" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="competitorAlerts">Competitor Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when competitor pricing changes</p>
                  </div>
                  <Switch
                    id="competitorAlerts"
                    checked={formData.notifications.competitorAlerts}
                    onCheckedChange={(checked) => {
                      const newNotifications = { ...formData.notifications, competitorAlerts: checked };
                      setFormData({ ...formData, notifications: newNotifications });
                      updateProfileMutation.mutate({ notifications: newNotifications });
                    }}
                    data-testid="switch-competitor-alerts"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="insightDigest">Insight Digest</Label>
                    <p className="text-sm text-muted-foreground">Daily AI-generated insights about your business</p>
                  </div>
                  <Switch
                    id="insightDigest"
                    checked={formData.notifications.insightDigest}
                    onCheckedChange={(checked) => {
                      const newNotifications = { ...formData.notifications, insightDigest: checked };
                      setFormData({ ...formData, notifications: newNotifications });
                      updateProfileMutation.mutate({ notifications: newNotifications });
                    }}
                    data-testid="switch-insight-digest"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="jobReminders">Job Reminders</Label>
                    <p className="text-sm text-muted-foreground">Reminders for upcoming jobs and follow-ups</p>
                  </div>
                  <Switch
                    id="jobReminders"
                    checked={formData.notifications.jobReminders}
                    onCheckedChange={(checked) => {
                      const newNotifications = { ...formData.notifications, jobReminders: checked };
                      setFormData({ ...formData, notifications: newNotifications });
                      updateProfileMutation.mutate({ notifications: newNotifications });
                    }}
                    data-testid="switch-job-reminders"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketingTips">Marketing Tips</Label>
                    <p className="text-sm text-muted-foreground">Weekly tips to grow your business</p>
                  </div>
                  <Switch
                    id="marketingTips"
                    checked={formData.notifications.marketingTips}
                    onCheckedChange={(checked) => {
                      const newNotifications = { ...formData.notifications, marketingTips: checked };
                      setFormData({ ...formData, notifications: newNotifications });
                      updateProfileMutation.mutate({ notifications: newNotifications });
                    }}
                    data-testid="switch-marketing-tips"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription & Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  {currentTier === "trial" && "You're currently on a free trial"}
                  {currentTier === "basic" && "You're subscribed to the Basic plan"}
                  {currentTier === "pro" && "You're subscribed to the Pro plan"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {currentTier.toUpperCase()}
                  </Badge>
                  {subscriptionData?.status && (
                    <Badge variant={subscriptionData.status === 'active' ? 'default' : 'secondary'}>
                      {subscriptionData.status}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
              {tiers.map((tier: TierConfig) => {
                const isCurrent = tier.tierName === currentTier;
                const price = tier.pricing[currency.toLowerCase() as keyof typeof tier.pricing];
                
                return (
                  <Card key={tier.tierName} className={isCurrent ? "border-primary" : ""}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{tier.displayName}</CardTitle>
                        {isCurrent && <Badge>Current</Badge>}
                      </div>
                      <CardDescription>
                        <span className="text-3xl font-bold text-foreground">
                          {formatPrice(price, currency)}
                        </span>
                        <span className="text-muted-foreground">/month</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2 text-sm">
                        {getTierFeatureList(tier).map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      {!isCurrent && tier.tierName !== "trial" && (
                        <Button 
                          className="w-full" 
                          variant={tier.tierName === "pro" ? "default" : "outline"}
                          data-testid={`button-select-${tier.tierName}`}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          {currentTier === "trial" ? "Subscribe" : "Change Plan"}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
