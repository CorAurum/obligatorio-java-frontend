# Solución Rápida: "Failed to fetch" o "No me reconoce como admin"

## 🚨 Problema: "Failed to fetch" al intentar loguearse

### Causa #1 (90%): Backend NO está corriendo

**Verificar:**
```bash
# Abre este link en el navegador:
http://localhost:8080/CompC-1.0-SNAPSHOT/api/administradores
```

**Si NO funciona → Backend apagado**

**Solución:**
```bash
# Windows:
cd "c:\Users\[TU_USUARIO]\...\proyecto java\wildfly-38.0.0.Final\bin"
standalone.bat

# Linux/Mac:
cd ~/proyecto java/wildfly-38.0.0.Final/bin
./standalone.sh
```

Esperar mensaje: `"WildFly Full started"` y reintentar login.

---

### Causa #2 (9%): Falta el archivo .env

**Verificar:**
```bash
# ¿Existe el archivo .env?
ls .env      # Linux/Mac
dir .env     # Windows
```

**Si NO existe:**

**Solución:**
```bash
# Copiar desde el ejemplo
cp .env.example .env    # Linux/Mac
copy .env.example .env  # Windows

# REINICIAR el frontend
npm run dev
```

---

### Causa #3 (1%): Frontend no reiniciado

**Si creaste `.env` pero sigue fallando:**

**Solución:**
```bash
# Detener frontend (Ctrl+C)

# Borrar cache
rm -rf .next     # Linux/Mac
rmdir /s .next   # Windows

# Reiniciar
npm run dev
```

---

## 🚨 Problema: "No me reconoce como admin"

### Verificar que existes en la base de datos

**Necesitas saber tu cédula de gub.uy primero.**

```bash
# Conecta a PostgreSQL
psql -U postgres -d hcen_db

# Busca tu admin por cédula (reemplaza 12345678)
SELECT * FROM ccbd.administrador WHERE cedula = '12345678';
```

**Si NO devuelve nada → No estás registrado**

**Solución: Crear admin**

```sql
INSERT INTO ccbd.administrador (nombre, apellido, email, telefono, cedula, fecha_alta, activo)
VALUES ('TuNombre', 'TuApellido', 'tu@email.com', '+598 99 123 456', 'TU_CEDULA', NOW(), true);

-- Verificar
SELECT * FROM ccbd.administrador WHERE cedula = 'TU_CEDULA';
```

**IMPORTANTE:** La cédula debe ser:
- Sin puntos ni guiones
- Ejemplo correcto: `54780319`
- Ejemplo incorrecto: `5.478.031-9`

---

## Script de Verificación Automática

Ejecuta este script para diagnosticar automáticamente:

**Windows:**
```bash
verificar_config.bat
```

**Linux/Mac:**
```bash
chmod +x verificar_config.sh
./verificar_config.sh
```

---

## Checklist de 30 Segundos

- [ ] Backend corriendo → Abrir: http://localhost:8080/CompC-1.0-SNAPSHOT/api/administradores
- [ ] Archivo `.env` existe en la raíz del proyecto
- [ ] Reinicié frontend después de crear `.env`
- [ ] Mi cédula está en `ccbd.administrador` con `activo=true`

**Si los 4 están ✓ → Debería funcionar**

---

## Comandos de Emergencia

```bash
# 1. Limpiar todo y empezar de cero
rm -rf .next node_modules
npm install
cp .env.example .env
npm run dev

# 2. Verificar backend
curl http://localhost:8080/CompC-1.0-SNAPSHOT/api/administradores

# 3. Verificar admin en BD
psql -U postgres -d hcen_db -c "SELECT * FROM ccbd.administrador WHERE cedula = 'TU_CEDULA';"
```

---

## ¿Sigue sin funcionar?

Lee la guía completa: **[DIAGNOSTICO_FETCH_ERROR.md](./DIAGNOSTICO_FETCH_ERROR.md)**

O contacta al equipo con los resultados de:
```bash
# Ejecuta y envía el output:
./verificar_config.sh      # Linux/Mac
verificar_config.bat        # Windows
```
