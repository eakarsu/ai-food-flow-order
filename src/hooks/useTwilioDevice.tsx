import { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Device, Call } from '@twilio/voice-sdk';
import { Capacitor } from '@capacitor/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';

interface UseTwilioDeviceProps {
  open: boolean;
  phoneNumber: string;
}

// Helper function to get available audio devices
const getAudioDevices = async (): Promise<{ inputDevice: string | null; outputDevice: string | null }> => {
  try {
    // First request permission to enumerate devices properly
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());

    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log("Available audio devices:", devices);

    const audioInputs = devices.filter(d => d.kind === 'audioinput');
    const audioOutputs = devices.filter(d => d.kind === 'audiooutput');

    console.log("Audio inputs:", audioInputs.map(d => ({ id: d.deviceId, label: d.label })));
    console.log("Audio outputs:", audioOutputs.map(d => ({ id: d.deviceId, label: d.label })));

    // Get the first available device that's not "default" (to avoid the "default" device issue)
    let inputDevice: string | null = null;
    let outputDevice: string | null = null;

    // Try to find a real device (not "default" or "communications")
    for (const input of audioInputs) {
      if (input.deviceId && input.deviceId !== 'default' && input.deviceId !== 'communications') {
        inputDevice = input.deviceId;
        console.log("Selected input device:", input.label || input.deviceId);
        break;
      }
    }

    // If no non-default device found, use the first available
    if (!inputDevice && audioInputs.length > 0) {
      inputDevice = audioInputs[0].deviceId;
      console.log("Using first available input device:", audioInputs[0].label || audioInputs[0].deviceId);
    }

    for (const output of audioOutputs) {
      if (output.deviceId && output.deviceId !== 'default' && output.deviceId !== 'communications') {
        outputDevice = output.deviceId;
        console.log("Selected output device:", output.label || output.deviceId);
        break;
      }
    }

    // If no non-default device found, use the first available
    if (!outputDevice && audioOutputs.length > 0) {
      outputDevice = audioOutputs[0].deviceId;
      console.log("Using first available output device:", audioOutputs[0].label || audioOutputs[0].deviceId);
    }

    return { inputDevice, outputDevice };
  } catch (error) {
    console.error("Error enumerating audio devices:", error);
    return { inputDevice: null, outputDevice: null };
  }
};

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

    // iOS-specific permission handling
    if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
      // Check if the device can record (optional but good practice)
      const canRecordResult = await VoiceRecorder.canDeviceVoiceRecord();
      if (!canRecordResult.value) {
        alert('This device cannot record audio.');
        console.error('Device cannot record audio.');
        return; // Stop if no recording capability
      }

      // Check current permission status
      const permissionStatus = await VoiceRecorder.hasAudioRecordingPermission();
      if (!permissionStatus.value) {
        // Request permission using the plugin
        const requestResult = await VoiceRecorder.requestAudioRecordingPermission();
        if (!requestResult.value) {
          alert('Microphone permission is required to make calls. Please grant permission.');
          console.error('Microphone permission denied by user.');
          return; // Stop if permission denied
        }
        console.log('Microphone permission granted via plugin.');
      } else {
        console.log('Microphone permission already granted.');
      }
    }



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
                          'http://localhost:3001/api/voice';

      // Get token URL from environment variable or use default constructed from baseEndpoint
      const tokenUrl = import.meta.env.VITE_TOKEN_URL ||
                      'http://localhost:3001/api/twilio-token';
      
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
          'ngrok-skip-browser-warning': 'true', // Skip ngrok interstitial page
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
      
      // Get available audio devices
      const { inputDevice, outputDevice } = await getAudioDevices();
      console.log("Using audio devices - Input:", inputDevice, "Output:", outputDevice);

      // Create device with audio device settings
      const deviceOptions: any = {
        logLevel: 1, // Enable logging for debugging
        codecPreferences: ['opus', 'pcmu'] as any,
      };

      // If we have a specific input device, set it
      if (inputDevice) {
        deviceOptions.edge = 'ashburn'; // Use closest edge location
      }

      const device = new Device(token, deviceOptions);

      // Listen for device events
      device.on('registered', () => {
        console.log("Twilio Device registered and ready");
      });

      device.on('unregistered', () => {
        console.log("Twilio Device unregistered");
      });

      device.on('error', (twilioError) => {
        console.error("Twilio Device error:", twilioError);
        toast({
          title: "Twilio Device Error",
          description: twilioError.message || "An error occurred with the call device",
          variant: "destructive",
        });
      });

      // Set audio devices before registering
      if (inputDevice || outputDevice) {
        try {
          const audioHelper = device.audio;
          if (audioHelper) {
            console.log("Setting up audio devices...");

            // Set speaker device if available
            if (outputDevice && typeof audioHelper.speakerDevices?.set === 'function') {
              await audioHelper.speakerDevices.set(outputDevice);
              console.log("Speaker device set:", outputDevice);
            }

            // Set ringtone device if available
            if (outputDevice && typeof audioHelper.ringtoneDevices?.set === 'function') {
              await audioHelper.ringtoneDevices.set(outputDevice);
              console.log("Ringtone device set:", outputDevice);
            }
          }
        } catch (audioSetupError) {
          console.warn("Could not set audio devices, using defaults:", audioSetupError);
        }
      }

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

        // Ensure audio is playing - the Twilio SDK handles this, but we can help
        try {
          // Access the audio helper to ensure audio is properly routed
          const audioHelper = deviceRef.current?.audio;
          if (audioHelper) {
            console.log("Audio helper available, checking audio output...");

            // Get available output devices
            const speakerDevices = audioHelper.speakerDevices?.get?.();
            console.log("Current speaker devices:", speakerDevices);

            // Ensure audio is not muted
            if (audioHelper.outgoing) {
              console.log("Outgoing audio available");
            }
            if (audioHelper.incoming) {
              console.log("Incoming audio available");
            }
          }

          // Also try to get the remote audio stream from the call
          const remoteStream = (call as any).getRemoteStream?.();
          if (remoteStream && audioRef.current) {
            console.log("Setting remote stream to audio element");
            audioRef.current.srcObject = remoteStream;
            audioRef.current.play().catch(e => console.error("Error playing audio:", e));
          }
        } catch (audioError) {
          console.warn("Audio setup after accept:", audioError);
        }

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

      // Monitor volume to help debug audio issues
      call.on('volume', (inputVolume: number, outputVolume: number) => {
        // Log occasionally to avoid flooding console
        if (Math.random() < 0.1) { // Log 10% of volume events
          console.log(`Audio levels - Input: ${(inputVolume * 100).toFixed(0)}%, Output: ${(outputVolume * 100).toFixed(0)}%`);
        }
      });

      // Listen for reconnecting/reconnected events
      call.on('reconnecting', (twilioError: any) => {
        console.warn("Call reconnecting:", twilioError);
        toast({
          title: "Reconnecting",
          description: "Call connection interrupted, attempting to reconnect...",
        });
      });

      call.on('reconnected', () => {
        console.log("Call reconnected successfully");
        toast({
          title: "Reconnected",
          description: "Call connection restored",
        });
      });

      // Log when call is ringing
      call.on('ringing', (hasEarlyMedia: boolean) => {
        console.log("Call is ringing, hasEarlyMedia:", hasEarlyMedia);
        if (hasEarlyMedia) {
          console.log("Early media available - you should hear ringing");
        }
      });
      
      // Note: Removed simulated dial tone - using actual Twilio early media/ringing instead
      console.log("Call initiated, waiting for connection...");
      
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
