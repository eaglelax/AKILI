import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, BarChart3, MessageCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="gradient-bg">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center">
            <div className="w-20 h-20 gradient-bg rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">J+</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-6">
              Jo'Fé Digital
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">Système de gestion d'équipe du département Marketing & Création</p>
            <p className="text-lg text-white/80 mb-12">
              Plateforme collaborative pour le suivi de projets, chronométrage temps réel et analytics avancées
            </p>
            <Button 
              onClick={() => window.location.href = '/login'}
              size="lg"
              className="bg-white text-primary hover:bg-white/90 px-8 py-3 text-lg font-semibold"
              data-testid="button-access-platform"
            >
              Accéder à la Plateforme
            </Button>
          </div>
        </div>
      </div>
      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Fonctionnalités Principales
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Une solution complète pour optimiser la productivité et collaboration de votre équipe créative
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="border border-border hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Chronométrage Automatique
              </h3>
              <p className="text-muted-foreground text-sm">
                Suivi précis du temps de travail avec démarrage automatique et calcul des coûts en temps réel
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Collaboration d'Équipe
              </h3>
              <p className="text-muted-foreground text-sm">
                Accès multi-utilisateurs avec mise à jour instantanée pour tous les 14 membres de l'équipe
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Analytics Avancées
              </h3>
              <p className="text-muted-foreground text-sm">
                ROI par client, productivité par membre, prédictions de charge et rapports détaillés
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Chat Intégré
              </h3>
              <p className="text-muted-foreground text-sm">
                Communication temps réel par projet avec notifications et mentions @utilisateur
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Stats Section */}
      <div className="bg-muted py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-foreground mb-2">14</div>
              <div className="text-muted-foreground">Membres d'Équipe</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-foreground mb-2">33</div>
              <div className="text-muted-foreground">Clients Actifs</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-foreground mb-2">24/7</div>
              <div className="text-muted-foreground">Accès Disponible</div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground">
            © 2025 Jo'Fé Digital - Agence Marketing & Communication Burkina Faso
          </p>
        </div>
      </footer>
    </div>
  );
}
