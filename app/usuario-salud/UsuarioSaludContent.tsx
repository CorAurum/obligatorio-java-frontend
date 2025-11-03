'use client'

import { useState } from 'react';
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
} from "lucide-react"

interface DocumentoClinico {
  id: string
  tipo: string
  fecha: string
  profesional: string
  clinica: string
  estado: "disponible" | "restringido"
}

interface PoliticaAcceso {
  id: string
  tipo: "especialidad" | "clinica"
  nombre: string
  estado: "activa" | "revocada"
}

interface AccesoHistoria {
  id: string
  profesional: string
  clinica: string
  fecha: string
  tipo: "consulta" | "descarga" | "compartir"
}

export default function UsuarioSaludContent({ userInfo }: { userInfo: any }) {
  const [documentos] = useState<DocumentoClinico[]>([
    {
      id: "1",
      tipo: "Consulta Médica",
      fecha: "2024-01-15",
      profesional: "Dr. Juan Pérez",
      clinica: "Hospital Maciel",
      estado: "disponible",
    },
    {
      id: "2",
      tipo: "Análisis de Sangre",
      fecha: "2024-01-10",
      profesional: "Lab. María González",
      clinica: "Laboratorio Central",
      estado: "disponible",
    },
    {
      id: "3",
      tipo: "Radiografía",
      fecha: "2024-01-08",
      profesional: "Dr. Ana Rodríguez",
      clinica: "Centro de Diagnóstico",
      estado: "restringido",
    },
  ])

  const [politicas] = useState<PoliticaAcceso[]>([
    { id: "1", tipo: "especialidad", nombre: "Cardiología", estado: "activa" },
    { id: "2", tipo: "especialidad", nombre: "Medicina General", estado: "activa" },
    { id: "3", tipo: "clinica", nombre: "Hospital Maciel", estado: "activa" },
    { id: "4", tipo: "clinica", nombre: "Clínica Médica", estado: "activa" },
  ])

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
    politicas: politicas.filter(p => p.estado === "activa").length,
    accesos: accesos.length,
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
                Gub.uy ID: {userInfo?.sub || userInfo?.email || 'Invitado'}
              </Badge>
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
                <div className="space-y-4">
                  {documentos.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{doc.tipo}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {doc.fecha}
                            </span>
                            <span className="flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              {doc.profesional}
                            </span>
                            <span className="flex items-center">
                              <Hospital className="w-3 h-3 mr-1" />
                              {doc.clinica}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={doc.estado === "disponible" ? "default" : "secondary"} className="text-xs">
                          {doc.estado === "disponible" && <CheckCircle className="w-3 h-3 mr-1" />}
                          {doc.estado === "restringido" && <AlertCircle className="w-3 h-3 mr-1" />}
                          {doc.estado}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Descargar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Políticas de Acceso */}
          <TabsContent value="politicas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Gestión de Políticas de Acceso</span>
                </CardTitle>
                <CardDescription>Controla quién puede acceder a tu información médica</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Acceso por Especialidad</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Permite el acceso automático a profesionales de ciertas especialidades
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {politicas
                        .filter(p => p.tipo === "especialidad" && p.estado === "activa")
                        .map(p => (
                          <div key={p.id} className="flex items-center gap-2">
                            <Badge variant="outline">{p.nombre}</Badge>
                            <button className="text-xs text-red-600 hover:text-red-700">✕</button>
                          </div>
                        ))}
                      <Button variant="outline" size="sm">
                        + Agregar Especialidad
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Clínicas Autorizadas</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Clínicas con acceso completo a tu historia clínica
                    </p>
                    <div className="space-y-2">
                      {politicas
                        .filter(p => p.tipo === "clinica" && p.estado === "activa")
                        .map(p => (
                          <div key={p.id} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm font-medium">{p.nombre}</span>
                            <Button variant="outline" size="sm">
                              Revocar
                            </Button>
                          </div>
                        ))}
                      <Button variant="outline" size="sm" className="w-full">
                        + Autorizar Nueva Clínica
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Auditoría de Accesos */}
          <TabsContent value="accesos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Registro de Accesos</span>
                </CardTitle>
                <CardDescription>Historial de quién ha accedido a tu información médica</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accesos.map((acceso) => (
                    <div
                      key={acceso.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          {acceso.tipo === "consulta" && <Eye className="w-5 h-5 text-purple-600" />}
                          {acceso.tipo === "descarga" && <Download className="w-5 h-5 text-purple-600" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{acceso.profesional}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Hospital className="w-3 h-3 mr-1" />
                              {acceso.clinica}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {acceso.fecha}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {acceso.tipo}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
