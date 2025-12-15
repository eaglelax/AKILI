import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import TopNavBar from '@/components/TopNavBar';
import {
  ArrowLeft,
  Edit,
  Share2,
  Clock,
  Users,
  CheckCircle,
  Calendar,
  Loader2,
  FileText,
  AlertCircle,
  RefreshCw,
  X,
  Copy,
  Mail,
  Link as LinkIcon,
  Check,
  Trash2,
  Download,
  File,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string | null;
  status: string;
  priority: string;
  progress: number;
  budget: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface Task {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  assignedTo: string | null;
  totalTimeSpent: number;
  totalCost: number;
  deadline: string | null;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  hourlyRate: string;
}

interface ProjectMember {
  id: string;
  memberId: string;
  projectRole: string;
  joinedAt: string;
  member: TeamMember;
}

function ProjectDetail() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]); // Tous les membres de l'équipe
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]); // Membres du projet
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // États pour les modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberRole, setMemberRole] = useState('');

  // État du formulaire d'édition
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    clientId: '',
    status: 'planning',
    priority: 'moyenne',
    budget: '',
    startDate: '',
    endDate: '',
    progress: 0,
  });

  // État pour les fichiers du projet
  const [projectFiles, setProjectFiles] = useState<Array<{
    id: string;
    fileName: string;
    originalName: string;
    fileType: string;
    mimeType: string;
    fileSize: number;
    description: string | null;
    createdAt: string;
  }>>([]);

  // Charger les données du projet depuis MySQL
  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  // Mettre à jour le formulaire quand le projet change
  useEffect(() => {
    if (project) {
      setEditForm({
        name: project.name || '',
        description: project.description || '',
        clientId: project.clientId || '',
        status: project.status || 'planning',
        priority: project.priority || 'moyenne',
        budget: project.budget || '',
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        endDate: project.endDate ? project.endDate.split('T')[0] : '',
        progress: project.progress || 0,
      });
    }
  }, [project]);

  const loadProjectData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Charger le projet
      const projectRes = await fetch(`/api/projects/${projectId}`, { credentials: "include" });

      if (projectRes.status === 401) {
        toast({
          title: "Session expirée",
          description: "Veuillez vous reconnecter",
          variant: "destructive",
        });
        setTimeout(() => { window.location.href = "/login"; }, 2000);
        return;
      }

      if (projectRes.status === 404) {
        setError("Projet non trouvé");
        return;
      }

      const projectData = await projectRes.json();

      if (projectData.success) {
        setProject(projectData.data);

        // Si le projet a un client, charger ses infos
        if (projectData.data.clientId) {
          const clientRes = await fetch(`/api/clients/${projectData.data.clientId}`, { credentials: "include" });
          const clientData = await clientRes.json();
          if (clientData.success) {
            setClient(clientData.data);
          }
        }

        // Charger tous les clients pour le formulaire d'édition
        const clientsRes = await fetch(`/api/clients`, { credentials: "include" });
        const clientsData = await clientsRes.json();
        if (clientsData.success) {
          setClients(clientsData.data || []);
        }

        // Charger les tâches du projet
        const tasksRes = await fetch(`/api/tasks?project=${projectId}`, { credentials: "include" });
        const tasksData = await tasksRes.json();
        if (tasksData.success) {
          setTasks(tasksData.data || []);
        }

        // Charger les membres de l'équipe (tous)
        const membersRes = await fetch(`/api/users`, { credentials: "include" });
        const membersData = await membersRes.json();
        if (membersData.success) {
          setMembers(membersData.data || []);
        }

        // Charger les membres du projet
        const projectMembersRes = await fetch(`/api/projects/${projectId}/members`, { credentials: "include" });
        const projectMembersData = await projectMembersRes.json();
        if (projectMembersData.success) {
          setProjectMembers(projectMembersData.data || []);
        }

        // Charger les fichiers du projet
        const filesRes = await fetch(`/api/projects/${projectId}/files`, { credentials: "include" });
        const filesData = await filesRes.json();
        if (filesData.success) {
          setProjectFiles(filesData.data || []);
        }
      } else {
        setError(projectData.message || "Erreur lors du chargement du projet");
      }
    } catch (err: any) {
      console.error("Erreur chargement projet:", err);
      setError("Impossible de charger le projet depuis la base de données");
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du projet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder les modifications du projet
  const handleSaveProject = async () => {
    if (!editForm.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du projet est requis",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: editForm.name,
        description: editForm.description || null,
        clientId: editForm.clientId || null,
        status: editForm.status,
        priority: editForm.priority,
        budget: editForm.budget || '0',
        startDate: editForm.startDate || null,
        endDate: editForm.endDate || null,
        progress: Number(editForm.progress),
      };

      console.log("Envoi mise à jour projet:", payload);

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Réponse mise à jour:", data);

      if (data.success) {
        toast({
          title: "Projet mis à jour",
          description: "Les modifications ont été enregistrées",
        });
        setIsEditModalOpen(false);
        loadProjectData(); // Recharger les données
      } else {
        // Afficher les détails de l'erreur
        let errorMsg = data.message || "Erreur lors de la mise à jour";
        if (data.errors && Array.isArray(data.errors)) {
          errorMsg = data.errors.map((e: any) => `${e.field}: ${e.message}`).join(", ");
        }
        console.error("Erreur validation projet:", data);
        toast({
          title: "Erreur",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Erreur mise à jour projet:", err);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le projet",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Copier le lien du projet
  const handleCopyLink = () => {
    const projectUrl = `${window.location.origin}/projects/${projectId}`;
    navigator.clipboard.writeText(projectUrl).then(() => {
      setLinkCopied(true);
      toast({
        title: "Lien copié",
        description: "Le lien du projet a été copié dans le presse-papiers",
      });
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  // Partager par email
  const handleShareByEmail = () => {
    const projectUrl = `${window.location.origin}/projects/${projectId}`;
    const subject = encodeURIComponent(`Projet: ${project?.name}`);
    const body = encodeURIComponent(`Bonjour,\n\nJe vous partage ce projet:\n\n${project?.name}\n${project?.description || ''}\n\nLien: ${projectUrl}\n\nCordialement`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  // Terminer le projet
  const handleCompleteProject = async () => {
    if (!project) return;

    const confirmed = window.confirm(`Êtes-vous sûr de vouloir marquer le projet "${project.name}" comme terminé?`);
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
          description: `Le projet "${project.name}" a été marqué comme terminé`,
        });
        loadProjectData(); // Recharger les données
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

  // Supprimer le projet (Admin uniquement)
  const handleDeleteProject = async () => {
    if (!project) return;

    const confirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ?\n\nATTENTION: Cette action supprimera également toutes les tâches et fichiers associés. Cette action est irréversible.`);
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
          description: `Le projet "${project.name}" a été supprimé`,
        });
        setLocation('/projects');
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

  // Télécharger un fichier
  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/projects/files/${fileId}/download`, {
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de télécharger le fichier",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Erreur lors du téléchargement",
        variant: "destructive",
      });
    }
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Ajouter un membre au projet
  const handleAddMember = async () => {
    if (!selectedMemberId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un membre",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          memberId: selectedMemberId,
          role: memberRole || 'Membre',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Membre ajouté",
          description: "Le membre a été ajouté au projet",
        });
        setIsAddMemberModalOpen(false);
        setSelectedMemberId('');
        setMemberRole('');
        loadProjectData(); // Recharger les données
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors de l'ajout du membre",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le membre",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Retirer un membre du projet
  const handleRemoveMember = async (memberId: string, memberName: string) => {
    const confirmed = window.confirm(`Êtes-vous sûr de vouloir retirer ${memberName} du projet ?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Membre retiré",
          description: `${memberName} a été retiré du projet`,
        });
        loadProjectData(); // Recharger les données
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors du retrait du membre",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de retirer le membre",
        variant: "destructive",
      });
    }
  };

  // Obtenir les membres disponibles (non encore dans le projet)
  const getAvailableMembers = () => {
    const projectMemberIds = projectMembers.map(pm => pm.memberId);
    return members.filter(m => !projectMemberIds.includes(m.id));
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR').format(num || 0) + ' FCFA';
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR');
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
      default:
        return status || 'Inconnu';
    }
  };

  const getMemberName = (memberId: string | null) => {
    if (!memberId) return 'Non assigné';
    const member = members.find(m => m.id === memberId);
    return member?.name || 'Inconnu';
  };

  const getMemberInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  // Calculer les statistiques du projet
  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'termine' || t.status === 'completed').length,
    inProgressTasks: tasks.filter(t => t.status === 'en_cours' || t.status === 'active').length,
    pendingTasks: tasks.filter(t => t.status === 'en_attente').length,
    totalTimeSpent: tasks.reduce((sum, t) => sum + (t.totalTimeSpent || 0), 0),
    totalCost: tasks.reduce((sum, t) => sum + (t.totalCost || 0), 0),
  };

  // Calculer les jours restants
  const getDaysRemaining = () => {
    if (!project?.endDate) return null;
    const end = new Date(project.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysRemaining = getDaysRemaining();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavBar />
        <div className="lg:ml-72 flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#37B6E9] mx-auto mb-4" />
            <p className="text-gray-600">Chargement du projet...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavBar />
        <div className="lg:ml-72 flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">{error || "Projet non trouvé"}</p>
            <Link href="/projects">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux projets
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavBar />

      <div className="lg:ml-72">
        {/* Header du projet */}
        <header className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <Link href="/projects">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold text-[#162C54]">{project.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(project.status)}`}>
                  {getStatusText(project.status)}
                </span>
              </div>

              <p className="text-gray-600 mb-4">{project.description || 'Aucune description'}</p>

              {/* Barre de progression */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progression du projet</span>
                  <span className="text-sm font-bold text-[#37B6E9]">{project.progress || 0}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#37B6E9] to-[#3475BB] rounded-full transition-all duration-500"
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-[#162C54]">{formatCurrency(project.budget)}</div>
                  <div className="text-sm text-gray-600">Budget</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-[#162C54]">
                    {daysRemaining !== null ? (daysRemaining >= 0 ? daysRemaining : 0) : '-'}
                  </div>
                  <div className="text-sm text-gray-600">Jours restants</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-[#162C54]">{projectMembers.length}</div>
                  <div className="text-sm text-gray-600">Membres</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.completedTasks}/{stats.totalTasks}
                  </div>
                  <div className="text-sm text-gray-600">Tâches</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button variant="outline" onClick={loadProjectData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Rafraîchir
              </Button>
              <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
              {project.status !== 'termine' && project.status !== 'completed' && (
                <Button
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                  onClick={handleCompleteProject}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Terminer
                </Button>
              )}
              {isAdmin && (
                <Button
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={handleDeleteProject}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              )}
              <Button className="bg-[#37B6E9] hover:bg-[#3475BB]" onClick={() => setIsShareModalOpen(true)}>
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </header>

        {/* Onglets */}
        <div className="bg-white border-b border-gray-200 px-6">
          <div className="flex overflow-x-auto">
            {[
              { id: 'overview', label: "Vue d'ensemble" },
              { id: 'tasks', label: 'Tâches' },
              { id: 'files', label: `Fichiers (${projectFiles.length})` },
              { id: 'budget', label: 'Budget' },
              { id: 'team', label: `Équipe (${projectMembers.length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#37B6E9] text-[#37B6E9]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu des onglets */}
        <main className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations du projet */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[#162C54] mb-4">Informations</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Client</span>
                    <span className="font-medium">{client?.name || 'Non défini'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Priorité</span>
                    <span className="font-medium capitalize">{project.priority || 'Normale'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date de début</span>
                    <span className="font-medium">{formatDate(project.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date de fin</span>
                    <span className="font-medium">{formatDate(project.endDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Créé le</span>
                    <span className="font-medium">{formatDate(project.createdAt)}</span>
                  </div>
                </div>
              </Card>

              {/* Statistiques des tâches */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[#162C54] mb-4">Statistiques</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{stats.completedTasks}</div>
                    <div className="text-sm text-gray-600">Terminées</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{stats.inProgressTasks}</div>
                    <div className="text-sm text-gray-600">En cours</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600">{stats.pendingTasks}</div>
                    <div className="text-sm text-gray-600">En attente</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">
                      {Math.floor(stats.totalTimeSpent / 3600)}h
                    </div>
                    <div className="text-sm text-gray-600">Temps total</div>
                  </div>
                </div>
              </Card>

              {/* Tâches récentes */}
              <Card className="p-6 lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#162C54]">Tâches récentes</h3>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('tasks')}>
                    Voir tout
                  </Button>
                </div>
                {tasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucune tâche pour ce projet</p>
                ) : (
                  <div className="space-y-3">
                    {tasks.slice(0, 5).map(task => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            task.status === 'termine' ? 'bg-green-500' :
                            task.status === 'en_cours' ? 'bg-blue-500' :
                            'bg-yellow-500'
                          }`} />
                          <div>
                            <p className="font-medium text-[#162C54]">{task.name}</p>
                            <p className="text-sm text-gray-600">{getMemberName(task.assignedTo)}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          task.status === 'termine' ? 'bg-green-100 text-green-800' :
                          task.status === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.status === 'termine' ? 'Terminée' :
                           task.status === 'en_cours' ? 'En cours' : 'En attente'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'tasks' && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-[#162C54]">Toutes les tâches ({tasks.length})</h3>
                <Link href={`/tasks?projectId=${projectId}&projectName=${encodeURIComponent(project?.name || '')}`}>
                  <Button className="bg-[#37B6E9] hover:bg-[#3475BB]">
                    + Nouvelle tâche
                  </Button>
                </Link>
              </div>

              {tasks.length === 0 ? (
                <p className="text-gray-500 text-center py-12">Aucune tâche pour ce projet</p>
              ) : (
                <div className="space-y-4">
                  {tasks.map(task => (
                    <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-[#162C54]">{task.name}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              task.priority === 'haute' || task.priority === 'critique' ? 'bg-red-100 text-red-800' :
                              task.priority === 'moyenne' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {task.priority || 'Normale'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{task.description || 'Pas de description'}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {getMemberName(task.assignedTo)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {Math.floor((task.totalTimeSpent || 0) / 3600)}h {Math.floor(((task.totalTimeSpent || 0) % 3600) / 60)}m
                            </span>
                            {task.deadline && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(task.deadline)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            task.status === 'termine' ? 'bg-green-100 text-green-800' :
                            task.status === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {task.status === 'termine' ? 'Terminée' :
                             task.status === 'en_cours' ? 'En cours' : 'En attente'}
                          </span>
                          <span className="text-sm font-medium text-[#37B6E9]">
                            {formatCurrency(task.totalCost || 0)}
                          </span>
                        </div>
                      </div>
                      {/* Barre de progression */}
                      <div className="mt-3">
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#37B6E9] rounded-full"
                            style={{ width: `${task.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {activeTab === 'files' && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-[#162C54]">Fichiers du projet ({projectFiles.length})</h3>
              </div>

              {projectFiles.length === 0 ? (
                <div className="text-center py-12">
                  <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun fichier attaché à ce projet</p>
                  <p className="text-sm text-gray-400 mt-2">Les fichiers peuvent être ajoutés lors de la création du projet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projectFiles.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-[#162C54]">{file.originalName}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{formatFileSize(file.fileSize)}</span>
                            <span>•</span>
                            <span className="capitalize">{file.fileType}</span>
                            <span>•</span>
                            <span>{formatDate(file.createdAt)}</span>
                          </div>
                          {file.description && (
                            <p className="text-sm text-gray-600 mt-1">{file.description}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadFile(file.id, file.originalName)}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Télécharger
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {activeTab === 'budget' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[#162C54] mb-4">Budget du projet</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Budget total</div>
                    <div className="text-2xl font-bold text-[#162C54]">{formatCurrency(project.budget)}</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Coût réalisé</div>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalCost)}</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Budget restant</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatCurrency(Math.max(0, (parseFloat(project.budget) || 0) - stats.totalCost))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[#162C54] mb-4">Répartition par tâche</h3>
                {tasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucune donnée de coût</p>
                ) : (
                  <div className="space-y-3">
                    {tasks.filter(t => t.totalCost > 0).map(task => (
                      <div key={task.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-[#162C54]">{task.name}</p>
                          <p className="text-sm text-gray-600">
                            {Math.floor((task.totalTimeSpent || 0) / 3600)}h de travail
                          </p>
                        </div>
                        <span className="font-semibold text-[#37B6E9]">{formatCurrency(task.totalCost)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'team' && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-[#162C54]">Équipe du projet ({projectMembers.length} membres)</h3>
                {isAdmin && (
                  <Button
                    className="bg-[#37B6E9] hover:bg-[#3475BB]"
                    onClick={() => setIsAddMemberModalOpen(true)}
                    disabled={getAvailableMembers().length === 0}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Ajouter un membre
                  </Button>
                )}
              </div>

              {projectMembers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun membre dans ce projet</p>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setIsAddMemberModalOpen(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Ajouter le premier membre
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projectMembers.map(pm => (
                    <div key={pm.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#37B6E9] flex items-center justify-center text-white font-bold">
                          {pm.member?.avatar || getMemberInitials(pm.member?.name || 'NN')}
                        </div>
                        <div>
                          <p className="font-semibold text-[#162C54]">{pm.member?.name || 'Membre inconnu'}</p>
                          <p className="text-sm text-gray-600">{pm.projectRole || pm.member?.role}</p>
                          <p className="text-xs text-[#37B6E9]">{formatCurrency(pm.member?.hourlyRate || '0')}/h</p>
                        </div>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => handleRemoveMember(pm.memberId, pm.member?.name || 'ce membre')}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Retirer du projet"
                        >
                          <UserMinus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </main>
      </div>

      {/* Modal Modifier le projet */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#162C54]">Modifier le projet</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du projet *
                </label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Nom du projet"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Description du projet"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37B6E9] focus:border-transparent"
                />
              </div>

              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client
                </label>
                <select
                  value={editForm.clientId}
                  onChange={(e) => setEditForm({ ...editForm, clientId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37B6E9] focus:border-transparent"
                >
                  <option value="">Aucun client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Statut et Priorité */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37B6E9] focus:border-transparent"
                  >
                    <option value="planning">Planification</option>
                    <option value="active">En cours</option>
                    <option value="paused">En pause</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priorité
                  </label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37B6E9] focus:border-transparent"
                  >
                    <option value="basse">Basse</option>
                    <option value="moyenne">Moyenne</option>
                    <option value="haute">Haute</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              {/* Budget et Progression */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget (FCFA)
                  </label>
                  <Input
                    type="number"
                    value={editForm.budget}
                    onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Progression (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={editForm.progress}
                    onChange={(e) => setEditForm({ ...editForm, progress: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de début
                  </label>
                  <Input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de fin
                  </label>
                  <Input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Annuler
              </Button>
              <Button
                className="bg-[#37B6E9] hover:bg-[#3475BB]"
                onClick={handleSaveProject}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Partager */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#162C54]">Partager le projet</h2>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-600">
                Partagez le projet "{project.name}" avec vos collaborateurs.
              </p>

              {/* Lien du projet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lien du projet
                </label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={`${window.location.origin}/projects/${projectId}`}
                    className="bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    onClick={handleCopyLink}
                    className={linkCopied ? 'bg-green-50 border-green-300 text-green-600' : ''}
                  >
                    {linkCopied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Options de partage */}
              <div className="space-y-3">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <LinkIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-[#162C54]">Copier le lien</p>
                    <p className="text-sm text-gray-600">Partagez le lien directement</p>
                  </div>
                </button>

                <button
                  onClick={handleShareByEmail}
                  className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-[#162C54]">Envoyer par email</p>
                    <p className="text-sm text-gray-600">Ouvrir votre client email</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex justify-end p-6 border-t border-gray-200">
              <Button variant="outline" onClick={() => setIsShareModalOpen(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajouter un membre */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#162C54]">Ajouter un membre</h2>
              <button
                onClick={() => {
                  setIsAddMemberModalOpen(false);
                  setSelectedMemberId('');
                  setMemberRole('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {getAvailableMembers().length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Tous les membres de l'équipe sont déjà dans ce projet.
                </p>
              ) : (
                <>
                  {/* Sélection du membre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Membre *
                    </label>
                    <select
                      value={selectedMemberId}
                      onChange={(e) => setSelectedMemberId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37B6E9] focus:border-transparent"
                    >
                      <option value="">Sélectionner un membre...</option>
                      {getAvailableMembers().map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name} - {member.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rôle dans le projet */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rôle dans le projet (optionnel)
                    </label>
                    <Input
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value)}
                      placeholder="Ex: Chef de projet, Développeur, Designer..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Si non spécifié, le rôle par défaut sera "Membre"
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddMemberModalOpen(false);
                  setSelectedMemberId('');
                  setMemberRole('');
                }}
              >
                Annuler
              </Button>
              {getAvailableMembers().length > 0 && (
                <Button
                  className="bg-[#37B6E9] hover:bg-[#3475BB]"
                  onClick={handleAddMember}
                  disabled={saving || !selectedMemberId}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Ajout...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Ajouter
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetail;
