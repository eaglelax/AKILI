import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Settings2, 
  ChevronRight, 
  Check, 
  X, 
  LayoutDashboard, 
  Clock, 
  FolderOpen, 
  Users, 
  Building, 
  BarChart3, 
  MessageSquare,
  Settings,
  LogIn,
  FileText,
  Calendar,
  UserCircle,
  Plus,
  Eye,
  EyeOff
} from "lucide-react";

// Liste complète des 100 pages de l'application JoFé Digital
const allPages = [
  // 🔐 AUTHENTIFICATION & SÉCURITÉ (Pages 1-3)
  { name: "Page de connexion", path: "/login", icon: LogIn, status: "created", category: "🔐 Authentification" },
  { name: "Tableau de bord d'accueil", path: "/dashboard", icon: LayoutDashboard, status: "created", category: "🔐 Authentification" },
  { name: "Gestion des profils utilisateurs", path: "/team", icon: Users, status: "created", category: "🔐 Authentification" },
  
  // ⏱️ CHRONOMÉTRAGE & TÂCHES (Pages 4-7)
  { name: "Gestion des tâches avec chronométrage", path: "/tasks", icon: Clock, status: "pending", category: "⏱️ Chronométrage" },
  { name: "Vue détaillée d'une tâche avec timer", path: "/task-detail", icon: Clock, status: "pending", category: "⏱️ Chronométrage" },
  { name: "Historique des temps de travail", path: "/time-history", icon: FileText, status: "pending", category: "⏱️ Chronométrage" },
  { name: "Configuration permissions chronométrage", path: "/time-permissions", icon: Settings, status: "pending", category: "⏱️ Chronométrage" },
  
  // 📊 ANALYTICS & REPORTING (Pages 8-12)
  { name: "Dashboard analytics principal", path: "/analytics", icon: BarChart3, status: "pending", category: "📊 Analytics" },
  { name: "Rapports détaillés", path: "/reports", icon: FileText, status: "pending", category: "📊 Analytics" },
  { name: "Graphiques pour présentations", path: "/presentations", icon: BarChart3, status: "pending", category: "📊 Analytics" },
  { name: "Analyse productivité par membre", path: "/productivity", icon: BarChart3, status: "pending", category: "📊 Analytics" },
  { name: "ROI et rentabilité", path: "/roi", icon: BarChart3, status: "pending", category: "📊 Analytics" },
  
  // 📋 GESTION DE PROJETS (Pages 13-19)
  { name: "Liste des projets", path: "/projects", icon: FolderOpen, status: "pending", category: "📋 Projets" },
  { name: "Création/édition de projet", path: "/project-editor", icon: Plus, status: "pending", category: "📋 Projets" },
  { name: "Vue détaillée d'un projet", path: "/project-detail", icon: Eye, status: "pending", category: "📋 Projets" },
  { name: "Diagramme de Gantt interactif", path: "/gantt", icon: Calendar, status: "pending", category: "📋 Projets" },
  { name: "Templates de projets", path: "/project-templates", icon: FileText, status: "pending", category: "📋 Projets" },
  { name: "Workflow d'approbation", path: "/approval-workflow", icon: Check, status: "pending", category: "📋 Projets" },
  { name: "Gestion des dépendances", path: "/dependencies", icon: Calendar, status: "pending", category: "📋 Projets" },
  
  // 👥 GESTION D'ÉQUIPE (Pages 20-26)
  { name: "Vue d'ensemble de l'équipe", path: "/team-overview", icon: Users, status: "pending", category: "👥 Équipe" },
  { name: "Profil détaillé d'un membre", path: "/member-profile", icon: UserCircle, status: "pending", category: "👥 Équipe" },
  { name: "Calendrier partagé", path: "/shared-calendar", icon: Calendar, status: "pending", category: "👥 Équipe" },
  { name: "Gestion des congés", path: "/leave-management", icon: Calendar, status: "pending", category: "👥 Équipe" },
  { name: "Compétences et formations", path: "/skills-training", icon: UserCircle, status: "pending", category: "👥 Équipe" },
  { name: "Évaluation de performance", path: "/performance-review", icon: BarChart3, status: "pending", category: "👥 Équipe" },
  { name: "Attribution automatique tâches", path: "/auto-assignment", icon: Settings, status: "pending", category: "👥 Équipe" },
  
  // 💼 GESTION CLIENTS (Pages 27-33)
  { name: "Portfolio des 33 clients", path: "/clients", icon: Building, status: "pending", category: "💼 Clients" },
  { name: "Profil détaillé d'un client", path: "/client-profile", icon: Building, status: "pending", category: "💼 Clients" },
  { name: "Historique complet par client", path: "/client-history", icon: FileText, status: "pending", category: "💼 Clients" },
  { name: "Ajout/modification de client", path: "/client-editor", icon: Plus, status: "pending", category: "💼 Clients" },
  { name: "Satisfaction client et feedback", path: "/client-feedback", icon: MessageSquare, status: "pending", category: "💼 Clients" },
  { name: "Pipeline commercial", path: "/sales-pipeline", icon: BarChart3, status: "pending", category: "💼 Clients" },
  { name: "Contrats et budgets", path: "/contracts", icon: FileText, status: "pending", category: "💼 Clients" },
  
  // 💬 COMMUNICATION & COLLABORATION (Pages 34-40)
  { name: "Chat intégré par projet", path: "/chat", icon: MessageSquare, status: "pending", category: "💬 Communication" },
  { name: "Centre de notifications", path: "/notifications", icon: MessageSquare, status: "pending", category: "💬 Communication" },
  { name: "Système de @mentions", path: "/mentions", icon: MessageSquare, status: "pending", category: "💬 Communication" },
  { name: "Partage de fichiers", path: "/file-sharing", icon: FileText, status: "pending", category: "💬 Communication" },
  { name: "Validation en ligne créations", path: "/creative-approval", icon: Check, status: "pending", category: "💬 Communication" },
  { name: "Historique des modifications", path: "/change-history", icon: FileText, status: "pending", category: "💬 Communication" },
  { name: "Commentaires détaillés", path: "/detailed-comments", icon: MessageSquare, status: "pending", category: "💬 Communication" },
  
  // 🎨 SPÉCIFICITÉS CRÉATIVES (Pages 41-47)
  { name: "Banque d'assets centralisée", path: "/assets", icon: FileText, status: "pending", category: "🎨 Créatif" },
  { name: "Portfolio et galerie projets", path: "/portfolio", icon: Eye, status: "pending", category: "🎨 Créatif" },
  { name: "Suivi des versions créatives", path: "/version-control", icon: FileText, status: "pending", category: "🎨 Créatif" },
  { name: "Validation créative avec annotations", path: "/creative-validation", icon: Check, status: "pending", category: "🎨 Créatif" },
  { name: "Planning de production", path: "/production-planning", icon: Calendar, status: "pending", category: "🎨 Créatif" },
  { name: "Suivi du matériel créatif", path: "/creative-materials", icon: Settings, status: "pending", category: "🎨 Créatif" },
  { name: "Métriques créatives", path: "/creative-metrics", icon: BarChart3, status: "pending", category: "🎨 Créatif" },
  
  // 💰 FINANCE & FACTURATION (Pages 48-55)
  { name: "Tableau de bord financier", path: "/finance-dashboard", icon: BarChart3, status: "pending", category: "💰 Finance" },
  { name: "Gestion des devis", path: "/quotes", icon: FileText, status: "pending", category: "💰 Finance" },
  { name: "Gestion des factures", path: "/invoices", icon: FileText, status: "pending", category: "💰 Finance" },
  { name: "Suivi des paiements", path: "/payments", icon: BarChart3, status: "pending", category: "💰 Finance" },
  { name: "Calcul automatique des marges", path: "/margins", icon: BarChart3, status: "pending", category: "💰 Finance" },
  { name: "Prévisionnel CA", path: "/revenue-forecast", icon: BarChart3, status: "pending", category: "💰 Finance" },
  { name: "Budget vs réalisé", path: "/budget-actual", icon: BarChart3, status: "pending", category: "💰 Finance" },
  { name: "Alertes dépassement budget", path: "/budget-alerts", icon: MessageSquare, status: "pending", category: "💰 Finance" },
  
  // 🧠 BUSINESS INTELLIGENCE (Pages 56-62)
  { name: "Dashboard CEO/Direction", path: "/executive-dashboard", icon: BarChart3, status: "pending", category: "🧠 Business Intelligence" },
  { name: "Analyse concurrentielle", path: "/competitive-analysis", icon: BarChart3, status: "pending", category: "🧠 Business Intelligence" },
  { name: "Prédictions tendances marché", path: "/market-trends", icon: BarChart3, status: "pending", category: "🧠 Business Intelligence" },
  { name: "Optimisation des ressources", path: "/resource-optimization", icon: Settings, status: "pending", category: "🧠 Business Intelligence" },
  { name: "Analyse des risques projets", path: "/risk-analysis", icon: BarChart3, status: "pending", category: "🧠 Business Intelligence" },
  { name: "KPIs personnalisables", path: "/custom-kpis", icon: BarChart3, status: "pending", category: "🧠 Business Intelligence" },
  { name: "Reporting réglementaire", path: "/regulatory-reporting", icon: FileText, status: "pending", category: "🧠 Business Intelligence" },
  
  // 🏆 AGENT DU MOIS (Pages 63-67)
  { name: "Système de scoring", path: "/scoring-system", icon: BarChart3, status: "pending", category: "🏆 Agent du Mois" },
  { name: "Classement mensuel", path: "/monthly-ranking", icon: BarChart3, status: "pending", category: "🏆 Agent du Mois" },
  { name: "Évaluation détaillée", path: "/detailed-evaluation", icon: UserCircle, status: "pending", category: "🏆 Agent du Mois" },
  { name: "Historique des performances", path: "/performance-history", icon: BarChart3, status: "pending", category: "🏆 Agent du Mois" },
  { name: "Système de récompenses", path: "/rewards-system", icon: BarChart3, status: "pending", category: "🏆 Agent du Mois" },
  
  // ⚙️ ADMINISTRATION (Pages 68-74)
  { name: "Panneau d'administration", path: "/admin", icon: Settings, status: "pending", category: "⚙️ Administration" },
  { name: "Gestion des membres", path: "/member-management", icon: Users, status: "pending", category: "⚙️ Administration" },
  { name: "Configuration taux horaires", path: "/hourly-rates", icon: Settings, status: "pending", category: "⚙️ Administration" },
  { name: "Paramètres système", path: "/system-settings", icon: Settings, status: "pending", category: "⚙️ Administration" },
  { name: "Audit trail et logs", path: "/audit-logs", icon: FileText, status: "pending", category: "⚙️ Administration" },
  { name: "Sauvegarde et restauration", path: "/backup-restore", icon: Settings, status: "pending", category: "⚙️ Administration" },
  { name: "Import/Export données", path: "/data-import-export", icon: FileText, status: "pending", category: "⚙️ Administration" },
  
  // 📱 INTERFACES MOBILES (Pages 75-78)
  { name: "Dashboard mobile", path: "/mobile-dashboard", icon: LayoutDashboard, status: "pending", category: "📱 Mobile" },
  { name: "Gestion tâches mobile", path: "/mobile-tasks", icon: Clock, status: "pending", category: "📱 Mobile" },
  { name: "Chat mobile", path: "/mobile-chat", icon: MessageSquare, status: "pending", category: "📱 Mobile" },
  { name: "Notifications push mobile", path: "/mobile-notifications", icon: MessageSquare, status: "pending", category: "📱 Mobile" },
  
  // 🔧 OUTILS TECHNIQUES (Pages 79-82)
  { name: "API intégrations", path: "/api-integrations", icon: Settings, status: "pending", category: "🔧 Outils Techniques" },
  { name: "Mode hors-ligne", path: "/offline-mode", icon: Settings, status: "pending", category: "🔧 Outils Techniques" },
  { name: "Exports multi-formats", path: "/multi-format-exports", icon: FileText, status: "pending", category: "🔧 Outils Techniques" },
  { name: "Sécurité avancée", path: "/advanced-security", icon: Settings, status: "pending", category: "🔧 Outils Techniques" },
  
  // 📅 PLANIFICATION (Pages 83-86)
  { name: "Vue calendrier globale", path: "/global-calendar", icon: Calendar, status: "pending", category: "📅 Planification" },
  { name: "Planning hebdomadaire", path: "/weekly-planning", icon: Calendar, status: "pending", category: "📅 Planification" },
  { name: "Réservation de ressources", path: "/resource-booking", icon: Calendar, status: "pending", category: "📅 Planification" },
  { name: "Gestion des deadlines", path: "/deadline-management", icon: Calendar, status: "pending", category: "📅 Planification" },
  
  // 📈 DASHBOARDS SPÉCIALISÉS (Pages 87-90)
  { name: "Dashboard créatif designers", path: "/creative-dashboard", icon: LayoutDashboard, status: "pending", category: "📈 Dashboards" },
  { name: "Dashboard commercial", path: "/commercial-dashboard", icon: LayoutDashboard, status: "pending", category: "📈 Dashboards" },
  { name: "Dashboard production", path: "/production-dashboard", icon: LayoutDashboard, status: "pending", category: "📈 Dashboards" },
  { name: "Dashboard RH", path: "/hr-dashboard", icon: LayoutDashboard, status: "pending", category: "📈 Dashboards" },
  
  // 🔍 RECHERCHE & FILTRES (Pages 91-93)
  { name: "Recherche globale avancée", path: "/advanced-search", icon: Settings, status: "pending", category: "🔍 Recherche" },
  { name: "Filtres multi-critères", path: "/multi-filters", icon: Settings, status: "pending", category: "🔍 Recherche" },
  { name: "Historique des recherches", path: "/search-history", icon: FileText, status: "pending", category: "🔍 Recherche" },
  
  // 📊 EXPORTS & IMPRESSIONS (Pages 94-96)
  { name: "Centre d'export", path: "/export-center", icon: FileText, status: "pending", category: "📊 Exports" },
  { name: "Templates de rapports", path: "/report-templates", icon: FileText, status: "pending", category: "📊 Exports" },
  { name: "Générateur de PDF", path: "/pdf-generator", icon: FileText, status: "pending", category: "📊 Exports" },
  
  // 🎯 PAGES SPÉCIALES (Pages 97-100)
  { name: "Page d'erreur 404", path: "/404", icon: X, status: "pending", category: "🎯 Spéciales" },
  { name: "Page de maintenance", path: "/maintenance", icon: Settings, status: "pending", category: "🎯 Spéciales" },
  { name: "Aide et documentation", path: "/help", icon: FileText, status: "pending", category: "🎯 Spéciales" },
  { name: "À propos et crédits", path: "/about", icon: FileText, status: "pending", category: "🎯 Spéciales" }
];

export default function AdminFloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [location] = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  // Grouper les pages par catégorie
  const pagesByCategory = allPages.reduce((acc, page) => {
    if (!acc[page.category]) {
      acc[page.category] = [];
    }
    acc[page.category].push(page);
    return acc;
  }, {} as Record<string, typeof allPages>);

  // Statistiques
  const createdPages = allPages.filter(page => page.status === "created").length;
  const totalPages = allPages.length;
  const progress = Math.round((createdPages / totalPages) * 100);

  return (
    <div className="admin-floating-menu">
      {/* Bouton Flottant */}
      <button
        onClick={toggleMenu}
        className={`
          admin-menu-toggle fixed bottom-6 right-6 z-[60] 
          w-14 h-14 rounded-full shadow-lg transition-all duration-300
          flex items-center justify-center
          ${isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-180' 
            : 'bg-[#162C54] hover:bg-[#1a2f5a]'
          }
        `}
        data-testid="button-admin-menu-toggle"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Settings2 className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-[50]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu Panel */}
      <div className={`
        admin-menu-panel fixed bottom-24 right-6 z-[55]
        w-80 max-h-[70vh] bg-white rounded-xl shadow-2xl border
        transform transition-all duration-300 origin-bottom-right overflow-hidden
        ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
      `}>
        {/* Header */}
        <div className="admin-menu-header p-4 bg-[#162C54] text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Settings2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Super Admin</h3>
              <p className="text-xs text-white/80">Menu Navigation JoFé+</p>
            </div>
          </div>
          
          {/* Progression */}
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Progression</span>
              <span className="text-xs">{createdPages}/{totalPages}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-orange-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-white/80 mt-1">{progress}% des pages créées</p>
          </div>
        </div>

        {/* Content */}
        <div className="admin-menu-content max-h-96 overflow-y-auto">
          {Object.entries(pagesByCategory).map(([category, pages]) => (
            <div key={category} className="border-b border-gray-100 last:border-b-0">
              <button
                onClick={() => setSelectedCategory(
                  selectedCategory === category ? null : category
                )}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                data-testid={`button-category-${category.toLowerCase()}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#162C54]">{category}</span>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                    {pages.filter(p => p.status === "created").length}/{pages.length}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                  selectedCategory === category ? 'rotate-90' : ''
                }`} />
              </button>
              
              {selectedCategory === category && (
                <div className="bg-gray-50">
                  {pages.map((page) => {
                    const Icon = page.icon;
                    const isCurrentPage = location === page.path;
                    const canNavigate = page.status === "created";
                    
                    return (
                      <div key={page.path} className="px-6 py-2">
                        {canNavigate ? (
                          <Link 
                            href={page.path}
                            onClick={() => setIsOpen(false)}
                            className={`
                              flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-all
                              ${isCurrentPage ? 'bg-[#162C54] text-white' : 'text-gray-700'}
                            `}
                            data-testid={`link-admin-${page.name.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm flex-1">{page.name}</span>
                            <div className="flex items-center gap-1">
                              {page.status === "created" && (
                                <Check className="w-3 h-3 text-green-500" />
                              )}
                              {isCurrentPage && <Eye className="w-3 h-3" />}
                            </div>
                          </Link>
                        ) : (
                          <div className={`
                            flex items-center gap-3 p-2 rounded-lg cursor-not-allowed opacity-60
                            text-gray-500
                          `}>
                            <Icon className="w-4 h-4" />
                            <span className="text-sm flex-1">{page.name}</span>
                            <div className="flex items-center gap-1">
                              <Plus className="w-3 h-3 text-orange-500" />
                              <span className="text-xs text-orange-500">À créer</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="admin-menu-footer p-3 bg-gray-50 border-t text-center">
          <p className="text-xs text-gray-500">
            🚀 JoFé+ Digital - Menu Super Admin
          </p>
        </div>
      </div>
    </div>
  );
}