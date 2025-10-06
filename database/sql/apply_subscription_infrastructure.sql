-- ============================================================================
-- TrackD Subscription Infrastructure (Session-Based Auth Compatible)
-- ============================================================================
-- This script applies subscription management features without RLS policies
-- Compatible with session-based authentication (no Supabase Auth required)
-- Apply after tables are created via Drizzle schema
-- ============================================================================

-- ============================================================================
-- 1. TRIGGER FUNCTIONS
-- ============================================================================

-- Auto-set entitlements when subscription tier changes
CREATE OR REPLACE FUNCTION auto_set_subscription_entitlements()
RETURNS TRIGGER AS $$
BEGIN
  -- Set entitlements based on tier
  CASE NEW.subscription_tier
    WHEN 'free' THEN
      NEW.max_jobs_per_month := 20;
      NEW.max_competitors := 3;
      NEW.ai_parsing_credits_monthly := 10;
      NEW.feature_advanced_analytics := false;
      NEW.feature_competitor_alerts := false;
      NEW.feature_export_reports := false;
      NEW.feature_api_access := false;
      NEW.feature_whatsapp_integration := false;
      NEW.feature_white_label := false;
    WHEN 'basic' THEN
      NEW.max_jobs_per_month := 100;
      NEW.max_competitors := 5;
      NEW.ai_parsing_credits_monthly := 50;
      NEW.feature_advanced_analytics := true;
      NEW.feature_export_reports := true;
      NEW.feature_competitor_alerts := false;
      NEW.feature_api_access := false;
      NEW.feature_whatsapp_integration := false;
      NEW.feature_white_label := false;
    WHEN 'professional' THEN
      NEW.max_jobs_per_month := NULL; -- unlimited
      NEW.max_competitors := 10;
      NEW.ai_parsing_credits_monthly := 200;
      NEW.feature_advanced_analytics := true;
      NEW.feature_export_reports := true;
      NEW.feature_competitor_alerts := true;
      NEW.feature_whatsapp_integration := true;
      NEW.feature_api_access := false;
      NEW.feature_white_label := false;
    WHEN 'premium' THEN
      NEW.max_jobs_per_month := NULL;
      NEW.max_competitors := 25;
      NEW.ai_parsing_credits_monthly := 500;
      NEW.feature_advanced_analytics := true;
      NEW.feature_export_reports := true;
      NEW.feature_competitor_alerts := true;
      NEW.feature_whatsapp_integration := true;
      NEW.feature_api_access := true;
      NEW.feature_white_label := true;
    WHEN 'enterprise' THEN
      NEW.max_jobs_per_month := NULL;
      NEW.max_competitors := NULL; -- unlimited
      NEW.ai_parsing_credits_monthly := NULL; -- unlimited
      NEW.feature_advanced_analytics := true;
      NEW.feature_export_reports := true;
      NEW.feature_competitor_alerts := true;
      NEW.feature_whatsapp_integration := true;
      NEW.feature_api_access := true;
      NEW.feature_white_label := true;
      NEW.feature_multi_user := true;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_subscription_entitlements
  BEFORE INSERT OR UPDATE OF subscription_tier ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_subscription_entitlements();

-- Log subscription events for analytics
CREATE OR REPLACE FUNCTION log_subscription_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO subscription_events (user_id, subscription_id, event_type, new_tier, new_monthly_price, mrr_change)
    VALUES (NEW.user_id, NEW.id, 'subscription_created', NEW.subscription_tier, NEW.monthly_price_gbp, NEW.monthly_price_gbp);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Tier change
    IF OLD.subscription_tier != NEW.subscription_tier THEN
      INSERT INTO subscription_events (user_id, subscription_id, event_type, previous_tier, new_tier, previous_monthly_price, new_monthly_price, mrr_change, is_expansion, is_contraction)
      VALUES (
        NEW.user_id, 
        NEW.id, 
        CASE 
          WHEN NEW.monthly_price_gbp > OLD.monthly_price_gbp THEN 'upgraded'
          ELSE 'downgraded'
        END,
        OLD.subscription_tier, 
        NEW.subscription_tier, 
        OLD.monthly_price_gbp, 
        NEW.monthly_price_gbp, 
        NEW.monthly_price_gbp - OLD.monthly_price_gbp,
        NEW.monthly_price_gbp > OLD.monthly_price_gbp,
        NEW.monthly_price_gbp < OLD.monthly_price_gbp
      );
    END IF;
    
    -- Status change (cancellation, reactivation)
    IF OLD.subscription_status != NEW.subscription_status THEN
      IF NEW.subscription_status = 'canceled' THEN
        INSERT INTO subscription_events (user_id, subscription_id, event_type, previous_tier, mrr_change, is_contraction)
        VALUES (NEW.user_id, NEW.id, 'subscription_canceled', NEW.subscription_tier, -OLD.monthly_price_gbp, true);
      ELSIF NEW.subscription_status = 'active' AND OLD.subscription_status = 'canceled' THEN
        INSERT INTO subscription_events (user_id, subscription_id, event_type, new_tier, new_monthly_price, mrr_change, is_expansion)
        VALUES (NEW.user_id, NEW.id, 'subscription_reactivated', NEW.subscription_tier, NEW.monthly_price_gbp, NEW.monthly_price_gbp, true);
      END IF;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO subscription_events (user_id, subscription_id, event_type, previous_tier, mrr_change, is_contraction)
    VALUES (OLD.user_id, OLD.id, 'subscription_ended', OLD.subscription_tier, -OLD.monthly_price_gbp, true);
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER track_subscription_events
  AFTER INSERT OR UPDATE OR DELETE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION log_subscription_event();

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 2. MATERIALIZED VIEW: User Engagement Metrics
-- ============================================================================

DROP MATERIALIZED VIEW IF EXISTS user_engagement_metrics CASCADE;

CREATE MATERIALIZED VIEW user_engagement_metrics AS
SELECT
  u.id AS user_id,
  u.subscription_tier,
  us.subscription_status,
  us.subscription_tier AS current_tier,
  
  -- Activity metrics
  COUNT(DISTINCT j.id) AS total_jobs,
  COUNT(DISTINCT CASE WHEN j.created_at >= NOW() - INTERVAL '30 days' THEN j.id END) AS jobs_last_30_days,
  COUNT(DISTINCT c.id) AS total_customers,
  COUNT(DISTINCT comp.id) AS total_competitors,
  
  -- AI usage
  COUNT(DISTINCT air.id) AS total_ai_requests,
  COALESCE(SUM(air.total_tokens), 0) AS total_ai_tokens,
  COALESCE(SUM(air.estimated_cost), 0) AS total_ai_cost,
  
  -- Engagement score (0-100)
  LEAST(100, 
    (COUNT(DISTINCT j.id) / 10.0 * 30) + 
    (COUNT(DISTINCT c.id) / 5.0 * 20) + 
    (COUNT(DISTINCT comp.id) / 3.0 * 20) + 
    (COUNT(DISTINCT air.id) / 10.0 * 30)
  )::INTEGER AS engagement_score,
  
  -- Last activity
  GREATEST(
    MAX(j.created_at),
    MAX(c.created_at),
    MAX(comp.created_at),
    MAX(air.created_at)
  ) AS last_activity_at,
  
  -- User tenure
  EXTRACT(DAY FROM NOW() - u.created_at) AS days_since_signup,
  
  NOW() AS refreshed_at
  
FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
LEFT JOIN jobs j ON u.id = j.user_id
LEFT JOIN customers c ON u.id = c.user_id
LEFT JOIN competitors comp ON u.id = comp.user_id
LEFT JOIN ai_requests air ON u.id = air.user_id
GROUP BY u.id, u.subscription_tier, us.subscription_status, us.subscription_tier;

-- Create index for fast lookups
CREATE UNIQUE INDEX idx_user_engagement_metrics_user_id 
  ON user_engagement_metrics(user_id);

-- ============================================================================
-- 3. ANALYTICS VIEWS
-- ============================================================================

-- Revenue Dashboard
CREATE OR REPLACE VIEW revenue_dashboard AS
SELECT
  -- Current MRR
  COALESCE(SUM(CASE WHEN subscription_status = 'active' THEN monthly_price_gbp ELSE 0 END), 0) AS current_mrr,
  
  -- MRR by tier
  COALESCE(SUM(CASE WHEN subscription_status = 'active' AND subscription_tier = 'basic' THEN monthly_price_gbp ELSE 0 END), 0) AS mrr_basic,
  COALESCE(SUM(CASE WHEN subscription_status = 'active' AND subscription_tier = 'professional' THEN monthly_price_gbp ELSE 0 END), 0) AS mrr_professional,
  COALESCE(SUM(CASE WHEN subscription_status = 'active' AND subscription_tier = 'premium' THEN monthly_price_gbp ELSE 0 END), 0) AS mrr_premium,
  COALESCE(SUM(CASE WHEN subscription_status = 'active' AND subscription_tier = 'enterprise' THEN monthly_price_gbp ELSE 0 END), 0) AS mrr_enterprise,
  
  -- Customer counts
  COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) AS active_subscribers,
  COUNT(CASE WHEN subscription_status = 'trialing' THEN 1 END) AS trial_subscribers,
  COUNT(CASE WHEN subscription_status = 'canceled' THEN 1 END) AS cancelled_subscribers,
  
  -- ARPU (Average Revenue Per User)
  CASE 
    WHEN COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) > 0 
    THEN COALESCE(SUM(CASE WHEN subscription_status = 'active' THEN monthly_price_gbp ELSE 0 END), 0) / 
         COUNT(CASE WHEN subscription_status = 'active' THEN 1 END)
    ELSE 0 
  END AS arpu,
  
  -- Lifetime metrics
  COALESCE(SUM(total_revenue_all_time), 0) AS total_lifetime_value,
  COALESCE(AVG(total_revenue_all_time), 0) AS avg_lifetime_value
  
FROM user_subscriptions;

-- User Health Score
CREATE OR REPLACE VIEW user_health_scores AS
SELECT
  u.id AS user_id,
  u.business_name,
  u.email,
  us.subscription_tier,
  us.subscription_status,
  
  -- Engagement metrics
  uem.engagement_score,
  uem.jobs_last_30_days,
  uem.total_ai_requests,
  uem.last_activity_at,
  
  -- Health indicators
  CASE
    WHEN uem.last_activity_at < NOW() - INTERVAL '30 days' THEN 'at_risk'
    WHEN uem.last_activity_at < NOW() - INTERVAL '14 days' THEN 'low'
    WHEN uem.engagement_score >= 70 THEN 'high'
    WHEN uem.engagement_score >= 40 THEN 'medium'
    ELSE 'low'
  END AS health_status,
  
  -- Usage vs limits
  CASE 
    WHEN us.max_jobs_per_month IS NOT NULL AND uem.jobs_last_30_days >= us.max_jobs_per_month * 0.8 
    THEN 'approaching_limit'
    WHEN us.max_jobs_per_month IS NOT NULL AND uem.jobs_last_30_days >= us.max_jobs_per_month 
    THEN 'at_limit'
    ELSE 'healthy'
  END AS usage_status,
  
  -- Recommendations
  CASE
    WHEN us.subscription_tier = 'free' AND uem.jobs_last_30_days >= 15 THEN 'Upgrade to Basic for more jobs'
    WHEN us.subscription_tier = 'basic' AND uem.total_competitors >= 4 THEN 'Upgrade to Professional for more competitor tracking'
    WHEN uem.last_activity_at < NOW() - INTERVAL '30 days' THEN 'Re-engagement campaign needed'
    ELSE NULL
  END AS recommendation

FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
LEFT JOIN user_engagement_metrics uem ON u.id = uem.user_id;

-- Cohort Analysis
CREATE OR REPLACE VIEW cohort_analysis AS
SELECT
  DATE_TRUNC('month', u.created_at) AS cohort_month,
  us.subscription_tier,
  
  COUNT(DISTINCT u.id) AS cohort_size,
  COUNT(DISTINCT CASE WHEN us.subscription_status = 'active' THEN u.id END) AS active_users,
  COUNT(DISTINCT CASE WHEN us.subscription_status = 'canceled' THEN u.id END) AS churned_users,
  
  -- Retention rate
  CASE 
    WHEN COUNT(DISTINCT u.id) > 0 
    THEN (COUNT(DISTINCT CASE WHEN us.subscription_status = 'active' THEN u.id END)::FLOAT / 
          COUNT(DISTINCT u.id) * 100)
    ELSE 0 
  END AS retention_rate,
  
  -- Revenue metrics
  COALESCE(SUM(CASE WHEN us.subscription_status = 'active' THEN us.monthly_price_gbp ELSE 0 END), 0) AS cohort_mrr,
  COALESCE(AVG(us.total_revenue_all_time), 0) AS avg_ltv

FROM users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
GROUP BY DATE_TRUNC('month', u.created_at), us.subscription_tier
ORDER BY cohort_month DESC, us.subscription_tier;

-- Feature Adoption Funnel
CREATE OR REPLACE VIEW feature_adoption AS
SELECT
  COUNT(DISTINCT u.id) AS total_users,
  
  -- Core features
  COUNT(DISTINCT CASE WHEN EXISTS(SELECT 1 FROM jobs WHERE user_id = u.id) THEN u.id END) AS users_with_jobs,
  COUNT(DISTINCT CASE WHEN EXISTS(SELECT 1 FROM customers WHERE user_id = u.id) THEN u.id END) AS users_with_customers,
  COUNT(DISTINCT CASE WHEN EXISTS(SELECT 1 FROM competitors WHERE user_id = u.id) THEN u.id END) AS users_with_competitors,
  COUNT(DISTINCT CASE WHEN EXISTS(SELECT 1 FROM ai_requests WHERE user_id = u.id) THEN u.id END) AS users_with_ai,
  
  -- Adoption rates
  CASE 
    WHEN COUNT(DISTINCT u.id) > 0 
    THEN (COUNT(DISTINCT CASE WHEN EXISTS(SELECT 1 FROM jobs WHERE user_id = u.id) THEN u.id END)::FLOAT / 
          COUNT(DISTINCT u.id) * 100)
    ELSE 0 
  END AS jobs_adoption_rate,
  
  CASE 
    WHEN COUNT(DISTINCT u.id) > 0 
    THEN (COUNT(DISTINCT CASE WHEN EXISTS(SELECT 1 FROM customers WHERE user_id = u.id) THEN u.id END)::FLOAT / 
          COUNT(DISTINCT u.id) * 100)
    ELSE 0 
  END AS customers_adoption_rate,
  
  CASE 
    WHEN COUNT(DISTINCT u.id) > 0 
    THEN (COUNT(DISTINCT CASE WHEN EXISTS(SELECT 1 FROM competitors WHERE user_id = u.id) THEN u.id END)::FLOAT / 
          COUNT(DISTINCT u.id) * 100)
    ELSE 0 
  END AS competitors_adoption_rate,
  
  CASE 
    WHEN COUNT(DISTINCT u.id) > 0 
    THEN (COUNT(DISTINCT CASE WHEN EXISTS(SELECT 1 FROM ai_requests WHERE user_id = u.id) THEN u.id END)::FLOAT / 
          COUNT(DISTINCT u.id) * 100)
    ELSE 0 
  END AS ai_adoption_rate

FROM users u;

-- ============================================================================
-- INSTALLATION COMPLETE
-- ============================================================================
-- To manually refresh engagement metrics:
-- REFRESH MATERIALIZED VIEW CONCURRENTLY user_engagement_metrics;
--
-- To view analytics:
-- SELECT * FROM revenue_dashboard;
-- SELECT * FROM user_health_scores;
-- SELECT * FROM cohort_analysis;
-- SELECT * FROM feature_adoption;
-- ============================================================================
