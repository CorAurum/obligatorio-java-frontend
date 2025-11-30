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

export default async function UsuarioSaludPage() {
    const session = await getIronSession<SessionData>(await cookies(), {
        password: process.env.SESSION_SECRET || 'a4b23d96f8d3e44f8f40d61c12b5a9d057e0dba5cf871e2fd41f6b033a1c8b67',
        cookieName: 'auth-session',
    });

    // Check if user is authenticated
    if (!session.isLoggedIn) {
        redirect('/');
    }

    return <UsuarioSaludContent userInfo={session.userInfo} />;
}
