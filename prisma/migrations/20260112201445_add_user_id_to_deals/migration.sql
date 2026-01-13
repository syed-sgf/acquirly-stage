/*
  Warnings:

  - Added the required column `userId` to the `deals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "deals" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "deals_userId_idx" ON "deals"("userId");

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
