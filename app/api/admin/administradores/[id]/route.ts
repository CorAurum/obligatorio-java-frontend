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
  userInfo?: any;
  isLoggedIn?: boolean;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getIronSession<SessionData>(await cookies(), {
    password: process.env.SESSION_SECRET || 'a4b23d96f8d3e44f8f40d61c12b5a9d057e0dba5cf871e2fd41f6b033a1c8b67',
    cookieName: 'auth-session',
  });

  if (!session.isLoggedIn || !session.user?.access_token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const adminData = await request.json();
    const token = session.user.access_token;

    const updatedAdmin = await backendAPI.actualizarAdministrador(Number(id), adminData, token);

    return NextResponse.json(updatedAdmin);
  } catch (error) {
    console.error('Error updating administrador:', error);
    return NextResponse.json(
      { error: 'Failed to update administrador' },
      { status: 500 }
    );
  }
}
