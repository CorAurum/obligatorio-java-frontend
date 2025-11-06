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

class BackendAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
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
}

export const backendAPI = new BackendAPI();
