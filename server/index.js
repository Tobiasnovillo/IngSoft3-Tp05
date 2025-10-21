const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Base de datos SQLite
const db = new sqlite3.Database('./database.sqlite');

// Crear tablas si no existen
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

  // Tabla de usuarios (simplificada)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insertar algunos productos de ejemplo solo si la tabla está vacía
  db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (err) {
      console.error('Error checking products count:', err);
      return;
    }
    
    if (row.count === 0) {
      console.log('Insertando productos de ejemplo...');
      db.run(`INSERT INTO products (name, description, price, image_url, category) VALUES 
        ('Laptop Gaming', 'Laptop potente para gaming', 1200.00, 'https://via.placeholder.com/300x200?text=Laptop', 'Electrónicos'),
        ('Smartphone', 'Teléfono inteligente último modelo', 800.00, 'https://via.placeholder.com/300x200?text=Smartphone', 'Electrónicos'),
        ('Auriculares', 'Auriculares inalámbricos con cancelación de ruido', 150.00, 'https://via.placeholder.com/300x200?text=Auriculares', 'Accesorios'),
        ('Libro de Programación', 'Guía completa de JavaScript', 45.00, 'https://via.placeholder.com/300x200?text=Libro', 'Libros'),
        ('Cafetera', 'Cafetera automática premium', 200.00, 'https://via.placeholder.com/300x200?text=Cafetera', 'Hogar')
      `, (err) => {
        if (err) {
          console.error('Error inserting sample products:', err);
        } else {
          console.log('Productos de ejemplo insertados correctamente');
        }
      });
    } else {
      console.log(`Base de datos ya contiene ${row.count} productos. No se insertarán productos de ejemplo.`);
    }
  });
});

// Rutas

// Obtener todos los productos
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Obtener un producto por ID
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }
    res.json(row);
  });
});

// Crear un nuevo producto
app.post('/api/products', (req, res) => {
  const { name, description, price, image_url, category } = req.body;
  
  if (!name || !price) {
    res.status(400).json({ error: 'Nombre y precio son requeridos' });
    return;
  }

  db.run(
    'INSERT INTO products (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)',
    [name, description, price, image_url || 'https://via.placeholder.com/300x200?text=Producto', category || 'General'],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ 
        id: this.lastID, 
        message: 'Producto creado exitosamente',
        product: { id: this.lastID, name, description, price, image_url, category }
      });
    }
  );
});

// Actualizar un producto
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, price, image_url, category } = req.body;
  
  db.run(
    'UPDATE products SET name = ?, description = ?, price = ?, image_url = ?, category = ? WHERE id = ?',
    [name, description, price, image_url, category, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Producto no encontrado' });
        return;
      }
      res.json({ message: 'Producto actualizado exitosamente' });
    }
  );
});

// Eliminar un producto
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }
    res.json({ message: 'Producto eliminado exitosamente' });
  });
});

// Obtener categorías
app.get('/api/categories', (req, res) => {
  db.all('SELECT DISTINCT category FROM products WHERE category IS NOT NULL', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => row.category));
  });
});

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`API disponible en http://localhost:${PORT}/api`);
});

// Cerrar conexión a la base de datos al cerrar la aplicación
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Conexión a la base de datos cerrada.');
    process.exit(0);
  });
});
