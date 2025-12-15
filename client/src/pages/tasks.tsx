import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Clock,
  User,
  Building2,
  Calendar,
  AlertCircle,
  Play,
  Pause,
  CheckCircle,
  MoreHorizontal,
  Edit,
  Eye,
  Filter,
  Upload,
  ChevronDown,
  DollarSign,
  Loader2,
  FolderOpen,
  Trash2
} from "lucide-react";
import TopNavBar from "@/components/TopNavBar";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

// Types pour les tâches avec chronométrage
interface Task {
  id: string;
  name: string;
  description: string;
  assignedTo: string;
  assignedToName?: string;
  clientId: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  priority: "critique" | "elevee" | "normale" | "basse";
  deadline: string;
  status: "en_cours" | "en_pause" | "termine" | "en_attente";
  totalTimeSpent: number; // en secondes
  hourlyRate: number;
  totalCost: number;
  progress: number;
  isTimerActive: boolean;
  timerStartedAt?: string;
  createdAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  hourlyRate: string;
}

interface Client {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
}

export default function Tasks() {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [location] = useLocation();

  // États pour les données chargées depuis MySQL
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editTask, setEditTask] = useState<{
    name: string;
    description: string;
    assignedTo: string;
    clientId: string;
    projectId: string;
    priority: string;
    deadline: string;
    progress: number;
    status: string;
  }>({
    name: "",
    description: "",
    assignedTo: "",
    clientId: "",
    projectId: "",
    priority: "normale",
    deadline: "",
    progress: 0,
    status: "en_attente",
  });

  // État pour le projet pré-sélectionné (depuis URL)
  const [preselectedProject, setPreselectedProject] = useState<{ id: string; name: string } | null>(null);

  // Filtres pour le tableau
  const [memberFilter, setMemberFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Form state pour nouvelle tâche
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    assignedTo: "",
    clientId: "",
    projectId: "",
    priority: "normale" as const,
    deadline: "",
    estimatedHours: "",
  });

  // Lire les paramètres URL au chargement
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectIdParam = urlParams.get('projectId');
    const projectNameParam = urlParams.get('projectName');

    if (projectIdParam) {
      setPreselectedProject({
        id: projectIdParam,
        name: projectNameParam ? decodeURIComponent(projectNameParam) : 'Projet'
      });
      // Pré-remplir le formulaire avec le projet
      setNewTask(prev => ({ ...prev, projectId: projectIdParam }));
      // Ouvrir automatiquement le modal
      setIsNewTaskModalOpen(true);
    }
  }, []);

  // Charger les données depuis MySQL via l'API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Charger les tâches, membres, clients et projets en parallèle
      // Utiliser fetch directement pour éviter les erreurs lancées par apiRequest
      const [tasksRes, membersRes, clientsRes, projectsRes] = await Promise.all([
        fetch("/api/tasks", { credentials: "include" }),
        fetch("/api/users", { credentials: "include" }),
        fetch("/api/clients", { credentials: "include" }),
        fetch("/api/projects", { credentials: "include" }),
      ]);

      // Vérifier si une erreur 401 (non authentifié)
      if (tasksRes.status === 401 || membersRes.status === 401 || clientsRes.status === 401 || projectsRes.status === 401) {
        setError("Session expirée. Veuillez vous reconnecter.");
        toast({
          title: "Session expirée",
          description: "Veuillez vous reconnecter pour accéder aux données",
          variant: "destructive",
        });
        // Rediriger vers la page de connexion après un délai
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return;
      }

      const tasksData = await tasksRes.json();
      const membersData = await membersRes.json();
      const clientsData = await clientsRes.json();
      const projectsData = await projectsRes.json();

      // Vérifier les erreurs dans les réponses
      if (!tasksRes.ok) {
        console.error("Erreur tâches:", tasksData);
      }
      if (!membersRes.ok) {
        console.error("Erreur membres:", membersData);
      }
      if (!clientsRes.ok) {
        console.error("Erreur clients:", clientsData);
      }
      if (!projectsRes.ok) {
        console.error("Erreur projets:", projectsData);
      }

      if (tasksData.success) {
        setTasks(tasksData.data || []);
      }
      if (membersData.success) {
        setTeamMembers(membersData.data || []);
      }
      if (clientsData.success) {
        setClients(clientsData.data || []);
      }
      if (projectsData.success) {
        setProjects(projectsData.data || []);
      }
    } catch (err: any) {
      console.error("Erreur chargement données:", err);
      setError("Erreur lors du chargement des données: " + (err.message || "Erreur inconnue"));
      toast({
        title: "Erreur",
        description: "Impossible de charger les données depuis la base de données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour des chronos en temps réel pour les tâches avec timer actif
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks =>
        prevTasks.map(task => {
          if (task.isTimerActive && task.timerStartedAt) {
            const startTime = new Date(task.timerStartedAt).getTime();
            const now = Date.now();
            const elapsed = Math.floor((now - startTime) / 1000);
            const newTimeSpent = task.totalTimeSpent + elapsed;
            const newTotalCost = Math.floor((newTimeSpent / 3600) * task.hourlyRate);
            return {
              ...task,
              totalTimeSpent: newTimeSpent,
              totalCost: newTotalCost
            };
          }
          return task;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Logique de filtrage pour le tableau
  const filteredTasks = tasks.filter(task => {
    if (memberFilter !== "all" && task.assignedTo !== memberFilter) return false;
    if (clientFilter !== "all" && task.clientId !== clientFilter) return false;
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    if (startDate && new Date(task.deadline) < new Date(startDate)) return false;
    if (endDate && new Date(task.deadline) > new Date(endDate)) return false;
    return true;
  });

  // Formatage du temps (secondes vers HH:MM:SS)
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Mapper les statuts de la BDD aux statuts d'affichage
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "en_cours": return { label: "En cours", class: "bg-blue-100 text-blue-800" };
      case "en_pause": return { label: "En pause", class: "bg-yellow-100 text-yellow-800" };
      case "termine": return { label: "Terminé", class: "bg-green-100 text-green-800" };
      case "en_attente": return { label: "En attente", class: "bg-gray-100 text-gray-800" };
      default: return { label: status, class: "bg-gray-100 text-gray-800" };
    }
  };

  // Contrôle des timers via API
  const toggleTimer = async (taskId: string, currentStatus: string) => {
    try {
      const endpoint = currentStatus === "en_cours"
        ? `/api/tasks/${taskId}/stop-timer`
        : `/api/tasks/${taskId}/start-timer`;

      const response = await apiRequest("POST", endpoint);
      const data = await response.json();

      if (data.success) {
        toast({
          title: currentStatus === "en_cours" ? "Timer arrêté" : "Timer démarré",
          description: data.message,
        });
        // Recharger les tâches
        loadData();
      } else {
        toast({
          title: "Erreur",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le timer",
        variant: "destructive",
      });
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      const response = await apiRequest("PUT", `/api/tasks/${taskId}`, {
        status: "termine",
        progress: 100,
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Tâche terminée",
          description: "La tâche a été marquée comme terminée",
        });
        loadData();
      } else {
        toast({
          title: "Erreur",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de terminer la tâche",
        variant: "destructive",
      });
    }
  };

  // Créer une nouvelle tâche
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTask.name || !newTask.assignedTo) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      // Préparer les données avec les bons formats
      const taskPayload = {
        name: newTask.name,
        description: newTask.description || '',
        assignedTo: newTask.assignedTo || null,
        clientId: newTask.clientId || null,
        projectId: newTask.projectId || null,
        priority: newTask.priority || 'normale',
        deadline: newTask.deadline || null,
        estimatedHours: newTask.estimatedHours || null,
        status: "en_attente",
      };

      console.log("Envoi des données tâche:", taskPayload);

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(taskPayload),
      });

      const data = await response.json();

      // Log pour débogage
      console.log("Réponse création tâche:", data);

      if (data.success) {
        toast({
          title: "Tâche créée",
          description: preselectedProject
            ? `La tâche a été créée et liée au projet "${preselectedProject.name}"`
            : "La tâche a été créée avec succès",
        });
        setIsNewTaskModalOpen(false);
        // Nettoyer l'URL si on vient d'un projet
        if (preselectedProject) {
          window.history.replaceState({}, '', '/tasks');
          setPreselectedProject(null);
        }
        setNewTask({
          name: "",
          description: "",
          assignedTo: "",
          clientId: "",
          projectId: "",
          priority: "normale",
          deadline: "",
          estimatedHours: "",
        });
        loadData();
      } else {
        // Afficher les détails de l'erreur
        let errorMsg = data.message || "Erreur inconnue";
        if (data.errors && Array.isArray(data.errors)) {
          errorMsg = data.errors.map((e: any) => `${e.field}: ${e.message}`).join(", ");
        }
        console.error("Erreur validation:", data);
        toast({
          title: "Erreur de validation",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Erreur création tâche:", err);
      toast({
        title: "Erreur",
        description: err.message || "Impossible de créer la tâche",
        variant: "destructive",
      });
    }
  };

  // Ouvrir le modal de visualisation
  const openViewModal = (task: Task) => {
    setSelectedTask(task);
    setIsViewModalOpen(true);
  };

  // Ouvrir le modal d'édition
  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setEditTask({
      name: task.name,
      description: task.description || "",
      assignedTo: task.assignedTo || "",
      clientId: task.clientId || "",
      projectId: task.projectId || "",
      priority: task.priority,
      deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : "",
      progress: task.progress || 0,
      status: task.status,
    });
    setIsEditModalOpen(true);
  };

  // Sauvegarder les modifications
  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTask) return;

    try {
      const response = await apiRequest("PUT", `/api/tasks/${selectedTask.id}`, {
        name: editTask.name,
        description: editTask.description || null,
        assignedTo: editTask.assignedTo || null,
        clientId: editTask.clientId || null,
        projectId: editTask.projectId || null,
        priority: editTask.priority,
        deadline: editTask.deadline || null,
        progress: editTask.progress,
        status: editTask.status,
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Tâche mise à jour",
          description: "Les modifications ont été enregistrées",
        });
        setIsEditModalOpen(false);
        setSelectedTask(null);
        loadData();
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors de la mise à jour",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la tâche",
        variant: "destructive",
      });
    }
  };

  // Supprimer une tâche (Admin uniquement)
  const handleDeleteTask = async (taskId: string, taskName: string) => {
    const confirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${taskName}" ?\nCette action est irréversible.`);
    if (!confirmed) return;

    try {
      const response = await apiRequest("DELETE", `/api/tasks/${taskId}`);
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Tâche supprimée",
          description: `La tâche "${taskName}" a été supprimée`,
        });
        loadData();
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors de la suppression",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la tâche",
        variant: "destructive",
      });
    }
  };

  // Obtenir le nom du membre assigné
  const getMemberName = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    return member?.name || "Non assigné";
  };

  // Obtenir le nom du client
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || "-";
  };

  // Obtenir le nom du projet
  const getProjectName = (projectId: string | undefined, projectName?: string) => {
    if (projectName) return projectName;
    if (!projectId) return "-";
    const project = projects.find(p => p.id === projectId);
    return project?.name || "-";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--jofe-gray)]">
        <TopNavBar />
        <div className="lg:ml-72 flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#37B6E9] mx-auto mb-4" />
            <p className="text-gray-600">Chargement des tâches depuis MySQL...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--jofe-gray)]">
      {/* Sidebar */}
      <TopNavBar />

      <div className="lg:ml-72">

      <div className="w-full overflow-auto">

        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-[#162C54]">Gestion des Tâches</h1>
              <span className="text-sm text-gray-500">({tasks.length} tâches en base)</span>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setIsNewTaskModalOpen(true)}
                className="bg-[#37B6E9] hover:bg-[#3475BB] text-white px-4 py-2 rounded-lg flex items-center gap-2"
                data-testid="button-new-task"
              >
                <Plus className="w-4 h-4" />
                Nouvelle Tâche
              </Button>
              <Button
                variant="outline"
                onClick={loadData}
                className="border-[#37B6E9] text-[#37B6E9] hover:bg-[#37B6E9] hover:text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Rafraîchir
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p>{error}</p>
              <button onClick={loadData} className="underline mt-2">Réessayer</button>
            </div>
          )}

          {/* Filtres */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Filtre Membres */}
              <div className="relative">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white appearance-none cursor-pointer"
                  value={memberFilter}
                  onChange={(e) => setMemberFilter(e.target.value)}
                >
                  <option value="all">Tous les membres</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Filtre Clients */}
              <div className="relative">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white appearance-none cursor-pointer"
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                >
                  <option value="all">Tous les clients</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Filtre Statuts */}
              <div className="relative">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white appearance-none cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="en_cours">En cours</option>
                  <option value="en_pause">En pause</option>
                  <option value="termine">Terminé</option>
                  <option value="en_attente">En attente</option>
                </select>
                <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Filtre Priorités */}
              <div className="relative">
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white appearance-none cursor-pointer"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">Toutes priorités</option>
                  <option value="critique">Critique</option>
                  <option value="elevee">Élevée</option>
                  <option value="normale">Normale</option>
                  <option value="basse">Basse</option>
                </select>
                <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Date de début */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              {/* Date de fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Tableau des Tâches */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1400px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tâche</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigné</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priorité</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Échéance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temps</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coût</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progression</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTasks.map((task) => {
                    const statusInfo = getStatusDisplay(task.status);
                    return (
                      <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                        {/* Tâche */}
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-[#162C54] truncate max-w-[200px]" title={task.name}>
                            {task.name}
                          </div>
                        </td>

                        {/* Assigné */}
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">{getMemberName(task.assignedTo)}</div>
                        </td>

                        {/* Client */}
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">{getClientName(task.clientId)}</div>
                        </td>

                        {/* Projet */}
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            {task.projectId ? (
                              <Link href={`/projects/${task.projectId}`}>
                                <span className="text-[#37B6E9] hover:underline cursor-pointer flex items-center gap-1">
                                  <FolderOpen className="w-3 h-3" />
                                  {getProjectName(task.projectId, task.projectName)}
                                </span>
                              </Link>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>

                        {/* Priorité */}
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            task.priority === "critique" ? "bg-red-100 text-red-800" :
                            task.priority === "elevee" ? "bg-orange-100 text-orange-800" :
                            task.priority === "normale" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {task.priority === "critique" ? "Critique" :
                             task.priority === "elevee" ? "Élevée" :
                             task.priority === "normale" ? "Normale" : "Basse"}
                          </span>
                        </td>

                        {/* Échéance */}
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            {task.deadline ? new Date(task.deadline).toLocaleDateString('fr-FR') : "-"}
                          </div>
                        </td>

                        {/* Statut */}
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusInfo.class}`}>
                            {statusInfo.label}
                            {task.isTimerActive && <span className="ml-1 animate-pulse">●</span>}
                          </span>
                        </td>

                        {/* Temps */}
                        <td className="px-4 py-4">
                          <div className="text-sm font-mono text-gray-900">
                            {formatTime(task.totalTimeSpent || 0)}
                          </div>
                        </td>

                        {/* Coût */}
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">
                            {((task.totalCost || 0) / 1000).toFixed(0)} K CFA
                          </div>
                        </td>

                        {/* Progression */}
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-[#37B6E9] h-2 rounded-full"
                                style={{ width: `${task.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">{task.progress || 0}%</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openViewModal(task)}
                              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                              title="Voir détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => openEditModal(task)}
                              className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {task.status !== "termine" && (
                              <button
                                onClick={() => toggleTimer(task.id, task.status)}
                                className={`p-1 transition-colors ${
                                  task.isTimerActive
                                    ? "text-orange-600 hover:text-orange-800"
                                    : "text-green-600 hover:text-green-800"
                                }`}
                                title={task.isTimerActive ? "Pause" : "Démarrer"}
                              >
                                {task.isTimerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              </button>
                            )}

                            {task.status !== "termine" && (
                              <button
                                onClick={() => completeTask(task.id)}
                                className="p-1 text-green-600 hover:text-green-800 transition-colors"
                                title="Marquer terminé"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}

                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteTask(task.id, task.name)}
                                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                title="Supprimer (Admin)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredTasks.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>Aucune tâche trouvée dans la base de données</p>
                  <p className="text-sm">Créez une nouvelle tâche ou ajustez vos filtres</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Modal Nouvelle Tâche */}
        {isNewTaskModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-[#162C54]">
                      Nouvelle Tâche
                    </h3>
                    {preselectedProject && (
                      <p className="text-sm text-[#37B6E9] flex items-center gap-1 mt-1">
                        <FolderOpen className="w-4 h-4" />
                        Pour le projet: {preselectedProject.name}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setIsNewTaskModalOpen(false);
                      // Nettoyer l'URL si on vient d'un projet
                      if (preselectedProject) {
                        window.history.replaceState({}, '', '/tasks');
                        setPreselectedProject(null);
                        setNewTask(prev => ({ ...prev, projectId: '' }));
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <form className="p-6 space-y-6" onSubmit={handleCreateTask}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Titre de la tâche *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#37B6E9]"
                      placeholder="Ex: Création logo MOOV AFRICA"
                      value={newTask.name}
                      onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assigné à *</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#37B6E9]"
                      value={newTask.assignedTo}
                      onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                      required
                    >
                      <option value="">-- Sélectionner --</option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#37B6E9]"
                      value={newTask.clientId}
                      onChange={(e) => setNewTask({...newTask, clientId: e.target.value})}
                    >
                      <option value="">-- Sélectionner --</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FolderOpen className="w-4 h-4 inline mr-1" />
                      Projet associé
                    </label>
                    <select
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#37B6E9] ${
                        preselectedProject ? 'border-[#37B6E9] bg-blue-50' : 'border-gray-300'
                      }`}
                      value={newTask.projectId}
                      onChange={(e) => setNewTask({...newTask, projectId: e.target.value})}
                    >
                      <option value="">-- Aucun projet --</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                    {preselectedProject && (
                      <p className="text-xs text-[#37B6E9] mt-1">
                        Projet pré-sélectionné depuis la page projet
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#37B6E9]"
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                    >
                      <option value="normale">Normale</option>
                      <option value="elevee">Élevée</option>
                      <option value="critique">Critique</option>
                      <option value="basse">Basse</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date limite</label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#37B6E9]"
                      value={newTask.deadline}
                      onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Heures estimées</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#37B6E9]"
                      placeholder="8"
                      value={newTask.estimatedHours}
                      onChange={(e) => setNewTask({...newTask, estimatedHours: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#37B6E9]"
                    placeholder="Décrivez la tâche en détail..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewTaskModalOpen(false);
                      // Nettoyer l'URL si on vient d'un projet
                      if (preselectedProject) {
                        window.history.replaceState({}, '', '/tasks');
                        setPreselectedProject(null);
                        setNewTask(prev => ({ ...prev, projectId: '' }));
                      }
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#37B6E9] hover:bg-[#3475BB] text-white rounded-lg transition-colors"
                  >
                    Créer la tâche
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Visualisation Tâche */}
        {isViewModalOpen && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-[#162C54]">
                    Détails de la tâche
                  </h3>
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      setSelectedTask(null);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Titre et statut */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-semibold text-[#162C54]">{selectedTask.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Créée le {new Date(selectedTask.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusDisplay(selectedTask.status).class}`}>
                    {getStatusDisplay(selectedTask.status).label}
                  </span>
                </div>

                {/* Description */}
                {selectedTask.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedTask.description}</p>
                  </div>
                )}

                {/* Infos principales */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <User className="w-4 h-4" />
                      <span className="text-sm">Assigné à</span>
                    </div>
                    <p className="font-medium">{getMemberName(selectedTask.assignedTo)}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm">Client</span>
                    </div>
                    <p className="font-medium">{getClientName(selectedTask.clientId)}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <FolderOpen className="w-4 h-4" />
                      <span className="text-sm">Projet</span>
                    </div>
                    <p className="font-medium">{getProjectName(selectedTask.projectId, selectedTask.projectName)}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Priorité</span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedTask.priority === "critique" ? "bg-red-100 text-red-800" :
                      selectedTask.priority === "elevee" ? "bg-orange-100 text-orange-800" :
                      selectedTask.priority === "normale" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {selectedTask.priority === "critique" ? "Critique" :
                       selectedTask.priority === "elevee" ? "Élevée" :
                       selectedTask.priority === "normale" ? "Normale" : "Basse"}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Échéance</span>
                    </div>
                    <p className="font-medium">
                      {selectedTask.deadline ? new Date(selectedTask.deadline).toLocaleDateString('fr-FR') : "-"}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Temps passé</span>
                    </div>
                    <p className="font-medium font-mono">{formatTime(selectedTask.totalTimeSpent || 0)}</p>
                  </div>
                </div>

                {/* Progression */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Progression</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-[#37B6E9] h-3 rounded-full transition-all"
                        style={{ width: `${selectedTask.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">{selectedTask.progress || 0}%</span>
                  </div>
                </div>

                {/* Coût */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-[#37B6E9] mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-medium">Coût total</span>
                  </div>
                  <p className="text-2xl font-bold text-[#162C54]">
                    {((selectedTask.totalCost || 0) / 1000).toFixed(0)} K CFA
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      openEditModal(selectedTask);
                    }}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  {selectedTask.status !== "termine" && (
                    <button
                      onClick={() => {
                        completeTask(selectedTask.id);
                        setIsViewModalOpen(false);
                        setSelectedTask(null);
                      }}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Terminer
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Édition Tâche */}
        {isEditModalOpen && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-[#162C54]">
                    Modifier la tâche
                  </h3>
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setSelectedTask(null);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <form className="p-6 space-y-6" onSubmit={handleUpdateTask}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Titre de la tâche *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#37B6E9]"
                      value={editTask.name}
                      onChange={(e) => setEditTask({...editTask, name: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assigné à *</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#37B6E9]"
                      value={editTask.assignedTo}
                      onChange={(e) => setEditTask({...editTask, assignedTo: e.target.value})}
                      required
                    >
                      <option value="">-- Sélectionner --</option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#37B6E9]"
                      value={editTask.clientId}
                      onChange={(e) => setEditTask({...editTask, clientId: e.target.value})}
                    >
                      <option value="">-- Sélectionner --</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FolderOpen className="w-4 h-4 inline mr-1" />
                      Projet associé
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#37B6E9]"
                      value={editTask.projectId}
                      onChange={(e) => setEditTask({...editTask, projectId: e.target.value})}
                    >
                      <option value="">-- Aucun projet --</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#37B6E9]"
                      value={editTask.priority}
                      onChange={(e) => setEditTask({...editTask, priority: e.target.value})}
                    >
                      <option value="normale">Normale</option>
                      <option value="elevee">Élevée</option>
                      <option value="critique">Critique</option>
                      <option value="basse">Basse</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#37B6E9]"
                      value={editTask.status}
                      onChange={(e) => setEditTask({...editTask, status: e.target.value})}
                    >
                      <option value="en_attente">En attente</option>
                      <option value="en_cours">En cours</option>
                      <option value="en_pause">En pause</option>
                      <option value="termine">Terminé</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date limite</label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#37B6E9]"
                      value={editTask.deadline}
                      onChange={(e) => setEditTask({...editTask, deadline: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Progression (%)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        className="flex-1"
                        value={editTask.progress}
                        onChange={(e) => setEditTask({...editTask, progress: parseInt(e.target.value)})}
                      />
                      <span className="text-sm font-medium w-12 text-center">{editTask.progress}%</span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#37B6E9] h-2 rounded-full transition-all"
                        style={{ width: `${editTask.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#37B6E9]"
                    placeholder="Décrivez la tâche en détail..."
                    value={editTask.description}
                    onChange={(e) => setEditTask({...editTask, description: e.target.value})}
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setSelectedTask(null);
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#37B6E9] hover:bg-[#3475BB] text-white rounded-lg transition-colors"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
