import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPayloadAuthConfig, parseJsonSafely } from '@/lib/payload-auth';

type AddressType = 'billing' | 'shipping';

type AddressPayload = {
  firstName?: unknown;
  lastName?: unknown;
  phone?: unknown;
  country?: unknown;
  address?: unknown;
  city?: unknown;
  zip?: unknown;
  companyName?: unknown;
  companyId?: unknown;
  vatId?: unknown;
};

type UpdateBody = {
  addressType?: unknown;
  address?: AddressPayload;
};

type BackendResponse = {
  doc?: unknown;
  errors?: unknown;
  error?: unknown;
};

const sanitizeString = (value: unknown, maxLength: number) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, maxLength);
};

const sanitizeCountry = () => 'CZ';

const sanitizeAddress = (value: AddressPayload | undefined, addressType: AddressType) => ({
  firstName: sanitizeString(value?.firstName, 120),
  lastName: sanitizeString(value?.lastName, 120),
  phone: sanitizeString(value?.phone, 40),
  country: sanitizeCountry(),
  address: sanitizeString(value?.address, 160),
  city: sanitizeString(value?.city, 120),
  zip: sanitizeString(value?.zip, 40),
  companyName: addressType === 'billing' ? sanitizeString(value?.companyName, 160) : undefined,
  companyId: addressType === 'billing' ? sanitizeString(value?.companyId, 80) : undefined,
  vatId: addressType === 'billing' ? sanitizeString(value?.vatId, 80) : undefined,
});

const hasAddressContent = (address: ReturnType<typeof sanitizeAddress>) =>
  Object.entries(address).some(([key, field]) => key !== 'country' && typeof field === 'string' && field.length > 0);

export async function PATCH(request: NextRequest) {
  const config = getPayloadAuthConfig();
  if (!config) {
    return NextResponse.json(
      { error: 'Auth backend is not configured. Set PAYLOAD_API_URL.' },
      { status: 500 },
    );
  }

  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'Please sign in to update your addresses.' }, { status: 401 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(config.cookieName)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Missing auth session.' }, { status: 401 });
  }

  let body: UpdateBody;

  try {
    body = (await request.json()) as UpdateBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const addressType = body.addressType === 'billing' || body.addressType === 'shipping' ? body.addressType : null;
  if (!addressType) {
    return NextResponse.json({ error: 'Unknown address type.' }, { status: 400 });
  }

  const sanitizedAddress = sanitizeAddress(body.address, addressType);
  if (!hasAddressContent(sanitizedAddress)) {
    return NextResponse.json({ error: 'Please fill in at least one address field before saving.' }, { status: 400 });
  }

  try {
    const backendResponse = await fetch(`${config.baseUrl}/api/${config.collection}/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`,
      },
      body: JSON.stringify({
        [`${addressType}Address`]: sanitizedAddress,
        ...(addressType === 'shipping' && !user.firstName && sanitizedAddress.firstName
          ? { firstName: sanitizedAddress.firstName }
          : {}),
        ...(addressType === 'shipping' && !user.lastName && sanitizedAddress.lastName
          ? { lastName: sanitizedAddress.lastName }
          : {}),
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });

    const payload = await parseJsonSafely<BackendResponse>(backendResponse);

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          error:
            typeof payload?.error === 'string'
              ? payload.error
              : 'Unable to save the address right now.',
        },
        { status: backendResponse.status },
      );
    }

    return NextResponse.json(
      {
        message: addressType === 'billing' ? 'Billing address saved.' : 'Shipping address saved.',
        user: payload?.doc ?? null,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch {
    return NextResponse.json({ error: 'Address service is currently unavailable.' }, { status: 502 });
  }
}
