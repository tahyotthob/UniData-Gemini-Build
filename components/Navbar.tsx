
import React, { useState, useEffect } from 'react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Navbar height offset
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'How it Works', id: 'how-it-works' },
    { name: 'Features', id: 'features' },
    { name: 'Why Us', id: 'why-unidata' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-8 h-8 bg-unidata-blue rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">U</span>
            </div>
            <span className="text-unidata-blue font-bold text-xl tracking-tight">Unidata</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a 
                key={link.id}
                href={`#${link.id}`} 
                onClick={(e) => scrollToSection(e, link.id)}
                className="text-gray-600 hover:text-unidata-blue font-medium transition-colors"
              >
                {link.name}
              </a>
            ))}
            <button 
              onClick={(e) => scrollToSection(e as any, 'waitlist')}
              className="bg-unidata-blue text-white px-6 py-2.5 rounded-full font-semibold hover:bg-unidata-darkBlue transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Get Early Access
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-unidata-blue p-2 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-xl transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <a 
              key={link.id}
              href={`#${link.id}`} 
              onClick={(e) => scrollToSection(e, link.id)}
              className="block px-4 py-3 text-gray-700 hover:bg-unidata-lightGreen hover:text-unidata-green rounded-xl font-medium transition-all"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-4 px-4">
            <button 
              onClick={(e) => scrollToSection(e as any, 'waitlist')}
              className="w-full bg-unidata-blue text-white px-6 py-4 rounded-xl font-bold hover:bg-unidata-darkBlue transition-all shadow-lg"
            >
              Get Early Access
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
