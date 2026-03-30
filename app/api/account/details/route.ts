import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  getPayloadAuthConfig,
  isValidEmail,
  normalizeEmail,
  parseJsonSafely,
  validateRegistrationPassword,
} from '@/lib/payload-auth';

type UpdateBody = {
  firstName?: unknown;
  lastName?: unknown;
  displayName?: unknown;
  email?: unknown;
  currentPassword?: unknown;
  newPassword?: unknown;
  confirmPassword?: unknown;
};

type PayloadLoginResponse = {
  token?: unknown;
  user?: unknown;
  errors?: Array<{ message?: string }>;
};

type PayloadPatchResponse = {
  doc?: unknown;
  errors?: Array<{ message?: string }>;
  error?: unknown;
};

const sanitizeName = (value: unknown, maxLength = 80) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, maxLength);
};

const getPayloadErrorMessage = (payload: PayloadPatchResponse | PayloadLoginResponse | null) => {
  const firstError = payload?.errors?.[0];
  const fallbackError =
    payload && 'error' in payload && typeof payload.error === 'string' ? payload.error : '';

  return typeof firstError?.message === 'string'
    ? firstError.message
    : fallbackError;
};

export async function PATCH(request: NextRequest) {
  const config = getPayloadAuthConfig();
  if (!config) {
    return NextResponse.json(
      { error: 'Auth backend is not configured. Set PAYLOAD_API_URL.' },
      { status: 500 },
    );
  }

  const currentUser = await getCurrentUser();
  if (!currentUser?.id) {
    return NextResponse.json({ error: 'Please sign in to update your account.' }, { status: 401 });
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

  const firstName = sanitizeName(body.firstName);
  const lastName = sanitizeName(body.lastName);
  const displayName = sanitizeName(body.displayName, 120);
  const email = normalizeEmail(body.email);
  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
  const confirmPassword = typeof body.confirmPassword === 'string' ? body.confirmPassword : '';
  const wantsPasswordChange = currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0;

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
  }

  if (!firstName && !lastName && !displayName) {
    return NextResponse.json(
      { error: 'Please fill in at least your first name, last name, or display name.' },
      { status: 400 },
    );
  }

  if (wantsPasswordChange) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Please enter your current password.' }, { status: 400 });
    }

    const passwordValidationError = validateRegistrationPassword(newPassword);
    if (passwordValidationError) {
      return NextResponse.json({ error: passwordValidationError }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Password confirmation does not match.' }, { status: 400 });
    }

    try {
      const loginResponse = await fetch(`${config.baseUrl}/api/${config.collection}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: currentUser.email,
          password: currentPassword,
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(10_000),
      });

      const loginPayload = await parseJsonSafely<PayloadLoginResponse>(loginResponse);
      if (!loginResponse.ok) {
        return NextResponse.json(
          { error: getPayloadErrorMessage(loginPayload) || 'Current password is incorrect.' },
          { status: 400 },
        );
      }
    } catch {
      return NextResponse.json({ error: 'Password verification is currently unavailable.' }, { status: 502 });
    }
  }

  const patchPayload: Record<string, unknown> = {
    firstName: firstName || null,
    lastName: lastName || null,
    displayName: displayName || null,
    email,
  };

  if (wantsPasswordChange) {
    patchPayload.password = newPassword;
  }

  try {
    const patchResponse = await fetch(`${config.baseUrl}/api/${config.collection}/${currentUser.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`,
      },
      body: JSON.stringify(patchPayload),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });

    const patchPayloadResponse = await parseJsonSafely<PayloadPatchResponse>(patchResponse);

    if (!patchResponse.ok) {
      const message = getPayloadErrorMessage(patchPayloadResponse);
      const duplicate = patchResponse.status === 409 || /exist|already|taken|duplicate/i.test(message);

      return NextResponse.json(
        {
          error: duplicate ? 'This email address is already in use.' : message || 'Unable to update account details.',
        },
        { status: duplicate ? 409 : patchResponse.status || 400 },
      );
    }

    return NextResponse.json(
      {
        message: wantsPasswordChange ? 'Account details and password updated.' : 'Account details updated.',
        user: patchPayloadResponse?.doc ?? null,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch {
    return NextResponse.json({ error: 'Account service is currently unavailable.' }, { status: 502 });
  }
}
