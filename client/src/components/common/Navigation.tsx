import { cn } from "@/lib/utils";
import { 
  List, 
  Folder, 
  Users, 
  Briefcase, 
  BarChart2, 
  MessageCircle 
} from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "tasks", label: "Gestion des Tâches", icon: List },
  { id: "projects", label: "Projets", icon: Folder },
  { id: "team", label: "Équipe", icon: Users },
  { id: "clients", label: "Clients", icon: Briefcase },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "chat", label: "Chat", icon: MessageCircle },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="bg-card border-b border-border px-6">
      <div className="flex space-x-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "px-4 py-3 text-sm font-medium rounded-t-lg transition-colors flex items-center space-x-2",
                "tab-btn",
                activeTab === tab.id && "active"
              )}
              data-testid={`tab-${tab.id}`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
