import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

const teamMembers = [
  { value: "serge_assale", label: "Serge ASSALÉ (Admin)" },
  { value: "enos_gouba", label: "Enos GOUBA (Admin)" },
  { value: "paul_ouedraogo", label: "Paul Junior OUEDRAOGO" },
  { value: "fortune_yanogo", label: "Fortune YANOGO" },
  { value: "bientama_pare", label: "Bientama PARÉ" },
  { value: "issa_cisse", label: "Issa CISSE" },
  { value: "florita_kabore", label: "Florita KABORÉ" },
  { value: "nebie_webou", label: "Nebié WEBOU" },
  { value: "djamilatou_guiguemde", label: "Djamilatou GUIGUEMDE" },
  { value: "jeanjacques_sampabao", label: "Jean-Jacques SAMPABAO" },
  { value: "abdoul_ouedraogo", label: "Abdoul Latif OUEDRAOGO" },
  { value: "linda_kabore", label: "Linda KABORÉ" },
  { value: "maryse_bombiri", label: "Maryse BOMBIRI" },
  { value: "faridatou_barry", label: "Faridatou BARRY" },
];

export default function Login() {
  const [selectedMember, setSelectedMember] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/team-login", { username, password });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Connexion réussie",
        description: `Bienvenue ${data.member.name}`,
      });
      window.location.href = "/dashboard";
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur de connexion",
        description: error.message || "Vérifiez vos identifiants",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMember) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner votre nom",
        variant: "destructive",
      });
      return;
    }
    
    if (!password) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre mot de passe",
        variant: "destructive",
      });
      return;
    }

    loginMutation.mutate({ username: selectedMember, password });
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 gradient-bg rounded-xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">J+</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Jo'Fé Digital</h1>
            <p className="text-muted-foreground">Système de Gestion d'Équipe</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="member-select" className="text-sm font-medium text-foreground">
                Sélectionner votre nom
              </Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger data-testid="select-member">
                  <SelectValue placeholder="Choisissez votre nom..." />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.value} value={member.value}>
                      {member.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Saisissez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
              />
              <p className="text-xs text-muted-foreground">
                Membres: jofe2024 | Admins: mot de passe différent
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loginMutation.isPending}
              data-testid="button-login"
            >
              {loginMutation.isPending ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
