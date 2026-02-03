import { useEffect, useState } from "react";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  color: string;
}

interface SparklesProps {
  isNightMode?: boolean;
}

const dayColors = ["text-aurora-gold"];
const nightColors = [
  "text-[hsl(160,100%,50%)]", // Aurora green
  "text-[hsl(195,100%,50%)]", // Aurora blue
  "text-[hsl(320,100%,55%)]", // Aurora pink
];

export const Sparkles = ({ isNightMode = false }: SparklesProps) => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const colors = isNightMode ? nightColors : dayColors;
    const count = isNightMode ? 35 : 20;
    
    const newSparkles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (isNightMode ? 12 : 8) + 4,
      delay: Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setSparkles(newSparkles);
  }, [isNightMode]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className={`absolute animate-sparkle transition-all duration-500 ${
            isNightMode ? "opacity-80" : "opacity-60"
          }`}
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
            animationDelay: `${sparkle.delay}s`,
            filter: isNightMode ? `drop-shadow(0 0 ${sparkle.size / 2}px currentColor)` : 'none',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={`w-full h-full ${sparkle.color}`}
          >
            <path
              d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z"
              fill="currentColor"
            />
          </svg>
        </div>
      ))}
    </div>
  );
};
