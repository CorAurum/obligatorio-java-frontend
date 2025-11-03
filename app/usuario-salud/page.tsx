import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import UsuarioSaludContent from './UsuarioSaludContent';

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

        const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

        return { header, payload, signature: parts[2] };
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
}

export default async function UsuarioSaludPage() {
    const session = await getIronSession<SessionData>(await cookies(), {
        password: process.env.SESSION_SECRET || 'a4b23d96f8d3e44f8f40d61c12b5a9d057e0dba5cf871e2fd41f6b033a1c8b67',
        cookieName: 'auth-session',
    });

    // Check if user is authenticated
    if (!session.isLoggedIn) {
        redirect('/');
    }

    const decoded = session.user?.id_token ? decodeJWT(session.user.id_token) : null;
    const userInfo = decoded?.payload;

    return <UsuarioSaludContent userInfo={userInfo} />;
}
