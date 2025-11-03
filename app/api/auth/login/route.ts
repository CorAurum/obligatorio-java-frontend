import { NextResponse } from 'next/server';

export async function GET() {
    // Read OIDC configuration from environment variables
    const clientId = process.env.OIDC_CLIENT_ID;
    const redirectUri = process.env.OIDC_REDIRECT_URI;
    const authorizeUrl = process.env.OIDC_AUTHORIZE_URL;
    const scope = process.env.OIDC_SCOPE;

    // Validate required environment variables
    if (!clientId || !redirectUri || !authorizeUrl || !scope) {
        return NextResponse.redirect(new URL('/?error=missing_config', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'));
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
    });

    const authUrl = `${authorizeUrl}?${params.toString()}`;

    // Redirect the user to the gub.uy authorization page
    return NextResponse.redirect(authUrl);
}
