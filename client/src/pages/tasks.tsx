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
  DollarSign
} from "lucide-react";
import TopNavBar from "@/components/TopNavBar";
import AdminFloatingMenu from "@/components/AdminFloatingMenu";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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

// Données réelles du template HTML authentique
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
  
  // Filtres pour le tableau
  const [memberFilter, setMemberFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
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

  // Logique de filtrage pour le tableau
  const filteredTasks = tasks.filter(task => {
    // Filtre par membre
    if (memberFilter !== "all" && task.assignedToId !== memberFilter) return false;
    
    // Filtre par client
    if (clientFilter !== "all" && task.clientId !== clientFilter) return false;
    
    // Filtre par statut
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    
    // Filtre par priorité
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    
    // Filtre par date de début
    if (startDate && new Date(task.dueDate) < new Date(startDate)) return false;
    
    // Filtre par date de fin
    if (endDate && new Date(task.dueDate) > new Date(endDate)) return false;
    
    return true;
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
    <div className="min-h-screen bg-[var(--jofe-gray)]">
      {/* Sidebar */}
      <TopNavBar />
      
      <div className="ml-72">
      {/* Menu flottant admin */}
      <AdminFloatingMenu />
      
      <div className="w-full overflow-auto">
        
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-[#162C54]">Gestion des Tâches</h1>
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
                className="border-[#37B6E9] text-[#37B6E9] hover:bg-[#37B6E9] hover:text-white px-4 py-2 rounded-lg flex items-center gap-2"
                data-testid="button-import"
              >
                <Upload className="w-4 h-4" />
                Importer
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Filtres comme dans l'image */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Filtre Membres */}
              <div className="relative">
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white appearance-none cursor-pointer"
                  value={memberFilter}
                  onChange={(e) => setMemberFilter(e.target.value)}
                  data-testid="filter-members"
                >
                  <option value="all">Tous les membres</option>
                  {TEAM_MEMBERS.map(member => (
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
                  data-testid="filter-clients"
                >
                  <option value="all">Tous les clients</option>
                  {CLIENTS.map(client => (
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
                  data-testid="filter-status"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="running">En cours</option>
                  <option value="paused">En pause</option>
                  <option value="completed">Terminé</option>
                  <option value="pending">En attente</option>
                </select>
                <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              
              {/* Filtre Priorités */}
              <div className="relative">
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white appearance-none cursor-pointer"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  data-testid="filter-priorities"
                >
                  <option value="all">Toutes priorités</option>
                  <option value="critique">Critique</option>
                  <option value="elevee">Élevée</option>
                  <option value="normale">Normale</option>
                  <option value="basse">Basse</option>
                </select>
                <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              
              {/* Date Début */}
              <div>
                <input 
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="jj/mm/aaaa"
                  data-testid="filter-start-date"
                />
              </div>
              
              {/* Date Fin */}
              <div>
                <input 
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="jj/mm/aaaa"
                  data-testid="filter-end-date"
                />
              </div>
            </div>
          </div>

          {/* Tableau des Tâches */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tâche</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigné</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
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
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50 transition-colors" data-testid={`table-row-${task.id}`}>
                      {/* Tâche */}
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-[#162C54] truncate max-w-[200px]" title={task.title}>
                          {task.title}
                        </div>
                      </td>
                      
                      {/* Assigné */}
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{task.assignedTo}</div>
                      </td>
                      
                      {/* Client */}
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{task.client}</div>
                      </td>
                      
                      {/* Priorité */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          task.priority === "critique" ? "bg-red-100 text-red-800" :
                          task.priority === "elevee" ? "bg-orange-100 text-orange-800" :
                          task.priority === "normale" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {task.priority === "critique" ? "Haute" :
                           task.priority === "elevee" ? "Élevée" :
                           task.priority === "normale" ? "Normale" : "Basse"}
                        </span>
                      </td>
                      
                      {/* Échéance */}
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(task.dueDate).toLocaleDateString('fr-FR', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric' 
                          })}
                        </div>
                      </td>
                      
                      {/* Statut */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          task.status === "running" ? "bg-blue-100 text-blue-800" :
                          task.status === "paused" ? "bg-yellow-100 text-yellow-800" :
                          task.status === "completed" ? "bg-green-100 text-green-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {task.status === "running" ? "En cours" :
                           task.status === "paused" ? "En pause" :
                           task.status === "completed" ? "Terminé" : "En attente"}
                        </span>
                      </td>
                      
                      {/* Temps */}
                      <td className="px-4 py-4">
                        <div className="text-sm font-mono text-gray-900">
                          {formatTime(task.timeSpent)}
                        </div>
                      </td>
                      
                      {/* Coût */}
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {(task.totalCost / 1000).toFixed(0)} K CFA
                        </div>
                      </td>
                      
                      {/* Progression */}
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-[#37B6E9] h-2 rounded-full" 
                              style={{ 
                                width: `${task.status === "completed" ? 100 : 
                                       task.status === "running" ? Math.min(90, Math.floor(task.timeSpent / 3600) * 10 + 50) :
                                       task.status === "paused" ? 60 : 30}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {task.status === "completed" ? "100" : 
                             task.status === "running" ? Math.min(90, Math.floor(task.timeSpent / 3600) * 10 + 50) :
                             task.status === "paused" ? "60" : "30"}%
                          </span>
                        </div>
                      </td>
                      
                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <Link href={`/tasks/${task.id}`}>
                            <button 
                              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                              data-testid={`button-view-${task.id}`}
                              title="Voir détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>
                          
                          <button 
                            className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                            data-testid={`button-edit-${task.id}`}
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          {task.status !== "completed" && (
                            <button 
                              onClick={() => toggleTimer(task.id)}
                              className={`p-1 transition-colors ${
                                task.status === "running" 
                                  ? "text-orange-600 hover:text-orange-800" 
                                  : "text-green-600 hover:text-green-800"
                              }`}
                              data-testid={`button-timer-${task.id}`}
                              title={task.status === "running" ? "Pause" : "Démarrer"}
                            >
                              {task.status === "running" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </button>
                          )}
                          
                          {task.status !== "completed" && (
                            <button 
                              onClick={() => completeTask(task.id)}
                              className="p-1 text-green-600 hover:text-green-800 transition-colors"
                              data-testid={`button-complete-${task.id}`}
                              title="Marquer terminé"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
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
    </div>
  );
}