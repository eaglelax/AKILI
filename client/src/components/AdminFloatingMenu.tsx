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

// Liste de toutes les pages de l'application JoFé Digital
const allPages = [
  // Pages créées
  { 
    name: "Connexion", 
    path: "/login", 
    icon: LogIn, 
    status: "created", 
    category: "Auth" 
  },
  { 
    name: "Tableau de Bord", 
    path: "/dashboard", 
    icon: LayoutDashboard, 
    status: "created", 
    category: "Principal" 
  },
  { 
    name: "Gestion Équipe", 
    path: "/team", 
    icon: Users, 
    status: "created", 
    category: "Équipe" 
  },
  
  // Pages à créer
  { 
    name: "Chronométrage", 
    path: "/timer", 
    icon: Clock, 
    status: "pending", 
    category: "Temps" 
  },
  { 
    name: "Projets", 
    path: "/projects", 
    icon: FolderOpen, 
    status: "pending", 
    category: "Projets" 
  },
  { 
    name: "Gestion Clients", 
    path: "/clients", 
    icon: Building, 
    status: "pending", 
    category: "Clients" 
  },
  { 
    name: "Analytics", 
    path: "/analytics", 
    icon: BarChart3, 
    status: "pending", 
    category: "Analytique" 
  },
  { 
    name: "Chat Équipe", 
    path: "/chat", 
    icon: MessageSquare, 
    status: "pending", 
    category: "Communication" 
  },
  { 
    name: "Calendrier", 
    path: "/calendar", 
    icon: Calendar, 
    status: "pending", 
    category: "Planning" 
  },
  { 
    name: "Rapports", 
    path: "/reports", 
    icon: FileText, 
    status: "pending", 
    category: "Reporting" 
  },
  { 
    name: "Profil", 
    path: "/profile", 
    icon: UserCircle, 
    status: "pending", 
    category: "Personnel" 
  },
  { 
    name: "Paramètres", 
    path: "/settings", 
    icon: Settings, 
    status: "pending", 
    category: "Config" 
  }
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