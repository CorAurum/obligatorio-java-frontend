@echo off
echo ========================================
echo VERIFICACION DE CONFIGURACION - FRONTEND
echo ========================================
echo.

echo [1/5] Verificando archivo .env...
if exist .env (
    echo ✓ Archivo .env existe
    echo.
    echo Contenido del .env:
    type .env
) else (
    echo ✗ ERROR: Archivo .env NO existe
    echo SOLUCION: Ejecuta: copy .env.example .env
)
echo.
echo ========================================
echo.

echo [2/5] Verificando Backend en puerto 8080...
curl -s -o nul -w "HTTP Status: %%{http_code}\n" http://localhost:8080/CompC-1.0-SNAPSHOT/api/administradores
if %ERRORLEVEL% EQU 0 (
    echo ✓ Backend responde correctamente
) else (
    echo ✗ ERROR: Backend NO responde
    echo SOLUCION: Inicia WildFly
)
echo.
echo ========================================
echo.

echo [3/5] Verificando puerto 8080...
netstat -ano | findstr :8080
if %ERRORLEVEL% EQU 0 (
    echo ✓ Puerto 8080 en uso
) else (
    echo ✗ Puerto 8080 NO en uso - Backend no esta corriendo
)
echo.
echo ========================================
echo.

echo [4/5] Verificando carpeta node_modules...
if exist node_modules (
    echo ✓ node_modules existe
) else (
    echo ✗ ERROR: node_modules NO existe
    echo SOLUCION: Ejecuta: npm install
)
echo.
echo ========================================
echo.

echo [5/5] Verificando carpeta .next...
if exist .next (
    echo ✓ .next existe
    echo NOTA: Si acabas de crear/modificar .env, borra esta carpeta:
    echo   rmdir /s .next
) else (
    echo ℹ .next NO existe (se creara al ejecutar npm run dev)
)
echo.
echo ========================================
echo.

echo RESUMEN:
echo - Si Backend responde: ✓ OK
echo - Si .env existe: ✓ OK
echo - Si ambos OK: Reinicia frontend con: npm run dev
echo.
echo Si sigue sin funcionar, revisa: DIAGNOSTICO_FETCH_ERROR.md
echo.
pause
