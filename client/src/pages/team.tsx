import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import TopNavBar from "@/components/TopNavBar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Search,
  Plus,
  Edit,
  DollarSign,
  CheckCircle,
  X,
  ExternalLink,
  Loader2,
  RefreshCw
} from "lucide-react";

// Types
interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  hourlyRate: number;
  status: string;
  isAdmin: boolean;
  skills: string[];
  avatar: string;
  department?: string;
}

export default function Team() {
  const { user } = useAuth();
  const { toast } = useToast();

  // État pour les données chargées depuis MySQL
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    hourlyRate: "5000",
    isAdmin: false,
    skills: "",
    department: "",
    username: "",
    password: "",
  });

  // Charger les membres depuis MySQL
  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Utiliser fetch directement pour éviter les erreurs lancées par apiRequest
      const response = await fetch("/api/users", { credentials: "include" });

      // Vérifier si une erreur 401 (non authentifié)
      if (response.status === 401) {
        setError("Session expirée. Veuillez vous reconnecter.");
        toast({
          title: "Session expirée",
          description: "Veuillez vous reconnecter pour accéder aux données",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Transformer les données pour correspondre à l'interface
        const members = (data.data || []).map((m: any) => ({
          ...m,
          hourlyRate: parseInt(m.hourlyRate) || 0,
          skills: Array.isArray(m.skills) ? m.skills :
                  typeof m.skills === 'string' ? JSON.parse(m.skills || '[]') : [],
        }));
        setTeamMembers(members);
      } else {
        setError(data.message || "Erreur lors du chargement");
      }
    } catch (err: any) {
      console.error("Erreur chargement équipe:", err);
      setError("Impossible de charger l'équipe depuis la base de données");
      toast({
        title: "Erreur",
        description: "Impossible de charger l'équipe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Statistiques calculées
  const stats = useMemo(() => {
    const total = teamMembers.length;
    const admins = teamMembers.filter(m => m.isAdmin).length;
    const members = teamMembers.filter(m => !m.isAdmin).length;
    const activeRate = total > 0
      ? Math.round((teamMembers.filter(m => m.status === "online").length / total) * 100)
      : 0;

    return { total, admins, members, activeRate };
  }, [teamMembers]);

  // Filtrage des membres
  const filteredMembers = useMemo(() => {
    return teamMembers.filter(member => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.email || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = !roleFilter ||
        (roleFilter === "admin" && member.isAdmin) ||
        (roleFilter === "creative" && member.department === "Création") ||
        (roleFilter === "marketing" && member.department === "Communication") ||
        (roleFilter === "production" && member.department === "Production");

      const matchesStatus = !statusFilter ||
        (statusFilter === "active" && member.status === "online") ||
        (statusFilter === "inactive" && member.status === "offline") ||
        (statusFilter === "vacation" && member.status === "away");

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [teamMembers, searchTerm, roleFilter, statusFilter]);

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      email: member.email || "",
      hourlyRate: String(member.hourlyRate || 5000),
      isAdmin: member.isAdmin,
      skills: Array.isArray(member.skills) ? member.skills.join(", ") : "",
      department: member.department || "",
      username: "",
      password: "",
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingMember(null);
    setIsEditModalOpen(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      email: "",
      hourlyRate: "5000",
      isAdmin: false,
      skills: "",
      department: "",
      username: "",
      password: "",
    });
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.role || !formData.username || !formData.password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await apiRequest("POST", "/api/users", {
        name: formData.name,
        role: formData.role,
        email: formData.email || null,
        hourlyRate: formData.hourlyRate,
        isAdmin: formData.isAdmin,
        skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
        department: formData.department || null,
        username: formData.username,
        password: formData.password,
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Membre ajouté",
          description: `${formData.name} a été ajouté avec succès à l'équipe.`,
        });
        setIsAddModalOpen(false);
        resetForm();
        loadTeamMembers();
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Impossible d'ajouter le membre",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout du membre",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingMember) return;

    setSaving(true);
    try {
      const response = await apiRequest("PUT", `/api/users/${editingMember.id}`, {
        name: formData.name,
        role: formData.role,
        email: formData.email || null,
        hourlyRate: formData.hourlyRate,
        isAdmin: formData.isAdmin,
        skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
        department: formData.department || null,
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Membre modifié",
          description: `Le profil a été mis à jour avec succès.`,
        });
        closeEditModal();
        loadTeamMembers();
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Impossible de modifier le membre",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la modification",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--jofe-white)]">
        <TopNavBar />
        <div className="lg:ml-72 flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#37B6E9] mx-auto mb-4" />
            <p className="text-gray-600">Chargement de l'équipe depuis MySQL...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--jofe-white)]">
      <TopNavBar />
      <div className="lg:ml-72">

        <div className="w-full overflow-auto">
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
                {teamMembers.length} membres en base de données MySQL
              </p>
            </div>

            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              <button
                onClick={loadTeamMembers}
                disabled={loading}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Rafraîchir"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(true);
                }}
                className="bg-[var(--jofe-blue-light)] hover:bg-[var(--jofe-blue-medium)] text-[var(--jofe-white)] px-3 py-2 md:px-4 md:py-2 rounded-lg flex items-center gap-2 transition-all duration-300 hover:transform hover:-translate-y-0.5 text-sm"
                data-testid="button-add-member"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Ajouter Membre</span>
                <span className="sm:hidden">Ajouter</span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p>{error}</p>
              <button onClick={loadTeamMembers} className="underline mt-2">Réessayer</button>
            </div>
          )}

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="bg-[var(--jofe-white)] border border-[var(--jofe-gray)] rounded-xl p-4 md:p-5 text-center hover:shadow-lg hover:transform hover:-translate-y-0.5 transition-all duration-300">
              <div className="text-2xl md:text-3xl font-bold text-[var(--jofe-blue-deep)] mb-1">
                {stats.total}
              </div>
              <div className="text-[var(--jofe-blue-medium)] text-xs md:text-sm">
                Total Membres
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
                {stats.activeRate}%
              </div>
              <div className="text-[var(--jofe-blue-medium)] text-xs md:text-sm">
                En ligne
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
              <option value="creative">Création</option>
              <option value="marketing">Communication</option>
              <option value="production">Production</option>
            </select>

            <select
              className="border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)] w-full md:w-48 text-sm md:text-base"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              data-testid="select-status-filter"
            >
              <option value="">Tous les statuts</option>
              <option value="active">En ligne</option>
              <option value="inactive">Hors ligne</option>
              <option value="vacation">Absent</option>
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
                      {member.avatar || member.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
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
                      member.isAdmin
                        ? "bg-[var(--jofe-blue-deep)] text-[var(--jofe-white)]"
                        : "bg-[var(--jofe-green)] text-[var(--jofe-white)]"
                    }`}
                  >
                    {member.isAdmin ? "ADMIN" : "MEMBRE"}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center text-xs md:text-sm text-gray-600 mb-2">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                    <span className="truncate">{(member.hourlyRate || 0).toLocaleString()} FCFA/h</span>
                  </div>
                  <div className="flex items-center text-xs md:text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>
                      {member.status === "online" && "En ligne"}
                      {member.status === "away" && "Absent"}
                      {member.status === "busy" && "Occupé"}
                      {member.status === "offline" && "Hors ligne"}
                    </span>
                  </div>
                  {member.department && (
                    <div className="flex items-center text-xs md:text-sm text-gray-600 mt-2">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                      <span>{member.department}</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(member.skills) ? member.skills : []).map((skill, index) => (
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
                Aucun membre trouvé dans la base de données
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

            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10"
                    placeholder="Ex: Paul OUEDRAOGO"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom d'utilisateur *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase()})}
                    className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10"
                    placeholder="Ex: paul.ouedraogo"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10"
                    placeholder="Min. 6 caractères"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Poste/Rôle *</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
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
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10"
                    placeholder="prenom.nom@jofedigital.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tarif horaire (FCFA)</label>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                    className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10"
                    placeholder="8000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Département</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)]"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Direction">Direction</option>
                    <option value="Création">Création</option>
                    <option value="Communication">Communication</option>
                    <option value="Production">Production</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type d'accès</label>
                  <select
                    value={formData.isAdmin ? "admin" : "member"}
                    onChange={(e) => setFormData({...formData, isAdmin: e.target.value === "admin"})}
                    className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)]"
                  >
                    <option value="member">Membre standard</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Compétences</label>
                <textarea
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
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
                  disabled={saving}
                  className="bg-[var(--jofe-blue-light)] text-[var(--jofe-white)] py-2 px-4 rounded-lg hover:bg-[var(--jofe-blue-medium)] transition-colors flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
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

            <form onSubmit={handleEditMember} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Poste/Rôle</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
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
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tarif horaire (FCFA)</label>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                    className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)] focus:ring-3 focus:ring-[var(--jofe-blue-light)]/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Département</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)]"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Direction">Direction</option>
                    <option value="Création">Création</option>
                    <option value="Communication">Communication</option>
                    <option value="Production">Production</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type d'accès</label>
                  <select
                    value={formData.isAdmin ? "admin" : "member"}
                    onChange={(e) => setFormData({...formData, isAdmin: e.target.value === "admin"})}
                    className="w-full border border-[var(--jofe-gray)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--jofe-blue-light)]"
                  >
                    <option value="member">Membre standard</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Compétences</label>
                <textarea
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
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
                  disabled={saving}
                  className="bg-[var(--jofe-blue-light)] text-[var(--jofe-white)] py-2 px-4 rounded-lg hover:bg-[var(--jofe-blue-medium)] transition-colors flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
