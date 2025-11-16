// API client para backend periférico (multitenant con filtrado automático)
// Este cliente se conecta al backend Spring Boot a través de proxy de Next.js

// Usar el proxy de Next.js en lugar de llamar directamente al backend
const API_PERIFERICO_URL = '/api/periferico';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ClinicaPeriferico {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  tipoInstitucion: string;
  dominioSubdominio: string;
  fechaAlta?: string;
  fechaBaja?: string;
}

export interface EspecialidadPeriferico {
  id: number;
  nombre: string;
}

export interface ProfesionalPeriferico {
  idProfesional: number;
  cedulaIdentidad: string;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string;
  contrasena?: string;
  clinica?: ClinicaPeriferico;
  especialidades?: EspecialidadPeriferico[];
}

export interface IdentificadorUsuario {
  id?: string;
  tipo: string;
  valor: string;
  origen: string;
  fechaAlta?: string;
}

export interface UsuarioDeSalud {
  id?: number;
  nombre: string;
  apellido: string;
  fechaNacimiento?: string;
  sexo?: string;
  direccion?: string;
  email?: string;
  telefono?: string;
  activo?: boolean;
  clinica?: ClinicaPeriferico;
  identificadores?: IdentificadorUsuario[];
}

export interface MotivoConsulta {
  id: number;
  descripcion: string;
}

export interface GradoCerteza {
  id: number;
  descripcion: string;
}

export interface EstadoProblema {
  id: number;
  descripcion: string;
}

export interface Diagnostico {
  id?: number;
  descripcion: string;
  fechaInicio?: string;
  gradoCerteza?: GradoCerteza;
  estadoProblema?: EstadoProblema;
}

export interface DocumentoClinicoPeriferico {
  id?: number;
  titulo: string;
  descripcion: string;
  tipoDocumento: string;
  area: string;
  areaProximoControl?: string;
  fechaCreacion: string;
  fechaProximaConsultaRecomendada?: string;
  fechaProximaConsultaConfirmada?: string;
  urlAlojamiento?: string;
  usuario?: UsuarioDeSalud;
  profesional?: ProfesionalPeriferico;
  clinica?: ClinicaPeriferico;
  motivosConsulta?: MotivoConsulta[];
  diagnosticos?: Diagnostico[];
}

export interface AdministradorPeriferico {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  usuario: string;
  contrasena?: string;
  creadorPor?: number;
  activo?: boolean;
  clinica?: ClinicaPeriferico;
}

// ============================================================================
// CLASE API CLIENT
// ============================================================================

class PerifericoAPI {
  private baseURL: string;
  private clinicaDominio: string = 'santamaria'; // Dominio de la clínica (cambiar según necesidad)

  constructor() {
    this.baseURL = API_PERIFERICO_URL;
    console.log('🏥 PerifericoAPI inicializado:', this.baseURL);
  }

  // Método para establecer el dominio de la clínica
  setClinicaDominio(dominio: string) {
    this.clinicaDominio = dominio;
    console.log('🏥 Dominio de clínica establecido:', dominio);
  }

  // Método para obtener headers - el dominio de clínica se pasa como query param al proxy
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  // Método para agregar el dominio de clínica como query parameter para el proxy
  private addClinicDomainToUrl(url: string): string {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}clinicDomain=${this.clinicaDominio}`;
  }

  // ============================================================================
  // CLÍNICAS
  // ============================================================================

  async getClinicas(): Promise<ClinicaPeriferico[]> {
    const response = await fetch(`${this.baseURL}/clinicas`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Error obteniendo clínicas: ${response.statusText}`);
    }
    return response.json();
  }

  async getClinicaPorDominio(dominio: string): Promise<ClinicaPeriferico> {
    const response = await fetch(`${this.baseURL}/clinicas/${dominio}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Error obteniendo clínica: ${response.statusText}`);
    }
    return response.json();
  }

  async crearClinica(clinica: Omit<ClinicaPeriferico, 'id'>): Promise<ClinicaPeriferico> {
    const response = await fetch(`${this.baseURL}/clinicas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clinica),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error creando clínica: ${error}`);
    }
    return response.json();
  }

  // ============================================================================
  // PROFESIONALES
  // ============================================================================
  // NOTA: Todos estos endpoints se filtran automáticamente por clinicaId
  // via TenantFilter en el backend periférico

  async getProfesionales(): Promise<ProfesionalPeriferico[]> {
    const url = this.addClinicDomainToUrl(`${this.baseURL}/profesionales`);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Error obteniendo profesionales: ${response.statusText}`);
    }
    return response.json();
  }

  async getProfesionalPorId(id: number): Promise<ProfesionalPeriferico> {
    const response = await fetch(`${this.baseURL}/profesionales/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Error obteniendo profesional: ${response.statusText}`);
    }
    return response.json();
  }

  async getProfesionalPorCedula(cedula: string): Promise<ProfesionalPeriferico | null> {
    try {
      // Obtener todos los profesionales (ya filtrados por tenant)
      const profesionales = await this.getProfesionales();
      // Buscar por cédula
      const profesional = profesionales.find(p => p.cedulaIdentidad === cedula);
      return profesional || null;
    } catch (error) {
      console.error('Error buscando profesional por cédula:', error);
      return null;
    }
  }

  async crearProfesional(
    profesional: Omit<ProfesionalPeriferico, 'idProfesional' | 'clinica'>,
    especialidades: string[]
  ): Promise<ProfesionalPeriferico> {
    const response = await fetch(`${this.baseURL}/profesionales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profesional,
        especialidades
      }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error creando profesional: ${error}`);
    }
    return response.json();
  }

  // ============================================================================
  // USUARIOS DE SALUD (PACIENTES)
  // ============================================================================

  async getUsuarios(): Promise<UsuarioDeSalud[]> {
    const url = this.addClinicDomainToUrl(`${this.baseURL}/usuarios`);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Error obteniendo usuarios: ${response.statusText}`);
    }
    return response.json();
  }

  async getUsuarioPorId(id: number): Promise<UsuarioDeSalud> {
    const response = await fetch(`${this.baseURL}/usuarios/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Error obteniendo usuario: ${response.statusText}`);
    }
    return response.json();
  }

  async crearUsuario(usuario: UsuarioDeSalud): Promise<UsuarioDeSalud> {
    const response = await fetch(`${this.baseURL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error creando usuario: ${error}`);
    }
    return response.json();
  }

  // ============================================================================
  // DOCUMENTOS CLÍNICOS
  // ============================================================================

  async getDocumentos(): Promise<DocumentoClinicoPeriferico[]> {
    const response = await fetch(`${this.baseURL}/documentos`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Error obteniendo documentos: ${response.statusText}`);
    }
    return response.json();
  }

  async getDocumentosPorUsuario(usuarioId: number): Promise<DocumentoClinicoPeriferico[]> {
    const response = await fetch(`${this.baseURL}/documentos/usuario/${usuarioId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Error obteniendo documentos del usuario: ${response.statusText}`);
    }
    return response.json();
  }

  async getDocumentosPorProfesional(profesionalId: number): Promise<DocumentoClinicoPeriferico[]> {
    const url = this.addClinicDomainToUrl(`${this.baseURL}/documentos/profesional/${profesionalId}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Error obteniendo documentos del profesional: ${response.statusText}`);
    }
    return response.json();
  }

  async getDocumentoPorId(id: number): Promise<DocumentoClinicoPeriferico> {
    const response = await fetch(`${this.baseURL}/documentos/${id}/externo`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Error obteniendo documento: ${response.statusText}`);
    }
    return response.json();
  }

  async crearDocumento(
    idUsuario: string,
    idProfesional: number,
    documento: Partial<DocumentoClinicoPeriferico>
  ): Promise<DocumentoClinicoPeriferico> {
    // Add query parameters for idUsuario and idProfesional
    let url = `${this.baseURL}/documentos?idUsuario=${idUsuario}&idProfesional=${idProfesional}`;
    url = this.addClinicDomainToUrl(url);

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(documento),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error creando documento: ${error}`);
    }
    return response.json();
  }

  // ============================================================================
  // ESPECIALIDADES
  // ============================================================================

  async getEspecialidades(): Promise<EspecialidadPeriferico[]> {
    const response = await fetch(`${this.baseURL}/especialidades`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Error obteniendo especialidades: ${response.statusText}`);
    }
    return response.json();
  }

  // ============================================================================
  // ADMINISTRADORES
  // ============================================================================

  async getAdministradores(): Promise<AdministradorPeriferico[]> {
    const response = await fetch(`${this.baseURL}/administradores`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Error obteniendo administradores: ${response.statusText}`);
    }
    return response.json();
  }

  async crearAdministrador(admin: Omit<AdministradorPeriferico, 'id'>): Promise<AdministradorPeriferico> {
    const response = await fetch(`${this.baseURL}/administradores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(admin),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error creando administrador: ${error}`);
    }
    return response.json();
  }

  // ============================================================================
  // CATÁLOGOS
  // ============================================================================

  async getMotivosConsulta(): Promise<MotivoConsulta[]> {
    const url = this.addClinicDomainToUrl(`${this.baseURL}/motivos-consulta`);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Error obteniendo motivos de consulta: ${response.statusText}`);
    }
    return response.json();
  }

  async getGradosCerteza(): Promise<GradoCerteza[]> {
    const url = this.addClinicDomainToUrl(`${this.baseURL}/grados-certeza`);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Error obteniendo grados de certeza: ${response.statusText}`);
    }
    return response.json();
  }

  async getEstadosProblema(): Promise<EstadoProblema[]> {
    const url = this.addClinicDomainToUrl(`${this.baseURL}/estados-problema`);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Error obteniendo estados de problema: ${response.statusText}`);
    }
    return response.json();
  }
}

// ============================================================================
// EXPORTAR INSTANCIA SINGLETON
// ============================================================================

export const perifericoAPI = new PerifericoAPI();
