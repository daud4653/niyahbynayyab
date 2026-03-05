import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function refreshProducts() {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/products');
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refreshProducts(); }, []);

  async function createProduct(payload, token) {
    const created = await apiRequest('/products', { method: 'POST', body: payload, token });
    setProducts((prev) => [created, ...prev]);
    return created;
  }

  async function updateProduct(id, payload, token) {
    const updated = await apiRequest(`/products/${id}`, { method: 'PUT', body: payload, token });
    setProducts((prev) => prev.map((item) => (item._id === id ? updated : item)));
    return updated;
  }

  async function deleteProduct(id, token) {
    await apiRequest(`/products/${id}`, { method: 'DELETE', token });
    setProducts((prev) => prev.filter((item) => item._id !== id));
  }

  const featuredProduct = useMemo(() => (products.length ? products[0] : null), [products]);

  return (
    <ProductContext.Provider value={{ products, featuredProduct, loading, error, refreshProducts, createProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  return useContext(ProductContext);
}
