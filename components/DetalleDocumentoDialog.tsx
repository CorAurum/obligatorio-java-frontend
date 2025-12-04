"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { backendAPI, DocumentoClinicoDetalle } from "@/lib/api/backend"
import { FileText, Calendar, Activity, Stethoscope } from "lucide-react"

interface DetalleDocumentoDialogProps {
  documentoId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DetalleDocumentoDialog({ documentoId, open, onOpenChange }: DetalleDocumentoDialogProps) {
  const [detalle, setDetalle] = useState<DocumentoClinicoDetalle | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargarDetalle = async () => {
    if (!documentoId || detalle) return // Solo cargar si no tenemos datos

    setLoading(true)
    setError(null)
    try {
      const data = await backendAPI.getDocumentoClinicoDetalle(documentoId)
      setDetalle(data)
    } catch (err) {
      console.error('Error loading documento detalle:', err)
      setError('Error al cargar los detalles del documento')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      cargarDetalle()
    } else {
      // Reset state when closing
      setDetalle(null)
      setError(null)
    }
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

  const getBadgeColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'activo':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactivo':
      case 'resuelto':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getCertezaColor = (certeza: string) => {
    switch (certeza.toLowerCase()) {
      case 'alta':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'moderada':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'baja':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
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

        {detalle && !loading && (
          <div className="space-y-6">
            {/* Área */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Stethoscope className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Área</p>
                    <p className="font-semibold">{detalle.area}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Motivos de Consulta */}
            {detalle.motivosConsulta && detalle.motivosConsulta.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Motivos de Consulta</span>
                </h3>
                <div className="space-y-2">
                  {detalle.motivosConsulta.map((motivo, index) => (
                    <Card key={index}>
                      <CardContent className="p-3">
                        <p className="text-sm">{motivo.motivo}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Diagnósticos */}
            {detalle.diagnosticos && detalle.diagnosticos.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Diagnósticos</span>
                </h3>
                <div className="space-y-3">
                  {detalle.diagnosticos.map((diagnostico, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <p className="font-medium">{diagnostico.descripcion}</p>
                            <div className="flex gap-2">
                              <Badge className={getBadgeColor(diagnostico.estado)}>
                                {diagnostico.estado}
                              </Badge>
                              <Badge className={getCertezaColor(diagnostico.gradoCerteza)}>
                                {diagnostico.gradoCerteza}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Inicio: {formatFecha(diagnostico.fechaInicio)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Próximas Consultas */}
            {(detalle.fechaProximaConsultaRecomendada || detalle.fechaProximaConsultaConfirmada) && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Próximas Consultas</span>
                </h3>
                <div className="space-y-3">
                  {detalle.fechaProximaConsultaRecomendada && (
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Consulta Recomendada</p>
                        <p className="font-medium">{formatFecha(detalle.fechaProximaConsultaRecomendada)}</p>
                        {detalle.areaProximoControl && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Área: {detalle.areaProximoControl}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                  {detalle.fechaProximaConsultaConfirmada && (
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Consulta Confirmada</p>
                        <p className="font-medium">{formatFecha(detalle.fechaProximaConsultaConfirmada)}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
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
