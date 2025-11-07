import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface SessionData {
    user?: {
        id_token: string;
        access_token: string;
        token_type: string;
        expires_in: number;
    };
    isLoggedIn?: boolean;
}

function decodeJWT(token: string) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        return payload;
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
}

export async function GET() {
    const session = await getIronSession<SessionData>(await cookies(), {
        password: process.env.SESSION_SECRET || 'a4b23d96f8d3e44f8f40d61c12b5a9d057e0dba5cf871e2fd41f6b033a1c8b67',
        cookieName: 'auth-session',
    });

    if (!session.isLoggedIn || !session.user?.id_token) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Decode the JWT to get user info
    const userInfo = decodeJWT(session.user.id_token);

    if (!userInfo) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json(userInfo);
}
