
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Logo from './components/Logo';
import Home from './pages/Home';
import Projects from './pages/Projects';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import About from './pages/About';
import News from './pages/News';
import VolunteerApply from './pages/VolunteerApply';
import DerdoChat from './pages/DerdoChat';
import { User, UserRole } from './types';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, ArrowRight, Heart } from 'lucide-react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { FirestoreProvider } from './context/FirestoreContext';
import { logout as firebaseLogout, auth, adminEmails } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-slate-50 text-slate-600 py-24 px-6 relative overflow-hidden mt-20 border-t border-slate-200">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-pink via-brand-orange to-brand-lime"></div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10">
        <div className="col-span-1 md:col-span-1 space-y-8">
          <div className="flex items-center space-x-4">
            {/* Logo removed as per user request */}
          </div>
          <p className="text-sm leading-relaxed font-medium text-slate-500">
            {t('footer.desc')}
          </p>
          <div className="flex space-x-4">
            <a href="https://www.facebook.com/vizionirinorishales" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-brand-pink hover:text-white transition-all duration-500 border border-slate-200 shadow-sm">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="https://www.instagram.com/vizionirinorishales/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-brand-pink hover:text-white transition-all duration-500 border border-slate-200 shadow-sm">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="https://www.tiktok.com/@vizionirinorishales" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-brand-pink hover:text-white transition-all duration-500 border border-slate-200 shadow-sm">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-1.13-.31-2.34-.25-3.41.33-.71.38-1.27 1.03-1.57 1.77-.3.72-.34 1.52-.16 2.27.18.75.58 1.44 1.14 1.96.56.52 1.28.86 2.05.97.77.11 1.57.01 2.28-.28.71-.29 1.32-.8 1.73-1.44.41-.64.62-1.4.61-2.17-.01-3.17.01-6.33-.01-9.5z"/>
              </svg>
            </a>
            <a href="https://www.youtube.com/@vizionirinorishales1668" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-brand-pink hover:text-white transition-all duration-500 border border-slate-200 shadow-sm">
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>
        
        <div className="space-y-8">
          <h4 className="text-slate-900 font-black uppercase tracking-widest text-[10px] flex items-center">
            <div className="w-4 h-[2px] bg-brand-pink mr-3"></div>
            {t('footer.nav')}
          </h4>
          <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest">
            <li><a href="#/" className="hover:text-brand-pink transition-all flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-all" /> {t('nav.home')}</a></li>
            <li><a href="#/projects" className="hover:text-brand-pink transition-all flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-all" /> {t('nav.projects')}</a></li>
            <li><a href="#/news" className="hover:text-brand-pink transition-all flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-all" /> {t('nav.news')}</a></li>
            <li><a href="#/about/mission" className="hover:text-brand-pink transition-all flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-all" /> {t('nav.mission')}</a></li>
          </ul>
        </div>

        <div className="space-y-8">
          <h4 className="text-slate-900 font-black uppercase tracking-widest text-[10px] flex items-center">
            <div className="w-4 h-[2px] bg-brand-lime mr-3"></div>
            {t('footer.opp')}
          </h4>
          <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest">
            <li><a href="#/join" className="hover:text-brand-lime transition-all flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-all" /> {t('nav.join')}</a></li>
            <li><a href="#/partner" className="hover:text-brand-cyan transition-all flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-all" /> Partneritete</a></li>
            <li><a href="#/derdo" className="hover:text-brand-orange transition-all flex items-center group"><ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-all" /> {t('nav.derdo')} Chat</a></li>
          </ul>
        </div>

        <div className="space-y-8">
          <h4 className="text-slate-900 font-black uppercase tracking-widest text-[10px] flex items-center">
            <div className="w-4 h-[2px] bg-brand-cyan mr-3"></div>
            {t('footer.find')}
          </h4>
          <ul className="space-y-5 text-sm font-medium">
            <li className="flex items-start space-x-4 group">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-pink border border-slate-200 flex-shrink-0 shadow-sm"><MapPin className="h-5 w-5" /></div>
              <a href="https://maps.app.goo.gl/N5XVp95AxwZyngCq8" target="_blank" rel="noopener noreferrer" className="hover:text-brand-pink transition-colors pt-1">
                Fshati Shalë, Komuna Lipjan<br/>
                Republika e Kosovës
              </a>
            </li>
            <li className="flex items-center space-x-4 group">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-cyan border border-slate-200 flex-shrink-0 shadow-sm"><Mail className="h-5 w-5" /></div>
              <span className="hover:text-brand-cyan transition-colors">info@vizionirinorishales.org</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-24 pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
           <Heart className="h-3 w-3 text-brand-pink" />
           <span>{t('footer.rights')}</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          {t('footer.developedBy')} <span className="text-brand-pink">Erdona Kadriolli</span>
        </p>
      </div>
    </footer>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('ngo_user_session');
    if (session) {
      setUser(JSON.parse(session));
    }

    // Sync with Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // If we have a firebase user but no app user, or they differ, sync them
        // Note: We prioritize the admin email for the role
        const isAdminUser = adminEmails.includes(firebaseUser.email || '');
        const syncedUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          role: isAdminUser ? UserRole.ADMIN : UserRole.VOLUNTEER
        };
        setUser(syncedUser);
        localStorage.setItem('ngo_user_session', JSON.stringify(syncedUser));
      } else {
        // If firebase signed out but we think we are logged in, we should probably sign out
        // but only if it was a firebase-based session. 
        // For now, we'll just let the app handle it via handleLogout.
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('ngo_user_session', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    setUser(null);
    localStorage.removeItem('ngo_user_session');
    try {
      await firebaseLogout();
    } catch (err) {
      console.error("Firebase Logout Error:", err);
    }
  };

  return (
    <LanguageProvider>
      <FirestoreProvider>
        <HashRouter>
          <div className="min-h-screen flex flex-col selection:bg-brand-pink selection:text-white">
            <Navbar user={user} onLogout={handleLogout} />
            <main className="flex-grow pt-20 lg:pt-24">
              <Routes>
                <Route path="/" element={<Home user={user} />} />
                <Route path="/about" element={<About user={user} />} />
                <Route path="/about/:section" element={<About user={user} />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:category" element={<News />} />
                <Route path="/projects" element={<Projects user={user} />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/join" element={<VolunteerApply />} />
                <Route path="/derdo" element={<DerdoChat />} />
                <Route 
                  path="/admin/*" 
                  element={
                    user?.role === UserRole.ADMIN ? (
                      <AdminDashboard />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </HashRouter>
      </FirestoreProvider>
    </LanguageProvider>
  );
};

export default App;
