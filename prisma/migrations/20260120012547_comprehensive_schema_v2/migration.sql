/*
  Warnings:

  - You are about to drop the `Analysis` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Analysis" DROP CONSTRAINT "Analysis_dealId_fkey";

-- AlterTable
ALTER TABLE "deals" ADD COLUMN     "annualEBITDA" DECIMAL(15,2),
ADD COLUMN     "annualRevenue" DECIMAL(15,2),
ADD COLUMN     "annualSDE" DECIMAL(15,2),
ADD COLUMN     "askingPrice" DECIMAL(15,2),
ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "businessType" TEXT,
ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "downPayment" DECIMAL(15,2),
ADD COLUMN     "employees" INTEGER,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "listingId" TEXT,
ADD COLUMN     "listingSource" TEXT,
ADD COLUMN     "listingUrl" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'medium',
ADD COLUMN     "sellerFinancing" DECIMAL(15,2),
ADD COLUMN     "stage" TEXT NOT NULL DEFAULT 'analysis',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "visibility" TEXT NOT NULL DEFAULT 'private',
ADD COLUMN     "yearEstablished" INTEGER;

-- AlterTable
ALTER TABLE "memberships" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "canCreateDeals" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "canDeleteDeals" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canExport" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "canManageBilling" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canManageClients" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canManageTeam" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "invitedAt" TIMESTAMP(3),
ADD COLUMN     "invitedBy" TEXT;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT DEFAULT 'US',
ADD COLUMN     "email" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "maxUsers" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'free',
ADD COLUMN     "planExpiresAt" TIMESTAMP(3),
ADD COLUMN     "planStatus" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "primaryColor" TEXT,
ADD COLUMN     "secondaryColor" TEXT,
ADD COLUMN     "settings" JSONB,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'brokerage',
ADD COLUMN     "website" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "planExpiresAt" TIMESTAMP(3),
ADD COLUMN     "planStatus" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "preferences" JSONB,
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "title" TEXT;

-- DropTable
DROP TABLE "Analysis";

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "type" TEXT NOT NULL DEFAULT 'buyer',
    "status" TEXT NOT NULL DEFAULT 'active',
    "budget" DECIMAL(15,2),
    "cashAvailable" DECIMAL(15,2),
    "creditScore" INTEGER,
    "preQualified" BOOLEAN NOT NULL DEFAULT false,
    "industries" TEXT[],
    "locations" TEXT[],
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analyses" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "inputs" JSONB NOT NULL,
    "outputs" JSONB NOT NULL,
    "metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenarios" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'custom',
    "inputs" JSONB NOT NULL,
    "outputs" JSONB NOT NULL,
    "comparedTo" TEXT,
    "analysisId" TEXT,
    "dealId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "year" INTEGER,
    "dealId" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exports" (
    "id" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "config" JSONB,
    "branded" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "url" TEXT,
    "error" TEXT,
    "expiresAt" TIMESTAMP(3),
    "dealId" TEXT,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "userId" TEXT NOT NULL,
    "dealId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_records" (
    "id" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "period" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "minPlan" TEXT,
    "allowedUsers" TEXT[],
    "allowedOrgs" TEXT[],
    "rolloutPercentage" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "calculatorType" TEXT,
    "calculatorData" JSONB,
    "interestedIn" TEXT[],
    "loanAmount" DECIMAL(15,2),
    "status" TEXT NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "convertedToUserId" TEXT,
    "convertedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industry_benchmarks" (
    "id" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "subIndustry" TEXT,
    "sdeMultipleLow" DECIMAL(4,2) NOT NULL,
    "sdeMultipleMid" DECIMAL(4,2) NOT NULL,
    "sdeMultipleHigh" DECIMAL(4,2) NOT NULL,
    "ebitdaMultipleLow" DECIMAL(4,2) NOT NULL,
    "ebitdaMultipleMid" DECIMAL(4,2) NOT NULL,
    "ebitdaMultipleHigh" DECIMAL(4,2) NOT NULL,
    "revenueMultipleLow" DECIMAL(4,2) NOT NULL,
    "revenueMultipleMid" DECIMAL(4,2) NOT NULL,
    "revenueMultipleHigh" DECIMAL(4,2) NOT NULL,
    "sizeRange" TEXT,
    "region" TEXT,
    "source" TEXT,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industry_benchmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clients_userId_idx" ON "clients"("userId");

-- CreateIndex
CREATE INDEX "clients_organizationId_idx" ON "clients"("organizationId");

-- CreateIndex
CREATE INDEX "analyses_dealId_idx" ON "analyses"("dealId");

-- CreateIndex
CREATE INDEX "analyses_type_idx" ON "analyses"("type");

-- CreateIndex
CREATE INDEX "scenarios_analysisId_idx" ON "scenarios"("analysisId");

-- CreateIndex
CREATE INDEX "scenarios_dealId_idx" ON "scenarios"("dealId");

-- CreateIndex
CREATE INDEX "documents_dealId_idx" ON "documents"("dealId");

-- CreateIndex
CREATE INDEX "exports_userId_idx" ON "exports"("userId");

-- CreateIndex
CREATE INDEX "exports_dealId_idx" ON "exports"("dealId");

-- CreateIndex
CREATE INDEX "activities_userId_idx" ON "activities"("userId");

-- CreateIndex
CREATE INDEX "activities_dealId_idx" ON "activities"("dealId");

-- CreateIndex
CREATE INDEX "activities_resource_resourceId_idx" ON "activities"("resource", "resourceId");

-- CreateIndex
CREATE INDEX "usage_records_userId_idx" ON "usage_records"("userId");

-- CreateIndex
CREATE INDEX "usage_records_organizationId_idx" ON "usage_records"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "usage_records_resource_period_periodStart_userId_key" ON "usage_records"("resource", "period", "periodStart", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "usage_records_resource_period_periodStart_organizationId_key" ON "usage_records"("resource", "period", "periodStart", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_name_key" ON "feature_flags"("name");

-- CreateIndex
CREATE INDEX "leads_email_idx" ON "leads"("email");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_source_idx" ON "leads"("source");

-- CreateIndex
CREATE INDEX "industry_benchmarks_industry_idx" ON "industry_benchmarks"("industry");

-- CreateIndex
CREATE UNIQUE INDEX "industry_benchmarks_industry_subIndustry_sizeRange_region_y_key" ON "industry_benchmarks"("industry", "subIndustry", "sizeRange", "region", "year");

-- CreateIndex
CREATE INDEX "deals_clientId_idx" ON "deals"("clientId");

-- CreateIndex
CREATE INDEX "deals_status_idx" ON "deals"("status");

-- CreateIndex
CREATE INDEX "deals_businessType_idx" ON "deals"("businessType");

-- CreateIndex
CREATE INDEX "memberships_organizationId_idx" ON "memberships"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_stripeCustomerId_key" ON "organizations"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exports" ADD CONSTRAINT "exports_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exports" ADD CONSTRAINT "exports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exports" ADD CONSTRAINT "exports_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
