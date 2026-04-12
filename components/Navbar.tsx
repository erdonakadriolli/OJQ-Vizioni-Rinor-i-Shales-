
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, LogOut, LogIn, ChevronDown, UserPlus, MessageSquare, LayoutDashboard, X, Home as HomeIcon, Info, FolderOpen, Newspaper, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { User, UserRole } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const closeTimeout = useRef<any>(null);

  const handleMouseEnter = (id: string) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setActiveDropdown(id);
  };

  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150); // Small 150ms grace period
  };
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const mobileLinks = [
    { name: t('nav.home'), path: '/', color: 'text-brand-dark', icon: HomeIcon },
    { name: t('nav.projects'), path: '/projects', color: 'text-brand-cyan', icon: FolderOpen },
    { name: t('nav.derdo'), path: '/derdo', color: 'text-brand-orange', icon: MessageSquare },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm py-2' : 'bg-white border-b border-slate-50 py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="VRSH Logo" className="h-10 w-auto" />
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-1">
          <Link to="/" className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${location.pathname === '/' ? 'text-brand-pink bg-brand-pink/5' : 'text-slate-600 hover:text-brand-pink'}`}>
            {t('nav.home')}
          </Link>

          <div 
            className="relative group" 
            onMouseEnter={() => handleMouseEnter('about')} 
            onMouseLeave={handleMouseLeave}
          >
            <button className={`flex items-center space-x-1 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${isActive('/about') ? 'text-brand-pink bg-brand-pink/5' : 'text-slate-600 hover:text-brand-pink'}`}>
              <span>{t('nav.about')}</span>
              <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${activeDropdown === 'about' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`absolute left-0 top-full pt-2 w-48 transition-all transform origin-top ${activeDropdown === 'about' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 pointer-events-none -translate-y-2'}`}>
              <div className="bg-white border border-slate-100 shadow-2xl rounded-[1.5rem] p-2">
                <Link to="/about/staff" className="flex items-center space-x-2 px-4 py-3 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-50 hover:text-brand-pink uppercase tracking-widest transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-lime"></div>
                  <span>{t('nav.staff')}</span>
                </Link>
                <Link to="/about/mission" className="flex items-center space-x-2 px-4 py-3 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-50 hover:text-brand-pink uppercase tracking-widest transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-pink"></div>
                  <span>{t('nav.mission')}</span>
                </Link>
              </div>
            </div>
          </div>

          <Link to="/projects" className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${isActive('/projects') ? 'text-brand-cyan bg-brand-cyan/5' : 'text-slate-600 hover:text-brand-cyan'}`}>
            {t('nav.projects')}
          </Link>

          <div 
            className="relative group" 
            onMouseEnter={() => handleMouseEnter('news')} 
            onMouseLeave={handleMouseLeave}
          >
            <button className={`flex items-center space-x-1 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${isActive('/news') ? 'text-brand-pink bg-brand-pink/5' : 'text-slate-600 hover:text-brand-pink'}`}>
              <span>{t('nav.news')}</span>
              <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${activeDropdown === 'news' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`absolute left-0 top-full pt-2 w-56 transition-all transform origin-top ${activeDropdown === 'news' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 pointer-events-none -translate-y-2'}`}>
              <div className="bg-white border border-slate-100 shadow-2xl rounded-[1.5rem] p-2">
                <Link to="/news/latest" className="flex items-center space-x-2 px-4 py-3 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-50 hover:text-brand-pink uppercase tracking-widest transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-pink"></div>
                  <span>{t('news.title.latest')}</span>
                </Link>
                <Link to="/news/reports" className="flex items-center space-x-2 px-4 py-3 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-50 hover:text-brand-cyan uppercase tracking-widest transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan"></div>
                  <span>{t('news.title.reports')}</span>
                </Link>
                <Link to="/news/media" className="flex items-center space-x-2 px-4 py-3 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-50 hover:text-brand-orange uppercase tracking-widest transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-orange"></div>
                  <span>{t('news.title.media')}</span>
                </Link>
              </div>
            </div>
          </div>

          <Link to="/derdo" className={`flex items-center space-x-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${isActive('/derdo') ? 'text-brand-orange bg-brand-orange/5' : 'text-slate-600 hover:text-brand-orange'}`}>
            <MessageSquare className="h-4 w-4" />
            <span>{t('nav.derdo')}</span>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-50 rounded-full p-1 mr-2">
            <button 
              onClick={() => setLanguage('AL')}
              className={`px-2 py-1 rounded-full text-[9px] font-black transition-all ${language === 'AL' ? 'bg-white text-brand-pink shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              AL
            </button>
            <button 
              onClick={() => setLanguage('EN')}
              className={`px-2 py-1 rounded-full text-[9px] font-black transition-all ${language === 'EN' ? 'bg-white text-brand-pink shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              EN
            </button>
          </div>

          <Link to="/join" className={`hidden sm:flex items-center space-x-2 px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all shadow-lg ${isActive('/join') ? 'bg-brand-lime text-white' : 'bg-brand-dark text-white hover:bg-brand-lime'}`}>
            <UserPlus className="h-4 w-4" />
            <span>{t('nav.join')}</span>
          </Link>

          {user ? (
            <div className="flex items-center space-x-2">
              {user.role === UserRole.ADMIN && (
                <Link to="/admin" className="p-2.5 bg-brand-cyan/10 text-brand-cyan rounded-full hover:bg-brand-cyan hover:text-white transition-all">
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
              )}
              <button onClick={onLogout} className="p-2.5 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="p-2.5 bg-slate-50 text-brand-dark rounded-full hover:bg-brand-pink hover:text-white transition-all">
              <LogIn className="h-5 w-5" />
            </Link>
          )}
          
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="lg:hidden p-2.5 bg-slate-50 text-slate-600 rounded-full hover:bg-slate-100 transition-all"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-0 z-[150] bg-white flex flex-col"
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-slate-100">
              <div className="flex items-center">
                <img src="/logo.png" alt="VRSH Logo" className="h-8 w-auto" />
              </div>
              <div className="flex items-center space-x-4">
                {/* Mobile Language Switcher */}
                <div className="flex items-center bg-slate-50 rounded-full p-1">
                  <button 
                    onClick={() => setLanguage('AL')}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all ${language === 'AL' ? 'bg-white text-brand-pink shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    AL
                  </button>
                  <button 
                    onClick={() => setLanguage('EN')}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all ${language === 'EN' ? 'bg-white text-brand-pink shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    EN
                  </button>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-3 bg-slate-50 rounded-full text-slate-500 hover:bg-brand-pink hover:text-white transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Mobile Menu Content */}
            <div className="flex-1 overflow-y-auto py-8 px-8 space-y-8">
              {/* Main Links */}
              <div className="space-y-4">
                {mobileLinks.map((link, idx) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.1 }}
                  >
                    <Link 
                      to={link.path} 
                      className={`flex items-center space-x-4 text-lg font-black uppercase tracking-tighter ${link.color}`}
                    >
                      <link.icon className="h-5 w-5 opacity-20" />
                      <span>{link.name}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* About Section */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-pink flex items-center opacity-60">
                  <Info className="h-3 w-3 mr-2" /> {t('nav.about')}
                </p>
                <div className="flex flex-col space-y-2 pl-4 border-l border-slate-100">
                  <Link to="/about/staff" className="text-sm font-bold text-slate-600 hover:text-brand-pink transition-colors">{t('nav.staff')}</Link>
                  <Link to="/about/mission" className="text-sm font-bold text-slate-600 hover:text-brand-pink transition-colors">{t('nav.mission')}</Link>
                </div>
              </motion.div>

              {/* News Section */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-pink flex items-center opacity-60">
                  <Newspaper className="h-3 w-3 mr-2" /> {t('nav.news')}
                </p>
                <div className="flex flex-col space-y-2 pl-4 border-l border-slate-100">
                  <Link to="/news/latest" className="text-sm font-bold text-slate-600 hover:text-brand-pink transition-colors">{t('news.title.latest')}</Link>
                  <Link to="/news/reports" className="text-sm font-bold text-slate-600 hover:text-brand-cyan transition-colors">{t('news.title.reports')}</Link>
                  <Link to="/news/media" className="text-sm font-bold text-slate-600 hover:text-brand-orange transition-colors">{t('news.title.media')}</Link>
                </div>
              </motion.div>
            </div>

            {/* Mobile Menu Footer */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-8 border-t border-slate-100 bg-slate-50/50"
            >
              <Link to="/join" className="flex items-center justify-center space-x-3 w-full py-4 bg-brand-lime text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-brand-lime/20 transform active:scale-95 transition-all">
                <Heart className="h-5 w-5 animate-pulse" />
                <span>{t('nav.join')}</span>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
