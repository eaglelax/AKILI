import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
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
  const { isAdmin, isLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [teamMembers, setTeamMembers] = useState<Array<{
    id: string;
    name: string;
    role: string;
  }>>([]);
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(true);

  // Rediriger les membres non-admin vers la liste des projets
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions pour créer un projet",
        variant: "destructive",
      });
      setLocation('/projects');
    }
  }, [isAdmin, isLoading, setLocation, toast]);

  // Charger les clients depuis l'API
  useEffect(() => {
    const loadClients = async () => {
      try {
        const response = await fetch('/api/clients', {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
          setClients(data.data || []);
        }
      } catch (error) {
        console.error('Erreur chargement clients:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des clients",
          variant: "destructive",
        });
      } finally {
        setLoadingClients(false);
      }
    };

    loadClients();
  }, [toast]);

  // Charger les membres de l'équipe depuis l'API
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        const response = await fetch('/api/users', {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
          setTeamMembers(data.data || []);
        }
      } catch (error) {
        console.error('Erreur chargement membres:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des membres",
          variant: "destructive",
        });
      } finally {
        setLoadingTeamMembers(false);
      }
    };

    loadTeamMembers();
  }, [toast]);

  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [milestones, setMilestones] = useState([{ name: '', date: '' }]);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: string;
    fileName: string;
    originalName: string;
    fileType: string;
    mimeType: string;
    fileSize: number;
  }>>([]);
  const [isUploading, setIsUploading] = useState(false);

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
  // Les membres et clients sont maintenant chargés depuis l'API (voir useEffect ci-dessus)

  // Fonction pour obtenir les initiales d'un nom
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Fonction pour générer une couleur basée sur le nom
  const getColorFromName = (name: string) => {
    const colors = [
      '#162C54', '#3475BB', '#37B6E9', '#93C954', '#EF4444',
      '#F59E0B', '#8B5CF6', '#F68C1F', '#10B981', '#EC4899', '#6366F1', '#64748B'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const projectTypes = [
    'Campagne 360°', 'Identité Visuelle', 'Digital & Réseaux Sociaux', 'Production Vidéo',
    'Événementiel', 'Communication Print', 'Site Web', 'Motion Design', 'Photographie'
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Fonction pour convertir un fichier en Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Fonction pour uploader un fichier
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier la taille du fichier (max 10 MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Erreur',
        description: 'Le fichier est trop volumineux (max 10 MB)',
        variant: 'destructive',
      });
      return;
    }

    // Vérifier le type de fichier
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Erreur',
        description: 'Type de fichier non autorisé. Formats acceptés: PDF, DOC, DOCX, JPG, PNG, GIF',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileData = await fileToBase64(file);

      const response = await apiRequest('POST', '/api/projects/files/upload', {
        fileName: file.name,
        fileData: fileData,
        fileType: 'brief',
        mimeType: file.type,
        description: 'Brief client',
      });

      const data = await response.json();

      if (data.success) {
        setUploadedFiles(prev => [...prev, data.data]);
        toast({
          title: 'Fichier uploadé',
          description: `"${file.name}" a été ajouté avec succès`,
        });
      } else {
        toast({
          title: 'Erreur',
          description: data.message || "Erreur lors de l'upload",
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Erreur upload:', error);
      toast({
        title: 'Erreur',
        description: "Erreur lors de l'upload du fichier",
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Fonction pour supprimer un fichier uploadé
  const handleRemoveFile = async (fileId: string) => {
    try {
      const response = await apiRequest('DELETE', `/api/projects/files/${fileId}`);
      const data = await response.json();

      if (data.success) {
        setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
        toast({
          title: 'Fichier supprimé',
          description: 'Le fichier a été supprimé',
        });
      }
    } catch (error: any) {
      console.error('Erreur suppression:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la suppression du fichier',
        variant: 'destructive',
      });
    }
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
      // Note: Les templates ne peuvent plus pré-sélectionner des membres car les IDs sont dynamiques
      // setSelectedTeamMembers(template.team);
      setShowTemplatesModal(false);
      toast({
        title: 'Template appliqué',
        description: `"${template.name}" a été configuré. Sélectionnez manuellement les membres de l'équipe.`,
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!projectData.name || !projectData.client) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir le nom du projet et sélectionner un client',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Mapper la priorité vers les valeurs acceptées par le backend
      const priorityMap: Record<string, string> = {
        'low': 'basse',
        'medium': 'moyenne',
        'high': 'haute',
      };

      // Appel API pour créer le projet dans MySQL
      const response = await apiRequest('POST', '/api/projects', {
        name: projectData.name,
        description: projectData.description,
        clientId: projectData.client, // Utiliser l'ID du client sélectionné
        status: 'planning',
        priority: priorityMap[projectData.priority] || 'moyenne',
        budget: String(projectData.totalBudget),
        startDate: projectData.startDate || null,
        endDate: projectData.endDate || null,
      });

      const data = await response.json();

      if (data.success) {
        const projectId = data.data?.id;

        // Ajouter les membres d'équipe sélectionnés au projet
        if (selectedTeamMembers.length > 0 && projectId) {
          for (const memberId of selectedTeamMembers) {
            try {
              await apiRequest('POST', `/api/projects/${projectId}/members`, {
                memberId: memberId,
                role: 'Membre équipe', // Rôle par défaut
              });
            } catch (err) {
              console.error('Erreur ajout membre:', err);
            }
          }
        }

        // Associer les fichiers uploadés au projet créé
        if (uploadedFiles.length > 0 && projectId) {
          for (const file of uploadedFiles) {
            try {
              await apiRequest('PUT', `/api/projects/files/${file.id}`, {
                projectId: projectId,
              });
            } catch (err) {
              console.error('Erreur association fichier:', err);
            }
          }
        }

        toast({
          title: 'Projet créé avec succès!',
          description: `"${projectData.name}" a été créé avec ${selectedTeamMembers.length} membre(s) assigné(s)`,
        });
        setLocation('/projects');
      } else {
        toast({
          title: 'Erreur',
          description: data.message || 'Impossible de créer le projet',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Erreur création projet:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la création du projet',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: 'Informations', subtitle: 'Détails du projet' },
    { id: 2, title: 'Équipe', subtitle: 'Assignation membres' },
    { id: 3, title: 'Budget & Planning', subtitle: 'Configuration avancée' },
    { id: 4, title: 'Validation', subtitle: 'Finalisation projet' }
  ];


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
                      disabled={loadingClients}
                      data-testid="select-client"
                    >
                      <option value="">
                        {loadingClients ? 'Chargement des clients...' : 'Sélectionnez un client'}
                      </option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
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
                    Équipe Disponible ({teamMembers.length} membres)
                  </h4>
                  {loadingTeamMembers ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-gray-500 mt-2">Chargement des membres...</p>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className={`team-member ${selectedTeamMembers.includes(member.id) ? 'selected' : ''}`}
                          onClick={() => handleTeamMemberToggle(member.id)}
                          data-testid={`member-${member.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ background: getColorFromName(member.name) }}
                              >
                                <span className="text-white font-semibold text-sm">{getInitials(member.name)}</span>
                              </div>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-gray-600">{member.role}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              {selectedTeamMembers.includes(member.id) && (
                                <p className="text-xs" style={{ color: 'var(--jofe-green)' }}>✓ Assigné</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                          const member = teamMembers.find(m => m.id === memberId);
                          if (!member) return null;
                          return (
                            <div key={memberId} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center"
                                  style={{ background: getColorFromName(member.name) }}
                                >
                                  <span className="text-white font-semibold text-xs">{getInitials(member.name)}</span>
                                </div>
                                <span className="text-sm">{member.name}</span>
                              </div>
                              </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {selectedTeamMembers.length > 0 && (
                    <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium mb-3">Équipe du projet</h5>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Membres assignés: <span className="font-semibold">{selectedTeamMembers.length}</span>
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
                      <div
                        className={`file-upload ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                      >
                        {isUploading ? (
                          <>
                            <svg className="w-8 h-8 mx-auto mb-2 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-sm text-blue-500">Upload en cours...</p>
                          </>
                        ) : (
                          <>
                            <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            <p className="text-sm text-gray-600">Cliquez pour uploader le brief</p>
                            <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, JPG, PNG (max 10MB)</p>
                          </>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                          data-testid="input-file-brief"
                        />
                      </div>
                    </div>

                    {/* Liste des fichiers uploadés */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4">
                        <label className="form-label mb-2">Fichiers uploadés ({uploadedFiles.length})</label>
                        <div className="space-y-2">
                          {uploadedFiles.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center gap-3">
                                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">{file.originalName}</p>
                                  <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(file.id)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                title="Supprimer"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                  className={`btn btn-success ${isSubmitting ? 'btn-disabled' : ''}`}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  data-testid="button-submit"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Créer le Projet
                    </>
                  )}
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