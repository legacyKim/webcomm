/*
  Warnings:

  - A unique constraint covering the columns `[user_id,endpoint]` on the table `push_subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "members" ADD COLUMN     "account_locked_until" TIMESTAMP(3),
ADD COLUMN     "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_failed_login" TIMESTAMP(3),
ADD COLUMN     "lock_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "permanent_lock" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
-- CREATE TABLE "signup_terms" (
--     "id" SERIAL NOT NULL,
--     "content" TEXT NOT NULL,
--     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updated_at" TIMESTAMP(3) NOT NULL,

--     CONSTRAINT "signup_terms_pkey" PRIMARY KEY ("id")
-- );

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_user_id_endpoint_key" ON "push_subscriptions"("user_id", "endpoint");
