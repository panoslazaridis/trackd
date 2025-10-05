-- Trigger Functions for TrackD Analytics
-- Auto-update timestamps, set subscription entitlements, and more

-- ============================================================================
-- UPDATE TIMESTAMP TRIGGER FUNCTION
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitors_updated_at
  BEFORE UPDATE ON competitors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insights_updated_at
  BEFORE UPDATE ON insights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SUBSCRIPTION ENTITLEMENTS TRIGGER FUNCTION
-- ============================================================================

-- Function to automatically set entitlements when subscription tier changes
CREATE OR REPLACE FUNCTION set_subscription_entitlements()
RETURNS TRIGGER AS $$
BEGIN
  -- Free tier
  IF NEW.subscription_tier = 'free' THEN
    NEW.max_jobs_per_month := 20;
    NEW.max_competitors := 3;
    NEW.ai_parsing_credits_monthly := 10;
    NEW.feature_advanced_analytics := false;
    NEW.feature_competitor_alerts := false;
    NEW.feature_export_reports := false;
    NEW.feature_api_access := false;
    NEW.feature_whatsapp_integration := false;
    NEW.feature_white_label := false;
    NEW.feature_multi_user := false;
    NEW.monthly_price_gbp := 0;
  
  -- Basic tier (£9/month)
  ELSIF NEW.subscription_tier = 'basic' THEN
    NEW.max_jobs_per_month := 100;
    NEW.max_competitors := 5;
    NEW.ai_parsing_credits_monthly := 50;
    NEW.feature_advanced_analytics := true;
    NEW.feature_competitor_alerts := false;
    NEW.feature_export_reports := true;
    NEW.feature_api_access := false;
    NEW.feature_whatsapp_integration := false;
    NEW.feature_white_label := false;
    NEW.feature_multi_user := false;
    NEW.monthly_price_gbp := 9;
  
  -- Professional tier (£19/month)
  ELSIF NEW.subscription_tier = 'professional' THEN
    NEW.max_jobs_per_month := NULL; -- unlimited
    NEW.max_competitors := 10;
    NEW.ai_parsing_credits_monthly := 200;
    NEW.feature_advanced_analytics := true;
    NEW.feature_competitor_alerts := true;
    NEW.feature_export_reports := true;
    NEW.feature_api_access := false;
    NEW.feature_whatsapp_integration := true;
    NEW.feature_white_label := false;
    NEW.feature_multi_user := true;
    NEW.monthly_price_gbp := 19;
  
  -- Premium tier (£39/month)
  ELSIF NEW.subscription_tier = 'premium' THEN
    NEW.max_jobs_per_month := NULL;
    NEW.max_competitors := 25;
    NEW.ai_parsing_credits_monthly := 500;
    NEW.feature_advanced_analytics := true;
    NEW.feature_competitor_alerts := true;
    NEW.feature_export_reports := true;
    NEW.feature_api_access := true;
    NEW.feature_whatsapp_integration := true;
    NEW.feature_white_label := true;
    NEW.feature_multi_user := true;
    NEW.monthly_price_gbp := 39;
  
  -- Enterprise tier (£99/month)
  ELSIF NEW.subscription_tier = 'enterprise' THEN
    NEW.max_jobs_per_month := NULL;
    NEW.max_competitors := NULL; -- unlimited
    NEW.ai_parsing_credits_monthly := NULL; -- unlimited
    NEW.feature_advanced_analytics := true;
    NEW.feature_competitor_alerts := true;
    NEW.feature_export_reports := true;
    NEW.feature_api_access := true;
    NEW.feature_whatsapp_integration := true;
    NEW.feature_white_label := true;
    NEW.feature_multi_user := true;
    NEW.monthly_price_gbp := 99;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to user_subscriptions table
CREATE TRIGGER trigger_set_subscription_entitlements
  BEFORE INSERT OR UPDATE OF subscription_tier ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION set_subscription_entitlements();

-- ============================================================================
-- SUBSCRIPTION EVENT LOGGING TRIGGER FUNCTION
-- ============================================================================

-- Function to automatically log subscription changes
CREATE OR REPLACE FUNCTION log_subscription_change()
RETURNS TRIGGER AS $$
DECLARE
  v_event_type text;
  v_mrr_change decimal(10,2);
  v_is_expansion boolean := false;
  v_is_contraction boolean := false;
BEGIN
  -- Determine event type and MRR impact
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'subscription_created';
    v_mrr_change := NEW.monthly_price_gbp;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Tier change
    IF OLD.subscription_tier != NEW.subscription_tier THEN
      IF NEW.monthly_price_gbp > OLD.monthly_price_gbp THEN
        v_event_type := 'upgraded';
        v_is_expansion := true;
      ELSE
        v_event_type := 'downgraded';
        v_is_contraction := true;
      END IF;
      v_mrr_change := NEW.monthly_price_gbp - OLD.monthly_price_gbp;
    
    -- Trial conversion
    ELSIF OLD.trial_active = true AND NEW.trial_active = false AND NEW.trial_converted_to_paid = true THEN
      v_event_type := 'trial_converted';
      v_mrr_change := NEW.monthly_price_gbp;
      v_is_expansion := true;
    
    -- Cancellation
    ELSIF OLD.cancel_at_period_end = false AND NEW.cancel_at_period_end = true THEN
      v_event_type := 'canceled';
      v_mrr_change := -OLD.monthly_price_gbp;
      v_is_contraction := true;
    
    -- Reactivation
    ELSIF OLD.subscription_status = 'canceled' AND NEW.subscription_status = 'active' THEN
      v_event_type := 'reactivated';
      v_mrr_change := NEW.monthly_price_gbp;
      v_is_expansion := true;
    
    ELSE
      -- No significant change
      RETURN NEW;
    END IF;
    
    -- Insert event log
    INSERT INTO subscription_events (
      user_id,
      subscription_id,
      event_type,
      previous_tier,
      new_tier,
      previous_monthly_price,
      new_monthly_price,
      mrr_change,
      is_expansion,
      is_contraction,
      triggered_by
    ) VALUES (
      NEW.user_id,
      NEW.id,
      v_event_type,
      OLD.subscription_tier,
      NEW.subscription_tier,
      OLD.monthly_price_gbp,
      NEW.monthly_price_gbp,
      v_mrr_change,
      v_is_expansion,
      v_is_contraction,
      'system'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to user_subscriptions table
CREATE TRIGGER trigger_log_subscription_change
  AFTER INSERT OR UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION log_subscription_change();

-- ============================================================================
-- NOTES
-- ============================================================================
-- To apply these triggers to your Supabase database:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Click "Run" to execute
--
-- These triggers will:
-- - Auto-update updated_at timestamps on all tables
-- - Auto-set feature entitlements when subscription tier changes
-- - Auto-log all subscription changes for MRR/churn analysis
-- ============================================================================
