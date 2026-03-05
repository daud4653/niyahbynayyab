import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import logo from '../assets/logo.jpeg';

export default function Navbar() {
  const [scrolled, setScrolled]  = useState(false);
  const [menuOpen, setMenuOpen]  = useState(false);
  const { itemCount, setIsOpen } = useCart();
  const location                 = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const linkClass = (active) =>
    `relative text-sm font-semibold tracking-wide transition-colors duration-150 after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:rounded-full after:bg-red-brand after:transition-all after:duration-200 ${
      active ? 'text-red-brand after:w-full' : 'text-ink-mid hover:text-red-brand after:w-0 hover:after:w-full'
    }`;

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-30 bg-cream/95 backdrop-blur-md transition-all duration-300 ${
        scrolled ? 'shadow-md shadow-black/5 border-b border-border' : 'border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center h-[88px] gap-8">
        {/* Logo — left-aligned, fits in navbar height */}
        <Link to="/" className="flex-shrink-0 flex items-center">
          <img
            src={logo}
            alt="niyah"
            className="h-[96px] w-auto object-contain mix-blend-multiply opacity-95"
          />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-9 ml-auto">
          {[['/', 'Home'], ['/#shop', 'Shop'], ['/#about', 'About']].map(([href, label]) => (
            <li key={href}>
              <Link to={href} className={linkClass(location.pathname === href)}>{label}</Link>
            </li>
          ))}
        </ul>

        {/* Cart */}
        <button
          onClick={() => setIsOpen(true)}
          className="relative ml-auto md:ml-4 flex items-center justify-center w-10 h-10 rounded-full hover:bg-cream-dark transition-colors duration-150"
          aria-label="Open cart"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          {itemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-brand text-white text-[10px] font-bold rounded-full leading-none">
              {itemCount}
            </span>
          )}
        </button>

        {/* Mobile burger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-[5px] p-2"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-ink rounded-full transition-all duration-200 origin-center ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-5 h-0.5 bg-ink rounded-full transition-all duration-200 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-ink rounded-full transition-all duration-200 origin-center ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 border-t border-border ${
          menuOpen ? 'max-h-60 py-3' : 'max-h-0'
        }`}
      >
        {[['/', 'Home'], ['/#shop', 'Shop'], ['/#about', 'About']].map(([href, label]) => (
          <Link
            key={href}
            to={href}
            className="block px-6 py-3.5 text-sm font-semibold text-ink-mid hover:text-red-brand hover:bg-cream-dark/60 transition-colors"
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
