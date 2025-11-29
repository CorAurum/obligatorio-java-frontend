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

  if (!session.isLoggedIn || !session.userInfo?.numeroDocumento || !session.user?.access_token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const cedula = session.userInfo.numeroDocumento;
    const token = session.user.access_token;

    // Step 1: Get Usuario ID from cedula
    const resolvedUsuarioId = await backendAPI.getUsuarioIdByCedula(cedula, token);

    // Step 2: Fetch documentos clínicos and políticas in parallel
    const [documentos, politicas] = await Promise.all([
      backendAPI.getDocumentosClinicos(resolvedUsuarioId, token),
      backendAPI.getPoliticasAcceso(resolvedUsuarioId, token),
    ]);

    return NextResponse.json({
      usuarioId: resolvedUsuarioId,
      documentos,
      politicas,
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
