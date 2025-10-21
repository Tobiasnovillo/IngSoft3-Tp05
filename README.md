# 🛍️ MiniShop - Mini Marketplace

Un mini marketplace completo con frontend React, backend Node.js/Express y base de datos SQLite.

## ✨ Características

- **Frontend**: React con diseño moderno y responsivo
- **Backend**: Node.js con Express
- **Base de datos**: SQLite (fácil de usar, no requiere instalación)
- **Funcionalidades**:
  - Ver productos existentes
  - Agregar nuevos productos
  - Editar productos existentes
  - Eliminar productos
  - Categorización de productos
  - Diseño responsivo para móviles

## 🚀 Instalación y Ejecución

### Opción 1: Ejecución Automática (Recomendada)

1. **Instalar todas las dependencias**:
   ```bash
   npm run install-all
   ```

2. **Ejecutar el proyecto completo** (frontend + backend):
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

### Opción 2: Ejecución Manual

#### Backend
```bash
cd server
npm install
npm run dev
```

#### Frontend (en otra terminal)
```bash
cd client
npm install
npm start
```

## 📁 Estructura del Proyecto

```
minishop/
├── client/                 # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── App.js         # Componente principal
│   │   ├── App.css        # Estilos del componente
│   │   ├── index.js       # Punto de entrada
│   │   └── index.css      # Estilos globales
│   └── package.json
├── server/                 # Backend Node.js
│   ├── index.js           # Servidor Express
│   └── package.json
├── database.sqlite        # Base de datos (se crea automáticamente)
├── package.json           # Scripts principales
└── README.md
```

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18**: Framework de UI
- **Axios**: Cliente HTTP para API calls
- **CSS3**: Estilos modernos con gradientes y animaciones

### Backend
- **Node.js**: Runtime de JavaScript
- **Express**: Framework web
- **SQLite3**: Base de datos ligera
- **CORS**: Para comunicación frontend-backend

## 📋 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/products` | Obtener todos los productos |
| GET | `/api/products/:id` | Obtener un producto por ID |
| POST | `/api/products` | Crear un nuevo producto |
| PUT | `/api/products/:id` | Actualizar un producto |
| DELETE | `/api/products/:id` | Eliminar un producto |
| GET | `/api/categories` | Obtener todas las categorías |

## 🎨 Características del Diseño

- **Diseño moderno**: Gradientes y sombras suaves
- **Responsive**: Funciona en desktop, tablet y móvil
- **Animaciones**: Transiciones suaves y efectos hover
- **UX intuitiva**: Formularios claros y feedback visual
- **Colores**: Paleta profesional con azules y púrpuras

## 📱 Funcionalidades

### Para Usuarios
- ✅ Ver catálogo de productos
- ✅ Filtrar por categorías
- ✅ Agregar nuevos productos
- ✅ Editar productos existentes
- ✅ Eliminar productos
- ✅ Interfaz intuitiva y moderna

### Características Técnicas
- ✅ Base de datos SQLite (sin configuración)
- ✅ API REST completa
- ✅ Manejo de errores
- ✅ Validación de formularios
- ✅ Diseño responsivo
- ✅ Carga automática de datos

## 🔧 Scripts Disponibles

```bash
# Instalar todas las dependencias
npm run install-all

# Ejecutar frontend y backend simultáneamente
npm run dev

# Solo backend
npm run server

# Solo frontend
npm run client

# Construir para producción
npm run build

# Ejecutar en producción
npm start
```

## 🌟 Productos de Ejemplo

El sistema viene con productos de ejemplo pre-cargados:
- Laptop Gaming (€1,200.00)
- Smartphone (€800.00)
- Auriculares (€150.00)
- Libro de Programación (€45.00)
- Cafetera (€200.00)

## 🚀 Despliegue en Producción

Para desplegar en producción:

1. **Construir el frontend**:
   ```bash
   npm run build
   ```

2. **Configurar variables de entorno**:
   ```bash
   export NODE_ENV=production
   ```

3. **Ejecutar el servidor**:
   ```bash
   npm start
   ```

## 🐛 Solución de Problemas

### Puerto ya en uso
Si el puerto 3000 o 5000 están ocupados:
```bash
# Cambiar puerto del frontend
cd client
PORT=3001 npm start

# Cambiar puerto del backend
cd server
PORT=5001 npm run dev
```

### Error de CORS
El backend ya tiene CORS configurado, pero si hay problemas:
- Verificar que el frontend esté en http://localhost:3000
- Verificar que el backend esté en http://localhost:5000

### Base de datos
La base de datos SQLite se crea automáticamente. Si hay problemas:
- Verificar permisos de escritura en la carpeta del proyecto
- Eliminar `database.sqlite` para recrear la base de datos

## 📄 Licencia

MIT License - Libre para uso personal y comercial.

---

¡Disfruta tu mini marketplace! 🎉
