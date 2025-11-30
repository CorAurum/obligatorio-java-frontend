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

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), {
    password: process.env.SESSION_SECRET!,
    cookieName: 'auth-session',
  });

  if (!session.isLoggedIn || !session.userInfo) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Return the user info that backend already decoded
  return NextResponse.json(session.userInfo);
}
