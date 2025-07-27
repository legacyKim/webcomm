/*
  Warnings:

  - A unique constraint covering the columns `[user_id,endpoint]` on the table `push_subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "members" ADD COLUMN     "marketing_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notification_enabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_user_id_endpoint_key" ON "push_subscriptions"("user_id", "endpoint");
