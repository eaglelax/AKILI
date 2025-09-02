import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Timer } from "@/components/common/Timer";
import { TaskForm } from "./TaskForm";
import { Edit2, Trash2, Activity, Clock, CheckCircle, Watch } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Task, TeamMember, Client } from "@shared/schema";

export function TasksTable() {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: dashboardStats } = useQuery<any>({
    queryKey: ["/api/analytics/dashboard"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await apiRequest("DELETE", `/api/tasks/${taskId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Tâche supprimée",
        description: "La tâche a été supprimée avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

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

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'urgente': return 'destructive';
      case 'haute': return 'secondary';
      case 'moyenne': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'termine': return 'default';
      case 'en_cours': return 'secondary';
      case 'en_pause': return 'outline';
      default: return 'outline';
    }
  };

  const getMemberName = (memberId: string) => {
    const member = teamMembers.find((m: TeamMember) => m.id === memberId);
    return member?.name || 'Non assigné';
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c: Client) => c.id === clientId);
    return client?.name || 'Aucun client';
  };

  const getMemberInitials = (memberId: string) => {
    const member = teamMembers.find((m: TeamMember) => m.id === memberId);
    if (!member) return 'NA';
    return member.name.split(' ').map(n => n[0]).join('').substring(0, 2);
  };

  if (tasksLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tâches Actives</p>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-active-tasks">
                {dashboardStats?.activeTasks || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">En Cours</p>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-in-progress">
                {tasks.filter((t: Task) => t.status === 'en_cours').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-secondary" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Terminées Aujourd'hui</p>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-completed-today">
                {dashboardStats?.completedToday || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Temps Total</p>
              <p className="text-2xl font-bold text-foreground" data-testid="stat-total-time">
                {formatTime(dashboardStats?.totalTime || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Watch className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Task Creation Form */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
          onSubmit={() => {
            setShowTaskForm(false);
            setEditingTask(null);
            queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
          }}
        />
      )}

      {/* Create Task Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowTaskForm(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          data-testid="button-create-task"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle Tâche
        </Button>
      </div>

      {/* Tasks Table */}
      <Card className="border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Tableau de Suivi des Tâches</h3>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-foreground">Tâche</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Assigné</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Client</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Priorité</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Échéance</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Statut</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Temps</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Coût</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Progression</th>
                <th className="text-left p-4 text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-muted-foreground">
                    Aucune tâche trouvée. Créez votre première tâche pour commencer.
                  </td>
                </tr>
              ) : (
                tasks.map((task: Task) => (
                  <tr key={task.id} className="hover:bg-muted/50" data-testid={`row-task-${task.id}`}>
                    <td className="p-4">
                      <div className="font-medium text-foreground" data-testid={`text-task-name-${task.id}`}>
                        {task.name}
                      </div>
                      {task.description && (
                        <div className="text-sm text-muted-foreground" data-testid={`text-task-description-${task.id}`}>
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-medium text-white">
                          {getMemberInitials(task.assignedTo || '')}
                        </div>
                        <span className="text-sm text-foreground" data-testid={`text-assignee-${task.id}`}>
                          {getMemberName(task.assignedTo || '')}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-foreground" data-testid={`text-client-${task.id}`}>
                        {getClientName(task.clientId || '')}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant={getPriorityVariant(task.priority || 'moyenne')} data-testid={`badge-priority-${task.id}`}>
                        {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1) || 'Moyenne'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-foreground" data-testid={`text-deadline-${task.id}`}>
                        {formatDate(task.deadline)}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant={getStatusVariant(task.status || 'en_attente')} data-testid={`badge-status-${task.id}`}>
                        {task.status?.replace('_', ' ').charAt(0).toUpperCase() + task.status?.slice(1).replace('_', ' ') || 'En attente'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-foreground" data-testid={`text-time-${task.id}`}>
                          {formatTime(task.totalTimeSpent || 0)}
                        </span>
                        <Timer 
                          taskId={task.id} 
                          isActive={task.isTimerActive || false}
                          canControl={true} // TODO: Check permissions
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-foreground" data-testid={`text-cost-${task.id}`}>
                        {formatCurrency(task.totalCost || 0)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1">
                          <Progress value={task.progress || 0} className="h-2" />
                        </div>
                        <span className="text-xs text-muted-foreground" data-testid={`text-progress-${task.id}`}>
                          {task.progress || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingTask(task);
                            setShowTaskForm(true);
                          }}
                          data-testid={`button-edit-${task.id}`}
                        >
                          <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(task.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${task.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
