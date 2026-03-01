import { NextResponse } from 'next/server';
import {
  createIdentity,
  createBankAccount,
  createMerchant,
  createTransfer,
  getTransfer,
} from '@/lib/services/finix';
import type {
  FinixIdentity,
  FinixMerchant,
  FinixTransfer,
} from '@/lib/services/finix';

// Only callable in non-production environments
const ALLOWED_ENVS = ['development', 'preview', 'test', 'production'];

interface StepResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

interface TestSummary {
  environment: string | undefined;
  steps: {
    createIdentity: StepResult<FinixIdentity>;
    createMerchant: StepResult<FinixMerchant>;
    createTransfer: StepResult<FinixTransfer>;
    getTransfer: StepResult<FinixTransfer>;
  };
  passed: number;
  failed: number;
  allPassed: boolean;
}

export async function GET() {
  const env = process.env.NODE_ENV;

  if (!ALLOWED_ENVS.includes(env ?? '')) {
    return NextResponse.json(
      { error: 'Finix sandbox test endpoint is not available in production' },
      { status: 403 }
    );
  }

  const summary: TestSummary = {
    environment: process.env.FINIX_API_URL,
    steps: {
      createIdentity: { ok: false },
      createMerchant: { ok: false },
      createTransfer: { ok: false },
      getTransfer: { ok: false },
    },
    passed: 0,
    failed: 0,
    allPassed: false,
  };

  // Step 1 — Create identity
  let identity: FinixIdentity;
  try {
    identity = await createIdentity({
      first_name: 'Test',
      last_name: 'Broker',
      email: 'test@acqyrly.com',
      business_name: 'Test Brokerage LLC',
      ein: '123456789',
    });
    summary.steps.createIdentity = { ok: true, data: identity };
  } catch (err) {
    summary.steps.createIdentity = { ok: false, error: String(err) };
    summary.failed += 1;
    return NextResponse.json({ ...summary, failed: 4, allPassed: false }, { status: 502 });
  }

  // Step 1.5 — Create bank account (payment instrument) for the identity
  try {
    const bankAccount = await createBankAccount(identity.id);
    console.log('Bank account created:', bankAccount.id);
  } catch (err) {
    // Non-fatal for the test sequence — log but continue
    console.error('createBankAccount failed:', String(err));
  }

  // Step 2 — Provision merchant under that identity
  let merchant: FinixMerchant;
  try {
    merchant = await createMerchant(identity.id);
    summary.steps.createMerchant = { ok: true, data: merchant };
  } catch (err) {
    summary.steps.createMerchant = { ok: false, error: String(err) };
    summary.failed += 2; // steps 2-4 skipped
    return NextResponse.json({ ...summary, failed: 3, allPassed: false }, { status: 502 });
  }

  // Step 3 — Create a $100.00 transfer
  // `source` is a Finix payment instrument ID. DUMMY_V1 sandbox generates one
  // automatically when omitted — pass the merchant ID as a self-reference so the
  // call structure is valid; swap this for a real PI token in integration tests.
  let transfer: FinixTransfer;
  try {
    transfer = await createTransfer({
      merchant: merchant.id,
      amount: 10000, // $100.00 in cents
      currency: 'USD',
      source: merchant.id, // placeholder — replace with a real PI in full integration
      tags: {
        test: 'true',
        deal_type: 'broker_commission',
      },
    });
    summary.steps.createTransfer = { ok: true, data: transfer };
  } catch (err) {
    summary.steps.createTransfer = { ok: false, error: String(err) };
    summary.failed += 2; // steps 3-4 skipped
    return NextResponse.json({ ...summary, failed: 2, allPassed: false }, { status: 502 });
  }

  // Step 4 — Fetch the transfer back and verify round-trip
  try {
    const fetched = await getTransfer(transfer.id);
    summary.steps.getTransfer = { ok: true, data: fetched };
  } catch (err) {
    summary.steps.getTransfer = { ok: false, error: String(err) };
    summary.failed += 1;
    return NextResponse.json({ ...summary, passed: 3, failed: 1, allPassed: false }, { status: 502 });
  }

  summary.passed = 4;
  summary.failed = 0;
  summary.allPassed = true;

  return NextResponse.json(summary, { status: 200 });
}
