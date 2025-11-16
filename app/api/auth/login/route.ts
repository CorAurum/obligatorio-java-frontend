import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get intended portal from query parameter
  const searchParams = request.nextUrl.searchParams;
  const portal = searchParams.get('portal') || 'usuario';

  // Get backend URL from environment
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/CompC-1.0-SNAPSHOT';

  // Simply redirect to backend login endpoint
  const backendLoginUrl = `${backendUrl}/api/auth/login?portal=${portal}`;
  return NextResponse.redirect(backendLoginUrl);
}
