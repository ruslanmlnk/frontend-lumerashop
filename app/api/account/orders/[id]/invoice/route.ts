import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { getPayloadAuthConfig, parseJsonSafely } from '@/lib/payload-auth';

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

type BackendErrorResponse = {
    error?: unknown;
    errors?: Array<{
        message?: unknown;
    }>;
};

const getBackendErrorMessage = (payload: BackendErrorResponse | null) => {
    const firstError = payload?.errors?.[0];

    if (typeof firstError?.message === 'string' && firstError.message.trim()) {
        return firstError.message;
    }

    return typeof payload?.error === 'string' && payload.error.trim()
        ? payload.error
        : 'Unable to download invoice right now.';
};

export async function GET(_request: Request, { params }: RouteContext) {
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
        return NextResponse.json({ error: 'Please sign in to download invoices.' }, { status: 401 });
    }

    const { id } = await params;
    const documentId = typeof id === 'string' ? id.trim() : '';

    if (!documentId) {
        return NextResponse.json({ error: 'Missing order ID.' }, { status: 400 });
    }

    try {
        const backendResponse = await fetch(
            `${config.baseUrl}/api/orders/${encodeURIComponent(documentId)}/invoice`,
            {
                method: 'GET',
                headers: {
                    Authorization: `JWT ${token}`,
                },
                cache: 'no-store',
                signal: AbortSignal.timeout(15_000),
            },
        );

        if (!backendResponse.ok) {
            const payload = await parseJsonSafely<BackendErrorResponse>(backendResponse);

            return NextResponse.json(
                { error: getBackendErrorMessage(payload) },
                { status: backendResponse.status || 400 },
            );
        }

        const data = await backendResponse.arrayBuffer();
        const contentType = backendResponse.headers.get('content-type') || 'application/pdf';
        const contentDisposition = backendResponse.headers.get('content-disposition');
        const downloadDisposition = contentDisposition
            ? contentDisposition.replace(/^inline/i, 'attachment')
            : 'attachment; filename="invoice.pdf"';

        return new NextResponse(data, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': downloadDisposition,
                'Cache-Control': 'no-store',
            },
        });
    } catch {
        return NextResponse.json(
            { error: 'Invoice service is currently unavailable.' },
            { status: 502 },
        );
    }
}
