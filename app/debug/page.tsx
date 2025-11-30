
export default function DebugPage() {
  const config = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'Not set',
    SESSION_SECRET: process.env.SESSION_SECRET ? '✓ Set' : '✗ Missing',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'Not set',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Backend Authentication Configuration Debug</h1>

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
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Backend Endpoints</h2>
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 rounded">
                  <strong>Backend Login:</strong>
                  <code className="ml-2 text-blue-800">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/CompC-1.0-SNAPSHOT'}/api/auth/login</code>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <strong>Backend Callback:</strong>
                  <code className="ml-2 text-green-800">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/CompC-1.0-SNAPSHOT'}/api/auth/callback/web</code>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">How It Works</h2>
              <div className="text-gray-700 space-y-2">
                <p>New authentication flow with backend handling…</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>User clicks &ldquo;Login with gub.uy&rdquo; on frontend</li>
                  <li>Frontend redirects to backend login endpoint</li>
                  <li>Backend handles OIDC flow with gub.uy</li>
                  <li>Backend processes tokens and returns redirect URL + user info</li>
                  <li>Frontend stores session and redirects to appropriate portal</li>
                </ol>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold text-gray-800 mb-2">Common Issues</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>NEXT_PUBLIC_API_URL must point to the deployed backend</li>
                  <li>Ensure backend is deployed and accessible</li>
                  <li>Verify backend authentication endpoints are working</li>
                  <li>Check backend logs for authentication errors</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
