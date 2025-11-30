import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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
  const searchParams = request.nextUrl.searchParams;

  // Extract auth data from URL parameters (set by backend)
  const authSuccess = searchParams.get('auth_success') === 'true';
  const portal = searchParams.get('portal');
  const userId = searchParams.get('user_id');
  const backendToken = searchParams.get('backend_token');

  // Try different parameter names for the token
  let token = backendToken;
  if (!token) {
    token = searchParams.get('token');
  }
  if (!token) {
    token = searchParams.get('jwt');
  }
  if (!token) {
    token = searchParams.get('access_token');
  }

  // Debug logging
  console.log('Session setup params:', {
    authSuccess,
    portal,
    userId,
    token: token ? `${token.substring(0, 50)}...` : 'undefined',
    tokenLength: token?.length || 0,
  });

  // Validate JWT structure (should have 3 parts separated by dots)
  const isValidJWT = token && token.split('.').length === 3;

  if (!authSuccess || !token || !isValidJWT) {
    console.error('Session setup failed - missing success, token, or invalid JWT:', {
      authSuccess,
      hasToken: !!token,
      isValidJWT,
      tokenPreview: token?.substring(0, 20) || 'none'
    });
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }

  // Decode JWT to extract user information
  let decodedUserInfo: any = {};
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      decodedUserInfo = payload;
      console.log('Decoded JWT payload:', payload);
    }
  } catch (error) {
    console.error('Failed to decode JWT:', error);
  }

  // Set up session
  const session = await getIronSession<SessionData>(await cookies(), {
    password: process.env.SESSION_SECRET || 'a4b23d96f8d3e44f8f40d61c12b5a9d057e0dba5cf871e2fd41f6b033a1c8b67',
    cookieName: 'auth-session',
  });

  session.user = {
    id_token: token,
    access_token: token,
    token_type: 'Bearer',
    expires_in: 86400
  };

  // Store role and user info from JWT, with fallbacks
  session.role = decodedUserInfo.role || 'USUARIO';
  session.userInfo = {
    id: decodedUserInfo.userId || decodedUserInfo.sub || userId || '',
    numeroDocumento: decodedUserInfo.numero_documento || decodedUserInfo.numeroDocumento || decodedUserInfo.document?.number || decodedUserInfo.sub || userId || '',
    email: decodedUserInfo.email || '',
    name: decodedUserInfo.name || decodedUserInfo.fullName || '',
    givenName: decodedUserInfo.primer_nombre || decodedUserInfo.givenName || '',
    familyName: decodedUserInfo.primer_apellido || decodedUserInfo.familyName || '',
    preferredUsername: decodedUserInfo.preferred_username || decodedUserInfo.preferredUsername || '',
  };
  session.isLoggedIn = true;

  await session.save();

  // Redirect to appropriate portal
  let redirectUrl = '/';
  console.log('Session setup portal:', portal);
  switch (portal) {
    case 'admin':
      redirectUrl = '/admin-hcen';
      break;
    case 'profesional':
      redirectUrl = '/profesional';
      break;
    case 'usuario':
    default:
      redirectUrl = '/usuario-salud';
      break;
  }

  console.log(`Session setup successful, redirecting to: ${redirectUrl}`);
  return NextResponse.redirect(new URL(redirectUrl, request.url));
}
