// Finix Payments API service
// Docs: https://finix.com/docs/api

const getBaseUrl = () => {
  const url = process.env.FINIX_API_URL;
  if (!url) throw new Error('FINIX_API_URL env var is not set');
  return url.replace(/\/$/, '');
};

export function finixHeaders(): HeadersInit {
  const key = process.env.FINIX_API_KEY;
  const secret = process.env.FINIX_API_SECRET;
  if (!key || !secret) throw new Error('FINIX_API_KEY and FINIX_API_SECRET env vars are required');
  const token = Buffer.from(`${key}:${secret}`).toString('base64');
  return {
    Authorization: `Basic ${token}`,
    'Content-Type': 'application/json',
  };
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface FinixIdentity {
  id: string;
  entity: {
    first_name: string;
    last_name: string;
    email: string;
    business_name: string;
    ein: string;
  };
  created_at: string;
  updated_at: string;
}

export interface FinixMerchant {
  id: string;
  identity: string;
  processor: string;
  onboarding_state: string;
  created_at: string;
  updated_at: string;
}

export interface FinixTransfer {
  id: string;
  merchant: string;
  amount: number;
  currency: string;
  state: string;
  source: string;
  tags: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface FinixSettlement {
  id: string;
  merchant: string;
  net_amount: number;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

async function finixFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${getBaseUrl()}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...finixHeaders(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.message ?? body?.error ?? JSON.stringify(body);
    } catch {
      detail = await res.text();
    }
    throw new Error(`Finix ${options.method ?? 'GET'} ${path} failed (${res.status}): ${detail}`);
  }

  return res.json() as Promise<T>;
}

// ── API Functions ──────────────────────────────────────────────────────────────

export interface CreateIdentityParams {
  first_name: string;
  last_name: string;
  email: string;
  business_name: string;
  ein: string;
}

export async function createIdentity(params: CreateIdentityParams): Promise<FinixIdentity> {
  return finixFetch<FinixIdentity>('/identities', {
    method: 'POST',
    body: JSON.stringify({
      entity: {
        first_name: params.first_name,
        last_name: params.last_name,
        email: params.email,
        business_name: params.business_name,
        business_type: 'LIMITED_LIABILITY_COMPANY',
        doing_business_as: params.business_name,
        phone: '7145677689',
        business_phone: '7145677689',
        business_tax_id: params.ein,
        tax_id: params.ein,
        url: 'https://www.acqyrly.com',
        incorporation_date: { day: 1, month: 1, year: 2020 },
        default_statement_descriptor: 'Acqyrly',
        personal_address: {
          line1: '123 Main St',
          city: 'Richardson',
          region: 'TX',
          postal_code: '75080',
          country: 'USA',
        },
        business_address: {
          line1: '123 Main St',
          city: 'Richardson',
          region: 'TX',
          postal_code: '75080',
          country: 'USA',
        },
        annual_card_volume: 12000000,
        max_transaction_amount: 1000000,
        mcc: '7372',
        has_accepted_credit_cards_previously: true,
        ownership_type: 'PRIVATE',
        principal_percentage_ownership: 100,
        title: 'CEO',
        dob: { day: 1, month: 1, year: 1980 },
      },
      tags: { broker_type: 'business_acquisition' },
    }),
  });
}

export async function createBankAccount(identityId: string): Promise<{ id: string }> {
  const res = await fetch(
    `${process.env.FINIX_API_URL}/payment_instruments`,
    {
      method: 'POST',
      headers: finixHeaders(),
      body: JSON.stringify({
        account_type: 'SAVINGS',
        account_number: '123123123',
        bank_code: '021000021',
        country: 'USA',
        currency: 'USD',
        identity: identityId,
        type: 'BANK_ACCOUNT',
        name: 'Test Broker',
      }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Finix createBankAccount failed (${res.status}): ${err}`);
  }
  return res.json();
}

export async function createMerchant(identityId: string): Promise<FinixMerchant> {
  const res = await fetch(
    `${process.env.FINIX_API_URL}/identities/${identityId}/merchants`,
    {
      method: 'POST',
      headers: finixHeaders(),
      body: JSON.stringify({ processor: 'DUMMY_V1' }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Finix POST /identities/${identityId}/merchants failed (${res.status}): ${err}`);
  }
  return res.json();
}

export interface CreateTransferParams {
  merchant: string;
  /** Amount in cents */
  amount: number;
  currency?: string;
  destination?: string;
  tags?: Record<string, string>;
}

export async function createTransfer(params: CreateTransferParams): Promise<FinixTransfer> {
  return finixFetch<FinixTransfer>('/transfers', {
    method: 'POST',
    body: JSON.stringify({
      merchant: params.merchant,
      amount: params.amount,
      currency: params.currency ?? 'USD',
      ...(params.destination ? { destination: params.destination } : {}),
      tags: params.tags ?? {},
    }),
  });
}

export async function getTransfer(transferId: string): Promise<FinixTransfer> {
  return finixFetch<FinixTransfer>(`/transfers/${transferId}`);
}

export interface MerchantBalanceResult {
  merchant: string;
  settlements: FinixSettlement[];
  net_amount: number;
}

export async function getMerchantBalance(merchantId: string): Promise<MerchantBalanceResult> {
  const data = await finixFetch<{
    _embedded?: { settlements?: FinixSettlement[] };
  }>(`/settlements?merchant=${merchantId}`);

  const settlements = data._embedded?.settlements ?? [];
  const net_amount = settlements.reduce((sum, s) => sum + (s.net_amount ?? 0), 0);

  return { merchant: merchantId, settlements, net_amount };
}
