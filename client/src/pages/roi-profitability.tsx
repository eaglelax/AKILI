import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  DollarSign, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Target,
  PieChart,
  Download,
  Calendar,
  Filter,
  Building,
  Calculator
} from 'lucide-react';
import TopNavBar from '@/components/TopNavBar';
import AdminFloatingMenu from '@/components/AdminFloatingMenu';
import { Link } from 'wouter';

// Données simulées pour l'analyse ROI et rentabilité
const roiData = {
  kpis: {
    averageROI: 32.4,
    totalRevenue: 18200000,
    totalCosts: 11800000,
    netProfit: 6400000,
    trends: {
      roi: '+5.2%',
      revenue: '+12.8%',
      costs: '-2.1%',
      profit: '+18.5%'
    }
  },
  
  topClients: [
    {
      id: 1,
      name: 'MOOV AFRICA',
      sector: 'Télécommunications',
      revenue: 4800000,
      costs: 2950000,
      margin: 1850000,
      roi: 62.7,
      trend: 'up'
    },
    {
      id: 2,
      name: 'BANK OF AFRICA',
      sector: 'Banque/Finance',
      revenue: 3650000,
      costs: 2180000,
      margin: 1470000,
      roi: 67.4,
      trend: 'up'
    },
    {
      id: 3,
      name: 'ROXGOLD',
      sector: 'Mining/Or',
      revenue: 2890000,
      costs: 1650000,
      margin: 1240000,
      roi: 75.2,
      trend: 'up'
    },
    {
      id: 4,
      name: 'SUNU BURKINA',
      sector: 'Assurance',
      revenue: 2340000,
      costs: 1450000,
      margin: 890000,
      roi: 61.4,
      trend: 'up'
    },
    {
      id: 5,
      name: 'TOTAL BURKINA',
      sector: 'Pétrole/Énergie',
      revenue: 2180000,
      costs: 1380000,
      margin: 800000,
      roi: 58.0,
      trend: 'down'
    },
    {
      id: 6,
      name: 'ORANGE BURKINA',
      sector: 'Télécommunications',
      revenue: 1950000,
      costs: 1200000,
      margin: 750000,
      roi: 62.5,
      trend: 'up'
    },
    {
      id: 7,
      name: 'BRAKINA',
      sector: 'Brasserie',
      revenue: 1680000,
      costs: 980000,
      margin: 700000,
      roi: 71.4,
      trend: 'up'
    },
    {
      id: 8,
      name: 'BURKINA FASO MINES',
      sector: 'Mining/Or',
      revenue: 1520000,
      costs: 920000,
      margin: 600000,
      roi: 65.2,
      trend: 'up'
    },
    {
      id: 9,
      name: 'CORIS BANK',
      sector: 'Banque/Finance',
      revenue: 1350000,
      costs: 850000,
      margin: 500000,
      roi: 58.8,
      trend: 'down'
    },
    {
      id: 10,
      name: 'SOCIÉTÉ GÉNÉRALE',
      sector: 'Banque/Finance',
      revenue: 1280000,
      costs: 800000,
      margin: 480000,
      roi: 60.0,
      trend: 'up'
    }
  ],

  projectCategories: [
    { name: 'Campagnes Digitales', roi: 45.2, volume: 8, revenue: 5200000 },
    { name: 'Branding & Identité', roi: 38.7, volume: 12, revenue: 4800000 },
    { name: 'Sites Web & Apps', roi: 52.1, volume: 6, revenue: 3600000 },
    { name: 'Production Vidéo', roi: 28.9, volume: 15, revenue: 2400000 },
    { name: 'Événementiel', roi: 35.4, volume: 8, revenue: 2000000 }
  ]
};

function RoiProfitability() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ce-mois');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [viewMode, setViewMode] = useState<string>('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('CFA', 'FCFA');
  };

  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white';
      case 2: return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white';
      case 3: return 'bg-gradient-to-br from-orange-400 to-red-500 text-white';
      default: return 'bg-[var(--jofe-gray)] text-[var(--jofe-blue-deep)]';
    }
  };

  const getRoiColor = (roi: number) => {
    if (roi >= 60) return 'text-green-600';
    if (roi >= 40) return 'text-blue-600';
    if (roi >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-[var(--jofe-white)]">
      <TopNavBar />
      <AdminFloatingMenu />
      
      <div className="w-full overflow-auto">
        {/* Header */}
        <header className="bg-[var(--jofe-white)] border-b border-[var(--jofe-gray)] px-4 md:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <Link href="/analytics" className="p-2 hover:bg-[var(--jofe-gray)] rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-[var(--jofe-blue-medium)]" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-[var(--jofe-blue-deep)] jofe-font">
                  Analyse ROI et Rentabilité
                </h1>
                <p className="text-sm text-gray-600">
                  Vue d'ensemble des performances financières par client et projet
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 bg-[var(--jofe-blue-medium)] text-white rounded-lg hover:bg-[var(--jofe-blue-deep)] transition-colors flex items-center space-x-2" data-testid="button-export">
                <Download className="w-4 h-4" />
                <span>Exporter</span>
              </button>
            </div>
          </div>
        </header>

        {/* Contenu Principal */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Filtres */}
          <Card className="p-6 mb-8 border border-[var(--jofe-gray)] fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Période */}
              <div>
                <label className="block text-sm font-medium text-[var(--jofe-blue-deep)] mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Période d'analyse
                </label>
                <select 
                  className="w-full px-3 py-2 border border-[var(--jofe-gray)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--jofe-blue-light)] focus:border-transparent"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  data-testid="select-period"
                >
                  <option value="cette-semaine">Cette semaine</option>
                  <option value="ce-mois">Ce mois</option>
                  <option value="trimestre">Ce trimestre</option>
                  <option value="semestre">Ce semestre</option>
                  <option value="annee">Cette année</option>
                </select>
              </div>

              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-[var(--jofe-blue-deep)] mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  Client spécifique
                </label>
                <select 
                  className="w-full px-3 py-2 border border-[var(--jofe-gray)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--jofe-blue-light)] focus:border-transparent"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  data-testid="select-client"
                >
                  <option value="all">Tous les clients</option>
                  {roiData.topClients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              {/* Mode d'affichage */}
              <div>
                <label className="block text-sm font-medium text-[var(--jofe-blue-deep)] mb-2">
                  <BarChart3 className="w-4 h-4 inline mr-1" />
                  Mode d'affichage
                </label>
                <select 
                  className="w-full px-3 py-2 border border-[var(--jofe-gray)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--jofe-blue-light)] focus:border-transparent"
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  data-testid="select-view-mode"
                >
                  <option value="overview">Vue d'ensemble</option>
                  <option value="detailed">Analyse détaillée</option>
                  <option value="comparison">Comparaison clients</option>
                  <option value="trends">Tendances temporelles</option>
                </select>
              </div>

              {/* Critère de tri */}
              <div>
                <label className="block text-sm font-medium text-[var(--jofe-blue-deep)] mb-2">
                  <Filter className="w-4 h-4 inline mr-1" />
                  Tri par
                </label>
                <select 
                  className="w-full px-3 py-2 border border-[var(--jofe-gray)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--jofe-blue-light)] focus:border-transparent"
                  data-testid="select-sort"
                >
                  <option value="roi">ROI décroissant</option>
                  <option value="revenue">Chiffre d'affaires</option>
                  <option value="margin">Marge bénéficiaire</option>
                  <option value="volume">Volume de projets</option>
                </select>
              </div>
            </div>
          </Card>

          {/* KPIs Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 fade-in">
            <Card className="p-6 border-l-4 border-l-[var(--jofe-blue-medium)] bg-gradient-to-r from-blue-50 to-white hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-[var(--jofe-blue-light)] rounded-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[var(--jofe-blue-deep)]">{roiData.kpis.averageROI}%</p>
                  <p className="text-sm text-gray-600">ROI Moyen</p>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-600 font-medium">{roiData.kpis.trends.roi}</span>
                <span className="text-gray-500 ml-1">vs mois dernier</span>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[var(--jofe-blue-deep)]">{formatCurrency(roiData.kpis.totalRevenue).replace('FCFA', 'M')}</p>
                  <p className="text-sm text-gray-600">CA Total (FCFA)</p>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-600 font-medium">{roiData.kpis.trends.revenue}</span>
                <span className="text-gray-500 ml-1">vs année dernière</span>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-white hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500 rounded-lg">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[var(--jofe-blue-deep)]">{formatCurrency(roiData.kpis.totalCosts).replace('FCFA', 'M')}</p>
                  <p className="text-sm text-gray-600">Coûts Total (FCFA)</p>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <TrendingDown className="w-4 h-4 text-orange-600 mr-1" />
                <span className="text-orange-600 font-medium">{roiData.kpis.trends.costs}</span>
                <span className="text-gray-500 ml-1">optimisé</span>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-white hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[var(--jofe-blue-deep)]">{formatCurrency(roiData.kpis.netProfit).replace('FCFA', 'M')}</p>
                  <p className="text-sm text-gray-600">Bénéfice Net (FCFA)</p>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-600 font-medium">{roiData.kpis.trends.profit}</span>
                <span className="text-gray-500 ml-1">vs objectif</span>
              </div>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* ROI par catégorie de projet */}
            <Card className="p-6 border border-[var(--jofe-gray)] fade-in hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[var(--jofe-blue-deep)] jofe-font flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  ROI par Type de Projet
                </h3>
                <button className="text-gray-500 hover:text-[var(--jofe-blue-medium)] transition-colors">
                  <Download className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {roiData.projectCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-[var(--jofe-blue-deep)]">{category.name}</span>
                        <span className={`font-bold ${getRoiColor(category.roi)}`}>{category.roi}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{category.volume} projets</span>
                        <span>{formatCurrency(category.revenue)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-gradient-to-r from-[var(--jofe-blue-medium)] to-[var(--jofe-blue-light)] h-2 rounded-full transition-all duration-1000" 
                          style={{ width: `${(category.roi / 60) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Évolution mensuelle */}
            <Card className="p-6 border border-[var(--jofe-gray)] fade-in hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[var(--jofe-blue-deep)] jofe-font flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Évolution Mensuelle
                </h3>
                <button className="text-gray-500 hover:text-[var(--jofe-blue-medium)] transition-colors">
                  <Download className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Revenus vs Coûts</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-green-600">Marge: 35.1%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Nombre de Clients Actifs</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-[var(--jofe-blue-deep)]">33 clients</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Projets Terminés</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-[var(--jofe-blue-deep)]">156 projets</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Satisfaction Moyenne</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-[var(--jofe-blue-deep)]">4.8/5</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Top Clients Table */}
          <Card className="p-6 border border-[var(--jofe-gray)] fade-in hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[var(--jofe-blue-deep)] jofe-font">
                Top 10 Clients les Plus Rentables
              </h3>
              <button className="px-4 py-2 bg-[var(--jofe-blue-light)] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Exporter</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-[var(--jofe-gray)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Rang</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Client</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">CA (FCFA)</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Coûts (FCFA)</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Marge</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">ROI (%)</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Tendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--jofe-gray)]">
                  {roiData.topClients.map((client, index) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors" data-testid={`row-client-${client.id}`}>
                      <td className="px-4 py-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankBadgeClass(client.id)}`}>
                          {client.id}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium text-[var(--jofe-blue-deep)]">{client.name}</div>
                          <div className="text-sm text-gray-500">{client.sector}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-[var(--jofe-blue-deep)]">
                        {formatCurrency(client.revenue)}
                      </td>
                      <td className="px-4 py-4 text-right text-gray-600">
                        {formatCurrency(client.costs)}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-green-600">
                        {formatCurrency(client.margin)}
                      </td>
                      <td className={`px-4 py-4 text-right font-bold ${getRoiColor(client.roi)}`}>
                        {client.roi}%
                      </td>
                      <td className="px-4 py-4 text-center">
                        {client.trend === 'up' ? (
                          <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-orange-600 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

        </main>
      </div>
    </div>
  );
}

export default RoiProfitability;