
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, UserPlus, Bot, MessageSquare, Sparkles, Star, Globe, Shield,
  Target, Heart, Users, Briefcase, GraduationCap, Trophy
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useFirestore } from '../context/FirestoreContext';
import { Partner, Stat } from '../types';
import { auth, isAdmin as checkIsAdmin } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Home: React.FC = () => {
  const { t } = useLanguage();
  const { partners, stats, siteAssets, isLoading } = useFirestore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsAdmin(checkIsAdmin(user));
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return; // Don't set images yet if still loading from DB

    const images = siteAssets
      .filter(asset => asset.key === 'hero_images' && asset.type === 'image')
      .map(asset => asset.url);

    if (images.length > 0) {
      setHeroImages(images);
    } else {
      // Fallback if none in DB and NOT loading
      setHeroImages([
        "https://picsum.photos/seed/vizioni1/1920/1080",
        "https://picsum.photos/seed/vizioni2/1920/1080",
        "https://picsum.photos/seed/vizioni3/1920/1080"
      ]);
    }
  }, [siteAssets, isLoading]);

  useEffect(() => {
    if (heroImages.length === 0) return;
    const timer = setInterval(() => {
      setActiveHeroIdx((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  return (
    <div className="flex flex-col">
      {/* Hero Section - Born from the Logo Colors */}
      <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
        {/* Dynamic Background Accents */}
        <div className="absolute top-0 right-0 w-2/3 h-full opacity-15 pointer-events-none">
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-brand-pink rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-lime rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-brand-orange rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="text-left">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-brand-dark leading-[1.1] mb-10 uppercase tracking-tighter animate-in slide-in-from-left duration-1000">
              {t('hero.title1')}<br />
              <span className="gradient-text">
                {t('hero.title2')}
              </span>
            </h1>
            <p className="text-base md:text-xl text-slate-500 max-w-xl mb-12 font-medium leading-relaxed animate-in fade-in duration-1000 delay-300">
              {t('hero.desc')}
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 animate-in slide-in-from-bottom-8 duration-1000 delay-500">
              <Link to="/join" className="px-10 py-4 sm:px-12 sm:py-5 bg-brand-pink text-white rounded-full font-black uppercase text-[10px] sm:text-xs btn-glow-pink transition-all shadow-2xl shadow-brand-pink/30 tracking-widest flex items-center justify-center">
                {t('hero.apply')} <UserPlus className="ml-3 h-5 w-5" />
              </Link>
              <Link to="/projects" className="px-10 py-4 sm:px-12 sm:py-5 bg-brand-dark text-white rounded-full font-black uppercase text-[10px] sm:text-xs hover:bg-slate-800 transition-all shadow-2xl shadow-brand-dark/20 tracking-widest flex items-center justify-center group">
                {t('hero.projects')} <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="relative h-[300px] sm:h-[400px] lg:h-[600px] animate-in fade-in duration-1000 delay-200 mt-12 lg:mt-0">
            {/* Gradient Borders around the image stack */}
            <div className="absolute inset-0 bg-brand-pink rounded-[2rem] lg:rounded-[3rem] rotate-3 translate-x-4 translate-y-4 opacity-10"></div>
            <div className="absolute inset-0 bg-brand-lime rounded-[2rem] lg:rounded-[3rem] -rotate-3 -translate-x-4 -translate-y-4 opacity-10"></div>

            <div className="relative h-full w-full group cursor-pointer" onClick={() => setActiveHeroIdx((activeHeroIdx + 1) % heroImages.length)}>
              {heroImages.map((src, idx) => (
                <motion.div
                  key={idx}
                  initial={false}
                  animate={{
                    scale: activeHeroIdx === idx ? 1 : 0.9,
                    rotate: activeHeroIdx === idx ? 0 : (idx % 2 === 0 ? 3 : -3),
                    opacity: activeHeroIdx === idx ? 1 : 0,
                    zIndex: activeHeroIdx === idx ? 10 : 0,
                    x: activeHeroIdx === idx ? 0 : (idx < activeHeroIdx ? -100 : 100)
                  }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white"
                >
                  <img
                    src={src}
                    alt={`Hero ${idx}`}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent"></div>
                </motion.div>
              ))}

              <div className="absolute bottom-8 lg:bottom-12 left-8 lg:left-12 right-8 lg:right-12 z-20">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white">
                    <Shield className="h-5 w-5 lg:h-6 lg:h-6" />
                  </div>
                  <div className="text-white">
                    <h4 className="font-black uppercase text-[10px] lg:text-xs tracking-widest">Iniciativa e Shpresës</h4>
                    <p className="text-[8px] lg:text-[10px] font-bold text-slate-300 uppercase">Fshati Shalë, Lipjan</p>
                  </div>
                </div>

                {/* Indicators */}
                <div className="flex space-x-2">
                  {heroImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setActiveHeroIdx(i); }}
                      className={`h-1 rounded-full transition-all duration-500 ${activeHeroIdx === i ? 'w-8 bg-brand-pink' : 'w-2 bg-white/30 hover:bg-white/60'}`}
                    ></button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Horizontal Scrollable */}
      <section className="py-20 px-6 bg-slate-50/30 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex overflow-x-auto pb-8 gap-8 snap-x no-scrollbar">
            {stats.length > 0 ? stats.map((stat, i) => {
              const IconComponent = ({
                Star, Globe, UserPlus, Sparkles, Target, Heart, Users, Briefcase, GraduationCap, Trophy
              } as any)[stat.iconName] || Star;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="flex-none w-[220px] sm:w-[260px] flex flex-col items-center text-center p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden snap-center"
                >
                  <div className={`mb-6 p-4 rounded-3xl ${stat.bg} group-hover:scale-110 transition-transform ${stat.color} shadow-inner`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className={`text-4xl font-black uppercase tracking-tighter mb-3 ${stat.color} leading-none`}>{stat.value}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-tight max-w-[150px]">{stat.label}</div>
                </motion.div>
              );
            }) : (
              // Fallback to show something if DB is empty
              [
                { value: '500+', label: 'TË RINJ TË TRAJNUAR', icon: Star, color: 'text-brand-pink', bg: 'bg-brand-pink/10' },
                { value: '25+', label: 'PROJEKTE TË PËRFUNDUARA', icon: Globe, color: 'text-brand-lime', bg: 'bg-brand-lime/10' },
                { value: '100+', label: 'VULLNETARË AKTIVË', icon: UserPlus, color: 'text-brand-cyan', bg: 'bg-brand-cyan/10' },
                { value: 'LIPJAN', label: 'RAJONI I MBULUAR', icon: Sparkles, color: 'text-brand-orange', bg: 'bg-brand-orange/10' }
              ].map((stat, i) => (
                <div key={i} className="flex-none w-[220px] sm:w-[260px] flex flex-col items-center text-center p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm transition-all snap-center">
                  <div className={`mb-6 p-4 rounded-3xl ${stat.bg} ${stat.color} shadow-inner`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className={`text-4xl font-black uppercase tracking-tighter mb-3 ${stat.color} leading-none`}>{stat.value}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-tight max-w-[150px]">{stat.label}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Partners & Donors Section */}
      {partners.length > 0 && (
        <section className="py-24 px-6 overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center mb-16">

              <h2 className="text-4xl md:text-5xl font-black text-brand-dark uppercase tracking-tighter">
                {t('home.partners.title')}
              </h2>
            </div>

            <div className="relative overflow-hidden">
              <div className="flex animate-marquee whitespace-nowrap gap-12 md:gap-20 items-center hover:[animation-play-state:paused]">
                {/* Double the array for seamless loop */}
                {[...partners, ...partners, ...partners].map((partner, idx) => (
                  <a
                    key={`${partner.id}-${idx}`}
                    href={partner.website || '#'}
                    target={partner.website ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="inline-flex flex-none group relative"
                  >
                    <div className="w-32 h-32 md:w-40 md:h-40 grayscale hover:grayscale-0 opacity-40 hover:opacity-100 transition-all duration-500 flex items-center justify-center p-4">
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="max-w-full max-h-full object-contain filter drop-shadow-sm group-hover:drop-shadow-xl transition-all"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                      <span className="text-[8px] font-black uppercase tracking-widest text-brand-orange bg-brand-orange/5 px-3 py-1 rounded-full">
                        {partner.name}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* AI Bot Section - Deep Dark with Orange Glow (Logo Right) */}
      <section className="py-24 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-brand-dark rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-16 group">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-orange/15 to-transparent pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-brand-orange/10 rounded-full blur-[100px]"></div>

            <div className="flex-grow z-10 text-center md:text-left">
              <div className="inline-flex items-center space-x-2 px-5 py-2 bg-white/5 text-brand-orange rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10">
                <Bot className="h-4 w-4" /> <span>{t('derdo.promo.tag')}</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-8 leading-none">
                {t('derdo.greeting')}
              </h2>
              <p className="text-slate-400 text-lg md:text-xl font-medium mb-12 max-w-xl leading-relaxed">
                {t('derdo.desc')}
              </p>
              <Link to="/derdo" className="inline-flex items-center space-x-4 bg-white text-brand-dark px-12 py-5 rounded-full font-black uppercase text-xs tracking-widest hover:bg-brand-orange hover:text-white transition-all shadow-2xl shadow-white/5 btn-glow-cyan">
                <MessageSquare className="h-5 w-5" /> <span>{t('derdo.chat')}</span>
              </Link>
            </div>

            <div className="w-full md:w-1/3 flex justify-center z-10">
              <div className="relative w-72 h-72 md:w-96 md:h-96">
                <div className="absolute inset-0 bg-brand-orange rounded-full opacity-10 animate-ping"></div>
                <div className="absolute inset-4 border-2 border-brand-orange/30 rounded-full animate-spin-slow"></div>
                <div className="absolute inset-10 border-2 border-white/10 rounded-full"></div>
                <div className="relative w-full h-full bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-700">
                  <Bot className="h-40 w-40 md:h-56 md:w-56 text-brand-orange drop-shadow-[0_0_40px_rgba(243,146,55,0.4)]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
