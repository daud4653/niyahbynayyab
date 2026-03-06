import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'niyah_cart';

function parsePrice(str) {
  return parseInt(String(str).replace(/,/g, ''), 10) || 0;
}

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);   // load from localStorage on first render
  const [isOpen, setIsOpen] = useState(false);

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  function addItem(product, size = null) {
    const productId = product._id || product.id;
    const cartId = `${productId}-${size ?? 'one-size'}`;
    const sizeInv = product.sizeInventory || {};
    const inventory = size && sizeInv[size] !== undefined
      ? sizeInv[size]
      : (typeof product.inventory === 'number' ? product.inventory : null);
    setItems((prev) => {
      const existing = prev.find((i) => i.cartId === cartId);
      if (existing) {
        if (typeof existing.inventory === 'number' && existing.qty + 1 > existing.inventory) return prev;
        return prev.map((i) => i.cartId === cartId ? { ...i, qty: i.qty + 1 } : i);
      }
      if (typeof inventory === 'number' && inventory <= 0) return prev;
      return [
        ...prev,
        {
          cartId,
          productId,
          name: product.name,
          priceNum: parsePrice(product.price),
          priceStr: product.price,
          currency: product.currency,
          image: product.images?.[0] || product.image,
          size,
          inventory,
          qty: 1,
        },
      ];
    });
    setIsOpen(true);
  }

  function removeItem(cartId) {
    setItems((prev) => prev.filter((i) => i.cartId !== cartId));
  }

  function updateQty(cartId, qty) {
    if (qty < 1) { removeItem(cartId); return; }
    setItems((prev) => {
      const current = prev.find((i) => i.cartId === cartId);
      if (current && typeof current.inventory === 'number' && current.inventory < 1) {
        return prev.filter((i) => i.cartId !== cartId);
      }
      return prev.map((i) => {
        if (i.cartId !== cartId) return i;
        if (typeof i.inventory === 'number') {
          return { ...i, qty: Math.min(Math.max(1, qty), i.inventory) };
        }
        return { ...i, qty };
      });
    });
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal  = items.reduce((sum, i) => sum + i.priceNum * i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clearCart, itemCount, subtotal, isOpen, setIsOpen }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  return useContext(CartContext);
}
