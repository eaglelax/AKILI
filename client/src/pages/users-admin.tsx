import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import TopNavBar from "@/components/TopNavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Key,
  Shield,
  Search,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  username: string;
  role: string;
  department: string;
  email: string;
  phone?: string;
  avatar: string;
  isAdmin: boolean;
  status: string;
  hourlyRate: string;
  skills: string[];
}

interface Permissions {
  canViewAllTasks: boolean;
  canEditAllTasks: boolean;
  canDeleteTasks: boolean;
  canViewAllProjects: boolean;
  canEditAllProjects: boolean;
  canManageClients: boolean;
  canManageTeam: boolean;
  canViewAnalytics: boolean;
  canManagePermissions: boolean;
  canExportData: boolean;
  dailyHourLimit: number;
  maxOvertimeHours: number;
}

const departments = [
  "Direction",
  "Création",
  "Communication",
  "Production",
  "Marketing",
];

const defaultPermissions: Permissions = {
  canViewAllTasks: false,
  canEditAllTasks: false,
  canDeleteTasks: false,
  canViewAllProjects: false,
  canEditAllProjects: false,
  canManageClients: false,
  canManageTeam: false,
  canViewAnalytics: false,
  canManagePermissions: false,
  canExportData: false,
  dailyHourLimit: 8,
  maxOvertimeHours: 4,
};

export default function UsersAdmin() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  // State pour les données chargées depuis MySQL
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "",
    department: "",
    email: "",
    phone: "",
    hourlyRate: "5000",
    isAdmin: false,
  });

  const [newPassword, setNewPassword] = useState("");
  const [permissions, setPermissions] = useState<Permissions>(defaultPermissions);

  // Charger les utilisateurs depuis MySQL
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest("GET", "/api/users");
      const data = await response.json();

      if (data.success) {
        setUsers(data.data || []);
      } else {
        setError(data.message || "Erreur lors du chargement");
      }
    } catch (err: any) {
      console.error("Erreur chargement utilisateurs:", err);
      setError("Impossible de charger les utilisateurs depuis la base de données");
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: "",
      username: "",
      password: "",
      role: "",
      department: "",
      email: "",
      phone: "",
      hourlyRate: "5000",
      isAdmin: false,
    });
    setShowPassword(false);
  };

  // Créer un utilisateur via API
  const handleCreate = async () => {
    if (!formData.name || !formData.username || !formData.password || !formData.role) {
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
        username: formData.username,
        password: formData.password,
        role: formData.role,
        department: formData.department || null,
        email: formData.email || null,
        phone: formData.phone || null,
        hourlyRate: formData.hourlyRate,
        isAdmin: formData.isAdmin,
      });

      const data = await response.json();

      if (data.success) {
        toast({ title: "Utilisateur créé avec succès" });
        setShowCreateDialog(false);
        resetForm();
        loadUsers();
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Impossible de créer l'utilisateur",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de l'utilisateur",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Modifier un utilisateur
  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      username: member.username,
      password: "",
      role: member.role,
      department: member.department || "",
      email: member.email || "",
      phone: member.phone || "",
      hourlyRate: member.hourlyRate || "5000",
      isAdmin: member.isAdmin,
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!selectedMember) return;

    setSaving(true);
    try {
      const response = await apiRequest("PUT", `/api/users/${selectedMember.id}`, {
        name: formData.name,
        username: formData.username,
        role: formData.role,
        department: formData.department || null,
        email: formData.email || null,
        phone: formData.phone || null,
        hourlyRate: formData.hourlyRate,
        isAdmin: formData.isAdmin,
      });

      const data = await response.json();

      if (data.success) {
        toast({ title: "Utilisateur mis à jour" });
        setShowEditDialog(false);
        setSelectedMember(null);
        loadUsers();
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Impossible de mettre à jour",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Supprimer un utilisateur
  const handleDelete = (member: TeamMember) => {
    setSelectedMember(member);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedMember) return;

    setSaving(true);
    try {
      const response = await apiRequest("DELETE", `/api/users/${selectedMember.id}`);
      const data = await response.json();

      if (data.success) {
        toast({ title: "Utilisateur supprimé" });
        setShowDeleteDialog(false);
        setSelectedMember(null);
        loadUsers();
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Impossible de supprimer",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Réinitialiser mot de passe
  const handleResetPassword = (member: TeamMember) => {
    setSelectedMember(member);
    setNewPassword("");
    setShowResetPasswordDialog(true);
  };

  const confirmResetPassword = async () => {
    if (!selectedMember || newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await apiRequest("PUT", `/api/users/${selectedMember.id}/reset-password`, {
        newPassword: newPassword,
      });

      const data = await response.json();

      if (data.success) {
        toast({ title: `Mot de passe de ${selectedMember.name} réinitialisé` });
        setShowResetPasswordDialog(false);
        setNewPassword("");
        setSelectedMember(null);
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Impossible de réinitialiser le mot de passe",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la réinitialisation",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Gérer les permissions
  const handlePermissions = async (member: TeamMember) => {
    setSelectedMember(member);

    // Charger les permissions depuis l'API
    try {
      const response = await apiRequest("GET", `/api/users/${member.id}/permissions`);
      const data = await response.json();

      if (data.success && data.data) {
        setPermissions({
          canViewAllTasks: data.data.canViewAllTasks || false,
          canEditAllTasks: data.data.canEditAllTasks || false,
          canDeleteTasks: data.data.canDeleteTasks || false,
          canViewAllProjects: data.data.canViewAllProjects || false,
          canEditAllProjects: data.data.canEditAllProjects || false,
          canManageClients: data.data.canManageClients || false,
          canManageTeam: data.data.canManageTeam || false,
          canViewAnalytics: data.data.canViewAnalytics || false,
          canManagePermissions: data.data.canManagePermissions || false,
          canExportData: data.data.canExportData || false,
          dailyHourLimit: data.data.dailyHourLimit || 8,
          maxOvertimeHours: data.data.maxOvertimeHours || 4,
        });
      } else {
        // Permissions par défaut basées sur le statut admin
        if (member.isAdmin) {
          setPermissions({
            canViewAllTasks: true,
            canEditAllTasks: true,
            canDeleteTasks: true,
            canViewAllProjects: true,
            canEditAllProjects: true,
            canManageClients: true,
            canManageTeam: true,
            canViewAnalytics: true,
            canManagePermissions: true,
            canExportData: true,
            dailyHourLimit: 8,
            maxOvertimeHours: 4,
          });
        } else {
          setPermissions(defaultPermissions);
        }
      }
    } catch (err) {
      console.error("Erreur chargement permissions:", err);
      setPermissions(member.isAdmin ? {
        canViewAllTasks: true,
        canEditAllTasks: true,
        canDeleteTasks: true,
        canViewAllProjects: true,
        canEditAllProjects: true,
        canManageClients: true,
        canManageTeam: true,
        canViewAnalytics: true,
        canManagePermissions: true,
        canExportData: true,
        dailyHourLimit: 8,
        maxOvertimeHours: 4,
      } : defaultPermissions);
    }

    setShowPermissionsDialog(true);
  };

  const savePermissions = async () => {
    if (!selectedMember) return;

    setSaving(true);
    try {
      const response = await apiRequest("PUT", `/api/users/${selectedMember.id}/permissions`, permissions);
      const data = await response.json();

      if (data.success) {
        toast({ title: `Permissions de ${selectedMember.name} mises à jour` });
        setShowPermissionsDialog(false);
        setSelectedMember(null);
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Impossible de sauvegarder les permissions",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde des permissions",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavBar />
        <div className="lg:ml-72 p-6">
          <Card className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">Accès refusé</h2>
            <p className="text-gray-500 mt-2">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavBar />
        <div className="lg:ml-72 flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#37B6E9] mx-auto mb-4" />
            <p className="text-gray-600">Chargement des utilisateurs depuis MySQL...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavBar />

      <div className="lg:ml-72 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-7 h-7 text-[#3475BB]" />
              Gestion des Utilisateurs
            </h1>
            <p className="text-gray-500 mt-1">
              {users.length} utilisateur{users.length > 1 ? "s" : ""} en base de données MySQL
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={loadUsers}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Rafraîchir
            </Button>
            <Button
              onClick={() => {
                resetForm();
                setShowCreateDialog(true);
              }}
              className="bg-[#3475BB] hover:bg-[#2a5d94]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvel utilisateur
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p>{error}</p>
            <button onClick={loadUsers} className="underline mt-2">Réessayer</button>
          </div>
        )}

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Rechercher par nom, username ou rôle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? "s" : ""} trouvé{filteredUsers.length > 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Utilisateur</TableHead>
                  <TableHead className="min-w-[120px]">Username</TableHead>
                  <TableHead className="min-w-[180px]">Rôle</TableHead>
                  <TableHead className="min-w-[120px]">Département</TableHead>
                  <TableHead className="min-w-[80px]">Type</TableHead>
                  <TableHead className="min-w-[100px]">Statut</TableHead>
                  <TableHead className="text-right min-w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3475BB] to-[#37B6E9] flex items-center justify-center text-white font-medium">
                          {member.avatar || member.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          {member.email && (
                            <p className="text-sm text-gray-500">{member.email}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{member.username}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>{member.department || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={member.isAdmin ? "default" : "secondary"}>
                        {member.isAdmin ? "Admin" : "Membre"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          member.status === "online"
                            ? "border-green-500 text-green-600"
                            : "border-gray-300 text-gray-500"
                        }
                      >
                        {member.status === "online" ? "En ligne" : "Hors ligne"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(member)}
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResetPassword(member)}
                          title="Réinitialiser le mot de passe"
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePermissions(member)}
                          title="Permissions"
                        >
                          <Shield className="w-4 h-4" />
                        </Button>
                        {member.username !== user?.username && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(member)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Aucun utilisateur trouvé dans la base de données
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvel utilisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom complet *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Jean DUPONT"
              />
            </div>
            <div className="space-y-2">
              <Label>Nom d'utilisateur *</Label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                placeholder="Ex: jean.dupont"
              />
            </div>
            <div className="space-y-2">
              <Label>Mot de passe *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min. 6 caractères"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Rôle *</Label>
              <Input
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Ex: Graphiste, Community Manager..."
              />
            </div>
            <div className="space-y-2">
              <Label>Département</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemple.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Taux horaire (FCFA)</Label>
              <Input
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Administrateur</Label>
              <Switch
                checked={formData.isAdmin}
                onCheckedChange={(checked) => setFormData({ ...formData, isAdmin: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} className="bg-[#3475BB]" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom complet *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nom d'utilisateur *</Label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
              />
            </div>
            <div className="space-y-2">
              <Label>Rôle *</Label>
              <Input
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Département</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Taux horaire (FCFA)</Label>
              <Input
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Administrateur</Label>
              <Switch
                checked={formData.isAdmin}
                onCheckedChange={(checked) => setFormData({ ...formData, isAdmin: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdate} className="bg-[#3475BB]" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
            <strong>{selectedMember?.name}</strong> ? Cette action est irréversible et supprimera
            également toutes les données associées dans la base de données.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-gray-600">
              Définir un nouveau mot de passe pour <strong>{selectedMember?.name}</strong>
            </p>
            <div className="space-y-2">
              <Label>Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 caractères"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetPasswordDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={confirmResetPassword}
              disabled={newPassword.length < 6 || saving}
              className="bg-[#3475BB]"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Réinitialiser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Permissions de {selectedMember?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Voir toutes les tâches</Label>
                  <p className="text-xs text-gray-500">Accès à toutes les tâches de l'équipe</p>
                </div>
                <Switch
                  checked={permissions.canViewAllTasks}
                  onCheckedChange={(checked) =>
                    setPermissions({ ...permissions, canViewAllTasks: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Modifier toutes les tâches</Label>
                  <p className="text-xs text-gray-500">Peut éditer les tâches des autres</p>
                </div>
                <Switch
                  checked={permissions.canEditAllTasks}
                  onCheckedChange={(checked) =>
                    setPermissions({ ...permissions, canEditAllTasks: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Supprimer des tâches</Label>
                  <p className="text-xs text-gray-500">Peut supprimer des tâches</p>
                </div>
                <Switch
                  checked={permissions.canDeleteTasks}
                  onCheckedChange={(checked) =>
                    setPermissions({ ...permissions, canDeleteTasks: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Voir tous les projets</Label>
                  <p className="text-xs text-gray-500">Accès à tous les projets</p>
                </div>
                <Switch
                  checked={permissions.canViewAllProjects}
                  onCheckedChange={(checked) =>
                    setPermissions({ ...permissions, canViewAllProjects: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Modifier tous les projets</Label>
                  <p className="text-xs text-gray-500">Peut éditer tous les projets</p>
                </div>
                <Switch
                  checked={permissions.canEditAllProjects}
                  onCheckedChange={(checked) =>
                    setPermissions({ ...permissions, canEditAllProjects: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Gérer les clients</Label>
                  <p className="text-xs text-gray-500">Créer, modifier, supprimer des clients</p>
                </div>
                <Switch
                  checked={permissions.canManageClients}
                  onCheckedChange={(checked) =>
                    setPermissions({ ...permissions, canManageClients: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Gérer l'équipe</Label>
                  <p className="text-xs text-gray-500">Accès à la gestion de l'équipe</p>
                </div>
                <Switch
                  checked={permissions.canManageTeam}
                  onCheckedChange={(checked) =>
                    setPermissions({ ...permissions, canManageTeam: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Voir les analytics</Label>
                  <p className="text-xs text-gray-500">Accès aux statistiques et rapports</p>
                </div>
                <Switch
                  checked={permissions.canViewAnalytics}
                  onCheckedChange={(checked) =>
                    setPermissions({ ...permissions, canViewAnalytics: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Gérer les permissions</Label>
                  <p className="text-xs text-gray-500">Modifier les droits des autres</p>
                </div>
                <Switch
                  checked={permissions.canManagePermissions}
                  onCheckedChange={(checked) =>
                    setPermissions({ ...permissions, canManagePermissions: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Exporter les données</Label>
                  <p className="text-xs text-gray-500">Peut exporter en PDF/Excel</p>
                </div>
                <Switch
                  checked={permissions.canExportData}
                  onCheckedChange={(checked) =>
                    setPermissions({ ...permissions, canExportData: checked })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Limite d'heures quotidiennes</Label>
                <Input
                  type="number"
                  min={1}
                  max={24}
                  value={permissions.dailyHourLimit}
                  onChange={(e) =>
                    setPermissions({ ...permissions, dailyHourLimit: parseInt(e.target.value) || 8 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Heures supplémentaires max</Label>
                <Input
                  type="number"
                  min={0}
                  max={12}
                  value={permissions.maxOvertimeHours}
                  onChange={(e) =>
                    setPermissions({ ...permissions, maxOvertimeHours: parseInt(e.target.value) || 4 })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermissionsDialog(false)}>
              Annuler
            </Button>
            <Button onClick={savePermissions} className="bg-[#3475BB]" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
