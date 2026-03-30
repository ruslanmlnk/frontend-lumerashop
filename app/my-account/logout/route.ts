import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  await cookies();

  return NextResponse.redirect(new URL('/my-account', request.url));
}
