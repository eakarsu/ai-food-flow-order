
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { formatPhoneNumber } from '@/utils/phoneNumberFormat';

interface UseSendSMSProps {
  phoneNumber: string;
}

export const useSendSMS = ({ phoneNumber }: UseSendSMSProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const sendSMS = async (message: string) => {
    if (!message) {
      toast({
        title: "Message required",
        description: "Please enter a message to send",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Format phone number before sending
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      // Get the SMS endpoint URL from environment variable or from localStorage
      const smsEndpoint = import.meta.env.VITE_NGROK_SMS_URL || 
                          localStorage.getItem('twilioNgrokSmsUrl') || 
                          '/api/send-sms';  // Fallback to default
      
      console.log("Using SMS endpoint:", smsEndpoint);
      
      // Check if the SMS endpoint is a cross-origin URL (different domain)
      const isCrossOrigin = smsEndpoint.startsWith('http') && 
                            !smsEndpoint.includes(window.location.hostname);
      
      if (isCrossOrigin) {
        console.log("Cross-origin request detected. Adding CORS mode.");
      }
      
      const response = await fetch(smsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add mode: 'cors' for cross-origin requests
        ...(isCrossOrigin ? { mode: 'cors' } : {}),
        body: JSON.stringify({
          to: formattedPhone,
          body: message
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send SMS');
      }
      
      const responseData = await response.json();
      console.log("SMS sent successfully:", responseData);
      
      toast({
        title: "Message Sent",
        description: `SMS sent to ${formattedPhone}`,
      });
      
      return true;
    } catch (error) {
      console.error("SMS Error:", error);
      
      // Provide more specific error message for CORS issues
      let errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        // This is likely a CORS error
        errorMessage = "Cannot connect to SMS server. This may be due to CORS restrictions. Please ensure your server allows cross-origin requests.";
        
        // Log helpful information for debugging
        console.log("Possible CORS issue detected. Check that your server has the following headers:");
        console.log("Access-Control-Allow-Origin: *");
        console.log("Access-Control-Allow-Methods: POST, OPTIONS");
        console.log("Access-Control-Allow-Headers: Content-Type");
      }
      
      toast({
        title: "Failed to Send Message",
        description: errorMessage,
        variant: "destructive"
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    sendSMS
  };
};
