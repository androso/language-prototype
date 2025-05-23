import { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import AudioControls from "@/components/conversation/audio-controls";
import StatusIndicator from "@/components/conversation/status-indicator";
import Transcript from "@/components/conversation/transcript";
import { useToast } from "@/hooks/use-toast";
import { initWebRTC, WebRTCState } from "@/lib/webrtc";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const connectionRef = useRef<WebRTCState | null>(null);
  const { toast } = useToast();

  const handleStartConversation = async () => {
    if (connectionRef.current) {
      console.warn('Connection already exists, closing previous connection');
      handleStopConversation();
    }
    try {
      const response = await fetch('/api/session');
      if (!response.ok) {
        throw new Error('Failed to get session token');
      }

      const data = await response.json();
      if (!data?.client_secret?.value) {
        throw new Error('Invalid session token received');
      }

      if (!connectionRef.current) {
        try {
          // Clear previous transcript when starting a new conversation
          setTranscript('');
          
          // Create a transcript update handler
          const handleTranscriptUpdate = (text: string) => {
            // Check if this is a new response from the assistant
            if (text.startsWith("Hello") || text.startsWith("Hey")) {
              // Clear transcript for new responses
              setTranscript(text);
            } else {
              setTranscript(current => current + text);
            }
          };
          
          connectionRef.current = await initWebRTC(
            data.client_secret.value,
            handleTranscriptUpdate
          );
        } catch(e) {
          throw e
        }
        setIsConnected(true);
        toast({
          title: "Connected!",
          description: "You can start speaking now",
        });
      }

      setIsListening(true);
    } catch (error: any) {
      toast({
        title: "Connection Error",
        description: error?.message || "Failed to start conversation",
        variant: "destructive",
      });
      console.error('Connection error:', error);
    }
  };

  const handleStopConversation = () => {
    try {
      if (connectionRef.current) {
        // Close all media tracks
        connectionRef.current.stream.getTracks().forEach(track => {
          track.stop();
        });

        // Close data channel first
        if (connectionRef.current.dc.readyState === 'open') {
          connectionRef.current.dc.close();
        }

        // Close the peer connection
        if (connectionRef.current.pc.connectionState !== 'closed') {
          connectionRef.current.pc.close();
        }

        connectionRef.current = null;
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    } finally {
      setIsConnected(false);
      setIsListening(false);
      // Don't clear transcript here to let user see the conversation history
      toast({
        title: "Disconnected",
        description: "Conversation ended",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 flex flex-col items-center gap-6">
          <h1 className="text-2xl font-bold text-foreground">Language Practice</h1>
          
          {transcript && (
            <Transcript 
              text={transcript} 
              className="w-full mb-2"
            />
          )}

          <StatusIndicator 
            isConnected={isConnected} 
            isListening={isListening} 
          />

          <AudioControls 
            isListening={isListening}
            onStart={handleStartConversation}
            onStop={handleStopConversation}
          />

          <p className="text-sm text-muted-foreground text-center">
            {isConnected 
              ? "Speak naturally - the AI will respond in real-time" 
              : "Click the microphone to start practicing"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}