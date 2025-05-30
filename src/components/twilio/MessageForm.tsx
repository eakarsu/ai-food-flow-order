
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageTextarea } from './MessageTextarea';
import { Trash2 } from 'lucide-react';
import { useSendSMS } from '@/hooks/useSendSMS';

export const MessageForm = () => {
  const [phoneNumber, setPhoneNumber] = useState('+18001234567');
  const [messageHistory, setMessageHistory] = useState([
    {
      message: 'hello',
      sender: 'You',
      timestamp: '22:51'
    },
    {
      message: 'Hello! What would you like to order today?',
      sender: 'Response',
      timestamp: '22:51'
    }
  ]);

  const { sendSMS, isSending } = useSendSMS();

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message to history
    const newMessage = {
      message: message.trim(),
      sender: 'You',
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
    
    setMessageHistory(prev => [...prev, newMessage]);

    try {
      await sendSMS(phoneNumber, message.trim());
      
      // Simulate response (in real app, this would come from webhook)
      setTimeout(() => {
        const response = {
          message: "Thank you for your message! We'll get back to you shortly.",
          sender: 'Response',
          timestamp: new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        };
        setMessageHistory(prev => [...prev, response]);
      }, 1000);
    } catch (error) {
      console.error('Failed to send SMS:', error);
    }
  };

  const clearHistory = () => {
    setMessageHistory([]);
  };

  return (
    <div className="space-y-4">
      {/* Phone Number Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Customer Phone Number
        </label>
        <Input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+1234567890"
          className="w-full"
        />
        <p className="text-sm text-gray-500 mt-1">
          Using phone number: {phoneNumber}
        </p>
      </div>

      {/* Message History */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Message History</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-gray-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {messageHistory.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                msg.sender === 'You'
                  ? 'bg-red-100 text-red-900 ml-8'
                  : 'bg-blue-100 text-blue-900 mr-8'
              }`}
            >
              <div className="text-sm font-medium mb-1">
                {msg.sender}: <span className="float-right text-xs opacity-70">{msg.timestamp}</span>
              </div>
              <div className="text-sm">{msg.message}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <MessageTextarea 
        onSendMessage={handleSendMessage}
        isLoading={isSending}
      />
    </div>
  );
};
