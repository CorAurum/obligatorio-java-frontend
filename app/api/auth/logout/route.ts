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
}

export async function POST(request: NextRequest) {
    const session = await getIronSession<SessionData>(await cookies(), {
        password: process.env.SESSION_SECRET || 'a4b23d96f8d3e44f8f40d61c12b5a9d057e0dba5cf871e2fd41f6b033a1c8b67',
        cookieName: 'auth-session',
    });

    // Get OIDC logout configuration
    const logoutUrl = process.env.OIDC_LOGOUT_URL;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const postLogoutRedirectUri = process.env.OIDC_POST_LOGOUT_REDIRECT_URI || baseUrl;

    // If OIDC logout is configured, perform proper OIDC logout
    if (logoutUrl && session.user?.id_token) {
        // Clear the session first
        session.destroy();

        // Build the OIDC logout URL with id_token_hint and post_logout_redirect_uri
        const logoutParams = new URLSearchParams({
            id_token_hint: session.user.id_token,
            post_logout_redirect_uri: postLogoutRedirectUri,
        });

        const fullLogoutUrl = `${logoutUrl}?${logoutParams.toString()}`;

        // Redirect to OIDC provider's logout endpoint
        return NextResponse.redirect(fullLogoutUrl);
    }

    // Fallback: Clear session and redirect to home page
    session.destroy();
    return NextResponse.redirect(new URL('/', baseUrl));
}
