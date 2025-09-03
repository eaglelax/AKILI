import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Users, 
  TrendingUp, 
  Clock, 
  Target, 
  Award,
  BarChart3,
  PieChart,
  Activity,
  Filter,
  Download,
  Calendar,
  User
} from 'lucide-react';
import TopNavBar from '@/components/TopNavBar';
import AdminFloatingMenu from '@/components/AdminFloatingMenu';
import { Link } from 'wouter';

// Données simulées pour l'analyse de productivité
const productivityData = {
  teamMembers: [
    {
      id: 'paul_ouedraogo',
      name: 'Paul Junior OUEDRAOGO',
      role: 'Développeur Frontend',
      productivity: 92,
      tasksCompleted: 45,
      hoursWorked: 168,
      efficiency: 88,
      qualityScore: 95,
      avatar: 'P'
    },
    {
      id: 'fortune_yanogo',
      name: 'Fortune YANOGO',
      role: 'Designer UX/UI',
      productivity: 87,
      tasksCompleted: 38,
      hoursWorked: 165,
      efficiency: 85,
      qualityScore: 92,
      avatar: 'F'
    },
    {
      id: 'bientama_pare',
      name: 'Bientama PARÉ',
      role: 'Chef de Projet',
      productivity: 94,
      tasksCompleted: 52,
      hoursWorked: 172,
      efficiency: 91,
      qualityScore: 98,
      avatar: 'B'
    },
    {
      id: 'linda_kabore',
      name: 'Linda KABORÉ',
      role: 'Développeur Backend',
      productivity: 89,
      tasksCompleted: 41,
      hoursWorked: 166,
      efficiency: 86,
      qualityScore: 94,
      avatar: 'L'
    },
    {
      id: 'marie_traore',
      name: 'Marie TRAORÉ',
      role: 'Marketing Digital',
      productivity: 85,
      tasksCompleted: 36,
      hoursWorked: 160,
      efficiency: 83,
      qualityScore: 89,
      avatar: 'M'
    },
    {
      id: 'ibrahim_kone',
      name: 'Ibrahim KONÉ',
      role: 'Graphiste',
      productivity: 91,
      tasksCompleted: 43,
      hoursWorked: 167,
      efficiency: 89,
      qualityScore: 96,
      avatar: 'I'
    }
  ],
  teamStats: {
    averageProductivity: 89.7,
    totalTasksCompleted: 255,
    totalHoursWorked: 998,
    teamEfficiency: 87.2,
    averageQuality: 94.0
  },
  trends: {
    productivityTrend: '+5.2%',
    efficiencyTrend: '+3.8%',
    qualityTrend: '+2.1%',
    completionTrend: '+8.5%'
  }
};

function ProductivityAnalysis() {
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('ce-mois');
  const [viewMode, setViewMode] = useState<string>('overview');

  const getProductivityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 70) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getProductivityIcon = (score: number) => {
    if (score >= 90) return <TrendingUp className="w-4 h-4" />;
    if (score >= 80) return <Activity className="w-4 h-4" />;
    if (score >= 70) return <BarChart3 className="w-4 h-4" />;
    return <Target className="w-4 h-4" />;
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
                  Analyse Productivité - Équipe & Membres
                </h1>
                <p className="text-sm text-gray-600">
                  Évaluation détaillée des performances individuelles et collectives
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
                  Période
                </label>
                <select 
                  className="w-full px-3 py-2 border border-[var(--jofe-gray)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--jofe-blue-light)] focus:border-transparent"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  data-testid="select-time-range"
                >
                  <option value="cette-semaine">Cette semaine</option>
                  <option value="ce-mois">Ce mois</option>
                  <option value="trimestre">Ce trimestre</option>
                  <option value="annee">Cette année</option>
                </select>
              </div>

              {/* Membre */}
              <div>
                <label className="block text-sm font-medium text-[var(--jofe-blue-deep)] mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Membre
                </label>
                <select 
                  className="w-full px-3 py-2 border border-[var(--jofe-gray)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--jofe-blue-light)] focus:border-transparent"
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  data-testid="select-member"
                >
                  <option value="all">Toute l'équipe</option>
                  {productivityData.teamMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>

              {/* Mode d'affichage */}
              <div>
                <label className="block text-sm font-medium text-[var(--jofe-blue-deep)] mb-2">
                  <BarChart3 className="w-4 h-4 inline mr-1" />
                  Vue
                </label>
                <select 
                  className="w-full px-3 py-2 border border-[var(--jofe-gray)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--jofe-blue-light)] focus:border-transparent"
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  data-testid="select-view-mode"
                >
                  <option value="overview">Vue d'ensemble</option>
                  <option value="detailed">Analyse détaillée</option>
                  <option value="comparison">Comparaison</option>
                  <option value="trends">Tendances</option>
                </select>
              </div>

              {/* Critère de tri */}
              <div>
                <label className="block text-sm font-medium text-[var(--jofe-blue-deep)] mb-2">
                  <Filter className="w-4 h-4 inline mr-1" />
                  Tri
                </label>
                <select 
                  className="w-full px-3 py-2 border border-[var(--jofe-gray)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--jofe-blue-light)] focus:border-transparent"
                  data-testid="select-sort"
                >
                  <option value="productivity">Productivité</option>
                  <option value="efficiency">Efficacité</option>
                  <option value="quality">Qualité</option>
                  <option value="tasks">Tâches complétées</option>
                </select>
              </div>
            </div>
          </Card>

          {/* KPIs Équipe */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8 fade-in">
            <Card className="p-6 border-l-4 border-l-[var(--jofe-blue-medium)] bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Productivité Moyenne</p>
                  <p className="text-2xl font-bold text-[var(--jofe-blue-deep)]">
                    {productivityData.teamStats.averageProductivity}%
                  </p>
                </div>
                <div className="p-3 bg-[var(--jofe-blue-light)] rounded-full">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-green-600 font-medium">{productivityData.trends.productivityTrend}</span>
                <span className="text-gray-500 ml-1">vs mois dernier</span>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Efficacité</p>
                  <p className="text-2xl font-bold text-[var(--jofe-blue-deep)]">
                    {productivityData.teamStats.teamEfficiency}%
                  </p>
                </div>
                <div className="p-3 bg-green-500 rounded-full">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-green-600 font-medium">{productivityData.trends.efficiencyTrend}</span>
                <span className="text-gray-500 ml-1">vs mois dernier</span>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Qualité Moyenne</p>
                  <p className="text-2xl font-bold text-[var(--jofe-blue-deep)]">
                    {productivityData.teamStats.averageQuality}%
                  </p>
                </div>
                <div className="p-3 bg-orange-500 rounded-full">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-green-600 font-medium">{productivityData.trends.qualityTrend}</span>
                <span className="text-gray-500 ml-1">vs mois dernier</span>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tâches Complétées</p>
                  <p className="text-2xl font-bold text-[var(--jofe-blue-deep)]">
                    {productivityData.teamStats.totalTasksCompleted}
                  </p>
                </div>
                <div className="p-3 bg-purple-500 rounded-full">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-green-600 font-medium">{productivityData.trends.completionTrend}</span>
                <span className="text-gray-500 ml-1">vs mois dernier</span>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-teal-500 bg-gradient-to-r from-teal-50 to-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Heures Travaillées</p>
                  <p className="text-2xl font-bold text-[var(--jofe-blue-deep)]">
                    {productivityData.teamStats.totalHoursWorked}h
                  </p>
                </div>
                <div className="p-3 bg-teal-500 rounded-full">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-blue-600 font-medium">Cette période</span>
              </div>
            </Card>
          </div>

          {/* Classement des Membres */}
          <Card className="p-6 mb-8 border border-[var(--jofe-gray)] fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--jofe-blue-deep)] jofe-font flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Classement de Productivité
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Trié par</span>
                <span className="text-sm font-medium text-[var(--jofe-blue-medium)]">Productivité</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-[var(--jofe-gray)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Rang</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Membre</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Productivité</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Efficacité</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Qualité</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Tâches</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Heures</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--jofe-gray)]">
                  {productivityData.teamMembers
                    .sort((a, b) => b.productivity - a.productivity)
                    .map((member, index) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors" data-testid={`row-member-${member.id}`}>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          {index === 0 && <Award className="w-4 h-4 text-yellow-500 mr-2" />}
                          {index === 1 && <Award className="w-4 h-4 text-gray-400 mr-2" />}
                          {index === 2 && <Award className="w-4 h-4 text-orange-500 mr-2" />}
                          <span className="font-bold text-[var(--jofe-blue-deep)]">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[var(--jofe-blue-medium)] text-white rounded-full flex items-center justify-center font-medium">
                            {member.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-[var(--jofe-blue-deep)]">{member.name}</p>
                            <p className="text-sm text-gray-600">{member.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getProductivityColor(member.productivity)}`}>
                          {getProductivityIcon(member.productivity)}
                          <span>{member.productivity}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-medium text-[var(--jofe-blue-deep)]">{member.efficiency}%</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-medium text-[var(--jofe-blue-deep)]">{member.qualityScore}%</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-medium text-[var(--jofe-blue-deep)]">{member.tasksCompleted}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-medium text-[var(--jofe-blue-deep)]">{member.hoursWorked}h</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Graphiques d'Analyse */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            {/* Graphique de distribution */}
            <Card className="p-6 border border-[var(--jofe-gray)] fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[var(--jofe-blue-deep)] jofe-font flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Distribution par Niveau
                </h3>
                <button className="text-gray-500 hover:text-[var(--jofe-blue-medium)] transition-colors">
                  <Download className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-gray-700">Excellent (90%+)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[var(--jofe-blue-deep)]">2 membres</span>
                    <span className="text-sm text-gray-600 ml-2">(33%)</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-gray-700">Très Bon (80-89%)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[var(--jofe-blue-deep)]">4 membres</span>
                    <span className="text-sm text-gray-600 ml-2">(67%)</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <span className="font-medium text-gray-700">Bon (70-79%)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[var(--jofe-blue-deep)]">0 membre</span>
                    <span className="text-sm text-gray-600 ml-2">(0%)</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tendances d'évolution */}
            <Card className="p-6 border border-[var(--jofe-gray)] fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[var(--jofe-blue-deep)] jofe-font flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Évolution des Performances
                </h3>
                <button className="text-gray-500 hover:text-[var(--jofe-blue-medium)] transition-colors">
                  <Download className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Productivité Générale</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-green-600">+5.2%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Efficacité d'Équipe</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-green-600">+3.8%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Score de Qualité</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-green-600">+2.1%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Tâches Complétées</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-green-600">+8.5%</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Recommandations */}
          <Card className="p-6 border border-[var(--jofe-gray)] fade-in">
            <h3 className="text-lg font-bold text-[var(--jofe-blue-deep)] jofe-font mb-6 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Recommandations d'Amélioration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-[var(--jofe-blue-deep)] mb-2">Points Forts de l'Équipe</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Excellent niveau général de productivité (89.7%)</li>
                  <li>• Qualité des livrables très élevée (94%)</li>
                  <li>• Progression constante des performances</li>
                  <li>• Forte implication de tous les membres</li>
                </ul>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-medium text-[var(--jofe-blue-deep)] mb-2">Axes d'Amélioration</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Formation continue sur les nouvelles technologies</li>
                  <li>• Optimisation des processus de travail</li>
                  <li>• Renforcement de la collaboration inter-équipes</li>
                  <li>• Mise en place d'objectifs SMART personnalisés</li>
                </ul>
              </div>
            </div>
          </Card>

        </main>
      </div>
    </div>
  );
}

export default ProductivityAnalysis;