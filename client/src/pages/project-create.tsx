import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/useWebSocket';
import TopNavBar from '@/components/TopNavBar';

// Styles CSS intégrés pour respecter le design JoFé+
const styles = `
  /* Variables CSS JoFé+ */
  :root {
    --jofe-blue-deep: #162C54;
    --jofe-blue-night: #1A4278;
    --jofe-blue-medium: #3475BB;
    --jofe-blue-light: #37B6E9;
    --jofe-black: #000000;
    --jofe-gray-pearl: #EBECED;
    --jofe-white: #FFFFFF;
    --jofe-green: #93C954;
    --jofe-orange: #F68C1F;
    
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    --spacing-2xl: 48px;
    --spacing-3xl: 64px;
  }
  
  .inter-font {
    font-family: 'Inter', sans-serif;
  }
  
  /* Stepper styles */
  .stepper {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--spacing-2xl);
    position: relative;
  }
  
  .stepper::before {
    content: '';
    position: absolute;
    top: 24px;
    left: 24px;
    right: 24px;
    height: 2px;
    background: var(--jofe-gray-pearl);
    z-index: 1;
  }
  
  .stepper-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 2;
    min-width: 120px;
  }
  
  .step-number {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    margin-bottom: var(--spacing-sm);
    transition: all 0.3s ease;
  }
  
  .step-number.active {
    background: var(--jofe-blue-light);
    color: var(--jofe-white);
  }
  
  .step-number.completed {
    background: var(--jofe-green);
    color: var(--jofe-white);
  }
  
  .step-number.inactive {
    background: var(--jofe-gray-pearl);
    color: var(--jofe-blue-medium);
  }
  
  .step-title {
    font-weight: 500;
    color: var(--jofe-blue-deep);
    text-align: center;
  }
  
  /* Form styles */
  .form-group {
    margin-bottom: var(--spacing-lg);
  }
  
  .form-label {
    display: block;
    font-weight: 500;
    color: var(--jofe-blue-deep);
    margin-bottom: var(--spacing-sm);
  }
  
  .form-input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--jofe-gray-pearl);
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s ease;
    background: var(--jofe-white);
  }
  
  .form-input:focus {
    outline: none;
    border-color: var(--jofe-blue-light);
    box-shadow: 0 0 0 3px rgba(55, 182, 233, 0.1);
  }
  
  .form-select {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--jofe-gray-pearl);
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s ease;
    background: var(--jofe-white);
    cursor: pointer;
  }
  
  .form-textarea {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--jofe-gray-pearl);
    border-radius: 8px;
    font-size: 14px;
    resize: vertical;
    min-height: 100px;
    transition: all 0.2s ease;
    background: var(--jofe-white);
  }
  
  /* Buttons */
  .btn {
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: none;
    text-decoration: none;
  }
  
  .btn-primary {
    background: var(--jofe-blue-light);
    color: var(--jofe-white);
  }
  
  .btn-primary:hover {
    background: var(--jofe-blue-medium);
    transform: translateY(-1px);
  }
  
  .btn-secondary {
    background: var(--jofe-white);
    color: var(--jofe-blue-medium);
    border: 1px solid var(--jofe-gray-pearl);
  }
  
  .btn-secondary:hover {
    background: rgba(52, 117, 187, 0.05);
    border-color: var(--jofe-blue-light);
  }
  
  .btn-success {
    background: var(--jofe-green);
    color: var(--jofe-white);
  }
  
  .btn-success:hover {
    background: #7FB544;
    transform: translateY(-1px);
  }
  
  .btn-warning {
    background: var(--jofe-orange);
    color: var(--jofe-white);
  }
  
  .btn-disabled {
    background: var(--jofe-gray-pearl);
    color: #9CA3AF;
    cursor: not-allowed;
  }
  
  /* Cards */
  .card {
    background: var(--jofe-white);
    border: 1px solid var(--jofe-gray-pearl);
    border-radius: 12px;
    padding: var(--spacing-lg);
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    transition: all 0.3s ease;
  }
  
  .card:hover {
    box-shadow: 0 8px 16px rgba(22, 44, 84, 0.1);
  }
  
  /* Team member cards */
  .team-member {
    border: 1px solid var(--jofe-gray-pearl);
    border-radius: 8px;
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .team-member:hover {
    border-color: var(--jofe-blue-light);
    box-shadow: 0 4px 8px rgba(55, 182, 233, 0.1);
  }
  
  .team-member.selected {
    border-color: var(--jofe-blue-light);
    background: rgba(55, 182, 233, 0.05);
  }
  
  /* Templates */
  .template-card {
    border: 1px solid var(--jofe-gray-pearl);
    border-radius: 8px;
    padding: var(--spacing-md);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
  }
  
  .template-card:hover {
    border-color: var(--jofe-blue-light);
    transform: translateY(-2px);
  }
  
  .template-card.selected {
    border-color: var(--jofe-blue-light);
    background: rgba(55, 182, 233, 0.05);
  }
  
  /* File upload */
  .file-upload {
    border: 2px dashed var(--jofe-gray-pearl);
    border-radius: 8px;
    padding: var(--spacing-xl);
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .file-upload:hover {
    border-color: var(--jofe-blue-light);
    background: rgba(55, 182, 233, 0.02);
  }
  
  /* Step content */
  .step-content {
    display: none;
  }
  
  .step-content.active {
    display: block;
    animation: fadeIn 0.3s ease-in;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  /* Budget calculator */
  .budget-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) 0;
    border-bottom: 1px solid var(--jofe-gray-pearl);
  }
  
  .budget-total {
    font-size: 1.2em;
    font-weight: 600;
    color: var(--jofe-blue-deep);
    padding-top: var(--spacing-md);
  }
  
  /* Priority badges */
  .priority-low {
    background: var(--jofe-green);
    color: var(--jofe-white);
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
  }
  
  .priority-medium {
    background: var(--jofe-orange);
    color: var(--jofe-white);
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
  }
  
  .priority-high {
    background: #EF4444;
    color: var(--jofe-white);
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
  }
  
  /* Modal */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: var(--jofe-white);
    border-radius: 12px;
    padding: var(--spacing-xl);
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .stepper {
      flex-direction: column;
      gap: var(--spacing-md);
    }
    
    .stepper::before {
      display: none;
    }
    
    .stepper-step {
      flex-direction: row;
      text-align: left;
    }
    
    .step-number {
      margin-right: var(--spacing-md);
      margin-bottom: 0;
      min-width: 48px;
    }
  }
`;

export default function ProjectCreate() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { isConnected } = useWebSocket();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [milestones, setMilestones] = useState([{ name: '', date: '' }]);
  
  const [projectData, setProjectData] = useState({
    name: '',
    client: '',
    type: '',
    priority: 'medium',
    description: '',
    totalBudget: 0,
    estimatedHours: 0,
    startDate: '',
    endDate: ''
  });

  // Injection des styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Templates de projets
  const templates = {
    'campaign-moov': {
      name: 'Campagne MOOV',
      description: 'Campagne 360° pour MOOV AFRICA',
      details: 'Photomontage, Motion Design, Community Management',
      budget: 2500000,
      hours: 120,
      team: ['serge-assale', 'enos-gouba', 'armel-bationo', 'faridatou-barry']
    },
    'branding-bancaire': {
      name: 'Branding Bancaire',
      description: 'Identité visuelle pour institutions financières',
      details: 'Logo, Charte graphique, Supports corporate',
      budget: 1800000,
      hours: 80,
      team: ['serge-assale', 'enos-gouba', 'paul-ouedraogo']
    },
    'digital-360': {
      name: 'Digital 360°',
      description: 'Stratégie digitale complète',
      details: 'Stratégie, Contenus, SEO, Social Media, Analytics',
      budget: 3200000,
      hours: 150,
      team: ['serge-assale', 'maryse-bombiri', 'faridatou-barry', 'abdoul-sawadogo']
    }
  };

  // Équipe réelle Jo'Fé Digital
  const teamMembers = {
    'serge-assale': { name: 'Serge ASSALÉ', role: 'Directeur Création', rate: 15000, initials: 'SA', color: '#162C54' },
    'enos-gouba': { name: 'Enos GOUBA', role: 'Directeur Artistique', rate: 12000, initials: 'EG', color: '#3475BB' },
    'paul-ouedraogo': { name: 'Paul OUÉDRAOGO', role: 'Designer Senior', rate: 10000, initials: 'PO', color: '#37B6E9' },
    'armel-bationo': { name: 'Armel BATIONO', role: 'Motion Designer', rate: 9500, initials: 'AB', color: '#93C954' },
    'faridatou-barry': { name: 'Faridatou BARRY', role: 'Chef de Pub/CM', rate: 7500, initials: 'FB', color: '#EF4444' },
    'maryse-bombiri': { name: 'Maryse BOMBIRI', role: 'Community Manager', rate: 7000, initials: 'MB', color: '#F59E0B' },
    'linda-kabore': { name: 'Linda KABORÉ', role: 'Conceptrice Rédactrice Lead', rate: 9500, initials: 'LK', color: '#8B5CF6' },
    'abdoul-sawadogo': { name: 'Abdoul SAWADOGO', role: 'Monteur Vidéo', rate: 8000, initials: 'AS', color: '#F68C1F' },
    'jean-sampabao': { name: 'Jean-Jacques SAMPABAO', role: 'Directeur Artistique Junior', rate: 7000, initials: 'JS', color: '#F68C1F' },
    'latif-ouedraogo': { name: 'Abdoul Latif OUEDRAOGO', role: 'Designer UI/UX', rate: 8500, initials: 'LO', color: '#3475BB' },
    'boureima-ouedraogo': { name: 'Boureima OUÉDRAOGO', role: 'Photographe', rate: 8500, initials: 'BO', color: '#10B981' },
    'fatou-sankara': { name: 'Fatou SANKARA', role: 'Community Manager', rate: 6500, initials: 'FS', color: '#EC4899' },
    'ibrahim-traore': { name: 'Ibrahim TRAORÉ', role: 'Développeur Web', rate: 9500, initials: 'IT', color: '#6366F1' },
    'aissata-nacoulma': { name: 'Aissata NACOULMA', role: 'Assistante Administration', rate: 4500, initials: 'AN', color: '#64748B' }
  };

  // Clients Jo'Fé Digital
  const clients = [
    'MOOV AFRICA', 'BANK OF AFRICA', 'SUNU BURKINA', 'ROXGOLD', 'VINCENT & ASSOCIES', 
    'PNUD BF', 'ANSSI', 'BABALI EAU', 'DAFANI', 'BABALI BOISSONS', 'LAAFI NANDA',
    'AFRICA PERFORMANCE GROUPE', 'BAR-RESTAU LE TRAPEZE', 'UAB ASSURANCES', 'CNPB',
    'FIDELIS FINANCE BURKINA', 'SUNU ASSURANCES IARD MALI', 'SONAR GROUPE', 'ORYX BURKINA',
    'BADF', 'FOREVER', 'FROID SOLUTIONS', 'KSC GROUP', 'MORISOL', 'SPH', 'LORETTA',
    'NELSON SOLAR', 'AGENCE ZACA', 'ANEREE', 'JO\'FÉ DIGITAL', 'J\'PAY', 'JOFFRES', 'LOUDA'
  ];

  const projectTypes = [
    'Campagne 360°', 'Identité Visuelle', 'Digital & Réseaux Sociaux', 'Production Vidéo',
    'Événementiel', 'Communication Print', 'Site Web', 'Motion Design', 'Photographie'
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const calculateBudget = () => {
    const teamCost = selectedTeamMembers.reduce((total, memberId) => {
      const member = teamMembers[memberId as keyof typeof teamMembers];
      return total + (member?.rate || 0);
    }, 0) * projectData.estimatedHours;
    const margin = projectData.totalBudget - teamCost;
    const marginRate = projectData.totalBudget > 0 ? (margin / projectData.totalBudget) * 100 : 0;
    
    return { teamCost, margin, marginRate };
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates[templateId as keyof typeof templates];
    if (template) {
      setSelectedTemplate(templateId);
      setProjectData(prev => ({
        ...prev,
        name: template.name + ' - ' + new Date().getFullYear(),
        totalBudget: template.budget,
        estimatedHours: template.hours
      }));
      setSelectedTeamMembers(template.team);
      setShowTemplatesModal(false);
      toast({
        title: 'Template appliqué',
        description: `"${template.name}" a été configuré avec succès`,
      });
    }
  };

  const handleTeamMemberToggle = (memberId: string) => {
    setSelectedTeamMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const addMilestone = () => {
    setMilestones([...milestones, { name: '', date: '' }]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: string, value: string) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const finalProject = {
      ...projectData,
      team: selectedTeamMembers,
      milestones,
      template: selectedTemplate,
      budget: calculateBudget()
    };
    
    console.log('Projet créé:', finalProject);
    toast({
      title: 'Projet créé avec succès!',
      description: `"${projectData.name}" a été créé et assigné à l'équipe`,
    });
    setLocation('/projects');
  };

  const steps = [
    { id: 1, title: 'Informations', subtitle: 'Détails du projet' },
    { id: 2, title: 'Équipe', subtitle: 'Assignation membres' },
    { id: 3, title: 'Budget & Planning', subtitle: 'Configuration avancée' },
    { id: 4, title: 'Validation', subtitle: 'Finalisation projet' }
  ];

  const { teamCost, margin, marginRate } = calculateBudget();

  return (
    <div className="min-h-screen bg-white">
      <TopNavBar />
      <div className="lg:ml-72">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="inter-font text-2xl font-bold" style={{ color: 'var(--jofe-blue-deep)' }}>
                Création/Édition de Projet
              </h1>
              <p className="text-sm" style={{ color: 'var(--jofe-blue-medium)' }}>
                Configurez votre nouveau projet créatif • WebSocket {isConnected ? '🟢' : '🔴'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowTemplatesModal(true)}
                className="btn btn-secondary"
                data-testid="button-templates"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14-7H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z"></path>
                </svg>
                Templates
              </button>
              
              <button 
                onClick={() => setLocation('/projects')}
                className="btn btn-secondary"
                data-testid="button-back"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Retour
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-8">
          {/* Stepper */}
          <div className="stepper">
            {steps.map((step) => (
              <div key={step.id} className="stepper-step">
                <div 
                  className={`step-number ${
                    currentStep === step.id ? 'active' : 
                    currentStep > step.id ? 'completed' : 'inactive'
                  }`}
                  onClick={() => setCurrentStep(step.id)}
                  style={{ cursor: 'pointer' }}
                  data-testid={`step-${step.id}`}
                >
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                <div className="step-title">
                  <div className="font-medium">{step.title}</div>
                  <div className="text-sm text-gray-500">{step.subtitle}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Form Content */}
          <div className="fade-in">
            {/* Step 1: Informations Projet */}
            <div className={`step-content ${currentStep === 1 ? 'active' : ''}`}>
              <h3 className="inter-font text-xl font-semibold mb-6" style={{ color: 'var(--jofe-blue-deep)' }}>
                Informations du Projet
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="form-group">
                    <label className="form-label">Nom du Projet *</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="Ex: Campagne Q1 2025 MOOV AFRICA"
                      value={projectData.name}
                      onChange={(e) => setProjectData({...projectData, name: e.target.value})}
                      data-testid="input-project-name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Client *</label>
                    <select 
                      className="form-select"
                      value={projectData.client}
                      onChange={(e) => setProjectData({...projectData, client: e.target.value})}
                      data-testid="select-client"
                    >
                      <option value="">Sélectionnez un client</option>
                      {clients.map(client => (
                        <option key={client} value={client}>{client}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Type de Projet *</label>
                    <select 
                      className="form-select"
                      value={projectData.type}
                      onChange={(e) => setProjectData({...projectData, type: e.target.value})}
                      data-testid="select-project-type"
                    >
                      <option value="">Sélectionnez le type</option>
                      {projectTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Priorité</label>
                    <select 
                      className="form-select"
                      value={projectData.priority}
                      onChange={(e) => setProjectData({...projectData, priority: e.target.value})}
                      data-testid="select-priority"
                    >
                      <option value="low">🟢 Basse</option>
                      <option value="medium">🟡 Moyenne</option>
                      <option value="high">🔴 Haute</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea 
                      className="form-textarea"
                      placeholder="Décrivez les objectifs et spécificités du projet..."
                      value={projectData.description}
                      onChange={(e) => setProjectData({...projectData, description: e.target.value})}
                      data-testid="textarea-description"
                    />
                  </div>
                  
                  {selectedTemplate && (
                    <div className="card" style={{ background: 'rgba(55, 182, 233, 0.05)' }}>
                      <h4 className="font-semibold mb-3" style={{ color: 'var(--jofe-blue-deep)' }}>
                        Template Appliqué
                      </h4>
                      <div className="space-y-2">
                        <p className="font-medium">{templates[selectedTemplate as keyof typeof templates].name}</p>
                        <p className="text-sm text-gray-600">{templates[selectedTemplate as keyof typeof templates].description}</p>
                        <p className="text-xs" style={{ color: 'var(--jofe-blue-medium)' }}>
                          {templates[selectedTemplate as keyof typeof templates].details}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Équipe */}
            <div className={`step-content ${currentStep === 2 ? 'active' : ''}`}>
              <h3 className="inter-font text-xl font-semibold mb-6" style={{ color: 'var(--jofe-blue-deep)' }}>
                Sélection de l'Équipe
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4" style={{ color: 'var(--jofe-blue-medium)' }}>
                    Équipe Disponible ({Object.keys(teamMembers).length} membres)
                  </h4>
                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {Object.entries(teamMembers).map(([id, member]) => (
                      <div 
                        key={id}
                        className={`team-member ${selectedTeamMembers.includes(id) ? 'selected' : ''}`}
                        onClick={() => handleTeamMemberToggle(id)}
                        data-testid={`member-${id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ background: member.color }}
                            >
                              <span className="text-white font-semibold text-sm">{member.initials}</span>
                            </div>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-gray-600">{member.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(member.rate)}/h</p>
                            {selectedTeamMembers.includes(id) && (
                              <p className="text-xs" style={{ color: 'var(--jofe-green)' }}>✓ Assigné</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4" style={{ color: 'var(--jofe-blue-medium)' }}>
                    Équipe Assignée ({selectedTeamMembers.length} membres)
                  </h4>
                  <div className="min-h-32 p-4 border-2 border-dashed border-gray-200 rounded-lg">
                    {selectedTeamMembers.length === 0 ? (
                      <p className="text-gray-500 text-center">Cliquez sur les membres à gauche pour les assigner au projet</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedTeamMembers.map(memberId => {
                          const member = teamMembers[memberId as keyof typeof teamMembers];
                          return (
                            <div key={memberId} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-8 h-8 rounded-full flex items-center justify-center"
                                  style={{ background: member.color }}
                                >
                                  <span className="text-white font-semibold text-xs">{member.initials}</span>
                                </div>
                                <span className="text-sm">{member.name}</span>
                              </div>
                              <span className="text-xs text-gray-500">{formatCurrency(member.rate)}/h</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {selectedTeamMembers.length > 0 && (
                    <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium mb-3">Estimation des coûts équipe</h5>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Coût horaire total: <span className="font-semibold">
                            {formatCurrency(selectedTeamMembers.reduce((total, id) => {
                              const member = teamMembers[id as keyof typeof teamMembers];
                              return total + (member?.rate || 0);
                            }, 0))}/h
                          </span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Membres assignés: <span className="font-semibold">{selectedTeamMembers.length}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Coût moyen/h: <span className="font-semibold">
                            {formatCurrency(selectedTeamMembers.length > 0 ? 
                              selectedTeamMembers.reduce((total, id) => {
                                const member = teamMembers[id as keyof typeof teamMembers];
                                return total + (member?.rate || 0);
                              }, 0) / selectedTeamMembers.length : 0)}/h
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3: Budget & Planning */}
            <div className={`step-content ${currentStep === 3 ? 'active' : ''}`}>
              <h3 className="inter-font text-xl font-semibold mb-6" style={{ color: 'var(--jofe-blue-deep)' }}>
                Budget et Planning
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4" style={{ color: 'var(--jofe-blue-medium)' }}>Configuration Budget</h4>
                  
                  <div className="form-group">
                    <label className="form-label">Budget Total Client (FCFA)</label>
                    <input 
                      type="number" 
                      className="form-input"
                      placeholder="Ex: 2500000"
                      value={projectData.totalBudget}
                      onChange={(e) => setProjectData({...projectData, totalBudget: parseInt(e.target.value) || 0})}
                      data-testid="input-budget"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Durée Estimée (heures)</label>
                    <input 
                      type="number" 
                      className="form-input"
                      placeholder="Ex: 120"
                      value={projectData.estimatedHours}
                      onChange={(e) => setProjectData({...projectData, estimatedHours: parseInt(e.target.value) || 0})}
                      data-testid="input-hours"
                    />
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium mb-3">Calcul Prévisionnel</h5>
                    <div className="space-y-2">
                      <div className="budget-item">
                        <span>Coût équipe estimé:</span>
                        <span>{formatCurrency(teamCost)}</span>
                      </div>
                      <div className="budget-item">
                        <span>Marge bénéficiaire:</span>
                        <span style={{ color: margin >= 0 ? 'var(--jofe-green)' : '#EF4444' }}>
                          {formatCurrency(margin)}
                        </span>
                      </div>
                      <div className="budget-item">
                        <span>Taux de marge:</span>
                        <span style={{ color: marginRate >= 20 ? 'var(--jofe-green)' : marginRate >= 10 ? 'var(--jofe-orange)' : '#EF4444' }}>
                          {marginRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="budget-total">
                      Total projet: <span>{formatCurrency(projectData.totalBudget)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4" style={{ color: 'var(--jofe-blue-medium)' }}>Planning Projet</h4>
                  
                  <div className="form-group">
                    <label className="form-label">Date de Début</label>
                    <input 
                      type="date" 
                      className="form-input"
                      value={projectData.startDate}
                      onChange={(e) => setProjectData({...projectData, startDate: e.target.value})}
                      data-testid="input-start-date"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Date de Fin Prévue</label>
                    <input 
                      type="date" 
                      className="form-input"
                      value={projectData.endDate}
                      onChange={(e) => setProjectData({...projectData, endDate: e.target.value})}
                      data-testid="input-end-date"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Jalons Importants</label>
                    <div className="space-y-2">
                      {milestones.map((milestone, index) => (
                        <div key={index} className="flex gap-2">
                          <input 
                            type="text" 
                            className="form-input flex-1" 
                            placeholder="Nom du jalon"
                            value={milestone.name}
                            onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                            data-testid={`milestone-name-${index}`}
                          />
                          <input 
                            type="date" 
                            className="form-input"
                            value={milestone.date}
                            onChange={(e) => updateMilestone(index, 'date', e.target.value)}
                            data-testid={`milestone-date-${index}`}
                          />
                          {milestones.length > 1 && (
                            <button 
                              type="button" 
                              className="btn btn-secondary"
                              onClick={() => removeMilestone(index)}
                              data-testid={`milestone-remove-${index}`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-secondary mt-2"
                      onClick={addMilestone}
                      data-testid="button-add-milestone"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      Ajouter un jalon
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Validation */}
            <div className={`step-content ${currentStep === 4 ? 'active' : ''}`}>
              <h3 className="inter-font text-xl font-semibold mb-6" style={{ color: 'var(--jofe-blue-deep)' }}>
                Validation et Finalisation
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4" style={{ color: 'var(--jofe-blue-medium)' }}>Workflow d'Approbation</h4>
                  
                  <div className="space-y-3">
                    {[
                      'Brief client validé',
                      'Concept créatif approuvé', 
                      'Validation interne DA',
                      'Présentation client',
                      'Révisions client',
                      'Livraison finale'
                    ].map((step, index) => (
                      <label key={index} className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked={index < 3} className="rounded" />
                        <span className="text-sm">{step}</span>
                      </label>
                    ))}
                  </div>
                  
                  <div className="form-group mt-6">
                    <label className="form-label">Responsable Validation</label>
                    <select className="form-select" data-testid="select-validator">
                      <option>Serge ASSALÉ</option>
                      <option>Enos GOUBA</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4" style={{ color: 'var(--jofe-blue-medium)' }}>Documents Projet</h4>
                  
                  <div className="space-y-4">
                    <div className="form-group">
                      <label className="form-label">Brief Client</label>
                      <div className="file-upload" onClick={() => fileInputRef.current?.click()}>
                        <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        <p className="text-sm text-gray-600">Cliquez pour uploader le brief</p>
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          className="hidden" 
                          accept=".pdf,.doc,.docx"
                          data-testid="input-file-brief"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Project Summary */}
              <div className="mt-8">
                <h4 className="font-semibold mb-4" style={{ color: 'var(--jofe-blue-medium)' }}>Résumé du Projet</h4>
                <div className="card bg-gray-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Nom:</span>
                        <span className="font-medium">{projectData.name || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Client:</span>
                        <span className="font-medium">{projectData.client || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium">{projectData.type || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Priorité:</span>
                        <span className={`priority-${projectData.priority}`}>
                          {projectData.priority === 'low' ? 'Basse' : 
                           projectData.priority === 'medium' ? 'Moyenne' : 'Haute'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Équipe:</span>
                        <span className="font-medium">{selectedTeamMembers.length} membres</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Budget:</span>
                        <span className="font-medium">{formatCurrency(projectData.totalBudget)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Durée:</span>
                        <span className="font-medium">{projectData.estimatedHours}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Marge:</span>
                        <span className="font-medium" style={{ color: marginRate >= 20 ? 'var(--jofe-green)' : marginRate >= 10 ? 'var(--jofe-orange)' : '#EF4444' }}>
                          {marginRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button 
              type="button" 
              className={`btn btn-secondary ${currentStep === 1 ? 'btn-disabled' : ''}`}
              onClick={prevStep}
              disabled={currentStep === 1}
              data-testid="button-prev"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Précédent
            </button>
            
            <div className="flex gap-3">
              {currentStep < 4 ? (
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={nextStep}
                  data-testid="button-next"
                >
                  Suivant
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              ) : (
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={handleSubmit}
                  data-testid="button-submit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Créer le Projet
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <h3 className="inter-font text-xl font-semibold" style={{ color: 'var(--jofe-blue-deep)' }}>
                Templates de Projets
              </h3>
              <button 
                onClick={() => setShowTemplatesModal(false)}
                className="text-gray-400 hover:text-gray-600"
                data-testid="button-close-modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(templates).map(([id, template]) => (
                <div 
                  key={id}
                  className={`template-card ${selectedTemplate === id ? 'selected' : ''}`}
                  onClick={() => handleTemplateSelect(id)}
                  data-testid={`template-${id}`}
                >
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--jofe-blue-deep)' }}>
                    {template.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <p className="text-xs mb-3" style={{ color: 'var(--jofe-blue-medium)' }}>
                    {template.details}
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>Budget: {formatCurrency(template.budget)}</span>
                    <span>Durée: {template.hours}h</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => setShowTemplatesModal(false)}
                className="btn btn-secondary"
                data-testid="button-custom-project"
              >
                Projet Personnalisé
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}