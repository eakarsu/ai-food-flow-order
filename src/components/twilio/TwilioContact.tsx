import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, MessageSquare, Trash2, Settings } from "lucide-react";
import MessageForm from './MessageForm';
import CallForm from './CallForm';

const TwilioContact = () => {
  const [activeTab, setActiveTab] = useState<'sms' | 'call'>('sms');
  const [phoneNumber, setPhoneNumber] = useState('+18001234567');
  const [messageHistory, setMessageHistory] = useState([
    {
      type: 'outgoing' as const,
      message: 'hello',
      timestamp: '22:51'
    },
    {
      type: 'incoming' as const,
      message: 'Hello! What would you like to order today?',
      timestamp: '22:51'
    }
  ]);

  const handleMessageSent = (message: string) => {
    const newMessage = {
      type: 'outgoing' as const,
      message,
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
    setMessageHistory(prev => [...prev, newMessage]);
  };

  const clearHistory = () => {
    setMessageHistory([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-food-primary">
            Contact Us Directly
          </CardTitle>
          <p className="text-center text-gray-600">
            Place your order or inquire about our daily specials
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Food Order Communications Header */}
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-red-700">Food Order Communications</h3>
                    <p className="text-sm text-red-600">Send SMS or call about your food order</p>
                  </div>
                </div>
                <Settings className="h-5 w-5 text-red-600" />
              </div>
            </CardContent>
          </Card>

          {/* Tab Selection */}
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={activeTab === 'sms' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('sms')}
              className={`flex-1 ${activeTab === 'sms' ? 'bg-white shadow-sm' : ''}`}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Send SMS
            </Button>
            <Button
              variant={activeTab === 'call' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('call')}
              className={`flex-1 ${activeTab === 'call' ? 'bg-white shadow-sm' : ''}`}
            >
              <Phone className="h-4 w-4 mr-2" />
              Make Call
            </Button>
          </div>

          {/* Phone Number Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Customer Phone Number
            </label>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Using phone number: {phoneNumber}
            </p>
          </div>

          {/* Message History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Message History</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                className="flex items-center space-x-1"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear</span>
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {messageHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    msg.type === 'outgoing' 
                      ? 'bg-red-50 border-l-4 border-red-200' 
                      : 'bg-blue-50 border-l-4 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {msg.type === 'outgoing' ? 'You:' : 'Response:'}
                      </p>
                      <p className="text-gray-800">{msg.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Form */}
          {activeTab === 'sms' ? (
            <MessageForm 
              phoneNumber={phoneNumber} 
              onMessageSent={handleMessageSent}
            />
          ) : (
            <CallForm 
              phoneNumber={phoneNumber} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TwilioContact;