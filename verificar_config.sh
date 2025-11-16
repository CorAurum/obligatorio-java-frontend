#!/bin/bash

echo "========================================"
echo "VERIFICACION DE CONFIGURACION - FRONTEND"
echo "========================================"
echo ""

echo "[1/5] Verificando archivo .env..."
if [ -f .env ]; then
    echo "✓ Archivo .env existe"
    echo ""
    echo "Contenido del .env:"
    cat .env
else
    echo "✗ ERROR: Archivo .env NO existe"
    echo "SOLUCION: Ejecuta: cp .env.example .env"
fi
echo ""
echo "========================================"
echo ""

echo "[2/5] Verificando Backend en puerto 8080..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/CompC-1.0-SNAPSHOT/api/administradores)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Backend responde correctamente (HTTP $HTTP_CODE)"
else
    echo "✗ ERROR: Backend NO responde (HTTP $HTTP_CODE)"
    echo "SOLUCION: Inicia WildFly"
fi
echo ""
echo "========================================"
echo ""

echo "[3/5] Verificando puerto 8080..."
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✓ Puerto 8080 en uso"
    lsof -Pi :8080 -sTCP:LISTEN
else
    echo "✗ Puerto 8080 NO en uso - Backend no esta corriendo"
fi
echo ""
echo "========================================"
echo ""

echo "[4/5] Verificando carpeta node_modules..."
if [ -d node_modules ]; then
    echo "✓ node_modules existe"
else
    echo "✗ ERROR: node_modules NO existe"
    echo "SOLUCION: Ejecuta: npm install"
fi
echo ""
echo "========================================"
echo ""

echo "[5/5] Verificando carpeta .next..."
if [ -d .next ]; then
    echo "✓ .next existe"
    echo "NOTA: Si acabas de crear/modificar .env, borra esta carpeta:"
    echo "  rm -rf .next"
else
    echo "ℹ .next NO existe (se creara al ejecutar npm run dev)"
fi
echo ""
echo "========================================"
echo ""

echo "RESUMEN:"
echo "- Si Backend responde: ✓ OK"
echo "- Si .env existe: ✓ OK"
echo "- Si ambos OK: Reinicia frontend con: npm run dev"
echo ""
echo "Si sigue sin funcionar, revisa: DIAGNOSTICO_FETCH_ERROR.md"
echo ""
