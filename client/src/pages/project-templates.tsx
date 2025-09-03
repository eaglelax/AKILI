import React, { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { Heart, Search, Plus, Eye, Check, X, Star } from 'lucide-react';

interface ProjectTemplate {
  id: string;
  name: string;
  category: 'telecom' | 'finance' | 'corporate' | 'digital' | 'event';
  description: string;
  tasks: number;
  duration: number; // weeks
  budget: number; // FCFA
  team: string[];
  tags: string[];
  timeline: string[];
  deliverables: string[];
  success_rate: number;
  icon: string;
  popular?: boolean;
  new?: boolean;
}

const categories = [
  { id: 'all', name: 'Tous', count: 20 },
  { id: 'telecom', name: 'Télécommunications', count: 4 },
  { id: 'finance', name: 'Finance/Banque', count: 5 },
  { id: 'corporate', name: 'Corporate', count: 4 },
  { id: 'digital', name: 'Digital/Web', count: 4 },
  { id: 'event', name: 'Événementiel', count: 3 }
];

const templates: ProjectTemplate[] = [
  // Télécommunications
  {
    id: 'telecom-1',
    name: 'Campagne MOOV AFRICA',
    category: 'telecom',
    description: 'Template complet pour campagne télécom multi-canal avec activation terrain et digital.',
    tasks: 12,
    duration: 6,
    budget: 18000000,
    team: ['Paul Junior OUEDRAOGO', 'Fortune YANOGO', 'Florita KABORÉ', 'Linda KABORÉ'],
    tags: ['Populaire', 'Multi-canal'],
    timeline: [
      'Brief et stratégie créative (4 jours)',
      'Concept et direction artistique (5 jours)',
      'Production assets visuels (8 jours)',
      'Shooting photo/vidéo (3 jours)',
      'Post-production et montage (7 jours)',
      'Déploiement et activation (5 jours)'
    ],
    deliverables: ['Identité campagne', 'Assets digitaux', 'Supports print', 'Vidéos publicitaires', 'Guide d\'application'],
    success_rate: 92,
    icon: '📱',
    popular: true
  },
  {
    id: 'telecom-2',
    name: 'Lancement Orange Money',
    category: 'telecom',
    description: 'Template spécialisé pour lancement services financiers mobiles avec focus éducationnel.',
    tasks: 10,
    duration: 5,
    budget: 15000000,
    team: ['Nebié WEBOU', 'Djamilatou GUIGUEMDE', 'Bientama PARÉ'],
    tags: ['Fintech', 'Éducation'],
    timeline: [
      'Analyse marché et insights (5 jours)',
      'Stratégie de communication (4 jours)',
      'Création supports pédagogiques (8 jours)',
      'Production matériel activation (6 jours)',
      'Formation équipes terrain (2 jours)'
    ],
    deliverables: ['Plan de lancement', 'Supports pédagogiques', 'Matériel activation', 'Formation teams'],
    success_rate: 89,
    icon: '💰'
  },
  {
    id: 'telecom-3',
    name: 'Renouvellement Offres Prépayées',
    category: 'telecom',
    description: 'Template pour relance et modernisation des offres prépayées existantes.',
    tasks: 8,
    duration: 4,
    budget: 12000000,
    team: ['Issa CISSE', 'Maryse BOMBIRI', 'Faridatou BARRY'],
    tags: ['Relance', 'Modernisation'],
    timeline: [
      'Audit offres existantes (3 jours)',
      'Benchmark concurrentiel (3 jours)',
      'Refonte communication (7 jours)',
      'Tests et optimisation (3 jours)'
    ],
    deliverables: ['Nouveau positionnement', 'Campagne refonte', 'Supports terrain'],
    success_rate: 85,
    icon: '🔄'
  },
  {
    id: 'telecom-4',
    name: 'Fibre Optique Résidentielle',
    category: 'telecom',
    description: 'Template pour promotion services Internet haut débit résidentiels.',
    tasks: 11,
    duration: 6,
    budget: 20000000,
    team: ['Jean-Jacques SAMPABAO', 'Abdoul Latif OUEDRAOGO', 'Linda KABORÉ'],
    tags: ['Fibre', 'Résidentiel'],
    timeline: [
      'Cartographie zones de couverture (3 jours)',
      'Stratégie géo-ciblée (4 jours)',
      'Création campagne locale (10 jours)',
      'Déploiement par zones (7 jours)'
    ],
    deliverables: ['Stratégie géo-marketing', 'Campagne multi-canal', 'Outils terrain'],
    success_rate: 87,
    icon: '🌐'
  },

  // Finance & Banque
  {
    id: 'finance-1',
    name: 'Rebranding BANK OF AFRICA',
    category: 'finance',
    description: 'Template premium pour refonte complète identité bancaire avec déploiement multi-supports.',
    tasks: 18,
    duration: 10,
    budget: 35000000,
    team: ['Serge ASSALÉ', 'Jean-Jacques SAMPABAO', 'Abdoul Latif OUEDRAOGO', 'Paul Junior OUEDRAOGO'],
    tags: ['Premium', 'Rebranding'],
    timeline: [
      'Audit identité existante (6 jours)',
      'Recherche et concepts (8 jours)',
      'Création nouvelle identité (15 jours)',
      'Guide de marque (10 jours)',
      'Déploiement progressif (12 jours)'
    ],
    deliverables: ['Nouvelle identité visuelle', 'Guide de marque complet', 'Déclinaisons tous supports', 'Plan de déploiement'],
    success_rate: 94,
    icon: '🏦',
    popular: true
  },
  {
    id: 'finance-2',
    name: 'Carte de Crédit Premium',
    category: 'finance',
    description: 'Template pour lancement produit bancaire haut de gamme avec positionnement luxe.',
    tasks: 12,
    duration: 7,
    budget: 22000000,
    team: ['Fortune YANOGO', 'Florita KABORÉ', 'Enos GOUBA'],
    tags: ['Premium', 'Luxe'],
    timeline: [
      'Positionnement premium (4 jours)',
      'Création univers luxe (8 jours)',
      'Production supports premium (10 jours)',
      'Lancement exclusif (5 jours)'
    ],
    deliverables: ['Identité produit premium', 'Supports luxe', 'Expérience client VIP'],
    success_rate: 91,
    icon: '💳'
  },
  {
    id: 'finance-3',
    name: 'Microfinance Rurale',
    category: 'finance',
    description: 'Template adapté aux services financiers en zones rurales avec approche locale.',
    tasks: 9,
    duration: 5,
    budget: 8000000,
    team: ['Nebié WEBOU', 'Djamilatou GUIGUEMDE', 'Maryse BOMBIRI'],
    tags: ['Rural', 'Inclusion'],
    timeline: [
      'Étude communautés rurales (5 jours)',
      'Adaptation culturelle (4 jours)',
      'Supports en langues locales (8 jours)',
      'Formation agents terrain (3 jours)'
    ],
    deliverables: ['Communication adaptée', 'Supports multilingues', 'Outils terrain'],
    success_rate: 88,
    icon: '🌾'
  },
  {
    id: 'finance-4',
    name: 'Assurance Vie Familiale',
    category: 'finance',
    description: 'Template pour produits d\'assurance avec focus confiance et protection familiale.',
    tasks: 10,
    duration: 6,
    budget: 16000000,
    team: ['Issa CISSE', 'Faridatou BARRY', 'Linda KABORÉ'],
    tags: ['Assurance', 'Famille'],
    timeline: [
      'Insights famille et protection (4 jours)',
      'Storytelling émotionnel (5 jours)',
      'Production contenus familiaux (8 jours)',
      'Campagne testimonials (5 jours)'
    ],
    deliverables: ['Campagne émotionnelle', 'Contenus familiaux', 'Témoignages clients'],
    success_rate: 86,
    icon: '🛡️'
  },
  {
    id: 'finance-5',
    name: 'Mobile Banking App',
    category: 'finance',
    description: 'Template pour lancement application bancaire mobile avec onboarding digital.',
    tasks: 14,
    duration: 8,
    budget: 25000000,
    team: ['Abdoul Latif OUEDRAOGO', 'Bientama PARÉ', 'Paul Junior OUEDRAOGO'],
    tags: ['App', 'Digital'],
    timeline: [
      'UX/UI design app (10 jours)',
      'Stratégie onboarding (5 jours)',
      'Campagne de lancement (8 jours)',
      'Support utilisateurs (4 jours)'
    ],
    deliverables: ['Design app', 'Stratégie onboarding', 'Campagne lancement'],
    success_rate: 90,
    icon: '📲',
    new: true
  },

  // Corporate/Institutionnel
  {
    id: 'corporate-1',
    name: 'Rapport Annuel Premium',
    category: 'corporate',
    description: 'Template pour création de rapports annuels corporate avec design premium.',
    tasks: 15,
    duration: 8,
    budget: 18000000,
    team: ['Serge ASSALÉ', 'Jean-Jacques SAMPABAO', 'Abdoul Latif OUEDRAOGO'],
    tags: ['Rapport', 'Premium'],
    timeline: [
      'Collecte données et contenus (7 jours)',
      'Conception éditoriale (6 jours)',
      'Design et mise en page (12 jours)',
      'Production et finition (5 jours)'
    ],
    deliverables: ['Rapport annuel print', 'Version digitale', 'Présentation executive'],
    success_rate: 92,
    icon: '📊'
  },
  {
    id: 'corporate-2',
    name: 'Événement Institutionnel',
    category: 'corporate',
    description: 'Template pour organisation d\'événements corporate et institutionnels.',
    tasks: 12,
    duration: 6,
    budget: 15000000,
    team: ['Fortune YANOGO', 'Florita KABORÉ', 'Enos GOUBA'],
    tags: ['Événement', 'Institutionnel'],
    timeline: [
      'Conceptualisation événement (4 jours)',
      'Identité visuelle événement (5 jours)',
      'Production supports (8 jours)',
      'Coordination événement (3 jours)'
    ],
    deliverables: ['Concept événement', 'Identité visuelle', 'Supports communication'],
    success_rate: 89,
    icon: '🎯'
  },
  {
    id: 'corporate-3',
    name: 'RSE et Développement Durable',
    category: 'corporate',
    description: 'Template pour communication RSE et initiatives de développement durable.',
    tasks: 8,
    duration: 5,
    budget: 12000000,
    team: ['Nebié WEBOU', 'Djamilatou GUIGUEMDE', 'Maryse BOMBIRI'],
    tags: ['RSE', 'Durable'],
    timeline: [
      'Audit initiatives RSE (3 jours)',
      'Stratégie communication impact (4 jours)',
      'Création contenus responsables (6 jours)',
      'Déploiement multi-canal (4 jours)'
    ],
    deliverables: ['Stratégie RSE', 'Contenus impact', 'Rapports durabilité'],
    success_rate: 87,
    icon: '🌱'
  },
  {
    id: 'corporate-4',
    name: 'Transformation Digitale',
    category: 'corporate',
    description: 'Template pour accompagner les entreprises dans leur transformation digitale.',
    tasks: 16,
    duration: 9,
    budget: 28000000,
    team: ['Paul Junior OUEDRAOGO', 'Abdoul Latif OUEDRAOGO', 'Bientama PARÉ', 'Linda KABORÉ'],
    tags: ['Digital', 'Transformation'],
    timeline: [
      'Audit digital existant (5 jours)',
      'Stratégie transformation (7 jours)',
      'Roadmap et planning (6 jours)',
      'Formation équipes (8 jours)',
      'Accompagnement change (10 jours)'
    ],
    deliverables: ['Audit digital', 'Stratégie transformation', 'Roadmap détaillée', 'Formation teams'],
    success_rate: 85,
    icon: '⚡',
    new: true
  },

  // Digital/Web
  {
    id: 'digital-1',
    name: 'Site Web Corporate',
    category: 'digital',
    description: 'Template pour création de sites web corporate avec CMS et responsive design.',
    tasks: 14,
    duration: 8,
    budget: 22000000,
    team: ['Abdoul Latif OUEDRAOGO', 'Paul Junior OUEDRAOGO', 'Bientama PARÉ'],
    tags: ['Website', 'Responsive'],
    timeline: [
      'UX/UI design (8 jours)',
      'Développement front-end (12 jours)',
      'Intégration CMS (6 jours)',
      'Tests et optimisation (4 jours)'
    ],
    deliverables: ['Site web responsive', 'CMS administration', 'Formation client'],
    success_rate: 93,
    icon: '💻'
  },
  {
    id: 'digital-2',
    name: 'E-commerce Marketplace',
    category: 'digital',
    description: 'Template pour création de plateformes e-commerce avec paiement mobile.',
    tasks: 18,
    duration: 10,
    budget: 35000000,
    team: ['Paul Junior OUEDRAOGO', 'Abdoul Latif OUEDRAOGO', 'Bientama PARÉ', 'Linda KABORÉ'],
    tags: ['E-commerce', 'Mobile Pay'],
    timeline: [
      'Architecture plateforme (6 jours)',
      'Design UX/UI (10 jours)',
      'Développement backend (15 jours)',
      'Intégration paiements (8 jours)',
      'Tests et sécurisation (6 jours)'
    ],
    deliverables: ['Plateforme e-commerce', 'App mobile', 'Système paiement'],
    success_rate: 88,
    icon: '🛒',
    popular: true
  },
  {
    id: 'digital-3',
    name: 'Application Mobile',
    category: 'digital',
    description: 'Template pour développement d\'applications mobiles natives iOS/Android.',
    tasks: 16,
    duration: 9,
    budget: 30000000,
    team: ['Bientama PARÉ', 'Paul Junior OUEDRAOGO', 'Abdoul Latif OUEDRAOGO'],
    tags: ['App Mobile', 'Native'],
    timeline: [
      'Conceptualisation app (5 jours)',
      'Design UI/UX mobile (8 jours)',
      'Développement iOS/Android (20 jours)',
      'Tests et debug (7 jours)',
      'Publication stores (3 jours)'
    ],
    deliverables: ['App iOS', 'App Android', 'Documentation technique'],
    success_rate: 91,
    icon: '📱'
  },
  {
    id: 'digital-4',
    name: 'Dashboard Analytics',
    category: 'digital',
    description: 'Template pour création de tableaux de bord et systèmes d\'analytics.',
    tasks: 12,
    duration: 7,
    budget: 20000000,
    team: ['Abdoul Latif OUEDRAOGO', 'Paul Junior OUEDRAOGO', 'Enos GOUBA'],
    tags: ['Analytics', 'Dashboard'],
    timeline: [
      'Définition KPIs (4 jours)',
      'Design dashboard (6 jours)',
      'Développement backend (10 jours)',
      'Intégration données (6 jours)'
    ],
    deliverables: ['Dashboard interactif', 'Système analytics', 'Rapports automatisés'],
    success_rate: 89,
    icon: '📈'
  },

  // Événementiel
  {
    id: 'event-1',
    name: 'Festival Cultural',
    category: 'event',
    description: 'Template pour organisation de festivals et événements culturels au Burkina Faso.',
    tasks: 20,
    duration: 12,
    budget: 45000000,
    team: ['Fortune YANOGO', 'Florita KABORÉ', 'Enos GOUBA', 'Maryse BOMBIRI', 'Faridatou BARRY'],
    tags: ['Festival', 'Culture'],
    timeline: [
      'Concept et programmation (8 jours)',
      'Identité visuelle festival (6 jours)',
      'Communication et promotion (15 jours)',
      'Logistique et coordination (10 jours)',
      'Réalisation événement (3 jours)'
    ],
    deliverables: ['Concept festival', 'Identité complète', 'Plan communication', 'Coordination événement'],
    success_rate: 86,
    icon: '🎭'
  },
  {
    id: 'event-2',
    name: 'Activation Produit',
    category: 'event',
    description: 'Template pour activations produit et expériences de marque immersives.',
    tasks: 10,
    duration: 4,
    budget: 18000000,
    team: ['Fortune YANOGO', 'Linda KABORÉ', 'Issa CISSE'],
    tags: ['Activation', 'Expérience'],
    timeline: [
      'Concept activation (3 jours)',
      'Design expérience (5 jours)',
      'Production supports (6 jours)',
      'Réalisation activation (2 jours)'
    ],
    deliverables: ['Concept activation', 'Supports expérience', 'Animation terrain'],
    success_rate: 92,
    icon: '✨'
  },
  {
    id: 'event-3',
    name: 'Conférence Business',
    category: 'event',
    description: 'Template pour organisation de conférences et événements business.',
    tasks: 12,
    duration: 6,
    budget: 25000000,
    team: ['Serge ASSALÉ', 'Nebié WEBOU', 'Djamilatou GUIGUEMDE', 'Enos GOUBA'],
    tags: ['Conférence', 'Business'],
    timeline: [
      'Programme et speakers (6 jours)',
      'Identité conférence (4 jours)',
      'Supports communication (8 jours)',
      'Logistique événement (4 jours)'
    ],
    deliverables: ['Programme complet', 'Identité événement', 'Supports logistiques'],
    success_rate: 90,
    icon: '🎯'
  }
];

function ProjectTemplates() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort templates
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0) || b.success_rate - a.success_rate);
        break;
      case 'recent':
        filtered.sort((a, b) => (b.new ? 1 : 0) - (a.new ? 1 : 0));
        break;
      case 'budget-asc':
        filtered.sort((a, b) => a.budget - b.budget);
        break;
      case 'budget-desc':
        filtered.sort((a, b) => b.budget - a.budget);
        break;
      case 'duration':
        filtered.sort((a, b) => a.duration - b.duration);
        break;
    }

    return filtered;
  }, [selectedCategory, searchTerm, sortBy]);

  const stats = {
    total: templates.length,
    projects: 156,
    success: 94,
    rating: 4.8
  };

  const templatesByCategory = useMemo(() => {
    const grouped: Record<string, ProjectTemplate[]> = {};
    
    if (selectedCategory === 'all') {
      categories.slice(1).forEach(category => {
        grouped[category.id] = templates.filter(t => t.category === category.id);
      });
    } else {
      grouped[selectedCategory] = filteredTemplates;
    }
    
    return grouped;
  }, [selectedCategory, filteredTemplates]);

  const toggleFavorite = (templateId: string) => {
    setFavorites(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const openPreview = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  const useTemplate = (template: ProjectTemplate) => {
    // In real app, this would redirect to project creation with template data
    alert(`Template "${template.name}" utilisé avec succès !`);
    setIsPreviewOpen(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'telecom': return '📡';
      case 'finance': return '🏦';
      case 'corporate': return '🏢';
      case 'digital': return '💻';
      case 'event': return '🎭';
      default: return '📁';
    }
  };

  const getCategoryName = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.name : category;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'telecom': return 'var(--jofe-blue-light)';
      case 'finance': return 'var(--jofe-green)';
      case 'corporate': return 'var(--jofe-blue-deep)';
      case 'digital': return 'var(--jofe-orange)';
      case 'event': return '#E74C3C';
      default: return 'var(--jofe-blue-medium)';
    }
  };

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
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
              Templates
            </a>
            
            <Link href="/team" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', color: 'var(--jofe-blue-medium)', textDecoration: 'none', marginBottom: '8px' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197"></path>
              </svg>
              Équipe
            </Link>
          </nav>
        </div>
        
        {/* User Info */}
        <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(55, 182, 233, 0.05)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--jofe-blue-light)' }}>
              <svg style={{ width: '20px', height: '20px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
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
                Templates de Projets
              </h1>
              <p style={{ fontSize: '16px', color: 'var(--jofe-blue-medium)', margin: 0 }}>
                Bibliothèque complète de templates pré-configurés
              </p>
            </div>
            <button 
              onClick={() => setIsCreateOpen(true)}
              style={{ background: 'var(--jofe-blue-light)', color: 'var(--jofe-white)', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={20} />
              Nouveau Template
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ padding: '24px' }}>
          {/* Statistics Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--jofe-blue-deep)', marginBottom: '4px' }}>{stats.total}</div>
              <div style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>Templates Disponibles</div>
            </div>
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--jofe-blue-deep)', marginBottom: '4px' }}>{stats.projects}</div>
              <div style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>Projets Créés</div>
            </div>
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--jofe-blue-deep)', marginBottom: '4px' }}>{stats.success}%</div>
              <div style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>Taux de Succès</div>
            </div>
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--jofe-blue-deep)', marginBottom: '4px' }}>{stats.rating}/5</div>
              <div style={{ fontSize: '14px', color: 'var(--jofe-blue-medium)' }}>Satisfaction Moyenne</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="lg:flex-row lg:items-center lg:justify-between">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    style={{
                      background: selectedCategory === category.id ? 'var(--jofe-blue-light)' : '#EBECED',
                      color: selectedCategory === category.id ? 'white' : 'var(--jofe-blue-medium)',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un template..."
                    style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '10px 40px 10px 16px', fontSize: '14px', width: '250px', outline: 'none' }}
                  />
                  <Search style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--jofe-blue-medium)' }} size={18} />
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '10px 16px', fontSize: '14px', outline: 'none' }}
                >
                  <option value="popular">Plus populaires</option>
                  <option value="recent">Plus récents</option>
                  <option value="budget-asc">Budget croissant</option>
                  <option value="budget-desc">Budget décroissant</option>
                  <option value="duration">Durée</option>
                </select>
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div style={{ marginBottom: '40px' }}>
            {Object.entries(templatesByCategory).map(([categoryId, categoryTemplates]) => (
              <div key={categoryId} style={{ marginBottom: '48px' }}>
                {/* Category Header */}
                <div style={{ 
                  background: `linear-gradient(135deg, ${getCategoryColor(categoryId)}, var(--jofe-blue-medium))`, 
                  color: 'white', 
                  padding: '20px 24px', 
                  borderRadius: '12px', 
                  marginBottom: '24px' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h2 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>
                        {getCategoryIcon(categoryId)} {getCategoryName(categoryId)}
                      </h2>
                      <p style={{ fontSize: '14px', opacity: 0.9, margin: '4px 0 0 0' }}>
                        Templates optimisés pour {getCategoryName(categoryId).toLowerCase()}
                      </p>
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>
                      {categoryTemplates.length} template{categoryTemplates.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Templates Grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                  gap: '24px' 
                }}>
                  {categoryTemplates.map(template => (
                    <div
                      key={template.id}
                      style={{
                        background: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        padding: '24px',
                        height: '320px',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(22, 44, 84, 0.15)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = 'var(--jofe-blue-light)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '';
                        e.currentTarget.style.transform = '';
                        e.currentTarget.style.borderColor = '#E5E7EB';
                      }}
                    >
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(template.id);
                        }}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: favorites.includes(template.id) ? 'var(--jofe-orange)' : '#E5E7EB',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Heart size={20} fill={favorites.includes(template.id) ? 'currentColor' : 'none'} />
                      </button>

                      {/* Template Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '8px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          background: `rgba(${getCategoryColor(template.category) === 'var(--jofe-blue-light)' ? '55, 182, 233' : 
                            getCategoryColor(template.category) === 'var(--jofe-green)' ? '147, 201, 84' :
                            getCategoryColor(template.category) === 'var(--jofe-blue-deep)' ? '22, 44, 84' :
                            getCategoryColor(template.category) === 'var(--jofe-orange)' ? '246, 140, 31' : '231, 76, 60'}, 0.1)`,
                          fontSize: '18px'
                        }}>
                          {template.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontWeight: '600', color: 'var(--jofe-blue-deep)', margin: 0, fontSize: '16px' }}>
                            {template.name}
                          </h3>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                            {template.tags.slice(0, 2).map(tag => (
                              <span
                                key={tag}
                                style={{
                                  background: 'rgba(55, 182, 233, 0.1)',
                                  color: 'var(--jofe-blue-medium)',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: '500'
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                            {(template.popular || template.new) && (
                              <span style={{
                                background: template.popular ? 'var(--jofe-orange)' : 'var(--jofe-green)',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}>
                                {template.popular && <Star size={10} fill="currentColor" />}
                                {template.popular ? 'Populaire' : 'Nouveau'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px', flex: 1, lineHeight: '1.5' }}>
                        {template.description}
                      </p>

                      {/* Template Stats */}
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                          <span style={{ color: 'var(--jofe-blue-medium)' }}>
                            {template.tasks} tâches • {template.duration} semaines
                          </span>
                          <span style={{ fontWeight: '600', color: 'var(--jofe-green)' }}>
                            {(template.budget / 1000000).toFixed(0)}M FCFA
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div style={{ width: '100%', height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                          <div
                            style={{
                              height: '100%',
                              background: 'linear-gradient(90deg, var(--jofe-blue-light), var(--jofe-green))',
                              borderRadius: '3px',
                              width: `${template.success_rate}%`,
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </div>
                        
                        <div style={{ fontSize: '12px', color: 'var(--jofe-blue-medium)' }}>
                          Taux de succès: {template.success_rate}%
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openPreview(template);
                          }}
                          style={{
                            flex: 1,
                            background: 'white',
                            color: 'var(--jofe-blue-medium)',
                            border: '1px solid #E5E7EB',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            fontSize: '14px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--jofe-blue-light)';
                            e.currentTarget.style.color = 'var(--jofe-blue-deep)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#E5E7EB';
                            e.currentTarget.style.color = 'var(--jofe-blue-medium)';
                          }}
                        >
                          <Eye size={16} />
                          Aperçu
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            useTemplate(template);
                          }}
                          style={{
                            flex: 1,
                            background: 'var(--jofe-green)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            fontSize: '14px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#7BB946';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--jofe-green)';
                          }}
                        >
                          <Plus size={16} />
                          Utiliser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && selectedTemplate && (
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
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--jofe-blue-deep)', margin: 0 }}>
                Aperçu - {selectedTemplate.name}
              </h2>
              <button
                onClick={() => setIsPreviewOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '6px' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }} className="md:grid-cols-2 grid-cols-1">
                <div>
                  <h3 style={{ fontWeight: '600', marginBottom: '12px', color: 'var(--jofe-blue-deep)' }}>Informations Générales</h3>
                  <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    <p><strong>Catégorie:</strong> {getCategoryName(selectedTemplate.category)}</p>
                    <p><strong>Durée:</strong> {selectedTemplate.duration} semaines</p>
                    <p><strong>Budget:</strong> {selectedTemplate.budget.toLocaleString()} FCFA</p>
                    <p><strong>Nombre de tâches:</strong> {selectedTemplate.tasks}</p>
                    <p><strong>Taux de succès:</strong> {selectedTemplate.success_rate}%</p>
                  </div>
                </div>
                
                <div>
                  <h3 style={{ fontWeight: '600', marginBottom: '12px', color: 'var(--jofe-blue-deep)' }}>Équipe Recommandée</h3>
                  <div style={{ fontSize: '14px' }}>
                    {selectedTemplate.team.map(member => (
                      <div key={member} style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--jofe-blue-light)' }} />
                        {member}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontWeight: '600', marginBottom: '12px', color: 'var(--jofe-blue-deep)' }}>Description</h3>
                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6' }}>{selectedTemplate.description}</p>
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontWeight: '600', marginBottom: '12px', color: 'var(--jofe-blue-deep)' }}>Timeline Prévisionnelle</h3>
                <div>
                  {selectedTemplate.timeline.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderLeft: '2px solid #E5E7EB', paddingLeft: '16px', marginLeft: '8px', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-6px', top: '50%', transform: 'translateY(-50%)', width: '10px', height: '10px', background: 'var(--jofe-blue-light)', borderRadius: '50%' }} />
                      <span style={{ fontSize: '14px' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 style={{ fontWeight: '600', marginBottom: '12px', color: 'var(--jofe-blue-deep)' }}>Livrables</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  {selectedTemplate.deliverables.map(deliverable => (
                    <div key={deliverable} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                      <Check size={16} style={{ color: 'var(--jofe-green)' }} />
                      {deliverable}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsPreviewOpen(false)}
                style={{
                  background: 'white',
                  color: 'var(--jofe-blue-medium)',
                  border: '1px solid #E5E7EB',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Fermer
              </button>
              <button
                onClick={() => useTemplate(selectedTemplate)}
                style={{
                  background: 'var(--jofe-blue-light)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Utiliser ce Template
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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

export default ProjectTemplates;