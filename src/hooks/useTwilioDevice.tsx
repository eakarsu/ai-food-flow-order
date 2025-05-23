
import { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";

interface UseTwilioDeviceProps {
  open: boolean;
  phoneNumber: string;
}

export const useTwilioDevice = ({ open, phoneNumber }: UseTwilioDeviceProps) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio element for call playback
  useEffect(() => {
    // Create audio element if it doesn't exist yet
    if (!audioRef.current) {
      const audio = new Audio();
      audio.autoplay = true;
      audio.muted = false;
      audioRef.current = audio;
      
      console.log("Audio element initialized for call playback");
    }
    
    // Cleanup function to stop audio playback when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.srcObject = null;
      }
    };
  }, []);

  // Simplified API that relies on server-side implementation
  const makeCall = async () => {
    if (!phoneNumber) return;
    
    try {
      setIsConnecting(true);
      
      // Get the voice endpoint URL from environment variable or from localStorage
      const voiceEndpoint = import.meta.env.VITE_NGROK_VOICE_URL || 
                          localStorage.getItem('twilioNgrokVoiceUrl') || 
                          '/api/twilio-call';
      
      console.log("Calling voice endpoint:", voiceEndpoint);
      console.log("Calling phone number:", phoneNumber);
      
      // Check if the voice endpoint is a cross-origin URL (different domain)
      const isCrossOrigin = voiceEndpoint.startsWith('http') && 
                           !voiceEndpoint.includes(window.location.hostname);
      
      if (isCrossOrigin) {
        console.log("Cross-origin request detected. Adding CORS mode.");
      }

      // Check for browser audio permissions first
      try {
        // Request microphone permission which is needed for calls
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Microphone permission granted");
        
        // Stop the stream immediately as we just needed the permission
        stream.getTracks().forEach(track => track.stop());
      } catch (permissionError) {
        console.error("Microphone permission denied:", permissionError);
        toast({
          title: "Microphone Access Required",
          description: "Please allow microphone access to make calls.",
          variant: "destructive",
        });
        setIsConnecting(false);
        return;
      }
      
      // For WebRTC-based audio stream using fetch to connect to the Twilio API
      const response = await fetch(voiceEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add mode: 'cors' for cross-origin requests
        ...(isCrossOrigin ? { mode: 'cors' } : {}),
        body: JSON.stringify({ 
          to: phoneNumber,
          identity: "customer-service-agent"
        })
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to initiate call. Status: ${response.status}`);
      }
      
      // Check the content type to determine if it's JSON or XML
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        // Handle JSON response
        const data = await response.json();
        console.log("Call initiated successfully:", data);
        
        // If this is a JSON response with a mediaUrl, play it
        if (data.mediaUrl) {
          if (audioRef.current) {
            audioRef.current.src = data.mediaUrl;
            audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
          }
        }
      } else if (contentType && (contentType.includes('application/xml') || contentType.includes('text/xml'))) {
        // Handle XML response (common with Twilio TwiML)
        const xmlText = await response.text();
        console.log("Received XML response:", xmlText);
        
        // Create a WebSocket connection to handle real-time audio
        try {
          // Create WebSocket URL from the same base endpoint
          const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const wsEndpoint = voiceEndpoint.startsWith('http') 
            ? voiceEndpoint.replace(/^http(s?):\/\//, wsProtocol + '//') + '/stream'
            : wsProtocol + '//' + window.location.host + voiceEndpoint + '/stream';
          
          console.log("Attempting WebSocket connection to:", wsEndpoint);
          
          // Try to connect to WebSocket for audio streaming
          // This will likely need server-side support specifically for audio streaming
          const socket = new WebSocket(wsEndpoint);
          
          socket.onopen = () => {
            console.log("WebSocket connection established for audio streaming");
            socket.send(JSON.stringify({ 
              action: 'connect', 
              phoneNumber,
              identity: "customer-service-agent"
            }));
          };
          
          socket.onerror = (error) => {
            console.error("WebSocket error:", error);
            toast({
              title: "Audio Connection Failed",
              description: "Could not establish audio connection. Call connected but you may not hear audio.",
              variant: "destructive",
            });
          };
        } catch (wsError) {
          console.error("WebSocket connection failed:", wsError);
          // Continue with the call even if WebSocket fails, as it might be handled by the server directly
        }
        
        // Check if the XML contains TwiML directives
        if (xmlText.includes('<Dial') || xmlText.includes('<Say') || xmlText.includes('<Response')) {
          console.log("Received valid TwiML response, considering call connected");
          
          // Create audio context for playing audio
          try {
            // For browsers that support AudioContext API
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
              const audioContext = new AudioContext();
              
              // Attempt to play a dial tone as feedback that the call is connecting
              const oscillator = audioContext.createOscillator();
              oscillator.type = 'sine';
              oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
              
              const gainNode = audioContext.createGain();
              gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Low volume
              
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              
              oscillator.start();
              
              // Stop the tone after 1 second
              setTimeout(() => {
                oscillator.stop();
                // Clean up
                oscillator.disconnect();
                gainNode.disconnect();
              }, 1000);
              
              console.log("Playing dial tone as audio feedback");
            }
          } catch (audioError) {
            console.error("AudioContext initialization failed:", audioError);
          }
        } else {
          throw new Error("Received XML response but it doesn't appear to be valid TwiML");
        }
      } else {
        // Handle other response types
        const text = await response.text();
        console.log("Response received (non-JSON format):", text);
      }
      
      // Consider the call connected if we got a 200 OK response
      setIsConnected(true);
      toast({
        title: "Call Connected",
        description: `Connected to ${phoneNumber}`,
      });
      
    } catch (error) {
      console.error("Error making call:", error);
      
      // Provide more specific error message for CORS issues and XML parsing
      let errorMessage = error instanceof Error ? error.message : "Failed to connect call";
      
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        // This is likely a CORS error
        errorMessage = "Cannot connect to voice server. This may be due to CORS restrictions. Please ensure your server allows cross-origin requests.";
      } else if (error instanceof SyntaxError && error.message.includes("Unexpected token")) {
        errorMessage = "The server returned a response in an unexpected format (possibly XML when JSON was expected). Check server configuration.";
      }
      
      toast({
        title: "Call Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Reset the connected state
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectCall = async () => {
    try {
      // Get the voice endpoint URL
      const voiceEndpoint = import.meta.env.VITE_NGROK_VOICE_URL || 
                          localStorage.getItem('twilioNgrokVoiceUrl') || 
                          '/api/twilio-call';
      
      console.log("Disconnecting call using endpoint:", `${voiceEndpoint}/hangup`);
      
      // Check if the voice endpoint is a cross-origin URL (different domain)
      const isCrossOrigin = voiceEndpoint.startsWith('http') && 
                           !voiceEndpoint.includes(window.location.hostname);
      
      const response = await fetch(`${voiceEndpoint}/hangup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add mode: 'cors' for cross-origin requests
        ...(isCrossOrigin ? { mode: 'cors' } : {}),
        body: JSON.stringify({ 
          identity: "customer-service-agent"
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to end call");
      }
      
      console.log("Call disconnected successfully");
      toast({
        title: "Call Ended",
        description: "Call has been disconnected",
      });
      
      // Stop any audio playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.srcObject = null;
        audioRef.current.src = '';
      }
      
    } catch (error) {
      console.error("Error disconnecting call:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect call properly",
        variant: "destructive",
      });
    } finally {
      // Always update UI state regardless of server response
      setIsConnected(false);
      setIsMuted(false);
    }
  };

  const toggleMute = async () => {
    try {
      // Get the voice endpoint URL
      const voiceEndpoint = import.meta.env.VITE_NGROK_VOICE_URL || 
                          localStorage.getItem('twilioNgrokVoiceUrl') || 
                          '/api/twilio-call';
      
      console.log("Toggling mute using endpoint:", `${voiceEndpoint}/mute`);
      
      // Check if the voice endpoint is a cross-origin URL (different domain)
      const isCrossOrigin = voiceEndpoint.startsWith('http') && 
                           !voiceEndpoint.includes(window.location.hostname);
      
      // Also mute the local audio element if it exists
      if (audioRef.current) {
        audioRef.current.muted = !isMuted;
      }
      
      const response = await fetch(`${voiceEndpoint}/mute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add mode: 'cors' for cross-origin requests
        ...(isCrossOrigin ? { mode: 'cors' } : {}),
        body: JSON.stringify({ 
          muted: !isMuted,
          identity: "customer-service-agent"
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to toggle mute");
      }
      
      setIsMuted(!isMuted);
      toast({
        title: isMuted ? "Microphone Unmuted" : "Microphone Muted",
        description: isMuted ? "Others can hear you now" : "You are now muted",
      });
      
    } catch (error) {
      console.error("Error toggling mute:", error);
      toast({
        title: "Error",
        description: "Failed to toggle mute",
        variant: "destructive",
      });
    }
  };

  return {
    isConnected,
    isConnecting,
    isMuted,
    makeCall,
    disconnectCall,
    toggleMute
  };
};
