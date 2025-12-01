'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { backendAPI, Notificacion } from '@/lib/api/backend'
import { cn } from '@/lib/utils'

interface NotificacionesDropdownProps {
  usuarioId: string
}

export default function NotificacionesDropdown({ usuarioId }: NotificacionesDropdownProps) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const notificacionesNuevas = notificaciones.filter(n => !n.leida).length

  // Cargar notificaciones
  const cargarNotificaciones = async () => {
    try {
      setLoading(true)
      const todas = await backendAPI.getNotificacionesTodas(usuarioId)
      setNotificaciones(todas)
    } catch (error) {
      console.error('Error cargando notificaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    if (usuarioId) {
      cargarNotificaciones()
    }
  }, [usuarioId])

  // Polling cada 30 segundos para obtener nuevas notificaciones
  useEffect(() => {
    if (!usuarioId) return

    const interval = setInterval(async () => {
      try {
        const nuevas = await backendAPI.getNotificacionesNuevas(usuarioId)
        if (nuevas.length > 0) {
          // Agregar nuevas notificaciones sin duplicar
          setNotificaciones(prev => {
            const existingIds = new Set(prev.map(n => n.id))
            const notificacionesNuevas = nuevas.filter(n => !existingIds.has(n.id))
            return [...notificacionesNuevas, ...prev]
          })
        }
      } catch (error) {
        console.error('Error obteniendo notificaciones nuevas:', error)
      }
    }, 30000) // 30 segundos

    return () => clearInterval(interval)
  }, [usuarioId])

  // Marcar notificación como leída
  const marcarComoLeida = async (notificacionId: string) => {
    try {
      await backendAPI.marcarNotificacionesLeidas(usuarioId, [notificacionId])

      // Actualizar estado local
      setNotificaciones(prev =>
        prev.map(n =>
          n.id === notificacionId ? { ...n, leida: true, fechaLectura: new Date().toISOString() } : n
        )
      )
    } catch (error) {
      console.error('Error marcando notificación como leída:', error)
    }
  }

  // Marcar todas como leídas
  const marcarTodasLeidas = async () => {
    const noLeidas = notificaciones.filter(n => !n.leida).map(n => n.id)
    if (noLeidas.length === 0) return

    try {
      await backendAPI.marcarNotificacionesLeidas(usuarioId, noLeidas)

      // Actualizar estado local
      setNotificaciones(prev =>
        prev.map(n => ({ ...n, leida: true, fechaLectura: new Date().toISOString() }))
      )
    } catch (error) {
      console.error('Error marcando todas como leídas:', error)
    }
  }

  // Obtener icono según tipo de notificación
  const getTipoIcon = (tipo: Notificacion['tipo']) => {
    const iconClass = "w-4 h-4"
    switch (tipo) {
      case 'ACCESO':
        return <Bell className={iconClass} />
      case 'POLITICA':
        return <Check className={iconClass} />
      case 'ALERTA':
        return <X className={iconClass} />
      default:
        return <Bell className={iconClass} />
    }
  }

  // Obtener color según tipo
  const getTipoColor = (tipo: Notificacion['tipo']) => {
    switch (tipo) {
      case 'ACCESO':
        return 'bg-blue-100 text-blue-600'
      case 'POLITICA':
        return 'bg-green-100 text-green-600'
      case 'ALERTA':
        return 'bg-red-100 text-red-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {notificacionesNuevas > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {notificacionesNuevas > 9 ? '9+' : notificacionesNuevas}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {notificacionesNuevas > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={marcarTodasLeidas}
              className="h-6 text-xs"
            >
              Marcar todas leídas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Cargando notificaciones...
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No hay notificaciones
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notificaciones.map((notificacion) => (
              <DropdownMenuItem
                key={notificacion.id}
                className={cn(
                  'flex flex-col items-start p-3 cursor-pointer',
                  !notificacion.leida && 'bg-blue-50',
                  notificacion.leida && 'opacity-60'
                )}
                onClick={() => !notificacion.leida && marcarComoLeida(notificacion.id)}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className={cn('p-2 rounded-full', getTipoColor(notificacion.tipo))}>
                    {getTipoIcon(notificacion.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notificacion.titulo}
                      </p>
                      {!notificacion.leida && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                      {notificacion.mensaje}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(notificacion.fechaCreacion).toLocaleDateString('es-UY', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
