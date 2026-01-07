import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/hooks/useAuth";
import TopNavBar from "@/components/TopNavBar";
import {
  FolderOpen,
  DollarSign,
  Bell,
  Settings
} from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const { user } = useAuth();

  // Initialize WebSocket connection
  useWebSocket();

  // Fetch dashboard data
  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
  });

  const { data: teamStats } = useQuery({
    queryKey: ["/api/analytics/team"],
  });

  const { data: tasks } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Vérifier le rôle de l'utilisateur
  const userRole = (user as any)?.userRole || 'member';
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  // Calculate total revenue from all project budgets (only for admins)
  const totalRevenue = isAdmin ? ((projects as any)?.data?.reduce((sum: number, project: any) => {
    const budget = parseFloat(project.budget || 0);
    return sum + budget;
  }, 0) || 0) : 0;

  // Format numbers for display
  const formatNumber = (num: string | number) => {
    const value = typeof num === 'string' ? parseInt(num) : num;
    return new Intl.NumberFormat('fr-FR').format(value || 0);
  };

  const formatCurrency = (num: string | number) => {
    const value = typeof num === 'string' ? parseInt(num) : num;
    return `${formatNumber(value || 0)} FCFA`;
  };

  return (
    <div className="min-h-screen bg-white">
      <TopNavBar />
      
      {/* Main Content */}
      <div className="lg:ml-72 w-auto">        
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="jofe-font text-xl md:text-2xl text-primary truncate">Tableau de Bord</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">Vue d'ensemble de vos projets et performances</p>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Bell className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
                <div className="notification-dot absolute top-1 right-1"></div>
              </button>
              
              {/* Settings */}
              <button className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 md:p-6 space-y-6 md:space-y-8">
          {/* KPIs */}
          <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-2' : ''} gap-6 fade-in`}>
            {/* Projets Actifs */}
            <div className="kpi-card">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-secondary/10 flex-shrink-0">
                  <FolderOpen className="w-6 h-6 text-secondary" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold jofe-font text-primary">
                  {formatNumber((dashboardStats as any)?.data?.totalProjects || (projects as any)?.data?.filter((p: any) => p.status !== 'completed').length || 0)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Projets Actifs</p>
              </div>
            </div>

            {/* Chiffre d'Affaires Total - Visible uniquement pour admin et super_admin */}
            {isAdmin && (
              <div className="kpi-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-green-500/10 flex-shrink-0">
                    <DollarSign className="w-6 h-6 text-green-500" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold jofe-font text-primary">
                    {formatCurrency(totalRevenue)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Chiffre d'Affaires Total (FCFA)</p>
                </div>
              </div>
            )}
          </div>

          {/* Tâches Actives et Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 fade-in">
            {/* Tâches Récentes */}
            <Card className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-2">
                <h3 className="jofe-font text-base md:text-lg text-primary">Tâches Récentes</h3>
                <a href="/tasks" className="text-sm text-secondary hover:underline">Voir tout</a>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {(tasks as any)?.data && (tasks as any).data.length > 0 ? (
                  (tasks as any).data.slice(0, 5).map((task: any) => (
                    <div key={task.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-primary truncate">{task.name || task.title}</h4>
                          <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500 mt-1">
                            {task.clientName && (
                              <>
                                <span className="font-semibold text-orange-600">{task.clientName}</span>
                                <span>•</span>
                              </>
                            )}
                            {task.projectName && (
                              <>
                                <span className="text-secondary">{task.projectName}</span>
                                <span>•</span>
                              </>
                            )}
                            <span className="font-medium">{task.assignedToName || 'Non assigné'}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            task.priority === 'urgente' ? 'bg-red-500 text-white' :
                            task.priority === 'haute' ? 'bg-orange-500 text-white' :
                            task.priority === 'moyenne' ? 'bg-yellow-500 text-white' :
                            'bg-blue-500 text-white'
                          }`}>
                            {task.priority || 'Normal'}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            task.status === 'termine' ? 'bg-green-100 text-green-700' :
                            task.status === 'en_cours' ? 'bg-blue-100 text-blue-700' :
                            task.status === 'en_attente' ? 'bg-gray-100 text-gray-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {task.status === 'termine' ? 'Terminé' :
                             task.status === 'en_cours' ? 'En cours' :
                             task.status === 'en_attente' ? 'En attente' :
                             task.status === 'en_pause' ? 'En pause' : task.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Aucune tâche pour le moment</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Équipe */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="jofe-font text-lg text-primary">Équipe</h3>
                <a href="/team" className="text-sm text-secondary hover:underline">Voir tout</a>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-secondary">{(teamStats as any)?.data?.total || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Total Membres</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-500">{(teamStats as any)?.data?.online || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">En Ligne</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-green-500">
                      {(tasks as any)?.data?.filter((t: any) => t.status === 'completed').length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Tâches Terminées</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-orange-500">
                      {(tasks as any)?.data?.filter((t: any) => t.status === 'in_progress').length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Tâches En Cours</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

        </main>
      </div>
    </div>
  );
}
