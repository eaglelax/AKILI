import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Building, 
  CheckCircle, 
  Clock, 
  DollarSign,
  AlertCircle,
  Filter,
  ChevronDown,
  Play,
  Pause,
  MessageSquare,
  Users,
  Heart,
  Video
} from 'lucide-react';
import TopNavBar from '@/components/TopNavBar';
import AdminFloatingMenu from '@/components/AdminFloatingMenu';
import { Link } from 'wouter';

// Données simulées pour les projets
const projectsData = {
  stats: {
    active: 23,
    completed: 12,
    budget: 45200000,
    delayed: 3
  },
  
  projects: [
    {
      id: 1,
      title: 'Campagne 360° MOOV AFRICA',
      client: 'MOOV AFRICA',
      status: 'active',
      progress: 75,
      budget: 5200000,
      deadline: '15 Fév 2025',
      tasks: 12,
      comments: 8,
      team: ['PO', 'FY', 'BP', '+2'],
      type: 'campaign',
      description: 'Campagne marketing intégrée multi-canaux'
    },
    {
      id: 2,
      title: 'Identité Visuelle ROXGOLD',
      client: 'ROXGOLD',
      status: 'completed',
      progress: 100,
      budget: 1800000,
      deadline: '28 Jan 2025',
      deliveredDate: '28 Jan 2025',
      tasks: 8,
      satisfaction: 95,
      team: ['PO', 'JS', 'LK'],
      type: 'branding',
      description: 'Refonte complète de l\'identité visuelle'
    },
    {
      id: 3,
      title: 'Vidéo Corporate BANK OF AFRICA',
      client: 'BANK OF AFRICA',
      status: 'active',
      progress: 45,
      budget: 3500000,
      deadline: '22 Fév 2025',
      tasks: 15,
      timeLeft: '2j restant',
      team: ['FY', 'BP', 'NW', 'MB'],
      type: 'video',
      description: 'Production vidéo institutionnelle'
    },
    {
      id: 4,
      title: 'Stratégie Digitale SUNU BURKINA',
      client: 'SUNU BURKINA',
      status: 'paused',
      progress: 20,
      budget: 2300000,
      deadline: '08 Mar 2025',
      tasks: 6,
      note: 'En attente client',
      team: ['FK', 'NW', 'LK'],
      type: 'strategy',
      description: 'Élaboration de la stratégie digitale'
    }
  ]
};

const clients = [
  'MOOV AFRICA',
  'BANK OF AFRICA',
  'SUNU BURKINA',
  'ROXGOLD',
  'TOTAL BURKINA',
  'ORANGE BURKINA'
];

function Projects() {
  const [selectedFilter, setSelectedFilter] = useState<string>('tous');
  const [selectedClient, setSelectedClient] = useState<string>('tous');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('CFA', 'FCFA');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'completed':
        return 'Terminé';
      case 'paused':
        return 'En pause';
      default:
        return 'Inconnu';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'from-green-500 to-green-600';
    if (progress >= 40) return 'from-blue-500 to-blue-600';
    return 'from-orange-500 to-red-500';
  };

  const getProjectIcon = (type: string) => {
    switch (type) {
      case 'campaign':
        return <Building className="w-6 h-6 text-white" />;
      case 'branding':
        return <CheckCircle className="w-6 h-6 text-white" />;
      case 'video':
        return <Video className="w-6 h-6 text-white" />;
      case 'strategy':
        return <Pause className="w-6 h-6 text-white" />;
      default:
        return <Building className="w-6 h-6 text-white" />;
    }
  };

  const getProjectIconBg = (type: string, status: string) => {
    if (status === 'completed') return 'from-green-500 to-green-600';
    switch (type) {
      case 'campaign':
        return 'from-[var(--jofe-blue-medium)] to-[var(--jofe-blue-light)]';
      case 'video':
        return 'from-orange-500 to-yellow-500';
      case 'strategy':
        return 'from-gray-500 to-gray-600';
      default:
        return 'from-[var(--jofe-blue-medium)] to-[var(--jofe-blue-light)]';
    }
  };

  const filteredProjects = projectsData.projects.filter(project => {
    const matchesFilter = selectedFilter === 'tous' || project.status === selectedFilter;
    const matchesClient = selectedClient === 'tous' || project.client === selectedClient;
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesClient && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[var(--jofe-white)]">
      <TopNavBar />
      <div className="ml-72">
        <AdminFloatingMenu />
        
        <div className="w-full overflow-auto">
        {/* Header */}
        <header className="bg-[var(--jofe-white)] border-b border-[var(--jofe-gray)] px-4 md:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="p-2 hover:bg-[var(--jofe-gray)] rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-[var(--jofe-blue-medium)]" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-[var(--jofe-blue-deep)] jofe-font">
                  Gestion des Projets
                </h1>
                <p className="text-sm text-gray-600">
                  Vue d'ensemble de tous les projets actifs et terminés
                </p>
              </div>
            </div>
            
            <Button className="bg-[var(--jofe-blue-medium)] hover:bg-[var(--jofe-blue-deep)] text-white flex items-center space-x-2" data-testid="button-new-project">
              <Plus className="w-5 h-5" />
              <span>Nouveau Projet</span>
            </Button>
          </div>
        </header>

        {/* Contenu Principal */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-[var(--jofe-blue-deep)] to-[var(--jofe-blue-night)] text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Projets Actifs</p>
                  <p className="text-2xl font-bold">{projectsData.stats.active}</p>
                </div>
                <Building className="w-8 h-8 text-blue-200" />
              </div>
            </Card>

            <Card className="p-6 border border-[var(--jofe-gray)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Terminés ce mois</p>
                  <p className="text-2xl font-bold text-green-600">{projectsData.stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6 border border-[var(--jofe-gray)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Budget Total</p>
                  <p className="text-2xl font-bold text-[var(--jofe-blue-medium)]">
                    {(projectsData.stats.budget / 1000000).toFixed(1)}M FCFA
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6 border border-[var(--jofe-gray)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">En retard</p>
                  <p className="text-2xl font-bold text-orange-600">{projectsData.stats.delayed}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
            </Card>
          </div>

          {/* Filtres et Recherche */}
          <Card className="p-6 mb-8 border border-[var(--jofe-gray)]">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-gray-700 flex items-center">
                  <Filter className="w-4 h-4 mr-1" />
                  Filtrer par:
                </span>
                {['tous', 'active', 'completed', 'paused'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedFilter === filter
                        ? 'bg-[var(--jofe-blue-medium)] text-white'
                        : 'bg-white border border-[var(--jofe-gray)] text-[var(--jofe-blue-medium)] hover:bg-[var(--jofe-gray)]'
                    }`}
                    data-testid={`filter-${filter}`}
                  >
                    {filter === 'tous' ? 'Tous' : 
                     filter === 'active' ? 'Actifs' :
                     filter === 'completed' ? 'Terminés' :
                     filter === 'paused' ? 'En pause' : filter}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <select 
                    className="appearance-none bg-white border border-[var(--jofe-gray)] rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--jofe-blue-light)] focus:border-transparent"
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    data-testid="select-client"
                  >
                    <option value="tous">Tous les clients</option>
                    {clients.map(client => (
                      <option key={client} value={client}>{client}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Rechercher un projet..."
                    className="pl-10 w-64 border-[var(--jofe-gray)] focus:border-[var(--jofe-blue-medium)] focus:ring-[var(--jofe-blue-light)]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    data-testid="input-search"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Grille des Projets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="p-6 border-l-4 border-l-[var(--jofe-blue-medium)] hover:shadow-lg transition-all duration-300 hover:-translate-y-1" data-testid={`card-project-${project.id}`}>
                {/* En-tête du projet */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${getProjectIconBg(project.type, project.status)}`}>
                      {getProjectIcon(project.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[var(--jofe-blue-deep)]">{project.title}</h3>
                      <p className="text-gray-600 text-sm">Client: {project.client}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                </div>

                {/* Progression */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Progression</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--jofe-gray)] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(project.progress)} transition-all duration-500`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Budget et Deadline */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Budget</p>
                    <p className={`font-bold ${project.status === 'completed' ? 'text-green-600' : 'text-[var(--jofe-blue-medium)]'}`}>
                      {formatCurrency(project.budget)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {project.status === 'completed' ? 'Livré le' : 'Deadline'}
                    </p>
                    <p className={`font-bold ${project.status === 'completed' ? 'text-green-600' : 
                                  project.timeLeft ? 'text-blue-600' : 'text-orange-600'}`}>
                      {project.deliveredDate || project.deadline}
                    </p>
                  </div>
                </div>

                {/* Équipe assignée */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Équipe assignée</p>
                  <div className="flex -space-x-2">
                    {project.team.map((member, index) => (
                      <div key={index} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white ${
                        member.startsWith('+') ? 'bg-gray-300 text-gray-700' : 'bg-gradient-to-br from-[var(--jofe-blue-medium)] to-[var(--jofe-blue-light)] text-white'
                      }`}>
                        {member}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statistiques et Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{project.tasks} tâches</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {project.status === 'completed' ? (
                        <>
                          <Heart className="w-4 h-4" />
                          <span>{project.satisfaction}% satisfaction</span>
                        </>
                      ) : project.timeLeft ? (
                        <>
                          <Clock className="w-4 h-4" />
                          <span>{project.timeLeft}</span>
                        </>
                      ) : project.note ? (
                        <>
                          <Play className="w-4 h-4" />
                          <span>{project.note}</span>
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4" />
                          <span>{project.comments} commentaires</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Link href={`/projects/${project.id}`}>
                    <Button variant="outline" size="sm" className="border-[var(--jofe-gray)] text-[var(--jofe-blue-medium)] hover:bg-[var(--jofe-gray)]" data-testid={`btn-details-${project.id}`}>
                      Voir détails
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* Charger plus */}
          <div className="text-center mt-8">
            <Button variant="outline" className="border-[var(--jofe-gray)] text-[var(--jofe-blue-medium)] hover:bg-[var(--jofe-gray)]">
              Charger plus de projets
            </Button>
          </div>

        </main>
        </div>
      </div>
    </div>
  );
}

export default Projects;