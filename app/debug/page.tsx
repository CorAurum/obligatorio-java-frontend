import { NextResponse } from 'next/server';

export default function DebugPage() {
  const config = {
    OIDC_CLIENT_ID: process.env.OIDC_CLIENT_ID ? '✓ Set' : '✗ Missing',
    OIDC_CLIENT_SECRET: process.env.OIDC_CLIENT_SECRET ? '✓ Set' : '✗ Missing',
    OIDC_REDIRECT_URI: process.env.OIDC_REDIRECT_URI || 'Not set',
    OIDC_AUTHORIZE_URL: process.env.OIDC_AUTHORIZE_URL || 'Not set',
    OIDC_TOKEN_URL: process.env.OIDC_TOKEN_URL || 'Not set',
    OIDC_SCOPE: process.env.OIDC_SCOPE || 'Not set',
    OIDC_LOGOUT_URL: process.env.OIDC_LOGOUT_URL || 'Not set',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'Not set',
    SESSION_SECRET: process.env.SESSION_SECRET ? '✓ Set' : '✗ Missing',
  };

  const expectedRedirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'}/api/auth/callback`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">OIDC Configuration Debug</h1>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Environment Variables</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(config).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-mono text-sm text-gray-700">{key}</span>
                    <span className={`font-medium ${value.startsWith('✓') ? 'text-green-600' : value.startsWith('✗') ? 'text-red-600' : 'text-gray-900'}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Expected Configuration</h2>
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 rounded">
                  <strong>Expected Redirect URI:</strong>
                  <code className="ml-2 text-blue-800">{process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'}/</code>
                  <div className="text-sm text-blue-700 mt-1">
                    Your OIDC provider redirects to the home page (due to service restrictions), and we handle the callback from there.
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <strong>Internal Callback Endpoint:</strong>
                  <code className="ml-2 text-green-800">{expectedRedirectUri}</code>
                  <div className="text-sm text-green-700 mt-1">
                    This is where we process the authentication internally.
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Test Endpoints</h2>
              <div className="space-y-2">
                <a
                  href="/api/auth/login"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded mr-4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Test Login Flow
                </a>
                <a
                  href="/callback"
                  className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
                >
                  Test Callback Page
                </a>
              </div>
            </div>

            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">How It Works</h2>
              <div className="text-gray-700 space-y-2">
                <p>Due to OIDC service restrictions, we use a workaround:</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>User clicks "Login with gub.uy"</li>
                  <li>App redirects to OIDC provider with redirect_uri set to home page</li>
                  <li>OIDC provider redirects back to home page with code & state parameters</li>
                  <li>Home page immediately redirects to internal callback handler</li>
                  <li>Callback handler processes tokens and redirects to success page</li>
                </ol>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold text-gray-800 mb-2">Common Issues</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>OIDC_REDIRECT_URI should be set to your base URL (e.g., http://localhost:8080/)</li>
                  <li>Make sure all required environment variables are set in .env.local</li>
                  <li>Verify that your OIDC provider endpoints are correct and accessible</li>
                  <li>If you see "Completing authentication..." for too long, check the callback handler logs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
