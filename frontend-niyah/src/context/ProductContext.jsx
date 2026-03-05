import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';

const ProductContext = createContext(null);
const CACHE_KEY = 'niyah_products_cache';

function loadCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {}
}

export function ProductProvider({ children }) {
  // Seed state from cache so the page is never blank on refresh
  const [products, setProducts] = useState(() => loadCache() ?? []);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  async function refreshProducts() {
    setLoading(true);
    setError('');

    // Show cache immediately so there's no blank flash
    const cached = loadCache();
    if (cached) {
      setProducts(cached);
      setLoading(false);   // show cached content right away
    }

    // Fetch fresh data silently in background
    try {
      const data = await apiRequest('/products');
      const list = Array.isArray(data) ? data : [];
      setProducts(list);
      saveCache(list);
    } catch (err) {
      // Only show error if there's nothing to display
      if (!cached) setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createProduct(payload, token) {
    const created = await apiRequest('/products', { method: 'POST', body: payload, token });
    setProducts((prev) => {
      const next = [created, ...prev];
      saveCache(next);
      return next;
    });
    return created;
  }

  async function updateProduct(id, payload, token) {
    const updated = await apiRequest(`/products/${id}`, { method: 'PUT', body: payload, token });
    setProducts((prev) => {
      const next = prev.map((item) => (item._id === id ? updated : item));
      saveCache(next);
      return next;
    });
    return updated;
  }

  async function deleteProduct(id, token) {
    await apiRequest(`/products/${id}`, { method: 'DELETE', token });
    setProducts((prev) => {
      const next = prev.filter((item) => item._id !== id);
      saveCache(next);
      return next;
    });
  }

  const featuredProduct = useMemo(() => (products.length ? products[0] : null), [products]);

  return (
    <ProductContext.Provider
      value={{ products, featuredProduct, loading, error, refreshProducts, createProduct, updateProduct, deleteProduct }}
    >
      {children}
    </ProductContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProduct() {
  return useContext(ProductContext);
}
