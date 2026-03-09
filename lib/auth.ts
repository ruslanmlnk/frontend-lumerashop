import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { getPayloadAuthConfig, parseJsonSafely, sanitizeAuthUser, type AuthUser } from '@/lib/payload-auth';

type PayloadMeResponse = {
  user?: unknown;
};

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const config = getPayloadAuthConfig();
  if (!config) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(config.cookieName)?.value;
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${config.baseUrl}/api/${config.collection}/me`, {
      method: 'GET',
      headers: {
        Authorization: `JWT ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const payload = await parseJsonSafely<PayloadMeResponse>(response);
    return sanitizeAuthUser(payload?.user);
  } catch {
    return null;
  }
});

