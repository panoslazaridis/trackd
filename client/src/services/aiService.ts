const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface CompetitorAnalysisRequest {
  businessType: string;
  location: string;
  services: string[];
}

interface PricingAnalysisRequest {
  businessType: string;
  location: string;
  currentRate: number;
  services: string[];
}

interface AnalysisResponse {
  analysis: string;
  recommendations: string[];
  keyInsights: string[];
}

export async function getCompetitorAnalysis(data: CompetitorAnalysisRequest): Promise<AnalysisResponse> {
  try {
    const response = await fetch('/api/ai/competitor-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting competitor analysis:', error);
    throw error;
  }
}

export async function getPricingAnalysis(data: PricingAnalysisRequest): Promise<AnalysisResponse> {
  try {
    const response = await fetch('/api/ai/pricing-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting pricing analysis:', error);
    throw error;
  }
}