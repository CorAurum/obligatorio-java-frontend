import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface SessionData {
  user?: {
    id_token: string;
    access_token: string;
    token_type: string;
    expires_in: number;
  };
  userInfo?: OidcUserInfo;
  isLoggedIn?: boolean;
}

interface OidcUserInfo {
  subject: string;
  numeroDocumento: string;
  email: string;
  name: string;
  givenName?: string;
  familyName?: string;
  preferredUsername?: string;
  issuedAt?: number;
  expiresAt?: number;
  issuer?: string;
  audience?: string;
}

export async function POST() {
  const session = await getIronSession<SessionData>(await cookies(), {
    password: process.env.SESSION_SECRET || 'a4b23d96f8d3e44f8f40d61c12b5a9d057e0dba5cf871e2fd41f6b033a1c8b67',
    cookieName: 'auth-session',
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Clear session and redirect with a GET (avoid 307 POST replay)
  session.destroy();
  return NextResponse.redirect(new URL('/', baseUrl), 303);
}
