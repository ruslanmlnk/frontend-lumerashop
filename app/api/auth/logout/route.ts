import { NextRequest, NextResponse } from 'next/server';
import { getPayloadAuthConfig, resolveSecureAuthCookie } from '@/lib/payload-auth';

export async function POST(request: NextRequest) {
  const config = getPayloadAuthConfig();
  const cookieName = config?.cookieName || process.env.PAYLOAD_AUTH_COOKIE?.trim() || 'lumera_auth';
  const secureCookie = resolveSecureAuthCookie(request);

  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set({
    name: cookieName,
    value: '',
    httpOnly: true,
    secure: secureCookie,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
