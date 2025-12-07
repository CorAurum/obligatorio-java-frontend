"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { backendAPI, DocumentoClinicoDetalle } from "@/lib/api/backend"
import { FileText, Calendar, Activity, Stethoscope, Hospital, User } from "lucide-react"

interface DetalleDocumentoDialogProps {
  documentoId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DetalleDocumentoDialog({ documentoId, open, onOpenChange }: DetalleDocumentoDialogProps) {
  const [detalle, setDetalle] = useState<DocumentoClinicoDetalle | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargarDetalle = async () => {
    if (!documentoId) {
      console.log('❌ No hay documentoId, no se puede cargar detalle')
      return
    }

    console.log('🔄 Cargando detalle para documentoId:', documentoId)
    setLoading(true)
    setError(null)
    try {
      const data = await backendAPI.getDocumentoClinicoDetalle(documentoId)
      console.log('✅ Datos recibidos:', data)
      console.log('  - Tenant:', data.tenant)
      console.log('  - Profesional:', data.profesional)
      console.log('  - Documento:', data.documento)
      if (data.documento) {
        console.log('  - Motivos de consulta:', data.documento.motivosConsulta)
        console.log('  - Diagnósticos:', data.documento.diagnosticos)
      }
      setDetalle(data)
      console.log('💾 Detalle guardado en estado')
    } catch (err) {
      console.error('❌ Error loading documento detalle:', err)
      setError('Error al cargar los detalles del documento')
    } finally {
      setLoading(false)
    }
  }

  // Efecto para cargar datos cuando el diálogo se abre
  useEffect(() => {
    console.log('📊 useEffect - open:', open, ', documentoId:', documentoId)
    if (open && documentoId) {
      console.log('✨ Diálogo abierto con documentoId válido, cargando detalle...')
      setDetalle(null)
      setError(null)
      cargarDetalle()
    }
  }, [open, documentoId])

  const handleOpenChange = (newOpen: boolean) => {
    console.log('🔄 handleOpenChange:', newOpen)
    onOpenChange(newOpen)
  }

  const formatFecha = (fecha: string | null) => {
    if (!fecha) return 'No especificada'
    return new Date(fecha).toLocaleDateString('es-UY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'grave':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'moderado':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'ligero':
      case 'leve':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getCertezaColor = (certeza: string) => {
    const certezaLower = certeza.toLowerCase()
    if (certezaLower.includes('mucha') || certezaLower.includes('alta')) {
      return 'bg-red-100 text-red-800 border-red-200'
    } else if (certezaLower.includes('moderada') || certezaLower.includes('media')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    } else if (certezaLower.includes('poca') || certezaLower.includes('baja')) {
      return 'bg-blue-100 text-blue-800 border-blue-200'
    }
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Detalle del Documento Clínico</span>
          </DialogTitle>
          <DialogDescription>
            Información completa del documento clínico
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
            {error}
          </div>
        )}

        {!loading && !error && !detalle && (
          <div className="text-center py-8 text-muted-foreground">
            No hay datos para mostrar
          </div>
        )}

        {detalle && !loading && (
          <div className="space-y-6">
            {/* Información del Tenant y Profesional */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Hospital className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Centro de Salud</p>
                      <p className="font-semibold">{detalle.tenant}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Profesional</p>
                      <p className="font-semibold">{detalle.profesional}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Información del Documento */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Título</p>
                  <p className="font-semibold text-lg">{detalle.documento.titulo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Descripción</p>
                  <p className="text-sm">{detalle.documento.descripcion}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Área</p>
                      <p className="text-sm font-medium">{detalle.documento.area}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Tipo</p>
                      <p className="text-sm font-medium">{detalle.documento.tipoDocumento}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Fecha</p>
                      <p className="text-sm font-medium">{formatFecha(detalle.documento.fechaCreacion)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Motivos de Consulta */}
            {detalle.documento.motivosConsulta && detalle.documento.motivosConsulta.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Motivos de Consulta</span>
                </h3>
                <div className="space-y-2">
                  {detalle.documento.motivosConsulta.map((motivo, index) => (
                    <Card key={index}>
                      <CardContent className="p-3">
                        <p className="text-sm">{motivo}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Diagnósticos */}
            {detalle.documento.diagnosticos && detalle.documento.diagnosticos.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Diagnósticos</span>
                </h3>
                <div className="space-y-3">
                  {detalle.documento.diagnosticos.map((diagnostico, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <p className="font-medium">{diagnostico.descripcion}</p>
                            <div className="flex gap-2">
                              <Badge className={getEstadoColor(diagnostico.estadoProblema)}>
                                {diagnostico.estadoProblema}
                              </Badge>
                              <Badge className={getCertezaColor(diagnostico.gradoCerteza)}>
                                {diagnostico.gradoCerteza}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Próxima Consulta Confirmada */}
            {detalle.documento.fechaProximaConsultaConfirmada && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Próxima Consulta</span>
                </h3>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Consulta Confirmada</p>
                    <p className="font-medium">{formatFecha(detalle.documento.fechaProximaConsultaConfirmada)}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
