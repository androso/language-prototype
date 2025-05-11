import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface TranscriptProps {
  text: string;
  className?: string;
  currentWordIndex?: number;
}

export default function Transcript({ text, className, currentWordIndex = -1 }: TranscriptProps) {
  const [words, setWords] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Split text into words when text changes
  useEffect(() => {
    if (text) {
      // Split by spaces while preserving punctuation
      const processedWords = text.split(/\s+/).filter(word => word.length > 0);
      setWords(processedWords);
    } else {
      setWords([]);
    }
  }, [text]);

  // Scroll to the current word
  useEffect(() => {
    if (currentWordIndex >= 0 && containerRef.current) {
      const wordElements = containerRef.current.querySelectorAll('[data-word-index]');
      if (wordElements[currentWordIndex]) {
        wordElements[currentWordIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [currentWordIndex]);

  if (!text) {
    return null;
  }
  
  return (
    <div 
      ref={containerRef}
      className={cn(
        "w-full rounded-md border p-3 text-sm max-h-48 overflow-y-auto", 
        className
      )}
    >
      <p className="whitespace-pre-wrap">
        {words.map((word, index) => (
          <span 
            key={`${word}-${index}`}
            data-word-index={index}
            className={cn(
              "transition-colors duration-300",
              index === currentWordIndex 
                ? "bg-primary/20 font-medium text-primary" 
                : index < currentWordIndex
                ? "text-foreground" 
                : "text-muted-foreground"
            )}
          >
            {word}{index < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </p>
    </div>
  );
}