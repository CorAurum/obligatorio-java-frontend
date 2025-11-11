# Troubleshooting: Error de Autenticación con gub.uy

## Error: `OIDC_ERROR` al intentar iniciar sesión

Si al intentar hacer login te redirige a:
```
https://mi-testing.iduruguay.gub.uy/error/?errorCode=OIDC_ERROR
```

### Causas Comunes y Soluciones

#### 1. **Redirect URI No Coincide (Causa Más Común)**

**Problema:** El `redirect_uri` configurado en el `.env` no coincide EXACTAMENTE con el registrado en gub.uy.

**Verificación:**
```env
# En tu .env debe ser:
OIDC_REDIRECT_URI=http://localhost:3000
```

**Importante:**
- ⚠️ NO debe terminar con `/` → `http://localhost:3000/` ❌
- ⚠️ NO debe incluir rutas → `http://localhost:3000/api/auth/callback` ❌
- ✅ Debe ser EXACTAMENTE → `http://localhost:3000` ✅
- ⚠️ `http` vs `https` importa - debe coincidir exactamente
- ⚠️ El puerto debe coincidir (3000)

**Solución:**
Verifica que en tu `.env` tengas:
```env
OIDC_REDIRECT_URI=http://localhost:3000
```

---

#### 2. **Cliente ID o Secret Incorrectos**

**Problema:** Las credenciales OAuth no son correctas o están mal copiadas.

**Verificación:**
```env
OIDC_CLIENT_ID=890192
OIDC_CLIENT_SECRET=457d52f181bf11804a3365b49ae4d29a2e03bbabe74997a2f510b179
```

**Solución:**
- Copia EXACTAMENTE del `.env.example`
- NO debe haber espacios al inicio o final
- Usa un editor de texto plano (VS Code, Notepad++)
- NO uses Word o editores que añadan caracteres invisibles

---

#### 3. **Puerto Diferente al Configurado**

**Problema:** El frontend está corriendo en un puerto diferente a `3000`.

**Verificación:**
Cuando ejecutas `npm run dev`, verifica la salida:
```bash
- Local:        http://localhost:3000  ✅ Correcto
- Local:        http://localhost:3001  ❌ Incorrecto (puerto diferente)
```

**Solución:**
Si está en otro puerto, hay dos opciones:

**Opción A:** Forzar el puerto 3000
```bash
# En package.json, modifica el script dev:
"dev": "next dev -p 3000"
```

**Opción B:** Cambiar el redirect_uri (NO recomendado para testing)
```env
# Si corre en 3001:
OIDC_REDIRECT_URI=http://localhost:3001
```
**NOTA:** Esto solo funcionará si tienes permisos para modificar la configuración en gub.uy.

---

#### 4. **Archivo .env No Cargado Correctamente**

**Problema:** Next.js no está leyendo el `.env`.

**Verificación:**
1. El archivo debe llamarse EXACTAMENTE `.env` (sin números ni sufijos)
2. Debe estar en la raíz del proyecto (junto a `package.json`)
3. Después de crear/modificar `.env`, debes **reiniciar el servidor**

**Solución:**
```bash
# Detén el servidor (Ctrl+C)
# Inicia nuevamente
npm run dev
```

**Estructura correcta:**
```
obligatorio-java-frontend/
├── .env                    ✅ Aquí
├── .env.example           ✅ Ejemplo
├── package.json
├── next.config.ts
└── app/
```

---

#### 5. **Variables de Entorno con Sintaxis Incorrecta**

**Problema:** Espacios, comillas o caracteres especiales en el `.env`.

**❌ Incorrecto:**
```env
OIDC_CLIENT_ID = 890192                          # Espacios alrededor del =
OIDC_CLIENT_SECRET="457d52f1..."                # Comillas innecesarias
OIDC_REDIRECT_URI=http://localhost:3000/        # Barra al final
```

**✅ Correcto:**
```env
OIDC_CLIENT_ID=890192
OIDC_CLIENT_SECRET=457d52f181bf11804a3365b49ae4d29a2e03bbabe74997a2f510b179
OIDC_REDIRECT_URI=http://localhost:3000
```

---

#### 6. **Scope Incorrecto**

**Problema:** El scope solicitado no coincide con lo autorizado.

**Verificación:**
```env
OIDC_SCOPE=openid document personal_info auth_info
```

**Solución:**
No modifiques el scope. Debe ser exactamente el que está en `.env.example`.

---

#### 7. **URLs de Endpoints Incorrectas**

**Problema:** Las URLs de autorización o token son incorrectas.

**Verificación:**
```env
OIDC_AUTHORIZE_URL=https://auth-testing.iduruguay.gub.uy/oidc/v1/authorize
OIDC_TOKEN_URL=https://auth-testing.iduruguay.gub.uy/oidc/v1/token
```

**Importante:**
- ⚠️ `auth-testing` para testing
- ⚠️ `auth` para producción (NO usar en desarrollo)
- ✅ Debe incluir `/oidc/v1/` en la ruta

---

## Proceso de Depuración Paso a Paso

### Paso 1: Verificar el .env

```bash
# Desde la raíz del proyecto:
cat .env
# o en Windows:
type .env
```

Compara línea por línea con `.env.example`.

### Paso 2: Reiniciar el Servidor

```bash
# Detener (Ctrl+C)
# Limpiar cache de Next.js
rm -rf .next
# o en Windows:
rmdir /s .next

# Iniciar de nuevo
npm run dev
```

### Paso 3: Verificar la URL de Autorización

Cuando hagas click en "Iniciar Sesión", **antes de que redirija**, abre las DevTools (F12) → Network → y verifica la URL a la que redirige.

Debe ser algo como:
```
https://auth-testing.iduruguay.gub.uy/oidc/v1/authorize
  ?client_id=890192
  &redirect_uri=http://localhost:3000      ← VERIFICA ESTO
  &response_type=code
  &scope=openid document personal_info auth_info
  &state=<uuid>
  &prompt=login
```

Si `redirect_uri` tiene algo diferente a `http://localhost:3000`, ahí está el problema.

### Paso 4: Verificar Variables en Runtime

Agrega temporalmente un console.log en el archivo de login:

**`app/api/auth/login/route.ts`** (línea 31-34):
```typescript
const clientId = process.env.OIDC_CLIENT_ID;
const redirectUri = process.env.OIDC_REDIRECT_URI;
console.log('=== DEBUG AUTH ===');
console.log('Client ID:', clientId);
console.log('Redirect URI:', redirectUri);
console.log('==================');
```

Mira la consola del servidor (terminal donde corre `npm run dev`) al hacer login.

---

## Checklist Rápido

- [ ] Archivo `.env` existe en la raíz del proyecto
- [ ] `.env` tiene EXACTAMENTE el mismo contenido que `.env.example`
- [ ] No hay espacios alrededor de los `=`
- [ ] No hay comillas en los valores
- [ ] `OIDC_REDIRECT_URI=http://localhost:3000` (sin barra final)
- [ ] El servidor corre en puerto 3000
- [ ] Reiniciaste el servidor después de crear/modificar `.env`
- [ ] Borraste la carpeta `.next`

---

## Si Nada Funciona

### Opción 1: Verificar con el Administrador OAuth

Es posible que el `client_id` y `client_secret` hayan caducado o sean específicos para ciertas IPs/dominios. Contacta al administrador del cliente OAuth en gub.uy.

### Opción 2: Crear Nuevo Cliente (Requiere Permisos)

Si tienes acceso al panel de gub.uy, puedes crear un nuevo cliente OAuth con:
- **Redirect URI:** `http://localhost:3000`
- **Grant Type:** `authorization_code`
- **Scopes:** `openid`, `document`, `personal_info`, `auth_info`

### Opción 3: Logs Detallados

Habilita logs detallados modificando temporalmente:

**`app/api/auth/login/route.ts`:**
```typescript
// Después de línea 54:
const authUrl = `${authorizeUrl}?${params.toString()}`;
console.log('Full Auth URL:', authUrl);
```

**`app/api/auth/callback/route.ts`:**
```typescript
// Después de línea 18:
console.log('Received code:', code);
console.log('All params:', Object.fromEntries(searchParams.entries()));
```

---

## Errores Relacionados

- **`no_code`** → gub.uy no devolvió código de autorización
- **`token_exchange_failed`** → Falló el intercambio de código por token (client_secret incorrecto)
- **`missing_config`** → Faltan variables de entorno en `.env`
- **`callback_failed`** → Error general en el callback

---

## Contacto

Si después de todos estos pasos sigue sin funcionar, puede ser un problema de configuración en el lado de gub.uy. Contacta al equipo que administra el cliente OAuth.
