import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import Sidebar from "@/components/Sidebar";
import { 
  Search, 
  Plus, 
  Edit, 
  DollarSign, 
  CheckCircle, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Types
interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  rate: number;
  status: 'active' | 'inactive' | 'vacation';
  type: 'admin' | 'member';
  skills: string[];
  initials: string;
}

// Données réelles de l'équipe JoFé+
const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'serge_assale',
    name: 'Serge ASSALÉ',
    role: 'Directeur Création & Marketing',
    email: 'serge.assale@jofeplus.bf',
    rate: 15000,
    status: 'active',
    type: 'admin',
    skills: ['Stratégie', 'Direction artistique', 'Management'],
    initials: 'SA'
  },
  {
    id: 'enos_gouba',
    name: 'Enos GOUBA',
    role: 'Coordinateur Production',
    email: 'enos.gouba@jofeplus.bf',
    rate: 12000,
    status: 'active',
    type: 'admin',
    skills: ['Coordination', 'Planning', 'Production'],
    initials: 'EG'
  },
  {
    id: 'paul_ouedraogo',
    name: 'Paul Junior OUEDRAOGO',
    role: 'Graphiste Photomonteur',
    email: 'paul.ouedraogo@jofeplus.bf',
    rate: 8000,
    status: 'active',
    type: 'member',
    skills: ['Photoshop', 'Photomontage', 'Retouche'],
    initials: 'PO'
  },
  {
    id: 'fortune_yanogo',
    name: 'Fortune YANOGO',
    role: 'Photographe/Vidéaste',
    email: 'fortune.yanogo@jofeplus.bf',
    rate: 10000,
    status: 'active',
    type: 'member',
    skills: ['Photographie', 'Vidéo', 'Éclairage'],
    initials: 'FY'
  },
  {
    id: 'bientama_pare',
    name: 'Bientama PARÉ',
    role: 'Motion Designer',
    email: 'bientama.pare@jofeplus.bf',
    rate: 9000,
    status: 'active',
    type: 'member',
    skills: ['After Effects', 'Animation', 'Motion'],
    initials: 'BP'
  },
  {
    id: 'issa_cisse',
    name: 'Issa CISSE',
    role: 'Graphiste Junior',
    email: 'issa.cisse@jofeplus.bf',
    rate: 6000,
    status: 'active',
    type: 'member',
    skills: ['Design graphique', 'Illustration'],
    initials: 'IC'
  },
  {
    id: 'florita_kabore',
    name: 'Florita KABORÉ',
    role: 'Responsable Médias Sociaux',
    email: 'florita.kabore@jofeplus.bf',
    rate: 7500,
    status: 'active',
    type: 'member',
    skills: ['Social Media', 'Ads', 'Analytics'],
    initials: 'FK'
  },
  {
    id: 'nebie_webou',
    name: 'Nebié WEBOU',
    role: 'Chef de Pub/Concepteur Rédacteur',
    email: 'nebie.webou@jofeplus.bf',
    rate: 8500,
    status: 'active',
    type: 'member',
    skills: ['Rédaction', 'Concept', 'Stratégie'],
    initials: 'NW'
  },
  {
    id: 'linda_kabore',
    name: 'Linda KABORÉ',
    role: 'Conceptrice Rédactrice Lead',
    email: 'linda.kabore@jofeplus.bf',
    rate: 9500,
    status: 'vacation',
    type: 'member',
    skills: ['Rédaction', 'Concept', 'Stratégie'],
    initials: 'LK'
  },
  {
    id: 'marie_toe',
    name: 'Marie TOÉ',
    role: 'Assistante Administrative',
    email: 'marie.toe@jofeplus.bf',
    rate: 5000,
    status: 'active',
    type: 'member',
    skills: ['Administration', 'Organisation', 'Support'],
    initials: 'MT'
  },
  {
    id: 'ibrahim_sawadogo',
    name: 'Ibrahim SAWADOGO',
    role: 'Community Manager',
    email: 'ibrahim.sawadogo@jofeplus.bf',
    rate: 7000,
    status: 'active',
    type: 'member',
    skills: ['Community', 'Social Media', 'Engagement'],
    initials: 'IS'
  },
  {
    id: 'salimata_ouedraogo',
    name: 'Salimata OUEDRAOGO',
    role: 'Designer Web',
    email: 'salimata.ouedraogo@jofeplus.bf',
    rate: 8000,
    status: 'active',
    type: 'member',
    skills: ['Web Design', 'UI/UX', 'Frontend'],
    initials: 'SO'
  },
  {
    id: 'amadou_kone',
    name: 'Amadou KONÉ',
    role: 'Développeur Junior',
    email: 'amadou.kone@jofeplus.bf',
    rate: 7500,
    status: 'active',
    type: 'member',
    skills: ['JavaScript', 'React', 'Node.js'],
    initials: 'AK'
  },
  {
    id: 'fatima_barry',
    name: 'Fatima BARRY',
    role: 'Chargée de Clientèle',
    email: 'fatima.barry@jofeplus.bf',
    rate: 6500,
    status: 'active',
    type: 'member',
    skills: ['Relation Client', 'Négociation', 'Suivi'],
    initials: 'FB'
  }
];

export default function Team() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Initialize WebSocket connection
  useWebSocket();

  // Fetch team stats
  const { data: teamStats } = useQuery({
    queryKey: ["/api/analytics/team"],
  });

  // Format numbers for display
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const formatCurrency = (num: number) => {
    return `${formatNumber(num)} FCFA`;
  };

  // Filter team members
  const filteredMembers = useMemo(() => {
    return TEAM_MEMBERS.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !roleFilter || roleFilter === 'all' ||
                         (roleFilter === 'admin' && member.type === 'admin') ||
                         (roleFilter === 'creative' && member.skills.some(skill => 
                           ['Photoshop', 'Photomontage', 'After Effects', 'Animation', 'Design graphique'].includes(skill))) ||
                         (roleFilter === 'marketing' && member.skills.some(skill => 
                           ['Social Media', 'Ads', 'Community', 'Stratégie'].includes(skill))) ||
                         (roleFilter === 'production' && member.skills.some(skill => 
                           ['Coordination', 'Planning', 'Production'].includes(skill)));
      const matchesStatus = !statusFilter || statusFilter === 'all' || member.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [searchTerm, roleFilter, statusFilter]);

  // Statistics
  const stats = {
    totalMembers: TEAM_MEMBERS.length,
    admins: TEAM_MEMBERS.filter(m => m.type === 'admin').length,
    activeMembers: TEAM_MEMBERS.filter(m => m.status === 'active').length,
    attendanceRate: Math.round((TEAM_MEMBERS.filter(m => m.status === 'active').length / TEAM_MEMBERS.length) * 100)
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
  };

  const handleCloseEdit = () => {
    setEditingMember(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      
      {/* Main Content */}
      <div className="md:ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="jofe-font text-2xl text-primary">Gestion des Profils Utilisateurs</h1>
              <p className="text-sm text-muted-foreground">Gérez les membres de votre équipe JoFé+ et leurs permissions</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="jofe-btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Ajouter Membre
                  </Button>
                </DialogTrigger>
                <DialogContent className="modal-content">
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouveau membre</DialogTitle>
                  </DialogHeader>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nom complet</Label>
                        <Input id="name" className="jofe-input" placeholder="Nom Prénom" />
                      </div>
                      <div>
                        <Label htmlFor="role">Poste</Label>
                        <Input id="role" className="jofe-input" placeholder="Titre du poste" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" className="jofe-input" placeholder="email@jofeplus.bf" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rate">Taux horaire (FCFA)</Label>
                        <Input id="rate" type="number" className="jofe-input" placeholder="5000" />
                      </div>
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select>
                          <SelectTrigger className="jofe-input">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrateur</SelectItem>
                            <SelectItem value="member">Membre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="skills">Compétences</Label>
                      <Textarea id="skills" className="jofe-input" rows={3} placeholder="Séparez les compétences par des virgules" />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" className="jofe-btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                        Annuler
                      </Button>
                      <Button type="submit" className="jofe-btn-primary">
                        Ajouter le Membre
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 space-y-8">
          {/* Statistics */}
          <div className="stats-grid fade-in">
            <div className="stat-card">
              <div className="stat-number">{stats.totalMembers}</div>
              <div className="stat-label">Membres Actifs</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.admins}</div>
              <div className="stat-label">Administrateurs</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.activeMembers}</div>
              <div className="stat-label">Membres Équipe</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.attendanceRate}%</div>
              <div className="stat-label">Taux Présence</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 fade-in">
            <div className="search-container flex-1">
              <Search className="search-icon w-4 h-4" />
              <Input 
                type="text" 
                className="jofe-input search-input" 
                placeholder="Rechercher un membre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-member"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="jofe-input w-48">
                <SelectValue placeholder="Tous les rôles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="admin">Administrateurs</SelectItem>
                <SelectItem value="creative">Créatifs</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="jofe-input w-48">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="vacation">En congé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in">
            {filteredMembers.map((member) => (
              <div key={member.id} className="kpi-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      {member.initials}
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <span className={member.type === 'admin' ? 'jofe-badge-admin' : 'jofe-badge-member'}>
                    {member.type === 'admin' ? 'ADMIN' : 'MEMBRE'}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {formatCurrency(member.rate)}/h
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {member.status === 'active' ? 'En ligne' : 
                     member.status === 'vacation' ? 'En congé' : 'Hors ligne'}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {member.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                    {member.skills.length > 3 && (
                      <span className="skill-tag">+{member.skills.length - 3}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="jofe-btn-primary flex-1 text-sm" 
                    onClick={() => handleEditMember(member)}
                    data-testid={`button-edit-${member.id}`}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="modal-overlay" onClick={handleCloseEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="jofe-font text-xl text-primary">Modifier le profil</h2>
              <button onClick={handleCloseEdit} className="p-2 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editName">Nom complet</Label>
                  <Input 
                    id="editName" 
                    className="jofe-input" 
                    defaultValue={editingMember.name}
                  />
                </div>
                <div>
                  <Label htmlFor="editRole">Poste</Label>
                  <Input 
                    id="editRole" 
                    className="jofe-input" 
                    defaultValue={editingMember.role}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input 
                  id="editEmail" 
                  type="email" 
                  className="jofe-input" 
                  defaultValue={editingMember.email}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editRate">Taux horaire (FCFA)</Label>
                  <Input 
                    id="editRate" 
                    type="number" 
                    className="jofe-input" 
                    defaultValue={editingMember.rate}
                  />
                </div>
                <div>
                  <Label htmlFor="editStatus">Statut</Label>
                  <Select defaultValue={editingMember.status}>
                    <SelectTrigger className="jofe-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                      <SelectItem value="vacation">En congé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="editSkills">Compétences</Label>
                <Textarea 
                  id="editSkills" 
                  className="jofe-input" 
                  rows={3} 
                  defaultValue={editingMember.skills.join(', ')}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" className="jofe-btn-secondary" onClick={handleCloseEdit}>
                  Annuler
                </button>
                <button type="submit" className="jofe-btn-primary">
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}