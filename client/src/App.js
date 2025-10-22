import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';



// Placeholder local en data URI para evitar dependencias externas y loops de onError
const buildPlaceholderDataUri = (width = 300, height = 200, text = 'Imagen no disponible') => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>` +
    `<rect width='100%' height='100%' fill='#e5e7eb'/>` +
    `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' ` +
    `font-family='sans-serif' font-size='16' fill='#6b7280'>${text}</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};
const PLACEHOLDER_IMG = buildPlaceholderDataUri(300, 200, 'Sin imagen');

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: ''
  });

  // Cargar productos al montar el componente
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/products`);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los productos');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category: ''
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      setError('Nombre y precio son requeridos');
      return;
    }

    try {
      if (editingProduct) {
        // Actualizar producto existente
        await axios.put(`${API_BASE_URL}/products/${editingProduct.id}`, formData);
        setSuccess('Producto actualizado exitosamente');
      } else {
        // Crear nuevo producto
        await axios.post(`${API_BASE_URL}/products`, formData);
        setSuccess('Producto agregado exitosamente');
      }

      resetForm();
      fetchProducts();
    } catch (err) {
      setError('Error al guardar el producto');
      console.error('Error saving product:', err);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      image_url: product.image_url || '',
      category: product.category || ''
    });
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await axios.delete(`${API_BASE_URL}/products/${productId}`);
        setSuccess('Producto eliminado exitosamente');
        fetchProducts();
      } catch (err) {
        setError('Error al eliminar el producto');
        console.error('Error deleting product:', err);
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <h1>🛍️ MiniShop</h1>
          <p>Tu mini marketplace personal</p>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          {error && (
            <div className="error">
              {error}
              <button onClick={() => setError(null)} style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>×</button>
            </div>
          )}

          {success && (
            <div className="success">
              {success}
              <button onClick={() => setSuccess(null)} style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>×</button>
            </div>
          )}

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <button
              className="btn"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Cancelar' : '➕ Agregar Producto'}
            </button>
          </div>

          {showAddForm && (
            <div className="add-product-form">
              <h2 className="form-title">
                {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Nombre del Producto *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ej: iPhone 14"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Descripción</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe tu producto..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="price">Precio (€) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="999.99"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="image_url">URL de la Imagen</label>
                  <input
                    type="url"
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Categoría</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="Electrónicos">Electrónicos</option>
                    <option value="Ropa">Ropa</option>
                    <option value="Hogar">Hogar</option>
                    <option value="Libros">Libros</option>
                    <option value="Deportes">Deportes</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button type="submit" className="btn">
                    {editingProduct ? 'Actualizar Producto' : 'Agregar Producto'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForm}
                    style={{ marginLeft: '1rem' }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="loading">Cargando productos...</div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <h3>No hay productos disponibles</h3>
              <p>¡Agrega tu primer producto para comenzar!</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <img
                    src={product.image_url || PLACEHOLDER_IMG}
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.dataset.fallbackApplied === 'true') return; // evita loop
                      img.dataset.fallbackApplied = 'true';
                      img.src = PLACEHOLDER_IMG;
                    }}
                  />
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    {product.description && (
                      <p className="product-description">{product.description}</p>
                    )}
                    <div className="product-price">{formatPrice(product.price)}</div>
                    {product.category && (
                      <span className="product-category">{product.category}</span>
                    )}
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-small"
                        onClick={() => handleEdit(product)}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(product.id)}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
