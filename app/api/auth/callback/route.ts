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

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    // Check if we received an authorization code
    if (!code) {
        return NextResponse.redirect(new URL('/?error=no_code', request.url));
    }

    try {
        // Exchange the authorization code for tokens
        const tokenResponse = await exchangeCodeForTokens(code);

        if (!tokenResponse.ok) {
            console.error('Token exchange failed');
            return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url));
        }

        const tokens = await tokenResponse.json();

        // Create session with iron-session
        const session = await getIronSession<SessionData>(await cookies(), {
            password: process.env.SESSION_SECRET || 'a4b23d96f8d3e44f8f40d61c12b5a9d057e0dba5cf871e2fd41f6b033a1c8b67',
            cookieName: 'auth-session',
        });

        // Store user info in session
        session.user = {
            id_token: tokens.id_token,
            access_token: tokens.access_token,
            token_type: tokens.token_type,
            expires_in: tokens.expires_in,
        };
        session.isLoggedIn = true;

        await session.save();

        // Redirect to usuario-salud page
        return NextResponse.redirect(new URL('/usuario-salud', request.url));
    } catch (error) {
        console.error('Callback error:', error);
        return NextResponse.redirect(new URL('/?error=callback_failed', request.url));
    }
}

async function exchangeCodeForTokens(code: string) {
    const clientId = process.env.OIDC_CLIENT_ID!;
    const clientSecret = process.env.OIDC_CLIENT_SECRET!;
    const redirectUri = process.env.OIDC_REDIRECT_URI!;
    const tokenUrl = process.env.OIDC_TOKEN_URL!;

    // Create Basic Auth header
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    // Prepare the token request body
    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
    });

    // Make the token exchange request
    return fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
    });
}
