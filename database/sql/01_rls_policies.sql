-- Row Level Security Policies for TrackD Analytics
-- These policies ensure users can only access their own data
-- Admin user (lazaridispanagiwtis@gmail.com) has full access

-- ============================================================================
-- AI REQUESTS TABLE
-- ============================================================================

-- Enable RLS
ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;

-- Users can view only their own AI requests
CREATE POLICY "Users can view own AI requests"
  ON ai_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own AI requests
CREATE POLICY "Users can insert own AI requests"
  ON ai_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin full access to AI requests
CREATE POLICY "Admin full access to AI requests"
  ON ai_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND email = 'lazaridispanagiwtis@gmail.com'
    )
  );

-- ============================================================================
-- USER SUBSCRIPTIONS TABLE
-- ============================================================================

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view only their own subscription
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own subscription (for cancellation, etc.)
CREATE POLICY "Users can update own subscription"
  ON user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin full access to subscriptions
CREATE POLICY "Admin full access to subscriptions"
  ON user_subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND email = 'lazaridispanagiwtis@gmail.com'
    )
  );

-- ============================================================================
-- SUBSCRIPTION EVENTS TABLE
-- ============================================================================

-- Enable RLS
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- Users can view only their own subscription events
CREATE POLICY "Users can view own subscription events"
  ON subscription_events FOR SELECT
  USING (auth.uid() = user_id);

-- Admin full access to subscription events
CREATE POLICY "Admin full access to subscription events"
  ON subscription_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND email = 'lazaridispanagiwtis@gmail.com'
    )
  );

-- ============================================================================
-- EXISTING TABLES (Jobs, Customers, Competitors, Insights)
-- ============================================================================

-- Jobs table RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs"
  ON jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs"
  ON jobs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admin full access to jobs"
  ON jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND email = 'lazaridispanagiwtis@gmail.com'
    )
  );

-- Customers table RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customers"
  ON customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers"
  ON customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers"
  ON customers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers"
  ON customers FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admin full access to customers"
  ON customers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND email = 'lazaridispanagiwtis@gmail.com'
    )
  );

-- Competitors table RLS
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own competitors"
  ON competitors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own competitors"
  ON competitors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own competitors"
  ON competitors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own competitors"
  ON competitors FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admin full access to competitors"
  ON competitors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND email = 'lazaridispanagiwtis@gmail.com'
    )
  );

-- Insights table RLS
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights"
  ON insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
  ON insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON insights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights"
  ON insights FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admin full access to insights"
  ON insights FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND email = 'lazaridispanagiwtis@gmail.com'
    )
  );

-- ============================================================================
-- NOTES
-- ============================================================================
-- To apply these policies to your Supabase database:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Click "Run" to execute
--
-- These policies will automatically work once you switch to Supabase Auth
-- because auth.uid() will return the authenticated user's ID from Supabase Auth
-- ============================================================================
