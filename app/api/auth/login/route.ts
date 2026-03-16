import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  getAuthCookieMaxAge,
  getPayloadAuthConfig,
  getRequestIp,
  isValidEmail,
  normalizeEmail,
  parseJsonSafely,
  resolveSecureAuthCookie,
  sanitizeAuthUser,
} from '@/lib/payload-auth';

type LoginBody = {
  email?: unknown;
  password?: unknown;
  remember?: unknown;
};

type PayloadLoginResponse = {
  token?: unknown;
  user?: unknown;
};

const INVALID_CREDENTIALS = 'Invalid email or password.';

export async function POST(request: NextRequest) {
  const config = getPayloadAuthConfig();
  if (!config) {
    return NextResponse.json(
      { error: 'Auth backend is not configured. Set PAYLOAD_API_URL.' },
      { status: 500 },
    );
  }

  const ip = getRequestIp(request);
  const limit = checkRateLimit(`auth:login:${ip}`, 10, 15 * 60 * 1000);
  if (limit.limited) {
    return NextResponse.json(
      { error: 'Too many login attempts. Try again later.' },
      { status: 429 },
    );
  }

  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  const remember = body.remember === true;

  if (!isValidEmail(email) || password.length < 1 || password.length > 128) {
    return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 400 });
  }

  try {
    const payloadResponse = await fetch(`${config.baseUrl}/api/${config.collection}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });

    const payload = await parseJsonSafely<PayloadLoginResponse>(payloadResponse);
    const token = typeof payload?.token === 'string' ? payload.token : '';
    const user = sanitizeAuthUser(payload?.user);

    if (!payloadResponse.ok || !token || !user) {
      return NextResponse.json({ error: INVALID_CREDENTIALS }, { status: 401 });
    }

    const response = NextResponse.json({ user }, { status: 200 });
    response.cookies.set({
      name: config.cookieName,
      value: token,
      httpOnly: true,
      secure: resolveSecureAuthCookie(request),
      sameSite: 'lax',
      path: '/',
      maxAge: getAuthCookieMaxAge(remember),
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Authentication service is currently unavailable.' },
      { status: 502 },
    );
  }
}

