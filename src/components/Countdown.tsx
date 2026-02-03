import { useState, useEffect } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const EVENT_DATE = new Date("2026-03-14T13:00:00");

export const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  function calculateTimeLeft(): TimeLeft {
    const now = new Date();
    const difference = EVENT_DATE.getTime() - now.getTime();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isEventPassed = timeLeft.days === 0 && timeLeft.hours === 0 && 
                        timeLeft.minutes === 0 && timeLeft.seconds === 0 &&
                        new Date() >= EVENT_DATE;

  if (isEventPassed) {
    return (
      <div className="text-center">
        <p className="text-aurora-gold font-display text-xl font-semibold">
          🎉 A festa começou! 🎉
        </p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-3">
      <p className="text-muted-foreground text-sm uppercase tracking-wide">
        ⏰ Faltam
      </p>
      <div className="flex justify-center gap-3 md:gap-4">
        <TimeUnit value={timeLeft.days} label="dias" />
        <TimeUnit value={timeLeft.hours} label="horas" />
        <TimeUnit value={timeLeft.minutes} label="min" />
        <TimeUnit value={timeLeft.seconds} label="seg" />
      </div>
    </div>
  );
};

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="bg-secondary/50 rounded-lg w-14 h-14 md:w-16 md:h-16 flex items-center justify-center border border-primary/20">
      <span className="font-display text-2xl md:text-3xl font-bold text-gradient-aurora">
        {String(value).padStart(2, "0")}
      </span>
    </div>
    <span className="text-xs text-muted-foreground mt-1">{label}</span>
  </div>
);
