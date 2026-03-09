import { NextResponse } from 'next/server';
import { getPayloadAuthConfig } from '@/lib/payload-auth';

export async function POST() {
  const config = getPayloadAuthConfig();
  const cookieName = config?.cookieName || process.env.PAYLOAD_AUTH_COOKIE?.trim() || 'lumera_auth';
  const secureCookie = config?.secureCookie ?? process.env.NODE_ENV === 'production';

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
