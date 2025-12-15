import { useState, useEffect } from "react";

// Utilisateur local simulé (pour développement sans API)
const LOCAL_USER = {
  id: "1",
  name: "Serge ASSALÉ",
  username: "serge.assale",
  role: "Directeur Création & Marketing",
  department: "Direction",
  isAdmin: true,
  avatar: "SA",
  email: "serge@jofedigital.com",
};

export function useAuth() {
  const [user, setUser] = useState<typeof LOCAL_USER | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler un court délai de chargement
    const timer = setTimeout(() => {
      // Utiliser l'utilisateur local par défaut
      setUser(LOCAL_USER);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin ?? false,
  };
}
