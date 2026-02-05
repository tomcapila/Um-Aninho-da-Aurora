 interface AuroraBackgroundProps {
   isNightMode: boolean;
 }
 
 export const AuroraBackground = ({ isNightMode }: AuroraBackgroundProps) => {
   if (!isNightMode) {
     // Modo dia: efeito suave com tons pastéis
     return (
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
         {/* Camada 1 - Rosa suave */}
         <div
           className="absolute inset-0 opacity-30 animate-aurora-drift-1"
           style={{
             background: 'radial-gradient(ellipse 80% 50% at 20% 40%, hsl(340 60% 85% / 0.6) 0%, transparent 70%)',
           }}
         />
         {/* Camada 2 - Coral */}
         <div
           className="absolute inset-0 opacity-25 animate-aurora-drift-2"
           style={{
             background: 'radial-gradient(ellipse 60% 40% at 70% 30%, hsl(15 70% 80% / 0.5) 0%, transparent 60%)',
           }}
         />
         {/* Camada 3 - Dourado */}
         <div
           className="absolute inset-0 opacity-20 animate-aurora-drift-3"
           style={{
             background: 'radial-gradient(ellipse 50% 30% at 50% 60%, hsl(40 80% 75% / 0.4) 0%, transparent 50%)',
           }}
         />
       </div>
     );
   }
 
   // Modo noturno: aurora boreal vibrante
   return (
     <div className="absolute inset-0 overflow-hidden pointer-events-none">
       {/* Camada 1 - Verde Aurora (base) */}
       <div
         className="absolute -inset-[50%] opacity-40 animate-aurora-drift-1 mix-blend-screen"
         style={{
           background: 'conic-gradient(from 180deg at 50% 70%, hsl(160 100% 50% / 0.8) 0deg, hsl(195 100% 50% / 0.6) 60deg, transparent 120deg, transparent 240deg, hsl(160 100% 50% / 0.8) 300deg, hsl(160 100% 50% / 0.8) 360deg)',
           filter: 'blur(60px)',
         }}
       />
       
       {/* Camada 2 - Azul Celeste (transição) */}
       <div
         className="absolute -inset-[30%] opacity-35 animate-aurora-drift-2 mix-blend-screen"
         style={{
           background: 'conic-gradient(from 90deg at 60% 50%, hsl(195 100% 50% / 0.7) 0deg, hsl(280 80% 40% / 0.5) 90deg, transparent 180deg, hsl(195 100% 50% / 0.7) 270deg, hsl(195 100% 50% / 0.7) 360deg)',
           filter: 'blur(80px)',
         }}
       />
       
       {/* Camada 3 - Rosa/Magenta (destaque) */}
       <div
         className="absolute -inset-[20%] opacity-30 animate-aurora-drift-3 mix-blend-screen"
         style={{
           background: 'radial-gradient(ellipse 100% 60% at 40% 30%, hsl(320 100% 55% / 0.6) 0%, hsl(160 100% 50% / 0.3) 40%, transparent 70%)',
           filter: 'blur(50px)',
         }}
       />
       
       {/* Camada 4 - Brilho ondulante */}
       <div
         className="absolute inset-0 opacity-25 animate-aurora-shimmer mix-blend-overlay"
         style={{
           background: 'linear-gradient(135deg, transparent 0%, hsl(160 100% 50% / 0.4) 25%, transparent 50%, hsl(195 100% 50% / 0.3) 75%, transparent 100%)',
           filter: 'blur(30px)',
         }}
       />
       
       {/* Gradiente inferior para fade */}
       <div 
         className="absolute bottom-0 left-0 right-0 h-1/3"
         style={{
           background: 'linear-gradient(to top, hsl(220 50% 5%) 0%, transparent 100%)',
         }}
       />
     </div>
   );
 };