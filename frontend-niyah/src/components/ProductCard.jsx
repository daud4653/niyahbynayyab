import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatNumberPrice } from '../utils/price';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const productId = product?._id || product?.id;
  const productPath = productId ? `/product/${encodeURIComponent(String(productId))}` : null;
  const inventory = product?.inventory;
  const outOfStock = typeof inventory === 'number' && inventory <= 0;

  return (
    <div
      className={`group bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 max-w-sm w-full ${productPath ? 'cursor-pointer' : ''}`}
      style={{ boxShadow: 'var(--shadow-card)', transition: 'box-shadow .3s ease, transform .3s ease' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
      }}
      onClick={() => {
        if (productPath) navigate(productPath);
      }}
      role={productPath ? 'button' : undefined}
      tabIndex={productPath ? 0 : undefined}
      onKeyDown={(e) => {
        if (!productPath) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(productPath);
        }
      }}
    >
      <div className="block relative overflow-hidden aspect-[4/5] bg-cream-dark">
        {product.badge && (
          <span className="absolute top-3.5 left-3.5 z-10 bg-red-brand text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
            {product.badge}
          </span>
        )}
        {outOfStock && (
          <span className="absolute top-3.5 right-3.5 z-10 bg-ink text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
            Sold out
          </span>
        )}
        <img src={product.images?.[0] || product.image} alt={product.name} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>

      <div className="p-5">
        <p className="text-[10px] font-bold tracking-[.12em] uppercase text-red-brand mb-1.5">{product.category}</p>
        <h3 className="font-brand font-bold text-xl text-ink leading-tight mb-1">
          <span className="hover:text-red-brand transition-colors duration-150">{product.name}</span>
        </h3>
        {product.color && <p className="text-xs text-ink-muted mb-4">{product.color}</p>}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <span className="font-brand font-bold text-lg text-ink">
            {product.currency} {formatNumberPrice(product.price)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addItem(product);
            }}
            disabled={outOfStock}
            className="btn-red text-xs px-4 py-2 rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  );
}
