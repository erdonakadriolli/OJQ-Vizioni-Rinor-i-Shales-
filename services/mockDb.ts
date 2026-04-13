
import { Project, Event, User, VolunteerApplication, NewsItem, ProjectStatus, UserRole, ApplicationStatus, StaffMember, Partner, Stat } from '../types';

const STORAGE_KEY = 'ngo_app_data_v1';

interface DbSchema {
  projects: Project[];
  events: Event[];
  users: User[];
  applications: VolunteerApplication[];
  news: NewsItem[];
  staff: StaffMember[];
  partners: Partner[];
  stats: Stat[];
}

const initialData: DbSchema = {
  projects: [
    {
      id: 'p1',
      title: 'Digital Academy for Youth - Shale',
      description: 'Intensive training program in coding, graphic design, and digital marketing for the youth of Shale village.',
      longDescription: 'This project aims to break geographic barriers by bringing the latest technology trends directly to Shale, Lipjan. The program includes 12 weeks of mentoring and practical work.',
      startDate: '2024-03-01',
      endDate: '2024-09-30',
      status: ProjectStatus.Active,
      volunteerCount: 12,
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
      gallery: []
    }
  ],
  events: [],
  users: [
    { id: 'u1', name: 'VRSH Admin', email: 'admin@vizionirinorishales.org', role: UserRole.ADMIN, password: 'Vizioni2024!' },
  ],
  applications: [],
  news: [
    {
      id: 'n1',
      title: 'Bashkëpunim i ri me Komunën e Lipjanit',
      content: 'Vizioni Rinor i Shalës ka nënshkruar memorandum bashkëpunimi për projektet e ardhshme rinore në fshatin Shalë.',
      datePosted: '2024-03-28',
      category: 'Latest News'
    },
    {
      id: 'n2',
      title: 'Raporti Vjetor i Punës 2023',
      content: 'Ky raport përmbledh të gjitha aktivitetet, arritjet dhe sfidat e organizatës sonë gjatë vitit 2023.',
      datePosted: '2024-01-15',
      category: 'Reports',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 'n3',
      title: 'VRSH në RTK: Fuqizimi i të rinjve në zonat rurale',
      content: 'Intervista e plotë e Drejtorit Ekzekutiv në RTK rreth ndikimit të projekteve tona në komunitet.',
      datePosted: '2024-02-10',
      category: 'Media',
      fileUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    {
      id: 'n4',
      title: 'Trajnimi në Coding dhe Design',
      content: 'Fillon cikli i ri i trajnimeve për 50 të rinj nga rajoni i Shalës në fushën e teknologjisë.',
      datePosted: '2024-03-05',
      category: 'Latest News'
    },
    {
      id: 'n5',
      title: 'Raporti i Monitorimit: Rinia dhe Vendimmarrja',
      content: 'Një studim i detajuar mbi pjesëmarrjen e të rinjve të Lipjanit në proceset vendimmarrëse lokale.',
      datePosted: '2023-11-20',
      category: 'Reports',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    }
  ],
  staff: [
    // Stafi i Zyrës
    { id: 's1', name: 'Leotrim Pajaziti', role: 'Executive Director', category: 'Executive Director', bio: 'Udhëheqësi i vizionit dhe projekteve të organizatës.', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400', socials: {} },
    { id: 's2', name: 'Bleriana Kadriolli', role: 'Project Assistant', category: 'Current Staff', bio: 'Mbështetje në koordinimin dhe zbatimin e aktiviteteve.', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400', socials: {} },
    { id: 's3', name: 'Dijellëza Selmani', role: 'Project Assistant', category: 'Current Staff', bio: 'Përgjegjëse për mbarëvajtjen e trajnimeve.', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400', socials: {} },

    // Asambleja
    { id: 's4', name: 'Euresa Karpuzi', role: 'Head of Members Assembly', category: 'Members Assembly', bio: 'Kryetare e Asamblesë së Anëtarëve.', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400', socials: {} },
    { id: 's5', name: 'Miranda Karpuzi', role: 'Assembly Member', category: 'Members Assembly', bio: '', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400', socials: {} },
    { id: 's8', name: 'Erdona Kadriolli', role: 'Assembly Member', category: 'Members Assembly', bio: '', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400', socials: {} },
    { id: 's9', name: 'Erjona Kadriolli', role: 'Assembly Member', category: 'Members Assembly', bio: '', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', socials: {} },
    { id: 's10', name: 'Dielleza Selmanii', role: 'Assembly Member', category: 'Members Assembly', bio: '', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=400', socials: {} },

    // Bordi
    { id: 's6', name: 'Shkelzen Karpuzi', role: 'Board Director', category: 'Board of Directors', bio: '', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400', socials: {} },
    { id: 's7', name: 'Burim Shamolli', role: 'Board Director', category: 'Board of Directors', bio: '', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', socials: {} },

    // Vullnetarët
    { id: 'v1', name: 'Viola Hetemi', role: 'Volunteer', category: 'Volunteers', bio: '', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400', socials: {} },
    { id: 'v4', name: 'Egzona Hetemi', role: 'Volunteer', category: 'Volunteers', bio: '', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400', socials: {} },
    { id: 'v5', name: 'Haxhi Hetemi', role: 'Volunteer', category: 'Volunteers', bio: '', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400', socials: {} },
    { id: 'v6', name: 'Loresa Gashi', role: 'Volunteer', category: 'Volunteers', bio: '', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=400', socials: {} },
    { id: 'v7', name: 'Laureta Gashi', role: 'Volunteer', category: 'Volunteers', bio: '', image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=400', socials: {} },
    { id: 'v8', name: 'Arbenita Krasniqi', role: 'Volunteer', category: 'Volunteers', bio: '', image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=400', socials: {} },
    { id: 'v9', name: 'Anisa Bajraktari', role: 'Volunteer', category: 'Volunteers', bio: '', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=400', socials: {} },
    { id: 'v10', name: 'Blinera Gashi', role: 'Volunteer', category: 'Volunteers', bio: '', image: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=400', socials: {} },
    { id: 'v11', name: 'Elton Shala', role: 'Volunteer', category: 'Volunteers', bio: '', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400', socials: {} }
  ],
  partners: [
    { id: 'p1', name: 'Komuna e Lipjanit', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Stema_e_Komun%C3%ABs_s%C3%AB_Lipjanit.svg/1200px-Stema_e_Komun%C3%ABs_s%C3%AB_Lipjanit.svg.png' },
    { id: 'p2', name: 'Ministria e Kulturës, Rinisë dhe Sportit', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Emblem_of_the_Republic_of_Kosovo.svg/1200px-Emblem_of_the_Republic_of_Kosovo.svg.png' }
  ],
  stats: [
    { id: 's1', value: '500+', label: 'TË RINJ TË TRAJNUAR', iconName: 'Star', color: 'text-brand-pink', bg: 'bg-brand-pink/5' },
    { id: 's2', value: '25+', label: 'PROJEKTE TË PËRFUNDUARA', iconName: 'Globe', color: 'text-brand-lime', bg: 'bg-brand-lime/5' },
    { id: 's3', value: '100+', label: 'VULLNETARË AKTIVË', iconName: 'UserPlus', color: 'text-brand-cyan', bg: 'bg-brand-cyan/5' },
    { id: 's4', value: 'Lipjan', label: 'RAJONI I MBULUAR', iconName: 'Sparkles', color: 'text-brand-orange', bg: 'bg-brand-orange/5' }
  ]
};

export const getDb = (): DbSchema => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }
  const db = JSON.parse(stored);
  // Ensure stats exists for older storage versions
  if (!db.stats) {
    db.stats = initialData.stats;
  }
  return db;
};

export const saveDb = (data: DbSchema) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
