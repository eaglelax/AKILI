import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import logoImage from "@assets/1_1756859322480.png";
import { useLocation } from "wouter";

function Splash() {
  const [progress, setProgress] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setShowButton(true);
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 30); // Progression en 3 secondes (100 * 30ms)

    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setLocation("/login");
  };

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center p-4" 
      style={{ backgroundColor: '#162C54' }}
    >
      {/* Pattern subtil - même que la page de connexion */}
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
      <div className="text-center relative z-10">
        {/* Logo principal qui tourne */}
        <div className="mb-12 flex justify-center">
          <div className="logo-container">
            <img 
              src={logoImage}
              alt="Jo'Fé Digital Logo"
              className="logo-spinning"
              style={{
                width: '200px',
                height: '200px',
                objectFit: 'contain',
                filter: 'brightness(1.2) contrast(1.1)'
              }}
            />
          </div>
        </div>
        
        {/* Titre */}
        <div className="mb-8 animate-in fade-in duration-500 delay-300">
          <h1 className="text-4xl font-bold mb-4 text-white jofe-font">jofé+</h1>
          <p className="text-xl text-blue-200 font-medium">
            Système de gestion d'équipe
          </p>
        </div>
        
        {/* Barre de chargement */}
        <div className="mb-8 animate-in fade-in duration-500 delay-500">
          <div className="w-80 mx-auto">
            <div className="mb-3">
              <p className="text-blue-200 text-sm font-medium">
                Chargement en cours... {progress}%
              </p>
            </div>
            <div 
              className="w-full h-2 bg-blue-900/30 rounded-full overflow-hidden"
              style={{ 
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' 
              }}
            >
              <div 
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #3475BB, #37B6E9, #93C954)',
                  boxShadow: '0 0 10px rgba(55, 182, 233, 0.5)'
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Bouton Suivant */}
        {showButton && (
          <div className="animate-in fade-in duration-500">
            <Button 
              onClick={handleNext}
              className="text-white py-3 px-8 rounded-xl font-medium focus:outline-none focus:ring-0 flex items-center justify-center mx-auto transition-all duration-300 hover:transform hover:-translate-y-1 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #3475BB, #37B6E9)',
                boxShadow: '0 6px 20px rgba(52, 117, 187, 0.4)'
              }}
              data-testid="button-next"
            >
              <span className="mr-2">Suivant</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        )}
        
        {/* Version info */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pb-1">
          <p className="text-blue-300/60 text-xs">
            Version 1.0.0 - Burkina Faso
          </p>
        </div>
      </div>
      {/* Styles CSS pour l'animation */}
      <style>{`
        .logo-container {
          perspective: 1000px;
        }
        
        .logo-spinning {
          animation: rotateZ 4s linear infinite;
        }
        
        @keyframes rotateZ {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .fade-in {
          animation-name: fadeIn;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .jofe-font {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
      `}</style>
    </div>
  );
}

export default Splash;