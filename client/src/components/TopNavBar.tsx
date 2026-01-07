import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Clock, 
  FolderOpen, 
  Users, 
  Building, 
  BarChart3, 
  TrendingUp,
  MessageSquare,
  Shield,
  Settings,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut
} from "lucide-react";

// Définition des menus avec les rôles autorisés
// roles: 'all' = tous, 'admin' = admin + super_admin, 'super_admin' = super_admin seulement
type NavItem = {
  href: string;
  label: string;
  icon: any;
  roles: 'all' | 'admin' | 'super_admin';
};

const allNavigationItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: 'all' // Visible par tous
  },
  {
    href: "/tasks",
    label: "Tâches",
    icon: Clock,
    roles: 'all' // Visible par tous
  },
  {
    href: "/projects",
    label: "Projets",
    icon: FolderOpen,
    roles: 'all' // Visible par tous
  },
  {
    href: "/chat",
    label: "Chat",
    icon: MessageSquare,
    roles: 'all' // Visible par tous
  },
  {
    href: "/team",
    label: "Équipe",
    icon: Users,
    roles: 'admin' // Visible par admin et super_admin
  },
  {
    href: "/clients",
    label: "Clients",
    icon: Building,
    roles: 'admin' // Visible par admin et super_admin
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: TrendingUp,
    roles: 'super_admin' // Visible seulement par super_admin
  },
  {
    href: "/permissions",
    label: "Permissions",
    icon: Shield,
    roles: 'super_admin' // Visible seulement par super_admin
  }
];

// Fonction pour filtrer les menus selon le rôle
const getNavigationItems = (userRole: 'super_admin' | 'admin' | 'member' | undefined) => {
  return allNavigationItems.filter(item => {
    if (item.roles === 'all') return true;
    if (item.roles === 'admin' && (userRole === 'admin' || userRole === 'super_admin')) return true;
    if (item.roles === 'super_admin' && userRole === 'super_admin') return true;
    return false;
  });
};

export default function TopNavBar() {
  const [location] = useLocation();
  const { user, userRole } = useAuth();

  // Obtenir les menus filtrés selon le rôle de l'utilisateur
  const navigationItems = getNavigationItems(userRole as 'super_admin' | 'admin' | 'member' | undefined);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setIsUserMenuOpen(false);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      if (data.success || response.ok) {
        queryClient.clear();
        toast({
          title: "Déconnexion réussie",
          description: "À bientôt !",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors de la déconnexion",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Erreur déconnexion:", err);
      // Même en cas d'erreur, on redirige vers login
      queryClient.clear();
      window.location.href = "/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Main Navigation Sidebar - Left Side */}
      <nav className="hidden lg:block fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-200 z-40 shadow-lg flex flex-col">
        
        {/* Header with User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-100"
              data-testid="button-user-menu"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#162C54] to-[#37B6E9] flex items-center justify-center shadow-md">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-[#162C54]">
                  {user?.name || 'Utilisateur'}
                </p>
                <p className="text-xs text-[#3475BB] font-medium">
                  {formatTime(currentTime)}
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#3475BB] transition-transform duration-200 ${
                isUserMenuOpen ? 'rotate-180' : ''
              }`} />
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div
                className="absolute left-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#3475BB] flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-[#162C54]">
                        {user?.name || 'Utilisateur'}
                      </p>
                      <p className="text-sm text-[#3475BB]">
                        {user?.role || 'Membre équipe'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <Link
                    href="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    data-testid="link-settings"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Paramètres</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    data-testid="button-logout-menu"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isLoggingOut ? "Déconnexion..." : "Déconnexion"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Navigation - Vertical Layout */}
        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || 
              (location === "/" && item.href === "/dashboard");
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`
                  flex items-center space-x-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 w-full group
                  ${isActive 
                    ? 'bg-[#37B6E9] text-white shadow-lg' 
                    : 'text-[#3475BB] hover:bg-[#37B6E9] hover:bg-opacity-10 hover:text-[#162C54]'
                  }
                `}
                data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="w-5 h-5 transition-all duration-300" />
                <span className="flex-1 text-left">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Button - Only visible on small screens */}
        <div className="lg:hidden p-4 border-t border-gray-200">
          <button
            onClick={toggleMobileMenu}
            className="w-full flex items-center justify-center p-3 rounded-xl text-[#3475BB] hover:bg-gray-50 transition-all duration-200 border border-gray-100"
            data-testid="button-mobile-menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span className="ml-2 text-sm font-medium">Menu</span>
          </button>
        </div>

      </nav>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#162C54]">Navigation</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl text-[#3475BB] hover:bg-gray-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-3">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || 
                  (location === "/" && item.href === "/dashboard");
                
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-200 shadow-sm w-full
                      ${isActive 
                        ? 'bg-[#37B6E9] text-white shadow-md' 
                        : 'text-[#3475BB] hover:bg-[#37B6E9] hover:bg-opacity-10 bg-gray-50'
                      }
                    `}
                    data-testid={`mobile-nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="font-medium text-base">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

    </>
  );
}