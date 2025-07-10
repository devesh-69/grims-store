-- Remove all existing users and related data
-- This will cascade to all related tables due to foreign key constraints

-- First, delete all user roles
DELETE FROM public.user_roles;

-- Delete all profiles (this should cascade from auth.users deletion but we'll be explicit)
DELETE FROM public.profiles;

-- Delete all blogs
DELETE FROM public.blogs;

-- Delete all wishlist related data
DELETE FROM public.wishlist_products;
DELETE FROM public.shared_wishlists;

-- Delete all other user-related data
DELETE FROM public.ratings;
DELETE FROM public.reviews;
DELETE FROM public.notifications;
DELETE FROM public.audit_logs;
DELETE FROM public.report_comments;
DELETE FROM public.report_templates;
DELETE FROM public.report_shares;  
DELETE FROM public.report_exports;
DELETE FROM public.scheduled_reports;
DELETE FROM public.saved_segments;
DELETE FROM public.alert_rules;

-- Now delete all authentication users (this is the main cleanup)
-- Note: This requires service role permissions in the edge function