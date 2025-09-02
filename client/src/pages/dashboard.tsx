import { useState, useEffect } from "react";
import { Header } from "@/components/common/Header";
import { Navigation } from "@/components/common/Navigation";
import { TasksTable } from "@/components/tasks/TasksTable";
import { ProjectsView } from "@/components/projects/ProjectsView";
import { TeamView } from "@/components/team/TeamView";
import { ClientsView } from "@/components/clients/ClientsView";
import { AnalyticsView } from "@/components/analytics/AnalyticsView";
import { ChatView } from "@/components/chat/ChatView";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("tasks");
  
  // Initialize WebSocket connection
  useWebSocket();

  // Get current team member info
  const { data: teamMember } = useQuery({
    queryKey: ["/api/team-members/current"],
  });

  const renderActiveTab = () => {
    switch (activeTab) {
      case "tasks":
        return <TasksTable />;
      case "projects":
        return <ProjectsView />;
      case "team":
        return <TeamView />;
      case "clients":
        return <ClientsView />;
      case "analytics":
        return <AnalyticsView />;
      case "chat":
        return <ChatView />;
      default:
        return <TasksTable />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="p-6">
        {renderActiveTab()}
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => setActiveTab("tasks")}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 z-50"
        data-testid="button-fab"
      >
        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
