import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Calendar, CalendarDays, Users, Video, Palette, BookOpen, Plus, Target, Save, Send, TrendingUp, Clock, DollarSign, User, Check, ArrowLeft, CalendarIcon, ChevronRight, Eye, Star, CheckCircle, FileText, Link, AlertCircle, X } from 'lucide-react';
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
    tasks: [
      { name: 'Brief et stratégie', duration: 8, member: 'serge-assale', priority: 'haute' },
      { name: 'Création concepts visuels', duration: 16, member: 'enos-gouba', priority: 'haute' },
      { name: 'Photomontage publicitaire', duration: 12, member: 'armel-bationo', priority: 'normale' },
      { name: 'Motion Design', duration: 20, member: 'armel-bationo', priority: 'normale' },
      { name: 'Community Management', duration: 40, member: 'florita-kabore', priority: 'normale' }
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
    tasks: [
      { name: 'Audit visuel existant', duration: 6, member: 'serge-assale', priority: 'haute' },
      { name: 'Recherche et concepts', duration: 12, member: 'enos-gouba', priority: 'haute' },
      { name: 'Création logo', duration: 16, member: 'armel-bationo', priority: 'haute' },
      { name: 'Charte graphique', duration: 20, member: 'enos-gouba', priority: 'normale' },
      { name: 'Déclinaisons supports', duration: 24, member: 'issa-cisse', priority: 'normale' }
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
    tasks: [
      { name: 'Audit digital', duration: 8, member: 'serge-assale', priority: 'haute' },
      { name: 'Stratégie contenus', duration: 12, member: 'florita-kabore', priority: 'haute' },
      { name: 'Création visuels', duration: 32, member: 'issa-cisse', priority: 'normale' },
      { name: 'Community Management', duration: 40, member: 'florita-kabore', priority: 'normale' },
      { name: 'Analytics et reporting', duration: 8, member: 'serge-assale', priority: 'normale' }
    ]
  }
};

// Liste des 33 clients réels de Jo'Fé Digital
const clients = [
  { value: 'moov_africa', label: 'MOOV AFRICA' },
  { value: 'bank_of_africa', label: 'BANK OF AFRICA' },
  { value: 'sunu_burkina', label: 'SUNU BURKINA' },
  { value: 'roxgold', label: 'ROXGOLD' },
  { value: 'vincent_associes', label: 'VINCENT & ASSOCIES' },
  { value: 'pnud_bf', label: 'PNUD BF' },
  { value: 'anssi', label: 'ANSSI' },
  { value: 'babali_eau', label: 'BABALI EAU' },
  { value: 'dafani', label: 'DAFANI' },
  { value: 'babali_boissons', label: 'BABALI BOISSONS' },
  { value: 'laafi_nanda', label: 'LAAFI NANDA' },
  { value: 'africa_performance', label: 'AFRICA PERFORMANCE GROUPE' },
  { value: 'le_trapeze', label: 'BAR-RESTAU LE TRAPEZE' },
  { value: 'uab_assurances', label: 'UAB ASSURANCES' },
  { value: 'cnpb', label: 'CNPB' },
  { value: 'fidelis_finance', label: 'FIDELIS FINANCE BURKINA' },
  { value: 'sunu_mali', label: 'SUNU ASSURANCES IARD MALI' },
  { value: 'sonar_groupe', label: 'SONAR GROUPE' },
  { value: 'oryx_burkina', label: 'ORYX BURKINA' },
  { value: 'badf', label: 'BADF' },
  { value: 'forever', label: 'FOREVER' },
  { value: 'froid_solutions', label: 'FROID SOLUTIONS' },
  { value: 'ksc_group', label: 'KSC GROUP' },
  { value: 'morisol', label: 'MORISOL' },
  { value: 'sph', label: 'SPH' },
  { value: 'loretta', label: 'LORETTA' },
  { value: 'nelson_solar', label: 'NELSON SOLAR' },
  { value: 'agence_zaca', label: 'AGENCE ZACA' },
  { value: 'aneree', label: 'ANEREE' },
  { value: 'jofe_digital', label: 'JO\'FÉ DIGITAL' },
  { value: 'jpay', label: 'J\'PAY' },
  { value: 'joffres', label: 'JOFFRES' },
  { value: 'louda', label: 'LOUDA' }
];

const projectTypes = [
  { value: 'campagne_360', label: 'Campagne 360°' },
  { value: 'identite_visuelle', label: 'Identité Visuelle' },
  { value: 'digital_social', label: 'Digital & Réseaux Sociaux' },
  { value: 'production_video', label: 'Production Vidéo' },
  { value: 'evenementiel', label: 'Événementiel' },
  { value: 'print', label: 'Communication Print' },
  { value: 'site_web', label: 'Site Web' },
  { value: 'autre', label: 'Autre' }
];

export default function ProjectCreate() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [projectData, setProjectData] = useState({
    name: '',
    client: '',
    budget: 0,
    startDate: '',
    endDate: '',
    type: '',
    description: '',
    priority: 'normale',
    projectManager: ''
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('CFA', 'FCFA');
  };

  // Données des membres d'équipe avec taux horaires
  const teamMembers: { [key: string]: { name: string; role: string; rate: number; department: string } } = {
    'serge-assale': { name: 'Serge ASSALÉ', role: 'Directeur Création', rate: 12000, department: 'Direction' },
    'enos-gouba': { name: 'Enos GOUBA', role: 'Directeur Artistique', rate: 10000, department: 'Création' },
    'armel-bationo': { name: 'Armel BATIONO', role: 'Motion Designer', rate: 9000, department: 'Production' },
    'issa-cisse': { name: 'Issa CISSE', role: 'Graphiste Junior', rate: 6000, department: 'Création' },
    'florita-kabore': { name: 'Florita KABORÉ', role: 'Resp. Médias Sociaux', rate: 7500, department: 'Digital' },
    'fatou-sankara': { name: 'Fatou SANKARA', role: 'Community Manager', rate: 6500, department: 'Digital' },
    'ibrahim-traore': { name: 'Ibrahim TRAORÉ', role: 'Développeur Web', rate: 8500, department: 'Tech' },
    'aminata-zongo': { name: 'Aminata ZONGO', role: 'Chef de Projet', rate: 9500, department: 'Gestion' },
    'boureima-ouedraogo': { name: 'Boureima OUÉDRAOGO', role: 'Photographe', rate: 8000, department: 'Production' },
    'mariam-kone': { name: 'Mariam KONÉ', role: 'Rédactrice', rate: 7000, department: 'Contenu' },
    'abdoul-sawadogo': { name: 'Abdoul SAWADOGO', role: 'Monteur Vidéo', rate: 7500, department: 'Production' },
    'salimata-barry': { name: 'Salimata BARRY', role: 'Designer UX/UI', rate: 8500, department: 'Digital' },
    'moussa-compaore': { name: 'Moussa COMPAORÉ', role: 'Commercial', rate: 9000, department: 'Commercial' },
    'aissata-nacoulma': { name: 'Aissata NACOULMA', role: 'Assistante Direction', rate: 5500, department: 'Administration' }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = projectTemplates[templateId as keyof typeof projectTemplates];
    if (template) {
      setProjectData(prev => ({
        ...prev,
        name: template.name + ' - ' + new Date().getFullYear(),
        type: template.type
      }));
      
      // Pré-sélectionner les membres d'équipe du template
      const templateMembers = template.tasks.map(task => task.member).filter((member, index, self) => self.indexOf(member) === index);
      setSelectedMembers(templateMembers);
      
      // Pré-remplir les tâches du template
      setProjectTasks(template.tasks.map((task, index) => ({
        id: index + 1,
        ...task
      })));
      
      toast({
        title: 'Template appliqué',
        description: 'Template appliqué avec succès',
      });
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
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

  const handleSaveProject = () => {
    const draftData = {
      ...projectData,
      selectedMembers,
      projectTasks,
      currentStep
    };
    localStorage.setItem('jofe_project_draft', JSON.stringify(draftData));
    toast({
      title: 'Brouillon sauvegardé',
      description: 'Le projet a été sauvegardé en brouillon',
    });
  };

  const handleCreateProject = () => {
    const finalProject = {
      ...projectData,
      team: selectedMembers,
      tasks: projectTasks
    };
    console.log('Création du projet:', finalProject);
    toast({
      title: 'Projet créé',
      description: 'Projet créé avec succès!',
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
      priority: 'normale'
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

  const calculateTeamCosts = () => {
    const totalHourly = selectedMembers.reduce((sum, memberId) => {
      return sum + (teamMembers[memberId]?.rate || 0);
    }, 0);
    const totalProjectCost = projectTasks.reduce((sum, task) => {
      const memberRate = teamMembers[task.member]?.rate || 0;
      return sum + (memberRate * task.duration);
    }, 0);
    return { totalHourly, totalProjectCost };
  };

  const { totalHourly, totalProjectCost } = calculateTeamCosts();
  const selectedTemplateData = selectedTemplate ? projectTemplates[selectedTemplate as keyof typeof projectTemplates] : null;
  const progressPercentage = (currentStep / 4) * 100;

  const steps = [
    { id: 1, name: 'Informations', description: 'Détails du projet' },
    { id: 2, name: 'Équipe', description: 'Attribution membres' },
    { id: 3, name: 'Tâches', description: 'Planning détaillé' },
    { id: 4, name: 'Validation', description: 'Finalisation' }
  ];

  return (
    <div className="min-h-screen bg-[var(--jofe-white)]">
      <TopNavBar />
      <div className="lg:ml-72">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--jofe-blue-deep)] jofe-font">
                Création de Projet
              </h1>
              <p className="text-sm text-[var(--jofe-blue-medium)]">
                Configurer un nouveau projet ou modifier un projet existant
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSaveProject}
                variant="outline"
                className="border-[var(--jofe-gray)] text-[var(--jofe-blue-medium)]"
                data-testid="button-save-draft"
              >
                <Save className="w-4 h-4 mr-2" />
                Brouillon
              </Button>
              
              <Button
                variant="outline"
                className="border-[var(--jofe-gray)] text-[var(--jofe-blue-medium)]"
                data-testid="button-preview"
              >
                <Eye className="w-4 h-4 mr-2" />
                Aperçu
              </Button>
            </div>
          </div>
        </header>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div 
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      currentStep === step.id 
                        ? 'border-[var(--jofe-blue-light)] bg-blue-50' 
                        : currentStep > step.id
                        ? 'border-[var(--jofe-green)] bg-green-50'
                        : 'border-[var(--jofe-gray)] bg-white'
                    }`}
                    onClick={() => setCurrentStep(step.id)}
                    data-testid={`step-${step.id}`}
                  >
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white ${
                        currentStep === step.id 
                          ? 'bg-[var(--jofe-blue-light)]' 
                          : currentStep > step.id
                          ? 'bg-[var(--jofe-green)]'
                          : 'bg-[var(--jofe-gray)]'
                      }`}
                    >
                      {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[var(--jofe-blue-deep)]">{step.name}</p>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </React.Fragment>
              ))}
            </div>
            
            <div className="text-sm text-[var(--jofe-blue-medium)]">
              Étape {currentStep} sur 4
            </div>
          </div>
          
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2" />
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
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-[var(--jofe-blue-deep)] flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Templates de Projet
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.values(projectTemplates).map((template) => {
                      const Icon = template.icon;
                      return (
                        <Card
                          key={template.id}
                          className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                            selectedTemplate === template.id
                              ? 'border-[var(--jofe-blue-light)] bg-blue-50'
                              : 'border-[var(--jofe-gray)] hover:border-[var(--jofe-blue-light)]'
                          }`}
                          onClick={() => handleTemplateSelect(template.id)}
                          data-testid={`template-${template.id}`}
                        >
                          <div className="w-12 h-12 rounded-lg mb-3 flex items-center justify-center bg-blue-100">
                            <Icon className="w-6 h-6 text-[var(--jofe-blue-light)]" />
                          </div>
                          <h4 className="font-semibold mb-2 text-[var(--jofe-blue-deep)]">{template.name}</h4>
                          <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                          <div className="text-xs text-[var(--jofe-blue-medium)]">
                            {template.details}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    className="mt-4 w-full border-dashed border-[var(--jofe-blue-medium)] text-[var(--jofe-blue-medium)]"
                    onClick={() => {
                      setSelectedTemplate(null);
                      setSelectedMembers([]);
                      setProjectTasks([]);
                      toast({ title: 'Mode personnalisé', description: 'Projet personnalisé activé' });
                    }}
                    data-testid="button-custom"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Projet Personnalisé
                  </Button>
                </Card>

                {/* Project Information */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-[var(--jofe-blue-deep)]">
                    Informations du Projet
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[var(--jofe-blue-deep)]">
                        Nom du Projet *
                      </label>
                      <Input
                        type="text"
                        placeholder="Ex: Campagne Q1 2025 MOOV AFRICA"
                        value={projectData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="border-[var(--jofe-gray)] focus:border-[var(--jofe-blue-medium)]"
                        data-testid="input-project-name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-[var(--jofe-blue-deep)]">
                        Client *
                      </label>
                      <select
                        className="w-full border-2 border-[var(--jofe-gray)] rounded-md px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-medium)] bg-white"
                        value={projectData.client}
                        onChange={(e) => handleInputChange('client', e.target.value)}
                        data-testid="select-client"
                      >
                        <option value="">Sélectionner un client</option>
                        {clients.map(client => (
                          <option key={client.value} value={client.value}>{client.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-[var(--jofe-blue-deep)]">
                        Budget Total (FCFA) *
                      </label>
                      <Input
                        type="number"
                        placeholder="2500000"
                        value={projectData.budget}
                        onChange={(e) => handleInputChange('budget', parseInt(e.target.value) || 0)}
                        className="border-[var(--jofe-gray)] focus:border-[var(--jofe-blue-medium)]"
                        data-testid="input-budget"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-[var(--jofe-blue-deep)]">
                        Type de Projet *
                      </label>
                      <select
                        className="w-full border-2 border-[var(--jofe-gray)] rounded-md px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-medium)] bg-white"
                        value={projectData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        data-testid="select-project-type"
                      >
                        <option value="">Sélectionner le type</option>
                        {projectTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-[var(--jofe-blue-deep)]">
                        Date de début
                      </label>
                      <Input
                        type="datetime-local"
                        value={projectData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        className="border-[var(--jofe-gray)] focus:border-[var(--jofe-blue-medium)]"
                        data-testid="input-start-date"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-[var(--jofe-blue-deep)]">
                        Date de fin
                      </label>
                      <Input
                        type="datetime-local"
                        value={projectData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        className="border-[var(--jofe-gray)] focus:border-[var(--jofe-blue-medium)]"
                        data-testid="input-end-date"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-[var(--jofe-blue-deep)]">
                        Priorité
                      </label>
                      <select
                        className="w-full border-2 border-[var(--jofe-gray)] rounded-md px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-medium)] bg-white"
                        value={projectData.priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        data-testid="select-priority"
                      >
                        <option value="basse">Basse</option>
                        <option value="normale">Normale</option>
                        <option value="haute">Haute</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium mb-2 text-[var(--jofe-blue-deep)]">
                      Description du Projet
                    </label>
                    <Textarea
                      rows={4}
                      placeholder="Décrivez les objectifs, livrables attendus et spécificités du projet..."
                      value={projectData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="border-[var(--jofe-gray)] focus:border-[var(--jofe-blue-medium)]"
                      data-testid="textarea-description"
                    />
                  </div>
                </Card>
              </div>
              
              {/* Sidebar Preview */}
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-[var(--jofe-blue-deep)]">
                    Aperçu Projet
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--jofe-blue-medium)]">Template:</span>
                      <span className="text-sm font-medium text-[var(--jofe-blue-deep)]">
                        {selectedTemplateData?.name || 'Personnalisé'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--jofe-blue-medium)]">Budget:</span>
                      <span className="text-sm font-medium text-[var(--jofe-green)]">
                        {projectData.budget > 0 ? formatCurrency(projectData.budget) : '0 FCFA'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--jofe-blue-medium)]">Type:</span>
                      <span className="text-sm font-medium text-[var(--jofe-blue-deep)]">
                        {projectTypes.find(t => t.value === projectData.type)?.label || 'Non défini'}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Step 2: Team Selection */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-[var(--jofe-blue-deep)] flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Sélection de l'Équipe
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(teamMembers).map(([memberId, member]) => (
                      <Card
                        key={memberId}
                        className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                          selectedMembers.includes(memberId)
                            ? 'border-[var(--jofe-blue-light)] bg-blue-50'
                            : 'border-[var(--jofe-gray)] hover:border-[var(--jofe-blue-light)]'
                        }`}
                        onClick={() => handleTeamMemberToggle(memberId)}
                        data-testid={`member-${memberId}`}
                      >
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-[var(--jofe-blue-deep)] text-white font-semibold text-sm">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-[var(--jofe-blue-deep)]">{member.name}</h4>
                            <p className="text-xs text-gray-600">{member.role}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[var(--jofe-blue-medium)]">{member.rate.toLocaleString()} FCFA/h</span>
                          <Badge variant="secondary" className="bg-[var(--jofe-green)] text-white">
                            Disponible
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-[var(--jofe-blue-deep)]">
                    Coûts Équipe
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {selectedMembers.map(memberId => {
                        const member = teamMembers[memberId];
                        return (
                          <div key={memberId} className="flex justify-between text-sm">
                            <span>{member.name}:</span>
                            <span>{member.rate.toLocaleString()} FCFA/h</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-semibold">
                        <span>Coût/Heure:</span>
                        <span>{totalHourly.toLocaleString()} FCFA</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Estimation (40h):</span>
                        <span>{(totalHourly * 40).toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Step 3: Tasks Planning */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--jofe-blue-deep)] flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Planification des Tâches
                    </h3>
                    <Button
                      onClick={addNewTask}
                      className="bg-[var(--jofe-blue-light)] hover:bg-[var(--jofe-blue-medium)] text-white"
                      data-testid="button-add-task"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nouvelle Tâche
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {projectTasks.map((task) => (
                      <Card key={task.id} className="p-4 border border-[var(--jofe-gray)]">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1 text-[var(--jofe-blue-deep)]">
                              Nom de la tâche
                            </label>
                            <Input
                              value={task.name}
                              onChange={(e) => updateTask(task.id, 'name', e.target.value)}
                              placeholder="Ex: Création logo"
                              className="text-sm"
                              data-testid={`task-name-${task.id}`}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1 text-[var(--jofe-blue-deep)]">
                              Durée (heures)
                            </label>
                            <Input
                              type="number"
                              value={task.duration}
                              onChange={(e) => updateTask(task.id, 'duration', parseInt(e.target.value) || 0)}
                              className="text-sm"
                              data-testid={`task-duration-${task.id}`}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1 text-[var(--jofe-blue-deep)]">
                              Assigné à
                            </label>
                            <select
                              value={task.member}
                              onChange={(e) => updateTask(task.id, 'member', e.target.value)}
                              className="w-full border border-[var(--jofe-gray)] rounded-md px-2 py-1 text-sm"
                              data-testid={`task-member-${task.id}`}
                            >
                              <option value="">Sélectionner</option>
                              {selectedMembers.map(memberId => (
                                <option key={memberId} value={memberId}>
                                  {teamMembers[memberId].name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-3">
                          <select
                            value={task.priority}
                            onChange={(e) => updateTask(task.id, 'priority', e.target.value)}
                            className="border border-[var(--jofe-gray)] rounded px-2 py-1 text-xs"
                            data-testid={`task-priority-${task.id}`}
                          >
                            <option value="basse">Basse</option>
                            <option value="normale">Normale</option>
                            <option value="haute">Haute</option>
                          </select>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTask(task.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            data-testid={`button-remove-task-${task.id}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-[var(--jofe-blue-deep)]">
                    Planning Résumé
                  </h3>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 bg-green-50">
                      <h5 className="font-semibold mb-2 text-[var(--jofe-green)]">Temps Total Estimé</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Tâches:</span>
                          <span>{projectTasks.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Durée:</span>
                          <span>{projectTasks.reduce((sum, task) => sum + task.duration, 0)} heures</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Coût Total:</span>
                          <span>{formatCurrency(totalProjectCost)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Step 4: Validation */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in">
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-[var(--jofe-blue-deep)]">
                    Résumé du Projet
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-[var(--jofe-blue-deep)]">Informations Générales</h4>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Nom:</span>
                          <span className="font-medium">{projectData.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Client:</span>
                          <span className="font-medium">
                            {clients.find(c => c.value === projectData.client)?.label}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Budget:</span>
                          <span className="font-medium text-[var(--jofe-green)]">
                            {formatCurrency(projectData.budget)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-[var(--jofe-blue-deep)]">Équipe ({selectedMembers.length} membres)</h4>
                      <div className="mt-2 space-y-1 text-sm">
                        {selectedMembers.map(memberId => (
                          <div key={memberId} className="flex justify-between">
                            <span>{teamMembers[memberId].name}</span>
                            <span className="text-[var(--jofe-blue-medium)]">
                              {teamMembers[memberId].role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-[var(--jofe-blue-deep)]">Planning ({projectTasks.length} tâches)</h4>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Durée totale:</span>
                          <span className="font-medium">
                            {projectTasks.reduce((sum, task) => sum + task.duration, 0)} heures
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Coût estimé:</span>
                          <span className="font-medium text-[var(--jofe-green)]">
                            {formatCurrency(totalProjectCost)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-[var(--jofe-blue-deep)]">
                    Actions Finales
                  </h3>
                  <div className="space-y-3">
                    <Button
                      onClick={handleSaveProject}
                      variant="outline"
                      className="w-full border-[var(--jofe-blue-medium)] text-[var(--jofe-blue-medium)]"
                      data-testid="button-save-final"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder en Brouillon
                    </Button>
                    
                    <Button
                      onClick={handleCreateProject}
                      className="w-full bg-[var(--jofe-green)] hover:bg-green-600 text-white"
                      data-testid="button-create-final"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Créer le Projet
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              onClick={prevStep}
              disabled={currentStep === 1}
              variant="outline"
              className="border-[var(--jofe-gray)] text-[var(--jofe-blue-medium)]"
              data-testid="button-prev"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>
            
            <Button
              onClick={nextStep}
              className="bg-[var(--jofe-blue-light)] hover:bg-[var(--jofe-blue-medium)] text-white"
              data-testid="button-next"
            >
              {currentStep === 4 ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Terminer
                </>
              ) : (
                <>
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}