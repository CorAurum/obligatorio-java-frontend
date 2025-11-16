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
    userInfo?: OidcUserInfo;
    isLoggedIn?: boolean;
    intendedPortal?: 'admin' | 'usuario' | 'profesional';
}

interface AuthCallbackResponse {
    redirectUrl: string;
    portal: string;
    userInfo: OidcUserInfo;
    backendToken?: string;
    error?: string;
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

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const portal = searchParams.get('portal') || 'usuario';

    if (!code) {
        // Handle error - redirect to error page
        return NextResponse.redirect(new URL('/?error=no_code', request.url));
    }

    try {
        // Get backend URL
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/CompC-1.0-SNAPSHOT';

        // Call backend callback endpoint
        const backendResponse = await fetch(`${backendUrl}/api/auth/callback/web?code=${code}&state=${state}&portal=${portal}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        const authData: AuthCallbackResponse = await backendResponse.json();

        if (!backendResponse.ok || authData.error) {
            // Handle authentication error
            const errorMsg = authData.error || 'Authentication failed';
            return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(errorMsg)}`, request.url));
        }

        // Create session with backend token and user info
        const session = await getIronSession<SessionData>(await cookies(), {
            password: process.env.SESSION_SECRET!,
            cookieName: 'auth-session',
        });

        session.user = {
            id_token: authData.backendToken || '', // Use backend token instead of gub.uy token
            access_token: authData.backendToken || '',
            token_type: 'Bearer',
            expires_in: 86400, // 24 hours
        };
        session.userInfo = authData.userInfo; // Store decoded user info
        session.isLoggedIn = true;
        await session.save();

        // Redirect to the URL provided by backend
        return NextResponse.redirect(authData.redirectUrl);

    } catch (error) {
        console.error('Callback error:', error);
        return NextResponse.redirect(new URL('/?error=callback_failed', request.url));
    }
}
