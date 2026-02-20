# ACQUIRELY — Finix Embedded Payments Integration Roadmap
**Starting Gate Financial | Confidential**
> *From Subscription Tool → Transaction Platform*

---

## Overview

| Phase | Focus | Timeline | Status |
|-------|-------|----------|--------|
| Phase 1 | Finix Foundation & Merchant Onboarding | Weeks 1–4 | 🔴 DO NOW |
| Phase 2 | Broker Commission Wallet | Weeks 5–10 | 🟡 NEXT |
| Phase 3 | Marketplace Payments | Weeks 11–18 | 🟢 SCALE |
| Phase 4 | SGF Loan Pipeline Integration | Ongoing | 🔵 STRATEGIC |

---

## 01 — What Is Finix & Why It Fits ACQUIRELY

Finix is a payment infrastructure provider that turns SaaS platforms into payment facilitators (PayFacs) **without requiring a full payments license**. They handle AML, KYC, underwriting, and settlement — you embed their API, define payment flows, and earn a percentage of every transaction that runs through ACQUIRELY.

### The PayFac Model — What Finix Eliminates

Normally, to collect a percentage of transactions you would need to:
- Obtain a payment facilitator license ($250K–$1M+)
- Pass FDIC/OCC regulatory scrutiny
- Build your own underwriting and compliance infrastructure
- Maintain PCI-DSS Level 1 compliance independently

**Finix eliminates ALL of that.** You become a "Sub-PayFac" under their master license. You get the revenue share without the regulatory burden.

> 💡 **The Key Insight for ACQUIRELY**
>
> Every deal on the platform involves money moving: commission payments, due diligence fees, earnest money, retainers, referral fees. Right now, all of that moves **outside** ACQUIRELY through wires and checks. Finix lets you capture a piece of every one of those flows — without touching actual loan money that Stripe restricts.

### What Finix Handles vs. What You Build

| Finix Handles | You Build in ACQUIRELY |
|---------------|----------------------|
| AML / KYC compliance | Payment UI & user flows |
| Underwriting of merchants | Transaction routing logic |
| PCI-DSS Level 1 compliance | Fee configuration per transaction type |
| Settlement & disbursements | Dashboard & reporting views |
| Fraud monitoring | Integration with deal lifecycle |
| Regulatory reporting | CTA & upgrade prompts |
| Chargeback management | Broker/buyer wallet UI |

---

## 02 — Technical Architecture

### How Finix Fits Into the Current Stack
```
Current Stack → Finix Integration Layer

Next.js API Routes      ↔  Finix REST API
Prisma/PostgreSQL        ↔  Store Finix IDs (merchant_id, payment_id, transfer_id)
NextAuth Session         ↔  Finix Identity / KYC token
Stripe (subscriptions)  ↔  Finix (transactions) — both run simultaneously
```

### Database Schema Additions (Prisma)
```prisma
model FinixMerchant {
  id              String   @id @default(cuid())
  userId          String   @unique
  finixMerchantId String   @unique
  finixIdentityId String
  status          String   @default("PROVISIONING")
  tier            String   @default("broker")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  user            User          @relation(fields: [userId], references: [id])
  payments        FinixPayment[]
  @@map("finix_merchants")
}

model FinixPayment {
  id              String   @id @default(cuid())
  finixTransferId String   @unique
  merchantId      String
  dealId          String?
  amount          Int
  fee             Int
  type            String   // commission | due_diligence | earnest_money | retainer | referral
  status          String   @default("PENDING")
  description     String?
  metadata        Json?
  createdAt       DateTime @default(now())
  merchant        FinixMerchant @relation(fields: [merchantId], references: [id])
  deal            Deal?         @relation(fields: [dealId], references: [id])
  @@map("finix_payments")
}

model PlatformRevenue {
  id          String   @id @default(cuid())
  paymentId   String
  amount      Int
  type        String   // processing_fee | success_fee | marketplace_fee
  period      String   // "2025-02"
  createdAt   DateTime @default(now())
  @@map("platform_revenue")
}
```

### New API Routes

| Route | Method | Purpose | Finix API Called |
|-------|--------|---------|-----------------|
| `/api/finix/onboard` | POST | KYC + create merchant | POST /identities, POST /merchants |
| `/api/finix/payment/initiate` | POST | Start a payment | POST /transfers |
| `/api/finix/payment/status` | GET | Check payment status | GET /transfers/:id |
| `/api/finix/webhook` | POST | Receive Finix events | Webhook endpoint |
| `/api/finix/balance` | GET | Get merchant balance | GET /merchants/:id/settlements |
| `/api/finix/payout` | POST | Trigger broker payout | POST /transfers (payout) |

### Finix Service Layer — `lib/services/finix.ts`
```typescript
const FINIX_BASE   = process.env.FINIX_API_URL
const FINIX_KEY    = process.env.FINIX_API_KEY
const FINIX_SECRET = process.env.FINIX_API_SECRET

const finixHeaders = {
  'Content-Type': 'application/json',
  'Authorization': 'Basic ' + Buffer.from(`${FINIX_KEY}:${FINIX_SECRET}`).toString('base64')
}

export async function createFinixIdentity(user: {
  firstName: string
  lastName: string
  email: string
  businessName: string
  ein?: string
}) {
  const res = await fetch(`${FINIX_BASE}/identities`, {
    method: 'POST',
    headers: finixHeaders,
    body: JSON.stringify({
      entity: {
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        business_name: user.businessName,
        business_type: 'LIMITED_LIABILITY_COMPANY',
        doing_business_as: user.businessName,
        tax_id: user.ein || '000000000',
        principal_percentage_ownership: 100,
        max_transaction_amount: 50000_00,
        annual_card_volume: 500000_00,
        default_statement_descriptor: 'ACQUIRELY',
      }
    })
  })
  return res.json()
}

export async function createFinixMerchant(identityId: string) {
  const res = await fetch(`${FINIX_BASE}/merchants`, {
    method: 'POST',
    headers: finixHeaders,
    body: JSON.stringify({
      identity: identityId,
      processor: 'DUMMY_V1'
    })
  })
  return res.json()
}

export async function createTransfer(params: {
  amount: number
  currency: string
  merchantId: string
  source: string
  description: string
  tags?: Record<string, string>
}) {
  const res = await fetch(`${FINIX_BASE}/transfers`, {
    method: 'POST',
    headers: finixHeaders,
    body: JSON.stringify({
      merchant: params.merchantId,
      currency: params.currency,
      amount: params.amount,
      source: params.source,
      statement_descriptor: 'ACQUIRELY',
      tags: params.tags || {}
    })
  })
  return res.json()
}
```

### Webhook Handler — `app/api/finix/webhook/route.ts`
```typescript
export async function POST(req: Request) {
  const payload = await req.json()
  const sig = req.headers.get('finix-signature')
  if (!verifyFinixSignature(sig, payload)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }
  switch (payload.type) {
    case 'TRANSFER_SUCCEEDED':
      await handlePaymentSuccess(payload.entity)
      break
    case 'TRANSFER_FAILED':
      await handlePaymentFailed(payload.entity)
      break
    case 'MERCHANT_APPROVED':
      await prisma.finixMerchant.update({
        where: { finixMerchantId: payload.entity.id },
        data: { status: 'APPROVED' }
      })
      break
  }
  return Response.json({ received: true })
}
```

---

## 03 — Build Phases

### 🔴 PHASE 1 — Finix Foundation & Merchant Onboarding
**Weeks 1–4 | ~40 Hours | DO NOW**

- Apply at finix.com — describe ACQUIRELY as *"B2B SaaS marketplace for business acquisition professionals"*
- Get sandbox credentials (5–10 business days)
- Create `lib/services/finix.ts` with base functions
- Add Prisma schema migrations
- Build merchant onboarding wizard in account settings
- Build webhook handler
- Test end-to-end sandbox transaction

### 🟡 PHASE 2 — Broker Commission Wallet
**Weeks 5–10 | ~60 Hours | NEXT**

- Deal Closing Flow → prompt broker to record commission
- Payment Collection UI inside ACQUIRELY (Finix processes)
- Automatic fee split: 98.5% broker / 1.5% ACQUIRELY
- Broker Payout Dashboard
- Auto-generated SGF-branded client receipts

**Phase 2 Revenue Projection (100 deals/month):**

| Transaction Type | Avg. Amount | ACQUIRELY Fee | Monthly | Annual |
|----------------|-------------|--------------|---------|--------|
| Broker Commission | $20,000 | 1.0% = $200 | $20,000 | $240,000 |
| Buyer Retainer | $2,500 | 2.0% = $50 | $5,000 | $60,000 |
| Referral Fee | $5,000 | 1.5% = $75 | $7,500 | $90,000 |
| **TOTAL** | — | — | **$32,500** | **$390,000** |

### 🟢 PHASE 3 — Marketplace Payments
**Weeks 11–18 | ~80 Hours | SCALE**

- Due Diligence Services Marketplace (2.5% fee)
- Earnest Money Facilitation ($300 flat fee)
- Business Listing Fees ($499–$999 via Finix)
- Success Fee Collection (1% each side auto-charged on close)
- Lender Referral Fee Processing (0.25–1% to SGF)

### 🔵 PHASE 4 — SGF Loan Pipeline Integration
**Ongoing | Strategic**

- Deal close trigger → SGF financing CTA
- Deals >$250K auto-flag for SGF BDO outreach within 24 hours
- SGF pre-approval embedded in deal flow
- Lender Portal: SGF sees all deals with DSCR, valuation, buyer profiles

---

## 04 — Revenue Projections

| Revenue Stream | Year 1 | Year 2 | Year 3 |
|---------------|--------|--------|--------|
| Subscriptions (current) | $120,000 | $750,000 | $2,400,000 |
| Broker Commission Fees (1%) | $48,000 | $240,000 | $600,000 |
| Marketplace Services (2.5%) | $0 | $120,000 | $480,000 |
| Earnest Money ($300 flat) | $0 | $90,000 | $270,000 |
| Success Fees (1% each side) | $0 | $200,000 | $800,000 |
| SGF Financing Referrals | $450,000 | $1,800,000 | $4,500,000 |
| **TOTAL** | **$618,000** | **$3,200,000** | **$9,050,000** |

---

## 05 — Environment Variables
```bash
# Finix — add to .env.local AND Vercel environment variables

FINIX_API_URL=https://finix-api.sandbox-us-east-2.finixpayments.com  # sandbox
# FINIX_API_URL=https://finix-api.us-east-2.finixpayments.com        # production

FINIX_API_KEY=your_finix_api_key
FINIX_API_SECRET=your_finix_api_secret
FINIX_PLATFORM_MERCHANT_ID=your_platform_merchant_id
FINIX_WEBHOOK_SECRET=your_webhook_signing_secret

# Fee config (basis points — 100 = 1%)
FINIX_COMMISSION_FEE_BPS=100
FINIX_SERVICE_FEE_BPS=250
FINIX_EARNEST_FEE_FLAT=30000
FINIX_SUCCESS_FEE_BPS=100
```

---

## 06 — Action Items This Week

| # | Action | Owner | Time |
|---|--------|-------|------|
| 1 | Apply at finix.com as "B2B SaaS marketplace" | Syed | 30 min |
| 2 | Receive sandbox credentials | Finix | 5–10 days |
| 3 | `npx prisma migrate dev` with new schema | Dev | 1 hr |
| 4 | Create `lib/services/finix.ts` | Dev | 4 hrs |
| 5 | Build `/api/finix/webhook/route.ts` | Dev | 2 hrs |
| 6 | Test sandbox $1 transaction end-to-end | Dev | 2 hrs |
| 7 | Add merchant onboarding to account settings | Dev | 8 hrs |

---

> ⚠️ **Positioning Note:** Never describe this to Finix as "loan servicing." ACQUIRELY processes broker commissions, advisory fees, and marketplace services — all unrestricted categories. SGF's lending business is entirely separate.

---

*Starting Gate Financial | Richardson, TX | ACQUIRELY Platform | v1.0 | February 2026*
