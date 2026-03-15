import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // TODO: Supabase 환경변수 설정 후 아래 주석 해제
  // const { updateSession } = await import('@/lib/supabase/middleware');
  // return await updateSession(request);

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
