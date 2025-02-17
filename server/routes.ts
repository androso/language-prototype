import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Endpoint to generate ephemeral token
  app.get("/api/session", async (_req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured');
      }

      const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini-realtime-preview-2024-12-17",
          voice: "sol",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText || response.statusText}`);
      }

      const data = await response.json();
      if (!data?.client_secret?.value) {
        throw new Error('Invalid response format from OpenAI API');
      }

      res.json(data);
    } catch (error: any) {
      console.error('Session token generation error:', error);
      res.status(500).json({ 
        message: "Failed to generate session token",
        error: error?.message || 'Unknown error occurred'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}