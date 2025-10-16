import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { getCurrentUserId } from "@/lib/auth";
import { formatPrice, type Currency } from "@shared/currency";

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

function getTierFeatureList(tier: TierConfig): string[] {
  const features: string[] = [];
  
  // Add job limit
  if (tier.maxJobsPerMonth === null) {
    features.push("Unlimited jobs");
  } else {
    features.push(`${tier.maxJobsPerMonth} jobs per month`);
  }
  
  // Add competitors
  features.push(`${tier.maxCompetitors} competitors tracked`);
  
  // Add AI credits
  features.push(`${tier.aiCreditsPerMonth} AI credits`);
  
  // Add insights schedule
  const scheduleMap: Record<string, string> = {
    'daily': 'Daily insights',
    'every_3_days': 'Insights every 3 days',
    'weekly': 'Weekly insights',
    'monthly': 'Monthly insights',
  };
  features.push(scheduleMap[tier.insightGenerationSchedule] || 'Regular insights');
  
  // Add feature flags
  if (tier.features.advancedAnalytics) features.push("Advanced analytics");
  if (tier.features.competitorAlerts) features.push("Competitor alerts");
  if (tier.features.exportReports) features.push("Export reports");
  if (tier.features.apiAccess) features.push("API access");
  if (tier.features.whatsappIntegration) features.push("WhatsApp integration");
  if (tier.features.prioritySupport) features.push("Priority support");
  
  return features;
}

export default function Subscription() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const userId = getCurrentUserId();

  // Fetch tier configurations from Airtable
  const { data: tierData, isLoading: tiersLoading } = useQuery<{ tiers: TierConfig[] }>({
    queryKey: ["/api/config/tiers"],
  });

  // Fetch user data to get preferred currency
  const { data: userData } = useQuery<{ preferredCurrency: Currency }>({
    queryKey: [`/api/user/${userId}`],
  });

  const { data, isLoading } = useQuery<{ subscription: any }>({
    queryKey: ["/api/stripe/subscription", userId],
  });

  const userCurrency = (userData?.preferredCurrency || 'GBP') as Currency;

  const createCheckoutMutation = useMutation({
    mutationFn: async ({ tier }: { tier: string }) => {
      const response = await apiRequest("POST", "/api/stripe/create-checkout-session", {
        userId,
        tier,
        billingCycle: "monthly",
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        // New subscription - redirect to Stripe checkout
        window.location.href = data.url;
      } else if (data.success) {
        // Existing subscription updated
        toast({
          title: "Subscription Updated",
          description: data.message || "Your subscription has been updated successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/stripe/subscription", userId] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process subscription change",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/stripe/cancel-subscription", { userId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Canceled",
        description: "Your subscription will remain active until the end of the billing period.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stripe/subscription", userId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/stripe/reactivate-subscription", { userId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Reactivated",
        description: "Your subscription has been reactivated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stripe/subscription", userId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reactivate subscription",
        variant: "destructive",
      });
    },
  });

  if (isLoading || tiersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const currentSubscription = data?.subscription;
  const currentTier = currentSubscription?.subscriptionTier || "trial";
  const tiers = tierData?.tiers || [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-subscription-title">Subscription Plans</h1>
        <p className="text-muted-foreground" data-testid="text-subscription-description">
          Choose the perfect plan for your business
        </p>
      </div>

      {currentSubscription && currentSubscription.subscriptionTier !== "trial" && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>Your active plan details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">
                  {tiers.find(t => t.tierName === currentTier)?.displayName || currentTier}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentSubscription.monthlyPriceGbp ? `${formatPrice(parseFloat(currentSubscription.monthlyPriceGbp), userCurrency)}/month` : ""}
                </p>
                <Badge variant={currentSubscription.subscriptionStatus === "active" ? "default" : "secondary"} className="mt-2">
                  {currentSubscription.subscriptionStatus}
                </Badge>
              </div>
              <div className="flex gap-2">
                {currentSubscription.cancelAtPeriodEnd ? (
                  <Button
                    onClick={() => reactivateMutation.mutate()}
                    disabled={reactivateMutation.isPending}
                    data-testid="button-reactivate-subscription"
                  >
                    Reactivate
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => cancelMutation.mutate()}
                    disabled={cancelMutation.isPending}
                    data-testid="button-cancel-subscription"
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const priceKey = userCurrency.toLowerCase() as 'gbp' | 'eur' | 'usd';
          const price = tier.pricing[priceKey];
          const features = getTierFeatureList(tier);
          
          return (
            <Card
              key={tier.tierName}
              className={`flex flex-col ${
                currentTier === tier.tierName ? "border-primary border-2" : ""
              }`}
              data-testid={`card-plan-${tier.tierName}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{tier.displayName}</CardTitle>
                  {currentTier === tier.tierName && (
                    <Badge variant="default" data-testid={`badge-current-${tier.tierName}`}>Current</Badge>
                  )}
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{formatPrice(price, userCurrency)}</span>
                  {tier.trialDurationDays ? (
                    <span className="text-muted-foreground ml-1"> for {tier.trialDurationDays} days</span>
                  ) : (
                    <span className="text-muted-foreground ml-1">/month</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2" data-testid={`feature-${tier.tierName}-${index}`}>
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {currentTier === tier.tierName ? (
                  <Button disabled className="w-full" data-testid={`button-current-${tier.tierName}`}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Current Plan
                  </Button>
                ) : tier.tierName === "trial" ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled
                    data-testid="button-trial-info"
                  >
                    Available on signup
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => createCheckoutMutation.mutate({ tier: tier.tierName })}
                    disabled={createCheckoutMutation.isPending}
                    data-testid={`button-subscribe-${tier.tierName}`}
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
    </div>
  );
}
