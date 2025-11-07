"use client"

import { useState, useEffect } from "react"
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

export default function HCENDashboard() {
  const [selectedPortal, setSelectedPortal] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  // If we have code and state parameters from gub.uy, redirect to callback
  useEffect(() => {
    if (code && state) {
      router.replace(`/api/auth/callback?code=${code}&state=${state}`)
    }
  }, [code, state, router])

  // Show loading while redirecting
  if (code && state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Completando autenticación...</p>
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
      route: "/profesionales-salud",
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
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedPortal === portal.id ? "ring-2 ring-blue-600" : ""
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
