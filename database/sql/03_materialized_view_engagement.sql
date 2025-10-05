-- User Engagement Metrics Materialized View
-- Pre-calculated engagement metrics refreshed daily
-- Combines login stats, job activity, competitor research, and AI usage

-- ============================================================================
-- MATERIALIZED VIEW: user_engagement_metrics
-- ============================================================================

CREATE MATERIALIZED VIEW user_engagement_metrics AS
WITH 
-- Login frequency from Supabase auth logs
login_stats AS (
  SELECT 
    (payload->>'user_id')::varchar as user_id,
    COUNT(*) as total_logins,
    COUNT(DISTINCT DATE(created_at)) as unique_login_days,
    MAX(created_at) as last_login,
    MIN(created_at) as first_login
  FROM auth.audit_log_entries
  WHERE action = 'login'
  GROUP BY (payload->>'user_id')::varchar
),

-- Job activity metrics
job_stats AS (
  SELECT 
    user_id,
    COUNT(*) as total_jobs,
    COUNT(*) FILTER (WHERE created_at >= now() - interval '30 days') as jobs_last_30_days,
    COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days') as jobs_last_7_days,
    COUNT(DISTINCT DATE(created_at)) as active_job_days,
    SUM(revenue::numeric) as total_revenue_tracked,
    AVG(revenue::numeric) as avg_job_revenue,
    SUM((revenue::numeric - COALESCE(expenses::numeric, 0))) as total_profit,
    AVG(revenue::numeric / NULLIF(hours::numeric, 0)) as avg_hourly_rate,
    MAX(created_at) as last_job_created,
    MIN(created_at) as first_job_created
  FROM jobs
  GROUP BY user_id
),

-- Competitor research activity
competitor_stats AS (
  SELECT 
    user_id,
    COUNT(*) as total_competitors_tracked,
    MAX(created_at) as last_competitor_added,
    COUNT(*) FILTER (WHERE is_active = true) as active_competitors
  FROM competitors
  GROUP BY user_id
),

-- AI usage stats
ai_stats AS (
  SELECT 
    user_id,
    COUNT(*) as total_ai_requests,
    COUNT(*) FILTER (WHERE created_at >= now() - interval '30 days') as ai_requests_last_30_days,
    AVG(CASE WHEN success = true THEN 1 ELSE 0 END) as ai_success_rate,
    MAX(created_at) as last_ai_request
  FROM ai_requests
  GROUP BY user_id
)

SELECT 
  u.id as user_id,
  u.email,
  u.business_name,
  u.business_type,
  u.created_at as signup_date,
  EXTRACT(DAY FROM now() - u.created_at)::integer as days_since_signup,
  
  -- Login engagement
  COALESCE(l.total_logins, 0)::integer as total_logins,
  COALESCE(l.unique_login_days, 0)::integer as unique_login_days,
  l.last_login,
  EXTRACT(DAY FROM now() - COALESCE(l.last_login, u.created_at))::integer as days_since_last_login,
  
  -- Job engagement
  COALESCE(j.total_jobs, 0)::integer as total_jobs_created,
  COALESCE(j.jobs_last_30_days, 0)::integer as jobs_last_30_days,
  COALESCE(j.jobs_last_7_days, 0)::integer as jobs_last_7_days,
  COALESCE(j.active_job_days, 0)::integer as days_with_job_activity,
  COALESCE(j.total_revenue_tracked, 0) as total_revenue_tracked,
  COALESCE(j.avg_job_revenue, 0) as avg_job_revenue,
  COALESCE(j.total_profit, 0) as total_profit_tracked,
  COALESCE(j.avg_hourly_rate, 0) as avg_hourly_rate,
  j.last_job_created,
  EXTRACT(DAY FROM now() - COALESCE(j.last_job_created, u.created_at))::integer as days_since_last_job,
  
  -- Competitor research engagement
  COALESCE(c.total_competitors_tracked, 0)::integer as competitors_tracked,
  COALESCE(c.active_competitors, 0)::integer as active_competitors,
  c.last_competitor_added,
  
  -- AI feature engagement
  COALESCE(a.total_ai_requests, 0)::integer as total_ai_requests,
  COALESCE(a.ai_requests_last_30_days, 0)::integer as ai_requests_last_30_days,
  COALESCE(a.ai_success_rate, 0) as ai_success_rate,
  a.last_ai_request,
  
  -- Engagement scoring (health score 0-100)
  LEAST(100, GREATEST(0,
    (CASE WHEN l.total_logins > 0 THEN 20 ELSE 0 END) + -- logged in = 20 points
    (CASE WHEN j.total_jobs >= 5 THEN 30 ELSE j.total_jobs * 6 END) + -- jobs = up to 30 points
    (CASE WHEN c.total_competitors_tracked > 0 THEN 20 ELSE 0 END) + -- competitor research = 20 points
    (CASE WHEN a.total_ai_requests > 0 THEN 15 ELSE 0 END) + -- AI usage = 15 points
    (CASE WHEN j.jobs_last_7_days > 0 THEN 15 ELSE 0 END) -- recent activity = 15 points
  ))::integer as engagement_score,
  
  -- Activity recency flag
  CASE 
    WHEN j.jobs_last_7_days > 0 OR l.last_login > now() - interval '7 days' THEN 'active'
    WHEN j.jobs_last_30_days > 0 OR l.last_login > now() - interval '30 days' THEN 'casual'
    WHEN l.last_login > now() - interval '90 days' THEN 'at_risk'
    ELSE 'dormant'
  END as activity_status,
  
  -- Value indicators
  CASE 
    WHEN j.total_jobs >= 20 AND j.jobs_last_30_days >= 5 THEN 'power_user'
    WHEN j.total_jobs >= 10 AND j.jobs_last_30_days >= 2 THEN 'engaged'
    WHEN j.total_jobs >= 5 THEN 'moderate'
    WHEN j.total_jobs > 0 THEN 'light'
    ELSE 'inactive'
  END as user_segment,
  
  -- Last updated
  now() as metrics_calculated_at

FROM users u
LEFT JOIN login_stats l ON u.id = l.user_id
LEFT JOIN job_stats j ON u.id = j.user_id
LEFT JOIN competitor_stats c ON u.id = c.user_id
LEFT JOIN ai_stats a ON u.id = a.user_id;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE UNIQUE INDEX idx_engagement_metrics_user_id ON user_engagement_metrics(user_id);
CREATE INDEX idx_engagement_metrics_score ON user_engagement_metrics(engagement_score DESC);
CREATE INDEX idx_engagement_metrics_status ON user_engagement_metrics(activity_status);
CREATE INDEX idx_engagement_metrics_segment ON user_engagement_metrics(user_segment);
CREATE INDEX idx_engagement_metrics_last_activity ON user_engagement_metrics(days_since_last_job);

-- ============================================================================
-- REFRESH FUNCTION
-- ============================================================================

-- Function to refresh the materialized view (run daily via cron)
CREATE OR REPLACE FUNCTION refresh_engagement_metrics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_engagement_metrics;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- NOTES
-- ============================================================================
-- To apply this materialized view to your Supabase database:
-- 1. IMPORTANT: Make sure you've switched to Supabase Auth first!
--    This view queries auth.audit_log_entries which only exists with Supabase Auth
-- 2. Go to your Supabase dashboard
-- 3. Navigate to SQL Editor
-- 4. Copy and paste this entire file
-- 5. Click "Run" to execute
--
-- The materialized view will be refreshed:
-- - Automatically via cron job (see 07_cron_jobs.sql)
-- - Manually by calling: SELECT refresh_engagement_metrics();
--
-- To query the engagement metrics:
-- SELECT * FROM user_engagement_metrics ORDER BY engagement_score DESC;
-- ============================================================================
