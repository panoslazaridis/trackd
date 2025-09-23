import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Lightbulb,
  RefreshCw,
  Target
} from "lucide-react";
import { getCompetitorAnalysis, getPricingAnalysis } from "@/services/aiService";

interface AIInsightsProps {
  businessType: string;
  location: string;
  currentRate: number;
  services: string[];
  className?: string;
}

interface AnalysisData {
  analysis: string;
  recommendations: string[];
  keyInsights: string[];
}

export default function AIInsights({ 
  businessType, 
  location, 
  currentRate, 
  services, 
  className = "" 
}: AIInsightsProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const { 
    data: competitorData, 
    isLoading: competitorLoading, 
    error: competitorError,
    refetch: refetchCompetitor 
  } = useQuery({
    queryKey: ['competitor-analysis', businessType, location, services, refreshKey],
    queryFn: () => getCompetitorAnalysis({ businessType, location, services }),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const { 
    data: pricingData, 
    isLoading: pricingLoading, 
    error: pricingError,
    refetch: refetchPricing
  } = useQuery({
    queryKey: ['pricing-analysis', businessType, location, currentRate, services, refreshKey],
    queryFn: () => getPricingAnalysis({ businessType, location, currentRate, services }),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const renderAnalysisCard = (
    title: string,
    description: string,
    icon: React.ComponentType<{ className?: string }>,
    data: AnalysisData | undefined,
    isLoading: boolean,
    error: Error | null
  ) => {
    const Icon = icon;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <Icon className="w-5 h-5 text-primary" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
            <div className="space-y-3">
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Analysis Error</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Unable to generate analysis at this time. Please try again later.
              </p>
            </div>
          )}
          
          {data && !isLoading && !error && (
            <div className="space-y-4">
              {/* Analysis Text */}
              <div>
                <h4 className="font-medium mb-2">Analysis</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.analysis}
                </p>
              </div>
              
              {/* Key Insights */}
              {data.keyInsights && data.keyInsights.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    Key Insights
                  </h4>
                  <div className="space-y-2">
                    {data.keyInsights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Recommendations */}
              {data.recommendations && data.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <Target className="w-4 h-4 text-primary" />
                    Recommendations
                  </h4>
                  <div className="space-y-2">
                    {data.recommendations.map((rec, index) => (
                      <Badge key={index} variant="secondary" className="mr-2 mb-2">
                        {rec}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 font-heading">
              <Brain className="w-5 h-5 text-primary" />
              AI Business Insights
            </CardTitle>
            <CardDescription>
              AI-powered analysis to help grow your {businessType} business
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={competitorLoading || pricingLoading}
            data-testid="button-refresh-ai-insights"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${competitorLoading || pricingLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="competitor" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="competitor" data-testid="tab-competitor-analysis">
              <Users className="w-4 h-4 mr-2" />
              Competitor Analysis
            </TabsTrigger>
            <TabsTrigger value="pricing" data-testid="tab-pricing-analysis">
              <DollarSign className="w-4 h-4 mr-2" />
              Pricing Analysis
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="competitor" className="space-y-4">
            {renderAnalysisCard(
              "Market Competition",
              "Analysis of competitors and market positioning in your area",
              Users,
              competitorData,
              competitorLoading,
              competitorError
            )}
          </TabsContent>
          
          <TabsContent value="pricing" className="space-y-4">
            {renderAnalysisCard(
              "Pricing Strategy",
              "Recommendations for optimal pricing based on market data",
              TrendingUp,
              pricingData,
              pricingLoading,
              pricingError
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}