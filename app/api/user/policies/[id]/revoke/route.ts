import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { backendAPI } from '@/lib/api/backend';

interface SessionData {
  user?: {
    id_token: string;
    access_token: string;
    token_type: string;
    expires_in: number;
  };
  userInfo?: {
    id: string;
    numeroDocumento?: string;
    email?: string;
    name?: string;
    givenName?: string;
    familyName?: string;
    preferredUsername?: string;
  };
  isLoggedIn?: boolean;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getIronSession<SessionData>(await cookies(), {
    password: process.env.SESSION_SECRET || 'a4b23d96f8d3e44f8f40d61c12b5a9d057e0dba5cf871e2fd41f6b033a1c8b67',
    cookieName: 'auth-session',
  });

  if (!session.isLoggedIn || !session.user?.access_token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const politicaId = id;
    const token = session.user.access_token;
    const result = await backendAPI.revocarPolitica(politicaId, token);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error revoking policy:', error);
    return NextResponse.json(
      { error: 'Failed to revoke policy' },
      { status: 500 }
    );
  }
}
