
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { formatPhoneNumber } from '@/utils/phoneNumberFormat';

interface Message {
  text: string;
  timestamp: number; // Unix timestamp
  status: 'sent' | 'received' | 'failed';
}

interface UseSendSMSProps {
  phoneNumber: string;
}

export const useSendSMS = ({ phoneNumber }: UseSendSMSProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [messageHistory, setMessageHistory] = useState<Message[]>(() => {
    // Try to load message history from localStorage
    const savedHistory = localStorage.getItem(`sms_history_${phoneNumber}`);
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  
  // Update localStorage when message history changes
  useEffect(() => {
    if (messageHistory.length > 0) {
      localStorage.setItem(`sms_history_${phoneNumber}`, JSON.stringify(messageHistory));
    }
  }, [messageHistory, phoneNumber]);
  
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
      
      // Format phone number and message as form data
      const formData = new URLSearchParams();
      formData.append('From', phoneNumber); // or formattedPhone
      formData.append('To', phoneNumber);   // or the recipient number
      formData.append('Body', message);
      formData.append('MessageSid', 'SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'); // or generate as needed

      const response = await fetch(smsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send SMS');
      }
      
      const responseData = await response.json();
      console.log("SMS sent successfully:", responseData);
      
      // Add message to history
      const newSentMessage: Message = {
        text: message,
        timestamp: Date.now(),
        status: 'sent'
      };
      
      setMessageHistory(prev => [...prev, newSentMessage]);
      
      // If there's a response message in the data, add it to history
      if (responseData && responseData.message) {
        const responseMessage: Message = {
          text: responseData.message,
          timestamp: Date.now() + 1000, // Add 1 second to ensure it appears after sent message
          status: 'received'
        };
        setMessageHistory(prev => [...prev, responseMessage]);
      }
      
      toast({
        title: "Message Sent",
        description: `SMS sent to ${formattedPhone}`,
      });
      
      return true;
    } catch (error) {
      console.error("SMS Error:", error);
      
      // Add failed message to history
      const newMessage: Message = {
        text: message,
        timestamp: Date.now(),
        status: 'failed'
      };
      
      setMessageHistory(prev => [...prev, newMessage]);
      
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

  const clearHistory = () => {
    setMessageHistory([]);
    localStorage.removeItem(`sms_history_${phoneNumber}`);
    toast({
      title: "Message History Cleared",
      description: "Your message history has been cleared."
    });
  };

  return {
    loading,
    messageHistory,
    sendSMS,
    clearHistory
  };
};
