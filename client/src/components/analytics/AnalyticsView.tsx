import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Zap, Package, Users, Clock, BarChart3 } from 'lucide-react';
import type { PerformanceData } from '@/types';

export function AnalyticsView() {
  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/analytics/dashboard'],
  });

  const { data: teamStats } = useQuery({
    queryKey: ['/api/analytics/team'],
  });

  const { data: clientStats } = useQuery({
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Mock performance data for demonstration
  const performanceData: PerformanceData[] = [
    { member: "Serge ASSALÉ", tasksCompleted: 28, totalHours: 142.5, revenue: 2850000, performance: 92 },
    { member: "Paul OUEDRAOGO", tasksCompleted: 24, totalHours: 118.75, revenue: 1920000, performance: 88 },
    { member: "Abdoul OUEDRAOGO", tasksCompleted: 22, totalHours: 110, revenue: 1650000, performance: 85 },
    { member: "Linda KABORÉ", tasksCompleted: 20, totalHours: 105, revenue: 1575000, performance: 83 },
    { member: "Fortune YANOGO", tasksCompleted: 18, totalHours: 95, revenue: 1425000, performance: 80 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Analytics & Rapports</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">ROI Moyen</p>
              <p className="text-2xl font-bold text-foreground" data-testid="kpi-roi">285%</p>
              <p className="text-sm text-green-600">+12% vs mois dernier</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Productivité</p>
              <p className="text-2xl font-bold text-foreground" data-testid="kpi-productivity">87%</p>
              <p className="text-sm text-yellow-600">-3% vs mois dernier</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Coût/Heure Moyen</p>
              <p className="text-2xl font-bold text-foreground" data-testid="kpi-hourly-cost">5,250</p>
              <p className="text-sm text-muted-foreground">FR CFA</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Projets Livrés</p>
              <p className="text-2xl font-bold text-foreground" data-testid="kpi-delivered-projects">42</p>
              <p className="text-sm text-green-600">+8 ce mois</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Évolution du Chiffre d'Affaires</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center text-center">
              <div>
                <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Graphique de revenus mensuel
                </h3>
                <p className="text-muted-foreground text-sm">
                  Utilisation de Chart.js ou D3.js pour la visualisation
                </p>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Tendance: <span className="text-green-600 font-medium">+15% ce mois</span></p>
                  <p>Prévision: <span className="text-blue-600 font-medium">12.8M FR CFA</span></p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Répartition par Type de Projet</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center text-center">
              <div>
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Graphique en secteurs
                </h3>
                <p className="text-muted-foreground text-sm">
                  Branding, Web, Print, Digital
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center">
                    <div className="w-3 h-3 bg-primary rounded-full mx-auto mb-1"></div>
                    <p className="text-muted-foreground">Branding 35%</p>
                  </div>
                  <div className="text-center">
                    <div className="w-3 h-3 bg-secondary rounded-full mx-auto mb-1"></div>
                    <p className="text-muted-foreground">Digital 30%</p>
                  </div>
                  <div className="text-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
                    <p className="text-muted-foreground">Web 20%</p>
                  </div>
                  <div className="text-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-1"></div>
                    <p className="text-muted-foreground">Print 15%</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance Table */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Performance par Membre</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-foreground">Membre</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground">Tâches Terminées</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground">Temps Total</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground">Revenus Générés</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {performanceData.map((data, index) => (
                  <tr key={data.member} className="hover:bg-muted/50" data-testid={`row-performance-${index}`}>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-medium text-white">
                          {data.member.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <span className="font-medium text-foreground" data-testid={`text-member-${index}`}>
                          {data.member}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-foreground" data-testid={`text-tasks-${index}`}>
                      {data.tasksCompleted}
                    </td>
                    <td className="p-4 text-foreground" data-testid={`text-hours-${index}`}>
                      {data.totalHours}h
                    </td>
                    <td className="p-4 text-foreground" data-testid={`text-revenue-${index}`}>
                      {formatCurrency(data.revenue)}
                    </td>
                    <td className="p-4">
                      <Badge 
                        variant={data.performance >= 90 ? 'default' : data.performance >= 80 ? 'secondary' : 'outline'}
                        className={data.performance >= 90 ? 'bg-green-100 text-green-800' : ''}
                        data-testid={`badge-performance-${index}`}
                      >
                        {data.performance}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base">Temps de Réponse Moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="metric-response-time">2.3h</p>
                <p className="text-sm text-muted-foreground">Pour les demandes clients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base">Taux de Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="metric-satisfaction">94.2%</p>
                <p className="text-sm text-muted-foreground">Moyenne clients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-base">Efficacité Opérationnelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <Zap className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="metric-efficiency">87.5%</p>
                <p className="text-sm text-muted-foreground">Délais respectés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Répartition des Revenus par Service</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { service: "Design & Branding", revenue: 4200000, percentage: 35, color: "bg-primary" },
              { service: "Marketing Digital", revenue: 3600000, percentage: 30, color: "bg-secondary" },
              { service: "Développement Web", revenue: 2400000, percentage: 20, color: "bg-green-500" },
              { service: "Print & Production", revenue: 1800000, percentage: 15, color: "bg-purple-500" },
            ].map((item, index) => (
              <div key={item.service} className="space-y-2" data-testid={`revenue-breakdown-${index}`}>
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-medium">{item.service}</span>
                  <div className="text-right">
                    <span className="text-foreground font-medium">{formatCurrency(item.revenue)}</span>
                    <span className="text-muted-foreground text-sm ml-2">({item.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`${item.color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
