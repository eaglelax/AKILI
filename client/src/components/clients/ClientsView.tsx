import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Briefcase, Activity, DollarSign, Star } from 'lucide-react';
import type { Client } from '@shared/schema';

export function ClientsView() {
  const [showClientForm, setShowClientForm] = useState(false);

  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { data: clientStats } = useQuery<any>({
    queryKey: ['/api/analytics/clients'],
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

  const getClientInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500' : 'bg-gray-400';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (clientsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Gestion Clients</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
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
        <h2 className="text-2xl font-bold text-foreground">Gestion Clients</h2>
        <Button
          onClick={() => setShowClientForm(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          data-testid="button-create-client"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Client
        </Button>
      </div>

      {/* Client Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border border-border text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-foreground" data-testid="stat-total-clients">
            {clients.length}
          </p>
          <p className="text-sm text-muted-foreground">Clients Total</p>
        </Card>

        <Card className="p-6 border border-border text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-foreground" data-testid="stat-active-clients">
            {clients.filter((c: Client) => c.isActive).length}
          </p>
          <p className="text-sm text-muted-foreground">Clients Actifs</p>
        </Card>

        <Card className="p-6 border border-border text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-foreground" data-testid="stat-monthly-revenue">
            {formatCurrency(
              clients.reduce((sum: number, c: Client) => sum + Number(c.monthlyBudget || 0), 0)
            )}
          </p>
          <p className="text-sm text-muted-foreground">Budget Mensuel Total</p>
        </Card>

        <Card className="p-6 border border-border text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <Star className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-foreground" data-testid="stat-avg-satisfaction">
            {clients.length > 0
              ? (clients.reduce((sum: number, c: Client) => sum + Number(c.satisfaction || 0), 0) / clients.length).toFixed(1)
              : '0.0'
            }
          </p>
          <p className="text-sm text-muted-foreground">Note Satisfaction Moyenne</p>
        </Card>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.length === 0 ? (
          <div className="col-span-full">
            <Card className="p-12 text-center">
              <h3 className="text-lg font-medium text-foreground mb-2">Aucun client</h3>
              <p className="text-muted-foreground mb-4">
                Ajoutez vos premiers clients pour commencer à gérer vos projets.
              </p>
              <Button onClick={() => setShowClientForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un client
              </Button>
            </Card>
          </div>
        ) : (
          clients.map((client: Client) => (
            <Card key={client.id} className="border border-border hover:shadow-lg transition-shadow" data-testid={`card-client-${client.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                        {getClientInitials(client.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div 
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(client.isActive || false)}`}
                      title={client.isActive ? 'Client actif' : 'Client inactif'}
                    ></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground" data-testid={`text-client-name-${client.id}`}>
                      {client.name}
                    </h3>
                    <p className="text-sm text-muted-foreground" data-testid={`text-client-type-${client.id}`}>
                      {client.type || 'Secteur non spécifié'}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={client.isActive ? 'default' : 'secondary'} className="text-xs">
                        {client.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Budget mensuel</span>
                    <span className="text-foreground font-medium" data-testid={`text-client-budget-${client.id}`}>
                      {formatCurrency(client.monthlyBudget || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Revenus totaux</span>
                    <span className="text-foreground font-medium" data-testid={`text-client-revenue-${client.id}`}>
                      {formatCurrency(client.totalRevenue || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fin de contrat</span>
                    <span className="text-foreground font-medium" data-testid={`text-client-contract-end-${client.id}`}>
                      {formatDate(client.contractEndDate)}
                    </span>
                  </div>

                  {client.satisfaction && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Satisfaction</span>
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {renderStars(Math.round(Number(client.satisfaction)))}
                        </div>
                        <span className="text-foreground font-medium" data-testid={`text-client-satisfaction-${client.id}`}>
                          {Number(client.satisfaction).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}

                  {client.contactPerson && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground">Contact</p>
                      <p className="text-sm font-medium text-foreground" data-testid={`text-client-contact-${client.id}`}>
                        {client.contactPerson}
                      </p>
                      {client.email && (
                        <p className="text-xs text-muted-foreground" data-testid={`text-client-email-${client.id}`}>
                          {client.email}
                        </p>
                      )}
                      {client.phone && (
                        <p className="text-xs text-muted-foreground" data-testid={`text-client-phone-${client.id}`}>
                          {client.phone}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Top Clients Table */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Clients Principaux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-sm font-medium text-muted-foreground">Client</th>
                  <th className="text-left py-2 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-right py-2 text-sm font-medium text-muted-foreground">Budget Mensuel</th>
                  <th className="text-right py-2 text-sm font-medium text-muted-foreground">Revenus Totaux</th>
                  <th className="text-center py-2 text-sm font-medium text-muted-foreground">Satisfaction</th>
                </tr>
              </thead>
              <tbody>
                {clients
                  .sort((a: Client, b: Client) => Number(b.totalRevenue || 0) - Number(a.totalRevenue || 0))
                  .slice(0, 10)
                  .map((client: Client) => (
                    <tr key={client.id} className="border-b border-border/50" data-testid={`row-top-client-${client.id}`}>
                      <td className="py-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {getClientInitials(client.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">{client.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {client.type || '-'}
                      </td>
                      <td className="py-3 text-right font-medium text-foreground">
                        {formatCurrency(client.monthlyBudget || 0)}
                      </td>
                      <td className="py-3 text-right font-medium text-foreground">
                        {formatCurrency(client.totalRevenue || 0)}
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-foreground">
                            {Number(client.satisfaction || 0).toFixed(1)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
