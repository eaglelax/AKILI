import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Star,
  FolderOpen,
  ChevronRight,
  Clock,
  LayoutDashboard,
  TrendingDown,
  Download,
  Calendar,
  Building2,
  FileBarChart
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import TopNavBar from "@/components/TopNavBar";
import AdminFloatingMenu from "@/components/AdminFloatingMenu";

// Données pour les graphiques
const revenueEvolutionData = [
  { period: "S1", revenue: 1250000, target: 1200000 },
  { period: "S2", revenue: 1380000, target: 1300000 },
  { period: "S3", revenue: 1120000, target: 1250000 },
  { period: "S4", revenue: 1460000, target: 1400000 },
  { period: "S5", revenue: 1680000, target: 1500000 },
  { period: "S6", revenue: 1528000, target: 1450000 }
];

const memberPerformanceData = [
  { name: "Paul Jr.", productivity: 94, efficiency: 89, satisfaction: 4.8 },
  { name: "Fortune", productivity: 87, efficiency: 85, satisfaction: 4.6 },
  { name: "Linda", productivity: 83, efficiency: 88, satisfaction: 4.7 },
  { name: "Bientama", productivity: 81, efficiency: 82, satisfaction: 4.5 },
  { name: "Florita", productivity: 79, efficiency: 84, satisfaction: 4.4 },
  { name: "Nebié", productivity: 77, efficiency: 78, satisfaction: 4.3 }
];

const projectDistributionData = [
  { name: "Terminés", value: 45, color: "#93C954" },
  { name: "En cours", value: 23, color: "#37B6E9" },
  { name: "En attente", value: 8, color: "#F68C1F" },
  { name: "En révision", value: 5, color: "#3475BB" }
];

const detailedProjectData = [
  { 
    project: "Campagne MOOV AFRICA", 
    client: "MOOV AFRICA", 
    startDate: "15/12/2024", 
    endDate: "20/01/2025", 
    budget: 2400000, 
    spent: 1680000, 
    progress: 85, 
    status: "En cours" 
  },
  { 
    project: "Site Web BOA", 
    client: "BANK OF AFRICA", 
    startDate: "10/01/2025", 
    endDate: "28/02/2025", 
    budget: 1800000, 
    spent: 890000, 
    progress: 45, 
    status: "En cours" 
  },
  { 
    project: "Branding SUNU", 
    client: "SUNU BURKINA", 
    startDate: "05/01/2025", 
    endDate: "15/02/2025", 
    budget: 1200000, 
    spent: 1150000, 
    progress: 95, 
    status: "Terminé" 
  },
  { 
    project: "Marketing ROXGOLD", 
    client: "ROXGOLD", 
    startDate: "20/12/2024", 
    endDate: "10/02/2025", 
    budget: 950000, 
    spent: 420000, 
    progress: 35, 
    status: "En cours" 
  }
];

// Formater les montants FCFA
const formatFCFA = (amount: number) => {
  return new Intl.NumberFormat('fr-FR').format(amount);
};

// Composant Metric Card pour les KPI
interface MetricCardProps {
  title: string;
  value: string;
  suffix?: string;
  icon: React.ComponentType<any>;
  trend?: 'positive' | 'negative' | 'stable';
  trendValue?: string;
  delay?: number;
}

const MetricCard = ({ title, value, suffix = "", icon: Icon, trend, trendValue, delay = 0 }: MetricCardProps) => (
  <div 
    className="bg-gradient-to-br from-[#162C54] to-[#1A4278] text-white p-6 rounded-xl relative overflow-hidden transition-all duration-300 hover:shadow-lg animate-in fade-in slide-in-from-bottom-4"
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Effet de brillance */}
    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
    
    <div className="flex items-center justify-between mb-3">
      <Icon className="w-8 h-8 text-white/80" />
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-medium ${
          trend === 'positive' ? 'text-[#93C954]' : trend === 'negative' ? 'text-[#F68C1F]' : 'text-white/70'
        }`}>
          {trend === 'positive' && <TrendingUp className="w-4 h-4" />}
          {trend === 'negative' && <TrendingDown className="w-4 h-4" />}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
    
    <div className="text-3xl font-bold mb-1">
      {value}
      {suffix && <span className="text-lg ml-1">{suffix}</span>}
    </div>
    <p className="text-white/70 text-sm">{title}</p>
  </div>
);

// Composant Chart Card
interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const ChartCard = ({ title, children, actions }: ChartCardProps) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold text-[#162C54] flex items-center gap-2">
        <FileBarChart className="w-5 h-5 text-[#37B6E9]" />
        {title}
      </h3>
      {actions}
    </div>
    {children}
  </div>
);

// Composant Filter Chip
interface FilterChipProps {
  label: string;
  active?: boolean;
  onClick: () => void;
}

const FilterChip = ({ label, active = false, onClick }: FilterChipProps) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
      active 
        ? 'bg-[#3475BB] text-white shadow-md' 
        : 'bg-gray-100 text-[#162C54] hover:bg-[#37B6E9] hover:text-white'
    }`}
    data-testid={`filter-${label.toLowerCase().replace(' ', '-')}`}
  >
    {label}
  </button>
);

// Composant Export Button
interface ExportButtonProps {
  type: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
}

const ExportButton = ({ type, icon: Icon, onClick }: ExportButtonProps) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-[#162C54] rounded-lg font-medium transition-all duration-200 hover:border-[#F68C1F] hover:bg-orange-50 hover:text-[#F68C1F]"
    data-testid={`export-${type.toLowerCase()}`}
  >
    <Icon className="w-4 h-4" />
    {type}
  </button>
);

// Composant Progress Bar
const ProgressBar = ({ percentage, className = "" }: { percentage: number; className?: string }) => (
  <div className={`w-full h-2 bg-gray-100 rounded-full overflow-hidden ${className}`}>
    <div 
      className="h-full bg-gradient-to-r from-[#37B6E9] to-[#3475BB] transition-all duration-700 ease-out"
      style={{ width: `${percentage}%` }}
    ></div>
  </div>
);

// Composant Status Badge
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'terminé':
      return 'bg-[#93C954] text-white';
    case 'en cours':
      return 'bg-[#37B6E9] text-white';
    case 'en attente':
      return 'bg-[#F68C1F] text-white';
    case 'en révision':
      return 'bg-[#3475BB] text-white';
    default:
      return 'bg-gray-200 text-gray-700';
  }
};

const StatusBadge = ({ status }: { status: string }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
    {status}
  </span>
);

export default function Reports() {
  const { user, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  const [activePeriod, setActivePeriod] = useState("2-semaines");
  const [selectedDate, setSelectedDate] = useState("2025-01-15");

  // Navigation sections
  const sections = [
    { id: "overview", label: "Vue d'ensemble", icon: BarChart3 },
    { id: "performance", label: "Performance Équipe", icon: Users },
    { id: "financial", label: "Financier", icon: DollarSign },
    { id: "clients", label: "Clients", icon: Building2 },
    { id: "projects", label: "Projets", icon: FolderOpen }
  ];

  const periods = [
    { id: "2-semaines", label: "2 Semaines" },
    { id: "mensuel", label: "Mensuel" },
    { id: "trimestriel", label: "Trimestriel" }
  ];

  // Hooks de données
  const { data: dashboardData } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
    enabled: isAuthenticated,
  });

  const { data: teamData } = useQuery({
    queryKey: ["/api/analytics/team"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#37B6E9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#3475BB]">Chargement des rapports...</p>
        </div>
      </div>
    );
  }

  const handleExport = (type: string) => {
    console.log(`Export ${type} demandé`);
    // TODO: Implémenter les fonctions d'export
  };

  return (
    <div className="min-h-screen bg-[var(--jofe-white)]">
      <TopNavBar />
      <div className="lg:ml-72">
        <AdminFloatingMenu />
        
        <div className="w-full overflow-auto">
          {/* Header */}
          <header className="bg-[var(--jofe-white)] border-b border-[var(--jofe-gray)] px-4 md:px-6 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[var(--jofe-blue-deep)] jofe-font">
                  Rapports Détaillés
                </h1>
                <p className="text-[var(--jofe-blue-medium)] mt-1">
                  Analyses complètes et exportation de données
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button 
                  className="px-4 py-2 bg-[var(--jofe-blue-medium)] text-white rounded-lg hover:bg-[var(--jofe-blue-deep)] transition-colors flex items-center space-x-2"
                  data-testid="button-refresh"
                >
                  <Download className="w-4 h-4" />
                  <span>Exporter</span>
                </button>
              </div>
            </div>
          </header>

          <main className="p-6">
            <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen hidden lg:block">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-6 text-[#162C54]">Types de Rapports</h2>
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeSection === section.id
                        ? 'bg-[#3475BB] text-white'
                        : 'text-[#162C54] hover:bg-[#37B6E9]/10 hover:text-[#3475BB]'
                    }`}
                    data-testid={`nav-${section.id}`}
                  >
                    <Icon className="w-5 h-5" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Filtres et contrôles */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              <div>
                <h2 className="text-2xl font-bold text-[#162C54] mb-2">Rapports d'Analyse</h2>
                <p className="text-gray-600">Analyses détaillées des performances par période</p>
              </div>
              
              <div className="flex flex-wrap gap-4 items-center">
                {/* Filtres de période */}
                <div className="flex gap-2">
                  {periods.map((period) => (
                    <FilterChip
                      key={period.id}
                      label={period.label}
                      active={activePeriod === period.id}
                      onClick={() => setActivePeriod(period.id)}
                    />
                  ))}
                </div>
                
                {/* Sélecteur de date */}
                <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border-none outline-none text-sm text-[#162C54]"
                    data-testid="input-date"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <MetricCard
              title="CA 2 Semaines (FCFA)"
              value="2,450,000"
              icon={DollarSign}
              trend="positive"
              trendValue="+12%"
              delay={0}
            />
            <MetricCard
              title="Projets Livrés"
              value="23"
              icon={FolderOpen}
              trend="positive"
              trendValue="+8%"
              delay={100}
            />
            <MetricCard
              title="Productivité Équipe"
              value="89%"
              icon={Users}
              trend="positive"
              trendValue="+5%"
              delay={200}
            />
            <MetricCard
              title="Satisfaction Client"
              value="4.8"
              suffix="/5"
              icon={Star}
              trend="positive"
              trendValue="+3%"
              delay={300}
            />
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Évolution CA */}
            <ChartCard title="Évolution CA (FCFA)">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueEvolutionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EBECED" />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fill: '#3475BB' }}
                      axisLine={{ stroke: '#EBECED' }}
                    />
                    <YAxis 
                      tick={{ fill: '#3475BB' }}
                      axisLine={{ stroke: '#EBECED' }}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        `${formatFCFA(Number(value))} FCFA`, 
                        name === 'revenue' ? 'CA Réel' : 'Objectif'
                      ]}
                      labelStyle={{ color: '#162C54' }}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #EBECED',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#37B6E9" 
                      strokeWidth={3}
                      dot={{ fill: '#37B6E9', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, fill: '#37B6E9' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#93C954" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#93C954', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Performance par membre */}
            <ChartCard title="Performance par Membre">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={memberPerformanceData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#EBECED" />
                    <XAxis 
                      type="number"
                      tick={{ fill: '#3475BB' }}
                      axisLine={{ stroke: '#EBECED' }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name" 
                      tick={{ fill: '#3475BB' }}
                      axisLine={{ stroke: '#EBECED' }}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value}%`, 'Productivité']}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #EBECED',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="productivity" 
                      fill="#37B6E9"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Tableau de données détaillées */}
          <ChartCard 
            title="Détail par Projet"
            actions={
              <div className="flex gap-2">
                <ExportButton type="PDF" icon={Download} onClick={() => handleExport('PDF')} />
                <ExportButton type="Excel" icon={Download} onClick={() => handleExport('Excel')} />
                <ExportButton type="PowerPoint" icon={Download} onClick={() => handleExport('PowerPoint')} />
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-[#162C54]">Projet</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#162C54]">Client</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#162C54]">Période</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#162C54]">Budget</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#162C54]">Dépensé</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#162C54]">Progression</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#162C54]">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {detailedProjectData.map((project, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-[#162C54]">{project.project}</td>
                      <td className="py-3 px-4 text-gray-600">{project.client}</td>
                      <td className="py-3 px-4 text-gray-600">{project.startDate} - {project.endDate}</td>
                      <td className="py-3 px-4 text-gray-600">{formatFCFA(project.budget)} FCFA</td>
                      <td className="py-3 px-4 text-gray-600">{formatFCFA(project.spent)} FCFA</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <ProgressBar percentage={project.progress} className="flex-1" />
                          <span className="text-sm font-medium text-[#3475BB] min-w-[3rem]">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={project.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>

          {/* Section répartition projets */}
          <div className="mt-6">
            <ChartCard title="Répartition des Projets">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graphique en secteurs */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projectDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {projectDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [value, 'Projets']}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #EBECED',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Légende détaillée */}
                <div className="flex flex-col justify-center space-y-4">
                  {projectDistributionData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="font-medium text-[#162C54]">{item.name}</span>
                      </div>
                      <span className="text-xl font-bold text-[#3475BB]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>
          </div>

          {/* Actions rapides */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500 delay-300">
            <Link 
              href="/analytics" 
              className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
              data-testid="link-analytics"
            >
              <div className="w-12 h-12 bg-[#37B6E9]/10 rounded-full flex items-center justify-center group-hover:bg-[#37B6E9]/20 transition-all">
                <BarChart3 className="w-6 h-6 text-[#37B6E9]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#162C54]">Analytics Dashboard</h3>
                <p className="text-sm text-[#3475BB]">Vue générale des métriques</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#3475BB] group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link 
              href="/time-history" 
              className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
              data-testid="link-time-tracking"
            >
              <div className="w-12 h-12 bg-[#93C954]/10 rounded-full flex items-center justify-center group-hover:bg-[#93C954]/20 transition-all">
                <Clock className="w-6 h-6 text-[#93C954]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#162C54]">Historique Temps</h3>
                <p className="text-sm text-[#3475BB]">Suivi détaillé du temps</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#3475BB] group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link 
              href="/team" 
              className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
              data-testid="link-team-analysis"
            >
              <div className="w-12 h-12 bg-[#F68C1F]/10 rounded-full flex items-center justify-center group-hover:bg-[#F68C1F]/20 transition-all">
                <Users className="w-6 h-6 text-[#F68C1F]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#162C54]">Analyse Équipe</h3>
                <p className="text-sm text-[#3475BB]">Performance par membre</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#3475BB] group-hover:translate-x-1 transition-transform" />
            </Link>
            </div>
        </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}