"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Hospital,
  Settings,
  ArrowLeft,
  Users,
  FileText,
  Shield,
  Plus,
} from "lucide-react"
import { backendAPI, type CentroDeSalud, type Especialidad } from "@/lib/api/backend"

export default function AdminHCENPortal() {
  const [selectedTab, setSelectedTab] = useState("clinicas")
  const [clinicas, setClinicas] = useState<CentroDeSalud[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<any>(null)

  // Dialog state for creating especialidad
  const [showEspecialidadDialog, setShowEspecialidadDialog] = useState(false)
  const [creatingEspecialidad, setCreatingEspecialidad] = useState(false)
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState({ nombre: "", descripcion: "" })

  useEffect(() => {
    async function loadData() {
      try {
        // Get user info
        const userResponse = await fetch('/api/auth/userinfo')
        if (userResponse.ok) {
          const user = await userResponse.json()
          setUserInfo(user)
        }

        // Load clinicas and especialidades
        const [clinicasData, especialidadesData] = await Promise.all([
          backendAPI.getCentrosDeSalud(),
          backendAPI.getEspecialidades()
        ])

        setClinicas(clinicasData)
        setEspecialidades(especialidadesData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCrearEspecialidad = async () => {
    if (!nuevaEspecialidad.nombre.trim()) {
      return
    }

    setCreatingEspecialidad(true)
    try {
      const nuevaEsp = await backendAPI.crearEspecialidad(
        nuevaEspecialidad.nombre,
        nuevaEspecialidad.descripcion
      )

      setEspecialidades([...especialidades, nuevaEsp])
      setNuevaEspecialidad({ nombre: "", descripcion: "" })
      setShowEspecialidadDialog(false)
    } catch (error) {
      console.error('Error creating especialidad:', error)
      alert('Error al crear la especialidad')
    } finally {
      setCreatingEspecialidad(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Portal Admin HCEN</h1>
                  <p className="text-sm text-muted-foreground">Administración del Sistema Nacional</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-xs">
                Administrador del Sistema
              </Badge>
              {userInfo && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  {userInfo.nombre_completo || userInfo.primer_nombre}
                </Badge>
              )}
              <form action="/api/auth/logout" method="POST">
                <Button variant="outline" size="sm" type="submit">
                  Cerrar Sesión
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="clinicas">Clínicas</TabsTrigger>
            <TabsTrigger value="especialidades">Especialidades</TabsTrigger>
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          </TabsList>

          {/* Clínicas Tab */}
          <TabsContent value="clinicas" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Gestión de Clínicas</h2>
                <p className="text-muted-foreground">Administrar instituciones conectadas al sistema</p>
              </div>
              <Link href="/admin-hcen/crear-clinica">
                <Button size="lg">
                  <Hospital className="w-5 h-5 mr-2" />
                  Nueva Clínica
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clinicas.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-12 text-center">
                    <Hospital className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay clínicas registradas</p>
                  </CardContent>
                </Card>
              ) : (
                clinicas.map((clinica) => (
                  <Card key={clinica.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Hospital className="w-5 h-5" />
                        <span>{clinica.nombre}</span>
                      </CardTitle>
                      <CardDescription>{clinica.tipoInstitucion}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {clinica.direccion && (
                          <p className="text-muted-foreground">
                            <strong>Dirección:</strong> {clinica.direccion}
                          </p>
                        )}
                        {clinica.telefono && (
                          <p className="text-muted-foreground">
                            <strong>Teléfono:</strong> {clinica.telefono}
                          </p>
                        )}
                        <Badge className="mt-2 bg-green-100 text-green-800 border-green-200">
                          Activo
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Especialidades Tab */}
          <TabsContent value="especialidades" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Gestión de Especialidades</h2>
                <p className="text-muted-foreground">Administrar especialidades médicas del sistema</p>
              </div>
              <Dialog open={showEspecialidadDialog} onOpenChange={setShowEspecialidadDialog}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Nueva Especialidad
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Especialidad</DialogTitle>
                    <DialogDescription>
                      Agrega una nueva especialidad médica al sistema
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre *</Label>
                      <Input
                        id="nombre"
                        placeholder="Ej: Cardiología"
                        value={nuevaEspecialidad.nombre}
                        onChange={(e) => setNuevaEspecialidad({ ...nuevaEspecialidad, nombre: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Input
                        id="descripcion"
                        placeholder="Descripción opcional"
                        value={nuevaEspecialidad.descripcion}
                        onChange={(e) => setNuevaEspecialidad({ ...nuevaEspecialidad, descripcion: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowEspecialidadDialog(false)}
                      disabled={creatingEspecialidad}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCrearEspecialidad}
                      disabled={!nuevaEspecialidad.nombre.trim() || creatingEspecialidad}
                    >
                      {creatingEspecialidad ? "Creando..." : "Crear"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {especialidades.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-12 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay especialidades registradas</p>
                  </CardContent>
                </Card>
              ) : (
                especialidades.map((esp) => (
                  <Card key={esp.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{esp.nombre}</CardTitle>
                      {esp.descripcion && (
                        <CardDescription className="text-xs">{esp.descripcion}</CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Estadísticas Tab */}
          <TabsContent value="estadisticas" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Estadísticas del Sistema</h2>
              <p className="text-muted-foreground">Resumen general del sistema HCEN</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Clínicas Activas</p>
                      <p className="text-2xl font-bold text-foreground">{clinicas.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Hospital className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Especialidades</p>
                      <p className="text-2xl font-bold text-foreground">{especialidades.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Sistema</p>
                      <p className="text-2xl font-bold text-green-600">Operativo</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
