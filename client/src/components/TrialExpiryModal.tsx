import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getCurrentUserId } from "@/lib/auth";
import { differenceInDays } from "date-fns";
import { formatPrice, type Currency } from "@shared/currency";

interface TierConfig {
  tierName: string;
  displayName: string;
  pricing: {
    gbp: number;
    eur: number;
    usd: number;
  };
  maxJobsPerMonth: number | null;
  maxCompetitors: number;
  aiCreditsPerMonth: number;
  insightGenerationSchedule: string;
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

export default function TrialExpiryModal() {
  const { toast } = useToast();

  const { data: subscription } = useQuery<any>({
    queryKey: ["/api/subscription/current"],
  });

  const { data: tierData } = useQuery<{ tiers: TierConfig[] }>({
    queryKey: ["/api/config/tiers"],
  });

  const { data: userData } = useQuery<{ preferredCurrency: Currency }>({
    queryKey: [`/api/user/${getCurrentUserId()}`],
  });

  // Calculate if trial has expired
  const trialEndDate = subscription?.trialEndDate 
    ? new Date(subscription.trialEndDate)
    : null;
  
  const daysRemaining = trialEndDate 
    ? differenceInDays(trialEndDate, new Date())
    : 0;

  const isTrialExpired = subscription?.subscriptionTier === "trial" && daysRemaining <= 0;

  const createCheckoutMutation = useMutation({
    mutationFn: async ({ tier }: { tier: string }) => {
      const response = await apiRequest("POST", "/api/stripe/create-checkout-session", {
        userId: getCurrentUserId(),
        tier,
        billingCycle: "monthly",
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
    },
  });

  // Modal is only shown when trial has expired
  if (!isTrialExpired) {
    return null;
  }

  const userCurrency = (userData?.preferredCurrency || 'GBP') as Currency;
  const tiers = (tierData?.tiers || []).filter(t => t.tierName !== 'trial');

  return (
    <Dialog open={true} modal>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:hidden"
        data-testid="modal-trial-expired"
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl">Your Trial Has Ended</DialogTitle>
          </div>
          <DialogDescription>
            Subscribe to continue using TrackD and unlock powerful features to grow your business
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {tiers.map((tier) => {
            const priceKey = userCurrency.toLowerCase() as 'gbp' | 'eur' | 'usd';
            const price = tier.pricing[priceKey];
            const features = getTierFeatureList(tier);
            
            return (
              <Card 
                key={tier.tierName} 
                className={tier.tierName === "pro" ? "border-primary shadow-lg" : ""}
                data-testid={`card-tier-${tier.tierName}`}
              >
                {tier.tierName === "pro" && (
                  <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium rounded-t-lg">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{tier.displayName}</CardTitle>
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{formatPrice(price, userCurrency)}</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={tier.tierName === "pro" ? "default" : "outline"}
                  onClick={() => createCheckoutMutation.mutate({ tier: tier.tierName })}
                  disabled={createCheckoutMutation.isPending}
                  data-testid={`button-subscribe-${tier.tierName}`}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Subscribe to {tier.displayName}
                </Button>
              </CardFooter>
            </Card>
          );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-center text-muted-foreground">
            All plans include a 30-day money-back guarantee. Cancel anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
