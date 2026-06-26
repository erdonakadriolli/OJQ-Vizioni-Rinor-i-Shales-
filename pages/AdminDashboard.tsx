
import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, FolderKanban, Users,
  Plus, Edit2, Trash2, X, Newspaper, Briefcase, Camera,
  Facebook, Instagram, Linkedin, Calendar, Sparkles, Loader2,
  CheckCircle, XCircle, Eye, FileText, ExternalLink, Image as ImageIcon,
  Save, Globe, Search as SearchIcon, Filter, Upload, File,
  Home, Info, Target, FolderKanban as ProjectIcon, Handshake, MessageSquare,
  Star, UserPlus, Heart, GraduationCap, Trophy
} from 'lucide-react';
import { Project, ApplicationStatus, ProjectStatus, NewsItem, StaffMember, VolunteerApplication, Partner } from '../types';
import { GoogleGenAI } from "@google/genai";
import { useLanguage, translations } from '../context/LanguageContext';
import { useFirestore } from '../context/FirestoreContext';
import { db as firestore, auth, handleFirestoreError, OperationType, uploadFileToStorage } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, addDoc, where, getDocs } from 'firebase/firestore';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'applications' | 'news' | 'staff' | 'home' | 'about' | 'mission' | 'partners' | 'stats' | 'assets'>('overview');
  const { 
    staff: firestoreStaff, 
    projects: firestoreProjects, 
    news: firestoreNews, 
    partners: firestorePartners, 
    stats: firestoreStats, 
    applications: firestoreApplications, 
    siteAssets: firestoreAssets 
  } = useFirestore();
  const { t, language } = useLanguage();

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showAppDetails, setShowAppDetails] = useState<VolunteerApplication | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [newsSearch, setNewsSearch] = useState('');
  const [newsFilter, setNewsFilter] = useState('All');

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [editingStat, setEditingStat] = useState<any>(null);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string, id: string } | null>(null);

  const staffImageRef = useRef<HTMLInputElement>(null);
  const projectImageRef = useRef<HTMLInputElement>(null);
  const projectGalleryRef = useRef<HTMLInputElement>(null);
  const reportFileRef = useRef<HTMLInputElement>(null);
  const partnerLogoRef = useRef<HTMLInputElement>(null);
  const assetFileRef = useRef<HTMLInputElement>(null);
  const heroTitleRef = useRef<HTMLInputElement>(null);
  const heroDescRef = useRef<HTMLTextAreaElement>(null);
  const aboutDescRef = useRef<HTMLTextAreaElement>(null);
  const missionContentRef = useRef<HTMLTextAreaElement>(null);

  const [staffForm, setStaffForm] = useState({
    name: '', role: '', category: 'Current Staff', bio: '', image: '',
    socials: { facebook: '', instagram: '', linkedin: '' }
  });

  const [partnerForm, setPartnerForm] = useState({
    name: '', logo: '', website: ''
  });

  const [projectForm, setProjectForm] = useState<{
    title: string;
    description: string;
    longDescription: string;
    startDate: string;
    endDate: string;
    status: ProjectStatus;
    image: string;
    volunteerCount: number;
    gallery: string[];
  }>({
    title: '', description: '', longDescription: '', startDate: '', endDate: '',
    status: ProjectStatus.Active, image: '', volunteerCount: 0, gallery: []
  });

  const [newsForm, setNewsForm] = useState({
    title: '', content: '', datePosted: '', category: 'Latest News', fileUrl: '', fileName: ''
  });

  const [statsForm, setStatsForm] = useState({
    value: '',
    label: '',
    iconName: 'Star',
    color: 'text-brand-pink',
    bg: 'bg-brand-pink/10'
  });

  const [assetForm, setAssetForm] = useState({
    url: '',
    key: 'hero_images',
    type: 'image'
  });

  useEffect(() => {
    // Shared listeners are now managed by FirestoreContext
  }, []);

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(base64Str); // Fallback to original if error
    });
  };

  const handleFileRead = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const path = `reports/${Date.now()}_${file.name}`;
        const url = await uploadFileToStorage(file, path);
        setNewsForm(prev => ({ ...prev, fileUrl: url, fileName: file.name }));
        setSuccessMessage(language === 'AL' ? "Dokumenti u ngarkua!" : "Document uploaded!");
        setTimeout(() => setSuccessMessage(null), 2000);
      } catch (err) {
        console.error(err);
        showError(language === 'AL' ? "Dështoi ngarkimi i dokumentit." : "Document upload failed.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleOpenPartnerModal = (p?: Partner) => {
    if (p) {
      setEditingPartner(p);
      setPartnerForm({ name: p.name, logo: p.logo, website: p.website || '' });
    } else {
      setEditingPartner(null);
      setPartnerForm({ name: '', logo: '', website: '' });
    }
    setShowPartnerModal(true);
  };

  const handleSavePartner = async () => {
    if (!partnerForm.name) return;

    const partnerData = {
      name: partnerForm.name,
      logo: partnerForm.logo || 'https://via.placeholder.com/150',
      website: partnerForm.website
    };

    try {
      if (editingPartner) {
        await updateDoc(doc(firestore, 'partners', editingPartner.id), partnerData);
      } else {
        await addDoc(collection(firestore, 'partners'), partnerData);
      }
      setSuccessMessage('Partneri u ruajt me sukses!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setShowPartnerModal(false);
      setEditingPartner(null);
    } catch (err) {
      console.error(err);
      try {
        handleFirestoreError(err, OperationType.WRITE, 'partners');
      } catch (firestoreErr: any) {
        const errData = JSON.parse(firestoreErr.message);
        showError(`Gabim: ${errData.error}`);
      }
    }
  };

  const handleSaveSiteContent = async (key: string, value: string) => {
    if (!value) return;
    try {
      const q = query(collection(firestore, 'site_content'), where('key', '==', key));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        await addDoc(collection(firestore, 'site_content'), {
          key,
          [language]: value,
          [language === 'AL' ? 'EN' : 'AL']: translations[language === 'AL' ? 'EN' : 'AL'][key] || value
        });
      } else {
        const docId = snapshot.docs[0].id;
        await updateDoc(doc(firestore, 'site_content', docId), {
          [language]: value
        });
      }
      setSuccessMessage('Ndryshimet u ruajtën!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
      showError('Gabim gjatë ruajtjes!');
    }
  };

  const handleOpenStatsModal = (stat: any = null) => {
    if (stat) {
      setEditingStat(stat);
      setStatsForm({
        value: stat.value,
        label: stat.label,
        iconName: stat.iconName || 'Star',
        color: stat.color || 'text-brand-pink',
        bg: stat.bg || 'bg-brand-pink/10'
      });
    } else {
      setEditingStat(null);
      setStatsForm({
        value: '',
        label: '',
        iconName: 'Star',
        color: 'text-brand-pink',
        bg: 'bg-brand-pink/10'
      });
    }
    setShowStatsModal(true);
  };

  const handleSaveStat = async () => {
    const statData = {
      value: statsForm.value,
      label: statsForm.label,
      iconName: statsForm.iconName,
      color: statsForm.color,
      bg: statsForm.bg
    };

    try {
      if (editingStat) {
        await updateDoc(doc(firestore, 'stats', editingStat.id), statData);
        setSuccessMessage('Statistika u përditësua!');
      } else {
        await addDoc(collection(firestore, 'stats'), statData);
        setSuccessMessage('Statistika u shtua!');
      }
      setShowStatsModal(false);
      setEditingStat(null);
    } catch (err) {
      console.error(err);
      try {
        handleFirestoreError(err, OperationType.WRITE, 'stats');
      } catch (firestoreErr: any) {
        const errData = JSON.parse(firestoreErr.message);
        showError(`Gabim: ${errData.error}`);
      }
    }
  };

  const handleOpenAssetModal = (asset: any = null) => {
    if (asset) {
      setEditingAsset(asset);
      setAssetForm({
        url: asset.url,
        key: asset.key,
        type: asset.type
      });
    } else {
      setEditingAsset(null);
      setAssetForm({
        url: '',
        key: 'hero_images',
        type: 'image'
      });
    }
    setShowAssetModal(true);
  };

  const handleSaveAsset = async () => {
    if (!assetForm.url || !assetForm.key) return;

    const assetData = {
      url: assetForm.url,
      key: assetForm.key,
      type: assetForm.type
    };

    try {
      if (editingAsset) {
        await updateDoc(doc(firestore, 'site_assets', editingAsset.id), assetData);
        setSuccessMessage('Asseti u përditësua!');
      } else {
        await addDoc(collection(firestore, 'site_assets'), assetData);
        setSuccessMessage('Asseti u shtua!');
      }
      setShowAssetModal(false);
      setEditingAsset(null);
    } catch (err) {
      console.error(err);
      try {
        handleFirestoreError(err, OperationType.WRITE, 'site_assets');
      } catch (firestoreErr: any) {
        const errData = JSON.parse(firestoreErr.message);
        showError(`Gabim: ${errData.error}`);
      }
    }
  };

  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const path = `assets/${Date.now()}_${file.name}`;
        const url = await uploadFileToStorage(file, path);
        setAssetForm(prev => ({ ...prev, url: url }));
        setSuccessMessage("Asseti u ngarkua!");
        setTimeout(() => setSuccessMessage(null), 2000);
      } catch (err) {
        console.error(err);
        showError("Dështoi ngarkimi i assetit.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const seedInitialStats = async () => {
    const initialStats = [
      { value: '500+', label: 'TË RINJ TË TRAJNUAR', iconName: 'Star', color: 'text-brand-pink', bg: 'bg-brand-pink/10' },
      { value: '25+', label: 'PROJEKTE TË PËRFUNDUARA', iconName: 'Globe', color: 'text-brand-lime', bg: 'bg-brand-lime/10' },
      { value: '100+', label: 'VULLNETARË AKTIVË', iconName: 'UserPlus', color: 'text-brand-cyan', bg: 'bg-brand-cyan/10' },
      { value: 'LIPJAN', label: 'RAJONI I MBULUAR', iconName: 'Sparkles', color: 'text-brand-orange', bg: 'bg-brand-orange/10' }
    ];

    try {
      for (const stat of initialStats) {
        await addDoc(collection(firestore, 'stats'), stat);
      }
      setSuccessMessage('Statistikat fillestare u shtuan sipas fotos!');
    } catch (err) {
      console.error(err);
      showError('Gabim gjatë shtimit të statistikave fillestare.');
    }
  };

  const handlePartnerLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const path = `partners/${Date.now()}_${file.name}`;
        const url = await uploadFileToStorage(file, path);
        setPartnerForm(prev => ({ ...prev, logo: url }));
        setSuccessMessage("Logo u ngarkua!");
        setTimeout(() => setSuccessMessage(null), 2000);
      } catch (err) {
        console.error(err);
        showError("Dështoi ngarkimi i logos.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (projectForm.gallery.length + files.length > 8) {
      showError(language === 'AL' ? "Maksimumi 8 foto në galeri." : "Maximum 8 photos in gallery.");
      return;
    }

    setIsUploading(true);
    try {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const path = `projects/gallery/${Date.now()}_${files[i].name}`;
        const url = await uploadFileToStorage(files[i], path);
        newImages.push(url);
      }
      setProjectForm(prev => ({ ...prev, gallery: [...prev.gallery, ...newImages] }));
      setSuccessMessage("Fotot e galerisë u ngarkuan!");
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      console.error(err);
      showError("Dështoi ngarkimi i galerisë.");
    } finally {
      setIsUploading(false);
    }
  };

  const generateWithAi = async (promptType: 'project' | 'news') => {
    const title = promptType === 'project' ? projectForm.title : newsForm.title;
    if (!title) return showError(t('admin.title') + " required!");

    setIsAiGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const prompt = promptType === 'project'
        ? `Write an inspiring and detailed description for a project titled "${title}" for the NGO "Vizioni Rinor i Shalës" (VRSH) in the village of Shale, Lipjan. Focus on youth empowerment and community impact. Do not use "**" for bolding; use clear structure instead. Language: ${language === 'AL' ? 'Albanian' : 'English'}.`
        : `Write a professional and engaging news article/summary for "${title}" for the NGO "Vizioni Rinor i Shalës" (VRSH). The tone should be positive and community-focused. Do not use "**" for bolding; use clear structure instead. Language: ${language === 'AL' ? 'Albanian' : 'English'}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      const result = response.text || "";
      if (promptType === 'project') setProjectForm(prev => ({ ...prev, description: result }));
      else setNewsForm(prev => ({ ...prev, content: result }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleOpenNewsModal = (item?: NewsItem) => {
    if (item) {
      setEditingNews(item);
      setNewsForm({
        title: item.title,
        content: item.content,
        datePosted: item.datePosted,
        category: item.category,
        fileUrl: item.fileUrl || '',
        fileName: item.fileName || ''
      });
    } else {
      setEditingNews(null);
      setNewsForm({
        title: '', content: '', datePosted: new Date().toISOString().split('T')[0],
        category: 'Latest News', fileUrl: '', fileName: ''
      });
    }
    setShowNewsModal(true);
  };

  const handleSaveNews = async () => {
    if (!newsForm.title) return;

    const newsData = {
      title: newsForm.title,
      content: newsForm.content,
      datePosted: newsForm.datePosted,
      category: newsForm.category,
      fileUrl: newsForm.fileUrl,
      fileName: newsForm.fileName
    };

    try {
      if (editingNews) {
        await updateDoc(doc(firestore, 'news', editingNews.id), newsData);
      } else {
        await addDoc(collection(firestore, 'news'), newsData);
      }
      setSuccessMessage('Lajmi u ruajt me sukses!');
      setShowNewsModal(false);
      setEditingNews(null);
    } catch (err) {
      console.error(err);
      try {
        handleFirestoreError(err, OperationType.WRITE, 'news');
      } catch (firestoreErr: any) {
        const errData = JSON.parse(firestoreErr.message);
        showError(`Gabim: ${errData.error}`);
      }
    }
  };

  const handleOpenProjectModal = (p?: Project) => {
    if (p) {
      setEditingProject(p);
      setProjectForm({
        title: p.title, description: p.description, longDescription: p.longDescription || '',
        startDate: p.startDate, endDate: p.endDate, status: p.status,
        image: p.image, volunteerCount: p.volunteerCount, gallery: p.gallery || []
      });
    } else {
      setEditingProject(null);
      setProjectForm({
        title: '', description: '', longDescription: '', startDate: new Date().toISOString().split('T')[0],
        endDate: '', status: ProjectStatus.Active, image: '', volunteerCount: 0, gallery: []
      });
    }
    setShowProjectModal(true);
  };

  const handleSaveProject = async () => {
    if (!projectForm.title) return;

    if (!auth.currentUser) {
      showError('Duhet të jeni të kyçur me Google për të ruajtur në DB');
      return;
    }

    const projectData = {
      title: projectForm.title,
      description: projectForm.description,
      longDescription: projectForm.longDescription,
      startDate: projectForm.startDate,
      endDate: projectForm.endDate,
      status: projectForm.status,
      image: projectForm.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
      volunteerCount: projectForm.volunteerCount,
      gallery: projectForm.gallery
    };

    try {
      if (editingProject) {
        await updateDoc(doc(firestore, 'projects', editingProject.id), projectData);
      } else {
        await addDoc(collection(firestore, 'projects'), projectData);
      }
      setSuccessMessage('Projekti u ruajt me sukses!');
      setShowProjectModal(false);
      setEditingProject(null);
    } catch (err) {
      console.error(err);
      try {
        handleFirestoreError(err, OperationType.WRITE, 'projects');
      } catch (firestoreErr: any) {
        const errData = JSON.parse(firestoreErr.message);
        showError(`Gabim: ${errData.error}`);
      }
    }
  };

  const handleOpenStaffModal = (s?: StaffMember) => {
    if (s) {
      setEditingStaff(s);
      setStaffForm({
        name: s.name, role: s.role, category: s.category, bio: s.bio, image: s.image,
        socials: { facebook: s.socials?.facebook || '', instagram: s.socials?.instagram || '', linkedin: s.socials?.linkedin || '' }
      });
    } else {
      setEditingStaff(null);
      setStaffForm({ name: '', role: '', category: 'Current Staff', bio: '', image: '', socials: { facebook: '', instagram: '', linkedin: '' } });
    }
    setShowStaffModal(true);
  };

  const handleSaveStaff = async () => {
    if (!staffForm.name) return;

    if (!auth.currentUser) {
      showError('Duhet të jeni të kyçur me Google për të ruajtur në DB');
      return;
    }

    const staffData = {
      name: staffForm.name,
      role: staffForm.role,
      category: staffForm.category,
      bio: staffForm.bio,
      image: staffForm.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
      socials: staffForm.socials
    };

    try {
      if (editingStaff) {
        await updateDoc(doc(firestore, 'staff', editingStaff.id), staffData);
      } else {
        await addDoc(collection(firestore, 'staff'), staffData);
      }
      setSuccessMessage('Stafi u ruajt me sukses në DB!');
      setShowStaffModal(false);
      setEditingStaff(null);
    } catch (err) {
      console.error(err);
      try {
        handleFirestoreError(err, OperationType.WRITE, 'staff');
      } catch (firestoreErr: any) {
        const errData = JSON.parse(firestoreErr.message);
        showError(`Gabim: ${errData.error}`);
      }
    }
  };

  const handleAppAction = async (appId: string, status: ApplicationStatus) => {
    try {
      await updateDoc(doc(firestore, 'applications', appId), { status });
      setSuccessMessage('Statusi i aplikimit u përditësua!');
      setShowAppDetails(null);
    } catch (err) {
      console.error(err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, 'applications');
      } catch (firestoreErr: any) {
        const errData = JSON.parse(firestoreErr.message);
        showError(`Gabim: ${errData.error}`);
      }
    }
  };

  const deleteItem = (type: string, id: string) => {
    setDeleteConfirm({ type, id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;

    try {
      await deleteDoc(doc(firestore, type, id));
      setSuccessMessage('Elementi u fshi me sukses!');
    } catch (err) {
      console.error(err);
      try {
        handleFirestoreError(err, OperationType.DELETE, type);
      } catch (firestoreErr: any) {
        const errData = JSON.parse(firestoreErr.message);
        showError(`Gabim: ${errData.error}`);
      }
    }

    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Nav */}
      <aside className="w-full md:w-64 bg-brand-dark flex-shrink-0 text-white z-20 shadow-2xl">
        <div className="p-8 sticky top-0 h-screen flex flex-col">
          <div className="flex items-center space-x-4 mb-12 group cursor-pointer">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-pink to-brand-orange flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em] block leading-none mb-1">NGO Portal</span>
              <span className="text-sm font-black uppercase tracking-widest block leading-none">{t('admin.panel')}</span>
            </div>
          </div>
          <nav className="space-y-3 flex-grow overflow-y-auto custom-scrollbar pr-2">
            {[
              { id: 'overview', icon: LayoutDashboard, label: t('admin.overview'), color: 'text-brand-pink', bg: 'hover:bg-brand-pink/10' },
              { id: 'home', icon: Home, label: t('nav.home'), color: 'text-brand-blue', bg: 'hover:bg-brand-blue/10' },
              { id: 'about', icon: Info, label: t('nav.about'), color: 'text-brand-cyan', bg: 'hover:bg-brand-cyan/10' },
              { id: 'mission', icon: Target, label: t('nav.mission'), color: 'text-brand-lime', bg: 'hover:bg-brand-lime/10' },
              { id: 'projects', icon: ProjectIcon, label: t('admin.projects'), color: 'text-brand-pink', bg: 'hover:bg-brand-pink/10' },
              { id: 'news', icon: Newspaper, label: t('admin.news'), color: 'text-brand-lime', bg: 'hover:bg-brand-lime/10' },
              { id: 'staff', icon: Briefcase, label: t('admin.staff'), color: 'text-brand-blue', bg: 'hover:bg-brand-blue/10' },
              { id: 'partners', icon: Handshake, label: t('admin.partners'), color: 'text-brand-orange', bg: 'hover:bg-brand-orange/10' },
              { id: 'assets', icon: ImageIcon, label: 'Assetet e Faqes', color: 'text-brand-cyan', bg: 'hover:bg-brand-cyan/10' },
              { id: 'stats', icon: Star, label: 'Statistikat', color: 'text-brand-pink', bg: 'hover:bg-brand-pink/10' },
              { id: 'applications', icon: Users, label: t('admin.applications'), color: 'text-brand-orange', bg: 'hover:bg-brand-orange/10' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all font-black uppercase text-[10px] tracking-[0.15em] relative group ${activeTab === item.id ? 'bg-white/10 text-white shadow-xl' : `text-white/40 ${item.bg} hover:text-white`}`}
              >
                {activeTab === item.id && (
                  <div className={`absolute left-0 w-1.5 h-6 rounded-r-full ${item.color.replace('text-', 'bg-')} shadow-[0_0_15px_rgba(255,255,255,0.3)]`}></div>
                )}
                <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${activeTab === item.id ? item.color : 'text-white/20 group-hover:text-white/60'}`} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-white/5">
            <div className="bg-white/5 rounded-2xl p-4 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-brand-pink/20 flex items-center justify-center text-brand-pink font-black text-xs">A</div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black text-white truncate">Admin User</p>
                <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest truncate">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-10 pt-28 md:pt-28 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          {successMessage && (
            <div className="fixed top-6 right-6 z-[100] bg-brand-lime text-white px-6 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-2xl animate-in slide-in-from-right duration-300 flex items-center">
              <CheckCircle className="h-3.5 w-3.5 mr-2" /> {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="fixed top-6 right-6 z-[100] bg-red-500 text-white px-6 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-2xl animate-in slide-in-from-right duration-300 flex items-center">
              <XCircle className="h-3.5 w-3.5 mr-2" /> {errorMessage}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-10 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-brand-dark uppercase tracking-tight">{t('admin.management')}</h1>
                <div className="bg-white px-4 py-1.5 rounded-full border border-slate-100 flex items-center shadow-sm">
                  <Globe className="h-3.5 w-3.5 text-brand-cyan mr-2" />
                  <span className="text-[9px] font-black uppercase text-slate-400">{language}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: t('admin.projects'), value: firestoreProjects.length, icon: ProjectIcon, color: 'text-brand-pink', bg: 'bg-brand-pink/10', border: 'border-brand-pink/20' },
                  { label: t('admin.applications'), value: firestoreApplications.length, icon: Users, color: 'text-brand-cyan', bg: 'bg-brand-cyan/10', border: 'border-brand-cyan/20' },
                  { label: t('admin.staff'), value: firestoreStaff.length, icon: Briefcase, color: 'text-brand-blue', bg: 'hover:bg-brand-blue/10', border: 'border-brand-blue/20' },
                  { label: t('admin.partners'), value: firestorePartners.length, icon: Handshake, color: 'text-brand-orange', bg: 'hover:bg-brand-orange/10', border: 'border-brand-orange/20' },
                  { label: t('admin.news'), value: firestoreNews.length, icon: Newspaper, color: 'text-brand-lime', bg: 'hover:bg-brand-lime/10', border: 'border-brand-lime/20' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700 opacity-50`}></div>
                    <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-all shadow-sm border ${stat.border}`}>
                      <stat.icon className="h-7 w-7" />
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mb-2 relative z-10">{stat.label}</p>
                    <p className="text-4xl font-black text-brand-dark relative z-10 tabular-nums">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Home Tab */}
          {activeTab === 'home' && (
            <div className="space-y-10 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-brand-dark uppercase tracking-tight">{t('nav.home')}</h1>
              </div>
              <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Hero Title</label>
                    <input
                      ref={heroTitleRef}
                      type="text"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all"
                      defaultValue={t('hero.title1')}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Hero Subtitle</label>
                    <textarea
                      ref={heroDescRef}
                      rows={4}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all resize-none"
                      defaultValue={t('hero.desc')}
                    />
                  </div>
                  <button
                    onClick={() => {
                      handleSaveSiteContent('hero.title1', heroTitleRef.current?.value || '');
                      handleSaveSiteContent('hero.desc', heroDescRef.current?.value || '');
                    }}
                    className="px-8 py-4 bg-brand-blue text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {t('admin.save')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-10 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-brand-dark uppercase tracking-tight">{t('nav.about')}</h1>
              </div>
              <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">About Description</label>
                    <textarea
                      ref={aboutDescRef}
                      rows={6}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-brand-cyan/10 transition-all resize-none"
                      defaultValue={t('about.main.desc')}
                    />
                  </div>
                  <button
                    onClick={() => handleSaveSiteContent('about.main.desc', aboutDescRef.current?.value || '')}
                    className="px-8 py-4 bg-brand-cyan text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-brand-cyan/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {t('admin.save')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mission Tab */}
          {activeTab === 'mission' && (
            <div className="space-y-10 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-brand-dark uppercase tracking-tight">{t('nav.mission')}</h1>
              </div>
              <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Mission Content</label>
                    <textarea
                      ref={missionContentRef}
                      rows={8}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-brand-lime/10 transition-all resize-none"
                      defaultValue={t('about.main.goal')}
                    />
                  </div>
                  <button
                    onClick={() => handleSaveSiteContent('about.main.goal', missionContentRef.current?.value || '')}
                    className="px-8 py-4 bg-brand-lime text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-brand-lime/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {t('admin.save')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-brand-dark uppercase">{t('admin.projects')}</h1>
                <button onClick={() => handleOpenProjectModal()} className="bg-brand-pink text-white px-6 py-3 rounded-full font-black uppercase text-[9px] tracking-widest flex items-center shadow-lg hover:scale-105 transition-all">
                  <Plus className="h-3.5 w-3.5 mr-2" /> {t('admin.addProject')}
                </button>
              </div>
              <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase">{t('admin.title')}</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase">{t('admin.status')}</th>
                      <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase">{t('admin.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {firestoreProjects.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 flex items-center space-x-3">
                          <img src={p.image} className="w-10 h-10 rounded-xl object-cover" />
                          <span className="font-bold text-xs text-brand-dark">{p.title}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-slate-100 rounded-full text-[7px] font-black uppercase tracking-widest text-slate-500">{p.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-1">
                          <button onClick={() => handleOpenProjectModal(p)} className="p-2 text-slate-400 hover:text-brand-pink rounded-lg"><Edit2 className="h-3.5 w-3.5" /></button>
                          <button onClick={() => deleteItem('projects', p.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg"><Trash2 className="h-3.5 w-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* News Tab */}
          {activeTab === 'news' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <h1 className="text-3xl font-black text-brand-dark uppercase">{t('admin.news')}</h1>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input
                      type="text"
                      placeholder={t('projects.search')}
                      className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-full text-xs font-bold outline-none focus:ring-2 focus:ring-brand-pink shadow-sm w-48 sm:w-64"
                      value={newsSearch}
                      onChange={(e) => setNewsSearch(e.target.value)}
                    />
                  </div>
                  <button onClick={() => handleOpenNewsModal()} className="bg-brand-lime text-white px-8 py-3.5 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center shadow-lg hover:scale-105 transition-all">
                    <Plus className="h-4 w-4 mr-2" /> {t('admin.addNews')}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.title')}</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.category')}</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {firestoreNews.filter(n => {
                      const matchesSearch = n.title.toLowerCase().includes(newsSearch.toLowerCase());
                      const matchesFilter = newsFilter === 'All' || n.category === newsFilter;
                      return matchesSearch && matchesFilter;
                    }).map(n => (
                      <tr key={n.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6 font-bold text-sm text-brand-dark line-clamp-1">{n.title}</td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${n.category === 'Reports' ? 'bg-brand-cyan/10 text-brand-cyan' : 'bg-slate-100 text-slate-500'
                            }`}>
                            {n.category === 'Reports' ? t('news.title.reports') : n.category}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right space-x-1">
                          <button onClick={() => handleOpenNewsModal(n)} className="p-2.5 text-slate-400 hover:text-brand-pink rounded-xl"><Edit2 className="h-4 w-4" /></button>
                          <button onClick={() => deleteItem('news', n.id)} className="p-2.5 text-slate-400 hover:text-red-500 rounded-xl"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-black text-brand-dark uppercase tracking-tight">{t('admin.staff')}</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Menaxhimi i ekipit dhe bashkëpunëtorëve</p>
                </div>
                <button onClick={() => handleOpenStaffModal()} className="bg-brand-cyan text-white px-8 py-3.5 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center shadow-lg hover:scale-105 transition-all">
                  <Plus className="h-4 w-4 mr-2" /> {t('admin.addStaff')}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {firestoreStaff.map(s => (
                  <div key={s.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col h-full">
                    <div className="absolute top-6 right-6 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      <button onClick={() => handleOpenStaffModal(s)} className="p-2.5 bg-white shadow-lg rounded-xl text-slate-400 hover:text-brand-cyan transition-colors"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => deleteItem('staff', s.id)} className="p-2.5 bg-white shadow-lg rounded-xl text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>

                    <div className="flex items-start space-x-5 mb-6">
                      <div className="relative flex-shrink-0">
                        <img src={s.image} className="w-20 h-20 rounded-[2rem] object-cover border-4 border-slate-50 shadow-inner" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-cyan rounded-lg flex items-center justify-center text-white shadow-lg">
                          <Briefcase className="h-3 w-3" />
                        </div>
                      </div>
                      <div className="pt-2">
                        <h3 className="font-black text-lg text-brand-dark leading-tight">{s.name}</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{s.role}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-[8px] font-black uppercase tracking-widest">{s.category}</span>
                      </div>
                    </div>

                    <div className="flex-grow">
                      {s.bio && (
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-6 font-medium italic">
                          "{s.bio}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div className="flex space-x-3">
                        {s.socials?.facebook && (
                          <a href={s.socials.facebook} target="_blank" rel="noreferrer" className="p-2 bg-slate-50 text-brand-blue rounded-xl hover:bg-brand-blue hover:text-white transition-all">
                            <Facebook className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {s.socials?.instagram && (
                          <a href={s.socials.instagram} target="_blank" rel="noreferrer" className="p-2 bg-slate-50 text-brand-pink rounded-xl hover:bg-brand-pink hover:text-white transition-all">
                            <Instagram className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {s.socials?.linkedin && (
                          <a href={s.socials.linkedin} target="_blank" rel="noreferrer" className="p-2 bg-slate-50 text-brand-cyan rounded-xl hover:bg-brand-cyan hover:text-white transition-all">
                            <Linkedin className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="w-2 h-2 rounded-full bg-brand-cyan/20"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Partners Tab */}
          {activeTab === 'partners' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-black text-brand-dark uppercase tracking-tight">{t('admin.partners')}</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Menaxhimi i partnerëve dhe donatorëve</p>
                </div>
                <button onClick={() => handleOpenPartnerModal()} className="bg-brand-orange text-white px-8 py-3.5 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center shadow-lg hover:scale-105 transition-all">
                  <Plus className="h-4 w-4 mr-2" /> {t('admin.addPartner')}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {firestorePartners.map(p => (
                  <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col items-center text-center">
                    <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleOpenPartnerModal(p)} className="p-2 text-slate-400 hover:text-brand-orange rounded-lg"><Edit2 className="h-3.5 w-3.5" /></button>
                      <button onClick={() => deleteItem('partners', p.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center p-4 mb-6 border border-slate-100">
                      <img src={p.logo} alt={p.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <h3 className="font-black text-sm text-brand-dark uppercase tracking-tight mb-2">{p.name}</h3>
                    {p.website && (
                      <a href={p.website} target="_blank" rel="noreferrer" className="text-[9px] font-bold text-brand-orange uppercase tracking-widest flex items-center hover:underline">
                        Visit Website <ExternalLink className="h-2.5 w-2.5 ml-1" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assets Tab */}
          {activeTab === 'assets' && (
            <div className="space-y-10 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-black text-brand-dark uppercase tracking-tight">Assetet e Faqes</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Menaxhoni imazhet globale të faqes (Hero, Mission, etj.)</p>
                </div>
                <button
                  onClick={() => handleOpenAssetModal()}
                  className="flex items-center space-x-3 bg-brand-cyan text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-brand-cyan/20 hover:scale-105 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Shto Asset</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {['hero_images', 'mission_images'].map(key => (
                  <div key={key} className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                      <h2 className="text-sm font-black text-brand-dark uppercase tracking-widest">{key.replace('_', ' ')}</h2>
                      <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-[8px] font-black uppercase tracking-widest">
                        {firestoreAssets.filter(a => a.key === key).length} Imazhe
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {firestoreAssets.filter(a => a.key === key).map(asset => (
                        <div key={asset.id} className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden">
                          <div className="aspect-video rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 mb-4">
                            <img src={asset.url} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex items-center justify-between px-2">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{asset.type}</span>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleOpenAssetModal(asset)}
                                className="p-2 text-slate-300 hover:text-brand-cyan transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteItem('site_assets', asset.id)}
                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {firestoreAssets.filter(a => a.key === key).length === 0 && (
                        <div className="col-span-full py-12 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300">
                          <ImageIcon className="h-8 w-8 mb-2 opacity-20" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Nuk ka imazhe</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-10 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-black text-brand-dark uppercase tracking-tight">Statistikat e Organizatës</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Menaxhoni shifrat kryesore në faqen kryesore</p>
                </div>
                <div className="flex space-x-4">
                  {firestoreStats.length === 0 && (
                    <button
                      onClick={seedInitialStats}
                      className="flex items-center space-x-3 bg-brand-dark text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-brand-dark/20 hover:scale-105 transition-all"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Shto Statistika Fillestare</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenStatsModal()}
                    className="flex items-center space-x-3 bg-brand-pink text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-brand-pink/20 hover:scale-105 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Shto Statistikë</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {firestoreStats.map((stat, idx) => (
                  <div key={stat.id} className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 space-y-8 group hover:shadow-xl transition-all relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner`}>
                          {(() => {
                            const Icon = { Star, Globe, UserPlus, Sparkles, Target, Heart, Users, Briefcase, GraduationCap, Trophy }[stat.iconName] || Star;
                            return <Icon className="h-7 w-7" />;
                          })()}
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Statistika {idx + 1}</span>
                          <h3 className="font-black text-brand-dark uppercase tracking-tight">{stat.label}</h3>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenStatsModal(stat)}
                          className="p-3 bg-slate-50 text-slate-400 hover:bg-brand-pink hover:text-white rounded-2xl transition-all shadow-sm"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => deleteItem('stats', stat.id)}
                          className="p-3 bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Vlera</p>
                        <p className="text-2xl font-black text-brand-dark">{stat.value}</p>
                      </div>
                      <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Përshkrimi</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase leading-tight">{stat.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="space-y-8 animate-in fade-in">
              <h1 className="text-3xl font-black text-brand-dark uppercase">{t('admin.applications')}</h1>
              <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">{t('admin.applicant')}</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase">{t('admin.status')}</th>
                      <th className="px-8 py-5 text-right">{t('admin.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {firestoreApplications.map(app => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6 font-bold text-sm text-brand-dark">{app.userName}</td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${app.status === ApplicationStatus.APPROVED ? 'bg-brand-lime/10 text-brand-lime' : 'bg-slate-100 text-slate-500'}`}>{app.status}</span>
                        </td>
                        <td className="px-8 py-6 text-right space-x-2">
                          <button onClick={() => setShowAppDetails(app)} className="p-2.5 text-slate-400 hover:text-brand-cyan rounded-xl"><Eye className="h-4 w-4" /></button>
                          <button onClick={() => deleteItem('applications', app.id)} className="p-2.5 text-slate-400 hover:text-red-500 rounded-xl"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* NEWS & REPORTS MODAL */}
      {showNewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-brand-dark uppercase tracking-tight">
                  {editingNews ? t('admin.editNews') : t('admin.addNews')}
                </h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Menaxhoni lajmet dhe raportet</p>
              </div>
              <button onClick={() => setShowNewsModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all group">
                <X className="h-6 w-6 text-slate-400 group-hover:text-brand-dark transition-colors" />
              </button>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('admin.title')}</label>
                <input type="text" className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime transition-all" value={newsForm.title} onChange={e => setNewsForm(prev => ({ ...prev, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('admin.category')}</label>
                  <select className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime transition-all appearance-none" value={newsForm.category} onChange={e => setNewsForm(prev => ({ ...prev, category: e.target.value }))}>
                    <option value="Latest News">{t('news.title.latest')}</option>
                    <option value="Media">{t('news.title.media')}</option>
                    <option value="Reports">{t('news.title.reports')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('admin.date')}</label>
                  <input type="date" className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime transition-all" value={newsForm.datePosted} onChange={e => setNewsForm(prev => ({ ...prev, datePosted: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Përmbajtja</label>
                  <button onClick={() => generateWithAi('news')} disabled={isAiGenerating} className="text-[9px] font-black text-brand-orange uppercase flex items-center hover:scale-105 transition-transform">
                    {isAiGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
                    {t('admin.generateAi')}
                  </button>
                </div>
                <textarea rows={4} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-sm outline-none resize-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime transition-all" value={newsForm.content} onChange={e => setNewsForm(prev => ({ ...prev, content: e.target.value }))} />
              </div>
              <div className="space-y-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-inner">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                    Burimi i Dokumentit / Media
                  </label>
                  {newsForm.category === 'Reports' && (
                    <span className="text-[8px] font-bold text-brand-pink uppercase tracking-tighter">
                      Max 1MB për upload
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* File Upload Option */}
                  <div className="space-y-3">
                    <div 
                      onClick={() => reportFileRef.current?.click()} 
                      className={`cursor-pointer py-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all relative group shadow-sm ${
                        newsForm.fileName ? 'border-brand-cyan bg-brand-cyan/5' : 'border-slate-200 bg-white hover:bg-slate-100'
                      }`}
                    >
                      {newsForm.fileName ? (
                        <div className="flex items-center text-brand-cyan">
                          <File className="h-5 w-5 mr-3" />
                          <span className="text-xs font-bold truncate max-w-[200px]">{newsForm.fileName}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setNewsForm(prev => ({ ...prev, fileName: '', fileUrl: '' })); }} 
                            className="ml-3 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <Upload className="h-4 w-4 text-slate-300 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                            {language === 'AL' ? "Ngarko Dokument (Max 1MB)" : "Upload Document (Max 1MB)"}
                          </span>
                        </div>
                      )}
                    </div>
                    <input type="file" hidden ref={reportFileRef} accept=".pdf,.doc,.docx" onChange={handleDocUpload} />
                  </div>

                  <div className="relative flex items-center">
                    <div className="flex-grow h-px bg-slate-200"></div>
                    <span className="px-3 text-[8px] font-black text-slate-300 uppercase tracking-widest">OSE</span>
                    <div className="flex-grow h-px bg-slate-200"></div>
                  </div>

                  {/* External Link Option */}
                  <div className="relative group">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-brand-lime transition-colors" />
                    <input 
                      type="text" 
                      placeholder={language === 'AL' ? "Linku i Dokumentit (Google Drive, etj)..." : "Document Link (Google Drive, etc)..."}
                      className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime transition-all" 
                      value={newsForm.fileUrl && !newsForm.fileUrl.startsWith('data:') ? newsForm.fileUrl : ''} 
                      onChange={e => {
                        const val = e.target.value;
                        setNewsForm(prev => ({ 
                          ...prev, 
                          fileUrl: val,
                          fileName: val ? (val.length > 30 ? val.substring(0, 30) + '...' : val) : '' 
                        }));
                      }} 
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowNewsModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-200 transition-all">{t('admin.cancel')}</button>
                <button onClick={handleSaveNews} className="flex-[2] py-4 bg-brand-lime text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-brand-lime/20 flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-all">
                  <Save className="h-4 w-4 mr-2" /> {t('admin.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROJECT MODAL */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-brand-dark uppercase tracking-tight">{editingProject ? t('admin.editProject') : t('admin.addProject')}</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Menaxhoni projektet e organizatës</p>
              </div>
              <button onClick={() => setShowProjectModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all group">
                <X className="h-6 w-6 text-slate-400 group-hover:text-brand-dark transition-colors" />
              </button>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('admin.title')}</label>
                  <input type="text" className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all" value={projectForm.title} onChange={e => setProjectForm(prev => ({ ...prev, title: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('admin.status')}</label>
                  <select className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all appearance-none" value={projectForm.status} onChange={e => setProjectForm(prev => ({ ...prev, status: e.target.value as ProjectStatus }))}>
                    <option value={ProjectStatus.Active}>{t('projects.filter.active')}</option>
                    <option value={ProjectStatus.Completed}>{t('projects.filter.completed')}</option>
                    <option value={ProjectStatus.Upcoming}>Upcoming</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('admin.startDate') || 'Data e Fillimit'}</label>
                  <input type="date" className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all" value={projectForm.startDate} onChange={e => setProjectForm(prev => ({ ...prev, startDate: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('admin.endDate') || 'Data e Përfundimit'}</label>
                  <input type="date" className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all" value={projectForm.endDate} onChange={e => setProjectForm(prev => ({ ...prev, endDate: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Numri i Pjesëmarrësve / Vullnetarëve</label>
                <input type="number" className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all" value={projectForm.volunteerCount} onChange={e => setProjectForm(prev => ({ ...prev, volunteerCount: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Përmbledhja (AI)</label>
                  <button onClick={() => generateWithAi('project')} disabled={isAiGenerating} className="text-[9px] font-black text-brand-orange uppercase flex items-center hover:scale-105 transition-transform">
                    {isAiGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />} Gjenero me AI
                  </button>
                </div>
                <textarea rows={2} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-sm outline-none resize-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all" value={projectForm.description} onChange={e => setProjectForm(prev => ({ ...prev, description: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('projects.impl')}</label>
                <textarea rows={4} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-sm outline-none resize-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all" value={projectForm.longDescription} onChange={e => setProjectForm(prev => ({ ...prev, longDescription: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('admin.mainImage')}</label>
                  <div onClick={() => projectImageRef.current?.click()} className="cursor-pointer aspect-video border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center overflow-hidden bg-slate-50 hover:bg-slate-100 transition-all relative group shadow-inner">
                    {projectForm.image ? (
                      <>
                        <img src={projectForm.image} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button onClick={(e) => { e.stopPropagation(); setProjectForm(prev => ({ ...prev, image: '' })); }} className="p-3 bg-red-500 text-white rounded-2xl transform scale-90 group-hover:scale-100 transition-all"><Trash2 className="h-5 w-5" /></button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <Camera className="text-slate-300 h-10 w-10 mx-auto mb-2" />
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Foto Kryesore</span>
                      </div>
                    )}
                  </div>
                  <input type="file" hidden ref={projectImageRef} accept="image/*" onChange={async e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setIsUploading(true);
                      try {
                        const path = `projects/hero/${Date.now()}_${file.name}`;
                        const url = await uploadFileToStorage(file, path);
                        setProjectForm(prev => ({ ...prev, image: url }));
                        setSuccessMessage("Imazhi i projektit u ngarkua!");
                        setTimeout(() => setSuccessMessage(null), 2000);
                      } catch (err) {
                        console.error(err);
                        showError("Dështoi ngarkimi i imazhit.");
                      } finally {
                        setIsUploading(false);
                      }
                    }
                  }} />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('admin.gallery')}</label>
                  <div className="flex flex-col space-y-4">
                    <button onClick={() => projectGalleryRef.current?.click()} className="py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center bg-slate-50 text-[10px] font-black uppercase text-slate-400 hover:bg-slate-100 transition-all shadow-inner"><Plus className="h-4 w-4 mr-2" /> Shto Foto në Galeri</button>
                    <input type="file" hidden ref={projectGalleryRef} multiple accept="image/*" onChange={handleGalleryUpload} />
                    <div className="grid grid-cols-4 gap-3">
                      {projectForm.gallery.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 group shadow-sm">
                          <img src={img} className="w-full h-full object-cover" />
                          <button onClick={() => setProjectForm(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== idx) }))} className="absolute inset-0 bg-red-500/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><X className="h-5 w-5" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <button onClick={handleSaveProject} className="w-full py-4.5 bg-brand-pink text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-brand-pink/20 flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-all">
                  <Save className="h-4 w-4 mr-2" /> {t('admin.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAFF MODAL */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-brand-dark uppercase tracking-tight">{editingStaff ? t('admin.editStaff') : t('admin.addStaff')}</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Plotësoni të dhënat e anëtarit</p>
              </div>
              <button onClick={() => setShowStaffModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all group">
                <X className="h-6 w-6 text-slate-400 group-hover:text-brand-dark transition-colors" />
              </button>
            </div>
            <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Emri i Plotë</label>
                  <input type="text" className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan transition-all" value={staffForm.name} onChange={e => setStaffForm(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Roli / Pozita</label>
                  <input type="text" className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan transition-all" value={staffForm.role} onChange={e => setStaffForm(prev => ({ ...prev, role: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Kategoria</label>
                <select className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan transition-all appearance-none" value={staffForm.category} onChange={e => setStaffForm(prev => ({ ...prev, category: e.target.value }))}>
                  <option value="Executive Director">Executive Director</option>
                  <option value="Current Staff">Current Staff</option>
                  <option value="Members Assembly">Members Assembly</option>
                  <option value="Board of Directors">Board of Directors</option>
                  <option value="Volunteers">Volunteers</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Bio / Përshkrimi</label>
                <textarea rows={3} className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-sm outline-none resize-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan transition-all" value={staffForm.bio} onChange={e => setStaffForm(prev => ({ ...prev, bio: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Foto e Profilat</label>
                  <div onClick={() => staffImageRef.current?.click()} className="cursor-pointer h-40 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center overflow-hidden bg-slate-50 hover:bg-slate-100 transition-all relative group shadow-inner">
                    {staffForm.image ? (
                      <>
                        <img src={staffForm.image} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button onClick={(e) => { e.stopPropagation(); setStaffForm(prev => ({ ...prev, image: '' })); }} className="p-3 bg-red-500 text-white rounded-2xl transform scale-90 group-hover:scale-100 transition-all"><Trash2 className="h-5 w-5" /></button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <Camera className="text-slate-300 h-10 w-10 mx-auto mb-2" />
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Kliko për të ngarkuar</span>
                      </div>
                    )}
                  </div>
                  <input type="file" hidden ref={staffImageRef} accept="image/*" onChange={async e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setIsUploading(true);
                      try {
                        const path = `staff/${Date.now()}_${file.name}`;
                        const url = await uploadFileToStorage(file, path);
                        setStaffForm(prev => ({ ...prev, image: url }));
                        setSuccessMessage("Foto e stafit u ngarkua!");
                        setTimeout(() => setSuccessMessage(null), 2000);
                      } catch (err) {
                        console.error(err);
                        showError("Dështoi ngarkimi i fotos.");
                      } finally {
                        setIsUploading(false);
                      }
                    }
                  }} />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Rrjetet Sociale</label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 group">
                      <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue group-focus-within:bg-brand-blue group-focus-within:text-white transition-all">
                        <Facebook className="h-4 w-4" />
                      </div>
                      <input type="text" placeholder="Facebook URL" className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all" value={staffForm.socials.facebook} onChange={e => setStaffForm(prev => ({ ...prev, socials: { ...prev.socials, facebook: e.target.value } }))} />
                    </div>
                    <div className="flex items-center space-x-3 group">
                      <div className="w-10 h-10 bg-brand-pink/10 rounded-xl flex items-center justify-center text-brand-pink group-focus-within:bg-brand-pink group-focus-within:text-white transition-all">
                        <Instagram className="h-4 w-4" />
                      </div>
                      <input type="text" placeholder="Instagram URL" className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-brand-pink/20 transition-all" value={staffForm.socials.instagram} onChange={e => setStaffForm(prev => ({ ...prev, socials: { ...prev.socials, instagram: e.target.value } }))} />
                    </div>
                    <div className="flex items-center space-x-3 group">
                      <div className="w-10 h-10 bg-brand-cyan/10 rounded-xl flex items-center justify-center text-brand-cyan group-focus-within:bg-brand-cyan group-focus-within:text-white transition-all">
                        <Linkedin className="h-4 w-4" />
                      </div>
                      <input type="text" placeholder="LinkedIn URL" className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-brand-cyan/20 transition-all" value={staffForm.socials.linkedin} onChange={e => setStaffForm(prev => ({ ...prev, socials: { ...prev.socials, linkedin: e.target.value } }))} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <button onClick={handleSaveStaff} className="w-full py-4.5 bg-brand-cyan text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-brand-cyan/20 flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-all">
                  <Save className="h-4 w-4 mr-2" /> {t('admin.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPLICATION DETAILS MODAL */}
      {showAppDetails && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-dark/90 backdrop-blur-xl">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">{t('admin.applicationDetails')}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Shqyrtimi i aplikimit për vullnetarizëm</p>
              </div>
              <button onClick={() => setShowAppDetails(null)} className="p-3 hover:bg-slate-200 rounded-2xl transition-all group">
                <X className="h-7 w-7 text-slate-400 group-hover:text-brand-dark transition-colors" />
              </button>
            </div>
            <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Informacione Personale</p>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Emri i Plotë</p>
                        <p className="font-black text-brand-dark text-lg">{showAppDetails.userName}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Email</p>
                        <p className="font-black text-brand-dark">{showAppDetails.userEmail}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Statusi Aktual</p>
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${showAppDetails.status === ApplicationStatus.APPROVED ? 'bg-brand-lime animate-pulse' : 'bg-slate-300'}`}></div>
                      <span className="font-black text-sm uppercase tracking-widest text-brand-dark">{showAppDetails.status}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Mesazhi / Motivimi</p>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                      "{showAppDetails.motivation || "Nuk ka mesazh të bashkangjitur."}"
                    </p>
                  </div>

                  <div className="bg-brand-cyan/5 p-6 rounded-3xl border border-brand-cyan/10">
                    <p className="text-[10px] font-black text-brand-cyan uppercase tracking-[0.2em] mb-3">Projekti i Synuar</p>
                    <div className="flex items-center space-x-3">
                      <FolderKanban className="h-5 w-5 text-brand-cyan" />
                      <p className="font-black text-brand-dark">{firestoreProjects.find(p => p.id === showAppDetails.projectId)?.title || "Projekt i panjohur"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => handleAppAction(showAppDetails.id, ApplicationStatus.REJECTED)}
                  className="flex-1 py-4.5 bg-slate-100 text-slate-500 rounded-[1.5rem] font-black uppercase text-[11px] tracking-widest hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
                >
                  <XCircle className="h-5 w-5 mr-2" /> {t('admin.reject')}
                </button>
                <button
                  onClick={() => handleAppAction(showAppDetails.id, ApplicationStatus.APPROVED)}
                  className="flex-[2] py-4.5 bg-brand-lime text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-brand-lime/20 flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <CheckCircle className="h-5 w-5 mr-2" /> {t('admin.approve')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partner Modal */}
      {showPartnerModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm" onClick={() => setShowPartnerModal(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-black text-brand-dark uppercase tracking-tight">
                {editingPartner ? t('admin.editPartner') : t('admin.addPartner')}
              </h2>
              <button onClick={() => setShowPartnerModal(false)} className="p-2 hover:bg-white rounded-xl transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('admin.partnerName')}</label>
                <input
                  type="text"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all"
                  value={partnerForm.name}
                  onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('admin.partnerWebsite')}</label>
                <input
                  type="url"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all"
                  value={partnerForm.website}
                  onChange={(e) => setPartnerForm({ ...partnerForm, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('admin.partnerLogo')}</label>
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group relative">
                    {partnerForm.logo ? (
                      <>
                        <img src={partnerForm.logo} className="w-full h-full object-contain p-2" />
                        <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="h-5 w-5 text-white" />
                        </div>
                      </>
                    ) : (
                      <Upload className="h-6 w-6 text-slate-300" />
                    )}
                    <input
                      type="file"
                      ref={partnerLogoRef}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={handlePartnerLogoUpload}
                    />
                  </div>
                  <div className="flex-grow space-y-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed">Rekomandohet format PNG me sfond transparent.</p>
                    <button
                      onClick={() => partnerLogoRef.current?.click()}
                      className="text-[9px] font-black text-brand-orange uppercase tracking-widest hover:underline"
                    >
                      Zgjidh skedarin
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex space-x-4">
              <button
                onClick={handleSavePartner}
                className="flex-grow bg-brand-orange text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-brand-orange/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {t('admin.save')}
              </button>
              <button
                onClick={() => setShowPartnerModal(false)}
                className="px-8 bg-white text-slate-400 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-slate-200 hover:bg-slate-50 transition-all"
              >
                {t('admin.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md" onClick={() => setShowAssetModal(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">{editingAsset ? 'Edito Asset' : 'Shto Asset'}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Përcaktoni imazhin dhe kategorinë</p>
              </div>
              <button onClick={() => setShowAssetModal(false)} className="p-3 hover:bg-white rounded-2xl transition-all group">
                <X className="h-7 w-7 text-slate-400 group-hover:text-brand-dark transition-colors" />
              </button>
            </div>
            <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Kategoria (Key)</label>
                <select
                  className="w-full px-8 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs outline-none focus:ring-4 focus:ring-brand-cyan/10 transition-all appearance-none"
                  value={assetForm.key}
                  onChange={(e) => setAssetForm({ ...assetForm, key: e.target.value })}
                >
                  <option value="hero_images">Hero Images (Home)</option>
                  <option value="mission_images">Mission Images (About)</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Imazhi</label>
                <div
                  onClick={() => assetFileRef.current?.click()}
                  className="cursor-pointer aspect-video border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center overflow-hidden bg-slate-50 hover:bg-slate-100 transition-all relative group shadow-inner"
                >
                  {assetForm.url ? (
                    <>
                      <img src={assetForm.url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <Camera className="text-slate-300 h-12 w-12 mx-auto mb-3" />
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Kliko për të ngarkuar</span>
                    </div>
                  )}
                </div>
                <input type="file" ref={assetFileRef} onChange={handleAssetUpload} accept="image/*" className="hidden" />
              </div>
            </div>
            <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex space-x-4">
              <button
                onClick={handleSaveAsset}
                className="flex-[2] bg-brand-cyan text-white py-5 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-brand-cyan/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {t('admin.save')}
              </button>
              <button
                onClick={() => setShowAssetModal(false)}
                className="flex-1 bg-white text-slate-400 py-5 rounded-[1.5rem] font-black uppercase text-[11px] tracking-widest border border-slate-200 hover:bg-slate-50 transition-all"
              >
                {t('admin.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-dark/90 backdrop-blur-xl">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Trash2 className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight mb-2">{t('admin.delete')}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                {t('admin.deleteConfirm')}
              </p>

              <div className="flex gap-4 mt-10">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
                >
                  {t('admin.cancel')}
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all"
                >
                  {t('admin.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATS MODAL */}
      {showStatsModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md" onClick={() => setShowStatsModal(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">{editingStat ? 'Edito Statistikën' : 'Shto Statistikë'}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Përditësoni shifrat e ndikimit</p>
              </div>
              <button onClick={() => setShowStatsModal(false)} className="p-3 hover:bg-white rounded-2xl transition-all"><X className="h-6 w-6 text-slate-400" /></button>
            </div>
            <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vlera (p.sh. 500+)</label>
                  <input
                    type="text"
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[2rem] font-black text-2xl text-brand-dark outline-none focus:ring-4 focus:ring-brand-pink/10 transition-all"
                    value={statsForm.value}
                    onChange={(e) => setStatsForm({ ...statsForm, value: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ikona</label>
                  <select
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[2rem] font-bold text-sm text-brand-dark outline-none focus:ring-4 focus:ring-brand-pink/10 transition-all"
                    value={statsForm.iconName}
                    onChange={(e) => setStatsForm({ ...statsForm, iconName: e.target.value })}
                  >
                    {['Star', 'Globe', 'UserPlus', 'Sparkles', 'Target', 'Heart', 'Users', 'Briefcase', 'GraduationCap', 'Trophy'].map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Përshkrimi (p.sh. TË RINJ TË TRAJNUAR)</label>
                <input
                  type="text"
                  className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[2rem] font-bold text-sm text-slate-500 outline-none focus:ring-4 focus:ring-brand-pink/10 transition-all uppercase"
                  value={statsForm.label}
                  onChange={(e) => setStatsForm({ ...statsForm, label: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngjyra e Tekstit</label>
                  <select
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[2rem] font-bold text-sm text-brand-dark outline-none focus:ring-4 focus:ring-brand-pink/10 transition-all"
                    value={statsForm.color}
                    onChange={(e) => setStatsForm({ ...statsForm, color: e.target.value })}
                  >
                    <option value="text-brand-pink">Pink</option>
                    <option value="text-brand-orange">Orange</option>
                    <option value="text-brand-lime">Lime</option>
                    <option value="text-brand-cyan">Cyan</option>
                    <option value="text-brand-dark">Dark</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngjyra e Fondit</label>
                  <select
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[2rem] font-bold text-sm text-brand-dark outline-none focus:ring-4 focus:ring-brand-pink/10 transition-all"
                    value={statsForm.bg}
                    onChange={(e) => setStatsForm({ ...statsForm, bg: e.target.value })}
                  >
                    <option value="bg-brand-pink/10">Pink Light</option>
                    <option value="bg-brand-orange/10">Orange Light</option>
                    <option value="bg-brand-lime/10">Lime Light</option>
                    <option value="bg-brand-cyan/10">Cyan Light</option>
                    <option value="bg-slate-100">Gray Light</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex space-x-4">
              <button
                onClick={handleSaveStat}
                className="flex-grow bg-brand-dark text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-brand-dark/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center"
              >
                <Save className="h-5 w-5 mr-3" /> Ruaj Ndryshimet
              </button>
              <button
                onClick={() => setShowStatsModal(false)}
                className="px-10 bg-white text-slate-400 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest border border-slate-200 hover:bg-slate-50 transition-all"
              >
                Anulo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
