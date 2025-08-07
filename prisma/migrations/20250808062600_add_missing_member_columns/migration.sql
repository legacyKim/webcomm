/*
  Add missing columns to members table that are defined in schema but missing from database
*/

-- Add missing columns to members table
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "location" VARCHAR(100);
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "website" VARCHAR(255);
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "banner_image" VARCHAR(255);
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "total_likes_received" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "last_seen" TIMESTAMP(3);
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "is_online" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "all_posts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "all_views" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "user_profile" VARCHAR(255);
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "profile" VARCHAR(255);
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "birthday" TIMESTAMP(3);
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "nickname_changed_at" TIMESTAMP(3);
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "restriction_until" TIMESTAMP(3);
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "reason" TEXT;

-- Add missing unique constraint to push_subscriptions if not exists
CREATE UNIQUE INDEX IF NOT EXISTS "push_subscriptions_user_id_endpoint_key" ON "push_subscriptions"("user_id", "endpoint");
