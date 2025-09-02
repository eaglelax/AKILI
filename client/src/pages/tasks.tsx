import React, { useState, useEffect } from "react";
import { Plus, Search, Clock, User, Building2, Calendar, AlertCircle, Play, Pause, CheckCircle, MoreHorizontal, Edit, Eye } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import AdminFloatingMenu from "@/components/AdminFloatingMenu";
import { Link } from "wouter";

// Types pour les tâches avec chronométrage
interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToId: string;
  client: string;
  clientId: string;
  priority: "critique" | "elevee" | "normale" | "basse";
  dueDate: string;
  status: "running" | "paused" | "completed" | "pending";
  timeSpent: number; // en secondes
  hourlyRate: number;
  totalCost: number;
  createdAt: string;
}

// Données réelles du template HTML JoFé+ authentique
const REAL_TASKS: Task[] = [
  {
    id: "task_moov_africa",
    title: "Création campagne MOOV AFRICA",
    description: "Développement de la campagne \"Connectons l'Afrique\" avec visuels print et digital",
    assignedTo: "Paul Junior OUEDRAOGO",
    assignedToId: "paul_ouedraogo", 
    client: "MOOV AFRICA",
    clientId: "moov_africa",
    priority: "critique",
    dueDate: "2025-02-15T17:00:00",
    status: "running",
    timeSpent: 9252, // 02:34:12 en secondes
    hourlyRate: 8000,
    totalCost: 204800,
    createdAt: "2025-01-15T08:00:00"
  },
  {
    id: "task_bank_africa",
    title: "Shooting produits BANK OF AFRICA",
    description: "Photos produits pour nouvelle gamme de cartes bancaires",
    assignedTo: "Fortune YANOGO",
    assignedToId: "fortune_yanogo",
    client: "BANK OF AFRICA", 
    clientId: "bank_of_africa",
    priority: "elevee",
    dueDate: "2025-02-22T18:00:00",
    status: "running",
    timeSpent: 4547, // 01:15:47 en secondes
    hourlyRate: 10000,
    totalCost: 126500,
    createdAt: "2025-01-20T09:30:00"
  },
  {
    id: "task_sunu_burkina",
    title: "Animation motion design SUNU BURKINA",
    description: "Vidéo explicative des services d'assurance (30 secondes)",
    assignedTo: "Bientama PARÉ",
    assignedToId: "bientama_pare",
    client: "SUNU BURKINA",
    clientId: "sunu_burkina", 
    priority: "normale",
    dueDate: "2025-03-08T16:00:00",
    status: "completed",
    timeSpent: 15753, // 04:22:33 en secondes
    hourlyRate: 9000,
    totalCost: 425000,
    createdAt: "2025-01-10T14:00:00"
  },
  {
    id: "task_roxgold",
    title: "Refonte logo ROXGOLD",
    description: "Modernisation du logo avec éléments premium gold",
    assignedTo: "Linda KABORÉ",
    assignedToId: "linda_kabore",
    client: "ROXGOLD",
    clientId: "roxgold",
    priority: "elevee", 
    dueDate: "2025-02-28T17:00:00",
    status: "paused",
    timeSpent: 2712, // 00:45:12 en secondes
    hourlyRate: 9500,
    totalCost: 42750,
    createdAt: "2025-01-25T11:00:00"
  }
];

// Membres de l'équipe pour les sélecteurs
const TEAM_MEMBERS = [
  { id: "paul_ouedraogo", name: "Paul Junior OUEDRAOGO", rate: 8000 },
  { id: "fortune_yanogo", name: "Fortune YANOGO", rate: 10000 },
  { id: "bientama_pare", name: "Bientama PARÉ", rate: 9000 },
  { id: "linda_kabore", name: "Linda KABORÉ", rate: 9500 },
  { id: "florita_kabore", name: "Florita KABORÉ", rate: 7500 }
];

// Clients disponibles
const CLIENTS = [
  { id: "moov_africa", name: "MOOV AFRICA" },
  { id: "bank_of_africa", name: "BANK OF AFRICA" },
  { id: "sunu_burkina", name: "SUNU BURKINA" },
  { id: "roxgold", name: "ROXGOLD" }
];

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(REAL_TASKS);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [memberFilter, setMemberFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  
  // État pour les statistiques en temps réel
  const [stats, setStats] = useState({
    totalTasks: 0,
    activeTasks: 0,
    totalTime: 0,
    totalCosts: 0
  });

  // Calcul des statistiques en temps réel
  useEffect(() => {
    const totalTasks = tasks.length;
    const activeTasks = tasks.filter(t => t.status === "running").length;
    const totalTime = Math.floor(tasks.reduce((acc, t) => acc + t.timeSpent, 0) / 3600); // En heures
    const totalCosts = tasks.reduce((acc, t) => acc + t.totalCost, 0);
    
    setStats({ totalTasks, activeTasks, totalTime, totalCosts });
  }, [tasks]);

  // Mise à jour des chronos en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.status === "running") {
            const newTimeSpent = task.timeSpent + 1;
            const newTotalCost = Math.floor((newTimeSpent / 3600) * task.hourlyRate);
            return { 
              ...task, 
              timeSpent: newTimeSpent,
              totalCost: newTotalCost
            };
          }
          return task;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Filtrages des tâches
  const filteredTasks = tasks.filter(task => {
    return (
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "" || task.status === statusFilter) &&
      (memberFilter === "" || task.assignedToId === memberFilter) &&
      (priorityFilter === "" || task.priority === priorityFilter)
    );
  });

  // Formatage du temps (secondes vers HH:MM:SS)
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Style des badges de priorité
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "critique":
        return "bg-red-100 text-red-800";
      case "elevee":
        return "bg-yellow-100 text-yellow-800";
      case "normale":
        return "bg-green-100 text-green-800";
      case "basse":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Style des timers selon le statut
  const getTimerStyle = (status: string) => {
    switch (status) {
      case "running":
        return "text-[var(--jofe-white)] animate-pulse" + 
               " bg-gradient-to-r from-[var(--jofe-blue-light)] to-[var(--jofe-blue-medium)]";
      case "paused":
        return "bg-[var(--jofe-orange)] text-[var(--jofe-white)]";
      case "completed":
        return "bg-[var(--jofe-gray)] text-[var(--jofe-blue-deep)]";
      default:
        return "bg-[var(--jofe-gray)] text-[var(--jofe-blue-deep)]";
    }
  };

  // Contrôle des timers
  const toggleTimer = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            status: task.status === "running" ? "paused" : "running"
          };
        }
        return task;
      })
    );
  };

  const completeTask = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          return { ...task, status: "completed" as const };
        }
        return task;
      })
    );
  };

  return (
    <div className="flex h-screen bg-[var(--jofe-gray)]">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Menu flottant admin */}
      <AdminFloatingMenu />
      
      <div className="flex-1 overflow-auto md:ml-64 ml-0">
        {/* Mobile Header Spacer */}
        <div className="h-16 md:hidden"></div>
        
        {/* Header */}
        <header className="bg-[var(--jofe-white)] border-b border-[var(--jofe-gray)] px-4 md:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="min-w-0 flex-1">
              <h1 
                className="text-xl md:text-3xl font-bold text-[var(--jofe-blue-deep)] mb-1" 
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Gestion des Tâches
              </h1>
              <p className="text-sm md:text-base text-gray-600 hidden sm:block">
                Chronométrage automatique et suivi en temps réel
              </p>
            </div>
            
            <button 
              onClick={() => setIsNewTaskModalOpen(true)}
              className="bg-[var(--jofe-blue-light)] hover:bg-[var(--jofe-blue-medium)] text-[var(--jofe-white)] px-4 py-3 md:px-6 md:py-3 rounded-lg flex items-center gap-2 transition-all duration-300 hover:transform hover:-translate-y-0.5 text-sm md:text-base"
              data-testid="button-new-task"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Nouvelle Tâche</span>
              <span className="sm:hidden">Nouvelle</span>
            </button>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">
          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-[var(--jofe-white)] p-4 md:p-6 rounded-xl border border-[var(--jofe-gray)] hover:shadow-lg hover:transform hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Tâches Actives</p>
                  <p className="text-xl md:text-2xl font-bold text-[var(--jofe-blue-deep)]" style={{ fontFamily: "Inter, sans-serif" }}>
                    {stats.totalTasks}
                  </p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[var(--jofe-blue-light)] bg-opacity-10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-[var(--jofe-blue-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[var(--jofe-white)] p-4 md:p-6 rounded-xl border border-[var(--jofe-gray)] hover:shadow-lg hover:transform hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">En Cours</p>
                  <p className="text-xl md:text-2xl font-bold text-[var(--jofe-green)]" style={{ fontFamily: "Inter, sans-serif" }}>
                    {stats.activeTasks}
                  </p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[var(--jofe-green)] bg-opacity-10 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 md:w-6 md:h-6 text-[var(--jofe-green)]" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--jofe-white)] p-4 md:p-6 rounded-xl border border-[var(--jofe-gray)] hover:shadow-lg hover:transform hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Temps Total</p>
                  <p className="text-xl md:text-2xl font-bold text-[var(--jofe-blue-medium)]" style={{ fontFamily: "Inter, sans-serif" }}>
                    {stats.totalTime}h
                  </p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[var(--jofe-blue-medium)] bg-opacity-10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-[var(--jofe-blue-medium)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[var(--jofe-white)] p-4 md:p-6 rounded-xl border border-[var(--jofe-gray)] hover:shadow-lg hover:transform hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Coûts Total</p>
                  <p className="text-sm md:text-2xl font-bold text-[var(--jofe-orange)]" style={{ fontFamily: "Inter, sans-serif" }}>
                    {(stats.totalCosts / 1000000).toFixed(1)}M FCFA
                  </p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[var(--jofe-orange)] bg-opacity-10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-[var(--jofe-orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres et Recherche */}
          <div className="bg-[var(--jofe-white)] p-4 md:p-6 rounded-xl border border-[var(--jofe-gray)] mb-6 md:mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Nom de la tâche..." 
                    className="w-full pl-10 pr-4 py-2 border border-[var(--jofe-gray)] rounded-lg focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10 transition-all duration-300 text-sm md:text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    data-testid="input-search-tasks"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select 
                  className="w-full px-3 py-2 border border-[var(--jofe-gray)] rounded-lg focus:outline-none focus:border-[var(--jofe-blue-light)] text-sm md:text-base"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  data-testid="select-status-filter"
                >
                  <option value="">Tous les statuts</option>
                  <option value="running">En cours</option>
                  <option value="paused">En pause</option>
                  <option value="completed">Terminé</option>
                  <option value="pending">En attente</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigné à</label>
                <select 
                  className="w-full px-3 py-2 border border-[var(--jofe-gray)] rounded-lg focus:outline-none focus:border-[var(--jofe-blue-light)] text-sm md:text-base"
                  value={memberFilter}
                  onChange={(e) => setMemberFilter(e.target.value)}
                  data-testid="select-member-filter"
                >
                  <option value="">Tous les membres</option>
                  {TEAM_MEMBERS.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
                <select 
                  className="w-full px-3 py-2 border border-[var(--jofe-gray)] rounded-lg focus:outline-none focus:border-[var(--jofe-blue-light)] text-sm md:text-base"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  data-testid="select-priority-filter"
                >
                  <option value="">Toutes priorités</option>
                  <option value="critique">Critique</option>
                  <option value="elevee">Élevée</option>
                  <option value="normale">Normale</option>
                  <option value="basse">Basse</option>
                </select>
              </div>
            </div>
          </div>

          {/* Liste des Tâches */}
          <div className="bg-[var(--jofe-white)] rounded-xl border border-[var(--jofe-gray)]">
            <div className="p-4 md:p-6 border-b border-[var(--jofe-gray)]">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-[var(--jofe-blue-deep)]" style={{ fontFamily: "Inter, sans-serif" }}>
                  Liste des Tâches
                </h3>
                <div className="flex space-x-2">
                  <button className="p-2 text-[var(--jofe-blue-medium)] hover:bg-[var(--jofe-gray)] rounded-lg transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-[var(--jofe-gray)] max-h-[500px] overflow-y-auto">
              {filteredTasks.map((task, index) => (
                <div key={task.id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors" data-testid={`task-item-${task.id}`}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h4 className="font-semibold text-[var(--jofe-blue-deep)] text-sm md:text-base truncate">
                          {task.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-2xl font-medium w-fit ${getPriorityStyle(task.priority)}`}>
                          {task.priority === "critique" && "Critique"}
                          {task.priority === "elevee" && "Élevée"}
                          {task.priority === "normale" && "Normale"}
                          {task.priority === "basse" && "Basse"}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{task.assignedTo}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{task.client}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>{new Date(task.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between lg:justify-end gap-4">
                      <div className="text-right">
                        <div className={`px-3 py-2 rounded-lg text-sm font-semibold ${getTimerStyle(task.status)}`}>
                          {formatTime(task.timeSpent)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {task.status === "completed" ? "Terminé - " : ""}{task.totalCost.toLocaleString()} FCFA
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link href={`/tasks/${task.id}`}>
                          <button 
                            className="p-2 text-[var(--jofe-blue-medium)] hover:bg-[var(--jofe-blue-medium)] hover:text-[var(--jofe-white)] rounded-lg transition-colors"
                            data-testid={`button-detail-${task.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        
                        {task.status !== "completed" && (
                          <button 
                            onClick={() => toggleTimer(task.id)}
                            className="p-2 text-[var(--jofe-orange)] hover:bg-[var(--jofe-orange)] hover:text-[var(--jofe-white)] rounded-lg transition-colors"
                            data-testid={`button-toggle-timer-${task.id}`}
                          >
                            {task.status === "running" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                        )}
                        
                        {task.status !== "completed" && (
                          <button 
                            onClick={() => completeTask(task.id)}
                            className="p-2 text-[var(--jofe-green)] hover:bg-[var(--jofe-green)] hover:text-[var(--jofe-white)] rounded-lg transition-colors"
                            data-testid={`button-complete-${task.id}`}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredTasks.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>Aucune tâche trouvée</p>
                  <p className="text-sm">Ajustez vos filtres ou créez une nouvelle tâche</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Modal Nouvelle Tâche */}
        {isNewTaskModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--jofe-white)] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[var(--jofe-gray)]">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-[var(--jofe-blue-deep)]" style={{ fontFamily: "Inter, sans-serif" }}>
                    Nouvelle Tâche
                  </h3>
                  <button 
                    onClick={() => setIsNewTaskModalOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    data-testid="button-close-modal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <form className="p-6 space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Titre de la tâche</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-[var(--jofe-gray)] rounded-lg focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10 transition-all duration-300" 
                      placeholder="Ex: Création logo MOOV AFRICA"
                      data-testid="input-task-title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assigné à</label>
                    <select 
                      className="w-full px-3 py-2 border border-[var(--jofe-gray)] rounded-lg focus:outline-none focus:border-[var(--jofe-blue-light)]"
                      data-testid="select-assigned-to"
                    >
                      <option>-- Sélectionner --</option>
                      {TEAM_MEMBERS.map(member => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                    <select 
                      className="w-full px-3 py-2 border border-[var(--jofe-gray)] rounded-lg focus:outline-none focus:border-[var(--jofe-blue-light)]"
                      data-testid="select-client"
                    >
                      <option>-- Sélectionner --</option>
                      {CLIENTS.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
                    <select 
                      className="w-full px-3 py-2 border border-[var(--jofe-gray)] rounded-lg focus:outline-none focus:border-[var(--jofe-blue-light)]"
                      data-testid="select-priority"
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
                      className="w-full px-3 py-2 border border-[var(--jofe-gray)] rounded-lg focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10 transition-all duration-300"
                      data-testid="input-due-date"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget estimé (FCFA)</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-[var(--jofe-gray)] rounded-lg focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10 transition-all duration-300" 
                      placeholder="500000"
                      data-testid="input-budget"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea 
                    rows={4} 
                    className="w-full px-3 py-2 border border-[var(--jofe-gray)] rounded-lg focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10 transition-all duration-300" 
                    placeholder="Décrivez la tâche en détail..."
                    data-testid="textarea-description"
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsNewTaskModalOpen(false)}
                    className="px-6 py-2 border border-[var(--jofe-gray)] text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    data-testid="button-cancel"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2 bg-[var(--jofe-blue-light)] hover:bg-[var(--jofe-blue-medium)] text-[var(--jofe-white)] rounded-lg transition-colors"
                    data-testid="button-create-task"
                  >
                    Créer et Démarrer Chrono
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}