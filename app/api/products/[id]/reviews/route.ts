import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { getPayloadAuthConfig, getRequestIp, parseJsonSafely } from '@/lib/payload-auth';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type ReviewBody = {
  rating?: unknown;
  comment?: unknown;
};

type BackendReviewResponse = {
  message?: unknown;
  error?: unknown;
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  const config = getPayloadAuthConfig();
  if (!config) {
    return NextResponse.json(
      { error: 'Auth backend is not configured. Set PAYLOAD_API_URL.' },
      { status: 500 },
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(config.cookieName)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Please sign in to leave a review.' }, { status: 401 });
  }

  const ip = getRequestIp(request);
  const limit = checkRateLimit(`product-review:${ip}`, 5, 15 * 60 * 1000);
  if (limit.limited) {
    return NextResponse.json(
      { error: 'Too many review attempts. Please try again a bit later.' },
      { status: 429 },
    );
  }

  let body: ReviewBody;
  try {
    body = (await request.json()) as ReviewBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { id } = await params;
  const productId = typeof id === 'string' ? id.trim() : '';
  const rating = typeof body.rating === 'number' ? body.rating : Number(body.rating);
  const comment = typeof body.comment === 'string' ? body.comment.trim() : '';

  if (!productId) {
    return NextResponse.json({ error: 'Missing product ID.' }, { status: 400 });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 });
  }

  if (comment.length < 3 || comment.length > 2000) {
    return NextResponse.json(
      { error: 'Review text must be between 3 and 2000 characters.' },
      { status: 400 },
    );
  }

  try {
    const backendResponse = await fetch(`${config.baseUrl}/api/product-reviews/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`,
      },
      body: JSON.stringify({
        productId,
        rating,
        comment,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });

    const payload = await parseJsonSafely<BackendReviewResponse>(backendResponse);

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          error:
            typeof payload?.error === 'string'
              ? payload.error
              : 'Unable to submit review right now.',
        },
        { status: backendResponse.status },
      );
    }

    return NextResponse.json(
      {
        message:
          typeof payload?.message === 'string'
            ? payload.message
            : 'Review submitted successfully and is awaiting approval.',
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: 'Review service is currently unavailable.' },
      { status: 502 },
    );
  }
}
