import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Lottie from 'lottie-react';
import { useProduct } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import { formatNumberPrice } from '../utils/price';
import shoppingAnimation from '../assets/diwali-shopping.json';

const BENEFITS = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4" />
      </svg>
    ),
    title: 'Easy Returns',
    desc: '7-day hassle-free returns',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: 'Ethically Made',
    desc: 'Crafted in Pakistan with care',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12" /><path d="M12 12C12 12 7 9 7 5a5 5 0 0 1 10 0c0 4-5 7-5 7z" />
        <path d="M12 12C12 12 17 9 17 5" />
      </svg>
    ),
    title: 'Sustainable',
    desc: 'Natural fabrics, minimal waste',
  },
];

export default function Home() {
  const { products, featuredProduct, loading, error } = useProduct();
  const { hash } = useLocation();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [hash]);

  const heroProduct = featuredProduct;

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name?.toLowerCase().includes(q) ||
      p.tagline?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.color?.toLowerCase().includes(q)
    );
  });

  return (
    <main>
      {/* Hero */}
      <section className="min-h-screen pt-[88px] flex items-center bg-cream overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 w-full grid md:grid-cols-2 gap-12 lg:gap-20 py-16 items-center">
          <div className="order-2 md:order-1">
            <p className="text-[11px] font-bold tracking-[.18em] uppercase text-red-brand mb-5">New Season — SS&apos;26</p>
            <h1 className="font-brand font-extrabold text-5xl lg:text-[4.5rem] text-ink leading-[1.08] mb-6">
              Dress with<br />
              <span className="text-red-brand">intention.</span>
            </h1>
            <p className="text-base lg:text-lg text-ink-mid leading-relaxed max-w-md mb-10">
              Pieces designed for the woman who moves through the world on purpose — understated, refined, and always herself.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/#shop" className="btn-red px-8 py-3.5 text-sm">Shop Now</Link>
              <Link to="/#about" className="btn-outline px-8 py-3.5 text-sm">Our Story</Link>
            </div>
            <div className="flex gap-8 mt-14 pt-8 border-t border-border">
              {[['100%', 'Natural fabrics'], ['Made in', 'Pakistan'], ['Hand', 'Crafted'], ['Limited', 'Drops']].map(([val, lbl]) => (
                <div key={lbl}>
                  <p className="font-brand font-bold text-xl text-ink">{val}</p>
                  <p className="text-xs text-ink-muted mt-0.5">{lbl}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 md:order-2 relative">
            <div className="relative max-w-sm md:max-w-none mx-auto">
              <div className="absolute -top-8 -right-8 w-48 h-48 bg-red-brand/8 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-cream-mid rounded-full blur-2xl -z-10" />
              <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl bg-cream-dark">
                {heroProduct?.image ? (
                  <img src={heroProduct.images?.[0] || heroProduct.image} alt={heroProduct.name} loading="eager" fetchpriority="high" decoding="sync" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink-muted text-sm">No featured product yet</div>
                )}
              </div>
              {heroProduct && (
                <div className="absolute bottom-6 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-red-brand mb-1">Just Dropped</p>
                  <div className="flex justify-between items-center">
                    <p className="font-brand font-bold text-base text-ink">{heroProduct.name}</p>
                    <p className="font-brand font-bold text-sm text-ink">
                      {heroProduct.currency} {formatNumberPrice(heroProduct.price)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-red-brand py-2.5 overflow-hidden">
        <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite] w-max">
          {Array(10).fill(null).map((_, i) => (
            <span key={i} className="font-brand text-sm font-semibold text-white/90 px-1 tracking-wide">
              niyah &nbsp;·&nbsp; new arrival &nbsp;·&nbsp; made with care &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Shop */}
      <section id="shop" className="py-24 bg-cream">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-12">
            <div className="flex-1">
              <p className="text-[11px] font-bold tracking-[.18em] uppercase text-red-brand mb-2">The Collection</p>
              <h2 className="font-brand font-extrabold text-4xl lg:text-5xl text-ink">Shop</h2>
            </div>
            <div className="relative sm:w-72">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-2xl text-sm font-body text-ink placeholder:text-ink-muted outline-none focus:border-red-brand focus:ring-2 focus:ring-red-brand/10 transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {loading && <p className="text-ink-muted">Loading products...</p>}
          {!loading && error && <p className="text-red-brand font-semibold">{error}</p>}

          {!loading && !error && products.length === 0 && (
            <p className="text-ink-muted">No products available yet. Add products from admin portal.</p>
          )}

          {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-ink-mid font-semibold mb-2">No products match &ldquo;{search}&rdquo;</p>
              <button onClick={() => setSearch('')} className="text-sm text-red-brand hover:underline font-semibold">Clear search</button>
            </div>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-cream-dark">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {BENEFITS.map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <span className="inline-flex items-center justify-center w-11 h-11 bg-red-light text-red-brand rounded-xl mb-4">
                {icon}
              </span>
              <p className="font-brand font-bold text-base text-ink mb-1">{title}</p>
              <p className="text-xs text-ink-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 bg-cream">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="relative max-w-sm md:max-w-none mx-auto">
            <div className="aspect-square rounded-[2rem] overflow-hidden shadow-xl bg-cream-dark flex items-center justify-center">
              <Lottie animationData={shoppingAnimation} loop className="w-full h-full" />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-red-brand rounded-3xl -z-10" />
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-[.18em] uppercase text-red-brand mb-4">Who we are</p>
            <h2 className="font-brand font-extrabold text-4xl lg:text-5xl text-ink leading-tight mb-6">
              Made with<br />a reason.
            </h2>
            <p className="text-base text-ink-mid leading-relaxed mb-5 max-w-md">
              niyah is more than a label — it&apos;s a reminder to move through the world on purpose. Every stitch,
              every silhouette, every choice is deliberate. We make clothes that feel like you remembered who you are.
            </p>
            <p className="text-base text-ink-mid leading-relaxed mb-8 max-w-md">
              Based in Pakistan, crafted for women everywhere.
            </p>
            <Link to="/#shop" className="btn-red">Explore the Collection</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
