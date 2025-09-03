import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, User, Lock, LogIn } from "lucide-react";

const adminMembers = [
  { value: "serge.assale", label: "Serge ASSALÉ - Directeur Création & Marketing" },
  { value: "enos.gouba", label: "Enos GOUBA - Coordinateur Production" },
];

const creativeTeam = [
  { value: "paul.ouedraogo", label: "Paul Junior OUEDRAOGO - Graphiste Photomonteur" },
  { value: "fortune.yanogo", label: "Fortune YANOGO - Photographe/Vidéaste" },
  { value: "bientama.pare", label: "Bientama PARÉ - Motion Designer" },
  { value: "issa.cisse", label: "Issa CISSE - Graphiste Junior" },
  { value: "jean.sampabao", label: "Jean-Jacques SAMPABAO - Directeur Artistique Junior" },
  { value: "latif.ouedraogo", label: "Abdoul Latif OUEDRAOGO - Designer UI/UX" },
];

const marketingTeam = [
  { value: "florita.kabore", label: "Florita KABORÉ - Responsable Médias Sociaux" },
  { value: "nebie.webou", label: "Nebié WEBOU - Chef de Pub/Concepteur Rédacteur" },
  { value: "djamilatou.guiguemde", label: "Djamilatou GUIGUEMDE - Chef de Pub Stagiaire" },
  { value: "linda.kabore", label: "Linda KABORÉ - Conceptrice Rédactrice Lead" },
  { value: "maryse.bombiri", label: "Maryse BOMBIRI - Community Manager" },
  { value: "faridatou.barry", label: "Faridatou BARRY - Chef de Pub/CM" },
];

export default function Login() {
  const [selectedMember, setSelectedMember] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen relative flex items-center justify-center p-4" style={{ backgroundColor: '#162C54' }}>
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, #37B6E9 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, #3475BB 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="w-full max-w-md animate-in fade-in duration-300">
        {/* Header */}
        <div className="text-center mb-8 animate-in slide-in-from-bottom duration-200">
          <h1 className="text-2xl font-bold mb-2 text-[#162C54]">
            Connexion Sécurisée
          </h1>
        </div>
        
        {/* Login Form */}
        <Card 
          className="rounded-2xl p-8 animate-in slide-in-from-bottom duration-300 delay-100"
          style={{ 
            boxShadow: '0 10px 25px -5px rgba(22, 44, 84, 0.08), 0 4px 6px -2px rgba(22, 44, 84, 0.04)',
            border: '1px solid #E5E7EB'
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Selection */}
            <div className="space-y-3">
              <Label className="flex items-center text-sm font-medium text-[#1A4278]">
                <User className="w-5 h-5 mr-2" />
                Sélectionnez votre profil
              </Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#3475BB] focus:ring-0 transition-all duration-150"
                  data-testid="select-member"
                >
                  <SelectValue placeholder="-- Choisir un membre de l'équipe --" />
                </SelectTrigger>
                <SelectContent>
                  <div className="py-1">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                      👑 Administrateurs
                    </div>
                    {adminMembers.map((member) => (
                      <SelectItem 
                        key={member.value} 
                        value={member.value}
                        className="hover:bg-[#EBECED]"
                      >
                        {member.label}
                      </SelectItem>
                    ))}
                  </div>
                  <div className="py-1">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                      🎨 Équipe Créative
                    </div>
                    {creativeTeam.map((member) => (
                      <SelectItem 
                        key={member.value} 
                        value={member.value}
                        className="hover:bg-[#EBECED]"
                      >
                        {member.label}
                      </SelectItem>
                    ))}
                  </div>
                  <div className="py-1">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                      📱 Communication & Marketing
                    </div>
                    {marketingTeam.map((member) => (
                      <SelectItem 
                        key={member.value} 
                        value={member.value}
                        className="hover:bg-[#EBECED]"
                      >
                        {member.label}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>
            
            {/* Password */}
            <div className="space-y-3">
              <Label className="flex items-center text-sm font-medium text-[#1A4278]">
                <Lock className="w-5 h-5 mr-2" />
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#3475BB] focus:ring-0 transition-all duration-150 pr-12"
                  placeholder="Saisissez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full text-white py-3 px-6 rounded-xl font-medium focus:outline-none focus:ring-0 flex items-center justify-center transition-all duration-150 hover:transform hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, #3475BB, #37B6E9)',
                boxShadow: loginMutation.isPending ? 'none' : '0 4px 12px rgba(52, 117, 187, 0.3)'
              }}
              disabled={loginMutation.isPending}
              data-testid="button-login"
            >
              {loginMutation.isPending && (
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <LogIn className="w-5 h-5 mr-2" />
              {loginMutation.isPending ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
