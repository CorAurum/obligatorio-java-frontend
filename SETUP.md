# Setup Guide - Frontend Obligatorio Java

Este documento explica cómo configurar el proyecto frontend después de clonarlo desde el repositorio.

## Requisitos Previos

- **Node.js**: versión 18.x o superior
- **npm** o **pnpm**: gestor de paquetes
- **Backend**: El backend debe estar corriendo en `http://localhost:8080`

## Pasos de Configuración

### 1. Instalar Dependencias

```bash
npm install
# o si usas pnpm
pnpm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto copiando desde `.env.example`:

```bash
cp .env.example .env
```

El contenido debe ser:

```env
# URL del Backend API
NEXT_PUBLIC_API_URL=http://localhost:8080/CompC-1.0-SNAPSHOT/api

# OIDC Configuration for gub.uy (OAuth Testing Environment)
OIDC_CLIENT_ID=890192
OIDC_CLIENT_SECRET=457d52f181bf11804a3365b49ae4d29a2e03bbabe74997a2f510b179
OIDC_REDIRECT_URI=http://localhost:3000

# gub.uy testing environment endpoints
OIDC_AUTHORIZE_URL=https://auth-testing.iduruguay.gub.uy/oidc/v1/authorize
OIDC_TOKEN_URL=https://auth-testing.iduruguay.gub.uy/oidc/v1/token
OIDC_SCOPE=openid document personal_info auth_info

# Session configuration
SESSION_SECRET=a4b23d96f8d3e44f8f40d61c12b5a9d057e0dba5cf871e2fd41f6b033a1c8b67
```

**⚠️ IMPORTANTE:**
- Para **producción**, genera una nueva `SESSION_SECRET`:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- Actualiza `OIDC_REDIRECT_URI` con tu dominio de producción
- Si el backend está en otro puerto/host, actualiza `NEXT_PUBLIC_API_URL`
- **NO modifiques** `OIDC_CLIENT_ID` ni `OIDC_CLIENT_SECRET` para testing

### 3. Verificar Configuración del Backend

Asegúrate de que el backend esté:
- Corriendo en `http://localhost:8080`
- Con CORS habilitado para `http://localhost:3000`
- Con la aplicación desplegada como `CompC-1.0-SNAPSHOT`

### 4. Ejecutar el Proyecto

**Modo Desarrollo:**
```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000`

**IMPORTANTE:** El puerto debe ser exactamente `3000` para que el OAuth funcione. Si el puerto está ocupado, libéralo o modifica la configuración en gub.uy.

**Modo Producción:**
```bash
npm run build
npm run start
```

## Estructura de Rutas Principales

- `/` - Página de inicio
- `/login` - Login con gub.uy (OAuth)
- `/admin-hcen` - Portal de administración HCEN
- `/admin-hcen/crear-clinica` - Crear nuevas clínicas
- `/usuario-salud` - Portal de usuario

## Autenticación

El proyecto usa **OAuth 2.0 con gub.uy (IdUruguay)** en el ambiente de testing.

### Flujo de Autenticación:
1. Usuario hace click en "Iniciar Sesión"
2. Redirige a `auth-testing.iduruguay.gub.uy`
3. Usuario se autentica con credenciales de gub.uy
4. Callback a `http://localhost:3000` con código de autorización
5. Frontend intercambia código por token JWT
6. Token se almacena en sesión y se usa para llamadas al backend

## Troubleshooting

### 🚨 Error: "OIDC_ERROR" al intentar login

Si te redirige a `https://mi-testing.iduruguay.gub.uy/error/?errorCode=OIDC_ERROR`:

**Ver la guía completa:** [TROUBLESHOOTING_AUTH.md](./TROUBLESHOOTING_AUTH.md)

**Solución rápida (90% de los casos):**
1. Verifica que `OIDC_REDIRECT_URI=http://localhost:3000` (sin barra `/` al final)
2. Verifica que el frontend corra exactamente en puerto `3000`
3. Reinicia el servidor después de crear/modificar `.env`
4. Borra la carpeta `.next` y reinicia

### Error: "Failed to fetch"
- Verifica que el backend esté corriendo en puerto 8080
- Verifica la URL en `NEXT_PUBLIC_API_URL`
- Verifica que CORS esté habilitado en el backend

### Error: "Invalid redirect_uri"
- Asegúrate de que `OIDC_REDIRECT_URI` sea exactamente `http://localhost:3000`
- NO debe terminar con `/`
- NO debe incluir rutas adicionales

### Error: "Session secret not configured"
- Asegúrate de tener `SESSION_SECRET` en el `.env`
- Debe tener al menos 32 caracteres

### Puerto 3000 en uso
**NO recomendado cambiar el puerto para testing OAuth.**

Si absolutamente necesitas usar otro puerto:
```bash
PORT=3001 npm run dev
```
Luego actualiza `OIDC_REDIRECT_URI=http://localhost:3001` en `.env`

## Tecnologías Utilizadas

- **Next.js 16.0.1** - Framework React con Turbopack
- **React 19.2.0** - Librería UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes UI
- **Lucide React** - Iconos
- **iron-session** - Gestión de sesiones

## Notas Adicionales

### Desarrollo Local
- Hot reload está habilitado (Turbopack)
- Los cambios se reflejan automáticamente
- No necesitas reiniciar el servidor para cambios en código
- **SÍ necesitas reiniciar** para cambios en `.env`

### Variables de Entorno en Producción
Cuando despliegues a producción (Vercel, Railway, etc.):
1. Configura todas las variables de entorno en el panel de control
2. Usa `NEXT_PUBLIC_API_URL` apuntando a tu backend de producción
3. Actualiza `OIDC_REDIRECT_URI` con tu dominio real
4. Genera un nuevo `SESSION_SECRET` seguro
5. **Cambia a endpoints de producción de gub.uy** (quita `-testing`)

### Base de Datos
El frontend no tiene base de datos propia. Toda la persistencia se maneja a través del backend en `http://localhost:8080`.

## Checklist de Instalación

- [ ] Node.js 18+ instalado
- [ ] Dependencias instaladas con `npm install`
- [ ] Archivo `.env` creado y configurado
- [ ] Backend corriendo en puerto 8080
- [ ] Frontend corriendo en puerto 3000
- [ ] Puedes acceder a `http://localhost:3000`
- [ ] El login con gub.uy funciona correctamente

## Contacto y Soporte

Para problemas:
1. Revisa [TROUBLESHOOTING_AUTH.md](./TROUBLESHOOTING_AUTH.md) para errores de autenticación
2. Verifica el checklist de instalación
3. Contacta al equipo de desarrollo si persiste el problema
