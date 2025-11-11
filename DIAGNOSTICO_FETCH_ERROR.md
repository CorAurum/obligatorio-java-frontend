# Diagnóstico: "Failed to fetch" en checkIsAdmin

## Error Reportado

```
TypeError: Failed to fetch
at BackendAPI.checkIsAdmin (lib/api/backend.ts:183:28)
at checkRoleAndRedirect (app/auth-redirect/page.tsx:36:42)
```

Este error ocurre cuando el frontend **NO puede conectarse al backend**.

---

## Causas Comunes y Soluciones

### ❌ Causa #1: Backend NO está corriendo (90% de los casos)

**Síntoma:** El frontend intenta conectarse a `http://localhost:8080` pero el backend no responde.

**Verificación:**
```bash
# Intenta acceder al backend directamente:
curl http://localhost:8080/CompC-1.0-SNAPSHOT/api/administradores

# O desde el navegador:
http://localhost:8080/CompC-1.0-SNAPSHOT/api/administradores
```

**Resultado Esperado:** Debe devolver un JSON con la lista de administradores.

**Si no funciona:** El backend NO está corriendo.

**Solución:**
1. Ir a la carpeta del backend
2. Iniciar WildFly:
   ```bash
   cd "c:\Users\[USUARIO]\...\proyecto java\wildfly-38.0.0.Final\bin"
   standalone.bat
   # O en Linux/Mac:
   ./standalone.sh
   ```
3. Esperar a que WildFly esté completamente iniciado (mensaje: "WildFly Full XX started")
4. Verificar que la aplicación esté desplegada
5. Reintentar el login en el frontend

---

### ❌ Causa #2: Variable de Entorno Mal Configurada

**Síntoma:** El `.env` tiene una URL incorrecta o no existe.

**Verificación:**

1. Abrir el archivo `.env` en la raíz del proyecto frontend
2. Verificar que contenga:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/CompC-1.0-SNAPSHOT/api
   ```

**Errores comunes:**

❌ **Falta el archivo:**
```
# NO existe .env
```
**Solución:** Crear `.env` copiando de `.env.example`

❌ **URL incorrecta:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api     # ❌ Puerto incorrecto
NEXT_PUBLIC_API_URL=localhost:8080                # ❌ Falta http://
NEXT_PUBLIC_API_URL=http://localhost:8080/api     # ❌ Falta /CompC-1.0-SNAPSHOT
```

✅ **URL correcta:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/CompC-1.0-SNAPSHOT/api
```

**Solución:**
1. Copiar `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
2. Verificar que `NEXT_PUBLIC_API_URL` sea exacta
3. **REINICIAR el servidor de Next.js** (Ctrl+C y `npm run dev`)

---

### ❌ Causa #3: No Reinició el Frontend Después de Crear .env

**Síntoma:** Creó el `.env` pero Next.js sigue usando valores antiguos.

**Problema:** Next.js solo lee las variables de entorno al iniciar.

**Solución:**
```bash
# Detener el servidor (Ctrl+C)

# Borrar cache de Next.js
rm -rf .next
# En Windows:
rmdir /s .next

# Reiniciar
npm run dev
```

---

### ❌ Causa #4: CORS Bloqueando la Petición

**Síntoma:** El backend está corriendo pero bloquea las peticiones del frontend.

**Verificación:**
1. Abrir DevTools del navegador (F12)
2. Ir a la pestaña "Console"
3. Buscar errores de CORS como:
   ```
   Access to fetch at 'http://localhost:8080/...' from origin 'http://localhost:3000'
   has been blocked by CORS policy
   ```

**Solución:**

El backend debe tener CORS habilitado para `http://localhost:3000`.

Verificar en el backend que exista un filtro CORS:
```java
// En el backend debe haber algo como:
@WebFilter("/*")
public class CorsFilter implements Filter {
    response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    // ...
}
```

---

### ❌ Causa #5: Firewall o Antivirus Bloqueando

**Síntoma:** El backend corre pero el sistema operativo bloquea la conexión.

**Verificación:**
```bash
# Desde la misma máquina, intentar:
curl http://localhost:8080/CompC-1.0-SNAPSHOT/api/administradores

# Si funciona en curl pero no en el navegador → problema de CORS
# Si NO funciona ni en curl → problema de red/firewall
```

**Solución:**
- Desactivar temporalmente el firewall para probar
- Agregar excepción para puerto 8080 y 3000
- Verificar que no haya otro proceso usando el puerto 8080

---

### ❌ Causa #6: Backend en Otra Máquina/IP

**Síntoma:** Tu compañero tiene el backend en otra computadora o IP diferente.

**Verificación:**
```bash
# ¿El backend está en otra máquina?
# Entonces NEXT_PUBLIC_API_URL debe apuntar a esa IP:
NEXT_PUBLIC_API_URL=http://192.168.1.100:8080/CompC-1.0-SNAPSHOT/api
```

**Solución:**
1. Averiguar la IP del backend:
   ```bash
   # En la máquina del backend:
   ipconfig      # Windows
   ifconfig      # Linux/Mac
   ```
2. Actualizar `.env` con la IP correcta:
   ```env
   NEXT_PUBLIC_API_URL=http://[IP-DEL-BACKEND]:8080/CompC-1.0-SNAPSHOT/api
   ```
3. Reiniciar frontend

---

## Diagnóstico Paso a Paso

### Paso 1: Verificar que el Backend Esté Corriendo

```bash
# Desde la terminal o navegador:
curl http://localhost:8080/CompC-1.0-SNAPSHOT/api/administradores

# O abrir en navegador:
http://localhost:8080/CompC-1.0-SNAPSHOT/api/administradores
```

**Resultado esperado:**
```json
[
  {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "cedula": "12345678",
    "activo": true,
    ...
  }
]
```

**Si sale error 404 o conexión rechazada:**
→ El backend NO está corriendo → **Iniciar WildFly**

---

### Paso 2: Verificar Variables de Entorno

```bash
# En la raíz del proyecto frontend:
cat .env
# Windows:
type .env
```

**Debe mostrar:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/CompC-1.0-SNAPSHOT/api
```

**Si el archivo no existe:**
```bash
cp .env.example .env
```

**Si existe pero está mal:**
→ Corregir y reiniciar Next.js

---

### Paso 3: Verificar en Runtime

Agregar temporalmente un `console.log` para ver qué URL se está usando:

**Archivo:** `lib/api/backend.ts` (línea 84)

```typescript
constructor() {
  this.baseURL = API_BASE_URL;
  console.log('🔍 Backend API URL:', this.baseURL);  // ← AGREGAR ESTA LÍNEA
}
```

Luego:
1. Reiniciar el frontend
2. Abrir el navegador con DevTools (F12)
3. Ir a la pestaña "Console"
4. Recargar la página
5. Buscar el mensaje: `🔍 Backend API URL: http://localhost:8080/CompC-1.0-SNAPSHOT/api`

**Si la URL es incorrecta:**
→ Problema con `.env` → Verificar y reiniciar

---

### Paso 4: Probar Endpoint Específico

```bash
# Probar el endpoint exacto que falla:
curl http://localhost:8080/CompC-1.0-SNAPSHOT/api/administradores/cedula/54780319

# Reemplaza 54780319 con la cédula de tu compañero
```

**Resultado esperado:**
```json
{
  "id": 3,
  "nombre": "Ignacio",
  "apellido": "Gonzalez Pereira",
  "cedula": "54780319",
  "activo": true,
  ...
}
```

**Si devuelve 404:**
→ El admin no existe en la base de datos → **Crear el admin**

---

## Checklist de Verificación

Pídele a tu compañero que verifique:

- [ ] **Backend corriendo**: `curl http://localhost:8080/CompC-1.0-SNAPSHOT/api/administradores` funciona
- [ ] **Archivo `.env` existe** en la raíz del proyecto frontend
- [ ] **`NEXT_PUBLIC_API_URL`** en `.env` es exactamente: `http://localhost:8080/CompC-1.0-SNAPSHOT/api`
- [ ] **Reinició el frontend** después de crear/modificar `.env`
- [ ] **Borró la carpeta `.next`** para limpiar cache
- [ ] **No hay errores de CORS** en la consola del navegador (F12)
- [ ] **Puerto 8080 no está bloqueado** por firewall
- [ ] **Su cédula existe** en `ccbd.administrador` con `activo=true`

---

## Comandos de Verificación Rápida

```bash
# 1. Verificar backend
curl http://localhost:8080/CompC-1.0-SNAPSHOT/api/administradores

# 2. Verificar .env
cat .env | grep NEXT_PUBLIC_API_URL

# 3. Limpiar y reiniciar frontend
rm -rf .next && npm run dev

# 4. Verificar admin en BD (desde psql)
psql -U postgres -d hcen_db -c "SELECT * FROM ccbd.administrador WHERE cedula = 'XXXXXXXX';"
```

---

## Solución Más Común (90%)

La mayoría de las veces el problema es:

### 🔴 El backend NO está corriendo

**Solución:**
```bash
cd "c:\Users\[USUARIO]\...\proyecto java\wildfly-38.0.0.Final\bin"
standalone.bat

# Esperar el mensaje:
# "WildFly Full XX.X.X.Final started in XXXXms"
```

Luego reintentar el login.

---

## Prueba Definitiva

Si nada funciona, pídele que ejecute esto y te envíe los resultados:

```bash
# Test 1: Backend
echo "=== TEST BACKEND ==="
curl http://localhost:8080/CompC-1.0-SNAPSHOT/api/administradores

# Test 2: .env
echo "=== TEST .ENV ==="
cat .env

# Test 3: Puerto
echo "=== TEST PUERTO 8080 ==="
netstat -ano | findstr :8080

# Test 4: Admin en BD
echo "=== TEST ADMIN BD ==="
psql -U postgres -d hcen_db -c "SELECT id, nombre, cedula, activo FROM ccbd.administrador;"
```

Con esos 4 outputs puedes identificar exactamente dónde está el problema.

---

## Diferencia: ¿Por qué funciona para ti pero no para él?

Posibles razones:

1. **Tu backend está corriendo, el suyo no**
2. **Tu `.env` está bien configurado, el suyo no**
3. **Tú reiniciaste Next.js después de crear `.env`, él no**
4. **Tu firewall permite puerto 8080, el suyo no**
5. **Ustedes están usando IPs/máquinas diferentes**

La diferencia NO está en el código (es el mismo), está en la **configuración del entorno**.

---

**Última actualización:** 2025-11-10
