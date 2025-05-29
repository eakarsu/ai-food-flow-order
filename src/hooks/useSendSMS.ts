
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
      
      // Format phone number and message as form data
      const formData = new URLSearchParams();
      formData.append('From', phoneNumber);
      formData.append('To', phoneNumber);
      formData.append('Body', message);
      formData.append('MessageSid', 'SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');

      const response = await fetch(smsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
      
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      
      // Get response text first to check what we're dealing with
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Parse the response - could be XML (TwiML) or JSON
      let responseMessage = '';
      
      if (responseText.trim().startsWith('<?xml')) {
        // This is a TwiML XML response from Twilio
        console.log("Received TwiML XML response");
        
        // Extract message from XML if present
        const messageMatch = responseText.match(/<Message>(.*?)<\/Message>/);
        if (messageMatch) {
          responseMessage = messageMatch[1];
        }
      } else if (responseText.trim().startsWith('<html')) {
        // This is an HTML error page
        throw new Error(`Server returned an HTML error page. Status: ${response.status}. Please check your SMS endpoint configuration.`);
      } else {
        // Try to parse as JSON
        try {
          const responseData = responseText ? JSON.parse(responseText) : {};
          responseMessage = responseData.message || '';
        } catch (parseError) {
          console.error("Failed to parse response as JSON:", parseError);
          // If it's not XML or JSON, just use the raw text
          responseMessage = responseText.substring(0, 100);
        }
      }
      
      console.log("SMS sent successfully");
      
      // Add message to history
      const newSentMessage: Message = {
        text: message,
        timestamp: Date.now(),
        status: 'sent'
      };
      
      setMessageHistory(prev => [...prev, newSentMessage]);
      
      // If there's a response message, add it to history
      if (responseMessage) {
        const responseMsg: Message = {
          text: responseMessage,
          timestamp: Date.now() + 1000,
          status: 'received'
        };
        setMessageHistory(prev => [...prev, responseMsg]);
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
      
      // Provide more specific error messages
      let errorMessage = "An unknown error occurred";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        errorMessage = "Cannot connect to SMS server. Please check your SMS endpoint URL in the settings and ensure the server is running.";
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
