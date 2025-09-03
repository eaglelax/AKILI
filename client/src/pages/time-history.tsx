import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/hooks/useAuth";
import TopNavBar from "@/components/TopNavBar";
import AdminFloatingMenu from "@/components/AdminFloatingMenu";
import { 
  Clock,
  DollarSign,
  Users,
  FolderOpen,
  User,
  Calendar,
  Building,
  Download,
  Eye,
  ArrowLeft,
  TrendingUp
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Types pour l'historique des temps
interface TimeRecord {
  id: string;
  memberName: string;
  memberInitials: string;
  role: string;
  totalTime: string;
  totalHours: number;
  taskCount: number;
  totalCost: number;
  hourlyRate: number;
  status: "active" | "paused" | "completed";
  avatar: string;
}

interface TimeStats {
  totalTime: string;
  totalCost: number;
  activeProjects: number;
  averageRate: number;
}

export default function TimeHistory() {
  const { user } = useAuth();
  
  // Initialize WebSocket connection
  useWebSocket();

  // Filter states
  const [memberFilter, setMemberFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("cette-semaine");
  const [projectFilter, setProjectFilter] = useState("");

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  // Fetch des données réelles
  const { data: teamAnalytics } = useQuery({
    queryKey: ['/api/analytics/team'],
  });
  
  const { data: timeEntries } = useQuery({
    queryKey: ['/api/time-entries'],
  });

  // Statistiques calculées depuis les données réelles
  const timeStats: TimeStats = {
    totalTime: (teamAnalytics as any)?.totalTime || "247h 32m",
    totalCost: (teamAnalytics as any)?.totalCost || 1980000,
    activeProjects: (teamAnalytics as any)?.activeProjects || 8,
    averageRate: (teamAnalytics as any)?.averageRate || 8000
  };

  const timeRecords: TimeRecord[] = [
    {
      id: "paul_ouedraogo",
      memberName: "Paul Junior OUEDRAOGO",
      memberInitials: "PO",
      role: "Graphiste Photomonteur",
      totalTime: "42h 15m",
      totalHours: 42.25,
      taskCount: 8,
      totalCost: 338000,
      hourlyRate: 8000,
      status: "active",
      avatar: "var(--jofe-blue-light)"
    },
    {
      id: "fortune_yanogo",
      memberName: "Fortune YANOGO",
      memberInitials: "FY",
      role: "Photographe/Vidéaste",
      totalTime: "38h 45m",
      totalHours: 38.75,
      taskCount: 6,
      totalCost: 387500,
      hourlyRate: 10000,
      status: "paused",
      avatar: "var(--jofe-orange)"
    },
    {
      id: "bientama_pare",
      memberName: "Bientama PARÉ",
      memberInitials: "BP",
      role: "Motion Designer",
      totalTime: "35h 20m",
      totalHours: 35.33,
      taskCount: 5,
      totalCost: 318000,
      hourlyRate: 9000,
      status: "completed",
      avatar: "var(--jofe-green)"
    },
    {
      id: "linda_kabore",
      memberName: "Linda KABORÉ",
      memberInitials: "LK",
      role: "Conceptrice Rédactrice Lead",
      totalTime: "31h 10m",
      totalHours: 31.17,
      taskCount: 7,
      totalCost: 295450,
      hourlyRate: 9500,
      status: "active",
      avatar: "var(--jofe-blue-medium)"
    }
  ];

  // Chart data
  const chartData = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        label: 'Temps Total (heures)',
        data: [8.5, 7.2, 9.1, 6.8, 8.9, 5.2, 3.1],
        borderColor: '#3475BB',
        backgroundColor: 'rgba(52, 117, 187, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y'
      },
      {
        label: 'Coût (milliers FCFA)',
        data: [68, 72, 91, 68, 89, 52, 31],
        borderColor: '#93C954',
        backgroundColor: 'rgba(147, 201, 84, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Heures'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Coût (milliers FCFA)'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "status-active bg-[var(--jofe-green)] bg-opacity-20 text-[var(--jofe-green)]";
      case "paused":
        return "status-paused bg-[var(--jofe-orange)] bg-opacity-20 text-[var(--jofe-orange)]";
      case "completed":
        return "status-completed bg-[var(--jofe-blue-medium)] bg-opacity-20 text-[var(--jofe-blue-medium)]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Actif";
      case "paused": return "En pause";
      case "completed": return "Terminé";
      default: return "Inconnu";
    }
  };

  const handleExport = () => {
    // Préparer les données pour l'export CSV
    const csvHeaders = ["Membre", "Rôle", "Temps Total", "Tâches", "Coût Total", "Taux Horaire", "Statut"];
    const csvData = filteredRecords.map(record => [
      record.memberName,
      record.role,
      record.totalTime,
      `${record.taskCount} tâches`,
      formatCurrency(record.totalCost),
      formatCurrency(record.hourlyRate) + "/h",
      getStatusText(record.status)
    ]);

    // Créer le contenu CSV
    const csvContent = [
      csvHeaders.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    // Déclencher le téléchargement
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `historique-temps-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered data
  const filteredRecords = timeRecords.filter(record => {
    const memberMatch = !memberFilter || record.id === memberFilter;
    const projectMatch = true; // Simplified for now
    return memberMatch && projectMatch;
  });

  return (
    <div className="min-h-screen bg-[var(--jofe-white)]">
      <TopNavBar />
      <div className="ml-72">
        <AdminFloatingMenu />
        
        <div className="w-full overflow-auto">
        
        {/* Header */}
        <header className="bg-[var(--jofe-white)] border-b border-[var(--jofe-gray)] px-4 md:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <Link href="/tasks" className="p-2 hover:bg-[var(--jofe-gray)] rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-[var(--jofe-blue-medium)]" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-[var(--jofe-blue-deep)] jofe-font">Historique des Temps</h1>
              </div>
            </div>

            
          </div>
        </header>

        {/* Contenu Principal */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Filtres */}
          <Card className="p-6 mb-8 border border-[var(--jofe-gray)] fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Filtre Membre */}
              <div>
                <label className="block text-sm font-medium text-[var(--jofe-blue-deep)] mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Membre
                </label>
                <select 
                  className="w-full px-3 py-2 border border-[var(--jofe-gray)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--jofe-blue-light)] focus:border-transparent"
                  value={memberFilter}
                  onChange={(e) => setMemberFilter(e.target.value)}
                  data-testid="select-member-filter"
                >
                  <option value="">Tous les membres</option>
                  <option value="paul_ouedraogo">Paul Junior OUEDRAOGO</option>
                  <option value="fortune_yanogo">Fortune YANOGO</option>
                  <option value="bientama_pare">Bientama PARÉ</option>
                  <option value="linda_kabore">Linda KABORÉ</option>
                </select>
              </div>

              {/* Filtre Période */}
              <div>
                <label className="block text-sm font-medium text-[var(--jofe-blue-deep)] mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Période
                </label>
                <select 
                  className="w-full px-3 py-2 border border-[var(--jofe-gray)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--jofe-blue-light)] focus:border-transparent"
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  data-testid="select-period-filter"
                >
                  <option value="cette-semaine">Cette semaine</option>
                  <option value="ce-mois">Ce mois</option>
                  <option value="trimestre">Trimestre</option>
                  <option value="personnalisee">Personnalisée</option>
                </select>
              </div>

              {/* Filtre Projet */}
              <div>
                <label className="block text-sm font-medium text-[var(--jofe-blue-deep)] mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  Projet
                </label>
                <select 
                  className="w-full px-3 py-2 border border-[var(--jofe-gray)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--jofe-blue-light)] focus:border-transparent"
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  data-testid="select-project-filter"
                >
                  <option value="">Tous les projets</option>
                  <option value="moov-africa">Campagne MOOV AFRICA</option>
                  <option value="bank-africa">Shooting BANK OF AFRICA</option>
                  <option value="sunu-burkina">Animation SUNU BURKINA</option>
                </select>
              </div>

              {/* Bouton Export */}
              <div className="flex items-end">
                <Button 
                  onClick={handleExport}
                  className="w-full bg-[var(--jofe-blue-medium)] hover:bg-[var(--jofe-blue-deep)] text-white px-4 py-2 rounded-md transition-colors"
                  data-testid="button-export"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </div>
          </Card>

          {/* Statistiques Résumé */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 border border-[var(--jofe-gray)] hover-lift fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--jofe-blue-medium)]">Temps Total</p>
                  <p className="text-2xl font-bold text-[var(--jofe-blue-deep)]">{timeStats.totalTime}</p>
                </div>
                <div className="w-12 h-12 bg-[var(--jofe-blue-light)] bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[var(--jofe-blue-light)]" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-[var(--jofe-gray)] hover-lift fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--jofe-blue-medium)]">Coût Total</p>
                  <p className="text-2xl font-bold text-[var(--jofe-blue-deep)]">{formatCurrency(timeStats.totalCost)}</p>
                </div>
                <div className="w-12 h-12 bg-[var(--jofe-green)] bg-opacity-20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-[var(--jofe-green)]" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-[var(--jofe-gray)] hover-lift fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--jofe-blue-medium)]">Projets Actifs</p>
                  <p className="text-2xl font-bold text-[var(--jofe-blue-deep)]">{timeStats.activeProjects}</p>
                </div>
                <div className="w-12 h-12 bg-[var(--jofe-orange)] bg-opacity-20 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-[var(--jofe-orange)]" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-[var(--jofe-gray)] hover-lift fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--jofe-blue-medium)]">Taux Moyen</p>
                  <p className="text-2xl font-bold text-[var(--jofe-blue-deep)]">{formatCurrency(timeStats.averageRate)}/h</p>
                </div>
                <div className="w-12 h-12 bg-[var(--jofe-blue-medium)] bg-opacity-20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[var(--jofe-blue-medium)]" />
                </div>
              </div>
            </Card>
          </div>

          {/* Graphique Temporel */}
          <Card className="p-6 mb-8 border border-[var(--jofe-gray)] fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="jofe-font text-xl text-[var(--jofe-blue-deep)]">Évolution Temporelle</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs bg-[var(--jofe-blue-medium)] text-white rounded-md">
                  Jour
                </button>
                <button className="px-3 py-1 text-xs border border-[var(--jofe-gray)] text-[var(--jofe-blue-medium)] rounded-md hover:bg-[var(--jofe-gray)]">
                  Semaine
                </button>
                <button className="px-3 py-1 text-xs border border-[var(--jofe-gray)] text-[var(--jofe-blue-medium)] rounded-md hover:bg-[var(--jofe-gray)]">
                  Mois
                </button>
              </div>
            </div>
            <div className="h-96">
              <Line data={chartData} options={chartOptions} />
            </div>
          </Card>

          {/* Tableau Détaillé */}
          <Card className="border border-[var(--jofe-gray)] overflow-hidden fade-in">
            <div className="px-6 py-4 border-b border-[var(--jofe-gray)]">
              <h2 className="jofe-font text-xl text-[var(--jofe-blue-deep)]">Détail par Membre</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--jofe-gray)]">
                <thead className="bg-[var(--jofe-gray)] bg-opacity-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--jofe-blue-deep)] uppercase tracking-wider">
                      Membre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--jofe-blue-deep)] uppercase tracking-wider">
                      Temps Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--jofe-blue-deep)] uppercase tracking-wider">
                      Tâches
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--jofe-blue-deep)] uppercase tracking-wider">
                      Coût
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--jofe-blue-deep)] uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--jofe-blue-deep)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[var(--jofe-gray)]">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-[var(--jofe-gray)] hover:bg-opacity-30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                            style={{ backgroundColor: record.avatar }}
                          >
                            <span className="text-white font-medium">{record.memberInitials}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[var(--jofe-blue-deep)]">{record.memberName}</div>
                            <div className="text-sm text-[var(--jofe-blue-medium)]">{record.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--jofe-blue-deep)]">
                        {record.totalTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--jofe-blue-medium)]">
                        {record.taskCount} tâches
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--jofe-green)]">
                        {formatCurrency(record.totalCost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`status-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(record.status)}`}>
                          {getStatusText(record.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          className="text-[var(--jofe-blue-medium)] hover:text-[var(--jofe-blue-deep)] mr-3"
                          data-testid={`button-view-${record.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-[var(--jofe-blue-medium)] hover:text-[var(--jofe-blue-deep)]"
                          data-testid={`button-export-${record.id}`}
                        >
                          <Download className="w-4 h-4" />
                        </button>
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
    </div>
  );
}