-- AlterTable
ALTER TABLE "users" ADD COLUMN     "pilotExpiresAt" TIMESTAMP(3),
ADD COLUMN     "pilotGrantedAt" TIMESTAMP(3),
ADD COLUMN     "pilotGrantedBy" TEXT,
ADD COLUMN     "pilotNotes" TEXT,
ADD COLUMN     "pilotUser" BOOLEAN NOT NULL DEFAULT false;
