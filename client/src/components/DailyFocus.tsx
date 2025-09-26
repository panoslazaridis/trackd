import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight } from "lucide-react";

interface DailyFocusProps {
  insight?: string;
  action?: string;
  reason?: string;
  onActionClick?: () => void;
}

export default function DailyFocus({ 
  insight = "Follow up with Sarah M. about bathroom project - she's worth 3x more than average customer",
  action = "Call Sarah M.",
  reason = "£2,400 lifetime value vs £800 average",
  onActionClick = () => console.log("Take daily focus action")
}: DailyFocusProps) {
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-blue-500" />
        <h2 className="text-xl font-heading font-semibold">Daily Focus</h2>
      </div>
      
      <Card className="border-blue-200 bg-blue-50/50 hover-elevate">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-900 text-lg leading-relaxed">
            {insight}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-blue-700 text-sm font-medium">
                Why this matters: {reason}
              </p>
            </div>
            <Button 
              onClick={onActionClick}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-daily-focus-action"
            >
              {action}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}