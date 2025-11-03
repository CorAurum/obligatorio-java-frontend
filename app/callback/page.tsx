import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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

function JWTDisplay({ token }: { token: string }) {
    const decoded = decodeJWT(token);

    return (
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Your JWT Token</h2>

            {decoded && (
                <div className="space-y-4">
                    <div>
                        <h3 className="font-medium text-gray-700 mb-2">Decoded Token:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-3 rounded">
                                <h4 className="font-medium text-blue-800 mb-1">Header</h4>
                                <pre className="text-xs text-blue-700 whitespace-pre-wrap">
                                    {JSON.stringify(decoded.header, null, 2)}
                                </pre>
                            </div>
                            <div className="bg-green-50 p-3 rounded md:col-span-2">
                                <h4 className="font-medium text-green-800 mb-1">Payload</h4>
                                <pre className="text-xs text-green-700 whitespace-pre-wrap">
                                    {JSON.stringify(decoded.payload, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-4">
                <h3 className="font-medium text-gray-700 mb-2">Raw JWT Token:</h3>
                <div className="bg-gray-100 p-3 rounded font-mono text-xs text-gray-800 break-all">
                    {token}
                </div>
            </div>
        </div>
    );
}

export default async function CallbackPage() {
    const session = await getIronSession<SessionData>(await cookies(), {
        password: process.env.SESSION_SECRET || 'a4b23d96f8d3e44f8f40d61c12b5a9d057e0dba5cf871e2fd41f6b033a1c8b67',
        cookieName: 'auth-session',
    });

    // Check if user is authenticated
    if (!session.isLoggedIn) {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">You are in!</h1>
                    <p className="text-gray-600 mb-6">
                        Welcome back! You have successfully authenticated with gub.uy and your session is active.
                    </p>
                    <form action="/api/auth/logout" method="POST" className="inline-block">
                        <button
                            type="submit"
                            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
                        >
                            Logout
                        </button>
                    </form>
                </div>

                {session.user?.id_token && (
                    <JWTDisplay token={session.user.id_token} />
                )}
            </div>
        </div>
    );
}
