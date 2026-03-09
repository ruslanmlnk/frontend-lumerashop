import 'server-only';
import type { NextRequest } from 'next/server';

export type AuthUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
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

export function getPayloadAuthConfig(): PayloadAuthConfig | null {
  const baseUrlRaw = process.env.PAYLOAD_API_URL?.trim();
  if (!baseUrlRaw) {
    return null;
  }

  const collection = process.env.PAYLOAD_AUTH_COLLECTION?.trim() || DEFAULT_AUTH_COLLECTION;
  const cookieName = process.env.PAYLOAD_AUTH_COOKIE?.trim() || DEFAULT_AUTH_COOKIE;

  return {
    baseUrl: stripTrailingSlash(baseUrlRaw),
    collection,
    cookieName,
    secureCookie: process.env.NODE_ENV === 'production',
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
  const name = typeof record.name === 'string' ? record.name : undefined;

  return {
    id: String(id),
    email,
    firstName,
    lastName,
    name,
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

