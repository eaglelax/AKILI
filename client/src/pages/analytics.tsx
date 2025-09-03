import { useState, useEffect } from "react";
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
  TrendingDown
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

// Données pour les graphiques
const revenueData = [
  { month: "Août", revenue: 12400000 },
  { month: "Septembre", revenue: 13800000 },
  { month: "Octobre", revenue: 11200000 },
  { month: "Novembre", revenue: 14600000 },
  { month: "Décembre", revenue: 16800000 },
  { month: "Janvier", revenue: 15280000 }
];

const projectsData = [
  { name: "Terminés", value: 45, color: "#93C954" },
  { name: "En cours", value: 23, color: "#37B6E9" },
  { name: "En attente", value: 8, color: "#F68C1F" }
];

const workloadData = [
  { name: "Paul Jr.", workload: 94, color: "#93C954" },
  { name: "Fortune", workload: 87, color: "#37B6E9" },
  { name: "Linda", workload: 83, color: "#37B6E9" },
  { name: "Bientama", workload: 81, color: "#3475BB" },
  { name: "Florita", workload: 79, color: "#3475BB" },
  { name: "Nebié", workload: 77, color: "#F68C1F" }
];

const topPerformers = [
  { name: "Paul Junior OUEDRAOGO", productivity: 94, status: "excellent" },
  { name: "Fortune YANOGO", productivity: 87, status: "good" },
  { name: "Linda KABORÉ", productivity: 83, status: "good" },
  { name: "Bientama PARÉ", productivity: 81, status: "good" }
];

const roiClients = [
  { name: "MOOV AFRICA", roi: 287, revenue: 4200000, costs: 1460000 },
  { name: "BANK OF AFRICA", roi: 234, revenue: 3800000, costs: 1620000 },
  { name: "SUNU BURKINA", roi: 189, revenue: 2500000, costs: 1323000 },
  { name: "ROXGOLD", roi: 312, revenue: 1900000, costs: 609000 }
];

// Composant pour formater les montants FCFA
const formatFCFA = (amount: number) => {
  return new Intl.NumberFormat('fr-FR').format(amount);
};

// Composant KPI Card
interface KPICardProps {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  trend?: 'positive' | 'negative' | 'stable';
  trendValue?: string;
  suffix?: string;
}

const KPICard = ({ title, value, icon: Icon, trend, trendValue, suffix = "" }: KPICardProps) => (
  <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
    {/* Gradient top border */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#37B6E9] to-[#3475BB]"></div>
    
    <div className="flex items-center justify-between mb-4">
      <span className="text-xs font-semibold text-[#3475BB] uppercase tracking-wider">{title}</span>
      <Icon className="w-6 h-6 text-[#37B6E9]" />
    </div>
    
    <div className="text-3xl font-bold text-[#162C54] mb-2 group-hover:scale-105 transition-transform duration-300">
      {value}
      {suffix && <span className="text-lg ml-1">{suffix}</span>}
    </div>
    
    {trend && (
      <div className={`flex items-center gap-2 text-sm ${
        trend === 'positive' ? 'text-[#93C954]' : trend === 'negative' ? 'text-[#F68C1F]' : 'text-[#3475BB]'
      }`}>
        {trend === 'positive' && <TrendingUp className="w-4 h-4" />}
        {trend === 'negative' && <TrendingDown className="w-4 h-4" />}
        <span>{trendValue}</span>
      </div>
    )}
  </div>
);

// Composant Chart Card
interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  filters?: string[];
}

const ChartCard = ({ title, children, filters = [] }: ChartCardProps) => (
  <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold text-[#162C54]">{title}</h3>
      {filters.length > 0 && (
        <div className="flex gap-2">
          {filters.map((filter, index) => (
            <button
              key={index}
              className={`px-3 py-1.5 text-sm rounded-md border transition-all duration-200 ${
                index === 0 
                  ? 'bg-[#37B6E9] text-white border-[#37B6E9]' 
                  : 'bg-white text-[#3475BB] border-gray-200 hover:bg-[#37B6E9] hover:text-white hover:border-[#37B6E9]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      )}
    </div>
    {children}
  </div>
);

// Composant Performance Bar
const PerformanceBar = ({ percentage }: { percentage: number }) => (
  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
    <div 
      className="h-full bg-gradient-to-r from-[#37B6E9] to-[#3475BB] transition-all duration-700 ease-out"
      style={{ width: `${percentage}%` }}
    ></div>
  </div>
);

// Composant Status Badge
const StatusBadge = ({ status, value }: { status: string; value: number }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-[#93C954] text-white';
      case 'good':
        return 'bg-[#37B6E9] text-white';
      case 'average':
        return 'bg-[#F68C1F] text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getStatusStyle(status)}`}>
      {value}%
    </span>
  );
};

// Composant ROI Card
interface ROICardProps {
  client: {
    name: string;
    roi: number;
    revenue: number;
    costs: number;
  };
}

const ROICard = ({ client }: ROICardProps) => (
  <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
    {/* Green right border */}
    <div className="absolute top-0 right-0 w-1 h-full bg-[#93C954]"></div>
    
    <div className="flex items-center justify-between mb-4">
      <div className="font-semibold text-[#162C54]">{client.name}</div>
      <div className="text-2xl font-bold text-[#93C954]">{client.roi}%</div>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div className="text-center">
        <div className="text-xs text-[#3475BB] mb-1">Revenus</div>
        <div className="font-semibold text-[#162C54]">{formatFCFA(client.revenue)} FCFA</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-[#3475BB] mb-1">Coûts</div>
        <div className="font-semibold text-[#162C54]">{formatFCFA(client.costs)} FCFA</div>
      </div>
    </div>
  </div>
);

export default function Analytics() {
  const { user, isAuthenticated } = useAuth();
  const [activeFilter, setActiveFilter] = useState("6 mois");

  // Hook de données analytics
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
    enabled: isAuthenticated,
  });

  const { data: teamData } = useQuery({
    queryKey: ["/api/analytics/team"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#37B6E9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#3475BB]">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div></div>
            
            <nav className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#3475BB] hover:bg-gray-100 transition-all">
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>
              <Link href="/tasks" className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#3475BB] hover:bg-gray-100 transition-all">
                <Clock className="w-5 h-5" />
                Tâches
              </Link>
              <Link href="/analytics" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#37B6E9] text-white">
                <BarChart3 className="w-5 h-5" />
                Analytics
              </Link>
              <Link href="/team" className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#3475BB] hover:bg-gray-100 transition-all">
                <Users className="w-5 h-5" />
                Équipe
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8 animate-in fade-in duration-500">
          <h1 className="text-4xl font-bold text-[#162C54] mb-2">Analytics Dashboard</h1>
          <p className="text-xl text-[#3475BB]">Vue d'ensemble des performances et métriques clés de JoFé+</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-in fade-in duration-500 delay-100">
          <KPICard
            title="Chiffre d'Affaires"
            value="15,280,000"
            suffix="FCFA"
            icon={DollarSign}
            trend="positive"
            trendValue="+23% vs mois dernier"
          />
          <KPICard
            title="Productivité Équipe"
            value="87%"
            icon={BarChart3}
            trend="positive"
            trendValue="+5% cette semaine"
          />
          <KPICard
            title="Satisfaction Client"
            value="4.8"
            suffix="/5"
            icon={Star}
            trend="stable"
            trendValue="Stable"
          />
          <KPICard
            title="Projets Actifs"
            value="23"
            icon={FolderOpen}
            trend="positive"
            trendValue="+3 nouveaux"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-in fade-in duration-500 delay-200">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <ChartCard title="Évolution CA Mensuel" filters={["6 mois", "12 mois"]}>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EBECED" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: '#3475BB' }}
                      axisLine={{ stroke: '#EBECED' }}
                    />
                    <YAxis 
                      tick={{ fill: '#3475BB' }}
                      axisLine={{ stroke: '#EBECED' }}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${formatFCFA(Number(value))} FCFA`, 'CA Mensuel']}
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
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Projects Distribution */}
          <div>
            <ChartCard title="Répartition Projets">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {projectsData.map((entry, index) => (
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
                
                {/* Legend */}
                <div className="flex justify-center gap-4 mt-4">
                  {projectsData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-[#3475BB]">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Performance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-in fade-in duration-500 delay-300">
          {/* Top Performers Table */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h2 className="text-2xl font-semibold text-[#162C54] mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-[#37B6E9]" />
              Top Performers
            </h2>
            
            <div className="overflow-hidden rounded-lg border border-gray-100">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#162C54] uppercase tracking-wider">
                      Membre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#162C54] uppercase tracking-wider">
                      Productivité
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#162C54] uppercase tracking-wider">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {topPerformers.map((member, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900">{member.name}</td>
                      <td className="px-4 py-3">
                        <PerformanceBar percentage={member.productivity} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={member.status} value={member.productivity} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Workload Chart */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h2 className="text-2xl font-semibold text-[#162C54] mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#37B6E9]" />
              Charge de Travail
            </h2>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBECED" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#3475BB' }}
                    axisLine={{ stroke: '#EBECED' }}
                  />
                  <YAxis 
                    tick={{ fill: '#3475BB' }}
                    axisLine={{ stroke: '#EBECED' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`${value}%`, 'Charge']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #EBECED',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="workload" 
                    radius={[6, 6, 0, 0]}
                  >
                    {workloadData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ROI Analysis */}
        <div className="animate-in fade-in duration-500 delay-400">
          <h2 className="text-2xl font-semibold text-[#162C54] mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#37B6E9]" />
            Analyse ROI Clients
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roiClients.map((client, index) => (
              <ROICard key={index} client={client} />
            ))}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500 delay-500">
          <Link 
            href="/reports" 
            className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 group"
            data-testid="link-reports"
          >
            <div className="w-12 h-12 bg-[#37B6E9] bg-opacity-10 rounded-full flex items-center justify-center group-hover:bg-opacity-20 transition-all">
              <BarChart3 className="w-6 h-6 text-[#37B6E9]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#162C54]">Rapports Détaillés</h3>
              <p className="text-sm text-[#3475BB]">Générer des rapports personnalisés</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#3475BB] group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link 
            href="/presentations" 
            className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 group"
            data-testid="link-presentations"
          >
            <div className="w-12 h-12 bg-[#93C954] bg-opacity-10 rounded-full flex items-center justify-center group-hover:bg-opacity-20 transition-all">
              <BarChart3 className="w-6 h-6 text-[#93C954]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#162C54]">Présentations</h3>
              <p className="text-sm text-[#3475BB]">Graphiques pour présentations</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#3475BB] group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link 
            href="/roi" 
            className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 group"
            data-testid="link-roi"
          >
            <div className="w-12 h-12 bg-[#F68C1F] bg-opacity-10 rounded-full flex items-center justify-center group-hover:bg-opacity-20 transition-all">
              <TrendingUp className="w-6 h-6 text-[#F68C1F]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#162C54]">Analyse ROI</h3>
              <p className="text-sm text-[#3475BB]">ROI et rentabilité détaillés</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#3475BB] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </main>
    </div>
  );
}