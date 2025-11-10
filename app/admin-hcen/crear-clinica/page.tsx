"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Hospital, CheckCircle, AlertCircle } from "lucide-react"
import { backendAPI } from "@/lib/api/backend"

export default function CrearClinicaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    tipoInstitucion: "",
    direccion: "",
    telefono: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Get admin info from session
      const userResponse = await fetch('/api/auth/userinfo')
      if (!userResponse.ok) {
        throw new Error('No se pudo obtener información del administrador')
      }

      const userInfo = await userResponse.json()
      const cedula = userInfo?.numero_documento

      if (!cedula) {
        throw new Error('No se encontró la cédula del administrador')
      }

      // Get admin ID
      const admin = await backendAPI.checkIsAdmin(cedula)
      if (!admin) {
        throw new Error('Usuario no autorizado')
      }

      // Create centro de salud
      await backendAPI.crearCentroDeSalud(formData, admin.id)

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin-hcen')
      }, 2000)
    } catch (err) {
      console.error('Error creating clinica:', err)
      setError(err instanceof Error ? err.message : 'Error al crear la clínica')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = formData.id && formData.nombre && formData.tipoInstitucion

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin-hcen">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Portal Admin
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Registrar Nueva Clínica</h1>
              <p className="text-sm text-muted-foreground">
                Completa los datos para registrar una nueva institución en HCEN
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {success ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ¡Clínica creada exitosamente! Redirigiendo...
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Hospital className="w-6 h-6" />
                  <span>Información de la Clínica</span>
                </CardTitle>
                <CardDescription>Proporciona los datos básicos de la institución</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="id">ID de la Clínica *</Label>
                    <Input
                      id="id"
                      placeholder="Ej: CENT004"
                      value={formData.id}
                      onChange={(e) => handleInputChange("id", e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Identificador único para la clínica (ej: CENT001, HOSP001)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre de la Clínica *</Label>
                    <Input
                      id="nombre"
                      placeholder="Ej: Hospital San Juan de Dios"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange("nombre", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipoInstitucion">Tipo de Institución *</Label>
                    <Input
                      id="tipoInstitucion"
                      placeholder="Ej: Hospital Público, Clínica Privada"
                      value={formData.tipoInstitucion}
                      onChange={(e) => handleInputChange("tipoInstitucion", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      placeholder="Ej: Avenida 18 de Julio 2345, Montevideo"
                      value={formData.direccion}
                      onChange={(e) => handleInputChange("direccion", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      placeholder="+598 2 XXXX XXXX"
                      value={formData.telefono}
                      onChange={(e) => handleInputChange("telefono", e.target.value)}
                    />
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Los campos marcados con (*) son obligatorios
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end space-x-4 pt-6">
                    <Button variant="outline" asChild type="button">
                      <Link href="/admin-hcen">Cancelar</Link>
                    </Button>
                    <Button type="submit" disabled={!isFormValid || loading}>
                      {loading ? "Creando..." : "Crear Clínica"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
