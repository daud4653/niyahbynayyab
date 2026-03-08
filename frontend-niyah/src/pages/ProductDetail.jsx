import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { formatNumberPrice } from '../utils/price';

export default function ProductDetail() {
  const { id } = useParams();
  const { products, loading } = useProduct();
  const { addItem } = useCart();
  const [selectedSizes, setSelectedSizes] = useState({});
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const product = useMemo(() => products.find((item) => item._id === id || String(item.id) === String(id)), [products, id]);

  const images = useMemo(() => {
    if (!product) return [];
    const arr = Array.isArray(product.images) && product.images.length > 0 ? product.images : product.image ? [product.image] : [];
    return arr;
  }, [product]);

  useEffect(() => {
    setActiveImg(0);
  }, [id]);

  const size = selectedSizes[id] || null;
  const inventory = product?.inventory;
  const sizeInv = product?.sizeInventory || {};

  function getSizeCount(s) {
    return sizeInv[s] !== undefined ? sizeInv[s] : null;
  }

  const selectedSizeCount = size ? getSizeCount(size) : null;
  const outOfStock = selectedSizeCount !== null
    ? selectedSizeCount <= 0
    : (typeof inventory === 'number' && inventory <= 0);

  function handleAdd() {
    if (!product) return;
    if (outOfStock) { alert('This product is currently sold out.'); return; }
    if (product.sizes?.length > 0 && !size) { alert('Please select a size first.'); return; }
    addItem(product, size);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) {
    return (
      <main className="pt-[108px] min-h-screen bg-cream px-6 py-12">
        <p className="text-ink-muted">Loading product...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="pt-[108px] min-h-screen bg-cream px-6 py-12">
        <Link to="/" className="text-sm font-semibold text-red-brand">Back to shop</Link>
        <p className="mt-6 text-ink-muted">Product not found.</p>
      </main>
    );
  }

  const displayImage = images[activeImg] || product.image;

  return (
    <main className="pt-[108px] min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-ink-muted hover:text-red-brand transition-colors mb-8 uppercase tracking-widest">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Image gallery */}
          <div className="md:sticky md:top-24 flex flex-col gap-3">
            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-cream-dark shadow-xl">
              {displayImage ? (
                <img src={displayImage} alt={product.name} loading="eager" fetchpriority="high" decoding="sync" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink-muted text-sm">No image</div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImg === idx ? 'border-red-brand' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5">
            {product.badge && (
              <span className="inline-block self-start bg-red-brand text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
                {product.badge}
              </span>
            )}

            <div>
              <p className="text-[10px] font-bold tracking-[.12em] uppercase text-ink-muted mb-2">{product.category}</p>
              <h1 className="font-brand font-extrabold text-4xl lg:text-5xl text-ink leading-tight mb-2">{product.name}</h1>
              {product.color && <p className="text-sm text-ink-muted">{product.color}</p>}
            </div>

            <p className="font-brand font-bold text-3xl text-ink">
              {product.currency} {formatNumberPrice(product.price)}
            </p>

            {selectedSizeCount !== null && (
              <p className={`text-xs font-bold tracking-widest uppercase ${selectedSizeCount <= 0 ? 'text-red-brand' : selectedSizeCount <= 2 ? 'text-orange-500' : 'text-ink-muted'}`}>
                {selectedSizeCount <= 0 ? 'Sold out' : selectedSizeCount <= 2 ? `Only ${selectedSizeCount} left` : `${selectedSizeCount} in stock`}
              </p>
            )}
            {selectedSizeCount === null && typeof inventory === 'number' && (
              <p className={`text-xs font-bold tracking-widest uppercase ${outOfStock ? 'text-red-brand' : 'text-ink-muted'}`}>
                {outOfStock ? 'Sold out' : `${inventory} in stock`}
              </p>
            )}

            <p className="text-base text-ink-mid leading-relaxed max-w-lg">{product.description}</p>

            {product.sizes?.length > 0 && (
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-ink-mid mb-3">
                  Size {size && <span className="text-red-brand">— {size}</span>}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((s) => {
                    const count = getSizeCount(s);
                    const isSizeOut = count !== null && count <= 0;
                    const isSizeFew = count !== null && count > 0 && count <= 2;
                    return (
                      <button
                        key={s}
                        onClick={() => !isSizeOut && setSelectedSizes((prev) => ({ ...prev, [id]: s }))}
                        disabled={isSizeOut}
                        className={`relative min-w-[3rem] px-3 h-12 rounded-xl text-sm font-bold border-[1.5px] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${
                          size === s
                            ? 'bg-red-brand border-red-brand text-white'
                            : isSizeOut
                            ? 'bg-cream border-border text-ink-muted line-through'
                            : 'bg-white border-border text-ink-mid hover:border-red-brand hover:text-red-brand'
                        }`}
                      >
                        {s}
                        {isSizeFew && (
                          <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className={`w-full py-4 rounded-2xl text-base font-bold tracking-wide transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
                added ? 'bg-green-700 text-white' : 'btn-red'
              }`}
            >
              {outOfStock ? 'Sold Out' : added ? 'Added to Bag ✓' : 'Add to Bag'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
