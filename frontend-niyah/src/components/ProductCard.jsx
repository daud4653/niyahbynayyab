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
  const img1 = product.images?.[0] || product.image;
  const img2 = product.images?.[1] || null;

  return (
    <div
      className={`group bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 max-w-sm w-full flex flex-col ${productPath ? 'cursor-pointer' : ''}`}
      style={{ boxShadow: 'var(--shadow-card)', transition: 'box-shadow .3s ease, transform .3s ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
      onClick={() => { if (productPath) navigate(productPath); }}
      role={productPath ? 'button' : undefined}
      tabIndex={productPath ? 0 : undefined}
      onKeyDown={(e) => {
        if (!productPath) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(productPath); }
      }}
    >
      {/* Image — crossfade to second image on hover */}
      <div className="relative overflow-hidden aspect-[4/5] bg-cream-dark flex-shrink-0">
        {product.badge && (
          <span className="absolute top-3.5 left-3.5 z-10 bg-red-brand text-white text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full">
            {product.badge}
          </span>
        )}
        {outOfStock && (
          <span className="absolute top-3.5 right-3.5 z-10 bg-ink/80 text-white text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full">
            Sold out
          </span>
        )}

        {/* Primary image */}
        <img
          src={img1}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
            img2 ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'
          }`}
        />

        {/* Secondary image (hover reveal) */}
        {img2 && (
          <img
            src={img2}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500"
          />
        )}

        {/* Quick-view hint on hover */}
        <div className="absolute bottom-0 inset-x-0 py-3 flex justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/30 to-transparent">
          <span className="text-[10px] font-bold tracking-widest uppercase text-white/90">View details</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        {product.category && (
          <p className="text-[9px] font-bold tracking-[.14em] uppercase text-red-brand mb-1.5">{product.category}</p>
        )}
        <h3 className="font-brand font-bold text-[19px] text-ink leading-snug mb-1">
          {product.name}
        </h3>
        {product.tagline && (
          <p className="text-[12px] text-ink-muted leading-relaxed line-clamp-1">{product.tagline}</p>
        )}
        {!product.tagline && product.color && (
          <p className="text-[12px] text-ink-muted">{product.color}</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
          <span className="font-brand font-bold text-[17px] text-ink">
            {product.currency} {formatNumberPrice(product.price)}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); addItem(product); }}
            disabled={outOfStock}
            className="btn-red text-[12px] px-4 py-2 rounded-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  );
}
