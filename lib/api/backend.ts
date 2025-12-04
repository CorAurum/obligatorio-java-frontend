// API client for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/CompC-1.0-SNAPSHOT';

export interface DocumentoClinicoDTO {
  fechaCreacion: string;
  area: string;
  descripcion: string;
  urlAlojamiento: string;
  profesionalNombre: string;
  profesionalApellido: string;
}

export interface PoliticaDeAccesoDTO {
  id: string;
  centroId: string;
  centroNombre: string;
  especialidades: {
    id: string;
    nombre: string;
  }[];
  fechaCreacion: string;
  vigenciaHasta: string | null;
  estado: 'ACTIVA' | 'REVOCADA' | 'EXPIRADA';
}

export interface CrearPoliticaRequest {
  usuarioId: string;
  centroId: string;
  especialidades: string[];
  vigenciaHasta?: string;
}

export interface Administrador {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  cedula: string;
  fechaAlta: string;
  activo: boolean;
}

export interface CentroDeSalud {
  id: string;
  nombre: string;
  tipoInstitucion: string;
  direccion?: string;
  telefono?: string;
  urlWebService?: string;
  estado?: string;
}

export interface Especialidad {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface Usuario {
  id: string;
  nombres?: string;
  apellidos?: string;
  fechaNacimiento?: string;
}

export interface ProfesionalDeSalud {
  id: string;
  numeroRegistro?: string;
  nombres: string;
  apellidos: string;
  email?: string;
  telefono?: string;
  fechaRegistroProfesional?: string;
  estado?: 'ACTIVO' | 'SUSPENDIDO';
  centroDeSalud?: CentroDeSalud;
}

export interface Notificacion {
  id: number;
  userId: string;
  titulo: string;
  mensaje: string;
  tipo?: 'INFO' | 'ALERTA' | 'ACCESO' | 'POLITICA';
  leida: boolean;
  fechaCreacion: string;
  fechaLectura?: string;
}

export interface SolicitudDeAcceso {
  id: string;
  solicitanteId: string;
  fechaSolicitud: string;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  motivo: string;
}

export interface LogDeAcceso {
  profesionalId: string;
  profesionalNombre: string;
  profesionalApellido: string;
  centroNombre: string;
  fechaAcceso: string;
  resultado: boolean;
  motivo: string;
}

class BackendAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get authentication headers for API requests
   */
  private getAuthHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Get Usuario ID by cedula
   * Returns the first Usuario ID found for the given cedula
   */
  async getUsuarioIdByCedula(cedula: string, token?: string): Promise<string> {
    const url = `${this.baseURL}/api/identificadores/usuario/ci/${cedula}`;
    console.log('Llamando a URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    console.log('Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Error fetching usuario by cedula: ${response.statusText} - ${errorText}`);
    }

    const usuarioIds: string[] = await response.json();
    console.log('Usuario IDs encontrados:', usuarioIds);

    if (usuarioIds.length === 0) {
      throw new Error(`No se encontró usuario con cédula ${cedula}`);
    }

    // Return the first Usuario ID found
    return usuarioIds[0];
  }

  /**
   * Get user's clinical documents
   */
  async getDocumentosClinicos(usuarioId: string, token?: string): Promise<DocumentoClinicoDTO[]> {
    const response = await fetch(`${this.baseURL}/api/documentoClinico/usuarioDTO/${usuarioId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Error fetching documentos: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user's access policies
   */
  async getPoliticasAcceso(usuarioId: string, token?: string): Promise<PoliticaDeAccesoDTO[]> {
    const response = await fetch(`${this.baseURL}/api/politicas/usuario/${usuarioId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Error fetching politicas: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create new access policy
   */
  async crearPolitica(request: CrearPoliticaRequest, token?: string): Promise<PoliticaDeAccesoDTO> {
    const response = await fetch(`${this.baseURL}/api/politicas`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error creating politica: ${error}`);
    }

    return response.json();
  }

  /**
   * Revoke an access policy
   */
  async revocarPolitica(politicaId: string, token?: string): Promise<{ status: string }> {
    const response = await fetch(`${this.baseURL}/api/politicas/${politicaId}/revocar`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error revoking politica: ${error}`);
    }

    return response.json();
  }

  /**
   * Get admin by cedula
   * Returns the Administrador object if found, null otherwise
   */
  async getAdminByCedula(cedula: string, token?: string): Promise<Administrador | null> {
    try {
      console.log('Llamando a URL:', `${this.baseURL}/administradores/cedula/${cedula}`);
      const response = await fetch(`${this.baseURL}/api/administradores/cedula/${cedula}`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      if (response.status === 404) {
        return null; // Not an admin
      }

      if (!response.ok) {
        throw new Error(`Error getting admin by cedula: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error getting admin by cedula:', error);
      return null;
    }
  }

  /**
   * Check if a cedula belongs to an admin
   * Returns the Administrador object if found, null otherwise
   */
  async checkIsAdmin(cedula: string, token?: string): Promise<Administrador | null> {
    try {
      const response = await fetch(`${this.baseURL}/api/administradores/cedula/${cedula}`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      if (response.status === 404) {
        return null; // Not an admin
      }

      if (!response.ok) {
        throw new Error(`Error checking admin status: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error checking admin:', error);
      return null;
    }
  }

  /**
   * Get all centros de salud
   */
  async getCentrosDeSalud(token?: string): Promise<CentroDeSalud[]> {
    const response = await fetch(`${this.baseURL}/api/CentroDeSalud`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Error fetching centros: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all especialidades
   */
  async getEspecialidades(token?: string): Promise<Especialidad[]> {
    const response = await fetch(`${this.baseURL}/api/especialidades`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Error fetching especialidades: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new especialidad
   */
  async crearEspecialidad(nombre: string, descripcion?: string, token?: string): Promise<Especialidad> {
    const response = await fetch(`${this.baseURL}/api/especialidades`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ nombre, descripcion }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error creando especialidad: ${error}`);
    }

    return response.json();
  }

  /**
   * Create a new centro de salud
   */
  async crearCentroDeSalud(centro: Partial<CentroDeSalud>, adminId: number, token?: string): Promise<CentroDeSalud> {
    const response = await fetch(`${this.baseURL}/api/CentroDeSalud?adminId=${adminId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(centro),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error creando centro de salud: ${error}`);
    }

    return response.json();
  }

  /**
   * Toggle centro de salud status (habilitar/inhabilitar)
   */
  async toggleCentroDeSalud(clinicaId: string, token?: string): Promise<CentroDeSalud> {
    const response = await fetch(`${this.baseURL}/api/CentroDeSalud/${clinicaId}/inhabilitar`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error cambiando estado de centro de salud: ${error}`);
    }

    return response.json();
  }

  /**
   * Get all administradores
   */
  async getAdministradores(token?: string): Promise<Administrador[]> {
    const response = await fetch(`${this.baseURL}/api/administradores`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Error fetching administradores: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new administrador
   */
  async crearAdministrador(admin: Omit<Administrador, 'id' | 'fechaAlta'>, token?: string): Promise<Administrador> {
    const response = await fetch(`${this.baseURL}/api/administradores`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(admin),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error creando administrador: ${error}`);
    }

    return response.json();
  }

  /**
   * Update an administrador
   */
  async actualizarAdministrador(id: number, admin: Partial<Administrador>, token?: string): Promise<Administrador> {
    const response = await fetch(`${this.baseURL}/api/administradores/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(admin),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error actualizando administrador: ${error}`);
    }

    return response.json();
  }

  /**
   * Toggle administrador active status
   */
  async toggleAdministradorEstado(id: number, activo: boolean, token?: string): Promise<Administrador> {
    return this.actualizarAdministrador(id, { activo }, token);
  }

  /**
   * Change state from administrador
   */
  async desactivarAdministrador(id: number, token?: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/administradores/${id}/inhabilitar`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error eliminando administrador: ${error}`);
    }
  }

  /**
   * Get all usuarios
   */
  async getUsuarios(token?: string): Promise<Usuario[]> {
    const response = await fetch(`${this.baseURL}/api/usuarios`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Error fetching usuarios: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all profesionales de salud
   */
  async getProfesionales(token?: string): Promise<ProfesionalDeSalud[]> {
    const response = await fetch(`${this.baseURL}/api/profesionales`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Error fetching profesionales: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new profesional de salud
   */
  async crearProfesional(profesional: Omit<ProfesionalDeSalud, 'id' | 'fechaRegistroProfesional' | 'centroDeSalud'>, centroId: string, adminId: number, token?: string): Promise<ProfesionalDeSalud> {
    const response = await fetch(`${this.baseURL}/api/profesionales?centroId=${centroId}&adminId=${adminId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(profesional),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error creando profesional: ${error}`);
    }

    return response.json();
  }

  /**
   * Update a profesional de salud
   */
  async actualizarProfesional(id: string, profesional: Partial<ProfesionalDeSalud>, token?: string): Promise<ProfesionalDeSalud> {
    const response = await fetch(`${this.baseURL}/api/profesionales/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(profesional),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error actualizando profesional: ${error}`);
    }

    return response.json();
  }

  /**
   * Get new notifications for a user
   */
  async getNotificacionesNuevas(usuarioId: string, token?: string): Promise<Notificacion[]> {
    const response = await fetch(`${this.baseURL}/api/notificaciones/nuevas/${usuarioId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Error fetching notificaciones nuevas: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all notifications for a user
   */
  async getNotificacionesTodas(usuarioId: string, token?: string): Promise<Notificacion[]> {
    const response = await fetch(`${this.baseURL}/api/notificaciones/todas/${usuarioId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Error fetching todas las notificaciones: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Mark notifications as read
   */
  async marcarNotificacionesLeidas(usuarioId: string, notificacionIds: number[], token?: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/notificaciones/marcar-leidas/${usuarioId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(notificacionIds),
    });

    if (!response.ok) {
      throw new Error(`Error marcando notificaciones como leídas: ${response.statusText}`);
    }
  }

  /**
   * Get pending access requests for a user
   */
  async getSolicitudesPendientes(usuarioId: string, token?: string): Promise<SolicitudDeAcceso[]> {
    const response = await fetch(`${this.baseURL}/api/acceso/solicitudes/pendientes/${usuarioId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Error fetching solicitudes pendientes: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Approve an access request
   */
  async aprobarSolicitud(solicitudId: string, token?: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/acceso/solicitud/${solicitudId}/aprobar`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Error aprobando solicitud: ${response.statusText}`);
    }
  }

  /**
   * Reject an access request
   */
  async rechazarSolicitud(solicitudId: string, token?: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/acceso/solicitud/${solicitudId}/rechazar`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Error rechazando solicitud: ${response.statusText}`);
    }
  }

  /**
   * Get access logs for a user
   */
  async getLogsDeAcceso(usuarioId: string, token?: string): Promise<LogDeAcceso[]> {
    const response = await fetch(`${this.baseURL}/api/accesos?usuarioId=${usuarioId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Error fetching logs de acceso: ${response.statusText}`);
    }

    return response.json();
  }
}

export const backendAPI = new BackendAPI();
