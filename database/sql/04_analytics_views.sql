-- Analytics Views for TrackD Analytics
-- Pre-built queries for revenue, user health, cohorts, and feature adoption

-- ============================================================================
-- VIEW 1: Revenue Dashboard
-- ============================================================================

CREATE VIEW revenue_dashboard AS
SELECT 
  DATE_TRUNC('month', s.current_period_start) as month,
  s.subscription_tier,
  
  -- Subscription counts
  COUNT(*) as active_subscriptions,
  COUNT(*) FILTER (WHERE s.trial_active = true) as trials,
  COUNT(*) FILTER (WHERE s.trial_converted_to_paid = true) as trial_conversions,
  
  -- Revenue metrics
  SUM(s.monthly_price_gbp::numeric) as total_mrr,
  SUM(s.monthly_price_gbp::numeric) FILTER (WHERE s.created_at >= DATE_TRUNC('month', s.current_period_start)) as new_mrr,
  SUM(s.monthly_price_gbp::numeric) FILTER (WHERE s.cancel_at_period_end = true) as churning_mrr,
  
  -- Average values
  AVG(s.monthly_price_gbp::numeric) as arpu,
  AVG(s.total_revenue_all_time::numeric) as avg_ltv,
  AVG(s.months_as_customer) as avg_customer_lifetime_months,
  
  -- Churn indicators
  COUNT(*) FILTER (WHERE s.cancel_at_period_end = true) as pending_cancellations,
  ROUND(100.0 * COUNT(*) FILTER (WHERE s.cancel_at_period_end = true) / NULLIF(COUNT(*), 0), 2) as churn_rate_pct

FROM user_subscriptions s
WHERE s.subscription_status IN ('active', 'trialing')
GROUP BY DATE_TRUNC('month', s.current_period_start), s.subscription_tier;

-- ============================================================================
-- VIEW 2: User Health Dashboard
-- ============================================================================

CREATE VIEW user_health_dashboard AS
SELECT 
  e.user_id,
  e.email,
  e.business_name,
  e.activity_status,
  e.user_segment,
  e.engagement_score,
  
  -- Usage metrics
  e.total_jobs_created,
  e.jobs_last_30_days,
  e.total_logins,
  e.days_since_last_login,
  e.days_since_last_job,
  
  -- Subscription info
  s.subscription_tier,
  s.subscription_status,
  s.monthly_price_gbp,
  s.months_as_customer,
  
  -- Churn risk calculation
  CASE 
    WHEN e.days_since_last_login > 30 THEN 90
    WHEN e.days_since_last_job > 21 THEN 70
    WHEN e.jobs_last_30_days = 0 AND e.total_jobs_created > 5 THEN 60
    WHEN e.engagement_score < 30 THEN 50
    WHEN s.cancel_at_period_end = true THEN 100
    ELSE GREATEST(0, 50 - e.engagement_score)
  END as churn_risk_score,
  
  -- Value category
  CASE 
    WHEN s.monthly_price_gbp::numeric >= 39 AND e.engagement_score >= 70 THEN 'high_value_engaged'
    WHEN s.monthly_price_gbp::numeric >= 19 AND e.engagement_score >= 50 THEN 'medium_value_engaged'
    WHEN s.monthly_price_gbp::numeric >= 9 THEN 'low_value'
    WHEN e.engagement_score >= 70 THEN 'high_potential_free'
    ELSE 'low_potential'
  END as value_category

FROM user_engagement_metrics e
LEFT JOIN user_subscriptions s ON e.user_id = s.user_id;

-- ============================================================================
-- VIEW 3: Cohort Performance Analysis
-- ============================================================================

CREATE VIEW cohort_analysis AS
WITH cohorts AS (
  SELECT 
    DATE_TRUNC('month', created_at) as cohort_month,
    id as user_id
  FROM users
)
SELECT 
  c.cohort_month,
  COUNT(DISTINCT c.user_id) as cohort_size,
  
  -- Retention
  COUNT(DISTINCT c.user_id) FILTER (WHERE e.activity_status IN ('active', 'casual')) as retained_users,
  ROUND(100.0 * COUNT(DISTINCT c.user_id) FILTER (WHERE e.activity_status IN ('active', 'casual')) / NULLIF(COUNT(DISTINCT c.user_id), 0), 2) as retention_rate,
  
  -- Engagement
  AVG(e.engagement_score) as avg_engagement_score,
  AVG(e.total_jobs_created) as avg_jobs_per_user,
  AVG(e.total_revenue_tracked::numeric) as avg_revenue_tracked_per_user,
  
  -- Monetization
  COUNT(DISTINCT c.user_id) FILTER (WHERE s.subscription_tier != 'free') as paid_users,
  ROUND(100.0 * COUNT(DISTINCT c.user_id) FILTER (WHERE s.subscription_tier != 'free') / NULLIF(COUNT(DISTINCT c.user_id), 0), 2) as conversion_rate,
  SUM(s.monthly_price_gbp::numeric) as cohort_mrr,
  AVG(s.monthly_price_gbp::numeric) FILTER (WHERE s.subscription_tier != 'free') as arpu_paid_users

FROM cohorts c
LEFT JOIN user_engagement_metrics e ON c.user_id = e.user_id
LEFT JOIN user_subscriptions s ON c.user_id = s.user_id
GROUP BY c.cohort_month
ORDER BY c.cohort_month DESC;

-- ============================================================================
-- VIEW 4: Feature Adoption Funnel
-- ============================================================================

CREATE VIEW feature_adoption_funnel AS
SELECT 
  COUNT(DISTINCT user_id) as total_users,
  
  -- Core features
  COUNT(DISTINCT user_id) FILTER (WHERE total_jobs_created >= 1) as users_created_job,
  COUNT(DISTINCT user_id) FILTER (WHERE total_jobs_created >= 5) as users_5plus_jobs,
  COUNT(DISTINCT user_id) FILTER (WHERE total_jobs_created >= 20) as users_20plus_jobs,
  
  -- Competitor research
  COUNT(DISTINCT user_id) FILTER (WHERE competitors_tracked >= 1) as users_added_competitor,
  COUNT(DISTINCT user_id) FILTER (WHERE competitors_tracked >= 3) as users_3plus_competitors,
  
  -- AI features
  COUNT(DISTINCT user_id) FILTER (WHERE total_ai_requests >= 1) as users_tried_ai,
  COUNT(DISTINCT user_id) FILTER (WHERE total_ai_requests >= 5) as users_regular_ai,
  
  -- Conversion rates
  ROUND(100.0 * COUNT(DISTINCT user_id) FILTER (WHERE total_jobs_created >= 1) / NULLIF(COUNT(DISTINCT user_id), 0), 2) as pct_created_job,
  ROUND(100.0 * COUNT(DISTINCT user_id) FILTER (WHERE competitors_tracked >= 1) / NULLIF(COUNT(DISTINCT user_id), 0), 2) as pct_competitor_research,
  ROUND(100.0 * COUNT(DISTINCT user_id) FILTER (WHERE total_ai_requests >= 1) / NULLIF(COUNT(DISTINCT user_id), 0), 2) as pct_ai_adoption

FROM user_engagement_metrics;

-- ============================================================================
-- VIEW 5: AI Usage Analytics
-- ============================================================================

CREATE VIEW ai_usage_analytics AS
SELECT 
  DATE_TRUNC('day', ar.created_at) as date,
  ar.entitlement_tier,
  ar.request_type,
  ar.model,
  
  -- Request metrics
  COUNT(*) as total_requests,
  COUNT(*) FILTER (WHERE ar.success = true) as successful_requests,
  COUNT(*) FILTER (WHERE ar.success = false) as failed_requests,
  ROUND(100.0 * COUNT(*) FILTER (WHERE ar.success = true) / NULLIF(COUNT(*), 0), 2) as success_rate_pct,
  
  -- Token usage
  SUM(ar.tokens_input) as total_tokens_input,
  SUM(ar.tokens_output) as total_tokens_output,
  SUM(ar.tokens_total) as total_tokens,
  AVG(ar.tokens_total) as avg_tokens_per_request,
  
  -- Cost metrics
  SUM(ar.cost_estimate_gbp::numeric) as total_cost_gbp,
  AVG(ar.cost_estimate_gbp::numeric) as avg_cost_per_request_gbp,
  
  -- Performance metrics
  AVG(ar.response_time_ms) as avg_response_time_ms,
  MAX(ar.response_time_ms) as max_response_time_ms,
  
  -- Unique users
  COUNT(DISTINCT ar.user_id) as unique_users

FROM ai_requests ar
GROUP BY DATE_TRUNC('day', ar.created_at), ar.entitlement_tier, ar.request_type, ar.model
ORDER BY date DESC, total_requests DESC;

-- ============================================================================
-- VIEW 6: Subscription Tier Performance
-- ============================================================================

CREATE VIEW subscription_tier_performance AS
SELECT 
  s.subscription_tier,
  
  -- Subscriber counts
  COUNT(*) as total_subscribers,
  COUNT(*) FILTER (WHERE s.subscription_status = 'active') as active_subscribers,
  COUNT(*) FILTER (WHERE s.trial_active = true) as active_trials,
  
  -- Revenue
  SUM(s.monthly_price_gbp::numeric) as total_mrr,
  AVG(s.monthly_price_gbp::numeric) as avg_price,
  SUM(s.total_revenue_all_time::numeric) as total_lifetime_revenue,
  AVG(s.total_revenue_all_time::numeric) as avg_ltv,
  
  -- Customer lifetime
  AVG(s.months_as_customer) as avg_months_as_customer,
  
  -- Churn
  COUNT(*) FILTER (WHERE s.cancel_at_period_end = true) as pending_cancellations,
  ROUND(100.0 * COUNT(*) FILTER (WHERE s.cancel_at_period_end = true) / NULLIF(COUNT(*), 0), 2) as churn_rate_pct,
  
  -- Feature usage
  AVG(s.usage_jobs_created_this_month) as avg_jobs_per_month,
  AVG(s.usage_ai_parsing_this_month) as avg_ai_requests_per_month

FROM user_subscriptions s
GROUP BY s.subscription_tier
ORDER BY 
  CASE s.subscription_tier
    WHEN 'enterprise' THEN 5
    WHEN 'premium' THEN 4
    WHEN 'professional' THEN 3
    WHEN 'basic' THEN 2
    WHEN 'free' THEN 1
  END DESC;

-- ============================================================================
-- NOTES
-- ============================================================================
-- To apply these analytics views to your Supabase database:
-- 1. IMPORTANT: Make sure you've created the materialized view first!
--    Run 03_materialized_view_engagement.sql before this file
-- 2. Go to your Supabase dashboard
-- 3. Navigate to SQL Editor
-- 4. Copy and paste this entire file
-- 5. Click "Run" to execute
--
-- Example queries:
-- 
-- Revenue by tier:
-- SELECT * FROM revenue_dashboard ORDER BY month DESC, total_mrr DESC;
--
-- High-risk churners:
-- SELECT * FROM user_health_dashboard 
-- WHERE churn_risk_score > 70 
-- ORDER BY churn_risk_score DESC;
--
-- Best performing cohorts:
-- SELECT * FROM cohort_analysis 
-- ORDER BY cohort_mrr DESC 
-- LIMIT 10;
--
-- Feature adoption:
-- SELECT * FROM feature_adoption_funnel;
--
-- AI usage by tier:
-- SELECT * FROM ai_usage_analytics 
-- WHERE date >= CURRENT_DATE - interval '30 days'
-- ORDER BY date DESC;
--
-- Tier performance:
-- SELECT * FROM subscription_tier_performance;
-- ============================================================================
