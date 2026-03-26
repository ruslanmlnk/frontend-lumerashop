import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getPayloadAuthConfig, resolveSecureAuthCookie } from '@/lib/payload-auth';

export async function GET(request: NextRequest) {
  const config = getPayloadAuthConfig();
  const cookieName = config?.cookieName || process.env.PAYLOAD_AUTH_COOKIE?.trim() || 'lumera_auth';
  const secureCookie = resolveSecureAuthCookie(request);

  const cookieStore = await cookies();
  cookieStore.set({
    name: cookieName,
    value: '',
    httpOnly: true,
    secure: secureCookie,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return NextResponse.redirect(new URL('/my-account', request.url));
}
