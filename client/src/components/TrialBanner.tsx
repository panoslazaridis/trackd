import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { differenceInDays } from "date-fns";

export default function TrialBanner() {
  const [, setLocation] = useLocation();

  const { data: subscription } = useQuery<any>({
    queryKey: ["/api/subscription/current"],
  });

  // Only show banner if user is on trial
  if (!subscription || subscription.subscriptionTier !== "trial") {
    return null;
  }

  // Calculate days remaining in trial
  const trialEndDate = subscription.trialEndDate 
    ? new Date(subscription.trialEndDate)
    : null;
  
  const daysRemaining = trialEndDate 
    ? Math.max(0, differenceInDays(trialEndDate, new Date()))
    : 0;

  // If trial has expired, don't show this banner (expiry modal will handle it)
  if (daysRemaining <= 0) {
    return null;
  }

  const urgency = daysRemaining <= 3 ? "destructive" : 
                  daysRemaining <= 7 ? "default" : 
                  "default";

  return (
    <Alert 
      variant={urgency}
      className="rounded-none border-x-0 border-t-0 mb-0"
      data-testid="trial-banner"
    >
      <div className="flex items-center justify-between w-full gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Clock className="h-4 w-4" />
          <AlertDescription className="m-0 flex items-center gap-2">
            <span className="font-medium">Free Trial:</span>
            <span>
              {daysRemaining === 1 ? "Last day" : `${daysRemaining} days remaining`}
            </span>
          </AlertDescription>
        </div>
        <Button 
          size="sm"
          variant={daysRemaining <= 3 ? "default" : "outline"}
          onClick={() => setLocation("/subscription")}
          data-testid="button-trial-subscribe"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Subscribe Now
        </Button>
      </div>
    </Alert>
  );
}
