import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, User, Lock, LogIn } from "lucide-react";
import logoImage from "@assets/1_1756859322480.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", { username, password });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${data.data.member.name}`,
        });
        window.location.href = "/dashboard";
      } else {
        toast({
          title: "Erreur de connexion",
          description: data.message || "Vérifiez vos identifiants",
          variant: "destructive",
        });
      }
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

    if (!username.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre nom d'utilisateur",
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

    loginMutation.mutate({ username: username.trim(), password });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4" style={{ backgroundColor: '#162C54' }}>
      {/* Logo en filigrane */}
      <div
        className="fixed inset-0 pointer-events-none opacity-8"
        style={{
          backgroundImage: `url(${logoImage})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '90vh 90vh'
        }}
      />

      {/* Pattern subtil */}
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

      <div className="w-full max-w-md animate-in fade-in duration-300 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-in slide-in-from-bottom duration-200">
          <h1 className="text-2xl font-bold mb-2 text-white">
            Connexion Sécurisée
          </h1>
          <p className="text-sm text-blue-200">
            Jo'Fé Digital - Espace Équipe
          </p>
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
            {/* Username */}
            <div className="space-y-3">
              <Label className="flex items-center text-sm font-medium text-[#1A4278]">
                <User className="w-5 h-5 mr-2" />
                Nom d'utilisateur
              </Label>
              <Input
                id="username"
                type="text"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#3475BB] focus:ring-0 transition-all duration-150"
                placeholder="ex: prenom.nom"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                data-testid="input-username"
              />
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
                  autoComplete="current-password"
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

        {/* Footer hint */}
        <p className="text-center text-xs text-blue-300 mt-6">
          Contactez un administrateur si vous n'avez pas vos identifiants
        </p>
      </div>
    </div>
  );
}
