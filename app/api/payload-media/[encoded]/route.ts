import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_PAYLOAD_API_URL = 'http://127.0.0.1:3001';
const MEDIA_REVALIDATE_SECONDS = 31536000;
const PASSTHROUGH_HEADERS = [
  'accept-ranges',
  'content-disposition',
  'content-encoding',
  'content-length',
  'etag',
  'last-modified',
  'vary',
] as const;

const getPayloadBaseUrl = (): string =>
  (process.env.PAYLOAD_API_URL?.trim() || DEFAULT_PAYLOAD_API_URL).replace(/\/+$/, '');

const decodeSource = (encoded: string): string | null => {
  try {
    return decodeURIComponent(encoded);
  } catch {
    return null;
  }
};

const resolveTargetUrl = (src: string, baseUrl: string): URL | null => {
  try {
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return new URL(src);
    }

    if (src.startsWith('/')) {
      return new URL(src, `${baseUrl}/`);
    }

    return new URL(`/${src.replace(/^\/+/, '')}`, `${baseUrl}/`);
  } catch {
    return null;
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ encoded: string }> },
) {
  const { encoded } = await params;
  const src = decodeSource(encoded);

  if (!src) {
    return new NextResponse('Invalid media source.', { status: 400 });
  }

  const payloadBaseUrl = getPayloadBaseUrl();
  const targetUrl = resolveTargetUrl(src, payloadBaseUrl);
  if (!targetUrl) {
    return new NextResponse('Invalid media target.', { status: 400 });
  }
  const payloadOrigin = new URL(payloadBaseUrl).origin;
  if (targetUrl.origin !== payloadOrigin) {
    return new NextResponse('External media source is not allowed.', { status: 400 });
  }

  const range = request.headers.get('range');

  let upstream: Response;

  try {
    upstream = await fetch(targetUrl.toString(), {
      headers: range ? { range } : undefined,
      signal: request.signal,
    });
  } catch {
    return new NextResponse('Media upstream is unavailable.', { status: 502 });
  }

  if (!upstream.ok && upstream.status !== 206) {
    return new NextResponse('Media not found.', { status: upstream.status || 404 });
  }

  if (!upstream.body) {
    return new NextResponse('Media body is empty.', { status: 404 });
  }

  const headers = new Headers();
  const contentType = upstream.headers.get('content-type');
  const cacheControl = upstream.headers.get('cache-control');

  if (contentType) {
    headers.set('content-type', contentType);
  }

  for (const headerName of [...PASSTHROUGH_HEADERS, 'content-range'] as const) {
    const headerValue = upstream.headers.get(headerName);
    if (headerValue) {
      headers.set(headerName, headerValue);
    }
  }

  headers.set('cache-control', cacheControl || 'public, max-age=31536000, immutable');
  headers.set('x-content-type-options', 'nosniff');

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers,
  });
}
