
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDb } from '../services/mockDb';
import { StaffMember, User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { db as firestore } from '../firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import Logo from '../components/Logo';
import EditableText from '../components/EditableText';
import { motion } from 'motion/react';
import { 
  Users, Shield, Rocket, Target, 
  Heart, X, Facebook, Instagram, Linkedin, 
  Mail, Star, Quote, Award
} from 'lucide-react';

interface AboutProps {
  user: User | null;
}

const About: React.FC<AboutProps> = ({ user }) => {
  const { section } = useParams<{ section: string }>();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
  const [missionImages, setMissionImages] = useState<string[]>([]);
  const [activeMissionIdx, setActiveMissionIdx] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    const q = query(collection(firestore, 'staff'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const staffData: StaffMember[] = [];
      snapshot.forEach((doc) => {
        staffData.push({ id: doc.id, ...doc.data() } as StaffMember);
      });
      setStaff(staffData);
    });

    const assetsQuery = query(collection(firestore, 'site_assets'));
    const unsubscribeAssets = onSnapshot(assetsQuery, (snapshot) => {
      const images = snapshot.docs
        .map(doc => doc.data())
        .filter(asset => asset.key === 'mission_images' && asset.type === 'image')
        .map(asset => asset.url);
      
      if (images.length > 0) {
        setMissionImages(images);
      } else {
        // Fallback to defaults if none in DB
        setMissionImages(["/mission1.png", "/mission2.png", "/mission3.png"]);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeAssets();
    };
  }, []);

  useEffect(() => {
    if (missionImages.length === 0) return;
    const timer = setInterval(() => {
      setActiveMissionIdx((prev) => (prev + 1) % missionImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [missionImages.length]);

  const getStaffByCategory = (category: string) => {
    return staff.filter(member => member.category === category);
  };

  const renderMission = () => (
    <div className="space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      {/* Premium Hero Mission Split */}
      <section className="grid lg:grid-cols-12 gap-16 items-center pt-8">
        <div className="lg:col-span-7 space-y-8">

          <h1 className="text-4xl md:text-7xl text-brand-dark uppercase tracking-tighter leading-[0.9] font-black">
            <EditableText translationKey="about.hero.title1" /> <br/>
            <span className="text-brand-pink italic underline decoration-brand-lime/30 underline-offset-8">
              <EditableText translationKey="about.hero.title2" />
            </span> <br/>
            <EditableText translationKey="about.hero.title3" />
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-4xl">
            <EditableText translationKey="about.main.desc" multiline />
          </p>
        </div>
        <div className="lg:col-span-5">
          <div className="relative group cursor-pointer" onClick={() => setActiveMissionIdx((activeMissionIdx + 1) % missionImages.length)}>
            <div className="absolute -inset-4 bg-brand-pink/10 rounded-[2rem] blur-2xl group-hover:bg-brand-pink/20 transition-all duration-500"></div>
            <div className="relative aspect-[4/5] rounded-[2rem]">
              {missionImages.map((src, idx) => (
                <motion.div
                  key={idx}
                  initial={false}
                  animate={{
                    scale: activeMissionIdx === idx ? 1 : 0.9,
                    rotate: activeMissionIdx === idx ? 0 : (idx % 2 === 0 ? 3 : -3),
                    opacity: activeMissionIdx === idx ? 1 : 0,
                    zIndex: activeMissionIdx === idx ? 10 : 0,
                    x: activeMissionIdx === idx ? 0 : (idx < activeMissionIdx ? -50 : 50)
                  }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 rounded-[2rem] overflow-hidden border-8 border-white shadow-2xl bg-slate-100"
                >
                  <img 
                    src={src} 
                    alt={`Mission ${idx}`} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 via-transparent to-transparent"></div>
                </motion.div>
              ))}
              
              {/* Indicators */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                {missionImages.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={(e) => { e.stopPropagation(); setActiveMissionIdx(i); }}
                    className={`h-1 rounded-full transition-all duration-500 ${activeMissionIdx === i ? 'w-8 bg-brand-pink' : 'w-2 bg-white/50 hover:bg-white'}`}
                  ></button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Split */}
      <section className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
          <div className="w-12 h-12 bg-brand-pink/10 rounded-2xl flex items-center justify-center text-brand-pink mb-8 group-hover:scale-110 transition-transform">
            <Target className="h-6 w-6" />
          </div>
          <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-4">
            <EditableText translationKey="about.vision.title" />
          </h3>
          <p className="text-slate-500 font-medium leading-relaxed">
            <EditableText translationKey="about.vision.text" multiline />
          </p>
        </div>
        <div className="bg-brand-dark p-8 rounded-[2rem] text-white group hover:shadow-xl transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-lime/20 blur-3xl -mr-16 -mt-16"></div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-brand-lime mb-8 group-hover:scale-110 transition-transform">
            <Rocket className="h-6 w-6" />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-4">
            <EditableText translationKey="about.mission.title" />
          </h3>
          <p className="text-slate-300 font-medium leading-relaxed">
            <EditableText translationKey="about.mission.text" multiline />
          </p>
        </div>
      </section>

      {/* Programs Section */}
      <section className="space-y-12">
        <div className="flex flex-col items-center text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-brand-dark uppercase tracking-tighter">
            <EditableText translationKey="about.programs.title" />
          </h2>
          <div className="w-24 h-1 bg-brand-pink rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-50/50 p-6 rounded-[1.5rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform ${
                i === 1 ? 'bg-brand-pink' : i === 2 ? 'bg-brand-cyan' : 'bg-brand-orange'
              }`}>
                {i === 1 ? <Award className="h-5 w-5" /> : i === 2 ? <Users className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
              </div>
              <h4 className="text-xl font-black text-brand-dark uppercase tracking-tight mb-4">
                <EditableText translationKey={`about.programs.${i}.title`} />
              </h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                <EditableText translationKey={`about.programs.${i}.desc`} multiline />
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Simplified Banner for Activities */}
      <section className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 flex flex-col md:flex-row items-center gap-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-brand-pink"></div>
        <div className="md:w-1/3">
           <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-4">
             <EditableText translationKey="about.activities.title" />
           </h3>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
             <EditableText translationKey="about.activities.desc" multiline />
           </p>
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
           {[1, 2, 3, 4, 5].map(i => (
             <div key={i} className="flex items-center space-x-4 p-4 bg-slate-50/50 rounded-2xl group hover:bg-white hover:shadow-lg hover:shadow-brand-pink/5 transition-all">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-pink group-hover:scale-150 transition-transform"></div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight group-hover:text-brand-dark">
                  <EditableText translationKey={`about.activities.list${i}`} />
                </span>
             </div>
           ))}
        </div>
      </section>
    </div>
  );

  const renderStaff = () => (
    <div className="space-y-32 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      {/* Executive Spotlight */}
      <section>
        <div className="flex flex-col items-center mb-24">

          <h2 className="text-4xl md:text-7xl font-black text-brand-dark uppercase tracking-tighter text-center leading-none">
            <EditableText translationKey="about.staff.title" />
          </h2>
          <div className="w-24 h-1.5 bg-brand-pink mt-6 rounded-full"></div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-16 max-w-6xl mx-auto px-4">
          {[...getStaffByCategory('Executive Director'), ...getStaffByCategory('Current Staff')].map(m => (
            <div key={m.id} onClick={() => setSelectedMember(m)} className="group cursor-pointer flex flex-col items-center text-center">
              <div className="relative mb-8">
                <div className="w-64 h-64 border-[12px] border-brand-pink transition-all duration-500 group-hover:scale-105 group-hover:rotate-2 shadow-2xl overflow-hidden bg-slate-100">
                  <img src={m.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                </div>
              </div>
              <h3 className="font-black text-brand-dark uppercase text-3xl mb-1 tracking-tighter leading-none">{m.name}</h3>
              <p className="text-[10px] font-black text-brand-pink uppercase tracking-[0.3em] mb-6">{m.role}</p>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8 line-clamp-3 px-8">
                {m.bio || "Një vizionar/e që punon pa rreshtur për të fuqizuar rininë e Shalës."}
              </p>
              <div className="flex space-x-6 pt-4 border-t border-slate-100 w-full justify-center">
                {m.socials?.facebook && <a href={m.socials.facebook} target="_blank" rel="noopener noreferrer"><Facebook className="h-4 w-4 text-brand-dark hover:text-brand-pink transition-colors" /></a>}
                {m.socials?.instagram && <a href={m.socials.instagram} target="_blank" rel="noopener noreferrer"><Instagram className="h-4 w-4 text-brand-dark hover:text-brand-pink transition-colors" /></a>}
                {m.socials?.linkedin && <a href={m.socials.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin className="h-4 w-4 text-brand-dark hover:text-brand-pink transition-colors" /></a>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Members Assembly Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center mb-16">

          <h2 className="text-3xl md:text-6xl font-black text-brand-dark uppercase tracking-tighter text-center mb-4 leading-none">
            <EditableText translationKey="about.structure.assembly" />
          </h2>
          <div className="w-20 h-1 bg-brand-cyan mb-12 rounded-full"></div>
          
          {/* Logo Section removed as per user request */}
          <div className="mb-12">
            {/* Logo removed */}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {getStaffByCategory('Members Assembly').map(m => (
            <div key={m.id} onClick={() => setSelectedMember(m)} className="group cursor-pointer flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-brand-cyan/20 group-hover:border-brand-cyan transition-all duration-500 overflow-hidden bg-slate-100">
                  <img src={m.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                </div>
              </div>
              <h3 className="font-black text-brand-dark uppercase text-[11px] mb-1 tracking-tighter leading-none">{m.name}</h3>
              <p className="text-[8px] font-black text-brand-cyan uppercase tracking-[0.2em]">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Board of Directors */}
      <section>
        <div className="flex flex-col items-center mb-24">

          <h2 className="text-3xl md:text-6xl font-black text-brand-dark uppercase tracking-tighter text-center leading-none">
            <EditableText translationKey="about.structure.board" />
          </h2>
          <div className="w-20 h-1 bg-brand-blue mt-6 rounded-full"></div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-16 max-w-6xl mx-auto px-4">
          {getStaffByCategory('Board of Directors').map(m => (
            <div key={m.id} onClick={() => setSelectedMember(m)} className="group cursor-pointer flex flex-col items-center text-center">
              <div className="relative mb-8">
                <div className="w-56 h-56 border-[10px] border-brand-blue transition-all duration-500 group-hover:scale-105 group-hover:-rotate-2 shadow-xl overflow-hidden bg-slate-100">
                  <img src={m.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                </div>
              </div>
              <h3 className="font-black text-brand-dark uppercase text-2xl mb-1 tracking-tighter leading-none">{m.name}</h3>
              <p className="text-[10px] font-black text-brand-blue uppercase tracking-[0.3em] mb-4">{m.role}</p>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 line-clamp-2 px-6">
                {m.bio || "Anëtar i bordit drejtues me përvojë të gjerë në menaxhim."}
              </p>
              <div className="flex space-x-4 pt-4 border-t border-slate-100 w-full justify-center">
                {m.socials?.facebook && <a href={m.socials.facebook} target="_blank" rel="noopener noreferrer"><Facebook className="h-4 w-4 text-brand-dark hover:text-brand-blue transition-colors" /></a>}
                {m.socials?.linkedin && <a href={m.socials.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin className="h-4 w-4 text-brand-dark hover:text-brand-blue transition-colors" /></a>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Volunteers */}
      <section>
        <div className="flex flex-col items-center mb-24">

          <h2 className="text-3xl md:text-6xl font-black text-brand-dark uppercase tracking-tighter text-center leading-none">
            <EditableText translationKey="about.structure.volunteers" />
          </h2>
          <div className="w-20 h-1 bg-brand-lime mt-6 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 max-w-6xl mx-auto px-4">
          {getStaffByCategory('Volunteers').map(m => (
            <div key={m.id} onClick={() => setSelectedMember(m)} className="group cursor-pointer flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-40 h-40 border-[8px] border-brand-lime transition-all duration-500 group-hover:scale-105 shadow-lg overflow-hidden bg-slate-100">
                  <img src={m.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                </div>
              </div>
              <h3 className="font-black text-brand-dark uppercase text-base mb-1 tracking-tighter leading-none">{m.name}</h3>
              <p className="text-[9px] font-black text-brand-lime uppercase tracking-[0.2em]">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Luxury Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-brand-dark/95 backdrop-blur-xl animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden relative animate-in zoom-in duration-400">
              <button onClick={() => setSelectedMember(null)} className="absolute top-8 right-8 p-4 bg-slate-50 hover:bg-brand-pink hover:text-white rounded-full transition-all z-20 shadow-sm"><X className="h-5 w-5" /></button>
              <div className="flex flex-col md:flex-row h-full">
                 <div className="w-full md:w-1/2 aspect-square bg-slate-100">
                    <img src={selectedMember.image} className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1 p-10 md:p-12 flex flex-col justify-center">
                    <div className="mb-8">
                      <span className="text-[9px] font-black text-brand-pink uppercase tracking-[0.4em] mb-3 block">{selectedMember.category}</span>
                      <h3 className="text-3xl font-black text-brand-dark uppercase tracking-tighter mb-2 leading-none">{selectedMember.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{selectedMember.role}</p>
                    </div>
                    <div className="relative mb-10">
                       <Quote className="absolute -top-6 -left-6 h-12 w-12 text-slate-50 -z-10" />
                       <p className="text-base text-slate-600 font-medium leading-relaxed italic relative z-10">
                          {selectedMember.bio || "Një vizionar/e që punon pa rreshtur për të fuqizuar rininë e Shalës."}
                       </p>
                    </div>
                    <div className="flex items-center space-x-4 pt-8 border-t border-slate-100">
                       <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-brand-pink hover:text-white transition-all"><Facebook className="h-4 w-4" /></a>
                       <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-brand-pink hover:text-white transition-all"><Instagram className="h-4 w-4" /></a>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Modern Compact Switcher */}
        <div className="flex items-center justify-center mb-24">
          <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-[2.5rem] border border-slate-100 shadow-lg flex items-center group">
            <button 
              onClick={() => window.location.hash = '#/about/mission'} 
              className={`px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${(!section || section === 'mission') ? 'bg-brand-dark text-white shadow-xl scale-105' : 'text-slate-400 hover:text-brand-dark hover:bg-white'}`}
            >
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>{t('nav.mission')}</span>
              </div>
            </button>
            <button 
              onClick={() => window.location.hash = '#/about/staff'} 
              className={`px-10 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${section === 'staff' ? 'bg-brand-dark text-white shadow-xl scale-105' : 'text-slate-400 hover:text-brand-dark hover:bg-white'}`}
            >
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{t('nav.staff')}</span>
              </div>
            </button>
          </div>
        </div>
        
        {section === 'staff' ? renderStaff() : renderMission()}
      </div>
    </div>
  );
};

export default About;
