import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Calendar, CalendarDays, Users, Video, Palette, BookOpen, Plus, Target, Save, Send, TrendingUp, Clock, DollarSign, User, Check, ArrowLeft, CalendarIcon, ChevronRight, Eye, Star, CheckCircle, FileText, Link, AlertCircle, X, Upload, Folder, Settings, Zap, BarChart3 } from 'lucide-react';
import TopNavBar from '@/components/TopNavBar';

// Templates de projet pré-configurés selon les métiers de Jo'Fé Digital avec tâches détaillées
const projectTemplates = {
  'campagne-moov': {
    id: 'campagne-moov',
    name: 'Campagne MOOV',
    description: 'Template optimisé pour les campagnes publicitaires MOOV AFRICA',
    details: '• Photomontage • Motion Design • Community Management',
    icon: Star,
    type: 'campagne_360',
    duration: '6-8 semaines',
    budget: 2500000,
    milestones: [
      { name: 'Brief et validation concept', date: 7, deliverable: 'Document de brief créatif' },
      { name: 'Première présentation créative', date: 14, deliverable: 'Maquettes et story-board' },
      { name: 'Production finalisée', date: 35, deliverable: 'Assets finaux et campagne' },
      { name: 'Lancement campagne', date: 42, deliverable: 'Rapport de lancement' }
    ],
    tasks: [
      { name: 'Brief et stratégie créative', duration: 8, member: 'serge-assale', priority: 'haute', category: 'strategie' },
      { name: 'Création concepts visuels', duration: 16, member: 'enos-gouba', priority: 'haute', category: 'creation' },
      { name: 'Photomontage publicitaire', duration: 12, member: 'armel-bationo', priority: 'normale', category: 'production' },
      { name: 'Motion Design spot TV/Digital', duration: 20, member: 'armel-bationo', priority: 'normale', category: 'production' },
      { name: 'Community Management 4 semaines', duration: 40, member: 'florita-kabore', priority: 'normale', category: 'digital' },
      { name: 'Shooting photo produit', duration: 8, member: 'boureima-ouedraogo', priority: 'normale', category: 'production' }
    ]
  },
  'branding-bancaire': {
    id: 'branding-bancaire',
    name: 'Branding Bancaire',
    description: 'Identité visuelle pour institutions financières',
    details: '• Logo • Charte graphique • Supports corporate',
    icon: Palette,
    type: 'identite_visuelle',
    duration: '4-6 semaines',
    budget: 1800000,
    milestones: [
      { name: 'Audit et recherches', date: 5, deliverable: 'Audit de marque et benchmarks' },
      { name: 'Concepts logo', date: 14, deliverable: '3 propositions de logo' },
      { name: 'Charte graphique', date: 28, deliverable: 'Charte complète' },
      { name: 'Déclinaisons finales', date: 35, deliverable: 'Kit complet d\'identité' }
    ],
    tasks: [
      { name: 'Audit visuel existant', duration: 6, member: 'serge-assale', priority: 'haute', category: 'strategie' },
      { name: 'Recherche et concepts', duration: 12, member: 'enos-gouba', priority: 'haute', category: 'creation' },
      { name: 'Création logo définitif', duration: 16, member: 'armel-bationo', priority: 'haute', category: 'creation' },
      { name: 'Charte graphique complète', duration: 20, member: 'enos-gouba', priority: 'normale', category: 'creation' },
      { name: 'Déclinaisons supports corporate', duration: 24, member: 'issa-cisse', priority: 'normale', category: 'production' },
      { name: 'Guideline d\'application', duration: 8, member: 'mariam-kone', priority: 'normale', category: 'contenu' }
    ]
  },
  'digital-360': {
    id: 'digital-360',
    name: 'Digital 360°',
    description: 'Stratégie digitale complète multi-canaux',
    details: '• Stratégie • Contenus • SEO • Social Media • Analytics',
    icon: BookOpen,
    type: 'digital_social',
    duration: 'En continu',
    budget: 3200000,
    milestones: [
      { name: 'Audit et stratégie digitale', date: 7, deliverable: 'Plan stratégique digital' },
      { name: 'Lancement contenus', date: 14, deliverable: 'Première vague de contenus' },
      { name: 'Optimisation SEO', date: 30, deliverable: 'Site optimisé et backlinks' },
      { name: 'Bilan mensuel performance', date: 30, deliverable: 'Rapport analytics complet' }
    ],
    tasks: [
      { name: 'Audit digital complet', duration: 8, member: 'serge-assale', priority: 'haute', category: 'strategie' },
      { name: 'Stratégie contenus & planning', duration: 12, member: 'florita-kabore', priority: 'haute', category: 'digital' },
      { name: 'Création visuels réseaux sociaux', duration: 32, member: 'issa-cisse', priority: 'normale', category: 'creation' },
      { name: 'Community Management quotidien', duration: 40, member: 'florita-kabore', priority: 'normale', category: 'digital' },
      { name: 'Optimisation SEO technique', duration: 16, member: 'ibrahim-traore', priority: 'normale', category: 'tech' },
      { name: 'Analytics et reporting', duration: 8, member: 'serge-assale', priority: 'normale', category: 'strategie' }
    ]
  }
};

// Liste des 33 clients réels de Jo'Fé Digital
const clients = [
  { value: 'moov_africa', label: 'MOOV AFRICA', sector: 'Télécommunications', budget_range: 'Premium' },
  { value: 'bank_of_africa', label: 'BANK OF AFRICA', sector: 'Finance', budget_range: 'Premium' },
  { value: 'sunu_burkina', label: 'SUNU BURKINA', sector: 'Assurance', budget_range: 'Standard' },
  { value: 'roxgold', label: 'ROXGOLD', sector: 'Mines', budget_range: 'Premium' },
  { value: 'vincent_associes', label: 'VINCENT & ASSOCIES', sector: 'Services', budget_range: 'Standard' },
  { value: 'pnud_bf', label: 'PNUD BF', sector: 'International', budget_range: 'Premium' },
  { value: 'anssi', label: 'ANSSI', sector: 'Public', budget_range: 'Standard' },
  { value: 'babali_eau', label: 'BABALI EAU', sector: 'Boissons', budget_range: 'Standard' },
  { value: 'dafani', label: 'DAFANI', sector: 'Commerce', budget_range: 'Basique' },
  { value: 'babali_boissons', label: 'BABALI BOISSONS', sector: 'Boissons', budget_range: 'Standard' },
  { value: 'laafi_nanda', label: 'LAAFI NANDA', sector: 'Santé', budget_range: 'Standard' },
  { value: 'africa_performance', label: 'AFRICA PERFORMANCE GROUPE', sector: 'Conseil', budget_range: 'Standard' },
  { value: 'le_trapeze', label: 'BAR-RESTAU LE TRAPEZE', sector: 'Restauration', budget_range: 'Basique' },
  { value: 'uab_assurances', label: 'UAB ASSURANCES', sector: 'Assurance', budget_range: 'Standard' },
  { value: 'cnpb', label: 'CNPB', sector: 'Public', budget_range: 'Standard' },
  { value: 'fidelis_finance', label: 'FIDELIS FINANCE BURKINA', sector: 'Finance', budget_range: 'Standard' },
  { value: 'sunu_mali', label: 'SUNU ASSURANCES IARD MALI', sector: 'Assurance', budget_range: 'Standard' },
  { value: 'sonar_groupe', label: 'SONAR GROUPE', sector: 'Industrie', budget_range: 'Standard' },
  { value: 'oryx_burkina', label: 'ORYX BURKINA', sector: 'Énergie', budget_range: 'Premium' },
  { value: 'badf', label: 'BADF', sector: 'Finance', budget_range: 'Standard' },
  { value: 'forever', label: 'FOREVER', sector: 'Cosmétiques', budget_range: 'Standard' },
  { value: 'froid_solutions', label: 'FROID SOLUTIONS', sector: 'Technique', budget_range: 'Basique' },
  { value: 'ksc_group', label: 'KSC GROUP', sector: 'Conseil', budget_range: 'Standard' },
  { value: 'morisol', label: 'MORISOL', sector: 'Technique', budget_range: 'Basique' },
  { value: 'sph', label: 'SPH', sector: 'Santé', budget_range: 'Standard' },
  { value: 'loretta', label: 'LORETTA', sector: 'Mode', budget_range: 'Basique' },
  { value: 'nelson_solar', label: 'NELSON SOLAR', sector: 'Énergie', budget_range: 'Standard' },
  { value: 'agence_zaca', label: 'AGENCE ZACA', sector: 'Immobilier', budget_range: 'Basique' },
  { value: 'aneree', label: 'ANEREE', sector: 'Public', budget_range: 'Standard' },
  { value: 'jofe_digital', label: 'JO\'FÉ DIGITAL', sector: 'Digital', budget_range: 'Standard' },
  { value: 'jpay', label: 'J\'PAY', sector: 'FinTech', budget_range: 'Standard' },
  { value: 'joffres', label: 'JOFFRES', sector: 'Commerce', budget_range: 'Basique' },
  { value: 'louda', label: 'LOUDA', sector: 'Commerce', budget_range: 'Basique' }
];

const projectTypes = [
  { value: 'campagne_360', label: 'Campagne 360°', icon: Target },
  { value: 'identite_visuelle', label: 'Identité Visuelle', icon: Palette },
  { value: 'digital_social', label: 'Digital & Réseaux Sociaux', icon: BookOpen },
  { value: 'production_video', label: 'Production Vidéo', icon: Video },
  { value: 'evenementiel', label: 'Événementiel', icon: Calendar },
  { value: 'print', label: 'Communication Print', icon: FileText },
  { value: 'site_web', label: 'Site Web', icon: Link },
  { value: 'autre', label: 'Autre', icon: Settings }
];

const taskCategories = [
  { value: 'strategie', label: 'Stratégie', color: 'bg-purple-100 text-purple-800' },
  { value: 'creation', label: 'Création', color: 'bg-blue-100 text-blue-800' },
  { value: 'production', label: 'Production', color: 'bg-green-100 text-green-800' },
  { value: 'digital', label: 'Digital', color: 'bg-orange-100 text-orange-800' },
  { value: 'tech', label: 'Technique', color: 'bg-gray-100 text-gray-800' },
  { value: 'contenu', label: 'Contenu', color: 'bg-yellow-100 text-yellow-800' }
];

export default function ProjectCreate() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isConnected } = useWebSocket();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [projectMilestones, setProjectMilestones] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [validationWorkflow, setValidationWorkflow] = useState({
    autoApproval: false,
    requireClientValidation: true,
    maxRevisions: 3,
    notificationSettings: {
      email: true,
      slack: false,
      dashboard: true
    }
  });
  
  const [projectData, setProjectData] = useState({
    name: '',
    client: '',
    budget: 0,
    startDate: '',
    endDate: '',
    type: '',
    description: '',
    priority: 'normale',
    projectManager: '',
    marginRate: 25,
    hourlyBudget: 0,
    tags: [] as string[],
    riskLevel: 'moyen'
  });

  // Auto-save brouillon toutes les 30 secondes
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (projectData.name || selectedMembers.length > 0 || projectTasks.length > 0) {
        handleSaveProject('auto');
      }
    }, 30000);

    return () => clearInterval(autoSave);
  }, [projectData, selectedMembers, projectTasks]);

  // Charger brouillon au démarrage
  useEffect(() => {
    const savedDraft = localStorage.getItem('jofe_project_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setProjectData(draft.projectData || {});
        setSelectedMembers(draft.selectedMembers || []);
        setProjectTasks(draft.projectTasks || []);
        setProjectMilestones(draft.projectMilestones || []);
        setCurrentStep(draft.currentStep || 1);
        setSelectedTemplate(draft.selectedTemplate || null);
        toast({
          title: 'Brouillon restauré',
          description: 'Votre dernier brouillon a été restauré',
        });
      } catch (error) {
        console.error('Erreur lors du chargement du brouillon:', error);
      }
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('CFA', 'FCFA');
  };

  // Données des 14 membres d'équipe réels avec taux horaires
  const teamMembers: { [key: string]: { name: string; role: string; rate: number; department: string; avatar: string; availability: number } } = {
    'serge-assale': { 
      name: 'Serge ASSALÉ', 
      role: 'Directeur Création', 
      rate: 15000, 
      department: 'Direction',
      avatar: '/avatars/serge.jpg',
      availability: 85
    },
    'enos-gouba': { 
      name: 'Enos GOUBA', 
      role: 'Directeur Artistique', 
      rate: 12000, 
      department: 'Création',
      avatar: '/avatars/enos.jpg',
      availability: 75
    },
    'armel-bationo': { 
      name: 'Armel BATIONO', 
      role: 'Motion Designer', 
      rate: 10000, 
      department: 'Production',
      avatar: '/avatars/armel.jpg',
      availability: 90
    },
    'issa-cisse': { 
      name: 'Issa CISSE', 
      role: 'Graphiste Senior', 
      rate: 8000, 
      department: 'Création',
      avatar: '/avatars/issa.jpg',
      availability: 95
    },
    'florita-kabore': { 
      name: 'Florita KABORÉ', 
      role: 'Resp. Médias Sociaux', 
      rate: 8500, 
      department: 'Digital',
      avatar: '/avatars/florita.jpg',
      availability: 80
    },
    'fatou-sankara': { 
      name: 'Fatou SANKARA', 
      role: 'Community Manager', 
      rate: 7000, 
      department: 'Digital',
      avatar: '/avatars/fatou.jpg',
      availability: 85
    },
    'ibrahim-traore': { 
      name: 'Ibrahim TRAORÉ', 
      role: 'Développeur Web', 
      rate: 9500, 
      department: 'Tech',
      avatar: '/avatars/ibrahim.jpg',
      availability: 70
    },
    'aminata-zongo': { 
      name: 'Aminata ZONGO', 
      role: 'Chef de Projet', 
      rate: 10500, 
      department: 'Gestion',
      avatar: '/avatars/aminata.jpg',
      availability: 60
    },
    'boureima-ouedraogo': { 
      name: 'Boureima OUÉDRAOGO', 
      role: 'Photographe', 
      rate: 8500, 
      department: 'Production',
      avatar: '/avatars/boureima.jpg',
      availability: 90
    },
    'mariam-kone': { 
      name: 'Mariam KONÉ', 
      role: 'Rédactrice', 
      rate: 7500, 
      department: 'Contenu',
      avatar: '/avatars/mariam.jpg',
      availability: 85
    },
    'abdoul-sawadogo': { 
      name: 'Abdoul SAWADOGO', 
      role: 'Monteur Vidéo', 
      rate: 8000, 
      department: 'Production',
      avatar: '/avatars/abdoul.jpg',
      availability: 95
    },
    'salimata-barry': { 
      name: 'Salimata BARRY', 
      role: 'Designer UX/UI', 
      rate: 9000, 
      department: 'Digital',
      avatar: '/avatars/salimata.jpg',
      availability: 75
    },
    'moussa-compaore': { 
      name: 'Moussa COMPAORÉ', 
      role: 'Commercial', 
      rate: 10000, 
      department: 'Commercial',
      avatar: '/avatars/moussa.jpg',
      availability: 80
    },
    'aissata-nacoulma': { 
      name: 'Aissata NACOULMA', 
      role: 'Assistante Direction', 
      rate: 6000, 
      department: 'Administration',
      avatar: '/avatars/aissata.jpg',
      availability: 100
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = projectTemplates[templateId as keyof typeof projectTemplates];
    if (template) {
      setProjectData(prev => ({
        ...prev,
        name: template.name + ' - ' + new Date().getFullYear(),
        type: template.type,
        budget: template.budget
      }));
      
      // Pré-sélectionner les membres d'équipe du template
      const templateMembers = template.tasks.map(task => task.member).filter((member, index, self) => self.indexOf(member) === index);
      setSelectedMembers(templateMembers);
      
      // Pré-remplir les tâches du template
      setProjectTasks(template.tasks.map((task, index) => ({
        id: index + 1,
        ...task
      })));

      // Pré-remplir les jalons
      setProjectMilestones(template.milestones.map((milestone, index) => ({
        id: index + 1,
        ...milestone
      })));
      
      toast({
        title: 'Template appliqué',
        description: `Template "${template.name}" appliqué avec succès`,
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setProjectData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTeamMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString()
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    toast({
      title: 'Fichiers ajoutés',
      description: `${files.length} fichier(s) ajouté(s) au projet`,
    });
  };

  const removeFile = (fileId: number) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!projectData.name || !projectData.client || !projectData.type) {
          toast({
            title: 'Champs obligatoires',
            description: 'Veuillez remplir tous les champs obligatoires',
            variant: 'destructive'
          });
          return false;
        }
        return true;
        
      case 2:
        if (selectedMembers.length === 0) {
          toast({
            title: 'Équipe requise',
            description: 'Veuillez sélectionner au moins un membre d\'équipe',
            variant: 'destructive'
          });
          return false;
        }
        return true;
        
      case 3:
        if (projectTasks.length === 0) {
          toast({
            title: 'Tâches requises',
            description: 'Veuillez ajouter au moins une tâche',
            variant: 'destructive'
          });
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleCreateProject();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveProject = (type: 'manual' | 'auto' = 'manual') => {
    const draftData = {
      projectData,
      selectedMembers,
      projectTasks,
      projectMilestones,
      uploadedFiles,
      validationWorkflow,
      selectedTemplate,
      currentStep
    };
    localStorage.setItem('jofe_project_draft', JSON.stringify(draftData));
    
    if (type === 'manual') {
      toast({
        title: 'Brouillon sauvegardé',
        description: 'Le projet a été sauvegardé en brouillon',
      });
    }
  };

  const handleCreateProject = () => {
    const finalProject = {
      ...projectData,
      team: selectedMembers,
      tasks: projectTasks,
      milestones: projectMilestones,
      files: uploadedFiles,
      validation: validationWorkflow,
      template: selectedTemplate,
      createdAt: new Date().toISOString()
    };
    
    console.log('Création du projet:', finalProject);
    
    toast({
      title: 'Projet créé avec succès!',
      description: `"${projectData.name}" a été créé et assigné à l'équipe`,
    });
    
    localStorage.removeItem('jofe_project_draft');
    setLocation('/projects');
  };

  const addNewTask = () => {
    const newTask = {
      id: projectTasks.length + 1,
      name: '',
      description: '',
      duration: 8,
      member: '',
      priority: 'normale',
      category: 'creation'
    };
    setProjectTasks(prev => [...prev, newTask]);
  };

  const updateTask = (taskId: number, field: string, value: any) => {
    setProjectTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, [field]: value } : task
    ));
  };

  const removeTask = (taskId: number) => {
    setProjectTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const addNewMilestone = () => {
    const newMilestone = {
      id: projectMilestones.length + 1,
      name: '',
      date: 7,
      deliverable: ''
    };
    setProjectMilestones(prev => [...prev, newMilestone]);
  };

  const updateMilestone = (milestoneId: number, field: string, value: any) => {
    setProjectMilestones(prev => prev.map(milestone => 
      milestone.id === milestoneId ? { ...milestone, [field]: value } : milestone
    ));
  };

  const removeMilestone = (milestoneId: number) => {
    setProjectMilestones(prev => prev.filter(milestone => milestone.id !== milestoneId));
  };

  const calculateTeamCosts = () => {
    const totalHourly = selectedMembers.reduce((sum, memberId) => {
      return sum + (teamMembers[memberId]?.rate || 0);
    }, 0);
    
    const totalProjectCost = projectTasks.reduce((sum, task) => {
      const memberRate = teamMembers[task.member]?.rate || 0;
      return sum + (memberRate * task.duration);
    }, 0);
    
    const margin = (projectData.budget - totalProjectCost) * (projectData.marginRate / 100);
    const marginRate = projectData.budget > 0 ? ((projectData.budget - totalProjectCost) / projectData.budget) * 100 : 0;
    
    return { 
      totalHourly, 
      totalProjectCost, 
      margin, 
      marginRate,
      profitability: marginRate > 20 ? 'Excellent' : marginRate > 10 ? 'Bon' : 'Faible'
    };
  };

  const { totalHourly, totalProjectCost, margin, marginRate, profitability } = calculateTeamCosts();
  const selectedTemplateData = selectedTemplate ? projectTemplates[selectedTemplate as keyof typeof projectTemplates] : null;
  const progressPercentage = (currentStep / 4) * 100;

  const steps = [
    { id: 1, name: 'Informations', description: 'Détails du projet', icon: FileText },
    { id: 2, name: 'Équipe', description: 'Attribution membres', icon: Users },
    { id: 3, name: 'Budget & Planning', description: 'Planification détaillée', icon: BarChart3 },
    { id: 4, name: 'Configuration Avancée', description: 'Finalisation', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[var(--jofe-white)]">
      <TopNavBar />
      <div className="lg:ml-72">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#162C54] jofe-font">
                Création de Projet Avancée
              </h1>
              <p className="text-sm text-[#162C54]/70">
                Système de création guidée avec templates intelligents • WebSocket {isConnected ? '🟢' : '🔴'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => handleSaveProject('manual')}
                variant="outline"
                className="border-[#162C54]/20 text-[#162C54]"
                data-testid="button-save-draft"
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
              
              <Button
                variant="outline"
                className="border-[#162C54]/20 text-[#162C54]"
                data-testid="button-preview"
              >
                <Eye className="w-4 h-4 mr-2" />
                Aperçu
              </Button>

              <Button
                onClick={() => setLocation('/projects')}
                variant="outline"
                className="border-[#162C54]/20 text-[#162C54]"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </div>
          </div>
        </header>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                <div key={step.id} className="flex items-center">
                  <div 
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                      currentStep === step.id 
                        ? 'border-[#162C54] bg-[#162C54]/5' 
                        : currentStep > step.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 bg-white'
                    }`}
                    onClick={() => setCurrentStep(step.id)}
                    data-testid={`step-${step.id}`}
                  >
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white ${
                        currentStep === step.id 
                          ? 'bg-[#162C54]' 
                          : currentStep > step.id
                          ? 'bg-green-500'
                          : 'bg-gray-400'
                      }`}
                    >
                      {currentStep > step.id ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-semibold text-[#162C54]">{step.name}</p>
                      <p className="text-sm text-[#162C54]/60">{step.description}</p>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 bg-gray-300 mx-2">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        style={{ width: currentStep > step.id ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </div>
              )})}
            </div>
            
            <div className="text-sm text-[#162C54]/70 bg-white px-3 py-1 rounded-full border">
              Étape {currentStep} sur 4
            </div>
          </div>
          
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-3 bg-gray-200" />
          </div>
        </div>

        {/* Content */}
        <main className="p-6">
          {/* Step 1: Project Information */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Template Selection */}
                <Card className="p-6 border-[#162C54]/10">
                  <h3 className="text-lg font-semibold mb-4 text-[#162C54] flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Templates Intelligents
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.values(projectTemplates).map((template) => {
                      const Icon = template.icon;
                      return (
                        <Card
                          key={template.id}
                          className={`p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                            selectedTemplate === template.id
                              ? 'border-[#162C54] bg-[#162C54]/5 shadow-lg'
                              : 'border-gray-200 hover:border-[#162C54]/50'
                          }`}
                          onClick={() => handleTemplateSelect(template.id)}
                          data-testid={`template-${template.id}`}
                        >
                          <div className="w-12 h-12 rounded-lg mb-3 flex items-center justify-center bg-[#162C54]/10">
                            <Icon className="w-6 h-6 text-[#162C54]" />
                          </div>
                          <h4 className="font-semibold mb-2 text-[#162C54]">{template.name}</h4>
                          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                          <div className="text-xs text-[#162C54]/70 mb-2">
                            {template.details}
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge variant="secondary" className="text-xs">
                              {template.duration}
                            </Badge>
                            <span className="text-xs font-semibold text-[#162C54]">
                              {formatCurrency(template.budget)}
                            </span>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    className="mt-4 w-full border-dashed border-[#162C54]/50 text-[#162C54] hover:bg-[#162C54]/5"
                    onClick={() => {
                      setSelectedTemplate(null);
                      setSelectedMembers([]);
                      setProjectTasks([]);
                      setProjectMilestones([]);
                      toast({ title: 'Mode personnalisé', description: 'Projet personnalisé activé' });
                    }}
                    data-testid="button-custom"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un Projet Personnalisé
                  </Button>
                </Card>

                {/* Project Information */}
                <Card className="p-6 border-[#162C54]/10">
                  <h3 className="text-lg font-semibold mb-4 text-[#162C54] flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Informations du Projet
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#162C54]">
                        Nom du Projet *
                      </label>
                      <Input
                        type="text"
                        placeholder="Ex: Campagne Q1 2025 MOOV AFRICA"
                        value={projectData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="border-[#162C54]/20 focus:border-[#162C54]"
                        data-testid="input-project-name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#162C54]">
                        Client *
                      </label>
                      <select
                        className="w-full border-2 border-[#162C54]/20 rounded-md px-3 py-2 focus:outline-none focus:border-[#162C54] bg-white"
                        value={projectData.client}
                        onChange={(e) => handleInputChange('client', e.target.value)}
                        data-testid="select-client"
                      >
                        <option value="">Sélectionner un client</option>
                        {clients.map(client => (
                          <option key={client.value} value={client.value}>
                            {client.label} • {client.sector} • {client.budget_range}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#162C54]">
                        Budget Total (FCFA) *
                      </label>
                      <Input
                        type="number"
                        placeholder="2500000"
                        value={projectData.budget}
                        onChange={(e) => handleInputChange('budget', parseInt(e.target.value) || 0)}
                        className="border-[#162C54]/20 focus:border-[#162C54]"
                        data-testid="input-budget"
                      />
                      {projectData.budget > 0 && (
                        <p className="text-sm text-[#162C54]/70 mt-1">
                          {formatCurrency(projectData.budget)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#162C54]">
                        Type de Projet *
                      </label>
                      <select
                        className="w-full border-2 border-[#162C54]/20 rounded-md px-3 py-2 focus:outline-none focus:border-[#162C54] bg-white"
                        value={projectData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        data-testid="select-project-type"
                      >
                        <option value="">Sélectionner le type</option>
                        {projectTypes.map(type => {
                          const Icon = type.icon;
                          return (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#162C54]">
                        Date de début
                      </label>
                      <Input
                        type="date"
                        value={projectData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        className="border-[#162C54]/20 focus:border-[#162C54]"
                        data-testid="input-start-date"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#162C54]">
                        Date de fin
                      </label>
                      <Input
                        type="date"
                        value={projectData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        className="border-[#162C54]/20 focus:border-[#162C54]"
                        data-testid="input-end-date"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#162C54]">
                        Chef de Projet
                      </label>
                      <select
                        className="w-full border-2 border-[#162C54]/20 rounded-md px-3 py-2 focus:outline-none focus:border-[#162C54] bg-white"
                        value={projectData.projectManager}
                        onChange={(e) => handleInputChange('projectManager', e.target.value)}
                        data-testid="select-project-manager"
                      >
                        <option value="">Assigner un chef de projet</option>
                        {Object.entries(teamMembers).map(([id, member]) => (
                          <option key={id} value={id}>
                            {member.name} - {member.role}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#162C54]">
                        Priorité
                      </label>
                      <select
                        className="w-full border-2 border-[#162C54]/20 rounded-md px-3 py-2 focus:outline-none focus:border-[#162C54] bg-white"
                        value={projectData.priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        data-testid="select-priority"
                      >
                        <option value="basse">🔵 Basse</option>
                        <option value="normale">🟡 Normale</option>
                        <option value="haute">🔴 Haute</option>
                        <option value="critique">⚡ Critique</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2 text-[#162C54]">
                        Description du projet
                      </label>
                      <Textarea
                        placeholder="Décrivez les objectifs et spécificités du projet..."
                        value={projectData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="border-[#162C54]/20 focus:border-[#162C54] min-h-[100px]"
                        data-testid="textarea-description"
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Template Preview */}
                {selectedTemplateData && (
                  <Card className="p-4 border-[#162C54]/10">
                    <h4 className="font-semibold mb-3 text-[#162C54] flex items-center">
                      <Star className="w-4 h-4 mr-2" />
                      Template Sélectionné
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-[#162C54]">{selectedTemplateData.name}</p>
                        <p className="text-sm text-gray-600">{selectedTemplateData.description}</p>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Durée:</span>
                        <span className="font-medium">{selectedTemplateData.duration}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tâches:</span>
                        <span className="font-medium">{selectedTemplateData.tasks.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Budget:</span>
                        <span className="font-medium text-[#162C54]">{formatCurrency(selectedTemplateData.budget)}</span>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Quick Stats */}
                <Card className="p-4 border-[#162C54]/10">
                  <h4 className="font-semibold mb-3 text-[#162C54] flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Statistiques Rapides
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Projets en cours:</span>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Charge équipe:</span>
                      <span className="font-medium">75%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>CA mois:</span>
                      <span className="font-medium text-green-600">{formatCurrency(8500000)}</span>
                    </div>
                  </div>
                </Card>

                {/* Help */}
                <Card className="p-4 border-[#162C54]/10 bg-blue-50">
                  <h4 className="font-semibold mb-2 text-[#162C54]">💡 Conseils</h4>
                  <ul className="text-sm text-[#162C54]/80 space-y-1">
                    <li>• Utilisez les templates pour gagner du temps</li>
                    <li>• Définissez un budget réaliste</li>
                    <li>• Choisissez le bon chef de projet</li>
                    <li>• Auto-sauvegarde toutes les 30s</li>
                  </ul>
                </Card>
              </div>
            </div>
          )}

          {/* Step 2: Team Selection */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
              <div className="lg:col-span-2">
                <Card className="p-6 border-[#162C54]/10">
                  <h3 className="text-lg font-semibold mb-4 text-[#162C54] flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Sélection de l'Équipe ({selectedMembers.length}/14)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(teamMembers).map(([id, member]) => (
                      <Card
                        key={id}
                        className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                          selectedMembers.includes(id)
                            ? 'border-[#162C54] bg-[#162C54]/5'
                            : 'border-gray-200 hover:border-[#162C54]/50'
                        }`}
                        onClick={() => handleTeamMemberToggle(id)}
                        data-testid={`member-${id}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-[#162C54]/10 flex items-center justify-center">
                            <User className="w-6 h-6 text-[#162C54]" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-[#162C54]">{member.name}</p>
                            <p className="text-sm text-gray-600">{member.role}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-[#162C54]/70">{member.department}</span>
                              <span className="text-xs font-semibold text-[#162C54]">
                                {formatCurrency(member.rate)}/h
                              </span>
                            </div>
                            <div className="mt-1">
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full ${
                                    member.availability >= 80 ? 'bg-green-500' : 
                                    member.availability >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${member.availability}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">
                                Disponibilité: {member.availability}%
                              </span>
                            </div>
                          </div>
                          {selectedMembers.includes(id) && (
                            <CheckCircle className="w-5 h-5 text-[#162C54]" />
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Team Summary */}
                <Card className="p-4 border-[#162C54]/10">
                  <h4 className="font-semibold mb-3 text-[#162C54] flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Résumé Équipe
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Membres sélectionnés:</span>
                      <span className="font-medium">{selectedMembers.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Coût total/heure:</span>
                      <span className="font-medium">{formatCurrency(totalHourly)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Coût projet estimé:</span>
                      <span className="font-medium text-[#162C54]">{formatCurrency(totalProjectCost)}</span>
                    </div>
                  </div>
                </Card>

                {/* Selected Team */}
                <Card className="p-4 border-[#162C54]/10">
                  <h4 className="font-semibold mb-3 text-[#162C54]">Équipe Sélectionnée</h4>
                  <div className="space-y-2">
                    {selectedMembers.map(memberId => {
                      const member = teamMembers[memberId];
                      return (
                        <div key={memberId} className="flex items-center justify-between text-sm">
                          <span>{member.name}</span>
                          <span className="text-[#162C54] font-medium">{formatCurrency(member.rate)}/h</span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Step 3: Budget & Planning */}
          {currentStep === 3 && (
            <div className="space-y-6 fade-in">
              {/* Tasks Management */}
              <Card className="p-6 border-[#162C54]/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#162C54] flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Gestion des Tâches ({projectTasks.length})
                  </h3>
                  <Button
                    onClick={addNewTask}
                    className="bg-[#162C54] hover:bg-[#162C54]/90"
                    data-testid="button-add-task"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter Tâche
                  </Button>
                </div>

                <div className="space-y-4">
                  {projectTasks.map((task, index) => (
                    <Card key={task.id} className="p-4 border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                        <div className="md:col-span-2">
                          <Input
                            placeholder="Nom de la tâche"
                            value={task.name}
                            onChange={(e) => updateTask(task.id, 'name', e.target.value)}
                            className="border-[#162C54]/20"
                            data-testid={`task-name-${task.id}`}
                          />
                        </div>
                        
                        <div>
                          <select
                            className="w-full border-2 border-[#162C54]/20 rounded-md px-3 py-2 text-sm"
                            value={task.member}
                            onChange={(e) => updateTask(task.id, 'member', e.target.value)}
                            data-testid={`task-member-${task.id}`}
                          >
                            <option value="">Assigner à</option>
                            {selectedMembers.map(memberId => (
                              <option key={memberId} value={memberId}>
                                {teamMembers[memberId].name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Input
                            type="number"
                            placeholder="Heures"
                            value={task.duration}
                            onChange={(e) => updateTask(task.id, 'duration', parseInt(e.target.value) || 0)}
                            className="border-[#162C54]/20 text-sm"
                            data-testid={`task-duration-${task.id}`}
                          />
                        </div>

                        <div>
                          <select
                            className="w-full border-2 border-[#162C54]/20 rounded-md px-3 py-2 text-sm"
                            value={task.category}
                            onChange={(e) => updateTask(task.id, 'category', e.target.value)}
                            data-testid={`task-category-${task.id}`}
                          >
                            {taskCategories.map(category => (
                              <option key={category.value} value={category.value}>
                                {category.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-[#162C54]">
                            {task.member && task.duration ? formatCurrency((teamMembers[task.member]?.rate || 0) * task.duration) : '-'}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTask(task.id)}
                            className="text-red-500 hover:bg-red-50"
                            data-testid={`task-remove-${task.id}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              {/* Milestones */}
              <Card className="p-6 border-[#162C54]/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#162C54] flex items-center">
                    <CalendarIcon className="w-5 h-5 mr-2" />
                    Jalons du Projet ({projectMilestones.length})
                  </h3>
                  <Button
                    onClick={addNewMilestone}
                    variant="outline"
                    className="border-[#162C54]/20 text-[#162C54]"
                    data-testid="button-add-milestone"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter Jalon
                  </Button>
                </div>

                <div className="space-y-4">
                  {projectMilestones.map((milestone) => (
                    <Card key={milestone.id} className="p-4 border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div>
                          <Input
                            placeholder="Nom du jalon"
                            value={milestone.name}
                            onChange={(e) => updateMilestone(milestone.id, 'name', e.target.value)}
                            className="border-[#162C54]/20"
                            data-testid={`milestone-name-${milestone.id}`}
                          />
                        </div>
                        
                        <div>
                          <Input
                            type="number"
                            placeholder="Jour J+X"
                            value={milestone.date}
                            onChange={(e) => updateMilestone(milestone.id, 'date', parseInt(e.target.value) || 0)}
                            className="border-[#162C54]/20"
                            data-testid={`milestone-date-${milestone.id}`}
                          />
                        </div>

                        <div>
                          <Input
                            placeholder="Livrable"
                            value={milestone.deliverable}
                            onChange={(e) => updateMilestone(milestone.id, 'deliverable', e.target.value)}
                            className="border-[#162C54]/20"
                            data-testid={`milestone-deliverable-${milestone.id}`}
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMilestone(milestone.id)}
                            className="text-red-500 hover:bg-red-50"
                            data-testid={`milestone-remove-${milestone.id}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              {/* Budget Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-[#162C54]/10">
                  <h4 className="font-semibold mb-3 text-[#162C54]">💰 Budget Projet</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Budget alloué:</span>
                      <span className="font-medium">{formatCurrency(projectData.budget)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Coût équipe:</span>
                      <span className="font-medium">{formatCurrency(totalProjectCost)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium">Marge:</span>
                      <span className={`font-bold ${marginRate > 20 ? 'text-green-600' : marginRate > 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {marginRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-[#162C54]/10">
                  <h4 className="font-semibold mb-3 text-[#162C54]">📊 Rentabilité</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge variant={marginRate > 20 ? 'default' : marginRate > 10 ? 'secondary' : 'destructive'}>
                        {profitability}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Bénéfice estimé:</span>
                      <span className="font-medium text-green-600">{formatCurrency(margin)}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-[#162C54]/10">
                  <h4 className="font-semibold mb-3 text-[#162C54]">⏱️ Planning</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total heures:</span>
                      <span className="font-medium">{projectTasks.reduce((sum, task) => sum + task.duration, 0)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Jalons définis:</span>
                      <span className="font-medium">{projectMilestones.length}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Step 4: Advanced Configuration */}
          {currentStep === 4 && (
            <div className="space-y-6 fade-in">
              {/* File Upload */}
              <Card className="p-6 border-[#162C54]/10">
                <h3 className="text-lg font-semibold mb-4 text-[#162C54] flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Documents & Fichiers
                </h3>

                <div 
                  className="border-2 border-dashed border-[#162C54]/30 rounded-lg p-8 text-center hover:border-[#162C54]/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-[#162C54]/50 mx-auto mb-4" />
                  <p className="text-[#162C54]/70 mb-2">Cliquez pour ajouter des fichiers ou glissez-déposez</p>
                  <p className="text-sm text-[#162C54]/50">PDF, DOC, XLS, Images - Max 10MB par fichier</p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                />

                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-[#162C54]">Fichiers ajoutés ({uploadedFiles.length})</h4>
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Folder className="w-5 h-5 text-[#162C54]" />
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Validation Workflow */}
              <Card className="p-6 border-[#162C54]/10">
                <h3 className="text-lg font-semibold mb-4 text-[#162C54] flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Workflow de Validation
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={validationWorkflow.requireClientValidation}
                          onChange={(e) => setValidationWorkflow(prev => ({
                            ...prev,
                            requireClientValidation: e.target.checked
                          }))}
                          className="rounded border-[#162C54]/20"
                        />
                        <span className="text-sm text-[#162C54]">Validation client obligatoire</span>
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={validationWorkflow.autoApproval}
                          onChange={(e) => setValidationWorkflow(prev => ({
                            ...prev,
                            autoApproval: e.target.checked
                          }))}
                          className="rounded border-[#162C54]/20"
                        />
                        <span className="text-sm text-[#162C54]">Auto-approbation interne</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#162C54]">
                        Nombre max de révisions
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={validationWorkflow.maxRevisions}
                        onChange={(e) => setValidationWorkflow(prev => ({
                          ...prev,
                          maxRevisions: parseInt(e.target.value) || 3
                        }))}
                        className="border-[#162C54]/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-[#162C54]">Notifications</h4>
                    
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={validationWorkflow.notificationSettings.email}
                          onChange={(e) => setValidationWorkflow(prev => ({
                            ...prev,
                            notificationSettings: {
                              ...prev.notificationSettings,
                              email: e.target.checked
                            }
                          }))}
                          className="rounded border-[#162C54]/20"
                        />
                        <span className="text-sm text-[#162C54]">Notifications email</span>
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={validationWorkflow.notificationSettings.dashboard}
                          onChange={(e) => setValidationWorkflow(prev => ({
                            ...prev,
                            notificationSettings: {
                              ...prev.notificationSettings,
                              dashboard: e.target.checked
                            }
                          }))}
                          className="rounded border-[#162C54]/20"
                        />
                        <span className="text-sm text-[#162C54]">Notifications dashboard</span>
                      </label>
                    </div>

                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={validationWorkflow.notificationSettings.slack}
                          onChange={(e) => setValidationWorkflow(prev => ({
                            ...prev,
                            notificationSettings: {
                              ...prev.notificationSettings,
                              slack: e.target.checked
                            }
                          }))}
                          className="rounded border-[#162C54]/20"
                        />
                        <span className="text-sm text-[#162C54]">Notifications Slack</span>
                      </label>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Final Summary */}
              <Card className="p-6 border-[#162C54]/10 bg-gradient-to-br from-blue-50 to-indigo-50">
                <h3 className="text-lg font-semibold mb-4 text-[#162C54] flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Résumé Final du Projet
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-[#162C54] mb-2">🎯 Projet</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Nom:</strong> {projectData.name}</p>
                      <p><strong>Client:</strong> {clients.find(c => c.value === projectData.client)?.label || 'Non défini'}</p>
                      <p><strong>Type:</strong> {projectTypes.find(t => t.value === projectData.type)?.label || 'Non défini'}</p>
                      <p><strong>Budget:</strong> {formatCurrency(projectData.budget)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-[#162C54] mb-2">👥 Équipe</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Membres:</strong> {selectedMembers.length}</p>
                      <p><strong>Coût/h:</strong> {formatCurrency(totalHourly)}</p>
                      <p><strong>Total estimé:</strong> {formatCurrency(totalProjectCost)}</p>
                      <p><strong>Marge:</strong> <span className={marginRate > 20 ? 'text-green-600' : marginRate > 10 ? 'text-yellow-600' : 'text-red-600'}>{marginRate.toFixed(1)}%</span></p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-[#162C54] mb-2">📋 Planning</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Tâches:</strong> {projectTasks.length}</p>
                      <p><strong>Jalons:</strong> {projectMilestones.length}</p>
                      <p><strong>Fichiers:</strong> {uploadedFiles.length}</p>
                      <p><strong>Template:</strong> {selectedTemplateData?.name || 'Personnalisé'}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <Button
              onClick={prevStep}
              variant="outline"
              disabled={currentStep === 1}
              className="border-[#162C54]/20 text-[#162C54]"
              data-testid="button-prev"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => handleSaveProject('manual')}
                variant="outline"
                className="border-[#162C54]/20 text-[#162C54]"
                data-testid="button-save"
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>

              <Button
                onClick={nextStep}
                className="bg-[#162C54] hover:bg-[#162C54]/90"
                data-testid="button-next"
              >
                {currentStep === 4 ? (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Créer le Projet
                  </>
                ) : (
                  <>
                    Suivant
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}