import OpenAI from 'openai';

const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY);
const openai = hasOpenAIKey
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

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

export async function generateCompetitorAnalysis(data: CompetitorAnalysisRequest): Promise<AnalysisResponse> {
  const prompt = `
You are a business consultant specializing in trades and service businesses. Analyze the competitive landscape for a ${data.businessType} business in ${data.location}.

Business Details:
- Business Type: ${data.businessType}
- Location: ${data.location}
- Services Offered: ${data.services.join(', ')}

Please provide:
1. A comprehensive analysis of the competitive landscape
2. 3-5 key insights about the market and competition
3. 3-5 actionable recommendations for competitive advantage

Focus on practical, actionable advice specific to trades businesses in the UK market. Consider factors like:
- Local market saturation
- Pricing strategies
- Service differentiation opportunities
- Marketing and customer acquisition
- Seasonal factors
- Digital presence importance

Respond in JSON format with:
{
  "analysis": "detailed analysis paragraph",
  "keyInsights": ["insight1", "insight2", "insight3", ...],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3", ...]
}
`;

  try {
    if (!openai) {
      return {
        analysis:
          `Offline mode: No OPENAI_API_KEY set. Mock analysis for ${data.businessType} in ${data.location}. Consider service differentiation, local SEO, and seasonal demand.`,
        keyInsights: [
          "Market competition appears moderate; niche specialization can help",
          "Pricing transparency and reviews drive customer selection",
          "Local SEO and Google Business Profile are key acquisition channels",
        ],
        recommendations: [
          "Publish case studies and before/after photos",
          "Offer tiered service packages with clear inclusions",
          "Request reviews after each completed job",
        ],
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Clean content and handle various formatting issues
    let cleanContent = content.trim();
    
    // Remove code block markers if present
    cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Remove any leading/trailing non-JSON content
    const jsonStart = cleanContent.indexOf('{');
    const jsonEnd = cleanContent.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
    }
    
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('Error generating competitor analysis:', error);
    throw new Error('Failed to generate competitor analysis');
  }
}

export async function generatePricingAnalysis(data: PricingAnalysisRequest): Promise<AnalysisResponse> {
  const prompt = `
You are a pricing consultant specializing in trades and service businesses. Analyze the pricing strategy for a ${data.businessType} business in ${data.location}.

Business Details:
- Business Type: ${data.businessType}
- Location: ${data.location}
- Current Hourly Rate: £${data.currentRate}
- Services Offered: ${data.services.join(', ')}

Please provide:
1. A comprehensive analysis of their current pricing relative to market rates
2. 3-5 key insights about pricing in this market
3. 3-5 actionable recommendations for pricing optimization

Focus on practical, actionable advice specific to trades businesses in the UK market. Consider factors like:
- Industry standard rates
- Regional pricing variations
- Service complexity and value
- Competition-based pricing
- Value-based pricing opportunities
- Premium service positioning

Respond in JSON format with:
{
  "analysis": "detailed analysis paragraph",
  "keyInsights": ["insight1", "insight2", "insight3", ...],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3", ...]
}
`;

  try {
    if (!openai) {
      return {
        analysis:
          `Offline mode: No OPENAI_API_KEY set. Mock pricing analysis for ${data.businessType} in ${data.location} at £${data.currentRate}/hr.`,
        keyInsights: [
          "Your current rate is likely within local averages",
          "Value-based add-ons can justify a premium",
          "Clear scope definitions reduce scope creep",
        ],
        recommendations: [
          "Introduce minimum call-out fee and after-hours premium",
          "Bundle materials with transparent markups",
          "Publish a rate card with common jobs",
        ],
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Clean content and handle various formatting issues
    let cleanContent = content.trim();
    
    // Remove code block markers if present
    cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Remove any leading/trailing non-JSON content
    const jsonStart = cleanContent.indexOf('{');
    const jsonEnd = cleanContent.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
    }
    
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('Error generating pricing analysis:', error);
    throw new Error('Failed to generate pricing analysis');
  }
}