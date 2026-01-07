import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, UserPlus, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import type { TeamMember } from '@shared/schema';

export function TeamView() {
  const [showMemberForm, setShowMemberForm] = useState(false);

  const { data: teamMembers = [], isLoading: membersLoading } = useQuery<TeamMember[]>({
    queryKey: ['/api/team-members'],
  });

  const { data: teamStats } = useQuery<any>({
    queryKey: ['/api/analytics/team'],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-gray-400';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online': return 'En ligne';
      case 'offline': return 'Hors ligne';
      case 'busy': return 'Occupé';
      case 'away': return 'Absent';
      default: return 'Inconnu';
    }
  };

  const getMemberInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(num).replace('XOF', 'FR CFA');
  };

  if (membersLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Gestion d'Équipe</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-12 w-12 bg-muted rounded-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
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
        <h2 className="text-2xl font-bold text-foreground">Gestion d'Équipe</h2>
        <Button
          onClick={() => setShowMemberForm(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          data-testid="button-add-member"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Ajouter Membre
        </Button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border border-border text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground" data-testid="stat-total-members">
            {teamMembers.length}
          </p>
          <p className="text-sm text-muted-foreground">Membres Total</p>
        </Card>

        <Card className="p-6 border border-border text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-foreground" data-testid="stat-online-members">
            {teamStats?.onlineMembers || 0}
          </p>
          <p className="text-sm text-muted-foreground">En Ligne</p>
        </Card>

        <Card className="p-6 border border-border text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-foreground" data-testid="stat-busy-members">
            {teamMembers.filter((m: TeamMember) => m.status === 'busy' || m.status === 'away').length}
          </p>
          <p className="text-sm text-muted-foreground">Occupés/Absents</p>
        </Card>

        <Card className="p-6 border border-border text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-foreground" data-testid="stat-avg-performance">
            87%
          </p>
          <p className="text-sm text-muted-foreground">Productivité Moyenne</p>
        </Card>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.length === 0 ? (
          <div className="col-span-full">
            <Card className="p-12 text-center">
              <h3 className="text-lg font-medium text-foreground mb-2">Aucun membre d'équipe</h3>
              <p className="text-muted-foreground mb-4">
                Ajoutez des membres pour commencer la collaboration.
              </p>
              <Button onClick={() => setShowMemberForm(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Ajouter un membre
              </Button>
            </Card>
          </div>
        ) : (
          teamMembers.map((member: TeamMember) => (
            <Card key={member.id} className="border border-border hover:shadow-lg transition-shadow" data-testid={`card-member-${member.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                        {getMemberInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div 
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status || 'offline')}`}
                      title={getStatusLabel(member.status || 'offline')}
                    ></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground" data-testid={`text-member-name-${member.id}`}>
                      {member.name}
                      {member.isAdmin && (
                        <Badge variant="secondary" className="ml-2 text-xs">Admin</Badge>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground" data-testid={`text-member-role-${member.id}`}>
                      {member.role}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(member.status || 'offline')}`}></div>
                      <span className="text-xs text-muted-foreground" data-testid={`text-member-status-${member.id}`}>
                        {getStatusLabel(member.status || 'offline')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {member.skills && member.skills.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Compétences</p>
                      <div className="flex flex-wrap gap-1">
                        {member.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs" data-testid={`badge-skill-${member.id}-${index}`}>
                            {skill}
                          </Badge>
                        ))}
                        {member.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Placeholder performance metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-border">
                    <div>
                      <p className="text-lg font-semibold text-foreground" data-testid={`text-member-tasks-${member.id}`}>
                        12
                      </p>
                      <p className="text-xs text-muted-foreground">Tâches</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground" data-testid={`text-member-hours-${member.id}`}>
                        35h
                      </p>
                      <p className="text-xs text-muted-foreground">Cette semaine</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-green-600" data-testid={`text-member-performance-${member.id}`}>
                        92%
                      </p>
                      <p className="text-xs text-muted-foreground">Performance</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Role Distribution */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Répartition par Rôle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from(new Set(teamMembers.map((m: TeamMember) => m.role))).map((role) => {
              const count = teamMembers.filter((m: TeamMember) => m.role === role).length;
              const percentage = (count / teamMembers.length) * 100;
              
              return (
                <div key={role} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground font-medium">{role}</span>
                    <span className="text-muted-foreground">{count} membre{count > 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
