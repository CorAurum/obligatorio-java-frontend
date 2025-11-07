// API client for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/CompC-1.0-SNAPSHOT/api';

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

class BackendAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get Usuario ID by cedula
   * Returns the first Usuario ID found for the given cedula
   */
  async getUsuarioIdByCedula(cedula: string): Promise<string> {
    const url = `${this.baseURL}/identificadores/usuario/ci/${cedula}`;
    console.log('Llamando a URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
  async getDocumentosClinicos(usuarioId: string): Promise<DocumentoClinicoDTO[]> {
    const response = await fetch(`${this.baseURL}/documentoClinico/usuarioDTO/${usuarioId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching documentos: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user's access policies
   */
  async getPoliticasAcceso(usuarioId: string): Promise<PoliticaDeAccesoDTO[]> {
    const response = await fetch(`${this.baseURL}/politicas/usuario/${usuarioId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching politicas: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create new access policy
   */
  async crearPolitica(request: CrearPoliticaRequest): Promise<PoliticaDeAccesoDTO> {
    const response = await fetch(`${this.baseURL}/politicas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
  async revocarPolitica(politicaId: string): Promise<{ status: string }> {
    const response = await fetch(`${this.baseURL}/politicas/${politicaId}/revocar`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error revoking politica: ${error}`);
    }

    return response.json();
  }

  /**
   * Check if a cedula belongs to an admin
   * Returns the Administrador object if found, null otherwise
   */
  async checkIsAdmin(cedula: string): Promise<Administrador | null> {
    try {
      const response = await fetch(`${this.baseURL}/administradores/cedula/${cedula}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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
  async getCentrosDeSalud(): Promise<CentroDeSalud[]> {
    const response = await fetch(`${this.baseURL}/CentroDeSalud`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching centros: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all especialidades
   */
  async getEspecialidades(): Promise<Especialidad[]> {
    const response = await fetch(`${this.baseURL}/especialidades`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching especialidades: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new especialidad
   */
  async crearEspecialidad(nombre: string, descripcion?: string): Promise<Especialidad> {
    const response = await fetch(`${this.baseURL}/especialidades`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
  async crearCentroDeSalud(centro: Partial<CentroDeSalud>, adminId: number): Promise<CentroDeSalud> {
    const response = await fetch(`${this.baseURL}/CentroDeSalud?adminId=${adminId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(centro),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error creando centro de salud: ${error}`);
    }

    return response.json();
  }
}

export const backendAPI = new BackendAPI();
