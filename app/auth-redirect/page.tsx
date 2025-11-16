"use client"

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function AuthRedirectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const portal = searchParams.get('portal')

  useEffect(() => {
    async function checkRoleAndRedirect() {
      try {
        // Get userInfo from session/cookie or fetch it
        const response = await fetch('/api/auth/userinfo')

        if (!response.ok) {
          console.error('Failed to get user info')
          router.push('/?error=auth_failed')
          return
        }

        // Admin verification happens automatically in backend callback
        // If user is not admin, backend returns error and redirects to /?error=not_admin
        // So we just need to redirect to the appropriate portal

        if (portal === 'admin') {
          router.push('/admin-hcen')
        } else {
          // For usuario portal
          router.push('/usuario-salud')
        }
      } catch (error) {
        console.error('Error checking role:', error)
        router.push('/?error=redirect_failed')
      }
    }

    checkRoleAndRedirect()
  }, [router, portal])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Verificando permisos...</p>
      </div>
    </div>
  )
}

export default function AuthRedirectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <AuthRedirectContent />
    </Suspense>
  )
}
