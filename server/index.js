// =============================
// 🛠️ DEPENDENCIAS
// =============================
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// =============================
// ⚙️ MIDDLEWARE
// =============================
const allowedOrigins = [
  'https://myshop1.azurewebsites.net',       // frontend QA
  'https://myshop1prod.azurewebsites.net',   // frontend PROD
  'http://localhost:3000'                    // para desarrollo local
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('❌ Bloqueado por CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// =============================
// 🗄️ BASE DE DATOS SQLITE (aislada por entorno)
// =============================
const SITE_NAME = process.env.WEBSITE_SITE_NAME || 'local';
const DATA_DIR = process.env.DATA_DIR || path.join('/home', 'site', 'wwwroot', 'data', SITE_NAME);

// Crear carpeta de datos si no existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`📁 Carpeta de datos creada: ${DATA_DIR}`);
}

// Ruta de la base de datos (por entorno o por sitio)
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, `${SITE_NAME}.sqlite`);

console.log('🧠 NODE_ENV:', process.env.NODE_ENV);
console.log('🌐 WEBSITE_SITE_NAME:', SITE_NAME);
console.log('📁 DATA_DIR:', DATA_DIR);
console.log('🗂️ DB_PATH:', DB_PATH);

// Conectar o crear base SQLite
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('❌ Error al abrir la base de datos:', err);
  else console.log(`✅ Base de datos SQLite abierta en: ${DB_PATH}`);
});

// =============================
// 🧱 CREAR TABLAS SI NO EXISTEN
// =============================
db.serialize(() => {
  // Tabla de productos
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image_url TEXT,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabla de usuarios (opcional)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insertar productos de ejemplo solo si está vacía
  db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (err) {
      console.error('Error al verificar productos:', err);
      return;
    }

    if (row.count === 0) {
      console.log('🌱 Insertando productos de ejemplo...');
      db.run(`INSERT INTO products (name, description, price, image_url, category) VALUES 
        ('Laptop Gaming', 'Laptop potente para gaming', 1200.00, 'https://via.placeholder.com/300x200?text=Laptop', 'Electrónicos'),
        ('Smartphone', 'Teléfono inteligente último modelo', 800.00, 'https://via.placeholder.com/300x200?text=Smartphone', 'Electrónicos'),
        ('Auriculares', 'Auriculares inalámbricos con cancelación de ruido', 150.00, 'https://via.placeholder.com/300x200?text=Auriculares', 'Accesorios'),
        ('Libro de Programación', 'Guía completa de JavaScript', 45.00, 'https://via.placeholder.com/300x200?text=Libro', 'Libros'),
        ('Cafetera', 'Cafetera automática premium', 200.00, 'https://via.placeholder.com/300x200?text=Cafetera', 'Hogar')
      `, (err) => {
        if (err) console.error('Error insertando productos de ejemplo:', err);
        else console.log('✅ Productos de ejemplo insertados correctamente');
      });
    } else {
      console.log(`📦 Base de datos ya contiene ${row.count} productos.`);
    }
  });
});

// =============================
// 📡 ENDPOINTS API
// =============================

// Obtener todos los productos
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Obtener producto por ID
app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(row);
  });
});

// Crear nuevo producto
app.post('/api/products', (req, res) => {
  const { name, description, price, image_url, category } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Nombre y precio son requeridos' });

  db.run(
    'INSERT INTO products (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)',
    [name, description, price, image_url || 'https://via.placeholder.com/300x200?text=Producto', category || 'General'],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, message: 'Producto creado exitosamente' });
    }
  );
});

// Actualizar producto
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, price, image_url, category } = req.body;
  db.run(
    'UPDATE products SET name=?, description=?, price=?, image_url=?, category=? WHERE id=?',
    [name, description, price, image_url, category, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json({ message: 'Producto actualizado exitosamente' });
    }
  );
});

// Eliminar producto
app.delete('/api/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado exitosamente' });
  });
});

// Obtener categorías
app.get('/api/categories', (req, res) => {
  db.all('SELECT DISTINCT category FROM products WHERE category IS NOT NULL', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(row => row.category));
  });
});

// =============================
// 💓 HEALTH CHECK
// =============================
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// =============================
// 🌐 SERVIR FRONTEND (producción)
// =============================
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, 'public');
  app.use(express.static(clientBuildPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// =============================
// 🚀 INICIAR SERVIDOR
// =============================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 API disponible en http://localhost:${PORT}/api`);
});

// =============================
// 🔒 CERRAR CONEXIÓN SQLITE
// =============================
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) console.error(err.message);
    console.log('🔒 Conexión SQLite cerrada.');
    process.exit(0);
  });
});
