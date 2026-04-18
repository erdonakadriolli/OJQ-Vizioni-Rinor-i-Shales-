
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, ShieldAlert, Chrome } from 'lucide-react';
import Logo from '../components/Logo';
import { User, UserRole } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { auth, adminEmails } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';

const Login: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      const isAdmin = adminEmails.includes(firebaseUser.email || '');
      const userData: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email || '',
        role: isAdmin ? UserRole.ADMIN : UserRole.VOLUNTEER
      };
      
      onLogin(userData);
      navigate(isAdmin ? '/admin' : '/projects');
    } catch (err: any) {
      console.error("Google Login Error:", err);
      setError(err.message || "Dështoi hyrja me Google.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      
      const isAdmin = adminEmails.includes(firebaseUser.email || '');
      const userData: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email || '',
        role: isAdmin ? UserRole.ADMIN : UserRole.VOLUNTEER
      };
      
      onLogin(userData);
      navigate(isAdmin ? '/admin' : '/projects');
    } catch (err: any) {
      console.error("Email Login Error:", err);
      setError(t('login.error') || 'Email ose fjalëkalimi i gabuar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-32 pb-12 px-6 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-pink/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-cyan/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="p-10">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center">
                {/* Logo removed as per user request */}
              </div>
              <h2 className="text-3xl font-black text-brand-dark uppercase mt-6 tracking-tight">{t('login.title')}</h2>
              <p className="text-slate-500 mt-2 font-medium">{t('login.subtitle')}</p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded-r-xl flex items-center uppercase tracking-wider">
                <ShieldAlert className="h-5 w-5 mr-3 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">{t('login.email')}</label>
                <input 
                  type="email" 
                  required
                  placeholder="admin@vizionirinorishales.org"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-pink outline-none transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">{t('login.password')}</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-pink outline-none transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="flex items-center">
                  <input type="checkbox" id="remember" className="h-4 w-4 text-brand-pink focus:ring-brand-pink border-slate-300 rounded" />
                  <label htmlFor="remember" className="ml-3 block text-xs font-bold text-slate-500 uppercase">{t('login.remember')}</label>
                </div>
                <a href="#" className="text-xs font-bold text-brand-pink uppercase tracking-wider hover:underline">{t('login.forgot')}</a>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-brand-dark text-white rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center mb-4"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-3" />
                    {t('login.button')}
                  </>
                )}
              </button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-slate-400 font-black tracking-widest">Ose</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-5 bg-white text-slate-700 border border-slate-200 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center"
              >
                <Chrome className="h-5 w-5 mr-3 text-brand-blue" />
                Hyr me Google
              </button>
            </form>
          </div>
          
          <div className="bg-slate-50 p-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm font-medium">
              {t('login.noaccount')} <Link to="/join" className="font-black text-brand-pink uppercase hover:underline">{t('login.register')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
