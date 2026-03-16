import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPayloadAuthConfig, resolveSecureAuthCookie } from '@/lib/payload-auth';

export default async function LogoutPage() {
  const config = getPayloadAuthConfig();
  const cookieName = config?.cookieName || process.env.PAYLOAD_AUTH_COOKIE?.trim() || 'lumera_auth';
  const secureCookie = resolveSecureAuthCookie();

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

  redirect('/my-account');
}
