import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

const motivationalQuotes = [
  {
    text: "Discipline > Motivation",
    subtext: "Build habits, not just feelings"
  },
  {
    text: "Allah helpt de geduldigen",
    subtext: "Quran 2:153"
  },
  {
    text: "Kleine stappen, grote veranderingen",
    subtext: "Consistency is key"
  },
  {
    text: "Vandaag is een nieuwe kans",
    subtext: "Grijp elke moment"
  },
  {
    text: "Strength through struggle",
    subtext: "Every test makes you stronger"
  }
];

export const MotivationalCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextQuote = () => {
    setCurrentIndex((prev) => (prev + 1) % motivationalQuotes.length);
  };

  const prevQuote = () => {
    setCurrentIndex((prev) => (prev - 1 + motivationalQuotes.length) % motivationalQuotes.length);
  };

  // Auto-advance every 5 seconds
  useEffect(() => {
    const interval = setInterval(nextQuote, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentQuote = motivationalQuotes[currentIndex];

  return (
    <GlassCard className="p-4 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevQuote}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <div className="text-center flex-1 px-4">
          <p className="font-semibold text-foreground text-sm leading-relaxed">
            {currentQuote.text}
          </p>
          <p className="text-xs text-primary mt-1">
            {currentQuote.subtext}
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={nextQuote}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Dots indicator */}
      <div className="flex justify-center space-x-1 mt-3">
        {motivationalQuotes.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    </GlassCard>
  );
};