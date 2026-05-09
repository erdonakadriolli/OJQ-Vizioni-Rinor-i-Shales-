
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Project, NewsItem, StaffMember, VolunteerApplication, Partner, Stat } from '../types';

interface FirestoreContextType {
  staff: StaffMember[];
  projects: Project[];
  news: NewsItem[];
  partners: Partner[];
  stats: Stat[];
  applications: VolunteerApplication[];
  siteAssets: any[];
  siteContent: any[];
  isLoading: boolean;
}

const FirestoreContext = createContext<FirestoreContextType | undefined>(undefined);

export const FirestoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [siteAssets, setSiteAssets] = useState<any[]>([]);
  const [siteContent, setSiteContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Centralized listeners to reduce Firestore read quota consumption
    const qStaff = query(collection(db, 'staff'));
    const unsubscribeStaff = onSnapshot(qStaff, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StaffMember));
      setStaff(data);
    }, (err) => {
      console.warn('Firestore staff access error:', err.message);
    });

    const qProjects = query(collection(db, 'projects'));
    const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      data.sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
      setProjects(data);
    }, (err) => {
      console.warn('Firestore projects access error:', err.message);
    });

    const qNews = query(collection(db, 'news'));
    const unsubscribeNews = onSnapshot(qNews, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsItem));
      data.sort((a, b) => (b.datePosted || '').localeCompare(a.datePosted || ''));
      setNews(data);
    }, (err) => {
      console.warn('Firestore news access error:', err.message);
    });

    const qPartners = query(collection(db, 'partners'));
    const unsubscribePartners = onSnapshot(qPartners, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Partner));
      data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setPartners(data);
    }, (err) => {
      console.warn('Firestore partners access error:', err.message);
    });

    const qStats = query(collection(db, 'stats'));
    const unsubscribeStats = onSnapshot(qStats, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Stat));
      setStats(data);
    }, (err) => {
      console.warn('Firestore stats access error:', err.message);
    });

    const qApps = query(collection(db, 'applications'));
    const unsubscribeApps = onSnapshot(qApps, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VolunteerApplication));
      data.sort((a, b) => (b.dateApplied || '').localeCompare(a.dateApplied || ''));
      setApplications(data);
    }, (err) => {
      console.warn('Firestore applications access error:', err.message);
    });

    const qAssets = query(collection(db, 'site_assets'));
    const unsubscribeAssets = onSnapshot(qAssets, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSiteAssets(data);
      if (isLoading) setIsLoading(false);
    }, (err) => {
      console.warn('Firestore site_assets access error:', err.message);
    });

    const qContent = query(collection(db, 'site_content'));
    const unsubscribeContent = onSnapshot(qContent, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSiteContent(data);
      if (isLoading) setIsLoading(false);
    }, (err) => {
      console.warn('Firestore site_content access error:', err.message);
      if (isLoading) setIsLoading(false);
    });

    return () => {
      unsubscribeStaff();
      unsubscribeProjects();
      unsubscribeNews();
      unsubscribePartners();
      unsubscribeStats();
      unsubscribeApps();
      unsubscribeAssets();
      unsubscribeContent();
    };
  }, []);

  return (
    <FirestoreContext.Provider value={{ staff, projects, news, partners, stats, applications, siteAssets, siteContent, isLoading }}>
      {children}
    </FirestoreContext.Provider>
  );
};

export const useFirestore = () => {
  const context = useContext(FirestoreContext);
  if (context === undefined) {
    throw new Error('useFirestore must be used within a FirestoreProvider');
  }
  return context;
};
