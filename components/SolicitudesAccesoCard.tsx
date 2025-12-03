'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'
import { backendAPI, SolicitudDeAcceso } from '@/lib/api/backend'

interface SolicitudesAccesoCardProps {
  usuarioId: string
  solicitudes: SolicitudDeAcceso[]
  onSolicitudesActualizadas: () => void
}

export default function SolicitudesAccesoCard({
  usuarioId,
  solicitudes,
  onSolicitudesActualizadas,
}: SolicitudesAccesoCardProps) {
  const [procesando, setProcesando] = useState<string | null>(null)

  const handleAprobar = async (solicitudId: string) => {
    if (!confirm('¿Está seguro de que desea aprobar esta solicitud de acceso?')) {
      return
    }

    try {
      setProcesando(solicitudId)
      await backendAPI.aprobarSolicitud(solicitudId)
      alert('Solicitud aprobada exitosamente')
      onSolicitudesActualizadas()
    } catch (error) {
      console.error('Error aprobando solicitud:', error)
      alert('Error al aprobar la solicitud: ' + (error as any).message)
    } finally {
      setProcesando(null)
    }
  }

  const handleRechazar = async (solicitudId: string) => {
    if (!confirm('¿Está seguro de que desea rechazar esta solicitud de acceso?')) {
      return
    }

    try {
      setProcesando(solicitudId)
      await backendAPI.rechazarSolicitud(solicitudId)
      alert('Solicitud rechazada exitosamente')
      onSolicitudesActualizadas()
    } catch (error) {
      console.error('Error rechazando solicitud:', error)
      alert('Error al rechazar la solicitud: ' + (error as any).message)
    } finally {
      setProcesando(null)
    }
  }

  if (solicitudes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Solicitudes Pendientes</span>
          </CardTitle>
          <CardDescription>Solicitudes de acceso a tu información médica que requieren tu autorización</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No hay solicitudes pendientes</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Solicitudes Pendientes</span>
            </CardTitle>
            <CardDescription>Solicitudes de acceso a tu información médica que requieren tu autorización</CardDescription>
          </div>
          <Badge variant="destructive" className="h-6">
            {solicitudes.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {solicitudes.map((solicitud) => (
            <div
              key={solicitud.id}
              className="p-4 border border-orange-200 rounded-lg bg-orange-50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <h4 className="font-medium text-gray-900">Nueva Solicitud de Acceso</h4>
                    <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                      {solicitud.estado}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <p className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Fecha: {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-UY', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {solicitud.motivo && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Motivo:</p>
                        <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200 mt-1">
                          {solicitud.motivo}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-orange-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRechazar(solicitud.id)}
                  disabled={procesando === solicitud.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {procesando === solicitud.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Rechazar
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAprobar(solicitud.id)}
                  disabled={procesando === solicitud.id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {procesando === solicitud.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprobar
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
