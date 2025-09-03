import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Eye,
  Info,
  Users,
  Calendar,
  DollarSign,
  Video,
  Palette,
  BookOpen,
  Building,
  Check,
  CheckCircle
} from 'lucide-react';
import TopNavBar from '@/components/TopNavBar';
import { Link } from 'wouter';

// Templates de projets
const projectTemplates = [
  {
    id: 'campagne360',
    name: 'Campagne 360°',
    description: 'Brief → Stratégie → Création → Production → Diffusion',
    details: 'Durée: 6-8 semaines • Budget: 3-8M FCFA',
    icon: Video,
    type: 'campagne_360',
    duration: '6-8 semaines'
  },
  {
    id: 'identite',
    name: 'Identité Visuelle',
    description: 'Recherche → Concepts → Logo → Charte → Déclinaisons',
    details: 'Durée: 3-4 semaines • Budget: 500K-2M FCFA',
    icon: Palette,
    type: 'identite_visuelle',
    duration: '3-4 semaines'
  },
  {
    id: 'digital',
    name: 'Digital & Réseaux',
    description: 'Stratégie → Contenus → Visuals → Community → Analytics',
    details: 'Durée: En continu • Budget: 1-5M FCFA/mois',
    icon: BookOpen,
    type: 'digital_social',
    duration: 'En continu'
  },
  {
    id: 'custom',
    name: 'Projet Personnalisé',
    description: 'Configurez votre propre workflow',
    details: 'Durée: Variable • Budget: Selon besoins',
    icon: Plus,
    type: 'autre',
    duration: 'Variable'
  }
];

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

// Types de projets
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

// Équipe Jo'Fé Digital
const teamMembers = [
  { value: 'paul_ouedraogo', label: 'Paul Junior OUEDRAOGO (Graphiste)' },
  { value: 'fortune_yanogo', label: 'Fortune YANOGO (Photo/Vidéo)' },
  { value: 'bientama_pare', label: 'Bientama PARÉ (Motion Designer)' },
  { value: 'florita_kabore', label: 'Florita KABORÉ (Social Media)' },
  { value: 'nebie_webou', label: 'Nebié WEBOU (Chef de Pub)' },
  { value: 'abdoul_ouedraogo', label: 'Abdoul Latif OUEDRAOGO (UI/UX)' },
  { value: 'linda_kabore', label: 'Linda KABORÉ (Conceptrice Lead)' },
  { value: 'jean_sougue', label: 'Jean SOUGUÉ (Développeur)' },
  { value: 'malik_barry', label: 'Malik BARRY (Community Manager)' },
  { value: 'fatou_konate', label: 'Fatou KONATÉ (Chargée Clientèle)' },
  { value: 'boubacar_traore', label: 'Boubacar TRAORÉ (Comptable)' },
  { value: 'aminata_ouedraogo', label: 'Aminata OUÉDRAOGO (Assistante)' }
];

const projectManagers = [
  { value: 'serge_assale', label: 'Serge ASSALÉ (Directeur Création)' },
  { value: 'enos_gouba', label: 'Enos GOUBA (Coordinateur Production)' },
  { value: 'linda_kabore', label: 'Linda KABORÉ (Conceptrice Lead)' }
];

// Étapes du processus
const steps = [
  { id: 1, name: 'Informations', icon: Info, status: 'active' },
  { id: 2, name: 'Équipe', icon: Users, status: 'pending' },
  { id: 3, name: 'Planification', icon: Calendar, status: 'pending' },
  { id: 4, name: 'Validation', icon: CheckCircle, status: 'pending' }
];

function ProjectCreate() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    budget: '',
    deadline: '',
    type: '',
    description: '',
    projectManager: '',
    teamMembers: [] as string[]
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('CFA', 'FCFA');
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = projectTemplates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        type: template.type
      }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTeamMemberToggle = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(memberId)
        ? prev.teamMembers.filter(id => id !== memberId)
        : [...prev.teamMembers, memberId]
    }));
  };

  const handleSaveProject = () => {
    console.log('Sauvegarde du projet:', formData);
    // TODO: Implémenter la sauvegarde
  };

  const handleCreateProject = () => {
    console.log('Création du projet:', formData);
    // TODO: Implémenter la création
  };

  const selectedTemplateData = projectTemplates.find(t => t.id === selectedTemplate);
  const budgetValue = formData.budget ? parseInt(formData.budget) : 0;

  return (
    <div className="min-h-screen bg-[var(--jofe-white)]">
      <TopNavBar />
      <div className="lg:ml-72">
        
        <div className="w-full overflow-auto">
        {/* Header */}
        <header className="bg-[var(--jofe-white)] border-b border-[var(--jofe-gray)] px-4 md:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <Link href="/projects" className="p-2 hover:bg-[var(--jofe-gray)] rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-[var(--jofe-blue-medium)]" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-[var(--jofe-blue-deep)] jofe-font">
                  Création de Projet
                </h1>
                <p className="text-lg text-[var(--jofe-blue-medium)]">
                  Configurez un nouveau projet pour votre équipe
                </p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="border-[var(--jofe-blue-medium)] text-[var(--jofe-blue-medium)] hover:bg-[var(--jofe-blue-medium)] hover:text-white"
              onClick={() => window.history.back()}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>
        </header>

        {/* Contenu Principal */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Étapes de progression */}
          <div className="mb-8">
            <div className="flex justify-center">
              <div className="flex items-center space-x-8">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className="flex items-center relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                        step.status === 'active' 
                          ? 'bg-[var(--jofe-blue-medium)] text-white' 
                          : step.status === 'completed'
                          ? 'bg-[var(--jofe-green)] text-white'
                          : 'bg-white border-2 border-[var(--jofe-gray)] text-[var(--jofe-gray)]'
                      }`}>
                        {step.status === 'completed' ? (
                          <Check className="w-5 h-5" />
                        ) : step.status === 'active' ? (
                          <Icon className="w-5 h-5" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <span className={`ml-3 font-medium ${
                        step.status === 'active' 
                          ? 'text-[var(--jofe-blue-deep)]' 
                          : 'text-[var(--jofe-gray)]'
                      }`}>
                        {step.name}
                      </span>
                      {index < steps.length - 1 && (
                        <div className={`absolute left-full top-1/2 w-20 h-0.5 -translate-y-1/2 ml-8 ${
                          steps[index + 1].status === 'completed' ? 'bg-[var(--jofe-green)]' : 'bg-[var(--jofe-gray)]'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire Principal */}
            <div className="lg:col-span-2">
              <Card className="p-8 border border-[var(--jofe-gray)]">
                
                {/* Templates de Projet */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-[var(--jofe-blue-deep)] mb-4 jofe-font">
                    Templates de Projet
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projectTemplates.map((template) => {
                      const Icon = template.icon;
                      return (
                        <Card
                          key={template.id}
                          className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                            selectedTemplate === template.id
                              ? 'border-[var(--jofe-blue-medium)] bg-blue-50'
                              : 'border-[var(--jofe-gray)] hover:border-[var(--jofe-blue-light)]'
                          }`}
                          onClick={() => handleTemplateSelect(template.id)}
                          data-testid={`template-${template.id}`}
                        >
                          <div className="flex items-center mb-2">
                            <Icon className="w-6 h-6 mr-3 text-[var(--jofe-blue-medium)]" />
                            <h4 className="font-bold text-[var(--jofe-blue-deep)]">{template.name}</h4>
                          </div>
                          <p className="text-sm text-[var(--jofe-blue-medium)] mb-2">{template.description}</p>
                          <p className="text-xs text-gray-500">{template.details}</p>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Informations du Projet */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[var(--jofe-blue-deep)] jofe-font">
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
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="border-[var(--jofe-gray)] focus:border-[var(--jofe-blue-medium)]"
                        required
                        data-testid="input-project-name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-[var(--jofe-blue-deep)]">
                        Client *
                      </label>
                      <select
                        className="w-full border-2 border-[var(--jofe-gray)] rounded-md px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-medium)] bg-white"
                        value={formData.client}
                        onChange={(e) => handleInputChange('client', e.target.value)}
                        required
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
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="2500000"
                          value={formData.budget}
                          onChange={(e) => handleInputChange('budget', e.target.value)}
                          className="pl-10 border-[var(--jofe-gray)] focus:border-[var(--jofe-blue-medium)]"
                          required
                          data-testid="input-budget"
                        />
                        <DollarSign className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--jofe-green)]" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-[var(--jofe-blue-deep)]">
                        Date de Livraison *
                      </label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={formData.deadline}
                          onChange={(e) => handleInputChange('deadline', e.target.value)}
                          className="pl-10 border-[var(--jofe-gray)] focus:border-[var(--jofe-blue-medium)]"
                          required
                          data-testid="input-deadline"
                        />
                        <Calendar className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--jofe-orange)]" />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2 text-[var(--jofe-blue-deep)]">
                        Type de Projet
                      </label>
                      <select
                        className="w-full border-2 border-[var(--jofe-gray)] rounded-md px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-medium)] bg-white"
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        data-testid="select-project-type"
                      >
                        <option value="">Sélectionner le type</option>
                        {projectTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--jofe-blue-deep)]">
                      Description du Projet
                    </label>
                    <Textarea
                      rows={4}
                      placeholder="Décrivez les objectifs, livrables attendus et spécificités du projet..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="border-[var(--jofe-gray)] focus:border-[var(--jofe-blue-medium)]"
                      data-testid="textarea-description"
                    />
                  </div>

                  {/* Attribution de l'Équipe */}
                  <div>
                    <h4 className="text-lg font-bold text-[var(--jofe-blue-deep)] mb-4 jofe-font">
                      Attribution de l'Équipe
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--jofe-blue-deep)]">
                          Chef de Projet
                        </label>
                        <select
                          className="w-full border-2 border-[var(--jofe-gray)] rounded-md px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-medium)] bg-white"
                          value={formData.projectManager}
                          onChange={(e) => handleInputChange('projectManager', e.target.value)}
                          data-testid="select-project-manager"
                        >
                          <option value="">Sélectionner</option>
                          {projectManagers.map(manager => (
                            <option key={manager.value} value={manager.value}>{manager.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--jofe-blue-deep)]">
                          Équipe Créative
                        </label>
                        <div className="space-y-2 max-h-32 overflow-y-auto border border-[var(--jofe-gray)] rounded-lg p-2 bg-white">
                          {teamMembers.map(member => (
                            <label key={member.value} className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.teamMembers.includes(member.value)}
                                onChange={() => handleTeamMemberToggle(member.value)}
                                className="mr-2 text-[var(--jofe-blue-medium)]"
                                data-testid={`checkbox-${member.value}`}
                              />
                              <span className="text-sm">{member.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Résumé du Projet */}
              <Card className="p-6 border border-[var(--jofe-gray)]">
                <h3 className="text-lg font-bold text-[var(--jofe-blue-deep)] mb-4 jofe-font">
                  Résumé du Projet
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--jofe-blue-medium)]">Template:</span>
                    <span className="text-sm font-medium text-[var(--jofe-blue-deep)]">
                      {selectedTemplateData?.name || 'Non sélectionné'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--jofe-blue-medium)]">Budget:</span>
                    <span className="text-sm font-medium text-[var(--jofe-green)]">
                      {budgetValue > 0 ? formatCurrency(budgetValue) : '0 FCFA'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--jofe-blue-medium)]">Durée estimée:</span>
                    <span className="text-sm font-medium text-[var(--jofe-orange)]">
                      {selectedTemplateData?.duration || 'À définir'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[var(--jofe-blue-medium)]">Équipe:</span>
                    <span className="text-sm font-medium text-[var(--jofe-blue-deep)]">
                      {formData.teamMembers.length} membre(s)
                    </span>
                  </div>
                </div>
              </Card>

              {/* Actions Rapides */}
              <Card className="p-6 border border-[var(--jofe-gray)]">
                <h3 className="text-lg font-bold text-[var(--jofe-blue-deep)] mb-4 jofe-font">
                  Actions Rapides
                </h3>
                <div className="space-y-3">
                  <Button
                    onClick={handleSaveProject}
                    className="w-full bg-[var(--jofe-blue-medium)] hover:bg-[var(--jofe-blue-deep)] text-white"
                    data-testid="button-save"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                  <Button
                    onClick={handleCreateProject}
                    className="w-full bg-[var(--jofe-green)] hover:bg-green-600 text-white"
                    data-testid="button-create"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer le Projet
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-[var(--jofe-blue-medium)] text-[var(--jofe-blue-medium)] hover:bg-[var(--jofe-blue-medium)] hover:text-white"
                    data-testid="button-preview"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Prévisualiser
                  </Button>
                </div>
              </Card>

              {/* Projets Récents */}
              <Card className="p-6 border border-[var(--jofe-gray)]">
                <h3 className="text-lg font-bold text-[var(--jofe-blue-deep)] mb-4 jofe-font">
                  Projets Récents
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-[var(--jofe-blue-light)] flex items-center justify-center mr-3">
                      <Building className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--jofe-blue-deep)]">Campagne MOOV</p>
                      <p className="text-xs text-[var(--jofe-blue-medium)]">Terminé</p>
                    </div>
                  </div>
                  <div className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-[var(--jofe-green)] flex items-center justify-center mr-3">
                      <Palette className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--jofe-blue-deep)]">Logo ROXGOLD</p>
                      <p className="text-xs text-[var(--jofe-blue-medium)]">En cours</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

        </main>
        </div>
      </div>
    </div>
  );
}

export default ProjectCreate;