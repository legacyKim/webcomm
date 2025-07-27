/*
  Warnings:

  - A unique constraint covering the columns `[user_id,endpoint]` on the table `push_subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "marketing_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "notification_enabled" BOOLEAN NOT NULL DEFAULT false;
