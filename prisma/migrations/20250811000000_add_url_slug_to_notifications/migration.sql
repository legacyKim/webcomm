-- Add url_slug column to notifications table if it doesn't exist
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "url_slug" TEXT;
