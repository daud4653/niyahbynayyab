import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import whoWeAre from '../assets/whoweare.jpg';
import { useProduct } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import { formatNumberPrice } from '../utils/price';

const BENEFITS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: 'Ethically Made',
    desc: 'Carefully crafted in Pakistan with fair working conditions.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12" /><path d="M12 12C12 12 7 9 7 5a5 5 0 0 1 10 0c0 4-5 7-5 7z" />
        <path d="M12 12C12 12 17 9 17 5" />
      </svg>
    ),
    title: 'Consciously Made',
    desc: 'Natural fabrics and minimal waste, always.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: 'Limited Pieces',
    desc: 'Small-batch production — each drop is intentional.',
  },
];

const STATS = [
  ['100%', 'Natural fabrics'],
  ['Made in', 'Pakistan'],
  ['Hand', 'Crafted'],
  ['Limited', 'Drops'],
];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden max-w-sm w-full animate-pulse" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="aspect-[4/5] bg-cream-dark" />
      <div className="p-5 space-y-3">
        <div className="h-2.5 w-16 bg-cream-mid rounded-full" />
        <div className="h-5 w-3/4 bg-cream-mid rounded-full" />
        <div className="h-3 w-1/2 bg-cream-mid rounded-full" />
        <div className="flex justify-between items-center pt-3 border-t border-border mt-4">
          <div className="h-5 w-24 bg-cream-mid rounded-full" />
          <div className="h-8 w-24 bg-cream-mid rounded-full" />
        </div>
      </div>
    </div>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [sent, setSent]   = useState(false);
  const inputRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
    setEmail('');
  }

  return (
    <section className="py-20 bg-ink overflow-hidden relative">
      {/* Decorative blob */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-red-brand/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-red-brand/6 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
        <p className="text-[10px] font-bold tracking-[.2em] uppercase text-red-brand mb-4 flex items-center justify-center gap-2">
          <span className="inline-block w-8 h-px bg-red-brand" />
          Stay in the loop
          <span className="inline-block w-8 h-px bg-red-brand" />
        </p>
        <h2 className="font-brand font-extrabold text-3xl md:text-4xl text-cream leading-tight mb-3">
          Be the first to know.
        </h2>
        <p className="text-[14px] text-white/50 mb-10 leading-relaxed">
          New drops, exclusive offers, and behind-the-scenes — straight to your inbox.
        </p>

        {sent ? (
          <div className="flex items-center justify-center gap-2 text-cream font-semibold text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-brand">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            You&apos;re on the list. We&apos;ll be in touch.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-5 py-3.5 bg-white/8 border border-white/15 rounded-2xl text-[14px] text-cream placeholder:text-white/30 outline-none focus:border-red-brand focus:bg-white/12 transition-all"
            />
            <button type="submit" className="btn-red px-7 py-3.5 text-sm whitespace-nowrap">
              Notify me
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

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
      {/* ── Hero ── */}
      <section className="min-h-screen pt-[132px] flex items-center bg-cream overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 w-full grid md:grid-cols-2 gap-12 lg:gap-20 py-20 items-center">

          {/* Copy */}
          <div className="order-2 md:order-1">
            <p className="text-[10px] font-bold tracking-[.2em] uppercase text-red-brand mb-5 flex items-center gap-2">
              <span className="inline-block w-8 h-px bg-red-brand" />
              New Season — SS&apos;26
            </p>
            <h1 className="font-brand font-extrabold text-5xl lg:text-[4.75rem] text-ink leading-[1.06] mb-6">
              Dress with<br />
              <span className="text-red-brand">intention.</span>
            </h1>
            <p className="text-base lg:text-[1.05rem] text-ink-mid leading-relaxed max-w-[420px] mb-10">
              Refined, fitted silhouettes and distinctive designs for the woman who appreciates understated elegance and individuality.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/#shop" className="btn-red px-8 py-3.5 text-sm">Shop Now</Link>
              <Link to="/#about" className="btn-outline px-8 py-3.5 text-sm">Our Story</Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-14 pt-8 border-t border-border">
              {STATS.map(([val, lbl]) => (
                <div key={lbl}>
                  <p className="font-brand font-extrabold text-lg text-ink leading-tight">{val}</p>
                  <p className="text-[11px] text-ink-muted mt-0.5 leading-snug">{lbl}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="order-1 md:order-2 relative">
            <div className="relative max-w-[360px] md:max-w-none mx-auto">
              <div className="absolute -top-10 -right-10 w-56 h-56 bg-red-brand/8 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cream-mid rounded-full blur-2xl pointer-events-none" />

              <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl bg-cream-dark">
                {heroProduct?.image ? (
                  <img
                    src={heroProduct.images?.[0] || heroProduct.image}
                    alt={heroProduct.name}
                    loading="eager"
                    fetchpriority="high"
                    decoding="sync"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink-muted text-sm">
                    No featured product yet
                  </div>
                )}
              </div>

              {heroProduct && (
                <div className="absolute bottom-6 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl px-5 py-4 shadow-xl border border-white/60">
                  <p className="text-[9px] font-bold tracking-[.18em] uppercase text-red-brand mb-1.5">Just Dropped</p>
                  <div className="flex justify-between items-center gap-3">
                    <p className="font-brand font-bold text-[15px] text-ink truncate">{heroProduct.name}</p>
                    <p className="font-brand font-bold text-[13px] text-ink-mid whitespace-nowrap flex-shrink-0">
                      {heroProduct.currency} {formatNumberPrice(heroProduct.price)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="bg-red-brand py-3 overflow-hidden">
        <div className="flex whitespace-nowrap animate-[marquee_22s_linear_infinite] w-max">
          {Array(12).fill(null).map((_, i) => (
            <span key={i} className="font-brand text-[13px] font-semibold text-white/85 px-2 tracking-[.06em]">
              niyah &nbsp;·&nbsp; new arrival &nbsp;·&nbsp; made with care &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── Shop ── */}
      <section id="shop" className="py-28 bg-cream">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-14">
            <div className="flex-1">
              <p className="text-[10px] font-bold tracking-[.2em] uppercase text-red-brand mb-2 flex items-center gap-2">
                <span className="inline-block w-8 h-px bg-red-brand" />
                The Collection
              </p>
              <h2 className="font-brand font-extrabold text-4xl lg:text-5xl text-ink">Shop</h2>
            </div>
            <div className="relative sm:w-72">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-border rounded-2xl text-sm font-body text-ink placeholder:text-ink-muted outline-none focus:border-red-brand focus:ring-2 focus:ring-red-brand/10 transition-all"
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

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 justify-items-center">
              {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
            </div>
          )}

          {!loading && error && <p className="text-red-brand font-semibold text-sm py-8">{error}</p>}

          {!loading && !error && products.length === 0 && (
            <p className="text-ink-muted text-sm py-8">No products available yet.</p>
          )}

          {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-ink-mid font-semibold mb-2">No products match &ldquo;{search}&rdquo;</p>
              <button onClick={() => setSearch('')} className="text-sm text-red-brand hover:underline font-semibold">Clear search</button>
            </div>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 justify-items-center">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="py-20 bg-cream-dark">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[10px] font-bold tracking-[.2em] uppercase text-red-brand mb-2">Why niyah</p>
            <h2 className="font-brand font-extrabold text-3xl text-ink">Built on principles.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {BENEFITS.map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-7 shadow-sm text-center flex flex-col items-center">
                <span className="inline-flex items-center justify-center w-12 h-12 bg-red-light text-red-brand rounded-2xl mb-5">
                  {icon}
                </span>
                <p className="font-brand font-bold text-[17px] text-ink mb-2">{title}</p>
                <p className="text-[13px] text-ink-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-28 bg-cream">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="relative max-w-sm md:max-w-none mx-auto">
            <div className="aspect-square rounded-[2.5rem] overflow-hidden shadow-xl bg-cream-dark">
              <img src={whoWeAre} alt="Who we are" loading="lazy" decoding="async" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-5 -right-5 w-28 h-28 bg-red-brand rounded-3xl -z-10" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-[.2em] uppercase text-red-brand mb-4 flex items-center gap-2">
              <span className="inline-block w-8 h-px bg-red-brand" />
              Who we are
            </p>
            <h2 className="font-brand font-extrabold text-4xl lg:text-5xl text-ink leading-tight mb-6">
              Made with<br />a reason.
            </h2>
            <p className="text-[15px] text-ink-mid leading-relaxed mb-4 max-w-md">
              Niyah is more than just a label — it represents intention, individuality, and thoughtful design. Every stitch, every fitted silhouette, and every design is created with purpose, focusing on pieces that feel distinctive and personal.
            </p>
            <p className="text-[15px] text-ink-mid leading-relaxed mb-9 max-w-md">
              Based in Pakistan and crafted with care, our collections are produced in limited quantities with attention to detail, quality fabrics, and a more conscious approach to fashion.
            </p>
            <Link to="/#shop" className="btn-red">Explore the Collection</Link>
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <Newsletter />
    </main>
  );
}
