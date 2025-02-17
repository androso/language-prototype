import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

interface AudioControlsProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
}

export default function AudioControls({ 
  isListening, 
  onStart, 
  onStop 
}: AudioControlsProps) {
  return (
    <Button
      size="lg"
      variant={isListening ? "destructive" : "default"}
      className="w-16 h-16 rounded-full p-0 transition-all duration-200 hover:scale-105"
      onClick={isListening ? onStop : onStart}
    >
      {isListening ? (
        <MicOff className="h-8 w-8" />
      ) : (
        <Mic className="h-8 w-8" />
      )}
    </Button>
  );
}
