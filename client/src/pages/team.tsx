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

// Données complètes des 14 membres du template HTML authentique
const TEAM_MEMBERS: TeamMember[] = [
  // Administrateurs (2)
  {
    id: "serge_assale",
    name: "Directeur Création",
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
  
  // Équipe Créative (6)
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
    id: "jean_sampabao",
    name: "Jean-Jacques SAMPABAO",
    role: "Directeur Artistique Junior",
    email: "jean.sampabao@jofeplus.bf",
    rate: 8500,
    status: "active",
    type: "member",
    skills: ["Direction artistique", "Concept", "Brand Design"],
    avatar: "JS"
  },
  {
    id: "latif_ouedraogo",
    name: "Abdoul Latif OUEDRAOGO",
    role: "Designer UI/UX",
    email: "latif.ouedraogo@jofeplus.bf",
    rate: 9500,
    status: "active",
    type: "member",
    skills: ["UI/UX", "Figma", "Prototypage"],
    avatar: "AO"
  },
  
  // Communication & Marketing (6)
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
    id: "djamilatou_guiguemde",
    name: "Djamilatou GUIGUEMDE",
    role: "Chef de Pub Stagiaire",
    email: "djamilatou.guiguemde@jofeplus.bf",
    rate: 5000,
    status: "active",
    type: "member",
    skills: ["Conception pub", "Recherche", "Analyse"],
    avatar: "DG"
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
    id: "maryse_bombiri",
    name: "Maryse BOMBIRI",
    role: "Community Manager",
    email: "maryse.bombiri@jofeplus.bf",
    rate: 6500,
    status: "active",
    type: "member",
    skills: ["Community", "Content", "Engagement"],
    avatar: "MB"
  },
  {
    id: "faridatou_barry",
    name: "Faridatou BARRY",
    role: "Chef de Pub/CM",
    email: "faridatou.barry@jofeplus.bf",
    rate: 7000,
    status: "active",
    type: "member",
    skills: ["Chef de Pub", "Community", "Stratégie"],
    avatar: "FB"
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
      
      <div className="flex-1 overflow-auto md:ml-64 ml-0">
        {/* Mobile Header Spacer */}
        <div className="h-16 md:hidden"></div>
        
        {/* Header */}
        <header className="bg-[var(--jofe-white)] border-b border-[var(--jofe-gray)] px-4 md:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="min-w-0 flex-1">
              <h1 
                className="text-xl md:text-2xl font-bold text-[var(--jofe-blue-deep)] truncate" 
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Gestion des Profils Utilisateurs
              </h1>
              <p className="text-sm md:text-base text-gray-600 hidden sm:block">
                Gérez les membres de votre équipe et leurs permissions
              </p>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-[var(--jofe-blue-light)] hover:bg-[var(--jofe-blue-medium)] text-[var(--jofe-white)] px-3 py-2 md:px-4 md:py-2 rounded-lg flex items-center gap-2 transition-all duration-300 hover:transform hover:-translate-y-0.5 text-sm"
                data-testid="button-add-member"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Ajouter Membre</span>
                <span className="sm:hidden">Ajouter</span>
              </button>
              
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <ExternalLink className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="bg-[var(--jofe-white)] border border-[var(--jofe-gray)] rounded-xl p-4 md:p-5 text-center hover:shadow-lg hover:transform hover:-translate-y-0.5 transition-all duration-300">
              <div className="text-2xl md:text-3xl font-bold text-[var(--jofe-blue-deep)] mb-1">
                {stats.total}
              </div>
              <div className="text-[var(--jofe-blue-medium)] text-xs md:text-sm">
                Membres Actifs
              </div>
            </div>
            
            <div className="bg-[var(--jofe-white)] border border-[var(--jofe-gray)] rounded-xl p-4 md:p-5 text-center hover:shadow-lg hover:transform hover:-translate-y-0.5 transition-all duration-300">
              <div className="text-2xl md:text-3xl font-bold text-[var(--jofe-blue-deep)] mb-1">
                {stats.admins}
              </div>
              <div className="text-[var(--jofe-blue-medium)] text-xs md:text-sm">
                Administrateurs
              </div>
            </div>
            
            <div className="bg-[var(--jofe-white)] border border-[var(--jofe-gray)] rounded-xl p-4 md:p-5 text-center hover:shadow-lg hover:transform hover:-translate-y-0.5 transition-all duration-300">
              <div className="text-2xl md:text-3xl font-bold text-[var(--jofe-blue-deep)] mb-1">
                {stats.members}
              </div>
              <div className="text-[var(--jofe-blue-medium)] text-xs md:text-sm">
                Membres Équipe
              </div>
            </div>
            
            <div className="bg-[var(--jofe-white)] border border-[var(--jofe-gray)] rounded-xl p-4 md:p-5 text-center hover:shadow-lg hover:transform hover:-translate-y-0.5 transition-all duration-300">
              <div className="text-2xl md:text-3xl font-bold text-[var(--jofe-blue-deep)] mb-1">
                92%
              </div>
              <div className="text-[var(--jofe-blue-medium)] text-xs md:text-sm">
                Taux Présence
              </div>
            </div>
          </div>

          {/* Recherche et Filtres */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--jofe-blue-medium)] w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un membre..."
                className="w-full pl-10 pr-4 py-2 border border-[var(--jofe-gray)] rounded-lg focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10 transition-all duration-300 text-sm md:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-members"
              />
            </div>
            
            <select
              className="border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)] w-full md:w-48 text-sm md:text-base"
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
              className="border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)] w-full md:w-48 text-sm md:text-base"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="bg-[var(--jofe-white)] border border-[var(--jofe-gray)] rounded-xl p-4 md:p-6 hover:shadow-lg hover:transform hover:-translate-y-1 transition-all duration-300"
                data-testid={`card-member-${member.id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div 
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-[var(--jofe-white)] font-semibold text-sm md:text-lg flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg, var(--jofe-blue-light), var(--jofe-blue-medium))"
                      }}
                    >
                      {member.avatar}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                        {member.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 truncate">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <span 
                    className={`px-2 py-1 rounded-xl text-xs font-medium flex-shrink-0 ${
                      member.type === "admin" 
                        ? "bg-[var(--jofe-blue-deep)] text-[var(--jofe-white)]"
                        : "bg-[var(--jofe-green)] text-[var(--jofe-white)]"
                    }`}
                  >
                    {member.type === "admin" ? "ADMIN" : "MEMBRE"}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center text-xs md:text-sm text-gray-600 mb-2">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                    <span className="truncate">{member.rate.toLocaleString()} FCFA/h</span>
                  </div>
                  <div className="flex items-center text-xs md:text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>
                      {member.status === "active" && "En ligne"}
                      {member.status === "vacation" && "En congé"}
                      {member.status === "inactive" && "Hors ligne"}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {member.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 rounded-2xl"
                        style={{
                          backgroundColor: "rgba(55, 182, 233, 0.1)",
                          color: "var(--jofe-blue-medium)"
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => openEditModal(member)}
                  className="w-full bg-[var(--jofe-blue-light)] hover:bg-[var(--jofe-blue-medium)] text-[var(--jofe-white)] py-2 px-4 rounded-lg text-xs md:text-sm font-medium flex items-center justify-center gap-1 transition-all duration-300 hover:transform hover:-translate-y-0.5"
                  data-testid={`button-edit-${member.id}`}
                >
                  <Edit className="w-3 h-3 md:w-4 md:h-4" />
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

      {/* Modal Ajout */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--jofe-white)] rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--jofe-blue-deep)]" style={{ fontFamily: "Inter, sans-serif" }}>
                Ajouter un Nouveau Membre
              </h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddMember({}); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                  <input
                    type="text"
                    className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10"
                    placeholder="Ex: Paul OUEDRAOGO"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Poste/Rôle</label>
                  <input
                    type="text"
                    className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10"
                    placeholder="Ex: Graphiste Photomonteur"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email professionnel</label>
                  <input
                    type="email"
                    className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10"
                    placeholder="prenom.nom@jofeplus.bf"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tarif horaire (FCFA)</label>
                  <input
                    type="number"
                    className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10"
                    placeholder="8000"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type d'accès</label>
                  <select className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)]">
                    <option value="member">Membre standard</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut initial</label>
                  <select className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)]">
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Compétences</label>
                <textarea
                  className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10"
                  rows={3}
                  placeholder="Séparez les compétences par des virgules"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-[var(--jofe-gray)] text-[var(--jofe-blue-deep)] py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="bg-[var(--jofe-blue-light)] text-[var(--jofe-white)] py-2 px-4 rounded-lg hover:bg-[var(--jofe-blue-medium)] transition-colors"
                >
                  Ajouter le Membre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modification */}
      {isEditModalOpen && editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--jofe-white)] rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--jofe-blue-deep)]" style={{ fontFamily: "Inter, sans-serif" }}>
                Modifier le Profil - {editingMember.name}
              </h2>
              <button 
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleEditMember({}); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                  <input
                    type="text"
                    defaultValue={editingMember.name}
                    className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Poste/Rôle</label>
                  <input
                    type="text"
                    defaultValue={editingMember.role}
                    className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email professionnel</label>
                  <input
                    type="email"
                    defaultValue={editingMember.email}
                    className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tarif horaire (FCFA)</label>
                  <input
                    type="number"
                    defaultValue={editingMember.rate}
                    className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type d'accès</label>
                  <select defaultValue={editingMember.type} className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)]">
                    <option value="member">Membre standard</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <select defaultValue={editingMember.status} className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)]">
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="vacation">En congé</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Compétences</label>
                <textarea
                  defaultValue={editingMember.skills.join(", ")}
                  className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10"
                  rows={3}
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={closeEditModal}
                  className="bg-[var(--jofe-gray)] text-[var(--jofe-blue-deep)] py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="bg-[var(--jofe-blue-light)] text-[var(--jofe-white)] py-2 px-4 rounded-lg hover:bg-[var(--jofe-blue-medium)] transition-colors"
                >
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