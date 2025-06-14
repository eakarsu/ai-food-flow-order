import { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Device, Call } from '@twilio/voice-sdk';
import { Capacitor } from '@capacitor/core';
import { VoiceRecorder } from 'capacitor-voice-recorder'; 

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

  // Main function to handle call flow: get token, get permissions, make call
  const makeCall = async () => {
    console.log("Starting call process...");

    // Step 1: Validate phone number
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

      // Step 2: Get access token from API first
      console.log("Step 1: Fetching access token from API...");
      const tokenUrl = 'https://api.orderlybite.com/token';

      let token;
      try {
        const tokenResponse = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          body: JSON.stringify({ identity: "customer-service-agent" }),
        });

        if (!tokenResponse.ok) {
          console.error(`Token endpoint returned status: ${tokenResponse.status}`);
          throw new Error(`Token service unavailable (${tokenResponse.status})`);
        }

        const tokenData = await tokenResponse.json();
        token = tokenData.token;

        if (!token) {
          console.error("Token endpoint response:", tokenData);
          throw new Error("Invalid token received from server");
        }

        console.log("✓ Access token received successfully");
      } catch (fetchError) {
        console.error("Token fetch failed:", fetchError);

        toast({
          title: "Voice Service Unavailable",
          description: "Cannot connect to voice service. Redirecting to phone call...",
          variant: "destructive",
        });

        // Fallback to regular phone call
        setTimeout(() => {
          window.open(`tel:${phoneNumber}`, '_self');
        }, 2000);

        setIsConnecting(false);
        return;
      }

      // Step 3: Handle device-specific permissions
      console.log("Step 2: Checking device permissions...");

      // iOS/Android-specific permission handling
      if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
        // Check if the device can record
        const canRecordResult = await VoiceRecorder.canDeviceVoiceRecord();
        if (!canRecordResult.value) {
          toast({
            title: "Device Error",
            description: "This device cannot record audio.",
            variant: "destructive",
          });
          console.error('Device cannot record audio.');
          setIsConnecting(false);
          return;
        }

        // Check current permission status
        const permissionStatus = await VoiceRecorder.hasAudioRecordingPermission();
        if (!permissionStatus.value) {
          // Request permission using the plugin
          const requestResult = await VoiceRecorder.requestAudioRecordingPermission();
          if (!requestResult.value) {
            toast({
              title: "Permission Required",
              description: "Microphone permission is required to make calls. Please grant permission.",
              variant: "destructive",
            });
            console.error('Microphone permission denied by user.');
            setIsConnecting(false);
            return;
          }
          console.log('✓ Microphone permission granted via plugin.');
        } else {
          console.log('✓ Microphone permission already granted.');
        }
      }

      // Step 4: Check browser audio permissions
      console.log("Step 3: Requesting browser microphone permissions...");
      try {
        // Request microphone permission which is needed for calls
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        console.log("✓ Browser microphone permission granted");

        // Stop the stream immediately as we just needed the permission
        stream.getTracks().forEach(track => track.stop());
      } catch (permissionError) {
        console.error("Browser microphone permission denied:", permissionError);

        // Check if we're in an embedded iframe context
        const isEmbedded = window.self !== window.top;

        // Provide more specific error handling
        let errorTitle = "Microphone Access Required";
        let errorMessage = "";

        if (permissionError.name === 'NotAllowedError') {
          errorMessage = isEmbedded 
            ? "Microphone access denied. Try opening this page in a new tab/window."
            : "Microphone access denied. Click the microphone icon in your browser's address bar and select 'Allow'.";
        } else if (permissionError.name === 'NotFoundError') {
          errorMessage = "No microphone found. Please connect a microphone and try again.";
        } else if (permissionError.name === 'NotSupportedError') {
          errorMessage = "Microphone access not supported in this browser.";
        } else {
          errorMessage = "Unable to access microphone. Please check your browser settings.";
        }

        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
        setIsConnecting(false);
        return;
      }

      // Step 5: Initialize Twilio Device with the token
      console.log("Step 4: Initializing Twilio Device with access token...");
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

      console.log("✓ Twilio Device registered successfully");
      console.log("Step 5: Initiating call to:", phoneNumber);

      // Make the call with proper types
      const call = await device.connect({
        params: {
          To: phoneNumber
        }
      });

      console.log("✓ Call initiated successfully");

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