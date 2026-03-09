import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  getAuthCookieMaxAge,
  getPayloadAuthConfig,
  getRequestIp,
  isValidEmail,
  normalizeEmail,
  parseJsonSafely,
  sanitizeAuthUser,
  validatePassword,
} from '@/lib/payload-auth';

type RegisterBody = {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
};

type PayloadRegisterResponse = {
  errors?: Array<{ message?: string }>;
};

type PayloadLoginResponse = {
  token?: unknown;
  user?: unknown;
};

function normalizeName(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }

  if (normalized.length > 80) {
    return undefined;
  }

  return normalized;
}

function readPayloadErrorMessage(payload: PayloadRegisterResponse | null): string {
  const first = payload?.errors?.[0]?.message;
  return typeof first === 'string' ? first : '';
}

export async function POST(request: NextRequest) {
  const config = getPayloadAuthConfig();
  if (!config) {
    return NextResponse.json(
      { error: 'Auth backend is not configured. Set PAYLOAD_API_URL.' },
      { status: 500 },
    );
  }

  const ip = getRequestIp(request);
  const limit = checkRateLimit(`auth:register:${ip}`, 5, 15 * 60 * 1000);
  if (limit.limited) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Try again later.' },
      { status: 429 },
    );
  }

  let body: RegisterBody;
  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const firstName = normalizeName(body.firstName);
  const lastName = normalizeName(body.lastName);
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  const confirmPassword = typeof body.confirmPassword === 'string' ? body.confirmPassword : '';

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
  }

  const passwordValidationError = validatePassword(password);
  if (passwordValidationError) {
    return NextResponse.json({ error: passwordValidationError }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ error: 'Password confirmation does not match.' }, { status: 400 });
  }

  const registerPayload: Record<string, unknown> = {
    email,
    password,
  };

  if (firstName) {
    registerPayload.firstName = firstName;
  }

  if (lastName) {
    registerPayload.lastName = lastName;
  }

  try {
    const createResponse = await fetch(`${config.baseUrl}/api/${config.collection}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerPayload),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });

    const createPayload = await parseJsonSafely<PayloadRegisterResponse>(createResponse);
    if (!createResponse.ok) {
      const message = readPayloadErrorMessage(createPayload);
      const duplicate = createResponse.status === 409 || /exist|already|taken/i.test(message);

      return NextResponse.json(
        { error: duplicate ? 'Email is already in use.' : 'Registration failed. Please check your input.' },
        { status: duplicate ? 409 : 400 },
      );
    }

    const loginResponse = await fetch(`${config.baseUrl}/api/${config.collection}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });

    const loginPayload = await parseJsonSafely<PayloadLoginResponse>(loginResponse);
    const token = typeof loginPayload?.token === 'string' ? loginPayload.token : '';
    const user = sanitizeAuthUser(loginPayload?.user);

    if (!loginResponse.ok || !token || !user) {
      return NextResponse.json(
        {
          requiresLogin: true,
          message: 'Account created. Please sign in manually.',
        },
        { status: 200 },
      );
    }

    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set({
      name: config.cookieName,
      value: token,
      httpOnly: true,
      secure: config.secureCookie,
      sameSite: 'lax',
      path: '/',
      maxAge: getAuthCookieMaxAge(true),
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Registration service is currently unavailable.' },
      { status: 502 },
    );
  }
}
