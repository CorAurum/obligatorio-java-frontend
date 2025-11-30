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
  role?: string;
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

  const cedula = session.userInfo.numeroDocumento;
  const token = session.user.access_token;
  const role = session.role || 'USUARIO';

  try {
    let resolvedId: string;
    let documentos: any[] = [];
    let politicas: any[] = [];
    let isAdmin = false;

    // First try to get as usuario
    try {
      resolvedId = await backendAPI.getUsuarioIdByCedula(cedula, token);

      // If successful, fetch documentos clínicos and políticas in parallel
      [documentos, politicas] = await Promise.all([
        backendAPI.getDocumentosClinicos(resolvedId, token),
        backendAPI.getPoliticasAcceso(resolvedId, token),
      ]);
    } catch (usuarioError) {
      // If usuario lookup fails, try admin lookup
      console.log('Usuario lookup failed, trying admin lookup:', usuarioError);
      const adminData = await backendAPI.getAdminByCedula(cedula, token);
      if (!adminData) {
        throw new Error(`User not found as usuario or admin with cedula ${cedula}`);
      }
      resolvedId = adminData.id.toString();
      isAdmin = true;
      // Admins don't have clinical documents or policies, so return empty arrays
    }

    return NextResponse.json({
      usuarioId: resolvedId,
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
