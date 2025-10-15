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
import { differenceInDays } from "date-fns";

const TIER_FEATURES = {
  basic: {
    name: "Basic",
    price: "£9",
    description: "per month",
    features: [
      "50 jobs per month",
      "5 competitors tracked",
      "5 AI credits",
      "Insights every 3 days",
      "Advanced analytics",
      "Export reports",
    ],
  },
  pro: {
    name: "Professional",
    price: "£19",
    description: "per month",
    features: [
      "Unlimited jobs",
      "10 competitors tracked",
      "10 AI credits",
      "Daily insights",
      "All analytics features",
      "Competitor alerts",
      "WhatsApp integration",
      "Priority support",
    ],
  },
};

export default function TrialExpiryModal() {
  const { toast } = useToast();

  const { data: subscription } = useQuery<any>({
    queryKey: ["/api/subscription/current"],
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
      return await apiRequest("/api/stripe/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ 
          userId: "test-user-id", // TODO: Get from auth context
          tier,
          billingCycle: "monthly",
        }),
      });
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
          {Object.entries(TIER_FEATURES).map(([tier, details]) => (
            <Card 
              key={tier} 
              className={tier === "pro" ? "border-primary shadow-lg" : ""}
              data-testid={`card-tier-${tier}`}
            >
              {tier === "pro" && (
                <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium rounded-t-lg">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{details.name}</CardTitle>
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{details.price}</span>
                  <span className="text-muted-foreground ml-1">/{details.description}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {details.features.map((feature, index) => (
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
                  variant={tier === "pro" ? "default" : "outline"}
                  onClick={() => createCheckoutMutation.mutate({ tier })}
                  disabled={createCheckoutMutation.isPending}
                  data-testid={`button-subscribe-${tier}`}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Subscribe to {details.name}
                </Button>
              </CardFooter>
            </Card>
          ))}
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
