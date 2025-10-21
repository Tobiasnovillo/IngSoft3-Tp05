#!/bin/bash

# Script para ejecutar MiniShop fácilmente
echo "🛍️ Iniciando MiniShop..."

# Configurar PATH para Node.js
export PATH="/Users/tobiasnovillo/Documents/Tp05/node-v20.11.0-darwin-x64/bin:$PATH"

# Verificar que Node.js esté disponible
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no encontrado. Por favor ejecuta:"
    echo "export PATH=\"/Users/tobiasnovillo/Documents/Tp05/node-v20.11.0-darwin-x64/bin:\$PATH\""
    exit 1
fi

echo "✅ Node.js $(node --version) encontrado"
echo "✅ npm $(npm --version) encontrado"

# Cambiar al directorio del proyecto
cd /Users/tobiasnovillo/Documents/Tp05

echo "🚀 Iniciando servidores..."
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000/api"
echo ""
echo "Presiona Ctrl+C para detener los servidores"
echo ""

# Ejecutar el proyecto
npm run dev
