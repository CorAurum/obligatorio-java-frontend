"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Hospital,
  Stethoscope,
  ArrowLeft,
  Users,
  FileText,
  Plus,
  Calendar,
  Activity,
} from "lucide-react"
import {
  perifericoAPI,
  type ProfesionalPeriferico,
  type UsuarioDeSalud,
  type DocumentoClinicoPeriferico,
  type ClinicaPeriferico,
  type MotivoConsulta,
  type GradoCerteza,
  type EstadoProblema
} from "@/lib/api/periferico"

export default function ProfesionalPortal() {
  const [selectedTab, setSelectedTab] = useState("dashboard")
  const [profesional, setProfesional] = useState<ProfesionalPeriferico | null>(null)
  const [clinica, setClinica] = useState<ClinicaPeriferico | null>(null)
  const [pacientes, setPacientes] = useState<UsuarioDeSalud[]>([])
  const [documentos, setDocumentos] = useState<DocumentoClinicoPeriferico[]>([])
  const [motivosConsulta, setMotivosConsulta] = useState<MotivoConsulta[]>([])
  const [gradosCerteza, setGradosCerteza] = useState<GradoCerteza[]>([])
  const [estadosProblema, setEstadosProblema] = useState<EstadoProblema[]>([])
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<any>(null)

  // Dialog state for creating document
  const [showDocumentoDialog, setShowDocumentoDialog] = useState(false)
  const [creatingDocumento, setCreatingDocumento] = useState(false)
  const [nuevoDocumento, setNuevoDocumento] = useState({
    titulo: "",
    descripcion: "",
    tipoDocumento: "CONSULTA",
    area: "GENERAL",
    usuarioId: "",
    motivosIds: [] as number[],
    diagnosticos: [] as Array<{
      descripcion: string
      gradoCertezaId: number
      estadoProblemaId: number
    }>,
  })

  // Estado temporal para agregar un diagnóstico
  const [nuevoDiagnostico, setNuevoDiagnostico] = useState({
    descripcion: "",
    gradoCertezaId: 1,
    estadoProblemaId: 1,
  })

  useEffect(() => {
    async function loadData() {
      try {
        // Get user info from OAuth
        const userResponse = await fetch('/api/auth/userinfo')
        if (userResponse.ok) {
          const user = await userResponse.json()
          setUserInfo(user)

          // Get professional by cedula
          const cedula = user.numero_documento || user.ci
          if (cedula) {
            const prof = await perifericoAPI.getProfesionalPorCedula(cedula)
            if (prof) {
              // Load clinic info - prof.clinica is just an ID, so fetch the full object
              if (prof.clinica) {
                try {
                  const clinicaData = await perifericoAPI.getClinicaPorDominio('')
                  setClinica(clinicaData)
                } catch (error) {
                  console.error('Error cargando clínica:', error)
                }
              }

              // Load all especialidades and filter by IDs if prof.especialidades has any
              try {
                const allEspecialidades = await perifericoAPI.getEspecialidades()
                // If profesional has especialidades (even if empty objects), use all of them
                // This is a workaround since backend returns empty objects
                if (prof.especialidades && prof.especialidades.length > 0) {
                  prof.especialidades = allEspecialidades.slice(0, prof.especialidades.length)
                }
              } catch (error) {
                console.error('Error cargando especialidades:', error)
              }

              setProfesional(prof)

              // Load documents created by this professional
              const docs = await perifericoAPI.getDocumentosPorProfesional(prof.idProfesional)
              setDocumentos(docs)
            }
          }
        }

        // Load all patients (filtered by clinic tenant automatically)
        const pacientesData = await perifericoAPI.getUsuarios()
        setPacientes(pacientesData)

        // Load catalogs (may not be available in peripheral backend)
        try {
          const especialidadesData = await perifericoAPI.getEspecialidades()
          // Keep especialidades for future use if needed
        } catch (error) {
          console.warn('Especialidades endpoint not available:', error)
        }

        try {
          const motivosData = await perifericoAPI.getMotivosConsulta()
          setMotivosConsulta(motivosData)
        } catch (error) {
          console.warn('Motivos consulta endpoint not available:', error)
        }

        try {
          const gradosData = await perifericoAPI.getGradosCerteza()
          setGradosCerteza(gradosData)
        } catch (error) {
          console.warn('Grados certeza endpoint not available:', error)
        }

        try {
          const estadosData = await perifericoAPI.getEstadosProblema()
          setEstadosProblema(estadosData)
        } catch (error) {
          console.warn('Estados problema endpoint not available:', error)
        }

      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCrearDocumento = async () => {
    if (!nuevoDocumento.titulo.trim() || !nuevoDocumento.usuarioId) {
      alert('Por favor complete todos los campos obligatorios')
      return
    }

    setCreatingDocumento(true)
    try {
      // Format date as LocalDateTime (without timezone): "2025-11-13T14:30:00"
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      const fechaCreacion = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`

      const documento: any = {
        titulo: nuevoDocumento.titulo,
        descripcion: nuevoDocumento.descripcion,
        tipoDocumento: nuevoDocumento.tipoDocumento,
        area: nuevoDocumento.area,
        fechaCreacion: fechaCreacion,
      }

      // Add motivosConsulta if any are selected
      if (nuevoDocumento.motivosIds.length > 0) {
        documento.motivosConsulta = nuevoDocumento.motivosIds.map(id => ({ id }))
      }

      // Add diagnosticos if any exist
      if (nuevoDocumento.diagnosticos.length > 0) {
        documento.diagnosticos = nuevoDocumento.diagnosticos.map(diag => ({
          descripcion: diag.descripcion,
          fechaInicio: fechaCreacion,
          estadoProblema: { id: diag.estadoProblemaId },
          gradoCerteza: { id: diag.gradoCertezaId },
        }))
      }

      // Pass idUsuario and idProfesional as separate parameters
      const nuevoDoc = await perifericoAPI.crearDocumento(
        nuevoDocumento.usuarioId,
        profesional!.idProfesional,
        documento
      )
      setDocumentos([...documentos, nuevoDoc])
      setNuevoDocumento({
        titulo: "",
        descripcion: "",
        tipoDocumento: "CONSULTA",
        area: "GENERAL",
        usuarioId: "",
        motivosIds: [],
        diagnosticos: [],
      })
      setNuevoDiagnostico({
        descripcion: "",
        gradoCertezaId: 1,
        estadoProblemaId: 1,
      })
      setShowDocumentoDialog(false)
    } catch (error) {
      console.error('Error creating document:', error)
      alert('Error al crear el documento')
    } finally {
      setCreatingDocumento(false)
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

  if (!profesional) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Acceso Denegado</h2>
            <p className="text-muted-foreground mb-4">
              No se encontró un perfil de profesional asociado a tu cuenta.
            </p>
            <Link href="/">
              <Button>Volver al Inicio</Button>
            </Link>
          </CardContent>
        </Card>
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
                  <Stethoscope className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Portal Profesional</h1>
                  <p className="text-sm text-muted-foreground">{clinica?.nombre || 'Mi Clínica'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-xs">
                {profesional.especialidades?.[0]?.nombre || 'Profesional de Salud'}
              </Badge>
              {userInfo && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  {profesional.nombre} {profesional.apellido}
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
            <TabsTrigger value="documentos">Mis Documentos</TabsTrigger>
            <TabsTrigger value="crear">Crear Documento</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Bienvenido, Dr./Dra. {profesional.apellido}</h2>
              <p className="text-muted-foreground">Resumen de tu actividad clínica</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Mis Pacientes</p>
                      <p className="text-2xl font-bold text-foreground">{pacientes.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Documentos Creados</p>
                      <p className="text-2xl font-bold text-foreground">{documentos.length}</p>
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
                      <p className="text-sm text-muted-foreground">Clínica</p>
                      <p className="text-lg font-bold text-foreground">{clinica?.nombre || 'N/A'}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Hospital className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Clinic Information */}
            {clinica && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Hospital className="w-5 h-5" />
                    <span>Información de la Clínica</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Nombre:</strong> {clinica.nombre}</p>
                  <p><strong>Tipo:</strong> {clinica.tipoInstitucion}</p>
                  {clinica.direccion && <p><strong>Dirección:</strong> {clinica.direccion}</p>}
                  {clinica.telefono && <p><strong>Teléfono:</strong> {clinica.telefono}</p>}
                  {clinica.dominioSubdominio && <p><strong>Dominio:</strong> {clinica.dominioSubdominio}</p>}
                </CardContent>
              </Card>
            )}

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Stethoscope className="w-5 h-5" />
                  <span>Mi Perfil Profesional</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Nombre:</strong> {profesional.nombre} {profesional.apellido}</p>
                <p><strong>Cédula:</strong> {profesional.cedulaIdentidad}</p>
                {profesional.email && <p><strong>Email:</strong> {profesional.email}</p>}
                {profesional.telefono && <p><strong>Teléfono:</strong> {profesional.telefono}</p>}
                {profesional.especialidades && profesional.especialidades.length > 0 && (
                  <div>
                    <strong>Especialidades:</strong>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profesional.especialidades.map((esp, idx) => (
                        <Badge key={esp.id || `esp-${idx}`} className="bg-blue-100 text-blue-800 border-blue-200">
                          {esp.nombre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pacientes Tab */}
          <TabsContent value="pacientes" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Mis Pacientes</h2>
              <p className="text-muted-foreground">Pacientes registrados en {clinica?.nombre || 'tu clínica'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pacientes.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-12 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay pacientes registrados</p>
                  </CardContent>
                </Card>
              ) : (
                pacientes.map((paciente) => (
                  <Card key={paciente.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="w-5 h-5" />
                        <span>{paciente.nombre} {paciente.apellido}</span>
                      </CardTitle>
                      {paciente.identificadores && paciente.identificadores.length > 0 && (
                        <CardDescription>
                          CI: {paciente.identificadores.find(id => id.tipo === 'cedula')?.valor || 'N/A'}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {paciente.fechaNacimiento && (
                          <p className="text-muted-foreground">
                            <strong>F. Nacimiento:</strong> {new Date(paciente.fechaNacimiento).toLocaleDateString()}
                          </p>
                        )}
                        {paciente.sexo && (
                          <p className="text-muted-foreground">
                            <strong>Sexo:</strong> {paciente.sexo}
                          </p>
                        )}
                        {paciente.email && (
                          <p className="text-muted-foreground">
                            <strong>Email:</strong> {paciente.email}
                          </p>
                        )}
                        {paciente.telefono && (
                          <p className="text-muted-foreground">
                            <strong>Teléfono:</strong> {paciente.telefono}
                          </p>
                        )}
                        <Badge className={paciente.activo ? "mt-2 bg-green-100 text-green-800 border-green-200" : "mt-2 bg-gray-100 text-gray-800 border-gray-200"}>
                          {paciente.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Documentos Tab */}
          <TabsContent value="documentos" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Mis Documentos Clínicos</h2>
              <p className="text-muted-foreground">Documentos que he creado para mis pacientes</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {documentos.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No has creado documentos aún</p>
                  </CardContent>
                </Card>
              ) : (
                documentos.map((doc) => (
                  <Card key={doc.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center space-x-2">
                            <FileText className="w-5 h-5" />
                            <span>{doc.titulo}</span>
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {doc.usuario && `Paciente: ${doc.usuario.nombre} ${doc.usuario.apellido}`}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            {doc.tipoDocumento}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {doc.area}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">{doc.descripcion}</p>
                        <p className="text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          Creado: {new Date(doc.fechaCreacion).toLocaleDateString()}
                        </p>
                        {doc.motivosConsulta && doc.motivosConsulta.length > 0 && (
                          <div>
                            <strong className="text-xs">Motivos de consulta:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {doc.motivosConsulta.map((motivo) => (
                                <Badge key={motivo.id} variant="outline" className="text-xs">
                                  {motivo.descripcion}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {doc.diagnosticos && doc.diagnosticos.length > 0 && (
                          <div>
                            <strong className="text-xs">Diagnósticos:</strong>
                            <ul className="list-disc list-inside text-xs text-muted-foreground mt-1">
                              {doc.diagnosticos.map((diag, idx) => (
                                <li key={idx}>{diag.descripcion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Crear Documento Tab */}
          <TabsContent value="crear" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Crear Documento Clínico</h2>
              <p className="text-muted-foreground">Registrar una nueva consulta o documento para un paciente</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título del Documento *</Label>
                    <Input
                      id="titulo"
                      placeholder="Ej: Consulta de Control - Cardiología"
                      value={nuevoDocumento.titulo}
                      onChange={(e) => setNuevoDocumento({ ...nuevoDocumento, titulo: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 ">
                    <Label htmlFor="paciente">Paciente *</Label>
                    <Select
                      value={nuevoDocumento.usuarioId}
                      onValueChange={(value) => setNuevoDocumento({ ...nuevoDocumento, usuarioId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        {pacientes.map((paciente) => (
                          <SelectItem key={paciente.id} value={paciente.id?.toString() || ""}>
                            {paciente.nombre} {paciente.apellido}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipoDocumento">Tipo de Documento</Label>
                      <Select
                        value={nuevoDocumento.tipoDocumento}
                        onValueChange={(value) => setNuevoDocumento({ ...nuevoDocumento, tipoDocumento: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CONSULTA">Consulta</SelectItem>
                          <SelectItem value="ESTUDIO">Estudio</SelectItem>
                          <SelectItem value="RECETA">Receta</SelectItem>
                          <SelectItem value="INFORME">Informe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="area">Área</Label>
                      <Select
                        value={nuevoDocumento.area}
                        onValueChange={(value) => setNuevoDocumento({ ...nuevoDocumento, area: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GENERAL">General</SelectItem>
                          <SelectItem value="CARDIOLOGIA">Cardiología</SelectItem>
                          <SelectItem value="PEDIATRIA">Pediatría</SelectItem>
                          <SelectItem value="TRAUMATOLOGIA">Traumatología</SelectItem>
                          <SelectItem value="NEUROLOGIA">Neurología</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción *</Label>
                    <Textarea
                      id="descripcion"
                      placeholder="Describe el motivo de la consulta, hallazgos, diagnóstico y tratamiento..."
                      rows={6}
                      value={nuevoDocumento.descripcion}
                      onChange={(e) => setNuevoDocumento({ ...nuevoDocumento, descripcion: e.target.value })}
                    />
                  </div>

                  {/* Motivos de Consulta */}
                  {motivosConsulta.length > 0 && (
                    <div className="space-y-2">
                      <Label>Motivos de Consulta (opcional)</Label>
                      <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                        {motivosConsulta.map((motivo) => (
                          <div key={motivo.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`motivo-${motivo.id}`}
                              checked={nuevoDocumento.motivosIds.includes(motivo.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNuevoDocumento({
                                    ...nuevoDocumento,
                                    motivosIds: [...nuevoDocumento.motivosIds, motivo.id]
                                  })
                                } else {
                                  setNuevoDocumento({
                                    ...nuevoDocumento,
                                    motivosIds: nuevoDocumento.motivosIds.filter(id => id !== motivo.id)
                                  })
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <label htmlFor={`motivo-${motivo.id}`} className="text-sm cursor-pointer">
                              {motivo.descripcion}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Diagnósticos */}
                  <div className="space-y-3">
                    <Label>Diagnósticos (opcional)</Label>

                    {/* Lista de diagnósticos agregados */}
                    {nuevoDocumento.diagnosticos.length > 0 && (
                      <div className="space-y-2">
                        {nuevoDocumento.diagnosticos.map((diag, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                            <div className="text-sm">
                              <p className="font-medium">{diag.descripcion}</p>
                              <p className="text-xs text-gray-500">
                                Grado: {gradosCerteza.find(g => g.id === diag.gradoCertezaId)?.descripcion} |
                                Estado: {estadosProblema.find(e => e.id === diag.estadoProblemaId)?.descripcion}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setNuevoDocumento({
                                  ...nuevoDocumento,
                                  diagnosticos: nuevoDocumento.diagnosticos.filter((_, i) => i !== idx)
                                })
                              }}
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Formulario para agregar nuevo diagnóstico */}
                    <div className="border rounded-md p-3 space-y-3">
                      <Input
                        placeholder="Descripción del diagnóstico"
                        value={nuevoDiagnostico.descripcion}
                        onChange={(e) => setNuevoDiagnostico({ ...nuevoDiagnostico, descripcion: e.target.value })}
                      />

                      <div className="grid grid-cols-2 gap-3">
                        {gradosCerteza.length > 0 && (
                          <div className="space-y-1">
                            <Label className="text-xs">Grado de Certeza</Label>
                            <Select
                              value={nuevoDiagnostico.gradoCertezaId.toString()}
                              onValueChange={(value) => setNuevoDiagnostico({ ...nuevoDiagnostico, gradoCertezaId: parseInt(value) })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {gradosCerteza.map((grado) => (
                                  <SelectItem key={grado.id} value={grado.id.toString()}>
                                    {grado.descripcion}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {estadosProblema.length > 0 && (
                          <div className="space-y-1">
                            <Label className="text-xs">Estado del Problema</Label>
                            <Select
                              value={nuevoDiagnostico.estadoProblemaId.toString()}
                              onValueChange={(value) => setNuevoDiagnostico({ ...nuevoDiagnostico, estadoProblemaId: parseInt(value) })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {estadosProblema.map((estado) => (
                                  <SelectItem key={estado.id} value={estado.id.toString()}>
                                    {estado.descripcion}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (nuevoDiagnostico.descripcion.trim()) {
                            setNuevoDocumento({
                              ...nuevoDocumento,
                              diagnosticos: [...nuevoDocumento.diagnosticos, nuevoDiagnostico]
                            })
                            setNuevoDiagnostico({
                              descripcion: "",
                              gradoCertezaId: gradosCerteza[0]?.id || 1,
                              estadoProblemaId: estadosProblema[0]?.id || 1,
                            })
                          }
                        }}
                        disabled={!nuevoDiagnostico.descripcion.trim()}
                      >
                        + Agregar Diagnóstico
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNuevoDocumento({
                          titulo: "",
                          descripcion: "",
                          tipoDocumento: "CONSULTA",
                          area: "GENERAL",
                          usuarioId: "",
                          motivosIds: [],
                          diagnosticos: [],
                        })
                        setNuevoDiagnostico({
                          descripcion: "",
                          gradoCertezaId: gradosCerteza[0]?.id || 1,
                          estadoProblemaId: estadosProblema[0]?.id || 1,
                        })
                      }}
                    >
                      Limpiar
                    </Button>
                    <Button
                      onClick={handleCrearDocumento}
                      disabled={creatingDocumento || !nuevoDocumento.titulo.trim() || !nuevoDocumento.usuarioId}
                    >
                      {creatingDocumento ? "Creando..." : "Crear Documento"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
