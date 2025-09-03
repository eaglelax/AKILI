import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Users, 
  UserCheck, 
  Clock, 
  TrendingUp, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Mail, 
  Phone, 
  Edit3, 
  Star, 
  Award, 
  Target,
  Calendar,
  MessageSquare,
  Settings,
  Eye,
  User
} from 'lucide-react';

interface Skill {
  name: string;
  level: 'expert' | 'advanced' | 'intermediate' | 'beginner';
}

interface TeamMember {
  id: number;
  name: string;
  position: string;
  category: 'direction' | 'senior' | 'intermediate' | 'junior';
  rate: number; // FCFA per hour
  workload: number; // percentage
  performance: number; // out of 5
  status: 'available' | 'busy' | 'away' | 'leave';
  avatar: string;
  skills: Skill[];
  projects: string[];
  specialties: string[];
  isAdmin: boolean;
  hoursPerWeek: number;
  email: string;
  phone: string;
  note?: string;
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Serge ASSALÉ",
    position: "Directeur Création & Marketing",
    category: "direction",
    rate: 15000,
    workload: 75,
    performance: 4.9,
    status: "available",
    avatar: "SA",
    skills: [
      { name: "Stratégie", level: "expert" },
      { name: "Direction Artistique", level: "expert" },
      { name: "Management", level: "expert" }
    ],
    projects: ["MOOV AFRICA", "BANK OF AFRICA", "SUNU BURKINA"],
    specialties: ["Vision stratégique", "Relation client", "Innovation"],
    isAdmin: true,
    hoursPerWeek: 30,
    email: "serge.assale@jofeplus.bf",
    phone: "+226 70 12 34 56"
  },
  {
    id: 2,
    name: "Enos GOUBA",
    position: "Coordinateur Production",
    category: "direction",
    rate: 12000,
    workload: 80,
    performance: 4.8,
    status: "available",
    avatar: "EG",
    skills: [
      { name: "Coordination", level: "expert" },
      { name: "Planning", level: "expert" },
      { name: "Production", level: "expert" }
    ],
    projects: ["Transversal"],
    specialties: ["Optimisation workflow", "Gestion ressources"],
    isAdmin: true,
    hoursPerWeek: 32,
    email: "enos.gouba@jofeplus.bf",
    phone: "+226 70 12 34 57"
  },
  {
    id: 3,
    name: "Paul Junior OUEDRAOGO",
    position: "Graphiste Photomonteur",
    category: "senior",
    rate: 8000,
    workload: 90,
    performance: 4.7,
    status: "busy",
    avatar: "PO",
    skills: [
      { name: "Photoshop", level: "expert" },
      { name: "Photomontage", level: "expert" },
      { name: "Print", level: "advanced" }
    ],
    projects: ["MOOV AFRICA", "ROXGOLD", "DAFANI"],
    specialties: ["Retouche photo", "Créations visuelles complexes"],
    isAdmin: false,
    hoursPerWeek: 36,
    email: "paul.ouedraogo@jofeplus.bf",
    phone: "+226 70 12 34 58"
  },
  {
    id: 4,
    name: "Fortune YANOGO",
    position: "Photographe/Vidéaste",
    category: "senior",
    rate: 10000,
    workload: 70,
    performance: 4.6,
    status: "available",
    avatar: "FY",
    skills: [
      { name: "Photographie", level: "expert" },
      { name: "Vidéo", level: "expert" },
      { name: "Post-production", level: "advanced" }
    ],
    projects: ["BANK OF AFRICA", "NELSON SOLAR"],
    specialties: ["Shooting corporate", "Vidéos institutionnelles"],
    isAdmin: false,
    hoursPerWeek: 28,
    email: "fortune.yanogo@jofeplus.bf",
    phone: "+226 70 12 34 59"
  },
  {
    id: 5,
    name: "Bientama PARÉ",
    position: "Motion Designer",
    category: "senior",
    rate: 9000,
    workload: 85,
    performance: 4.8,
    status: "busy",
    avatar: "BP",
    skills: [
      { name: "After Effects", level: "expert" },
      { name: "Motion Design", level: "expert" },
      { name: "3D", level: "intermediate" }
    ],
    projects: ["SUNU BURKINA", "BABALI BOISSONS"],
    specialties: ["Motion graphics", "Explainer videos"],
    isAdmin: false,
    hoursPerWeek: 34,
    email: "bientama.pare@jofeplus.bf",
    phone: "+226 70 12 34 60"
  },
  {
    id: 6,
    name: "Linda KABORÉ",
    position: "Conceptrice Rédactrice Lead",
    category: "senior",
    rate: 9500,
    workload: 65,
    performance: 4.9,
    status: "available",
    avatar: "LK",
    skills: [
      { name: "Rédaction", level: "expert" },
      { name: "Stratégie", level: "advanced" },
      { name: "Conceptualisation", level: "expert" }
    ],
    projects: ["Projets transversaux"],
    specialties: ["Naming", "Storytelling", "Stratégie de contenu"],
    isAdmin: false,
    hoursPerWeek: 26,
    email: "linda.kabore@jofeplus.bf",
    phone: "+226 70 12 34 61"
  },
  {
    id: 7,
    name: "Jean-Jacques SAMPABAO",
    position: "Directeur Artistique Junior",
    category: "intermediate",
    rate: 7000,
    workload: 0,
    performance: 4.5,
    status: "leave",
    avatar: "JS",
    skills: [
      { name: "Direction Artistique", level: "intermediate" },
      { name: "Design", level: "advanced" }
    ],
    projects: [],
    specialties: ["Identités visuelles", "Supervision créative"],
    isAdmin: false,
    hoursPerWeek: 0,
    email: "jeanjacques.sampabao@jofeplus.bf",
    phone: "+226 70 12 34 62",
    note: "En congé - retour 15/01"
  },
  {
    id: 8,
    name: "Abdoul Latif OUEDRAOGO",
    position: "Designer UI/UX",
    category: "intermediate",
    rate: 8500,
    workload: 95,
    performance: 4.7,
    status: "busy",
    avatar: "AO",
    skills: [
      { name: "UI/UX", level: "expert" },
      { name: "Web Design", level: "expert" },
      { name: "Prototypage", level: "advanced" }
    ],
    projects: ["SUNU site web", "AGENCE ZACA", "FROID SOLUTIONS"],
    specialties: ["Interfaces digitales", "Expérience utilisateur"],
    isAdmin: false,
    hoursPerWeek: 38,
    email: "abdoul.ouedraogo@jofeplus.bf",
    phone: "+226 70 12 34 63"
  },
  {
    id: 9,
    name: "Florita KABORÉ",
    position: "Responsable Médias Sociaux",
    category: "intermediate",
    rate: 7500,
    workload: 70,
    performance: 4.6,
    status: "available",
    avatar: "FK",
    skills: [
      { name: "Social Media", level: "expert" },
      { name: "Media Buying", level: "advanced" },
      { name: "Analytics", level: "advanced" }
    ],
    projects: ["Gestion multi-comptes"],
    specialties: ["Stratégie sociale", "Publicité digitale"],
    isAdmin: false,
    hoursPerWeek: 28,
    email: "florita.kabore@jofeplus.bf",
    phone: "+226 70 12 34 64"
  },
  {
    id: 10,
    name: "Nebié WEBOU",
    position: "Chef de Pub/Concepteur Rédacteur",
    category: "intermediate",
    rate: 8500,
    workload: 80,
    performance: 4.5,
    status: "busy",
    avatar: "NW",
    skills: [
      { name: "Stratégie Pub", level: "advanced" },
      { name: "Rédaction", level: "advanced" },
      { name: "Relations Client", level: "expert" }
    ],
    projects: ["PNUD BF", "ANSSI", "LAAFI NANDA"],
    specialties: ["Campagnes institutionnelles", "Communication corporate"],
    isAdmin: false,
    hoursPerWeek: 32,
    email: "nebie.webou@jofeplus.bf",
    phone: "+226 70 12 34 65"
  },
  {
    id: 11,
    name: "Issa CISSE",
    position: "Graphiste Junior",
    category: "junior",
    rate: 6000,
    workload: 60,
    performance: 4.2,
    status: "available",
    avatar: "IC",
    skills: [
      { name: "Graphisme", level: "intermediate" },
      { name: "Mise en page", level: "advanced" }
    ],
    projects: ["Support sur projets complexes"],
    specialties: ["Support graphique", "Mise en page"],
    isAdmin: false,
    hoursPerWeek: 24,
    email: "issa.cisse@jofeplus.bf",
    phone: "+226 70 12 34 66",
    note: "Formation Design avancé - 20% temps"
  },
  {
    id: 12,
    name: "Djamilatou GUIGUEMDE",
    position: "Chef de Pub Stagiaire",
    category: "junior",
    rate: 4500,
    workload: 50,
    performance: 4.0,
    status: "available",
    avatar: "DG",
    skills: [
      { name: "Communication", level: "beginner" },
      { name: "Organisation", level: "intermediate" }
    ],
    projects: ["Assistance projets"],
    specialties: ["Support administratif", "Coordination junior"],
    isAdmin: false,
    hoursPerWeek: 20,
    email: "djamilatou.guiguemde@jofeplus.bf",
    phone: "+226 70 12 34 67",
    note: "En formation - 30% temps"
  },
  {
    id: 13,
    name: "Maryse BOMBIRI",
    position: "Community Manager",
    category: "intermediate",
    rate: 7000,
    workload: 75,
    performance: 4.4,
    status: "available",
    avatar: "MB",
    skills: [
      { name: "Community Management", level: "advanced" },
      { name: "E-reputation", level: "expert" }
    ],
    projects: ["Gestion communautés clients"],
    specialties: ["Animation communautés", "Gestion de crise digitale"],
    isAdmin: false,
    hoursPerWeek: 30,
    email: "maryse.bombiri@jofeplus.bf",
    phone: "+226 70 12 34 68"
  },
  {
    id: 14,
    name: "Faridatou BARRY",
    position: "Chef de Pub/CM",
    category: "intermediate",
    rate: 7500,
    workload: 65,
    performance: 4.3,
    status: "busy",
    avatar: "FB",
    skills: [
      { name: "Publicité", level: "intermediate" },
      { name: "Community Management", level: "advanced" }
    ],
    projects: ["Projets hybrides pub/digital"],
    specialties: ["Stratégies hybrides", "Multi-canal"],
    isAdmin: false,
    hoursPerWeek: 26,
    email: "faridatou.barry@jofeplus.bf",
    phone: "+226 70 12 34 69"
  }
];

function TeamOverview() {
  const [filteredMembers, setFilteredMembers] = useState(teamMembers);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: 'success' | 'warning' | 'error' | 'info'}>>([]);

  // Metrics calculations
  const metrics = {
    totalMembers: teamMembers.length,
    available: teamMembers.filter(m => m.status === 'available').length,
    busy: teamMembers.filter(m => m.status === 'busy').length,
    avgWorkload: Math.round(teamMembers.reduce((sum, m) => sum + m.workload, 0) / teamMembers.length)
  };

  const showNotification = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  // Status helpers
  const getStatusLabel = (status: string) => {
    const labels = {
      'available': 'Disponible',
      'busy': 'Occupé',
      'away': 'Absent',
      'leave': 'En congé'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#93C954';
      case 'busy': return '#F68C1F';
      case 'away': return '#6B7280';
      case 'leave': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getWorkloadColor = (workload: number) => {
    if (workload >= 90) return '#EF4444';
    if (workload >= 80) return '#F68C1F';
    if (workload >= 60) return '#37B6E9';
    return '#93C954';
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'rgba(147, 201, 84, 0.2)';
      case 'advanced': return 'rgba(55, 182, 233, 0.2)';
      case 'intermediate': return 'rgba(52, 117, 187, 0.2)';
      case 'beginner': return 'rgba(235, 236, 237, 0.8)';
      default: return 'rgba(235, 236, 237, 0.8)';
    }
  };

  const getSkillLevelTextColor = (level: string) => {
    switch (level) {
      case 'expert': return '#93C954';
      case 'advanced': return '#37B6E9';
      case 'intermediate': return '#3475BB';
      case 'beginner': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'direction': return 'var(--jofe-blue-deep)';
      case 'senior': return 'var(--jofe-blue-light)';
      case 'intermediate': return 'var(--jofe-blue-medium)';
      case 'junior': return 'var(--jofe-green)';
      default: return 'var(--jofe-blue-medium)';
    }
  };

  // Filter and search logic
  useEffect(() => {
    let filtered = teamMembers;

    // Apply filters
    if (currentFilter !== 'all') {
      filtered = filtered.filter(member => {
        switch (currentFilter) {
          case 'available': return member.status === 'available';
          case 'busy': return member.status === 'busy';
          case 'senior': return member.category === 'senior' || member.category === 'direction';
          case 'junior': return member.category === 'junior';
          case 'design': return member.position.toLowerCase().includes('design') || member.position.toLowerCase().includes('graph');
          case 'strategy': return member.position.toLowerCase().includes('stratég') || member.position.toLowerCase().includes('directeur');
          default: return true;
        }
      });
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.skills.some(skill => skill.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'workload': return b.workload - a.workload;
        case 'performance': return b.performance - a.performance;
        case 'rate': return b.rate - a.rate;
        default: return 0;
      }
    });

    setFilteredMembers(filtered);
  }, [currentFilter, searchTerm, sortBy]);

  // Export functionality
  const exportReport = () => {
    showNotification('Génération du rapport équipe...', 'info');
    setTimeout(() => {
      showNotification('Rapport équipe exporté avec succès', 'success');
    }, 2000);
  };

  // Member actions
  const contactMember = (member: TeamMember) => {
    window.location.href = `mailto:${member.email}`;
  };

  const assignTasks = (member: TeamMember) => {
    showNotification(`Assignation de tâche à ${member.name} - Fonctionnalité à venir`, 'info');
    setSelectedMember(null);
  };

  const editMember = (member: TeamMember) => {
    showNotification(`Édition du profil de ${member.name} - Fonctionnalité à venir`, 'info');
    setSelectedMember(null);
  };

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const updateMessages = [
        'Paul Junior a terminé sa tâche de retouche photo',
        'Nouvelle tâche assignée à Fortune YANOGO',
        'Linda KABORÉ est maintenant disponible',
        'Charge de travail mise à jour pour Bientama PARÉ',
        'Nouveau projet assigné à l\'équipe digital'
      ];
      
      if (Math.random() < 0.4) {
        const message = updateMessages[Math.floor(Math.random() * updateMessages.length)];
        showNotification(message, Math.random() < 0.7 ? 'info' : 'success');
      }
    }, 25000);

    return () => clearInterval(interval);
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        style={{
          color: '#F68C1F',
          fill: i < Math.floor(rating) ? '#F68C1F' : 'transparent'
        }}
      />
    ));
  };

  const renderMemberCard = (member: TeamMember) => (
    <div
      key={member.id}
      style={{
        background: 'white',
        border: '1px solid #EBECED',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
      onClick={() => setSelectedMember(member)}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(22, 44, 84, 0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Status Indicator */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: getStatusColor(member.status),
        border: '2px solid white'
      }} />

      {/* Admin Badge */}
      {member.isAdmin && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          background: 'var(--jofe-orange)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '10px',
          fontWeight: '500'
        }}>
          ADMIN
        </div>
      )}

      {/* Avatar */}
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${getCategoryColor(member.category)}, var(--jofe-blue-medium))`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: '600',
        fontSize: '20px',
        marginBottom: '16px'
      }}>
        {member.avatar}
      </div>

      {/* Member Info */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{
          fontWeight: '600',
          fontSize: '16px',
          color: 'var(--jofe-blue-deep)',
          marginBottom: '4px'
        }}>
          {member.name}
        </h3>
        <p style={{
          fontSize: '14px',
          color: 'var(--jofe-blue-medium)',
          marginBottom: '8px'
        }}>
          {member.position}
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <span style={{
            background: `rgba(${getStatusColor(member.status).replace('#', '')}, 0.1)`,
            color: getStatusColor(member.status),
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '500'
          }}>
            {getStatusLabel(member.status)}
          </span>
          <span style={{ fontSize: '12px', color: '#6B7280' }}>
            {member.rate.toLocaleString()} FCFA/h
          </span>
        </div>
      </div>

      {/* Performance Stars */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '2px' }}>
          {renderStars(member.performance)}
        </div>
        <span style={{ fontSize: '13px', color: '#6B7280' }}>
          {member.performance}/5
        </span>
      </div>

      {/* Workload */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '13px', color: 'var(--jofe-blue-medium)' }}>
            Charge de travail
          </span>
          <span style={{ fontSize: '13px', fontWeight: '500', color: getWorkloadColor(member.workload) }}>
            {member.workload}%
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '6px',
          background: '#EBECED',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${member.workload}%`,
            background: getWorkloadColor(member.workload),
            transition: 'width 0.5s ease',
            borderRadius: '3px'
          }} />
        </div>
      </div>

      {/* Skills */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{
          fontSize: '13px',
          fontWeight: '500',
          color: 'var(--jofe-blue-deep)',
          marginBottom: '8px'
        }}>
          Compétences principales
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {member.skills.slice(0, 3).map(skill => (
            <span
              key={skill.name}
              style={{
                background: getSkillLevelColor(skill.level),
                color: getSkillLevelTextColor(skill.level),
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '10px',
                fontWeight: '500'
              }}
            >
              {skill.name}
            </span>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{
          fontSize: '13px',
          fontWeight: '500',
          color: 'var(--jofe-blue-deep)',
          marginBottom: '6px'
        }}>
          Projets actifs
        </h4>
        <p style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.4' }}>
          {member.projects.length > 0 ? member.projects.join(', ') : 'Aucun projet actif'}
        </p>
      </div>

      {/* Note if exists */}
      {member.note && (
        <div style={{
          background: 'rgba(246, 140, 31, 0.1)',
          border: '1px solid rgba(246, 140, 31, 0.2)',
          borderRadius: '6px',
          padding: '8px',
          marginBottom: '12px'
        }}>
          <p style={{ fontSize: '11px', color: 'var(--jofe-orange)', fontStyle: 'italic' }}>
            {member.note}
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            contactMember(member);
          }}
          style={{
            background: 'white',
            color: 'var(--jofe-blue-medium)',
            border: '1px solid #EBECED',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Mail size={12} />
          Contact
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedMember(member);
          }}
          style={{
            background: 'var(--jofe-blue-light)',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Eye size={12} />
          Détails
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Open Sans, sans-serif', background: 'var(--jofe-white)', color: 'var(--jofe-black)', lineHeight: '1.6', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ position: 'fixed', left: 0, top: 0, height: '100%', width: '256px', background: 'white', borderRight: '1px solid #E5E7EB', zIndex: 40 }} className="hidden md:block">
        <div style={{ padding: '24px' }}>
          {/* Logo JoFé+ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{ position: 'relative', width: '40px', height: '40px' }}>
              <div style={{ position: 'absolute', border: '3px solid var(--jofe-blue-deep)', borderRadius: '50%', width: '20px', height: '20px', top: 0, left: '10px', animation: 'rotate 8s linear infinite' }}></div>
              <div style={{ position: 'absolute', border: '3px solid var(--jofe-blue-medium)', borderRadius: '50%', width: '20px', height: '20px', top: '15px', left: 0, animation: 'rotate 8s linear infinite' }}></div>
              <div style={{ position: 'absolute', border: '3px solid var(--jofe-blue-light)', borderRadius: '50%', width: '20px', height: '20px', top: '15px', right: 0, animation: 'rotate 8s linear infinite' }}></div>
            </div>
            <div>
              <h1 style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: '700', color: 'var(--jofe-blue-deep)', margin: 0 }}>
                jofé<span style={{ color: 'var(--jofe-blue-light)' }}>+</span>
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)', margin: 0 }}>Digital Excellence</p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav style={{ marginBottom: '24px' }}>
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', color: 'var(--jofe-blue-medium)', textDecoration: 'none', marginBottom: '8px' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2z"></path>
              </svg>
              Tableau de Bord
            </Link>
            
            <Link href="/projects" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', color: 'var(--jofe-blue-medium)', textDecoration: 'none', marginBottom: '8px' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
              Projets
            </Link>
            
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', color: 'var(--jofe-white)', background: 'var(--jofe-blue-light)', textDecoration: 'none', marginBottom: '8px' }}>
              <Users size={20} />
              Équipe
            </a>
            
            <Link href="/analytics" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', color: 'var(--jofe-blue-medium)', textDecoration: 'none', marginBottom: '8px' }}>
              <TrendingUp size={20} />
              Analytics
            </Link>
          </nav>
        </div>
        
        {/* User Info */}
        <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(55, 182, 233, 0.05)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--jofe-blue-light)', color: 'white', fontWeight: '500', fontSize: '14px' }}>
              SA
            </div>
            <div>
              <p style={{ fontWeight: '500', fontSize: '14px', color: 'var(--jofe-blue-deep)', margin: 0 }}>Serge ASSALÉ</p>
              <p style={{ fontSize: '12px', color: 'var(--jofe-blue-medium)', margin: 0 }}>Directeur Création</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '256px' }} className="md:ml-64 ml-0">
        {/* Header */}
        <header style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontFamily: 'Inter', fontSize: '32px', fontWeight: '700', color: 'var(--jofe-blue-deep)', margin: 0 }}>
                Vue d'Ensemble Équipe
              </h1>
              <p style={{ fontSize: '16px', color: 'var(--jofe-blue-medium)', margin: 0 }}>
                Gestion des 14 membres créatifs JoFé+ Digital
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={exportReport}
                style={{
                  background: 'white',
                  color: 'var(--jofe-blue-medium)',
                  border: '1px solid #EBECED',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px'
                }}
              >
                <Download size={16} />
                Exporter Rapport
              </button>
              
              <button
                onClick={() => showNotification('Nouveau membre - Fonctionnalité à venir', 'info')}
                style={{
                  background: 'var(--jofe-blue-light)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px'
                }}
              >
                <Plus size={16} />
                Nouveau Membre
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Team Dashboard */}
          <div style={{
            background: 'white',
            border: '1px solid #EBECED',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <h2 style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: 'var(--jofe-blue-deep)' }}>
              Tableau de Bord Équipe
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              <div style={{
                background: 'white',
                border: '1px solid #EBECED',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--jofe-blue-deep)', marginBottom: '4px' }}>
                  {metrics.totalMembers}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>
                  Membres Actifs
                </div>
              </div>
              
              <div style={{
                background: 'white',
                border: '1px solid #EBECED',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#93C954', marginBottom: '4px' }}>
                  {metrics.available}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>
                  Disponibles
                </div>
              </div>
              
              <div style={{
                background: 'white',
                border: '1px solid #EBECED',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#F68C1F', marginBottom: '4px' }}>
                  {metrics.busy}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>
                  En Cours
                </div>
              </div>
              
              <div style={{
                background: 'white',
                border: '1px solid #EBECED',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--jofe-blue-light)', marginBottom: '4px' }}>
                  {metrics.avgWorkload}%
                </div>
                <div style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>
                  Charge Moyenne
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div style={{
            background: 'white',
            border: '1px solid #EBECED',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  { id: 'all', label: 'Tous' },
                  { id: 'available', label: 'Disponibles' },
                  { id: 'busy', label: 'Occupés' },
                  { id: 'senior', label: 'Senior' },
                  { id: 'junior', label: 'Junior' },
                  { id: 'design', label: 'Design' },
                  { id: 'strategy', label: 'Stratégie' }
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setCurrentFilter(filter.id)}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #EBECED',
                      background: currentFilter === filter.id ? 'var(--jofe-blue-light)' : 'white',
                      color: currentFilter === filter.id ? 'white' : 'var(--jofe-blue-medium)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '14px'
                    }}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
                  <input
                    type="text"
                    placeholder="Rechercher un membre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      paddingLeft: '40px',
                      paddingRight: '16px',
                      paddingTop: '8px',
                      paddingBottom: '8px',
                      border: '1px solid #EBECED',
                      borderRadius: '6px',
                      fontSize: '14px',
                      width: '200px'
                    }}
                  />
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #EBECED',
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: 'white'
                  }}
                >
                  <option value="name">Trier par nom</option>
                  <option value="workload">Trier par charge</option>
                  <option value="performance">Trier par performance</option>
                  <option value="rate">Trier par taux</option>
                </select>
              </div>
            </div>
          </div>

          {/* Team Members Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {filteredMembers.map(renderMemberCard)}
          </div>
        </main>
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--jofe-blue-deep)', marginBottom: '4px' }}>
                  {selectedMember.name}
                </h2>
                <p style={{ fontSize: '16px', color: 'var(--jofe-blue-medium)' }}>
                  {selectedMember.position}
                </p>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6B7280'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: 'var(--jofe-blue-deep)' }}>
                  Informations générales
                </h3>
                <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6' }}>
                  <p><strong>Statut:</strong> {getStatusLabel(selectedMember.status)}</p>
                  <p><strong>Taux horaire:</strong> {selectedMember.rate.toLocaleString()} FCFA/h</p>
                  <p><strong>Heures/semaine:</strong> {selectedMember.hoursPerWeek}h</p>
                  <p><strong>Performance:</strong> {selectedMember.performance}/5</p>
                  <p><strong>Charge actuelle:</strong> {selectedMember.workload}%</p>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: 'var(--jofe-blue-deep)' }}>
                  Contact
                </h3>
                <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6' }}>
                  <p><strong>Email:</strong> {selectedMember.email}</p>
                  <p><strong>Téléphone:</strong> {selectedMember.phone}</p>
                  {selectedMember.note && (
                    <div style={{
                      background: 'rgba(246, 140, 31, 0.1)',
                      padding: '8px',
                      borderRadius: '4px',
                      marginTop: '8px'
                    }}>
                      <p style={{ fontSize: '12px', color: 'var(--jofe-orange)', fontStyle: 'italic' }}>
                        {selectedMember.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: 'var(--jofe-blue-deep)' }}>
                Compétences
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedMember.skills.map(skill => (
                  <span
                    key={skill.name}
                    style={{
                      background: getSkillLevelColor(skill.level),
                      color: getSkillLevelTextColor(skill.level),
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    {skill.name} ({skill.level})
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: 'var(--jofe-blue-deep)' }}>
                Projets actifs
              </h3>
              <p style={{ fontSize: '14px', color: '#6B7280' }}>
                {selectedMember.projects.length > 0 ? selectedMember.projects.join(', ') : 'Aucun projet actif'}
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: 'var(--jofe-blue-deep)' }}>
                Spécialités
              </h3>
              <p style={{ fontSize: '14px', color: '#6B7280' }}>
                {selectedMember.specialties.join(', ')}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => assignTasks(selectedMember)}
                style={{
                  background: 'var(--jofe-blue-light)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px'
                }}
              >
                <Target size={14} />
                Assigner Tâche
              </button>
              
              <button
                onClick={() => contactMember(selectedMember)}
                style={{
                  background: 'white',
                  color: 'var(--jofe-blue-medium)',
                  border: '1px solid #EBECED',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px'
                }}
              >
                <Mail size={14} />
                Contacter
              </button>
              
              <button
                onClick={() => editMember(selectedMember)}
                style={{
                  background: 'white',
                  color: 'var(--jofe-blue-medium)',
                  border: '1px solid #EBECED',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px'
                }}
              >
                <Edit3 size={14} />
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1001 }}>
        {notifications.map(notification => (
          <div
            key={notification.id}
            style={{
              background: notification.type === 'success' ? '#93C954' : 
                         notification.type === 'warning' ? '#F68C1F' :
                         notification.type === 'error' ? '#EF4444' : 'var(--jofe-blue-light)',
              color: 'white',
              padding: '16px 20px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              marginBottom: '8px',
              maxWidth: '350px',
              animation: 'slideInRight 0.3s ease',
              fontSize: '14px'
            }}
          >
            {notification.message}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        :root {
          --jofe-blue-deep: #162C54;
          --jofe-blue-night: #1A4278;
          --jofe-blue-medium: #3475BB;
          --jofe-blue-light: #37B6E9;
          --jofe-black: #000000;
          --jofe-gray: #EBECED;
          --jofe-white: #FFFFFF;
          --jofe-green: #93C954;
          --jofe-orange: #F68C1F;
        }
      `}</style>
    </div>
  );
}

export default TeamOverview;