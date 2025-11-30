import { redirect } from 'next/navigation';

export default async function AuthRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await searchParams since it's a Promise in Next.js 15
  const params = await searchParams;

  // Build the URL for the session setup API route
  const setupUrl = new URL('/api/auth/setup-session', 'http://localhost:3000');

  // Copy all search parameters to the setup URL
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      setupUrl.searchParams.set(key, Array.isArray(value) ? value[0] : value);
    }
  }

  // Redirect to the API route that handles session setup
  redirect(setupUrl.toString());
}