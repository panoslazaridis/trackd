## TrackD Analytics - SQL Scripts for Supabase

This directory contains SQL scripts to set up advanced features for your TrackD analytics platform including Row Level Security, automated triggers, materialized views, and analytics dashboards.

### ⚠️ Important Prerequisites

1. **Supabase Auth Must Be Enabled**
   - These scripts assume you're using Supabase's built-in authentication
   - The RLS policies use `auth.uid()` which only works with Supabase Auth
   - The engagement metrics view queries `auth.audit_log_entries` for login tracking

2. **pg_cron Extension Required** (for scheduled jobs)
   - Go to Database > Extensions in Supabase dashboard
   - Enable "pg_cron" extension

### 📁 Files Overview

| File | Purpose | Dependencies |
|------|---------|--------------|
| `01_rls_policies.sql` | Row Level Security policies - users see only their data | None |
| `02_trigger_functions.sql` | Auto-update timestamps, set entitlements, log events | None |
| `03_materialized_view_engagement.sql` | Pre-calculated user engagement metrics | Supabase Auth |
| `04_analytics_views.sql` | Revenue, health, cohort, and feature adoption views | File 03 |
| `05_cron_jobs.sql` | Scheduled maintenance tasks | pg_cron extension, Files 03 & 04 |

### 🚀 Installation Steps

#### Step 1: Apply RLS Policies
```sql
-- File: 01_rls_policies.sql
```
1. Open your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy the entire contents of `01_rls_policies.sql`
4. Paste and click **Run**

This enables Row Level Security on all tables ensuring users can only access their own data.

#### Step 2: Create Trigger Functions
```sql
-- File: 02_trigger_functions.sql
```
1. In SQL Editor
2. Copy the entire contents of `02_trigger_functions.sql`
3. Paste and click **Run**

This creates automatic behaviors:
- Auto-update `updated_at` timestamps
- Auto-set subscription entitlements when tier changes
- Auto-log subscription events for MRR/churn tracking

#### Step 3: Create Engagement Metrics View
```sql
-- File: 03_materialized_view_engagement.sql
```
1. In SQL Editor
2. Copy the entire contents of `03_materialized_view_engagement.sql`
3. Paste and click **Run**

This creates a materialized view combining:
- Login frequency (from Supabase Auth logs)
- Job activity metrics
- Competitor research engagement
- AI usage statistics
- Engagement scoring (0-100)

#### Step 4: Create Analytics Views
```sql
-- File: 04_analytics_views.sql
```
1. In SQL Editor
2. Copy the entire contents of `04_analytics_views.sql`
3. Paste and click **Run**

This creates 6 analytical views:
- **revenue_dashboard**: MRR, ARPU, LTV by tier
- **user_health_dashboard**: Churn risk scoring
- **cohort_analysis**: Retention and monetization by signup month
- **feature_adoption_funnel**: Feature usage conversion rates
- **ai_usage_analytics**: AI costs and token usage
- **subscription_tier_performance**: Metrics by pricing tier

#### Step 5: Schedule Maintenance Jobs
```sql
-- File: 05_cron_jobs.sql
```
1. **First**, enable pg_cron:
   - Go to **Database > Extensions**
   - Search for "pg_cron"
   - Click **Enable**

2. Then in SQL Editor:
   - Copy the entire contents of `05_cron_jobs.sql`
   - Paste and click **Run**

This schedules:
- **Daily** (2 AM UTC): Refresh engagement metrics
- **Monthly** (1st at 3 AM UTC): Update subscription lifetime metrics
- **Weekly** (Monday 9 AM UTC): Check for expired trials
- **Monthly** (1st at 1 AM UTC): Reset usage counters
- **Weekly** (Monday 10 AM UTC): Identify churn-risk users

### 🔍 Verifying Installation

Check that everything is working:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('ai_requests', 'user_subscriptions', 'subscription_events');

-- Check trigger functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('update_updated_at_column', 'set_subscription_entitlements', 'log_subscription_change');

-- Check materialized view exists
SELECT matviewname 
FROM pg_matviews 
WHERE matviewname = 'user_engagement_metrics';

-- Check analytics views exist
SELECT viewname 
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN ('revenue_dashboard', 'user_health_dashboard', 'cohort_analysis');

-- Check cron jobs are scheduled
SELECT jobname, schedule, command 
FROM cron.job;
```

### 📊 Using the Analytics

#### Query Engagement Metrics
```sql
-- Top engaged users
SELECT * FROM user_engagement_metrics 
ORDER BY engagement_score DESC 
LIMIT 10;

-- At-risk users
SELECT * FROM user_engagement_metrics 
WHERE activity_status = 'at_risk';
```

#### Query Revenue Dashboard
```sql
-- Current month revenue by tier
SELECT * FROM revenue_dashboard 
WHERE month = DATE_TRUNC('month', CURRENT_DATE);

-- Total MRR across all tiers
SELECT SUM(total_mrr) as total_monthly_recurring_revenue 
FROM revenue_dashboard 
WHERE month = DATE_TRUNC('month', CURRENT_DATE);
```

#### Query User Health
```sql
-- High churn risk paying customers
SELECT * FROM user_health_dashboard 
WHERE churn_risk_score > 70 
AND subscription_tier != 'free'
ORDER BY monthly_price_gbp DESC;
```

#### Query Cohort Performance
```sql
-- Best performing cohorts
SELECT * FROM cohort_analysis 
ORDER BY cohort_mrr DESC 
LIMIT 5;
```

### 🔄 Manual Refresh

Manually refresh the engagement metrics:
```sql
SELECT refresh_engagement_metrics();
```

### 🛠️ Troubleshooting

**RLS policies blocking queries?**
- Make sure you've switched to Supabase Auth
- Check that `auth.uid()` returns a valid user ID

**Materialized view creation fails?**
- Ensure Supabase Auth is enabled
- Check that `auth.audit_log_entries` table exists

**Cron jobs not running?**
- Verify pg_cron extension is enabled
- Check job history: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC;`

**Views return no data?**
- Refresh the materialized view first: `SELECT refresh_engagement_metrics();`
- Ensure you have test data in the database

### 📝 Admin Access

The admin user (`lazaridispanagiwtis@gmail.com`) has full access to all data across all users for analytics and support purposes.

### 🚨 Important Notes

1. **All times are UTC** - Adjust cron schedules if needed
2. **Materialized view** - Refreshes daily, not real-time
3. **Performance** - Indexes are created automatically for optimal query speed
4. **Costs** - AI usage tracking helps monitor OpenAI API costs per tier

### 🔗 Next Steps

After setting up these SQL scripts:
1. Switch your application to use Supabase Auth
2. Update backend routes to use `auth.uid()` for user identification
3. Test the analytics dashboards with your data
4. Set up email notifications for high churn-risk users
