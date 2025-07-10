-- Remove all existing users and related data in correct order to respect all foreign keys

-- Start with the most dependent tables first
DELETE FROM public.reviews;
DELETE FROM public.ratings;
DELETE FROM public.wishlist_products;
DELETE FROM public.shared_wishlists;

-- Delete report-related data
DELETE FROM public.report_comments;
DELETE FROM public.report_exports;
DELETE FROM public.report_shares;
DELETE FROM public.scheduled_reports;
DELETE FROM public.report_templates;

-- Delete other user-related data
DELETE FROM public.blogs;
DELETE FROM public.notifications;
DELETE FROM public.audit_logs;
DELETE FROM public.saved_segments;
DELETE FROM public.alert_rules;
DELETE FROM public.user_roles;

-- Finally delete profiles
DELETE FROM public.profiles;

-- Products and categories can be left as they're not user-specific
-- Note: auth.users deletion will need to be handled via edge function with service role