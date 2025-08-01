/*
  Warnings:

  - You are about to drop the column `account_locked_until` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `failed_login_attempts` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `last_failed_login` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `lock_count` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `permanent_lock` on the `members` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "members" DROP COLUMN "account_locked_until",
DROP COLUMN "failed_login_attempts",
DROP COLUMN "last_failed_login",
DROP COLUMN "lock_count",
DROP COLUMN "permanent_lock",
ADD COLUMN     "accountLockedUntil" TIMESTAMP(3),
ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastFailedLogin" TIMESTAMP(3),
ADD COLUMN     "lockCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "permanentLock" BOOLEAN NOT NULL DEFAULT false;
