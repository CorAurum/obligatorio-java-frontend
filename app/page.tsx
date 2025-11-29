"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  Hospital,
  UserCheck,
  Settings,
} from "lucide-react"

function DashboardContent() {
  const [selectedPortal, setSelectedPortal] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  // Handle error parameters from failed authentication
  const error = searchParams.get('error')

  // Show error message if authentication failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-red-800">Error de Autenticación</h2>
            </div>
            <p className="text-red-700 mb-4">
              {decodeURIComponent(error)}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
            >
              Intentar de Nuevo
            </button>
          </div>
        </div>
      </div>
    )
  }

  const portals = [
    {
      id: "admin-hcen",
      title: "Portal Admin HCEN",
      description: "Administración central del sistema nacional",
      icon: Settings,
      color: "bg-blue-600",
      features: [
        "Gestión de clínicas",
        "Reportes y análisis agregados",
        "Configuración de plataforma",
        "Monitoreo del sistema",
      ],
      userType: "Administrador HCEN",
      route: "/api/auth/login?portal=admin",
    },
    {
      id: "usuarios-salud",
      title: "Portal Usuarios de Salud",
      description: "Acceso a historia clínica personal",
      icon: UserCheck,
      color: "bg-green-600",
      features: [
        "Visualización de historia clínica",
        "Gestión de políticas de acceso",
        "Configuración de notificaciones",
        "Auditoría de accesos",
      ],
      userType: "Usuario de Salud",
      route: "/api/auth/login?portal=usuario",
    },
    {
      id: "admin-clinica",
      title: "Portal Admin Clínica",
      description: "Administración de clínicas y centros médicos",
      icon: Hospital,
      color: "bg-purple-600",
      features: [
        "Gestión de usuarios de salud",
        "Gestión de profesionales",
        "Personalización del portal",
        "Conexión como nodo periférico",
      ],
      userType: "Administrador Clínica",
      route: "/admin-clinica",
    },
    {
      id: "profesionales-salud",
      title: "Portal Profesionales de Salud",
      description: "Herramientas para profesionales médicos",
      icon: Activity,
      color: "bg-red-600",
      features: [
        "Alta de documentos clínicos",
        "Acceso a historia clínica",
        "Solicitud de acceso a documentos",
        "Consulta de información externa",
      ],
      userType: "Profesional de Salud",
      route: "/api/auth/login?portal=profesional",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">HCEN.uy</h1>
                  <p className="text-sm text-gray-600">Historia Clínica Electrónica Nacional</p>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              Sistema Nacional Integrado de Salud
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Portal Access */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Acceso a Portales</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {portals.map((portal) => (
              <Card
                key={portal.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedPortal === portal.id ? "ring-2 ring-blue-600" : ""
                  }`}
                onClick={() => setSelectedPortal(selectedPortal === portal.id ? null : portal.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${portal.color} rounded-lg flex items-center justify-center`}>
                        <portal.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle>{portal.title}</CardTitle>
                        <CardDescription>{portal.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {portal.userType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedPortal === portal.id && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Funcionalidades:</h4>
                        <ul className="space-y-1">
                          {portal.features.map((feature, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center">
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4">
                          <a href={portal.route}>
                            <Button className="w-full" size="sm">
                              Acceder con gub.uy
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HCENDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
