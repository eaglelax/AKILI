import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Team from "@/pages/team";
import Tasks from "@/pages/tasks";
import TaskDetail from "@/pages/task-detail";
import TimeHistory from "@/pages/time-history";
import Permissions from "@/pages/permissions";
import Analytics from "@/pages/analytics";
import Reports from "@/pages/reports";
import ProductivityAnalysis from "@/pages/productivity-analysis";
import RoiProfitability from "@/pages/roi-profitability";
import Splash from "@/pages/splash";
import AdminFloatingMenu from "@/components/AdminFloatingMenu";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Page splash */}
      <Route path="/splash" component={Splash} />
      
      {/* Routes d'authentification */}
      <Route path="/login" component={Login} />
      
      {/* Routes principales */}
      <Route path="/" component={!isAuthenticated ? Landing : Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/team" component={Team} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/tasks/:id" component={TaskDetail} />
      <Route path="/time-history" component={TimeHistory} />
      <Route path="/permissions" component={Permissions} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/reports" component={Reports} />
      <Route path="/productivity-analysis" component={ProductivityAnalysis} />
      <Route path="/roi-profitability" component={RoiProfitability} />
      
      {/* Route 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <AdminFloatingMenu />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
