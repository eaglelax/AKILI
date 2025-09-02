import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import type { TeamMember } from "@shared/schema";
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

const navigationItems = [
  { 
    href: "/dashboard", 
    label: "Dashboard", 
    icon: LayoutDashboard
  },
  { 
    href: "/tasks", 
    label: "Tâches", 
    icon: Clock 
  },
  { 
    href: "/time-history", 
    label: "Temps", 
    icon: BarChart3 
  },
  { 
    href: "/analytics", 
    label: "Analytics", 
    icon: TrendingUp 
  },
  { 
    href: "/projects", 
    label: "Projets", 
    icon: FolderOpen 
  },
  { 
    href: "/team", 
    label: "Équipe", 
    icon: Users 
  },
  { 
    href: "/clients", 
    label: "Clients", 
    icon: Building 
  },
  { 
    href: "/chat", 
    label: "Chat", 
    icon: MessageSquare 
  },
  { 
    href: "/permissions", 
    label: "Permissions", 
    icon: Shield 
  }
];

export default function TopNavBar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current team member
  const { data: teamMember } = useQuery<TeamMember>({
    queryKey: ["/api/team-members/current"],
    retry: false,
  });

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/team-logout", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la déconnexion",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsUserMenuOpen(false);
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
      {/* Main Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#162C54] to-[#37B6E9] rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-white">J+</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-semibold text-[#162C54]">JoFé Digital</h1>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || 
                  (location === "/" && item.href === "/dashboard");
                
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={`
                      flex flex-col items-center justify-center px-4 py-3 rounded-lg text-xs font-medium transition-all duration-200 min-w-[70px] hover:transform hover:scale-105
                      ${isActive 
                        ? 'bg-[#37B6E9] text-white shadow-md' 
                        : 'text-[#3475BB] hover:bg-[#37B6E9] hover:bg-opacity-10 hover:text-[#162C54]'
                      }
                    `}
                    data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-center leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu and Mobile Toggle */}
            <div className="flex items-center space-x-4">
              
              {/* User Information and Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  data-testid="button-user-menu"
                >
                  <div className="w-8 h-8 rounded-full bg-[#3475BB] flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-[#162C54]">
                      {(user as any)?.name || teamMember?.name || 'Utilisateur'}
                    </p>
                    <p className="text-xs text-[#3475BB]">
                      {formatTime(currentTime)}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[#3475BB] transition-transform ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-[#3475BB] flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-[#162C54]">
                            {(user as any)?.name || teamMember?.name || 'Utilisateur'}
                          </p>
                          <p className="text-sm text-[#3475BB]">
                            {(user as any)?.role || 'Membre équipe'}
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
                        disabled={logoutMutation.isPending}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        data-testid="button-logout-menu"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{logoutMutation.isPending ? "Déconnexion..." : "Déconnexion"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-lg text-[#3475BB] hover:bg-gray-100 transition-colors"
                data-testid="button-mobile-menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
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
                      flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-[#37B6E9] text-white' 
                        : 'text-[#3475BB] hover:bg-[#37B6E9] hover:bg-opacity-10'
                      }
                    `}
                    data-testid={`mobile-nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* User Menu Overlay */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </>
  );
}