import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

// Rôles utilisateur: super_admin > admin > member
type UserRole = 'super_admin' | 'admin' | 'member';

type User = {
  id: string;
  name: string;
  username: string;
  role: string; // Titre du poste (Directeur, Designer, etc.)
  userRole: UserRole; // Rôle système (super_admin, admin, member)
  department?: string;
  isAdmin: boolean;
  avatar?: string;
  email?: string;
  status?: string;
  skills?: string[];
  phone?: string;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Récupérer l'utilisateur connecté depuis l'API
    const fetchUser = async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/me");
        const data = await response.json();

        if (data.success && data.data?.member) {
          setUser({
            ...data.data.member,
            userRole: data.data.member.userRole || 'member',
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        // En cas d'erreur (pas authentifié), user reste null
        console.error("Auth check error:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const userRole = user?.userRole || 'member';

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    userRole,
    // Helpers pour vérifier les permissions
    isSuperAdmin: userRole === 'super_admin',
    isAdmin: userRole === 'admin' || userRole === 'super_admin',
    isMember: userRole === 'member',
    // Peut créer des admins (seulement super_admin)
    canCreateAdmin: userRole === 'super_admin',
    // Peut créer des membres (admin ou super_admin)
    canCreateMember: userRole === 'admin' || userRole === 'super_admin',
  };
}
