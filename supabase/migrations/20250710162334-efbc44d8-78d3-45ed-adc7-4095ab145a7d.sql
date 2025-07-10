-- Remove all existing users and related data in correct order to respect foreign keys

-- Delete user-specific data first (these reference profiles/users)
DELETE FROM public.wishlist_products;
DELETE FROM public.shared_wishlists;
DELETE FROM public.ratings;
DELETE FROM public.reviews;
DELETE FROM public.user_roles;
DELETE FROM public.notifications;
DELETE FROM public.audit_logs;
DELETE FROM public.report_comments;
DELETE FROM public.report_templates;
DELETE FROM public.report_shares;  
DELETE FROM public.report_exports;
DELETE FROM public.scheduled_reports;
DELETE FROM public.saved_segments;
DELETE FROM public.alert_rules;
DELETE FROM public.blogs;

-- Finally delete profiles (this references auth.users)
DELETE FROM public.profiles;

-- Note: auth.users deletion will be handled by the edge function with service role permissions