import { cn } from "@/lib/utils";

interface TranscriptProps {
  text: string;
  className?: string;
}

export default function Transcript({ text, className }: TranscriptProps) {
  if (!text) {
    return null;
  }
  
  return (
    <div className={cn("w-full rounded-md border p-3 text-sm", className)}>
      <p className="whitespace-pre-wrap">{text}</p>
    </div>
  );
}