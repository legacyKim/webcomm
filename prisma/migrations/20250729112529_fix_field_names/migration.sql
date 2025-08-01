/*
  Warnings:

  - You are about to drop the column `accountLockedUntil` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `failedLoginAttempts` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `lastFailedLogin` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `lockCount` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `permanentLock` on the `members` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "members" DROP COLUMN "accountLockedUntil",
DROP COLUMN "failedLoginAttempts",
DROP COLUMN "lastFailedLogin",
DROP COLUMN "lockCount",
DROP COLUMN "permanentLock",
ADD COLUMN     "account_locked_until" TIMESTAMP(3),
ADD COLUMN     "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_failed_login" TIMESTAMP(3),
ADD COLUMN     "lock_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "permanent_lock" BOOLEAN NOT NULL DEFAULT false;
