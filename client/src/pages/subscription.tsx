import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const TIER_FEATURES = {
  free: {
    name: "Free",
    price: "£0",
    features: ["20 jobs per month", "3 competitors tracked", "10 AI credits", "Basic analytics"],
  },
  basic: {
    name: "Basic",
    price: "£9",
    features: [
      "100 jobs per month",
      "5 competitors tracked",
      "50 AI credits",
      "Advanced analytics",
      "Export reports",
    ],
  },
  professional: {
    name: "Professional",
    price: "£19",
    features: [
      "Unlimited jobs",
      "10 competitors tracked",
      "200 AI credits",
      "All analytics features",
      "Competitor alerts",
      "WhatsApp integration",
    ],
  },
  premium: {
    name: "Premium",
    price: "£39",
    features: [
      "Unlimited jobs",
      "25 competitors tracked",
      "500 AI credits",
      "Priority support",
      "API access",
      "White-label branding",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: "£99",
    features: [
      "Unlimited everything",
      "Custom integrations",
      "Dedicated support",
      "Multi-user access",
      "Custom training",
    ],
  },
};

export default function Subscription() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const userId = "test-user-plumber"; // TODO: Get from auth context

  const { data, isLoading } = useQuery<{ subscription: any }>({
    queryKey: ["/api/stripe/subscription", userId],
  });

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const currentSubscription = data?.subscription;
  const currentTier = currentSubscription?.subscriptionTier || "free";

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-subscription-title">Subscription Plans</h1>
        <p className="text-muted-foreground" data-testid="text-subscription-description">
          Choose the perfect plan for your business
        </p>
      </div>

      {currentSubscription && currentSubscription.subscriptionTier !== "free" && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>Your active plan details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{TIER_FEATURES[currentTier as keyof typeof TIER_FEATURES]?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {currentSubscription.monthlyPriceGbp ? `£${currentSubscription.monthlyPriceGbp}/month` : ""}
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
        {Object.entries(TIER_FEATURES).map(([tier, details]) => (
          <Card
            key={tier}
            className={`flex flex-col ${
              currentTier === tier ? "border-primary border-2" : ""
            }`}
            data-testid={`card-plan-${tier}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{details.name}</CardTitle>
                {currentTier === tier && (
                  <Badge variant="default" data-testid={`badge-current-${tier}`}>Current</Badge>
                )}
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold">{details.price}</span>
                {tier !== "free" && <span className="text-muted-foreground">/month</span>}
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2">
                {details.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2" data-testid={`feature-${tier}-${index}`}>
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {currentTier === tier ? (
                <Button disabled className="w-full" data-testid={`button-current-${tier}`}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Current Plan
                </Button>
              ) : tier === "free" ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (currentSubscription) {
                      cancelMutation.mutate();
                    }
                  }}
                  disabled={!currentSubscription || currentSubscription.subscriptionTier === "free"}
                  data-testid="button-downgrade-free"
                >
                  Downgrade to Free
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => createCheckoutMutation.mutate({ tier })}
                  disabled={createCheckoutMutation.isPending}
                  data-testid={`button-subscribe-${tier}`}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {currentTier === "free" ? "Subscribe" : "Change Plan"}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
