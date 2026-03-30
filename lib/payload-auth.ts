import 'server-only';
import type { NextRequest } from 'next/server';

export type AuthUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: string;
  bonusBalance?: number;
  earnedBonusTotal?: number;
  spentBonusTotal?: number;
  firstPurchaseDiscountUsed?: boolean;
  shippingAddress?: AuthAddress;
  billingAddress?: AuthAddress;
};

export type AuthAddress = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  address?: string;
  city?: string;
  zip?: string;
  companyName?: string;
  companyId?: string;
  vatId?: string;
};

export type PayloadAuthConfig = {
  baseUrl: string;
  collection: string;
  cookieName: string;
  secureCookie: boolean;
};

const DEFAULT_AUTH_COLLECTION = 'users';
const DEFAULT_AUTH_COOKIE = 'lumera_auth';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function parseBooleanEnv(value: string | undefined): boolean | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return undefined;
}

function inferSecureCookieFromUrl(value: string | undefined): boolean | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return undefined;
  }
}

export function resolveSecureAuthCookie(request?: Pick<NextRequest, 'headers' | 'nextUrl'>): boolean {
  const envOverride = parseBooleanEnv(process.env.PAYLOAD_AUTH_COOKIE_SECURE);
  if (typeof envOverride === 'boolean') {
    return envOverride;
  }

  const forwardedProto = request?.headers.get('x-forwarded-proto')?.split(',')[0]?.trim().toLowerCase();
  if (forwardedProto === 'https') {
    return true;
  }

  if (forwardedProto === 'http') {
    return false;
  }

  const requestProtocol = request?.nextUrl?.protocol?.replace(/:$/, '').toLowerCase();
  if (requestProtocol === 'https') {
    return true;
  }

  if (requestProtocol === 'http') {
    return false;
  }

  const siteUrlSecure = inferSecureCookieFromUrl(
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.SITE_URL?.trim(),
  );
  if (typeof siteUrlSecure === 'boolean') {
    return siteUrlSecure;
  }

  return process.env.NODE_ENV === 'production';
}

export function getPayloadAuthConfig(): PayloadAuthConfig | null {
  const baseUrlRaw =
    process.env.PAYLOAD_API_URL?.trim() || process.env.NEXT_PUBLIC_PAYLOAD_API_URL?.trim();
  if (!baseUrlRaw) {
    return null;
  }

  const collection = process.env.PAYLOAD_AUTH_COLLECTION?.trim() || DEFAULT_AUTH_COLLECTION;
  const cookieName = process.env.PAYLOAD_AUTH_COOKIE?.trim() || DEFAULT_AUTH_COOKIE;

  return {
    baseUrl: stripTrailingSlash(baseUrlRaw),
    collection,
    cookieName,
    secureCookie: resolveSecureAuthCookie(),
  };
}

export function getRequestIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return request.headers.get('x-real-ip') || 'unknown';
}

export function normalizeEmail(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function validatePassword(password: string): string | null {
  if (password.length < 10 || password.length > 128) {
    return 'Password must be 10-128 characters long.';
  }

  if (!/[a-z]/.test(password)) {
    return 'Password must include at least one lowercase letter.';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must include at least one uppercase letter.';
  }

  if (!/\d/.test(password)) {
    return 'Password must include at least one number.';
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must include at least one special character.';
  }

  return null;
}

export function validateRegistrationPassword(password: string): string | null {
  const nonWhitespaceLength = password.replace(/\s+/g, '').length;

  if (nonWhitespaceLength <= 5) {
    return 'Password must contain more than 5 non-space characters.';
  }

  if (password.length > 128) {
    return 'Password must be 128 characters or fewer.';
  }

  return null;
}

export function sanitizeAuthUser(value: unknown): AuthUser | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const id = record.id;
  const email = record.email;

  if ((typeof id !== 'string' && typeof id !== 'number') || typeof email !== 'string') {
    return null;
  }

  const firstName = typeof record.firstName === 'string' ? record.firstName : undefined;
  const lastName = typeof record.lastName === 'string' ? record.lastName : undefined;
  const displayName = typeof record.displayName === 'string' ? record.displayName : undefined;
  const name = displayName || (typeof record.name === 'string' ? record.name : undefined);
  const role = typeof record.role === 'string' ? record.role : undefined;
  const bonusBalanceRaw =
    typeof record.bonusBalance === 'number' || typeof record.bonusBalance === 'string'
      ? Number(record.bonusBalance)
      : NaN;
  const earnedBonusTotalRaw =
    typeof record.earnedBonusTotal === 'number' || typeof record.earnedBonusTotal === 'string'
      ? Number(record.earnedBonusTotal)
      : NaN;
  const spentBonusTotalRaw =
    typeof record.spentBonusTotal === 'number' || typeof record.spentBonusTotal === 'string'
      ? Number(record.spentBonusTotal)
      : NaN;
  const firstPurchaseDiscountUsed = record.firstPurchaseDiscountUsed === true;
  const sanitizeAddress = (input: unknown): AuthAddress | undefined => {
    if (!input || typeof input !== 'object') {
      return undefined;
    }

    const addressRecord = input as Record<string, unknown>;
    const address: AuthAddress = {
      firstName: typeof addressRecord.firstName === 'string' ? addressRecord.firstName : undefined,
      lastName: typeof addressRecord.lastName === 'string' ? addressRecord.lastName : undefined,
      phone: typeof addressRecord.phone === 'string' ? addressRecord.phone : undefined,
      country: typeof addressRecord.country === 'string' ? addressRecord.country : undefined,
      address: typeof addressRecord.address === 'string' ? addressRecord.address : undefined,
      city: typeof addressRecord.city === 'string' ? addressRecord.city : undefined,
      zip: typeof addressRecord.zip === 'string' ? addressRecord.zip : undefined,
      companyName: typeof addressRecord.companyName === 'string' ? addressRecord.companyName : undefined,
      companyId: typeof addressRecord.companyId === 'string' ? addressRecord.companyId : undefined,
      vatId: typeof addressRecord.vatId === 'string' ? addressRecord.vatId : undefined,
    };

    return Object.values(address).some((field) => typeof field === 'string' && field.trim().length > 0)
      ? address
      : undefined;
  };

  return {
    id: String(id),
    email,
    firstName,
    lastName,
    name,
    role,
    bonusBalance: Number.isFinite(bonusBalanceRaw) ? Math.max(0, Math.floor(bonusBalanceRaw)) : 0,
    earnedBonusTotal: Number.isFinite(earnedBonusTotalRaw) ? Math.max(0, Math.floor(earnedBonusTotalRaw)) : 0,
    spentBonusTotal: Number.isFinite(spentBonusTotalRaw) ? Math.max(0, Math.floor(spentBonusTotalRaw)) : 0,
    firstPurchaseDiscountUsed,
    shippingAddress: sanitizeAddress(record.shippingAddress),
    billingAddress: sanitizeAddress(record.billingAddress),
  };
}

export async function parseJsonSafely<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function getAuthCookieMaxAge(remember: boolean): number {
  return remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
}

