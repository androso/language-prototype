export interface WebRTCState {
  pc: RTCPeerConnection;
  dc: RTCDataChannel;
  stream: MediaStream;
  onTranscriptUpdate?: (text: string) => void;
}

export async function initWebRTC(
  ephemeralKey: string, 
  onTranscriptUpdate?: (text: string) => void
): Promise<WebRTCState> {
  // Create peer connection
  const pc = new RTCPeerConnection();

  // Set up audio playback
  const audioEl = document.createElement("audio");
  audioEl.autoplay = true;
  pc.ontrack = e => audioEl.srcObject = e.streams[0];

  // Add microphone input
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    const audioTrack = stream.getAudioTracks()[0];
    pc.addTrack(audioTrack, stream);
  } catch (error) {
    console.error('Error accessing microphone:', error);
    throw new Error('Could not access microphone. Please ensure microphone permissions are granted.');
  }

  // Set up data channel
  const dc = pc.createDataChannel("oai-events");
  dc.addEventListener("message", (e) => {
    const event = JSON.parse(e.data);
    console.log('Received event:', event);
    
    // Handle transcript events
    if (event.type === "response.text.delta" && onTranscriptUpdate && event.delta) {
      onTranscriptUpdate(event.delta);
    } else if (event.type === "response.text.done" && onTranscriptUpdate && event.text) {
      // Skip sending full text at the end to avoid duplication
      // onTranscriptUpdate(event.text);
    } else if (event.type === "response.audio_transcript.delta" && onTranscriptUpdate && event.delta) {
      onTranscriptUpdate(event.delta);
    } else if (event.type === "response.audio_transcript.done" && onTranscriptUpdate && event.transcript) {
      // Skip sending full transcript at the end to avoid duplication
      // onTranscriptUpdate(event.transcript);
    } else if (event.type === "response.created" && onTranscriptUpdate) {
      // Clear transcript when a new response starts
      onTranscriptUpdate("");
    }
  });
  
  // Wait until the data channel is open
  dc.addEventListener("open", () => {
    console.log("Data channel is open, sending message...");
    dc.send(JSON.stringify({
      type: "response.create",
      response: {
        modalities: ["text", "audio"],
        instructions: "You are a helpful language learning assistant. Engage in natural conversation while helping the user practice their language skills. Correct any errors gently and provide encouragement.",
      },
    }));
  });

  
  // Initialize session
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  const baseUrl = "https://api.openai.com/v1/realtime";
  const model = "gpt-4o-mini-realtime-preview-2024-12-17";

  const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
    method: "POST",
    body: offer.sdp,
    headers: {
      Authorization: `Bearer ${ephemeralKey}`,
      "Content-Type": "application/sdp"
    },
  });

  if (!sdpResponse.ok) {
    throw new Error(`Failed to establish connection: ${sdpResponse.statusText}`);
  }

  const answer = {
    type: "answer" as RTCSdpType,
    sdp: await sdpResponse.text(),
  };

  await pc.setRemoteDescription(answer);

  // Start conversation
  // dc.send(JSON.stringify({
  //   type: "response.create",
  //   response: {
  //     modalities: ["text", "speech"],
  //     instructions: "You are a helpful language learning assistant. Engage in natural conversation while helping the user practice their language skills. Correct any errors gently and provide encouragement.",
  //   },
  // }));

  return { pc, dc, stream, onTranscriptUpdate };
}