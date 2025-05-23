import { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Device, Call } from '@twilio/voice-sdk';

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
  const deviceRef = useRef<Device | null>(null);
  const callRef = useRef<Call | null>(null);
  
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
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Phone number is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsConnecting(true);
      
      // Get the voice endpoint URL from environment variable or from localStorage
      const baseEndpoint = import.meta.env.VITE_NGROK_VOICE_URL || 
                          localStorage.getItem('twilioNgrokVoiceUrl') || 
                          'https://api.orderlybite.com';
      
      // Get token URL from environment variable or use default constructed from baseEndpoint
      const tokenUrl = import.meta.env.VITE_TOKEN_URL || 
                      `${baseEndpoint}/token`;
      
      const voiceEndpoint = `${baseEndpoint}`;
      
      console.log("Calling voice endpoint:", voiceEndpoint);
      console.log("Using token URL:", tokenUrl);
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
      
      // Fetch token from the token endpoint
      console.log("Fetching token from:", tokenUrl);
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        ...(isCrossOrigin ? { mode: 'cors' } : {}),
        body: JSON.stringify({ identity: "customer-service-agent" }),
      });
      
      if (!tokenResponse.ok) {
        throw new Error(`Failed to get token. Status: ${tokenResponse.status}`);
      }
      
      const tokenData = await tokenResponse.json();
      const token = tokenData.token;
      
      if (!token) {
        throw new Error("Token endpoint did not return a valid token");
      }
      
      console.log("Token received successfully");
      
      // Initialize Twilio Device with the token
      if (deviceRef.current) {
        // Destroy existing device if it exists
        try {
          deviceRef.current.destroy();
        } catch (e) {
          console.error("Error destroying existing device:", e);
        }
        deviceRef.current = null;
      }
      
      // Create device with appropriate type settings
      const device = new Device(token, {
        // Limit type to what's in the Device interface
      });
      
      // Listen for device events
      device.on('ready', () => {
        console.log("Twilio Device ready");
      });
      
      device.on('error', (twilioError) => {
        console.error("Twilio Device error:", twilioError);
        toast({
          title: "Twilio Device Error",
          description: twilioError.message || "An error occurred with the call device",
          variant: "destructive",
        });
      });
      
      // Register the device
      await device.register();
      deviceRef.current = device;
      
      console.log("Device registered, making call to:", phoneNumber);
      
      // Make the call with proper types
      const call = await device.connect({
        params: {
          To: phoneNumber
        }
      });
      
      // Store the call reference
      callRef.current = call;
      
      // Set up call event listeners
      call.on('accept', () => {
        console.log("Call accepted");
        setIsConnected(true);
        setIsConnecting(false);
        toast({
          title: "Call Connected",
          description: `Connected to ${phoneNumber}`,
        });
      });
      
      call.on('disconnect', () => {
        console.log("Call disconnected");
        setIsConnected(false);
        setIsConnecting(false);
        setIsMuted(false);
        toast({
          title: "Call Ended",
          description: "Call has been disconnected",
        });
      });
      
      call.on('error', (callError) => {
        console.error("Call error:", callError);
        setIsConnected(false);
        setIsConnecting(false);
        toast({
          title: "Call Error",
          description: callError.message || "An error occurred during the call",
          variant: "destructive",
        });
      });
      
      // Create audio context for playing a dial tone as feedback
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const audioContext = new AudioContext();
          
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
            oscillator.disconnect();
            gainNode.disconnect();
          }, 1000);
          
          console.log("Playing dial tone as audio feedback");
        }
      } catch (audioError) {
        console.error("AudioContext initialization failed:", audioError);
      }
      
    } catch (error) {
      console.error("Error making call:", error);
      
      let errorMessage = error instanceof Error ? error.message : "Failed to connect call";
      
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        errorMessage = "Cannot connect to voice server. This may be due to CORS restrictions. Please ensure your server allows cross-origin requests.";
      }
      
      toast({
        title: "Call Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      setIsConnected(false);
      setIsConnecting(false);
    }
  };

  const disconnectCall = async () => {
    try {
      if (callRef.current) {
        console.log("Disconnecting active call");
        callRef.current.disconnect();
        callRef.current = null;
      } else {
        console.log("No active call to disconnect");
      }
      
      // Destroy the device
      if (deviceRef.current) {
        console.log("Unregistering device");
        try {
          deviceRef.current.destroy();
          deviceRef.current = null;
        } catch (e) {
          console.error("Error destroying device:", e);
        }
      }
      
      console.log("Call disconnected successfully");
      
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
      if (!callRef.current) {
        console.log("No active call to mute/unmute");
        return;
      }
      
      const newMuteState = !isMuted;
      console.log(`Setting mute state to: ${newMuteState}`);
      
      // Use mute() with boolean parameter
      callRef.current.mute(newMuteState);
      
      setIsMuted(newMuteState);
      toast({
        title: newMuteState ? "Microphone Muted" : "Microphone Unmuted",
        description: newMuteState ? "You are now muted" : "Others can hear you now",
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
