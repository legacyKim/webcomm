-- Add email_updated_at column to members table
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "email_updated_at" TIMESTAMP(3);
