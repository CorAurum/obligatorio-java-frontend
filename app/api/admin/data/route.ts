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

export async function GET(request: NextRequest) {
  const session = await getIronSession<SessionData>(await cookies(), {
    password: process.env.SESSION_SECRET || 'a4b23d96f8d3e44f8f40d61c12b5a9d057e0dba5cf871e2fd41f6b033a1c8b67',
    cookieName: 'auth-session',
  });

  if (!session.isLoggedIn || !session.user?.access_token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const token = session.user.access_token;

    // Fetch all admin data in parallel
    const [clinicas, especialidades, administradores, usuarios, profesionales] = await Promise.all([
      backendAPI.getCentrosDeSalud(token),
      backendAPI.getEspecialidades(token),
      backendAPI.getAdministradores(token),
      backendAPI.getUsuarios(token),
      backendAPI.getProfesionales(token)
    ]);

    return NextResponse.json({
      clinicas,
      especialidades,
      administradores,
      usuarios,
      profesionales
    });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin data' },
      { status: 500 }
    );
  }
}
