
import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface LanguageContextType {
  t: (key: string) => string;
  language: 'AL' | 'EN';
  setLanguage: (lang: 'AL' | 'EN') => void;
}

export const translations: Record<'AL' | 'EN', Record<string, string>> = {
  AL: {
    // Navigimi
    'nav.home': 'Ballina',
    'nav.about': 'Rreth Nesh',
    'nav.mission': 'Vizioni dhe Misioni',
    'nav.staff': 'Stafi',
    'nav.projects': 'Projektet',
    'nav.news': 'Lajmet',
    'nav.join': 'Vullnetarizimi',
    'nav.login': 'Kyçu',
    'nav.derdo': 'VIZIONI AI',

    // Hero Section
    'hero.subtitle': 'Vizioni Rinor i Shalës',
    'hero.title1': 'Fuqizimi i Rinisë',
    'hero.title2': 'për të ardhmen',
    'hero.desc': 'Vizioni Rinor i Shalës (Youth Vision of Shala) është një organizatë e drejtuar nga të rinjtë që vepron jashtë fshatit Shalë, duke u shërbyer të rinjve dhe komuniteteve në Lipjan dhe më gjerë.',
    'hero.apply': 'Bëhu Vullnetar',
    'hero.projects': 'Eksploro Projektet',

    // Faqja Rreth Nesh
    'about.hero.badge': 'RRETH NESH',
    'about.hero.title1': 'FUQIZIMI I',
    'about.hero.title2': 'GJENERATËS',
    'about.hero.title3': 'SË RE',
    'about.main.title': 'Vizioni Rinor i Shalës (VRSH)',
    'about.main.desc': 'Vizioni Rinor i Shalës (Youth Vision of Shala) është një organizatë e drejtuar nga të rinjtë që vepron jashtë fshatit Shalë, duke u shërbyer të rinjve dhe komuniteteve në Lipjan dhe më gjerë. Ne jemi të përkushtuar për të arritur të rinjtë në zona rurale dhe të vështira për t’u arritur, duke i fuqizuar ata të qëndrojnë për veten dhe të tjerët.',
    'about.main.goal': 'Ne synojmë të krijojmë mundësi konkrete për të rinjtë që të zhvillojnë aftësi personale, profesionale dhe digjitale, si dhe të nxisim lidershipin rinor dhe aktivizmin komunitar.',
    
    'about.vision.title': 'Vizioni',
    'about.vision.text': 'Vizioni ynë është një botë në të cilën të rinjtë janë të fuqizuar të ngrihen për veten dhe të tjerët.',
    'about.mission.title': 'Misioni',
    'about.mission.text': 'Misioni ynë është të avancojmë interesat e përbashkëta të të rinjve duke zhvilluar kapacitetet e tyre dhe duke rritur pjesëmarrjen e tyre në vendimmarrje.',
    
    'about.programs.title': 'Programet',
    'about.programs.1.title': 'Zhvillimi i të rinjve',
    'about.programs.1.desc': 'përqendrohet në ndërtimin e kapaciteteve të të rinjve përmes edukimit formal dhe joformal. Kjo përfshin zhvillimin e aftësive të buta dhe atyre jetësore te të rinjtë, si mendimi kritik dhe ndërtimi i vetëbesimit, si dhe ofrimin e trajnimeve tematike mbi tema si dezinformimi dhe gjuha e urrejtjes, trajnime profesionale ose në fushën e IT-së, bazuar në nevojat e identifikuara.',
    'about.programs.2.title': 'Pjesëmarrja e të rinjve',
    'about.programs.2.desc': 'përqendrohet në rritjen e rolit dhe angazhimit të të rinjve. Kjo përfshin zhvillimin e aftësive të tyre për të kontribuar në mënyrë domethënëse në avokim dhe vendimmarrje, si dhe lehtësimin e angazhimit të tyre si në nivelin institucional ashtu edhe në atë të shoqërisë civile.',
    'about.programs.3.title': 'Qëndrueshmëria',
    'about.programs.3.desc': 'përqendrohet në krijimin e një mjedisi mundësues që u lejon të rinjve të zhvillohen. Ne kontribuojmë në krijimin e një mjedisi të sigurt për të rinjtë, që inkurajon rritjen dhe lehtëson ndjenjën e përkatësisë.',

    'about.fields.title': 'Fushat Kryesore të Veprimit',
    'about.fields.1': 'Fuqizimi i të rinjve dhe lidershipi rinor',
    'about.fields.2': 'Edukimi joformal dhe zhvillimi profesional',
    'about.fields.3': 'Aftësitë digjitale dhe teknologjia',
    'about.fields.4': 'Vullnetarizmi dhe angazhimi qytetar',
    'about.fields.5': 'Barazia gjinore dhe përfshirja sociale',

    'about.activities.title': 'Aktivitetet tona',
    'about.activities.desc': 'VRSH zbaton projekte të ndryshme të fokusuara në trajnime, punëtori dhe fushata vetëdijesimi për të rinjtë.',
    'about.activities.list1': 'Trajnime për aftësi të buta (soft skills)',
    'about.activities.list2': 'Kurse profesionale në teknologji dhe dizajm',
    'about.activities.list3': 'Punëtori edukative dhe forume rinore',
    'about.activities.list4': 'Aktivitete komunitare dhe fushata vetëdijesimi',
    'about.activities.list5': 'Mentorim për karrierë dhe punësim',

    // Struktura
    'about.structure.title': 'Struktura Organizative',
    'about.structure.assembly': 'Asambleja e Anëtarëve',
    'about.structure.board': 'Bordi i Drejtorëve',
    'about.structure.director': 'Drejtori Ekzekutiv',
    'about.staff.title': 'Ekipi ynë',
    'about.structure.staff': 'Stafi i Zyrës',
    'about.structure.volunteers': 'Vullnetarët tanë',
    'about.structure.volunteers.desc': 'Vullnetarët janë zemra e organizatës sonë, duke kontribuar në çdo projekt me pasion dhe përkushtim.',

    // Statistikat
    'stats.trained': 'Të rinj të trajnuar',
    'stats.completed': 'Projekte të përfunduara',
    'stats.volunteers': 'Vullnetarë aktivë',
    'stats.region': 'Rajoni i mbuluar',

    // Footer
    'footer.desc': 'Vizion Rinor i Shalës (VRSH) është një organizatë rinore, joqeveritare dhe jofitimprurëse e cila ka për qëllim fuqizimin e të rinjëve në vendimmarrje',
    'footer.nav': 'Navigimi',
    'footer.opp': 'Mundësitë',
    'footer.find': 'Na gjeni',
    'footer.rights': '2026 Vizioni Rinor i Shalës. Të gjitha të drejtat të rezervuara.',
    'footer.developedBy': 'Zhvilluar nga',
    
    // Projektet
    'projects.tag': 'Veprimtaria jonë',
    'projects.title': 'Projektet tona',
    'projects.desc': 'Zbuloni iniciativat tona që po ndryshojnë jetën e të rinjve në Shalë dhe më gjerë.',
    'projects.search': 'Kërko projekte...',
    'projects.filter.all': 'Të gjitha',
    'projects.filter.active': 'Aktive',
    'projects.filter.completed': 'Të përfunduara',
    'projects.details': 'Detajet e projektit',
    'projects.summary': 'Përmbledhja',
    'projects.impl': 'Zbatimi dhe Detajet',
    'projects.period': 'Periudha',
    'projects.participants': 'Pjesëmarrësit',

    // Login
    'login.title': 'Mirë se vini',
    'login.subtitle': 'Kyçu në panelin e menaxhimit',
    'login.email': 'Adresa Email',
    'login.password': 'Fjalëkalimi',
    'login.button': 'Kyçu tani',
    'login.error': 'Të dhënat janë gabim.',
    'login.remember': 'Më mbaj mend',
    'login.forgot': 'Harruat fjalëkalimin?',
    'login.noaccount': 'Nuk keni llogari?',
    'login.register': 'Bëhu vullnetar',

    // Volunteer Apply
    'join.tag': 'Bëhu pjesë e ndryshimit',
    'join.title': 'Vullnetarizimi në VRSH',
    'join.desc': 'Bashkohu me ne për të dhënë kontributin tënd dhe për të fituar përvoja të reja të paharrueshme.',
    'join.why': 'Pse të bëhesh vullnetar?',
    'join.benefit1': 'Zhvillim i aftësive të reja profesionale',
    'join.benefit2': 'Rrjetëzim me profesionistë dhe liderë të rinj',
    'join.benefit3': 'Certifikim dhe njohje e punës vullnetare',
    'join.form.name': 'Emri dhe Mbiemri',
    'join.form.email': 'Email',
    'join.form.phone': 'Numri i telefonit',
    'join.form.interests': 'Fushat e interesit',
    'join.form.motivation': 'Pse dëshironi të bëheni vullnetar?',
    'join.form.submit': 'Dërgo Aplikimin',
    'join.success.title': 'Aplikimi u dërgua!',
    'join.success.desc': 'Faleminderit për interesimin tuaj. Ekipi ynë do t\'ju kontaktojë së shpejti.',
    'join.success.button': 'Kthehu në Kreu',

    // Derdo AI
    'derdo.promo.tag': 'Inovacioni Digjital',
    'derdo.greeting': 'VIZIONI AI',
    'derdo.desc': 'Asistenti inteligjent i VRSH për informacione dhe vullnetarizëm.',
    'derdo.chat': 'Fillo bisedën',
    'derdo.header.desc': 'Asistenti inteligjent i VRSH',

    // Lajmet
    'news.title.all': 'Të gjitha lajmet',
    'news.title.latest': 'Lajmet',
    'news.title.media': 'Media',
    'news.title.reports': 'Raporte dhe Publikime',
    'news.empty': 'Nuk u gjet asnjë lajm në këtë kategori.',
    'news.download': 'Shkarko dokumentin',
    'news.source': 'Burimi i lajmit',

    // Admin Panel
    'admin.panel': 'Paneli i Adminit',
    'admin.overview': 'Përmbledhja',
    'admin.projects': 'Projektet',
    'admin.news': 'Lajmet & Publikimet',
    'admin.staff': 'Stafi & Ekipi',
    'admin.applications': 'Aplikimet',
    'admin.management': 'Menaxhimi i Organizatës',
    'admin.addProject': 'Shto Projekt',
    'admin.editProject': 'Edito Projektin',
    'admin.addNews': 'Shto Lajm/Raport',
    'admin.editNews': 'Edito Lajmin',
    'admin.addStaff': 'Shto Anëtar Stafi',
    'admin.editStaff': 'Edito Stafin',
    'admin.title': 'Titulli',
    'admin.status': 'Statusi',
    'admin.actions': 'Veprimet',
    'admin.delete': 'Fshije',
    'admin.deleteConfirm': 'A jeni të sigurt që dëshironi ta fshini këtë zë?',
    'admin.save': 'Ruaj Ndryshimet',
    'admin.cancel': 'Anulo',
    'admin.generateAi': 'Gjenero me AI',
    'admin.mainImage': 'Imazhi Kryesor',
    'admin.gallery': 'Galeria e Fotos',
    'admin.category': 'Kategoria',
    'admin.date': 'Data',
    'admin.applicant': 'Aplikuesi',
    'admin.partners': 'Partnerët & Donatorët',
    'admin.addPartner': 'Shto Partner',
    'admin.editPartner': 'Edito Partnerin',
    'admin.partnerName': 'Emri i Partnerit',
    'admin.partnerLogo': 'Logo e Partnerit',
    'admin.partnerWebsite': 'Uebfaqja (Opsionale)',
    'home.partners.title': 'Partnerët & Donatorët tanë',
    'ui.ask': 'Pyet',
    'ui.upload': 'Ngarko',
    'admin.startDate': 'Data e Fillimit',
    'admin.endDate': 'Data e Përfundimit',
    'admin.applicationDetails': 'Detajet e Aplikimit',
    'admin.approve': 'Aprovo',
    'admin.reject': 'Refuzo'
  },
  EN: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.mission': 'Vision & Mission',
    'nav.staff': 'Staff',
    'nav.projects': 'Projects',
    'nav.news': 'News',
    'nav.join': 'Volunteer',
    'nav.login': 'Login',
    'nav.derdo': 'VIZIONI AI',

    // Hero Section
    'hero.subtitle': 'Youth Vision of Shala',
    'hero.title1': 'Empowering Youth',
    'hero.title2': 'for the future',
    'hero.desc': 'Youth Vision of Shala (VRSH) is a youth-led organization operating out of Shala village, serving youth and communities in Lipjan and beyond.',
    'hero.apply': 'Become a Volunteer',
    'hero.projects': 'Explore Projects',

    // About Page
    'about.hero.badge': 'ABOUT US',
    'about.hero.title1': 'EMPOWERING',
    'about.hero.title2': 'THE NEW',
    'about.hero.title3': 'GENERATION',
    'about.main.title': 'Youth Vision of Shala (VRSH)',
    'about.main.desc': 'Youth Vision of Shala (VRSH) is a youth-led organization operating out of Shala village, serving youth and communities in Lipjan and beyond. We are committed to reaching youth in rural and hard-to-reach areas, empowering them to stand up for themselves and others.',
    'about.main.goal': 'We aim to create concrete opportunities for youth to develop personal, professional, and digital skills, as well as to foster youth leadership and community activism.',
    
    'about.vision.title': 'Vision',
    'about.vision.text': 'Our vision is a world in which young people are empowered to stand up for themselves and others.',
    'about.mission.title': 'Mission',
    'about.mission.text': 'Our mission is to advance the common interests of youth by developing their capacities and increasing their participation in decision-making.',
    
    'about.programs.title': 'Programs',
    'about.programs.1.title': 'Youth Development',
    'about.programs.1.desc': 'focuses on building youth capacities through formal and non-formal education. This includes developing soft and life skills in youth, such as critical thinking and self-confidence building, as well as providing thematic training on topics like disinformation and hate speech, professional or IT training, based on identified needs.',
    'about.programs.2.title': 'Youth Participation',
    'about.programs.2.desc': 'focuses on increasing the role and engagement of youth. This includes developing their skills to contribute meaningfully to advocacy and decision-making, as well as facilitating their engagement at both institutional and civil society levels.',
    'about.programs.3.title': 'Sustainability',
    'about.programs.3.desc': 'focuses on creating an enabling environment that allows youth to develop. We contribute to creating a safe environment for youth that encourages growth and facilitates a sense of belonging.',

    'about.fields.title': 'Main Fields of Action',
    'about.fields.1': 'Youth empowerment and youth leadership',
    'about.fields.2': 'Non-formal education and professional development',
    'about.fields.3': 'Digital skills and technology',
    'about.fields.4': 'Volunteerism and civic engagement',
    'about.fields.5': 'Gender equality and social inclusion',

    'about.activities.title': 'Our Activities',
    'about.activities.desc': 'VRSH implements various projects focused on training, workshops, and awareness campaigns for youth.',
    'about.activities.list1': 'Soft skills training',
    'about.activities.list2': 'Professional courses in technology and design',
    'about.activities.list3': 'Educational workshops and youth forums',
    'about.activities.list4': 'Community activities and awareness campaigns',
    'about.activities.list5': 'Career mentoring and employment',

    // Structure
    'about.structure.title': 'Organizational Structure',
    'about.structure.assembly': 'Members Assembly',
    'about.structure.board': 'Board of Directors',
    'about.structure.director': 'Executive Director',
    'about.staff.title': 'Our Team',
    'about.structure.staff': 'Office Staff',
    'about.structure.volunteers': 'Our Volunteers',
    'about.structure.volunteers.desc': 'Volunteers are the heart of our organization, contributing to every project with passion and dedication.',

    // Stats
    'stats.trained': 'Trained Youth',
    'stats.completed': 'Completed Projects',
    'stats.volunteers': 'Active Volunteers',
    'stats.region': 'Region Covered',

    // Footer
    'footer.desc': 'Youth Vision of Shala (VRSH) is a youth, non-governmental and non-profit organization which aims to empower youth in decision-making',
    'footer.nav': 'Navigation',
    'footer.opp': 'Opportunities',
    'footer.find': 'Find Us',
    'footer.rights': '2026 Youth Vision of Shala. All rights reserved.',
    'footer.developedBy': 'Developed by',
    
    // Projects
    'projects.tag': 'Our Work',
    'projects.title': 'Our Projects',
    'projects.desc': 'Discover our initiatives that are changing the lives of youth in Shala and beyond.',
    'projects.search': 'Search projects...',
    'projects.filter.all': 'All',
    'projects.filter.active': 'Active',
    'projects.filter.completed': 'Completed',
    'projects.details': 'Project Details',
    'projects.summary': 'Summary',
    'projects.impl': 'Implementation & Details',
    'projects.period': 'Period',
    'projects.participants': 'Participants',

    // Login
    'login.title': 'Welcome',
    'login.subtitle': 'Login to management panel',
    'login.email': 'Email Address',
    'login.password': 'Password',
    'login.button': 'Login Now',
    'login.error': 'Invalid credentials.',
    'login.remember': 'Remember me',
    'login.forgot': 'Forgot password?',
    'login.noaccount': 'Don\'t have an account?',
    'login.register': 'Become a volunteer',

    // Volunteer Apply
    'join.tag': 'Be part of the change',
    'join.title': 'Volunteering at VRSH',
    'join.desc': 'Join us to give your contribution and gain new unforgettable experiences.',
    'join.why': 'Why become a volunteer?',
    'join.benefit1': 'Development of new professional skills',
    'join.benefit2': 'Networking with professionals and young leaders',
    'join.benefit3': 'Certification and recognition of volunteer work',
    'join.form.name': 'Full Name',
    'join.form.email': 'Email',
    'join.form.phone': 'Phone Number',
    'join.form.interests': 'Fields of interest',
    'join.form.motivation': 'Why do you want to become a volunteer?',
    'join.form.submit': 'Send Application',
    'join.success.title': 'Application Sent!',
    'join.success.desc': 'Thank you for your interest. Our team will contact you soon.',
    'join.success.button': 'Back to Home',

    // Derdo AI
    'derdo.promo.tag': 'Digital Innovation',
    'derdo.greeting': 'VIZIONI AI',
    'derdo.desc': 'VRSH intelligent assistant for information and volunteering.',
    'derdo.chat': 'Start Chat',
    'derdo.header.desc': 'VRSH Intelligent Assistant',

    // News
    'news.title.all': 'All News',
    'news.title.latest': 'Latest News',
    'news.title.media': 'Media',
    'news.title.reports': 'Reports & Publications',
    'news.empty': 'No news found in this category.',
    'news.download': 'Download Document',
    'news.source': 'News Source',

    // Admin Panel
    'admin.panel': 'Admin Panel',
    'admin.overview': 'Overview',
    'admin.projects': 'Projects',
    'admin.news': 'News & Publications',
    'admin.staff': 'Staff & Team',
    'admin.applications': 'Applications',
    'admin.management': 'Organization Management',
    'admin.addProject': 'Add Project',
    'admin.editProject': 'Edit Project',
    'admin.addNews': 'Add News/Report',
    'admin.editNews': 'Edit News',
    'admin.addStaff': 'Add Staff Member',
    'admin.editStaff': 'Edit Staff',
    'admin.title': 'Title',
    'admin.status': 'Status',
    'admin.actions': 'Actions',
    'admin.delete': 'Delete',
    'admin.deleteConfirm': 'Are you sure you want to delete this item?',
    'admin.save': 'Save Changes',
    'admin.cancel': 'Cancel',
    'admin.generateAi': 'Generate with AI',
    'admin.mainImage': 'Main Image',
    'admin.gallery': 'Photo Gallery',
    'admin.category': 'Category',
    'admin.date': 'Date',
    'admin.applicant': 'Applicant',
    'admin.partners': 'Partners & Donors',
    'admin.addPartner': 'Add Partner',
    'admin.editPartner': 'Edit Partner',
    'admin.partnerName': 'Partner Name',
    'admin.partnerLogo': 'Partner Logo',
    'admin.partnerWebsite': 'Website (Optional)',
    'home.partners.title': 'Our Partners & Donors',
    'ui.ask': 'Ask',
    'ui.upload': 'Upload',
    'admin.startDate': 'Start Date',
    'admin.endDate': 'End Date',
    'admin.applicationDetails': 'Application Details',
    'admin.approve': 'Approve',
    'admin.reject': 'Reject'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'AL' | 'EN'>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'AL' || saved === 'EN') ? saved : 'EN';
  });

  const [overrides, setOverrides] = useState<Record<'AL' | 'EN', Record<string, string>>>({ AL: {}, EN: {} });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'site_content'), (snapshot) => {
      const al: Record<string, string> = {};
      const en: Record<string, string> = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.key) {
          if (data.AL) al[data.key] = data.AL;
          if (data.EN) en[data.key] = data.EN;
        }
      });
      setOverrides({ AL: al, EN: en });
    }, (error) => handleFirestoreError(error, OperationType.GET, 'site_content'));
    return () => unsubscribe();
  }, []);

  const setLanguage = useCallback((lang: 'AL' | 'EN') => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  }, []);

  const t = useCallback((key: string) => {
    return overrides[language][key] || translations[language][key] || key;
  }, [language, overrides]);

  const value = useMemo(() => ({ t, language, setLanguage }), [t, language, setLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
