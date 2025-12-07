'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Plus, Loader2, Building2, Stethoscope } from 'lucide-react'
import { backendAPI, CentroDeSalud, Especialidad, CrearPoliticaRequest } from '@/lib/api/backend'
import { Badge } from '@/components/ui/badge'

interface CrearPoliticaDialogProps {
  usuarioId: string
  onPoliticaCreada: () => void
}

export default function CrearPoliticaDialog({ usuarioId, onPoliticaCreada }: CrearPoliticaDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)

  const [centros, setCentros] = useState<CentroDeSalud[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])

  const [centroSeleccionado, setCentroSeleccionado] = useState<string>('')
  const [especialidadesSeleccionadas, setEspecialidadesSeleccionadas] = useState<string[]>([])
  const [vigenciaHasta, setVigenciaHasta] = useState<string>('')

  // Cargar centros y especialidades al abrir el diálogo
  useEffect(() => {
    if (open) {
      cargarDatos()
    }
  }, [open])

  const cargarDatos = async () => {
    try {
      setLoadingData(true)
      const [centrosData, especialidadesData] = await Promise.all([
        backendAPI.getCentrosDeSalud(),
        backendAPI.getEspecialidades(),
      ])
      setCentros(centrosData.filter(c => c.estado === 'HABILITADO'))
      setEspecialidades(especialidadesData)
    } catch (error) {
      console.error('Error cargando datos:', error)
      alert('Error al cargar los centros de salud y especialidades')
    } finally {
      setLoadingData(false)
    }
  }

  const toggleEspecialidad = (especialidadId: string) => {
    setEspecialidadesSeleccionadas(prev => {
      if (prev.includes(especialidadId)) {
        return prev.filter(id => id !== especialidadId)
      } else {
        return [...prev, especialidadId]
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!centroSeleccionado) {
      alert('Por favor selecciona un centro de salud')
      return
    }

    if (especialidadesSeleccionadas.length === 0) {
      alert('Por favor selecciona al menos una especialidad')
      return
    }

    try {
      setLoading(true)

      const request: CrearPoliticaRequest = {
        usuarioId,
        centroId: centroSeleccionado,
        especialidades: especialidadesSeleccionadas,
        vigenciaHasta: vigenciaHasta || undefined,
      }

      await backendAPI.crearPolitica(request)

      // Resetear formulario
      setCentroSeleccionado('')
      setEspecialidadesSeleccionadas([])
      setVigenciaHasta('')
      setOpen(false)

      // Notificar al padre que se creó la política
      onPoliticaCreada()

      alert('Política de acceso creada exitosamente')
    } catch (error) {
      console.error('Error creando política:', error)
      alert('Error al crear la política de acceso: ' + (error as any).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Crear Nueva Política
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Política de Acceso</DialogTitle>
          <DialogDescription>
            Autoriza a un centro de salud a acceder a tu información médica para especialidades específicas.
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selección de Centro de Salud */}
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center">
                <Building2 className="w-4 h-4 mr-2" />
                Centro de Salud
              </Label>
              <div className="grid gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {centros.map((centro) => (
                  <label
                    key={centro.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      centroSeleccionado === centro.id
                        ? 'bg-blue-50 border-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="centro"
                      value={centro.id}
                      checked={centroSeleccionado === centro.id}
                      onChange={(e) => setCentroSeleccionado(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{centro.nombre}</p>
                      <p className="text-sm text-gray-600">{centro.direccion}</p>
                      <p className="text-xs text-gray-500">Tipo: {centro.tipoInstitucion}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {centro.estado}
                    </Badge>
                  </label>
                ))}
              </div>
            </div>

            {/* Selección de Especialidades */}
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center">
                <Stethoscope className="w-4 h-4 mr-2" />
                Especialidades Autorizadas
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {especialidades.map((especialidad) => (
                  <label
                    key={especialidad.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      especialidadesSeleccionadas.includes(especialidad.id)
                        ? 'bg-green-50 border-green-500'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={especialidadesSeleccionadas.includes(especialidad.id)}
                      onChange={() => toggleEspecialidad(especialidad.id)}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{especialidad.nombre}</p>
                      {especialidad.descripcion && (
                        <p className="text-xs text-gray-500">{especialidad.descripcion}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              {especialidadesSeleccionadas.length > 0 && (
                <p className="text-sm text-gray-600">
                  {especialidadesSeleccionadas.length} especialidad(es) seleccionada(s)
                </p>
              )}
            </div>

            {/* Vigencia */}
            <div className="space-y-2">
              <Label htmlFor="vigencia">Vigencia Hasta (Opcional)</Label>
              <Input
                id="vigencia"
                type="date"
                value={vigenciaHasta}
                onChange={(e) => setVigenciaHasta(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500">
                Si no se especifica, la política será permanente hasta que la revoque.
              </p>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Política
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
