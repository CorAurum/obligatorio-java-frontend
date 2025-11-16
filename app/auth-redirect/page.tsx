"use client"

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { backendAPI } from '@/lib/api/backend'

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

        const userInfo = await response.json()
        const cedula = userInfo?.numero_documento

        if (!cedula) {
          console.error('No cedula found in user info')
          router.push('/?error=no_cedula')
          return
        }

        // If user is trying to access admin portal, verify admin status
        if (portal === 'admin') {
          console.log('Verificando acceso admin para cedula:', cedula)
          const admin = await backendAPI.checkIsAdmin(cedula)

          if (admin) {
            console.log('Usuario es Admin HCEN:', admin)
            router.push('/admin-hcen')
          } else {
            console.log('Usuario no autorizado para portal admin')
            router.push('/?error=not_admin')
          }
        } else {
          // For usuario portal, no verification needed
          console.log('Acceso a portal usuario')
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
