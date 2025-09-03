import React from 'react';
import TopNavBar from '@/components/TopNavBar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Plus, 
  DollarSign, 
  BarChart3, 
  CheckCircle, 
  Users,
  Calendar,
  Clock,
  MessageSquare,
  Play,
  Pause,
  MoreHorizontal,
  TrendingUp,
  FileText,
  Target
} from 'lucide-react';
import { Link, useParams } from 'wouter';

function ProjectDetail() {
  const params = useParams();
  const projectId = params.id;
  // Données de démonstration basées sur le template HTML
  const projectData = {
    id: "moov-q1-2024",
    name: "Campagne MOOV AFRICA Q1 2024",
    description: "Campagne publicitaire multicanal pour le lancement des nouveaux forfaits",
    status: "En cours",
    client: "MOOV AFRICA BURKINA FASO",
    budget: 2500000,
    spent: 1875000,
    progress: 75,
    startDate: "15 janvier 2024",
    endDate: "15 mars 2024",
    tasksTotal: 24,
    tasksCompleted: 18,
    teamMembers: [
      { id: "serge", name: "Serge ASSALÉ", role: "Chef de Projet", avatar: "SA", status: "online" },
      { id: "enos", name: "Enos GOUBA", role: "Directeur Créatif", avatar: "EG", status: "online" },
      { id: "paul", name: "Paul OUEDRAOGO", role: "Graphiste", avatar: "PO", status: "offline" },
      { id: "marie", name: "Marie KONE", role: "Community Manager", avatar: "MK", status: "online" }
    ]
  };

  const kpis = [
    {
      title: "Budget Total",
      value: "2 500 000 FCFA",
      change: "+15%",
      changeType: "positive",
      icon: DollarSign,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Progression",
      value: "75%",
      change: "+12%",
      changeType: "positive", 
      icon: BarChart3,
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Tâches Terminées",
      value: "18/24",
      change: "+3",
      changeType: "positive",
      icon: CheckCircle,
      color: "bg-orange-100 text-orange-600"
    },
    {
      title: "Équipe Active",
      value: "4 membres",
      change: "100%",
      changeType: "neutral",
      icon: Users,
      color: "bg-purple-100 text-purple-600"
    }
  ];

  const timelineActivities = [
    {
      id: 1,
      type: "task_completed",
      title: "Création des visuels principaux terminée",
      user: "Paul OUEDRAOGO",
      time: "il y a 2h",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      id: 2,
      type: "comment",
      title: "Commentaire ajouté sur la stratégie social media",
      user: "Marie KONE",
      time: "il y a 4h",
      icon: MessageSquare,
      color: "text-blue-600"
    },
    {
      id: 3,
      type: "task_started",
      title: "Début du développement des bannières web",
      user: "Serge ASSALÉ",
      time: "hier",
      icon: Play,
      color: "text-orange-600"
    },
    {
      id: 4,
      type: "milestone",
      title: "Validation client de la phase créative",
      user: "Enos GOUBA",
      time: "il y a 2 jours",
      icon: Target,
      color: "text-purple-600"
    }
  ];

  const activeTasks = [
    {
      id: 1,
      title: "Création bannières web responsive",
      assignee: "Paul OUEDRAOGO",
      status: "En cours",
      priority: "Haute",
      dueDate: "25 Jan",
      progress: 60
    },
    {
      id: 2,
      title: "Rédaction posts réseaux sociaux",
      assignee: "Marie KONE", 
      status: "En attente",
      priority: "Moyenne",
      dueDate: "27 Jan",
      progress: 30
    },
    {
      id: 3,
      title: "Montage vidéo publicitaire",
      assignee: "Enos GOUBA",
      status: "En cours",
      priority: "Haute",
      dueDate: "30 Jan",
      progress: 85
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En cours': return 'bg-green-100 text-green-800';
      case 'En attente': return 'bg-orange-100 text-orange-800';
      case 'Terminé': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Haute': return 'bg-red-100 text-red-800';
      case 'Moyenne': return 'bg-yellow-100 text-yellow-800';
      case 'Basse': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--jofe-white)]">
      <TopNavBar />
      <div className="lg:ml-72">
        
        <div className="w-full overflow-auto">
          {/* Header avec breadcrumb */}
          <header className="bg-[var(--jofe-white)] border-b border-[var(--jofe-gray)] px-4 md:px-6 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  <Link href="/projects" className="hover:text-[var(--jofe-blue-medium)] transition-colors">
                    Projets
                  </Link>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                  <span className="text-[var(--jofe-blue-deep)] font-medium">{projectData.name}</span>
                </nav>
                
                <div className="flex items-center space-x-4">
                  <Link href="/projects" className="p-2 hover:bg-[var(--jofe-gray)] rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5 text-[var(--jofe-blue-medium)]" />
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold text-[var(--jofe-blue-deep)] jofe-font">
                      {projectData.name}
                    </h1>
                    <p className="text-[var(--jofe-blue-medium)] mt-1">{projectData.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge className={getStatusColor(projectData.status)}>
                  {projectData.status}
                </Badge>
                <Button className="bg-[var(--jofe-orange)] hover:bg-orange-600 text-white" data-testid="btn-new-task">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle Tâche
                </Button>
              </div>
            </div>
          </header>

          <main className="px-4 md:px-6 py-6 space-y-6">
            {/* KPIs du projet */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpis.map((kpi, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${kpi.color}`}>
                      <kpi.icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      kpi.changeType === 'positive' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {kpi.change}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--jofe-blue-deep)] mb-1">
                    {kpi.value}
                  </h3>
                  <p className="text-sm text-[var(--jofe-blue-medium)]">{kpi.title}</p>
                </Card>
              ))}
            </div>

            {/* Contenu principal en deux colonnes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Colonne principale */}
              <div className="lg:col-span-2 space-y-6">
                {/* Progression du projet */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[var(--jofe-blue-deep)] jofe-font">
                      Progression du Projet
                    </h3>
                    <span className="text-2xl font-bold text-[var(--jofe-blue-deep)]">
                      {projectData.progress}%
                    </span>
                  </div>
                  <Progress value={projectData.progress} className="h-3 mb-4" />
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-[var(--jofe-blue-medium)]">Début</p>
                      <p className="font-medium text-[var(--jofe-blue-deep)]">{projectData.startDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--jofe-blue-medium)]">Budget utilisé</p>
                      <p className="font-medium text-[var(--jofe-blue-deep)]">
                        {(projectData.spent / 1000000).toFixed(1)}M FCFA
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--jofe-blue-medium)]">Fin prévue</p>
                      <p className="font-medium text-[var(--jofe-blue-deep)]">{projectData.endDate}</p>
                    </div>
                  </div>
                </Card>

                {/* Tâches actives */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[var(--jofe-blue-deep)] jofe-font">
                      Tâches Actives
                    </h3>
                    <Button variant="outline" size="sm" className="border-[var(--jofe-gray)] text-[var(--jofe-blue-medium)]">
                      Voir toutes
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {activeTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 border border-[var(--jofe-gray)] rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-[var(--jofe-blue-deep)] mb-2">
                            {task.title}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-[var(--jofe-blue-medium)]">
                            <span>Assigné à: {task.assignee}</span>
                            <Badge className={getStatusColor(task.status)} data-testid={`status-${task.id}`}>
                              {task.status}
                            </Badge>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {task.dueDate}
                            </span>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-[var(--jofe-blue-medium)]">Progression</span>
                              <span className="text-[var(--jofe-blue-deep)] font-medium">{task.progress}%</span>
                            </div>
                            <Progress value={task.progress} className="h-2" />
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="ml-4">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Sidebar droite */}
              <div className="space-y-6">
                {/* Équipe du projet */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-[var(--jofe-blue-deep)] jofe-font mb-4">
                    Équipe du Projet
                  </h3>
                  <div className="space-y-3">
                    {projectData.teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-[var(--jofe-blue-light)] text-white font-medium">
                                {member.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                              member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-[var(--jofe-blue-deep)]">{member.name}</p>
                            <p className="text-sm text-[var(--jofe-blue-medium)]">{member.role}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Timeline des activités */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-[var(--jofe-blue-deep)] jofe-font mb-4">
                    Activités Récentes
                  </h3>
                  <div className="space-y-4">
                    {timelineActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full bg-gray-100 ${activity.color}`}>
                          <activity.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--jofe-blue-deep)]">
                            {activity.title}
                          </p>
                          <p className="text-xs text-[var(--jofe-blue-medium)] mt-1">
                            {activity.user} • {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4 border-[var(--jofe-gray)] text-[var(--jofe-blue-medium)]">
                    Voir toute l'activité
                  </Button>
                </Card>

                {/* Informations du projet */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-[var(--jofe-blue-deep)] jofe-font mb-4">
                    Informations du Projet
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--jofe-blue-medium)]">Client:</span>
                      <span className="text-[var(--jofe-blue-deep)] font-medium">{projectData.client}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--jofe-blue-medium)]">Budget total:</span>
                      <span className="text-[var(--jofe-blue-deep)] font-medium">
                        {(projectData.budget / 1000000).toFixed(1)}M FCFA
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--jofe-blue-medium)]">Dépensé:</span>
                      <span className="text-[var(--jofe-blue-deep)] font-medium">
                        {(projectData.spent / 1000000).toFixed(1)}M FCFA
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--jofe-blue-medium)]">Tâches:</span>
                      <span className="text-[var(--jofe-blue-deep)] font-medium">
                        {projectData.tasksCompleted}/{projectData.tasksTotal}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--jofe-blue-medium)]">Statut:</span>
                      <Badge className={getStatusColor(projectData.status)}>
                        {projectData.status}
                      </Badge>
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

export default ProjectDetail;