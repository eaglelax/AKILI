import { useState, useEffect, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
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
  Video,
  Loader2,
  RefreshCw,
  Trash2
} from 'lucide-react';
import TopNavBar from '@/components/TopNavBar';
import { Link } from 'wouter';

interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  clientName?: string;
  status: string;
  progress: number;
  budget: number;
  startDate: string;
  endDate: string;
  type?: string;
}

interface Client {
  id: string;
  name: string;
}

function Projects() {
  const { toast } = useToast();
  const { isAdmin, user } = useAuth();

  // Vérifier le rôle de l'utilisateur
  const userRole = (user as any)?.userRole || 'member';
  const isAdminRole = userRole === 'admin' || userRole === 'super_admin';

  // État pour les données chargées depuis MySQL
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFilter, setSelectedFilter] = useState<string>('tous');
  const [selectedClient, setSelectedClient] = useState<string>('tous');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Charger les projets et clients depuis MySQL
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Utiliser fetch directement pour éviter les erreurs lancées par apiRequest
      const [projectsRes, clientsRes] = await Promise.all([
        fetch("/api/projects", { credentials: "include" }),
        fetch("/api/clients", { credentials: "include" }),
      ]);

      // Vérifier si une erreur 401 (non authentifié)
      if (projectsRes.status === 401 || clientsRes.status === 401) {
        setError("Session expirée. Veuillez vous reconnecter.");
        toast({
          title: "Session expirée",
          description: "Veuillez vous reconnecter pour accéder aux données",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return;
      }

      const projectsData = await projectsRes.json();
      const clientsData = await clientsRes.json();

      if (projectsData.success) {
        setProjects(projectsData.data || []);
      }
      if (clientsData.success) {
        setClients(clientsData.data || []);
      }
    } catch (err: any) {
      console.error("Erreur chargement données:", err);
      setError("Impossible de charger les données depuis la base de données");
      toast({
        title: "Erreur",
        description: "Impossible de charger les projets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Statistiques calculées depuis les données MySQL
  const stats = useMemo(() => {
    // Projets actifs : active, en_cours, planning (projet démarré mais pas encore terminé)
    const active = projects.filter(p =>
      p.status === 'active' ||
      p.status === 'en_cours' ||
      p.status === 'planning'
    ).length;

    // Projets terminés
    const completed = projects.filter(p =>
      p.status === 'completed' ||
      p.status === 'termine'
    ).length;

    // Budget total de tous les projets
    const budget = projects.reduce((sum, p) => sum + (parseFloat(String(p.budget)) || 0), 0);

    // Projets en retard : deadline dépassée et non terminés
    const delayed = projects.filter(p => {
      if (!p.endDate) return false;
      const endDate = new Date(p.endDate);
      const now = new Date();
      const isOverdue = endDate < now;
      const isNotCompleted = p.status !== 'completed' && p.status !== 'termine';
      return isOverdue && isNotCompleted;
    }).length;

    // Projets en pause
    const paused = projects.filter(p =>
      p.status === 'paused' ||
      p.status === 'en_pause'
    ).length;

    return { active, completed, budget, delayed, paused };
  }, [projects]);

  // Obtenir le nom du client
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || "Client inconnu";
  };

  // Terminer un projet
  const handleCompleteProject = async (projectId: string, projectName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(`Êtes-vous sûr de vouloir marquer le projet "${projectName}" comme terminé?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: 'completed',
          progress: 100,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Projet terminé",
          description: `Le projet "${projectName}" a été marqué comme terminé`,
        });
        loadData(); // Recharger les données
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors de la mise à jour du projet",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de terminer le projet",
        variant: "destructive",
      });
    }
  };

  // Supprimer un projet (Admin uniquement)
  const handleDeleteProject = async (projectId: string, projectName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer le projet "${projectName}" ?\n\nATTENTION: Cette action supprimera également toutes les tâches associées. Cette action est irréversible.`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Projet supprimé",
          description: `Le projet "${projectName}" a été supprimé`,
        });
        loadData();
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors de la suppression du projet",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le projet",
        variant: "destructive",
      });
    }
  };

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
      case 'en_cours':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
      case 'termine':
        return 'bg-emerald-100 text-emerald-800';
      case 'paused':
      case 'en_pause':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'annule':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
      case 'en_cours':
        return 'En cours';
      case 'planning':
        return 'Planification';
      case 'completed':
      case 'termine':
        return 'Terminé';
      case 'paused':
      case 'en_pause':
        return 'En pause';
      case 'cancelled':
      case 'annule':
        return 'Annulé';
      case 'en_attente':
        return 'En attente';
      default:
        return status || 'Inconnu';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'from-green-500 to-green-600';
    if (progress >= 40) return 'from-blue-500 to-blue-600';
    return 'from-orange-500 to-red-500';
  };

  const getProjectIcon = (type: string | undefined) => {
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

  const getProjectIconBg = (type: string | undefined, status: string) => {
    if (status === 'completed' || status === 'termine') return 'from-green-500 to-green-600';
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

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Normaliser les statuts pour le filtrage
      const normalizedStatus = (() => {
        switch (project.status) {
          case 'en_cours':
          case 'active':
          case 'planning': // planning est considéré comme actif
            return 'active';
          case 'termine':
          case 'completed':
            return 'completed';
          case 'en_pause':
          case 'paused':
            return 'paused';
          case 'annule':
          case 'cancelled':
            return 'cancelled';
          default:
            return project.status;
        }
      })();

      // Filtrage par statut
      const matchesFilter = selectedFilter === 'tous' || normalizedStatus === selectedFilter;

      // Filtrage par client
      const matchesClient = selectedClient === 'tous' || project.clientId === selectedClient;

      // Recherche par nom de projet ou nom de client
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        project.name.toLowerCase().includes(searchLower) ||
        (project.description || '').toLowerCase().includes(searchLower) ||
        getClientName(project.clientId).toLowerCase().includes(searchLower);

      return matchesFilter && matchesClient && matchesSearch;
    });
  }, [projects, selectedFilter, selectedClient, searchTerm, clients]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--jofe-white)]">
        <TopNavBar />
        <div className="lg:ml-72 flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#37B6E9] mx-auto mb-4" />
            <p className="text-gray-600">Chargement des projets depuis MySQL...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--jofe-white)]">
      <TopNavBar />
      <div className="lg:ml-72">

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
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Rafraîchir"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              {/* Bouton Nouveau Projet visible uniquement pour les admins */}
              {isAdmin && (
                <Link href="/projects/create">
                  <Button className="bg-[var(--jofe-blue-medium)] hover:bg-[var(--jofe-blue-deep)] text-white flex items-center space-x-2" data-testid="button-new-project">
                    <Plus className="w-5 h-5" />
                    <span>Nouveau Projet</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Contenu Principal */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p>{error}</p>
              <button onClick={loadData} className="underline mt-2">Réessayer</button>
            </div>
          )}

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-[var(--jofe-blue-deep)] to-[var(--jofe-blue-night)] text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Projets Actifs</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
                <Building className="w-8 h-8 text-blue-200" />
              </div>
            </Card>

            <Card className="p-6 border border-[var(--jofe-gray)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Terminés</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            {/* Budget Total - Visible uniquement pour admin et super_admin */}
            {isAdminRole && (
              <Card className="p-6 border border-[var(--jofe-gray)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Budget Total</p>
                    <p className="text-2xl font-bold text-[var(--jofe-blue-medium)]">
                      {(stats.budget / 1000000).toFixed(1)}M FCFA
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </Card>
            )}

            <Card className="p-6 border border-[var(--jofe-gray)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">En retard</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.delayed}</p>
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
                      <option key={client.id} value={client.id}>{client.name}</option>
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
                      <h3 className="font-bold text-lg text-[var(--jofe-blue-deep)]">{project.name}</h3>
                      <p className="text-gray-600 text-sm">Client: {getClientName(project.clientId)}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                )}

                {/* Progression */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Progression</span>
                    <span>{project.progress || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--jofe-gray)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(project.progress || 0)} transition-all duration-500`}
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Budget et Deadline */}
                <div className={`grid ${isAdminRole ? 'grid-cols-2' : 'grid-cols-1'} gap-4 mb-4`}>
                  {/* Budget - Visible uniquement pour admin et super_admin */}
                  {isAdminRole && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Budget</p>
                      <p className={`font-bold ${(project.status === 'completed' || project.status === 'termine') ? 'text-green-600' : 'text-[var(--jofe-blue-medium)]'}`}>
                        {formatCurrency(parseFloat(String(project.budget)) || 0)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {(project.status === 'completed' || project.status === 'termine') ? 'Terminé le' : 'Deadline'}
                    </p>
                    <p className={`font-bold ${(project.status === 'completed' || project.status === 'termine') ? 'text-green-600' : 'text-orange-600'}`}>
                      {project.endDate ? new Date(project.endDate).toLocaleDateString('fr-FR') : '-'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {project.startDate
                          ? `Démarré le ${new Date(project.startDate).toLocaleDateString('fr-FR')}`
                          : 'Non démarré'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Boutons d'action visibles uniquement pour les admins */}
                    {isAdmin && project.status !== 'termine' && project.status !== 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={(e) => handleCompleteProject(project.id, project.name, e)}
                        data-testid={`btn-complete-${project.id}`}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Terminer
                      </Button>
                    )}
                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={(e) => handleDeleteProject(project.id, project.name, e)}
                        data-testid={`btn-delete-${project.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Supprimer
                      </Button>
                    )}
                    {/* Bouton Voir détails visible pour tous */}
                    <Link href={`/projects/${project.id}`}>
                      <Button variant="outline" size="sm" className="border-[var(--jofe-gray)] text-[var(--jofe-blue-medium)] hover:bg-[var(--jofe-gray)]" data-testid={`btn-details-${project.id}`}>
                        Voir détails
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <Building className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">Aucun projet trouvé dans la base de données</p>
              <p className="text-gray-400 text-sm mt-2">Créez un nouveau projet pour commencer</p>
            </div>
          )}

          {/* Charger plus */}
          {filteredProjects.length > 0 && (
            <div className="text-center mt-8">
              <Button
                variant="outline"
                className="border-[var(--jofe-gray)] text-[var(--jofe-blue-medium)] hover:bg-[var(--jofe-gray)]"
                onClick={loadData}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Rafraîchir les projets
              </Button>
            </div>
          )}

        </main>
        </div>
      </div>
    </div>
  );
}

export default Projects;
