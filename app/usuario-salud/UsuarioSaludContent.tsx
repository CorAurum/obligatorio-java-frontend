'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  FileText,
  Shield,
  LogOut,
  Eye,
  Download,
  Calendar,
  User,
  Hospital,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { backendAPI, DocumentoClinicoDTO, PoliticaDeAccesoDTO, SolicitudDeAcceso, LogDeAcceso } from '@/lib/api/backend';
import NotificacionesDropdown from '@/components/NotificacionesDropdown';
import CrearPoliticaDialog from '@/components/CrearPoliticaDialog';
import SolicitudesAccesoCard from '@/components/SolicitudesAccesoCard';
import { DetalleDocumentoDialog } from '@/components/DetalleDocumentoDialog';

interface AccesoHistoria {
  id: string
  profesional: string
  clinica: string
  fecha: string
  tipo: "consulta" | "descarga" | "compartir"
}

export default function UsuarioSaludContent({ userInfo }: { userInfo: any }) {
  const [documentos, setDocumentos] = useState<DocumentoClinicoDTO[]>([]);
  const [politicas, setPoliticas] = useState<PoliticaDeAccesoDTO[]>([]);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState<SolicitudDeAcceso[]>([]);
  const [logsDeAcceso, setLogsDeAcceso] = useState<LogDeAcceso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revocando, setRevocando] = useState<string | null>(null);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [documentoDetalleId, setDocumentoDetalleId] = useState<string | null>(null);
  const [showDetalleDialog, setShowDetalleDialog] = useState(false);

  // Debug: log the userInfo to see what we have
  console.log('UsuarioSaludContent userInfo:', userInfo);

  // Get cedula from decoded JWT token
  // Try multiple field names that might contain the document number
  const cedula = userInfo?.numeroDocumento || userInfo?.numero_documento || userInfo?.document?.number || userInfo?.sub || userInfo?.id;

  console.log('Extracted cedula:', cedula);

  // Recargar políticas
  const recargarPoliticas = async () => {
    if (!usuarioId) return;

    try {
      const politicasData = await backendAPI.getPoliticasAcceso(usuarioId);
      setPoliticas(politicasData);
    } catch (err) {
      console.error('Error recargando políticas:', err);
    }
  };

  // Cargar solicitudes pendientes
  const cargarSolicitudesPendientes = async () => {
    if (!usuarioId) return;

    try {
      const solicitudesData = await backendAPI.getSolicitudesPendientes(usuarioId);
      setSolicitudesPendientes(solicitudesData);
    } catch (err) {
      console.error('Error cargando solicitudes pendientes:', err);
    }
  };

  // Cargar logs de acceso
  const cargarLogsDeAcceso = async () => {
    if (!usuarioId) return;

    try {
      const logsData = await backendAPI.getLogsDeAcceso(usuarioId);
      setLogsDeAcceso(logsData);
    } catch (err) {
      console.error('Error cargando logs de acceso:', err);
    }
  };

  // Handle revocar política
  const handleRevocarPolitica = async (politicaId: string) => {
    if (!confirm('¿Está seguro de que desea revocar esta política de acceso?')) {
      return;
    }

    try {
      setRevocando(politicaId);
      const response = await fetch(`/api/user/policies/${politicaId}/revoke`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to revoke policy');
      }

      // Update local state
      setPoliticas(prev =>
        prev.map(p => p.id === politicaId ? { ...p, estado: 'REVOCADA' as const } : p)
      );

      alert('Política revocada exitosamente');
    } catch (err) {
      console.error('Error revoking politica:', err);
      alert('Error al revocar la política');
    } finally {
      setRevocando(null);
    }
  };

  useEffect(() => {
    async function fetchData() {
      if (!cedula) {
        setError('No se pudo obtener la cédula del token de gub.uy');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Debug: log the cedula value and userInfo
        console.log('UserInfo completo:', userInfo);
        console.log('Cedula extraída:', cedula);

        // Fetch user data from our API route
        const response = await fetch('/api/user/data');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUsuarioId(data.usuarioId);
        setDocumentos(data.documentos);
        setPoliticas(data.politicas);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error al cargar los datos del servidor');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [cedula]);

  // Cargar solicitudes y logs cuando tengamos el usuarioId
  useEffect(() => {
    if (usuarioId) {
      cargarSolicitudesPendientes();
      cargarLogsDeAcceso();
    }
  }, [usuarioId]);

  const [accesos] = useState<AccesoHistoria[]>([
    {
      id: "1",
      profesional: "Dr. Carlos Martínez",
      clinica: "Clínica Médica",
      fecha: "2024-01-16 14:30",
      tipo: "consulta",
    },
    {
      id: "2",
      profesional: "Dra. Laura Silva",
      clinica: "Hospital Británico",
      fecha: "2024-01-15 09:15",
      tipo: "descarga",
    },
    {
      id: "3",
      profesional: "Dr. Roberto Gómez",
      clinica: "Hospital Maciel",
      fecha: "2024-01-14 16:45",
      tipo: "consulta",
    },
  ])

  const estadisticas = {
    documentos: documentos.length,
    politicas: politicas.filter(p => p.estado === "ACTIVA").length,
    accesos: logsDeAcceso.length,
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>Error</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href="/" className="flex items-center space-x-2 hover:opacity-80">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">HCEN.uy</h1>
                  <p className="text-sm text-gray-600">Portal Usuario de Salud</p>
                </div>
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <User className="w-3 h-3 mr-1" />
                CI: {cedula || 'No disponible'}
              </Badge>

              {/* Notificaciones */}
              {usuarioId && <NotificacionesDropdown usuarioId={usuarioId} />}

              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Estadísticas */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Documentos Clínicos</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.documentos}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Políticas Activas</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.politicas}</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Accesos Registrados</p>
                    <p className="text-2xl font-bold text-gray-900">{estadisticas.accesos}</p>
                  </div>
                  <Eye className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs Principales */}
        <Tabs defaultValue="historia" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="historia">Historia Clínica</TabsTrigger>
            <TabsTrigger value="politicas">Políticas de Acceso</TabsTrigger>
            <TabsTrigger value="accesos">Auditoría de Accesos</TabsTrigger>
          </TabsList>

          {/* Tab: Historia Clínica */}
          <TabsContent value="historia" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Mis Documentos Clínicos</span>
                </CardTitle>
                <CardDescription>Visualiza y gestiona tus documentos médicos</CardDescription>
              </CardHeader>
              <CardContent>
                {documentos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay documentos clínicos registrados</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documentos.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{doc.area || 'Documento Clínico'}</h4>
                            <p className="text-sm text-gray-600 mb-1">{doc.descripcion}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(doc.fechaCreacion).toLocaleDateString('es-UY')}
                              </span>
                              <span className="flex items-center">
                                <User className="w-3 h-3 mr-1" />
                                {doc.profesionalNombre} {doc.profesionalApellido}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Disponible
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDocumentoDetalleId(doc.documentoId || `${index}`)
                              setShowDetalleDialog(true)
                            }}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Detalles
                          </Button>
                          {doc.urlAlojamiento && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(doc.urlAlojamiento, '_blank')}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Ver
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (doc.urlAlojamiento) {
                                    const link = document.createElement('a');
                                    link.href = doc.urlAlojamiento;
                                    link.download = `documento-${doc.area}.pdf`;
                                    link.click();
                                  }
                                }}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Descargar
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Políticas de Acceso */}
          <TabsContent value="politicas" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Gestión de Políticas de Acceso</span>
                    </CardTitle>
                    <CardDescription>Controla quién puede acceder a tu información médica</CardDescription>
                  </div>
                  {usuarioId && <CrearPoliticaDialog usuarioId={usuarioId} onPoliticaCreada={recargarPoliticas} />}
                </div>
              </CardHeader>
              <CardContent>
                {politicas.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay políticas de acceso configuradas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {politicas.map((politica) => (
                      <div key={politica.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-900">{politica.centroNombre}</h4>
                              <Badge
                                variant={politica.estado === 'ACTIVA' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {politica.estado}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                Creada: {new Date(politica.fechaCreacion).toLocaleDateString('es-UY')}
                              </span>
                              {politica.vigenciaHasta && (
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Vigencia: {new Date(politica.vigenciaHasta).toLocaleDateString('es-UY')}
                                </span>
                              )}
                            </div>
                            {politica.especialidades.length > 0 && (
                              <div>
                                <p className="text-xs text-gray-500 mb-2">Especialidades autorizadas:</p>
                                <div className="flex flex-wrap gap-2">
                                  {politica.especialidades.map((esp) => (
                                    <Badge key={esp.id} variant="outline" className="text-xs">
                                      {esp.nombre}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          {politica.estado === 'ACTIVA' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRevocarPolitica(politica.id)}
                              disabled={revocando === politica.id}
                            >
                              {revocando === politica.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Revocando...
                                </>
                              ) : (
                                'Revocar'
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Auditoría de Accesos */}
          <TabsContent value="accesos" className="space-y-6">
            {/* Solicitudes Pendientes */}
            {usuarioId && (
              <SolicitudesAccesoCard
                usuarioId={usuarioId}
                solicitudes={solicitudesPendientes}
                onSolicitudesActualizadas={() => {
                  cargarSolicitudesPendientes();
                  cargarLogsDeAcceso();
                }}
              />
            )}

            {/* Historial de Accesos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Historial de Accesos</span>
                </CardTitle>
                <CardDescription>Registro completo de intentos de acceso a tu información médica</CardDescription>
              </CardHeader>
              <CardContent>
                {logsDeAcceso.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay registros de accesos aún</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {logsDeAcceso.map((log, index) => (
                      <div
                        key={index}
                        className={`p-4 border rounded-lg ${
                          log.resultado
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                log.resultado
                                  ? 'bg-green-100'
                                  : 'bg-red-100'
                              }`}
                            >
                              {log.resultado ? (
                                <CheckCircle className={`w-5 h-5 ${
                                  log.resultado ? 'text-green-600' : 'text-red-600'
                                }`} />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {log.profesionalNombre} {log.profesionalApellido}
                              </h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                <span className="flex items-center">
                                  <Hospital className="w-3 h-3 mr-1" />
                                  {log.centroNombre}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {new Date(log.fechaAcceso).toLocaleDateString('es-UY', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 italic">{log.motivo}</p>
                            </div>
                          </div>
                          <Badge
                            variant={log.resultado ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {log.resultado ? 'AUTORIZADO' : 'DENEGADO'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Detalle de Documento */}
      {documentoDetalleId && (
        <DetalleDocumentoDialog
          documentoId={documentoDetalleId}
          open={showDetalleDialog}
          onOpenChange={setShowDetalleDialog}
        />
      )}
    </div>
  )
}
