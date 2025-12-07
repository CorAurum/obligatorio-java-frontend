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
  Edit,
  Power,
  User,
} from "lucide-react"
import { backendAPI, type CentroDeSalud, type Especialidad, type Administrador, type Usuario, type ProfesionalDeSalud, type AdministradorDeClinica } from "@/lib/api/backend"

export default function AdminHCENPortal() {
  const [selectedTab, setSelectedTab] = useState("clinicas")
  const [clinicas, setClinicas] = useState<CentroDeSalud[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [administradores, setAdministradores] = useState<Administrador[]>([])
  const [administradoresClinica, setAdministradoresClinica] = useState<AdministradorDeClinica[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [profesionales, setProfesionales] = useState<ProfesionalDeSalud[]>([])
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<any>(null)

  // Dialog state for creating especialidad
  const [showEspecialidadDialog, setShowEspecialidadDialog] = useState(false)
  const [creatingEspecialidad, setCreatingEspecialidad] = useState(false)
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState({ nombre: "", descripcion: "" })

  // Dialog state for creating/editing admin
  const [showAdminDialog, setShowAdminDialog] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Administrador | null>(null)
  const [savingAdmin, setSavingAdmin] = useState(false)
  const [adminForm, setAdminForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    cedula: "",
    activo: true,
  })

  // Dialog state for creating administrador de clínica
  const [showAdminClinicaDialog, setShowAdminClinicaDialog] = useState(false)
  const [creatingAdminClinica, setCreatingAdminClinica] = useState(false)
  const [adminClinicaForm, setAdminClinicaForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    clinicaNombre: "",
  })

  useEffect(() => {
    async function loadData() {
      try {
        // Get user info
        const userResponse = await fetch('/api/auth/userinfo')
        if (userResponse.ok) {
          const user = await userResponse.json()
          setUserInfo(user)
        }

        // Load all admin data from our API route
        const adminDataResponse = await fetch('/api/admin/data')
        if (adminDataResponse.ok) {
          const adminData = await adminDataResponse.json()
          setClinicas(adminData.clinicas || [])
          setEspecialidades(adminData.especialidades || [])
          setAdministradores(adminData.administradores || [])
          setUsuarios(adminData.usuarios || [])
          setProfesionales(adminData.profesionales || [])
        }

        // Load administradores de clínica from peripheral component
        try {
          const adminsClinica = await backendAPI.getAdministradoresDeClinica()
          setAdministradoresClinica(adminsClinica)
        } catch (error) {
          console.error('Error loading administradores de clínica:', error)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Extract cedula from userInfo (same logic as usuario-salud page)
  const cedula = userInfo?.numeroDocumento || userInfo?.numero_documento || userInfo?.document?.number || userInfo?.sub || userInfo?.id

  const handleCrearEspecialidad = async () => {
    if (!nuevaEspecialidad.nombre.trim()) {
      return
    }

    setCreatingEspecialidad(true)
    try {
      const response = await fetch('/api/admin/especialidades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nuevaEspecialidad.nombre,
          descripcion: nuevaEspecialidad.descripcion,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create especialidad')
      }

      const nuevaEsp = await response.json()
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

  const handleOpenAdminDialog = (admin?: Administrador) => {
    if (admin) {
      setEditingAdmin(admin)
      setAdminForm({
        nombre: admin.nombre,
        apellido: admin.apellido,
        email: admin.email,
        telefono: admin.telefono,
        cedula: admin.cedula,
        activo: admin.activo,
      })
    } else {
      setEditingAdmin(null)
      setAdminForm({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        cedula: "",
        activo: true,
      })
    }
    setShowAdminDialog(true)
  }

  const handleSaveAdmin = async () => {
    if (!adminForm.nombre.trim() || !adminForm.apellido.trim() || !adminForm.email.trim() || !adminForm.cedula.trim()) {
      alert('Por favor complete todos los campos obligatorios')
      return
    }

    setSavingAdmin(true)
    try {
      if (editingAdmin) {
        // Update existing admin
        const response = await fetch(`/api/admin/administradores/${editingAdmin.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(adminForm),
        })

        if (!response.ok) {
          throw new Error('Failed to update administrador')
        }

        const updatedAdmin = await response.json()
        setAdministradores(administradores.map(a => a.id === editingAdmin.id ? updatedAdmin : a))
      } else {
        // Create new admin
        const response = await fetch('/api/admin/administradores', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(adminForm),
        })

        if (!response.ok) {
          throw new Error('Failed to create administrador')
        }

        const nuevoAdmin = await response.json()
        setAdministradores([...administradores, nuevoAdmin])
      }
      setShowAdminDialog(false)
    } catch (error) {
      console.error('Error saving admin:', error)
      alert(editingAdmin ? 'Error al actualizar el administrador' : 'Error al crear el administrador')
    } finally {
      setSavingAdmin(false)
    }
  }

  const handleToggleAdminStatus = async (admin: Administrador) => {
    try {
      await backendAPI.desactivarAdministrador(admin.id)

      // Update local state to toggle the active status
      const updatedAdmin = { ...admin, activo: !admin.activo }
      setAdministradores(administradores.map(a => a.id === admin.id ? updatedAdmin : a))
    } catch (error) {
      console.error('Error toggling admin status:', error)
      alert('Error al cambiar el estado del administrador')
    }
  }

  const handleToggleClinicaStatus = async (clinica: CentroDeSalud) => {
    const accion = clinica.estado === 'ACTIVO' ? 'inhabilitar' : 'habilitar'
    if (!confirm(`¿Está seguro de que desea ${accion} la clínica "${clinica.nombre}"?`)) {
      return
    }

    try {
      const clinicaActualizada = await backendAPI.toggleCentroDeSalud(clinica.id)

      // Update local state with the updated clinica
      setClinicas(clinicas.map(c => c.id === clinica.id ? clinicaActualizada : c))
    } catch (error) {
      console.error('Error toggling clinica status:', error)
      alert('Error al cambiar el estado de la clínica')
    }
  }

  const handleCrearAdminClinica = async () => {
    if (!adminClinicaForm.nombre.trim() || !adminClinicaForm.apellido.trim() ||
        !adminClinicaForm.email.trim() || !adminClinicaForm.clinicaNombre.trim()) {
      alert('Por favor complete todos los campos')
      return
    }

    setCreatingAdminClinica(true)
    try {
      // Convert clinic name to dominioSubdominio (lowercase, no spaces)
      const dominioSubdominio = adminClinicaForm.clinicaNombre.toLowerCase().replace(/\s+/g, '')

      // Get admin name from userInfo (nombre + apellido or email as fallback)
      const creadorNombre = userInfo?.name || userInfo?.givenName ||
                           (userInfo?.email ? userInfo.email.split('@')[0] : 'Admin HCEN')

      const nuevoAdmin = await backendAPI.crearAdministradorDeClinica({
        dominioSubdominio,
        administrador: {
          nombre: adminClinicaForm.nombre,
          apellido: adminClinicaForm.apellido,
          email: adminClinicaForm.email,
          usuario: null,
          creadorPor: creadorNombre,
        },
      })

      setAdministradoresClinica([...administradoresClinica, nuevoAdmin])
      setAdminClinicaForm({
        nombre: "",
        apellido: "",
        email: "",
        clinicaNombre: "",
      })
      setShowAdminClinicaDialog(false)
    } catch (error) {
      console.error('Error creating admin clinica:', error)
      alert('Error al crear el administrador de clínica')
    } finally {
      setCreatingAdminClinica(false)
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
              {cedula && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  <User className="w-3 h-3 mr-1" />
                  CI: {cedula}
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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="clinicas">Clínicas</TabsTrigger>
            <TabsTrigger value="especialidades">Especialidades</TabsTrigger>
            <TabsTrigger value="administradores">Administradores</TabsTrigger>
            <TabsTrigger value="admins-clinica">Admins Clínica</TabsTrigger>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="profesionales">Profesionales</TabsTrigger>
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
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <Hospital className="w-5 h-5" />
                            <span>{clinica.nombre}</span>
                          </CardTitle>
                          <CardDescription>{clinica.tipoInstitucion}</CardDescription>
                        </div>
                        <Badge className={clinica.estado === 'ACTIVO' || clinica.estado === 'HABILITADO' || !clinica.estado ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}>
                          {clinica.estado || 'ACTIVO'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
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
                        <Button
                          variant={(clinica.estado === 'ACTIVO' || clinica.estado === 'HABILITADO' || !clinica.estado) ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleToggleClinicaStatus(clinica)}
                          className="w-full"
                        >
                          {(clinica.estado === 'ACTIVO' || clinica.estado === 'HABILITADO' || !clinica.estado) ? 'Deshabilitar Clínica' : 'Habilitar Clínica'}
                        </Button>
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

          {/* Administradores Tab */}
          <TabsContent value="administradores" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Gestión de Administradores</h2>
                <p className="text-muted-foreground">Administrar usuarios con permisos de administrador</p>
              </div>
              <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
                <DialogTrigger asChild>
                  <Button size="lg" onClick={() => handleOpenAdminDialog()}>
                    <Plus className="w-5 h-5 mr-2" />
                    Nuevo Administrador
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingAdmin ? 'Editar Administrador' : 'Crear Nuevo Administrador'}</DialogTitle>
                    <DialogDescription>
                      {editingAdmin ? 'Modifica los datos del administrador' : 'Agrega un nuevo administrador al sistema'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre *</Label>
                        <Input
                          id="nombre"
                          placeholder="Juan"
                          value={adminForm.nombre}
                          onChange={(e) => setAdminForm({ ...adminForm, nombre: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apellido">Apellido *</Label>
                        <Input
                          id="apellido"
                          placeholder="Pérez"
                          value={adminForm.apellido}
                          onChange={(e) => setAdminForm({ ...adminForm, apellido: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cedula">Cédula *</Label>
                      <Input
                        id="cedula"
                        placeholder="12345678"
                        value={adminForm.cedula}
                        onChange={(e) => setAdminForm({ ...adminForm, cedula: e.target.value })}
                        disabled={!!editingAdmin}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@hcen.uy"
                        value={adminForm.email}
                        onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        placeholder="+598 99 123 456"
                        value={adminForm.telefono}
                        onChange={(e) => setAdminForm({ ...adminForm, telefono: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowAdminDialog(false)}
                      disabled={savingAdmin}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveAdmin}
                      disabled={savingAdmin}
                    >
                      {savingAdmin ? "Guardando..." : (editingAdmin ? "Actualizar" : "Crear")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {administradores.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-12 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay administradores registrados</p>
                  </CardContent>
                </Card>
              ) : (
                administradores.map((admin) => (
                  <Card key={admin.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <Users className="w-5 h-5" />
                            <span>{admin.nombre} {admin.apellido}</span>
                          </CardTitle>
                          <CardDescription className="mt-1">CI: {admin.cedula}</CardDescription>
                        </div>
                        <Badge className={admin.activo ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}>
                          {admin.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">
                          <strong>Email:</strong> {admin.email}
                        </p>
                        {admin.telefono && (
                          <p className="text-muted-foreground">
                            <strong>Teléfono:</strong> {admin.telefono}
                          </p>
                        )}
                        <div className="flex gap-2 pt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenAdminDialog(admin)}
                            className="flex-1"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant={admin.activo ? "outline" : "default"}
                            onClick={() => handleToggleAdminStatus(admin)}
                            className="flex-1"
                          >
                            <Power className="w-4 h-4 mr-1" />
                            {admin.activo ? 'Desactivar' : 'Activar'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Administradores de Clínica Tab */}
          <TabsContent value="admins-clinica" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Administradores de Clínica</h2>
                <p className="text-muted-foreground">Gestión de administradores de centros de salud periféricos</p>
              </div>
              <Dialog open={showAdminClinicaDialog} onOpenChange={setShowAdminClinicaDialog}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Nuevo Admin Clínica
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Administrador de Clínica</DialogTitle>
                    <DialogDescription>
                      Agrega un nuevo administrador para un centro de salud periférico
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre-clinica">Nombre *</Label>
                        <Input
                          id="nombre-clinica"
                          placeholder="Juan"
                          value={adminClinicaForm.nombre}
                          onChange={(e) => setAdminClinicaForm({ ...adminClinicaForm, nombre: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apellido-clinica">Apellido *</Label>
                        <Input
                          id="apellido-clinica"
                          placeholder="Pérez"
                          value={adminClinicaForm.apellido}
                          onChange={(e) => setAdminClinicaForm({ ...adminClinicaForm, apellido: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-clinica">Email *</Label>
                      <Input
                        id="email-clinica"
                        type="email"
                        placeholder="admin@clinica.com"
                        value={adminClinicaForm.email}
                        onChange={(e) => setAdminClinicaForm({ ...adminClinicaForm, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clinica-nombre">Nombre de Clínica *</Label>
                      <Input
                        id="clinica-nombre"
                        placeholder="Ej: Clinica Central"
                        value={adminClinicaForm.clinicaNombre}
                        onChange={(e) => setAdminClinicaForm({ ...adminClinicaForm, clinicaNombre: e.target.value })}
                      />

                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowAdminClinicaDialog(false)}
                      disabled={creatingAdminClinica}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCrearAdminClinica}
                      disabled={creatingAdminClinica}
                    >
                      {creatingAdminClinica ? "Creando..." : "Crear"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {administradoresClinica.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-12 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay administradores de clínica registrados</p>
                  </CardContent>
                </Card>
              ) : (
                administradoresClinica.map((admin) => (
                  <Card key={admin.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <Hospital className="w-5 h-5" />
                            <span>{admin.nombre} {admin.apellido}</span>
                          </CardTitle>
                          <CardDescription className="mt-1">{admin.clinica}</CardDescription>
                        </div>
                        <Badge className={admin.activo ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}>
                          {admin.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">
                          <strong>Email:</strong> {admin.email}
                        </p>
                        <p className="text-muted-foreground">
                          <strong>Usuario:</strong> {admin.usuario}
                        </p>
                        {admin.cedula && (
                          <p className="text-muted-foreground">
                            <strong>Cédula:</strong> {admin.cedula}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Creado por: {admin.creadorPor}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Usuarios Tab */}
          <TabsContent value="usuarios" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Usuarios de Salud</h2>
              <p className="text-muted-foreground">Visualización de usuarios registrados en el sistema</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {usuarios.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-12 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay usuarios registrados</p>
                  </CardContent>
                </Card>
              ) : (
                usuarios.map((usuario) => (
                  <Card key={usuario.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>{usuario.nombres} {usuario.apellidos}</span>
                      </CardTitle>
                      <CardDescription>ID: {usuario.id}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {usuario.fechaNacimiento && (
                          <p className="text-muted-foreground">
                            <strong>Fecha Nacimiento:</strong> {new Date(usuario.fechaNacimiento).toLocaleDateString()}
                          </p>
                        )}
                        <Badge className="mt-2 bg-blue-100 text-blue-800 border-blue-200">
                          Usuario Registrado
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Profesionales Tab */}
          <TabsContent value="profesionales" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Profesionales de Salud</h2>
              <p className="text-muted-foreground">Gestión de profesionales registrados en centros de salud</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profesionales.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-12 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay profesionales registrados</p>
                  </CardContent>
                </Card>
              ) : (
                profesionales.map((prof) => (
                  <Card key={prof.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <Users className="w-5 h-5" />
                            <span>{prof.nombres} {prof.apellidos}</span>
                          </CardTitle>
                          {prof.centroDeSalud?.nombre && (
                            <CardDescription className="mt-1">Clínica: {prof.centroDeSalud.nombre}</CardDescription>
                          )}
                        </div>
                        <Badge className={prof.estado === 'ACTIVO' ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}>
                          {prof.estado}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {prof.email && (
                          <p className="text-muted-foreground">
                            <strong>Email:</strong> {prof.email}
                          </p>
                        )}
                        {prof.telefono && (
                          <p className="text-muted-foreground">
                            <strong>Teléfono:</strong> {prof.telefono}
                          </p>
                        )}
                        {prof.fechaRegistroProfesional && (
                          <p className="text-muted-foreground text-xs">
                            Registrado: {new Date(prof.fechaRegistroProfesional).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </CardContent>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Clínicas</p>
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
                      <p className="text-sm text-muted-foreground">Administradores</p>
                      <p className="text-2xl font-bold text-foreground">{administradores.filter(a => a.activo).length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Admins Clínica</p>
                      <p className="text-2xl font-bold text-foreground">{administradoresClinica.filter(a => a.activo).length}</p>
                    </div>
                    <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <Hospital className="w-6 h-6 text-cyan-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Usuarios</p>
                      <p className="text-2xl font-bold text-foreground">{usuarios.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Profesionales</p>
                      <p className="text-2xl font-bold text-foreground">{profesionales.filter(p => p.estado === 'ACTIVO').length}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-orange-600" />
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
