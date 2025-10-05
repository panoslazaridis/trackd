-- Scheduled Cron Jobs for TrackD Analytics
-- Automatic maintenance tasks for engagement metrics, subscriptions, and trials

-- ============================================================================
-- PREREQUISITE: Install pg_cron extension
-- ============================================================================
-- Run this first if pg_cron is not enabled:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Note: In Supabase, you can enable pg_cron from the Database > Extensions page

-- ============================================================================
-- CRON JOB 1: Daily Engagement Metrics Refresh
-- ============================================================================

-- Refresh user engagement metrics every day at 2 AM UTC
SELECT cron.schedule(
  'refresh-engagement-metrics',
  '0 2 * * *', -- Every day at 2 AM
  $$ SELECT refresh_engagement_metrics(); $$
);

-- ============================================================================
-- CRON JOB 2: Monthly Subscription Metrics Update
-- ============================================================================

-- Update subscription lifetime metrics on the 1st of each month at 3 AM UTC
SELECT cron.schedule(
  'update-subscription-lifetime-metrics',
  '0 3 1 * *', -- 1st of month at 3 AM
  $$
    UPDATE user_subscriptions
    SET 
      months_as_customer = EXTRACT(MONTH FROM AGE(now(), subscription_start_date))::integer,
      total_revenue_all_time = (
        SELECT COALESCE(SUM(new_monthly_price::numeric), 0)
        FROM subscription_events
        WHERE subscription_id = user_subscriptions.id
          AND event_type IN ('payment_succeeded', 'trial_converted')
      )
    WHERE subscription_status IN ('active', 'trialing');
  $$
);

-- ============================================================================
-- CRON JOB 3: Weekly Trial Expiration Check
-- ============================================================================

-- Check for expired trials every Monday at 9 AM UTC
SELECT cron.schedule(
  'check-trial-expirations',
  '0 9 * * 1', -- Every Monday at 9 AM
  $$
    UPDATE user_subscriptions
    SET 
      trial_active = false,
      subscription_status = 'canceled'
    WHERE trial_active = true
      AND trial_end_date < now()
      AND NOT trial_converted_to_paid;
  $$
);

-- ============================================================================
-- CRON JOB 4: Monthly Usage Reset
-- ============================================================================

-- Reset monthly usage counters on the 1st of each month at 1 AM UTC
SELECT cron.schedule(
  'reset-monthly-usage',
  '0 1 1 * *', -- 1st of month at 1 AM
  $$
    UPDATE user_subscriptions
    SET 
      usage_jobs_created_this_month = 0,
      usage_ai_parsing_this_month = 0,
      usage_reports_exported_this_month = 0,
      usage_period_start = now()
    WHERE subscription_status IN ('active', 'trialing');
  $$
);

-- ============================================================================
-- CRON JOB 5: Weekly Churn Risk Alert (Future Enhancement)
-- ============================================================================

-- Identify at-risk users every Monday at 10 AM UTC
-- This can trigger email notifications or internal alerts
SELECT cron.schedule(
  'identify-churn-risk-users',
  '0 10 * * 1', -- Every Monday at 10 AM
  $$
    -- This is a placeholder for future implementation
    -- You could insert into a notifications table or trigger webhooks
    INSERT INTO insights (
      user_id,
      type,
      priority,
      title,
      description,
      status,
      ai_generated
    )
    SELECT 
      user_id,
      'churn_risk',
      'high',
      'High Churn Risk Detected',
      'User has been inactive for ' || days_since_last_login || ' days. Consider reaching out.',
      'active',
      false
    FROM user_health_dashboard
    WHERE churn_risk_score > 70
      AND subscription_tier != 'free'
      AND NOT EXISTS (
        SELECT 1 FROM insights 
        WHERE insights.user_id = user_health_dashboard.user_id 
        AND insights.type = 'churn_risk'
        AND insights.created_at > now() - interval '7 days'
      );
  $$
);

-- ============================================================================
-- MONITORING: View Scheduled Jobs
-- ============================================================================

-- To see all scheduled cron jobs:
-- SELECT * FROM cron.job;

-- To see job execution history:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 100;

-- ============================================================================
-- MANAGEMENT: Unscheduling Jobs
-- ============================================================================

-- To unschedule a job (if needed):
-- SELECT cron.unschedule('refresh-engagement-metrics');
-- SELECT cron.unschedule('update-subscription-lifetime-metrics');
-- SELECT cron.unschedule('check-trial-expirations');
-- SELECT cron.unschedule('reset-monthly-usage');
-- SELECT cron.unschedule('identify-churn-risk-users');

-- ============================================================================
-- NOTES
-- ============================================================================
-- To apply these cron jobs to your Supabase database:
-- 
-- 1. IMPORTANT: Enable pg_cron extension first!
--    Go to Database > Extensions in Supabase dashboard and enable pg_cron
--
-- 2. Go to SQL Editor in your Supabase dashboard
-- 3. Copy and paste this entire file
-- 4. Click "Run" to execute
--
-- All times are in UTC. Adjust the cron schedules if needed:
-- Format: minute hour day month weekday
-- 
-- Examples:
-- '0 2 * * *'    = Every day at 2:00 AM
-- '0 3 1 * *'    = 1st of month at 3:00 AM
-- '0 9 * * 1'    = Every Monday at 9:00 AM
-- '*/15 * * * *' = Every 15 minutes
-- '0 */6 * * *'  = Every 6 hours
--
-- The scheduled jobs will:
-- - Keep engagement metrics fresh (daily refresh)
-- - Track subscription lifetime value (monthly calculation)
-- - Expire trials automatically (weekly check)
-- - Reset usage counters (monthly reset)
-- - Identify at-risk users (weekly analysis)
-- ============================================================================
