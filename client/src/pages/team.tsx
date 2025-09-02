import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Plus, 
  Edit, 
  DollarSign, 
  CheckCircle, 
  X,
  ExternalLink 
} from "lucide-react";

// Types
interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  rate: number;
  status: "active" | "inactive" | "vacation";
  type: "admin" | "member";
  skills: string[];
  avatar: string;
}

// Données réelles des 14 membres JoFé Digital
const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "serge_assale",
    name: "Serge ASSALÉ",
    role: "Directeur Création & Marketing",
    email: "serge.assale@jofeplus.bf",
    rate: 15000,
    status: "active",
    type: "admin",
    skills: ["Stratégie", "Direction artistique", "Management"],
    avatar: "SA"
  },
  {
    id: "enos_gouba",
    name: "Enos GOUBA",
    role: "Coordinateur Production",
    email: "enos.gouba@jofeplus.bf",
    rate: 12000,
    status: "active",
    type: "admin",
    skills: ["Coordination", "Planning", "Production"],
    avatar: "EG"
  },
  {
    id: "paul_ouedraogo",
    name: "Paul Junior OUEDRAOGO",
    role: "Graphiste Photomonteur",
    email: "paul.ouedraogo@jofeplus.bf",
    rate: 8000,
    status: "active",
    type: "member",
    skills: ["Photoshop", "Photomontage", "Retouche"],
    avatar: "PO"
  },
  {
    id: "fortune_yanogo",
    name: "Fortune YANOGO",
    role: "Photographe/Vidéaste",
    email: "fortune.yanogo@jofeplus.bf",
    rate: 10000,
    status: "active",
    type: "member",
    skills: ["Photographie", "Vidéo", "Éclairage"],
    avatar: "FY"
  },
  {
    id: "bientama_pare",
    name: "Bientama PARÉ",
    role: "Motion Designer",
    email: "bientama.pare@jofeplus.bf",
    rate: 9000,
    status: "active",
    type: "member",
    skills: ["After Effects", "Animation", "Motion"],
    avatar: "BP"
  },
  {
    id: "issa_cisse",
    name: "Issa CISSE",
    role: "Graphiste Junior",
    email: "issa.cisse@jofeplus.bf",
    rate: 6000,
    status: "active",
    type: "member",
    skills: ["Design graphique", "Illustration"],
    avatar: "IC"
  },
  {
    id: "florita_kabore",
    name: "Florita KABORÉ",
    role: "Responsable Médias Sociaux",
    email: "florita.kabore@jofeplus.bf",
    rate: 7500,
    status: "active",
    type: "member",
    skills: ["Social Media", "Ads", "Analytics"],
    avatar: "FK"
  },
  {
    id: "nebie_webou",
    name: "Nebié WEBOU",
    role: "Chef de Pub/Concepteur Rédacteur",
    email: "nebie.webou@jofeplus.bf",
    rate: 8500,
    status: "active",
    type: "member",
    skills: ["Rédaction", "Concept", "Stratégie"],
    avatar: "NW"
  },
  {
    id: "linda_kabore",
    name: "Linda KABORÉ",
    role: "Conceptrice Rédactrice Lead",
    email: "linda.kabore@jofeplus.bf",
    rate: 9500,
    status: "vacation",
    type: "member",
    skills: ["Rédaction", "Concept", "Stratégie"],
    avatar: "LK"
  },
  {
    id: "fanta_sawadogo",
    name: "Fanta SAWADOGO",
    role: "Assistante Administrative",
    email: "fanta.sawadogo@jofeplus.bf",
    rate: 5000,
    status: "active",
    type: "member",
    skills: ["Administration", "Organisation", "Communication"],
    avatar: "FS"
  },
  {
    id: "armelle_traore",
    name: "Armelle TRAORÉ",
    role: "Community Manager",
    email: "armelle.traore@jofeplus.bf",
    rate: 7000,
    status: "active",
    type: "member",
    skills: ["Community", "Social Media", "Engagement"],
    avatar: "AT"
  },
  {
    id: "ibrahim_ouedraogo",
    name: "Ibrahim OUÉDRAOGO",
    role: "Commercial & Relations Clients",
    email: "ibrahim.ouedraogo@jofeplus.bf",
    rate: 8000,
    status: "active",
    type: "member",
    skills: ["Vente", "Relations client", "Négociation"],
    avatar: "IO"
  },
  {
    id: "mariam_kone",
    name: "Mariam KONÉ",
    role: "Graphiste Junior",
    email: "mariam.kone@jofeplus.bf",
    rate: 6000,
    status: "active",
    type: "member",
    skills: ["Design graphique", "Mise en page", "Print"],
    avatar: "MK"
  },
  {
    id: "saidou_barry",
    name: "Saïdou BARRY",
    role: "Développeur Web",
    email: "saidou.barry@jofeplus.bf",
    rate: 10000,
    status: "active",
    type: "member",
    skills: ["React", "Node.js", "WordPress"],
    avatar: "SB"
  }
];

export default function Team() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Statistiques calculées
  const stats = useMemo(() => {
    const total = TEAM_MEMBERS.length;
    const admins = TEAM_MEMBERS.filter(m => m.type === "admin").length;
    const members = TEAM_MEMBERS.filter(m => m.type === "member").length;
    const activeRate = Math.round((TEAM_MEMBERS.filter(m => m.status === "active").length / total) * 100);
    
    return { total, admins, members, activeRate };
  }, []);

  // Filtrage des membres
  const filteredMembers = useMemo(() => {
    return TEAM_MEMBERS.filter(member => {
      const matchesSearch = 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = !roleFilter || 
        (roleFilter === "admin" && member.type === "admin") ||
        (roleFilter === "creative" && member.skills.some(skill => 
          ["Photoshop", "Photomontage", "After Effects", "Animation", "Design graphique"].includes(skill))) ||
        (roleFilter === "marketing" && member.skills.some(skill => 
          ["Social Media", "Ads", "Community", "Stratégie"].includes(skill))) ||
        (roleFilter === "production" && member.skills.some(skill => 
          ["Coordination", "Planning", "Production"].includes(skill)));

      const matchesStatus = !statusFilter || member.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [searchTerm, roleFilter, statusFilter]);

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingMember(null);
    setIsEditModalOpen(false);
  };

  const handleAddMember = (formData: any) => {
    console.log("Ajout membre:", formData);
    toast({
      title: "Membre ajouté",
      description: `${formData.name} a été ajouté avec succès à l'équipe.`,
    });
    setIsAddModalOpen(false);
  };

  const handleEditMember = (formData: any) => {
    console.log("Modification membre:", formData);
    toast({
      title: "Membre modifié",
      description: `Le profil a été mis à jour avec succès.`,
    });
    closeEditModal();
  };

  return (
    <div className="flex h-screen bg-[var(--jofe-white)]">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-[var(--jofe-white)] border-b border-[var(--jofe-gray)] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-2xl font-bold text-[var(--jofe-blue-deep)]" 
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Gestion des Profils Utilisateurs
              </h1>
              <p className="text-gray-600 mt-1">
                Gérez les membres de votre équipe JoFé+ et leurs permissions
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-[var(--jofe-blue-light)] hover:bg-[var(--jofe-blue-medium)] text-[var(--jofe-white)] px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 hover:transform hover:-translate-y-0.5"
                data-testid="button-add-member"
              >
                <Plus className="w-4 h-4" />
                Ajouter Membre
              </button>
              
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <ExternalLink className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-[var(--jofe-white)] border border-[var(--jofe-gray)] rounded-xl p-5 text-center hover:shadow-lg hover:transform hover:-translate-y-0.5 transition-all duration-300">
              <div className="text-3xl font-bold text-[var(--jofe-blue-deep)] mb-1">
                {stats.total}
              </div>
              <div className="text-[var(--jofe-blue-medium)] text-sm">
                Membres Actifs
              </div>
            </div>
            
            <div className="bg-[var(--jofe-white)] border border-[var(--jofe-gray)] rounded-xl p-5 text-center hover:shadow-lg hover:transform hover:-translate-y-0.5 transition-all duration-300">
              <div className="text-3xl font-bold text-[var(--jofe-blue-deep)] mb-1">
                {stats.admins}
              </div>
              <div className="text-[var(--jofe-blue-medium)] text-sm">
                Administrateurs
              </div>
            </div>
            
            <div className="bg-[var(--jofe-white)] border border-[var(--jofe-gray)] rounded-xl p-5 text-center hover:shadow-lg hover:transform hover:-translate-y-0.5 transition-all duration-300">
              <div className="text-3xl font-bold text-[var(--jofe-blue-deep)] mb-1">
                {stats.members}
              </div>
              <div className="text-[var(--jofe-blue-medium)] text-sm">
                Membres Équipe
              </div>
            </div>
            
            <div className="bg-[var(--jofe-white)] border border-[var(--jofe-gray)] rounded-xl p-5 text-center hover:shadow-lg hover:transform hover:-translate-y-0.5 transition-all duration-300">
              <div className="text-3xl font-bold text-[var(--jofe-blue-deep)] mb-1">
                {stats.activeRate}%
              </div>
              <div className="text-[var(--jofe-blue-medium)] text-sm">
                Taux Présence
              </div>
            </div>
          </div>

          {/* Recherche et Filtres */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--jofe-blue-medium)] w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un membre..."
                className="w-full pl-10 pr-4 py-2 border border-[var(--jofe-gray)] rounded-lg focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10 transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-members"
              />
            </div>
            
            <select
              className="border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)] w-48"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              data-testid="select-role-filter"
            >
              <option value="">Tous les rôles</option>
              <option value="admin">Administrateurs</option>
              <option value="creative">Créatifs</option>
              <option value="marketing">Marketing</option>
              <option value="production">Production</option>
            </select>
            
            <select
              className="border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)] w-48"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              data-testid="select-status-filter"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="vacation">En congé</option>
            </select>
          </div>

          {/* Grille des Membres */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="bg-[var(--jofe-white)] border border-[var(--jofe-gray)] rounded-xl p-6 hover:shadow-lg hover:transform hover:-translate-y-1 transition-all duration-300"
                data-testid={`card-member-${member.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-[var(--jofe-white)] font-semibold text-lg"
                      style={{
                        background: "linear-gradient(135deg, var(--jofe-blue-light), var(--jofe-blue-medium))"
                      }}
                    >
                      {member.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {member.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <span 
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      member.type === "admin" 
                        ? "bg-[var(--jofe-blue-deep)] text-[var(--jofe-white)]"
                        : "bg-[var(--jofe-green)] text-[var(--jofe-white)]"
                    }`}
                  >
                    {member.type === "admin" ? "ADMIN" : "MEMBRE"}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {member.rate.toLocaleString()} FCFA/h
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {member.status === "active" && "En ligne"}
                    {member.status === "vacation" && "En congé"}
                    {member.status === "inactive" && "Hors ligne"}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {member.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: "rgba(55, 182, 233, 0.1)",
                          color: "var(--jofe-blue-medium)"
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                    {member.skills.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{member.skills.length - 3} autres
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => openEditModal(member)}
                  className="w-full bg-[var(--jofe-blue-light)] hover:bg-[var(--jofe-blue-medium)] text-[var(--jofe-white)] py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-all duration-300 hover:transform hover:-translate-y-0.5"
                  data-testid={`button-edit-${member.id}`}
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
              </div>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                Aucun membre trouvé pour ces critères
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal Ajout (placeholder) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--jofe-white)] rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--jofe-blue-deep)]">
                Ajouter un Membre
              </h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Fonctionnalité d'ajout à implémenter.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 bg-[var(--jofe-gray)] text-[var(--jofe-blue-deep)] py-2 px-4 rounded-lg"
              >
                Annuler
              </button>
              <button 
                onClick={() => handleAddMember({})}
                className="flex-1 bg-[var(--jofe-blue-light)] text-[var(--jofe-white)] py-2 px-4 rounded-lg"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modification (placeholder) */}
      {isEditModalOpen && editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--jofe-white)] rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--jofe-blue-deep)]">
                Modifier {editingMember.name}
              </h2>
              <button 
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Fonctionnalité de modification à implémenter.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={closeEditModal}
                className="flex-1 bg-[var(--jofe-gray)] text-[var(--jofe-blue-deep)] py-2 px-4 rounded-lg"
              >
                Annuler
              </button>
              <button 
                onClick={() => handleEditMember({})}
                className="flex-1 bg-[var(--jofe-blue-light)] text-[var(--jofe-white)] py-2 px-4 rounded-lg"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}