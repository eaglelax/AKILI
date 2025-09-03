import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/hooks/useAuth";
import TopNavBar from "@/components/TopNavBar";
import { 
  FolderOpen, 
  DollarSign, 
  Users, 
  Heart,
  Bell,
  Settings,
  Play,
  Pause,
  CheckCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 fade-in">
            {/* Projets Actifs */}
            <div className="kpi-card">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="p-2 md:p-3 rounded-lg bg-secondary/10 flex-shrink-0">
                  <FolderOpen className="w-4 h-4 md:w-6 md:h-6 text-secondary" />
                </div>
                <span className="text-xs px-1 md:px-2 py-1 rounded-full bg-green-500 text-white hidden sm:inline">
                  {(dashboardStats as any)?.totalProjects ? '+12%' : 'New'}
                </span>
              </div>
              <div>
                <p className="text-lg md:text-2xl font-bold jofe-font text-primary truncate">
                  {formatNumber((dashboardStats as any)?.totalProjects || (projects as any)?.length || 0)}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground truncate">Projets Actifs</p>
              </div>
            </div>
            
            {/* CA Mensuel */}
            <div className="kpi-card">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="p-2 md:p-3 rounded-lg bg-green-500/10 flex-shrink-0">
                  <DollarSign className="w-4 h-4 md:w-6 md:h-6 text-green-500" />
                </div>
                <span className="text-xs px-1 md:px-2 py-1 rounded-full bg-green-500 text-white hidden sm:inline">+8%</span>
              </div>
              <div>
                <p className="text-sm md:text-2xl font-bold jofe-font text-primary truncate">
                  {formatNumber((dashboardStats as any)?.totalRevenue || 12450000)}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground truncate">CA Mensuel</p>
              </div>
            </div>
            
            {/* Productivité Équipe */}
            <div className="kpi-card">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="p-2 md:p-3 rounded-lg bg-orange-500/10 flex-shrink-0">
                  <Users className="w-4 h-4 md:w-6 md:h-6 text-orange-500" />
                </div>
                <span className="text-xs px-1 md:px-2 py-1 rounded-full bg-green-500 text-white hidden sm:inline">+5%</span>
              </div>
              <div>
                <p className="text-lg md:text-2xl font-bold jofe-font text-primary truncate">
                  {(teamStats as any)?.productivity || '87'}%
                </p>
                <p className="text-xs md:text-sm text-muted-foreground truncate">Productivité</p>
              </div>
            </div>
            
            {/* Satisfaction Client */}
            <div className="kpi-card">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="p-2 md:p-3 rounded-lg bg-primary/10 flex-shrink-0">
                  <Heart className="w-4 h-4 md:w-6 md:h-6 text-primary" />
                </div>
                <span className="text-xs px-1 md:px-2 py-1 rounded-full bg-green-500 text-white hidden sm:inline">+2%</span>
              </div>
              <div>
                <p className="text-lg md:text-2xl font-bold jofe-font text-primary truncate">4.8/5</p>
                <p className="text-xs md:text-sm text-muted-foreground truncate">Satisfaction</p>
              </div>
            </div>
          </div>

          {/* Tâches Actives et Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 fade-in">
            {/* Tâches Actives */}
            <Card className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-2">
                <h3 className="jofe-font text-base md:text-lg text-primary">Tâches Actives</h3>
                <Button className="bg-secondary hover:bg-secondary/90 text-sm px-3 py-2">
                  <span className="hidden sm:inline">Nouvelle Tâche</span>
                  <span className="sm:hidden">Nouvelle</span>
                </Button>
              </div>
              
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {tasks && (tasks as any).length > 0 ? (
                  (tasks as any).slice(0, 3).map((task: any) => (
                    <div key={task.id} className="task-item">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-primary">{task.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.priority === 'urgente' ? 'bg-red-500 text-white' :
                          task.priority === 'haute' ? 'bg-orange-500 text-white' :
                          'bg-blue-500 text-white'
                        }`}>
                          {task.priority || 'Normal'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {task.assignedToName || 'Non assigné'} - {task.category || 'Tâche générale'}
                      </p>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="timer-active">
                          <span className="text-xs md:text-sm font-mono text-secondary">
                            {task.timeSpent || '00:00:00'}
                          </span>
                        </div>
                        <div className="flex gap-1 md:gap-2">
                          <Button size="sm" variant="outline" className="bg-orange-500 text-white border-orange-500 px-2">
                            <Pause className="w-3 h-3 md:mr-1" />
                            <span className="hidden md:inline">Pause</span>
                          </Button>
                          <Button size="sm" className="bg-green-500 hover:bg-green-600 px-2">
                            <CheckCircle className="w-3 h-3 md:mr-1" />
                            <span className="hidden md:inline">Terminé</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Aucune tâche active</p>
                    <Button className="mt-4 bg-secondary hover:bg-secondary/90">
                      Créer votre première tâche
                    </Button>
                  </div>
                )}
              </div>
            </Card>
            
            {/* Performance Équipe */}
            <Card className="p-6">
              <h3 className="jofe-font text-lg mb-6 text-primary">Performance Équipe</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-primary">Total Membres</p>
                    <p className="text-2xl font-bold text-secondary">{(teamStats as any)?.totalMembers || 14}</p>
                  </div>
                  <div>
                    <p className="font-medium text-primary">En Ligne</p>
                    <p className="text-2xl font-bold text-green-500">{(teamStats as any)?.onlineMembers || 1}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">Tâches Terminées</p>
                    <p className="text-xl font-bold text-green-500">{(dashboardStats as any)?.completedTasks || 0}</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">Tâches Actives</p>
                    <p className="text-xl font-bold text-orange-500">{(dashboardStats as any)?.activeTasks || 0}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Revenue Chart Placeholder */}
          <Card className="p-6 fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="jofe-font text-lg text-primary">Évolution CA (FCFA)</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">7j</Button>
                <Button variant="outline" size="sm">30j</Button>
                <Button size="sm" className="bg-secondary">3M</Button>
              </div>
            </div>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Graphique CA - Intégration Chart.js à venir</p>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
