'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

function LoginForm() {
  return (
    <div className='text-center'>
      <h1 className='text-2xl font-bold mb-8'>Login</h1>
      <div className='space-y-4'>
        <a
          href='/api/auth/login'
          className='bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded inline-block'
        >
          Login with gub.uy
        </a>
        <div>
          <a
            href='/debug'
            className='text-sm text-gray-500 hover:text-gray-700 underline'
          >
            Debug OIDC Configuration
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorMessage({ error }: { error: string }) {
  const getErrorMessage = (errorType: string) => {
    switch (errorType) {
      case 'no_code':
        return 'No authorization code received from the authentication provider.';
      case 'token_exchange_failed':
        return 'Failed to exchange authorization code for tokens.';
      case 'callback_failed':
        return 'An error occurred during the authentication callback.';
      case 'missing_config':
        return 'OIDC configuration is missing. Please check your .env.local file.';
      default:
        return 'An unknown error occurred during authentication.';
    }
  };

  return (
    <div className='bg-red-50 border border-red-200 rounded-md p-4 mb-6'>
      <div className='flex'>
        <div className='flex-shrink-0'>
          <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
            <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
          </svg>
        </div>
        <div className='ml-3'>
          <h3 className='text-sm font-medium text-red-800'>Authentication Error</h3>
          <div className='mt-2 text-sm text-red-700'>
            <p>{getErrorMessage(error)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error');
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // If we have code and state parameters, redirect to callback handler
  useEffect(() => {
    if (code && state) {
      // Redirect to callback endpoint with the same parameters
      router.replace(`/api/auth/callback?code=${code}&state=${state}`);
    }
  }, [code, state, router]);

  // Show loading while redirecting
  if (code && state) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Completing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md mx-auto'>
        {error && <ErrorMessage error={error} />}
        <LoginForm />
      </div>
    </div>
  );
}
