
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
      
      // Check if response is likely XML (error page) or JSON
      let responseData;
      if (responseText.trim().startsWith('<?xml') || responseText.trim().startsWith('<html')) {
        // This is an HTML/XML error page, not JSON
        throw new Error(`Server returned an error page. Status: ${response.status}. This usually means the SMS endpoint URL is incorrect or the server is not configured properly.`);
      }
      
      // Try to parse as JSON
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        throw new Error(`Invalid response format from SMS endpoint. Expected JSON but got: ${responseText.substring(0, 100)}...`);
      }
      
      // Check if the request was successful
      if (!response.ok) {
        const errorMessage = responseData.message || responseData.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
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
          timestamp: Date.now() + 1000,
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
