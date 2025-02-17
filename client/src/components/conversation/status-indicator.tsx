import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  isConnected: boolean;
  isListening: boolean;
}

export default function StatusIndicator({
  isConnected,
  isListening
}: StatusIndicatorProps) {
  return (
    <div className="flex gap-2">
      <Badge 
        variant="outline"
        className={cn(
          "transition-colors",
          isConnected ? "border-primary text-primary" : "border-muted-foreground text-muted-foreground"
        )}
      >
        {isConnected ? "Connected" : "Disconnected"}
      </Badge>
      
      <Badge 
        variant="outline"
        className={cn(
          "transition-colors",
          isListening 
            ? "border-destructive text-destructive animate-pulse" 
            : "border-muted-foreground text-muted-foreground"
        )}
      >
        {isListening ? "Listening" : "Idle"}
      </Badge>
    </div>
  );
}
