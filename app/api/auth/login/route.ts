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
    isLoggedIn?: boolean;
    intendedPortal?: 'admin' | 'usuario' | 'profesional';
}

export async function GET(request: NextRequest) {
    // Get intended portal from query parameter
    const searchParams = request.nextUrl.searchParams;
    const portal = searchParams.get('portal') || 'usuario';

    // Save intended portal in session
    const session = await getIronSession<SessionData>(await cookies(), {
        password: process.env.SESSION_SECRET || 'a4b23d96f8d3e44f8f40d61c12b5a9d057e0dba5cf871e2fd41f6b033a1c8b67',
        cookieName: 'auth-session',
    });

    session.intendedPortal = portal as 'admin' | 'usuario' | 'profesional';
    await session.save();

    // Read OIDC configuration from environment variables
    const clientId = process.env.OIDC_CLIENT_ID;
    const redirectUri = process.env.OIDC_REDIRECT_URI;
    const authorizeUrl = process.env.OIDC_AUTHORIZE_URL;
    const scope = process.env.OIDC_SCOPE;

    // Validate required environment variables
    if (!clientId || !redirectUri || !authorizeUrl || !scope) {
        return NextResponse.redirect(new URL('/?error=missing_config', request.url));
    }

    // Generate a random state parameter for CSRF protection
    const state = crypto.randomUUID();

    // Build the authorization URL with parameters
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: scope,
        state: state,
        prompt: 'login', // Force re-authentication for development
    });

    const authUrl = `${authorizeUrl}?${params.toString()}`;

    // Redirect the user to the gub.uy authorization page
    return NextResponse.redirect(authUrl);
}
