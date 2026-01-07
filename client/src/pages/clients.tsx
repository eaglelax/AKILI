import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import TopNavBar from "@/components/TopNavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building2, Plus, Trash2, Edit, Mail, Phone, MapPin, DollarSign, User } from "lucide-react";

type Client = {
  id: string;
  name: string;
  industry?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  monthlyBudget?: string;
  notes?: string;
};

type ClientFormData = {
  name: string;
  industry: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  monthlyBudget: string;
  notes: string;
};

export default function Clients() {
  const { user, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<ClientFormData>({
    name: "",
    industry: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    monthlyBudget: "",
    notes: "",
  });

  // Fetch clients
  const { data: clientsResponse, isLoading: isLoadingClients } = useQuery<{
    success: boolean;
    data: Client[];
    pagination?: any;
  }>({
    queryKey: ["/api/clients"],
  });

  const clients = clientsResponse?.data || [];

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erreur lors de la création");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Client créé",
        description: "Le client a été créé avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ClientFormData }) => {
      const response = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erreur lors de la modification");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsEditDialogOpen(false);
      setEditingClient(null);
      resetForm();
      toast({
        title: "Client modifié",
        description: "Le client a été modifié avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur lors de la suppression");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setDeleteClientId(null);
      toast({
        title: "Client supprimé",
        description: "Le client a été supprimé avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      industry: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      monthlyBudget: "",
      notes: "",
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du client est requis",
        variant: "destructive",
      });
      return;
    }
    createClientMutation.mutate(formData);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || "",
      industry: client.industry || "",
      contactName: client.contactName || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      monthlyBudget: client.monthlyBudget || "",
      notes: client.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    if (!formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du client est requis",
        variant: "destructive",
      });
      return;
    }
    updateClientMutation.mutate({ id: editingClient.id, data: formData });
  };

  const handleDelete = (id: string) => {
    deleteClientMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavBar />

      <div className="lg:ml-72 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#162C54] flex items-center gap-3">
                <Building2 className="w-8 h-8 text-[#37B6E9]" />
                Gestion des Clients
              </h1>
              <p className="text-gray-600 mt-2">
                {isAdmin ? "Gérez tous les clients de l'agence" : "Liste des clients"}
              </p>
            </div>

            {isAdmin && (
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-[#3475BB] to-[#37B6E9] text-white hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Client
              </Button>
            )}
          </div>
        </div>

        {/* Clients Grid */}
        {isLoadingClients ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-[#3475BB] border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients?.map((client) => (
              <Card key={client.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#3475BB] to-[#37B6E9] flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-[#162C54]">
                          {client.name}
                        </CardTitle>
                        {client.industry && (
                          <p className="text-sm text-gray-500">{client.industry}</p>
                        )}
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(client)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteClientId(client.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  {client.contactName && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4 text-[#3475BB]" />
                      <span>{client.contactName}</span>
                    </div>
                  )}

                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-[#3475BB]" />
                      <span>{client.email}</span>
                    </div>
                  )}

                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-[#3475BB]" />
                      <span>{client.phone}</span>
                    </div>
                  )}

                  {client.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-[#3475BB]" />
                      <span className="line-clamp-1">{client.address}</span>
                    </div>
                  )}

                  {client.monthlyBudget && parseFloat(client.monthlyBudget) > 0 && (
                    <div className="flex items-center gap-2 text-sm font-medium text-green-600 mt-3 pt-3 border-t">
                      <DollarSign className="w-4 h-4" />
                      <span>{parseFloat(client.monthlyBudget).toLocaleString('fr-FR')} FCFA/mois</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoadingClients && clients?.length === 0 && (
          <Card className="p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun client pour le moment</p>
            {isAdmin && (
              <p className="text-gray-400 text-sm mt-2">
                Cliquez sur "Nouveau Client" pour ajouter votre premier client
              </p>
            )}
          </Card>
        )}
      </div>

      {/* Create Client Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau Client</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau client à votre portefeuille
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Nom du client *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Entreprise ABC"
                  required
                />
              </div>

              <div>
                <Label htmlFor="industry">Secteur d'activité</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="Ex: Technologie"
                />
              </div>

              <div>
                <Label htmlFor="contactName">Contact principal</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="Ex: Jean Dupont"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@entreprise.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+226 XX XX XX XX"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Adresse complète"
                />
              </div>

              <div>
                <Label htmlFor="monthlyBudget">Budget mensuel (FCFA)</Label>
                <Input
                  id="monthlyBudget"
                  type="number"
                  value={formData.monthlyBudget}
                  onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informations supplémentaires..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createClientMutation.isPending}
                className="bg-gradient-to-r from-[#3475BB] to-[#37B6E9] text-white"
              >
                {createClientMutation.isPending ? "Création..." : "Créer le client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le Client</DialogTitle>
            <DialogDescription>
              Modifiez les informations du client
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="edit-name">Nom du client *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Entreprise ABC"
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-industry">Secteur d'activité</Label>
                <Input
                  id="edit-industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="Ex: Technologie"
                />
              </div>

              <div>
                <Label htmlFor="edit-contactName">Contact principal</Label>
                <Input
                  id="edit-contactName"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="Ex: Jean Dupont"
                />
              </div>

              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@entreprise.com"
                />
              </div>

              <div>
                <Label htmlFor="edit-phone">Téléphone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+226 XX XX XX XX"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="edit-address">Adresse</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Adresse complète"
                />
              </div>

              <div>
                <Label htmlFor="edit-monthlyBudget">Budget mensuel (FCFA)</Label>
                <Input
                  id="edit-monthlyBudget"
                  type="number"
                  value={formData.monthlyBudget}
                  onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informations supplémentaires..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingClient(null);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={updateClientMutation.isPending}
                className="bg-gradient-to-r from-[#3475BB] to-[#37B6E9] text-white"
              >
                {updateClientMutation.isPending ? "Modification..." : "Modifier le client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteClientId} onOpenChange={() => setDeleteClientId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le client ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Le client et toutes ses données seront supprimés.
              {deleteClientId && (
                <span className="block mt-2 font-medium text-red-600">
                  Note: La suppression échouera si le client a des projets actifs.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteClientId(null)}
            >
              Annuler
            </Button>
            <Button
              onClick={() => deleteClientId && handleDelete(deleteClientId)}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteClientMutation.isPending}
            >
              {deleteClientMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
