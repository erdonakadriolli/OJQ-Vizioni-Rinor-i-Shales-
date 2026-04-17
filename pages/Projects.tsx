
import React, { useState, useEffect } from 'react';
import { Search, Calendar, Info, ArrowRight, X, Image as ImageIcon, LayoutGrid, Maximize2 } from 'lucide-react';
import { Project, ProjectStatus, User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useFirestore } from '../context/FirestoreContext';

interface ProjectsProps {
  user: User | null;
}

const Projects: React.FC<ProjectsProps> = ({ user }) => {
  const { projects } = useFirestore();
  const [filter, setFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { t } = useLanguage();

  const filteredProjects = projects.filter(p => {
    const matchesFilter = filter === 'All' || p.status === filter;
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="pt-32 pb-24 px-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
          <div>
            <span className="text-brand-pink font-bold uppercase tracking-widest text-[10px] mb-4 block">{t('projects.tag')}</span>
            <h1 className="text-5xl md:text-6xl font-black text-brand-dark mb-6 uppercase tracking-tighter leading-none">
              {t('projects.title')}
            </h1>
            <p className="text-slate-500 font-medium max-w-xl text-lg leading-relaxed">
              {t('projects.desc')}
            </p>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-brand-pink transition-colors" />
            <input 
              type="text" 
              placeholder={t('projects.search')}
              className="pl-14 pr-8 py-4 bg-white border border-slate-200 rounded-3xl focus:ring-2 focus:ring-brand-pink outline-none w-full sm:w-80 shadow-sm font-bold transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-12 bg-white/50 p-2 rounded-3xl inline-flex border border-slate-100 shadow-sm">
          {[
            { id: 'All', label: t('projects.filter.all') },
            { id: 'Active', label: t('projects.filter.active') },
            { id: 'Completed', label: t('projects.filter.completed') }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f.id ? 'bg-brand-dark text-white shadow-xl translate-y-[-2px]' : 'text-slate-400 hover:text-brand-dark hover:bg-slate-50'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredProjects.map(project => (
            <div 
              key={project.id} 
              onClick={() => setSelectedProject(project)}
              className="bg-white rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-slate-100 flex flex-col group relative cursor-pointer hover:-translate-y-2 duration-500"
            >
              <div className="relative h-72 overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/20 to-transparent"></div>
                <div className="absolute top-8 left-8">
                  <span className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl ${
                    project.status === ProjectStatus.Active ? 'bg-brand-lime text-white' : 'bg-slate-700 text-white'
                  }`}>
                    {project.status === ProjectStatus.Active ? t('projects.filter.active') : t('projects.filter.completed')}
                  </span>
                </div>
                <div className="absolute bottom-8 left-8 right-8">
                  <h3 className="text-2xl font-black text-white uppercase leading-tight tracking-tighter group-hover:text-brand-pink transition-colors">
                    {project.title}
                  </h3>
                </div>
              </div>
              <div className="p-10 flex-grow flex flex-col">
                <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium line-clamp-3 italic">
                  "{project.description}"
                </p>
                <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex items-center text-slate-400">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{project.startDate}</span>
                  </div>
                  <div className="flex items-center text-brand-pink font-black text-[10px] uppercase tracking-widest">
                    {t('projects.details')} <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Project Detail Modal */}
        {selectedProject && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 md:p-12 bg-brand-dark/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in duration-300">
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-8 right-8 z-[70] bg-white/90 backdrop-blur-sm text-brand-dark p-3 rounded-full shadow-xl hover:bg-brand-pink hover:text-white transition-all"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Enhanced Visual Section */}
              <div className="w-full md:w-1/2 h-64 md:h-full bg-slate-900 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col">
                  {/* Hero Image */}
                  <div className="relative group w-full aspect-video md:aspect-[4/5]">
                    <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-6 right-6 p-2 bg-white/20 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="h-5 w-5" />
                    </div>
                  </div>
                  
                  {/* Gallery Grid */}
                  <div className="grid grid-cols-2 gap-px bg-slate-800">
                    {selectedProject.gallery?.map((img, i) => (
                      <div key={i} className="relative group aspect-square overflow-hidden bg-slate-900">
                        <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all group-hover:scale-110 duration-500" />
                        <div className="absolute inset-0 bg-brand-pink/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    ))}
                  </div>
                  
                  {(!selectedProject.gallery || selectedProject.gallery.length === 0) && (
                    <div className="p-20 flex flex-col items-center justify-center text-slate-700 bg-slate-900">
                       <ImageIcon className="h-12 w-12 mb-4 opacity-20" />
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-30">No additional photos</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 p-10 md:p-16 overflow-y-auto flex flex-col bg-white">
                <div className="mb-10">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest inline-block ${
                      selectedProject.status === ProjectStatus.Active ? 'bg-brand-lime text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {selectedProject.status}
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-brand-dark uppercase tracking-tighter mb-6 leading-[1.1]">{selectedProject.title}</h2>
                  <div className="h-1.5 w-20 bg-brand-pink rounded-full mb-10"></div>
                </div>

                <div className="space-y-8 flex-grow">
                   <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                      <h4 className="text-[10px] font-black text-brand-pink uppercase tracking-[0.2em] mb-4 flex items-center">
                        <Info className="h-4 w-4 mr-2" /> {t('projects.summary')}
                      </h4>
                      <p className="text-lg text-brand-dark font-semibold leading-relaxed italic">"{selectedProject.description}"</p>
                   </div>
                   
                   <div>
                      <h4 className="text-[10px] font-black text-brand-pink uppercase tracking-[0.2em] mb-4">{t('projects.impl')}</h4>
                      <div className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap text-sm">
                        {selectedProject.longDescription || "No additional implementation details provided for this project yet. Stay tuned for updates from our field team in Shale."}
                      </div>
                   </div>

                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
