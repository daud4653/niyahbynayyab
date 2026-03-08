import { Link } from 'react-router-dom';
import logo from '../assets/logo.jpeg';

export default function Footer() {
  return (
    <footer className="bg-ink text-cream mt-auto">
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-6">
        <div className="flex flex-col md:flex-row justify-between gap-10 pb-10 border-b border-white/10">
          <div className="max-w-xs">
            <div className="relative overflow-hidden h-[120px] w-[130px] mb-4">
              <img
                src={logo}
                alt="niyah"
                className="absolute top-0 h-[120px] w-auto mix-blend-screen opacity-90"
                style={{ left: '-25px' }}
              />
            </div>
            <p className="text-sm text-white/45 leading-relaxed">
              Made with care.<br />Worn with intention.
            </p>
          </div>

          <div className="flex gap-16">
            {[
              ['Shop',   [['/#shop', 'New Arrivals'], ['/#shop', 'All Products']]],
              ['Info',   [['/#about', 'About Us'], ['https://instagram.com/niyahbynayyab', 'Instagram']]],
            ].map(([heading, links]) => (
              <div key={heading}>
                <p className="text-[11px] font-bold tracking-[.1em] uppercase text-white/35 mb-4">{heading}</p>
                <ul className="space-y-3">
                  {links.map(([href, label]) => (
                    <li key={label}>
                      {href.startsWith('http') ? (
                        <a href={href} target="_blank" rel="noreferrer" className="text-sm text-white/60 hover:text-cream transition-colors duration-150">
                          {label}
                        </a>
                      ) : (
                        <Link to={href} className="text-sm text-white/60 hover:text-cream transition-colors duration-150">
                          {label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-5">
          <p className="text-[12px] text-white/25">&copy; {new Date().getFullYear()} niyah. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
