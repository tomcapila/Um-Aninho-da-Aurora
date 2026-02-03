import { Link } from "react-router-dom";
import { Sparkles } from "@/components/Sparkles";
import { ConfirmationFlow } from "@/components/ConfirmationFlow";
import { Countdown } from "@/components/Countdown";
import { Settings } from "lucide-react";
import auroraBanner from "@/assets/aurora-banner.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url(${auroraBanner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      />
      
      <Sparkles />

      {/* Admin Link */}
      <Link
        to="/admin"
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
        title="Área administrativa"
      >
        <Settings className="w-5 h-5 text-muted-foreground" />
      </Link>

      <div className="container relative z-10 px-4 py-12 md:py-20">
        {/* Header */}
        <header className="text-center mb-12 md:mb-16 animate-fade-in">
          <p className="text-aurora-coral font-medium tracking-widest uppercase text-sm mb-2">
            Você está convidado para o
          </p>
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-4">
            <span className="text-gradient-aurora">1º Aniversário</span>
          </h1>
          <div className="relative inline-block">
            <h2 className="text-4xl md:text-6xl font-display font-semibold text-foreground">
              Aurora
            </h2>
            <div className="absolute -top-2 -right-6 w-8 h-8 text-aurora-gold animate-sparkle">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" />
              </svg>
            </div>
          </div>
        </header>

        {/* Event Details */}
        <div className="max-w-md mx-auto mb-8 md:mb-12 animate-slide-up">
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-aurora-lg border">
            <div className="grid grid-cols-2 gap-6 text-center mb-6">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm uppercase tracking-wide">Data</p>
                <p className="font-display text-xl font-semibold text-foreground">
                  14 de Março
                </p>
                <p className="text-muted-foreground">Sábado, 2026</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm uppercase tracking-wide">Horário</p>
                <p className="font-display text-xl font-semibold text-foreground">
                  13:00
                </p>
                <p className="text-muted-foreground">em ponto</p>
              </div>
            </div>
            
            {/* Countdown */}
            <div className="pt-4 border-t border-border/50">
              <Countdown />
            </div>
          </div>
        </div>

        {/* Gift Suggestions */}
        <div className="max-w-md mx-auto mb-12 md:mb-16 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-aurora border">
            <p className="text-muted-foreground text-sm uppercase tracking-wide text-center mb-4">
              🎁 Dicas de Presentes
            </p>
            <ul className="space-y-2 text-center text-foreground">
              <li className="flex items-center justify-center gap-2">
                <span className="text-aurora-coral">👗</span>
                <span>Roupas tamanho M (12 a 24 meses)</span>
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className="text-aurora-coral">👟</span>
                <span>Calçados tamanho 18 a 20</span>
              </li>
              <li className="flex items-center justify-center gap-2">
                <span className="text-aurora-coral">🧸</span>
                <span>Brinquedos didáticos (1 a 2 anos)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Confirmation Flow */}
        <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <ConfirmationFlow />
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-muted-foreground text-sm">
          <p>Feito com ✨ para Aurora</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
