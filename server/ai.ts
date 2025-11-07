import OpenAI from 'openai';

// Provider selection: 'auto' (default), 'openai', or 'perplexity'
const providerPreference = (process.env.AI_PROVIDER || 'auto').toLowerCase();
const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY);
const hasPerplexityKey = Boolean(process.env.PERPLEXITY_API_KEY);

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
    const json = await chatJson(prompt);
    return json as AnalysisResponse;
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
    const json = await chatJson(prompt);
    return json as AnalysisResponse;
  } catch (error) {
    console.error('Error generating pricing analysis:', error);
    throw new Error('Failed to generate pricing analysis');
  }
}

// Helper to call the configured AI provider and return JSON content
async function chatJson(prompt: string): Promise<unknown> {
  // Decide provider
  const usePerplexity =
    (providerPreference === 'perplexity' || providerPreference === 'auto') && hasPerplexityKey;
  const useOpenAI =
    (providerPreference === 'openai' || providerPreference === 'auto') && hasOpenAIKey;

  // Perplexity branch (OpenAI-compatible endpoint)
  if (usePerplexity) {
    const model = process.env.PERPLEXITY_MODEL || 'sonar';
    const resp = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`Perplexity API error: ${resp.status} ${text}`);
    }
    const data = await resp.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('No response from Perplexity');
    return safeParseJson(content);
  }

  // OpenAI branch
  if (useOpenAI && openai) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');
    return safeParseJson(content);
  }

  // Mock fallback
  return {
    analysis:
      'Offline mode: No AI provider configured. Using mock response. Consider service differentiation, local SEO, and seasonal demand.',
    keyInsights: [
      'Market competition appears moderate; niche specialization can help',
      'Pricing transparency and reviews drive customer selection',
      'Local SEO and Google Business Profile are key acquisition channels',
    ],
    recommendations: [
      'Publish case studies and before/after photos',
      'Offer tiered service packages with clear inclusions',
      'Request reviews after each completed job',
    ],
  };
}

function safeParseJson(content: string): unknown {
  let clean = content.trim();
  clean = clean.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    clean = clean.substring(start, end + 1);
  }
  return JSON.parse(clean);
}