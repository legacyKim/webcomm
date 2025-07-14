/*
  Warnings:

  - A unique constraint covering the columns `[url_slug]` on the table `boards` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "boards_url_slug_key" ON "boards"("url_slug");
