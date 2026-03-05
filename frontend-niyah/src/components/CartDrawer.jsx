import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function formatPrice(num, currency = 'PKR') {
  return `${currency} ${num.toLocaleString('en-PK')}`;
}

export default function CartDrawer() {
  const { items, removeItem, updateQty, subtotal, isOpen, setIsOpen, itemCount } = useCart();
  const navigate = useNavigate();

  function handleCheckout() {
    setIsOpen(false);
    navigate('/checkout');
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full z-50 w-full max-w-[420px] bg-white flex flex-col transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ boxShadow: 'var(--shadow-drawer)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="font-brand font-bold text-xl text-ink">Your Bag</h2>
            {itemCount > 0 && (
              <p className="text-xs text-ink-muted mt-0.5">{itemCount} item{itemCount > 1 ? 's' : ''}</p>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-ink-muted hover:bg-cream hover:text-ink transition-colors duration-150"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-muted">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
              </div>
              <p className="font-brand font-bold text-lg text-ink mb-1">Your bag is empty</p>
              <p className="text-sm text-ink-muted">Add something beautiful.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.cartId} className="flex gap-4">
                {/* Image */}
                <div className="w-20 h-24 rounded-2xl overflow-hidden bg-cream-dark flex-shrink-0">
                  <img src={item.image} alt={item.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-brand font-bold text-sm text-ink leading-tight">{item.name}</p>
                      {item.size && (
                        <p className="text-xs text-ink-muted mt-0.5">Size: {item.size}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.cartId)}
                      className="text-ink-muted hover:text-red-brand transition-colors flex-shrink-0 mt-0.5"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Qty */}
                    <div className="flex items-center gap-2 bg-cream rounded-full px-1 py-0.5">
                      <button
                        onClick={() => updateQty(item.cartId, item.qty - 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-ink-mid hover:bg-cream-dark transition-colors text-sm font-bold"
                      >−</button>
                      <span className="text-sm font-bold text-ink w-5 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.cartId, item.qty + 1)}
                        disabled={typeof item.inventory === 'number' && item.qty >= item.inventory}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-ink-mid hover:bg-cream-dark transition-colors text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      >+</button>
                    </div>

                    <p className="font-brand font-bold text-sm text-ink">
                      {formatPrice(item.priceNum * item.qty, item.currency)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-ink-muted font-semibold">Subtotal</span>
              <span className="font-brand font-bold text-lg text-ink">
                {formatPrice(subtotal, items[0]?.currency)}
              </span>
            </div>
            <p className="text-xs text-ink-muted">Shipping calculated at checkout.</p>
            <button onClick={handleCheckout} className="btn-red w-full py-4 text-base rounded-2xl">
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
