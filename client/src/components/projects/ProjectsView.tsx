import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Calendar, DollarSign, Users } from 'lucide-react';
import type { Project, Client } from '@shared/schema';

export function ProjectsView() {
  const [showProjectForm, setShowProjectForm] = useState(false);

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(num).replace('XOF', 'FR CFA');
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'paused': return 'outline';
      case 'planning': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'completed': return 'Terminé';
      case 'paused': return 'En pause';
      case 'planning': return 'Planification';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c: Client) => c.id === clientId);
    return client?.name || 'Client inconnu';
  };

  if (projectsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Gestion des Projets</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-2 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Gestion des Projets</h2>
        <Button
          onClick={() => setShowProjectForm(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          data-testid="button-create-project"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Projet
        </Button>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Projets</p>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-total-projects">
                {projects.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Projets Actifs</p>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-active-projects">
                {projects.filter((p: Project) => p.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Terminés</p>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-completed-projects">
                {projects.filter((p: Project) => p.status === 'completed').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Budget Total</p>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-total-budget">
                {formatCurrency(
                  projects.reduce((sum: number, p: Project) => sum + Number(p.budget || 0), 0)
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full">
            <Card className="p-12 text-center">
              <h3 className="text-lg font-medium text-foreground mb-2">Aucun projet</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par créer votre premier projet.
              </p>
              <Button onClick={() => setShowProjectForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un projet
              </Button>
            </Card>
          </div>
        ) : (
          projects.map((project: Project) => (
            <Card key={project.id} className="border border-border hover:shadow-lg transition-shadow" data-testid={`card-project-${project.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-foreground" data-testid={`text-project-name-${project.id}`}>
                      {project.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1" data-testid={`text-project-description-${project.id}`}>
                      {project.description || 'Aucune description'}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(project.status || 'planning')} data-testid={`badge-project-status-${project.id}`}>
                    {getStatusLabel(project.status || 'planning')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Client</p>
                  <p className="font-medium text-foreground" data-testid={`text-project-client-${project.id}`}>
                    {getClientName(project.clientId || '')}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="text-foreground font-medium" data-testid={`text-project-progress-${project.id}`}>
                      {project.progress || 0}%
                    </span>
                  </div>
                  <Progress value={project.progress || 0} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Budget</p>
                    <p className="font-medium text-foreground" data-testid={`text-project-budget-${project.id}`}>
                      {formatCurrency(project.budget || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Échéance</p>
                    <p className="font-medium text-foreground" data-testid={`text-project-deadline-${project.id}`}>
                      {formatDate(project.deadline)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-muted-foreground">Début</p>
                    <p className="font-medium text-foreground" data-testid={`text-project-start-${project.id}`}>
                      {formatDate(project.startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fin prévue</p>
                    <p className="font-medium text-foreground" data-testid={`text-project-end-${project.id}`}>
                      {formatDate(project.endDate)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Gantt Chart Placeholder */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Diagramme de Gantt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-64 bg-muted rounded-lg p-8 flex items-center justify-center text-center">
            <div>
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Diagramme de Gantt interactif
              </h3>
              <p className="text-muted-foreground">
                Visualisation des timelines de projets avec dépendances et jalons
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Intégration prévue avec une bibliothèque Gantt spécialisée
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
