import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard, 
  Clock, 
  FolderOpen, 
  Users, 
  Building, 
  BarChart3, 
  MessageSquare,
  Settings,
  User,
  Menu,
  X
} from "lucide-react";

const navigationItems = [
  { 
    href: "/dashboard", 
    label: "Tableau de Bord", 
    icon: LayoutDashboard,
    active: true 
  },
  { 
    href: "/tasks", 
    label: "Gestion des Tâches", 
    icon: Clock 
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
    href: "/analytics", 
    label: "Analytics", 
    icon: BarChart3 
  },
  { 
    href: "/chat", 
    label: "Chat", 
    icon: MessageSquare 
  }
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg bg-primary text-white shadow-lg"
          data-testid="button-mobile-menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6">
          
          {/* Navigation */}
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || 
                (location === "/" && item.href === "/dashboard");
              
              return (
                <Link key={item.href} href={item.href} className={`
                      sidebar-link 
                      ${isActive ? 'active' : ''}
                    `}>
                  <div 
                    onClick={() => setIsMobileMenuOpen(false)}
                    data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Informations utilisateur */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/5">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-primary truncate">
                {(user as any)?.name || 'Utilisateur'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {(user as any)?.role || 'Membre équipe'}
              </p>
            </div>
            <Link href="/settings" className="p-1 rounded hover:bg-gray-100 transition-colors">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}