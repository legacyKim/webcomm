/*
  Warnings:

  - You are about to drop the column `is_deleted` on the `posts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "posts" DROP COLUMN "is_deleted",
ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;
