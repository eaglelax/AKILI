import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/hooks/useAuth";
import TopNavBar from "@/components/TopNavBar";
import { 
  Shield,
  Users,
  Clock,
  Lock,
  Plus,
  Save,
  Settings,
  User,
  ArrowLeft,
  Bell,
  AlertTriangle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
// import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// Types pour les permissions
interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface TeamMemberPermission {
  id: string;
  name: string;
  role: string;
  isAdmin: boolean;
  hourlyRate: number;
  permissions: {
    manageAll: boolean;
    assignTimers: boolean;
    viewOwnTasks: boolean;
    viewOtherTasks: boolean;
  };
  avatar: string;
  initials: string;
}

interface PermissionStats {
  totalAdmins: number;
  totalMembers: number;
  activeTimers: number;
  activeRestrictions: number;
}

export default function Permissions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Initialize WebSocket connection
  useWebSocket();

  // States for filter and management
  const [selectedMember, setSelectedMember] = useState<string>("");

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  // Mock data - données réelles du template
  const permissionStats: PermissionStats = {
    totalAdmins: 2,
    totalMembers: 12,
    activeTimers: 8,
    activeRestrictions: 3
  };

  const teamMembers: TeamMemberPermission[] = [
    // Administrateurs (2)
    {
      id: "serge_assale",
      name: "Directeur Création",
      role: "Directeur Création & Marketing",
      isAdmin: true,
      hourlyRate: 15000,
      permissions: {
        manageAll: true,
        assignTimers: true,
        viewOwnTasks: true,
        viewOtherTasks: true
      },
      avatar: "var(--jofe-orange)",
      initials: "SA"
    },
    {
      id: "enos_gouba",
      name: "Enos GOUBA",
      role: "Coordinateur Production",
      isAdmin: true,
      hourlyRate: 12000,
      permissions: {
        manageAll: true,
        assignTimers: true,
        viewOwnTasks: true,
        viewOtherTasks: true
      },
      avatar: "var(--jofe-orange)",
      initials: "EG"
    },
    
    // Équipe Créative (6)
    {
      id: "paul_ouedraogo",
      name: "Paul Junior OUEDRAOGO",
      role: "Graphiste Photomonteur",
      isAdmin: false,
      hourlyRate: 8000,
      permissions: {
        manageAll: false,
        assignTimers: false,
        viewOwnTasks: true,
        viewOtherTasks: false
      },
      avatar: "var(--jofe-blue-medium)",
      initials: "PO"
    },
    {
      id: "fortune_yanogo",
      name: "Fortune YANOGO",
      role: "Photographe/Vidéaste",
      isAdmin: false,
      hourlyRate: 10000,
      permissions: {
        manageAll: false,
        assignTimers: false,
        viewOwnTasks: true,
        viewOtherTasks: false
      },
      avatar: "var(--jofe-blue-medium)",
      initials: "FY"
    },
    {
      id: "bientama_pare",
      name: "Bientama PARÉ",
      role: "Motion Designer",
      isAdmin: false,
      hourlyRate: 9000,
      permissions: {
        manageAll: false,
        assignTimers: false,
        viewOwnTasks: true,
        viewOtherTasks: false
      },
      avatar: "var(--jofe-blue-medium)",
      initials: "BP"
    },
    {
      id: "issa_cisse",
      name: "Issa CISSE",
      role: "Graphiste Junior",
      isAdmin: false,
      hourlyRate: 6000,
      permissions: {
        manageAll: false,
        assignTimers: false,
        viewOwnTasks: true,
        viewOtherTasks: false
      },
      avatar: "var(--jofe-blue-medium)",
      initials: "IC"
    },
    {
      id: "jean_sampabao",
      name: "Jean-Jacques SAMPABAO",
      role: "Directeur Artistique Junior",
      isAdmin: false,
      hourlyRate: 8500,
      permissions: {
        manageAll: false,
        assignTimers: false,
        viewOwnTasks: true,
        viewOtherTasks: false
      },
      avatar: "var(--jofe-blue-medium)",
      initials: "JS"
    },
    {
      id: "latif_ouedraogo",
      name: "Abdoul Latif OUEDRAOGO",
      role: "Designer UI/UX",
      isAdmin: false,
      hourlyRate: 9500,
      permissions: {
        manageAll: false,
        assignTimers: false,
        viewOwnTasks: true,
        viewOtherTasks: false
      },
      avatar: "var(--jofe-blue-medium)",
      initials: "AO"
    },
    
    // Communication & Marketing (6)
    {
      id: "florita_kabore",
      name: "Florita KABORÉ",
      role: "Responsable Médias Sociaux",
      isAdmin: false,
      hourlyRate: 7500,
      permissions: {
        manageAll: false,
        assignTimers: false,
        viewOwnTasks: true,
        viewOtherTasks: false
      },
      avatar: "var(--jofe-blue-medium)",
      initials: "FK"
    },
    {
      id: "nebie_webou",
      name: "Nebié WEBOU",
      role: "Chef de Pub/Concepteur Rédacteur",
      isAdmin: false,
      hourlyRate: 8500,
      permissions: {
        manageAll: false,
        assignTimers: false,
        viewOwnTasks: true,
        viewOtherTasks: false
      },
      avatar: "var(--jofe-blue-medium)",
      initials: "NW"
    },
    {
      id: "djamilatou_guiguemde",
      name: "Djamilatou GUIGUEMDE",
      role: "Chef de Pub Stagiaire",
      isAdmin: false,
      hourlyRate: 5000,
      permissions: {
        manageAll: false,
        assignTimers: false,
        viewOwnTasks: true,
        viewOtherTasks: false
      },
      avatar: "var(--jofe-blue-medium)",
      initials: "DG"
    },
    {
      id: "linda_kabore",
      name: "Linda KABORÉ",
      role: "Conceptrice Rédactrice Lead",
      isAdmin: false,
      hourlyRate: 9500,
      permissions: {
        manageAll: false,
        assignTimers: false,
        viewOwnTasks: true,
        viewOtherTasks: true
      },
      avatar: "var(--jofe-blue-medium)",
      initials: "LK"
    },
    {
      id: "maryse_bombiri",
      name: "Maryse BOMBIRI",
      role: "Community Manager",
      isAdmin: false,
      hourlyRate: 6500,
      permissions: {
        manageAll: false,
        assignTimers: false,
        viewOwnTasks: true,
        viewOtherTasks: false
      },
      avatar: "var(--jofe-blue-medium)",
      initials: "MB"
    },
    {
      id: "faridatou_barry",
      name: "Faridatou BARRY",
      role: "Chef de Pub/CM",
      isAdmin: false,
      hourlyRate: 7000,
      permissions: {
        manageAll: false,
        assignTimers: false,
        viewOwnTasks: true,
        viewOtherTasks: false
      },
      avatar: "var(--jofe-blue-medium)",
      initials: "FB"
    }
  ];

  // Mutation pour sauvegarder les permissions
  const savePermissionsMutation = useMutation({
    mutationFn: async (data: any) => {
      // API call pour sauvegarder
      const response = await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Permissions sauvegardées",
        description: "Les modifications ont été appliquées avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/permissions'] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les permissions",
        variant: "destructive",
      });
    }
  });

  const handlePermissionChange = (memberId: string, permission: string, value: boolean) => {
    // Update local state and trigger save
    console.log(`Changing ${permission} for ${memberId} to ${value}`);
  };

  const handleRateChange = (memberId: string, newRate: number) => {
    console.log(`Changing rate for ${memberId} to ${newRate}`);
  };

  const getStatusBadge = (isAdmin: boolean) => {
    if (isAdmin) {
      return "bg-[var(--jofe-orange)] bg-opacity-20 text-[var(--jofe-orange)]";
    }
    return "bg-[var(--jofe-blue-medium)] bg-opacity-20 text-[var(--jofe-blue-medium)]";
  };

  const getStatusText = (isAdmin: boolean) => {
    return isAdmin ? "ADMINISTRATEUR" : "MEMBRE";
  };

  const getBorderClass = (isAdmin: boolean) => {
    return isAdmin ? "border-l-4 border-l-[var(--jofe-orange)]" : "border-l-4 border-l-[var(--jofe-blue-light)]";
  };

  return (
    <div className="min-h-screen bg-[var(--jofe-white)]">
      <TopNavBar />
      
      <div className="lg:ml-72">
        <div className="w-full overflow-auto">
        
        {/* Header */}
        <header className="bg-[var(--jofe-white)] border-b border-[var(--jofe-gray)] px-4 md:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="jofe-logo flex items-center space-x-3">
              <div className="jofe-rings relative w-10 h-10">
                <div className="jofe-ring absolute w-5 h-5 border-2 rounded-full border-[var(--jofe-blue-deep)] top-0 left-2 animate-bounce"></div>
                <div className="jofe-ring absolute w-5 h-5 border-2 rounded-full border-[var(--jofe-blue-medium)] bottom-0 left-0 animate-bounce" style={{animationDelay: "0.5s"}}></div>
                <div className="jofe-ring absolute w-5 h-5 border-2 rounded-full border-[var(--jofe-blue-light)] bottom-0 right-0 animate-bounce" style={{animationDelay: "1s"}}></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--jofe-blue-deep)] jofe-font">Permissions</h1>
                <p className="text-sm text-[var(--jofe-blue-medium)]">Configuration des Permissions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-[var(--jofe-gray)] transition-colors">
                <Bell className="w-6 h-6 text-[var(--jofe-blue-medium)]" />
              </button>
              <div className="flex items-center space-x-2">
                <User className="w-8 h-8 text-[var(--jofe-blue-medium)]" />
                <span className="font-medium text-[var(--jofe-blue-deep)]">
                  {(user as any)?.name || 'Utilisateur'}
                </span>
                <span className="status-badge inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[var(--jofe-orange)] bg-opacity-20 text-[var(--jofe-orange)] uppercase">
                  ADMIN
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu Principal */}
        <main className="p-6 md:p-8 overflow-y-auto">
          {/* En-tête de page */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="jofe-font text-3xl text-[var(--jofe-blue-deep)] mb-2">Configuration des Permissions de Chronométrage</h1>
                <p className="text-[var(--jofe-blue-medium)] text-lg">Gérez les droits d'accès et les permissions pour le système de chronométrage</p>
              </div>
              <Button 
                className="jofe-btn bg-gradient-to-r from-[var(--jofe-blue-light)] to-[var(--jofe-blue-medium)] text-white px-6 py-3 hover:from-[var(--jofe-blue-medium)] hover:to-[var(--jofe-blue-deep)] transition-all transform hover:-translate-y-0.5"
                data-testid="button-new-role"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouveau Rôle
              </Button>
            </div>
          </div>

          {/* Cartes de Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="jofe-card p-6 border border-[var(--jofe-gray)] hover-lift transition-all transform hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--jofe-blue-medium)]">Administrateurs</p>
                  <p className="text-3xl font-bold text-[var(--jofe-orange)]">{permissionStats.totalAdmins}</p>
                </div>
                <Shield className="w-8 h-8 text-[var(--jofe-orange)]" />
              </div>
            </Card>

            <Card className="jofe-card p-6 border border-[var(--jofe-gray)] hover-lift transition-all transform hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--jofe-blue-medium)]">Membres Équipe</p>
                  <p className="text-3xl font-bold text-[var(--jofe-blue-medium)]">{permissionStats.totalMembers}</p>
                </div>
                <Users className="w-8 h-8 text-[var(--jofe-blue-medium)]" />
              </div>
            </Card>

            <Card className="jofe-card p-6 border border-[var(--jofe-gray)] hover-lift transition-all transform hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--jofe-blue-medium)]">Timers Actifs</p>
                  <p className="text-3xl font-bold text-[var(--jofe-green)]">{permissionStats.activeTimers}</p>
                </div>
                <Clock className="w-8 h-8 text-[var(--jofe-green)]" />
              </div>
            </Card>

            <Card className="jofe-card p-6 border border-[var(--jofe-gray)] hover-lift transition-all transform hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--jofe-blue-medium)]">Restrictions Actives</p>
                  <p className="text-3xl font-bold text-gray-500">{permissionStats.activeRestrictions}</p>
                </div>
                <Lock className="w-8 h-8 text-gray-500" />
              </div>
            </Card>
          </div>

          {/* Configuration Principale */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Permissions par Membre */}
            <div className="lg:col-span-2">
              <Card className="jofe-card p-6 border border-[var(--jofe-gray)]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="jofe-font text-xl text-[var(--jofe-blue-night)]">Permissions par Membre</h2>
                  <Button 
                    onClick={() => savePermissionsMutation.mutate({})}
                    className="bg-[var(--jofe-green)] hover:bg-opacity-80 text-white px-4 py-2 text-sm transition-all transform hover:-translate-y-0.5"
                    data-testid="button-save-permissions"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>

                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <Card key={member.id} className={`p-4 ${getBorderClass(member.isAdmin)} transition-all hover:shadow-md`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: member.avatar }}
                          >
                            <span className="text-white font-medium">{member.initials}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-[var(--jofe-blue-deep)]">{member.name}</h3>
                            <p className="text-sm text-[var(--jofe-blue-medium)]">{member.role}</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusBadge(member.isAdmin)}`}>
                              {getStatusText(member.isAdmin)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          {/* Taux Horaire */}
                          <div className="text-right">
                            <p className="text-sm font-medium text-[var(--jofe-blue-deep)]">Taux Horaire</p>
                            <Input
                              type="number"
                              value={member.hourlyRate}
                              onChange={(e) => handleRateChange(member.id, parseInt(e.target.value))}
                              className="w-24 text-sm jofe-input border-2 border-[var(--jofe-gray)] focus:border-[var(--jofe-blue-light)]"
                              disabled={member.isAdmin}
                              data-testid={`input-rate-${member.id}`}
                            />
                            <p className="text-xs text-[var(--jofe-blue-medium)]">FCFA/h</p>
                          </div>
                          
                          {/* Permissions */}
                          <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                              <button 
                                className={`w-12 h-6 rounded-full transition-all ${member.permissions.manageAll ? 'bg-[var(--jofe-green)]' : 'bg-[var(--jofe-gray)]'} ${member.isAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                onClick={() => !member.isAdmin && handlePermissionChange(member.id, 'manageAll', !member.permissions.manageAll)}
                                disabled={member.isAdmin}
                                data-testid={`switch-manage-all-${member.id}`}
                              >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${member.permissions.manageAll ? 'translate-x-6' : 'translate-x-1'}`}></div>
                              </button>
                              <span className="text-sm">{member.isAdmin ? "Gestion Complète" : "Ses Tâches"}</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <button 
                                className={`w-12 h-6 rounded-full transition-all ${member.permissions.viewOtherTasks ? 'bg-[var(--jofe-green)]' : 'bg-[var(--jofe-gray)]'} ${member.isAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                onClick={() => !member.isAdmin && handlePermissionChange(member.id, 'viewOtherTasks', !member.permissions.viewOtherTasks)}
                                disabled={member.isAdmin}
                                data-testid={`switch-view-others-${member.id}`}
                              >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${member.permissions.viewOtherTasks ? 'translate-x-6' : 'translate-x-1'}`}></div>
                              </button>
                              <span className="text-sm">{member.isAdmin ? "Attribution Timers" : "Voir Autres"}</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>

            {/* Panneau de Contrôle */}
            <div className="space-y-6">
              {/* Permissions Globales */}
              <Card className="jofe-card p-6 border border-[var(--jofe-gray)]">
                <h3 className="jofe-font text-lg text-[var(--jofe-blue-deep)] mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Permissions Globales
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[var(--jofe-blue-deep)]">Auto-start Timers</p>
                      <p className="text-sm text-[var(--jofe-blue-medium)]">Démarrage automatique des chronos</p>
                    </div>
                    <button 
                      className="w-12 h-6 rounded-full bg-[var(--jofe-green)] cursor-pointer transition-all"
                      data-testid="switch-auto-start"
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform translate-x-6"></div>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[var(--jofe-blue-deep)]">Notifications Temps</p>
                      <p className="text-sm text-[var(--jofe-blue-medium)]">Alertes de dépassement</p>
                    </div>
                    <button 
                      className="w-12 h-6 rounded-full bg-[var(--jofe-green)] cursor-pointer transition-all"
                      data-testid="switch-notifications"
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform translate-x-6"></div>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[var(--jofe-blue-deep)]">Mode Strict</p>
                      <p className="text-sm text-[var(--jofe-blue-medium)]">Validation admin requise</p>
                    </div>
                    <button 
                      className="w-12 h-6 rounded-full bg-[var(--jofe-gray)] cursor-pointer transition-all"
                      data-testid="switch-strict-mode"
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform translate-x-1"></div>
                    </button>
                  </div>
                </div>
              </Card>

              {/* Restrictions Temporelles */}
              <Card className="jofe-card p-6 border border-[var(--jofe-gray)]">
                <h3 className="jofe-font text-lg text-[var(--jofe-blue-deep)] mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Restrictions
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--jofe-blue-deep)] mb-2">
                      Limite Journalière (heures)
                    </label>
                    <Input
                      type="number"
                      defaultValue="8"
                      className="jofe-input border-2 border-[var(--jofe-gray)] focus:border-[var(--jofe-blue-light)]"
                      data-testid="input-daily-limit"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--jofe-blue-deep)] mb-2">
                      Pause Obligatoire (minutes)
                    </label>
                    <Input
                      type="number"
                      defaultValue="60"
                      className="jofe-input border-2 border-[var(--jofe-gray)] focus:border-[var(--jofe-blue-light)]"
                      data-testid="input-break-time"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--jofe-blue-deep)] mb-2">
                      Overtime Multiplier
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      defaultValue="1.5"
                      className="jofe-input border-2 border-[var(--jofe-gray)] focus:border-[var(--jofe-blue-light)]"
                      data-testid="input-overtime-multiplier"
                    />
                  </div>
                </div>
              </Card>

              {/* Actions Rapides */}
              <Card className="jofe-card p-6 border border-[var(--jofe-gray)]">
                <h3 className="jofe-font text-lg text-[var(--jofe-blue-deep)] mb-4">Actions Rapides</h3>
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-[var(--jofe-orange)] hover:bg-opacity-80 text-white transition-all transform hover:-translate-y-0.5"
                    data-testid="button-reset-all-timers"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Réinitialiser Tous les Timers
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full border-[var(--jofe-blue-medium)] text-[var(--jofe-blue-medium)] hover:bg-[var(--jofe-blue-medium)] hover:text-white transition-all"
                    data-testid="button-export-permissions"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Exporter Permissions
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full border-[var(--jofe-green)] text-[var(--jofe-green)] hover:bg-[var(--jofe-green)] hover:text-white transition-all"
                    data-testid="button-backup-config"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder Config
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </main>
        </div>
      </div>
    </div>
  );
}