import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, Phone, Settings, Trash2 } from "lucide-react";
import { MessageForm } from './MessageForm';
import CallForm from './CallForm';
import { useSendSMS } from '@/hooks/useSendSMS';

const TwilioContact = () => {
  const [phoneNumber, setPhoneNumber] = useState('+18001234567');
  const [activeMode, setActiveMode] = useState<'sms' | 'call'>('sms');
  const { messageHistory, clearHistory } = useSendSMS(phoneNumber);

  const handleMessageSent = (message: string) => {
    // Message handling is now done in the useSendSMS hook
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
          {/* Communication Section */}
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Phone className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-red-800">Food Order Communications</h3>
              <Settings className="h-4 w-4 text-gray-500 ml-auto" />
            </div>
            <p className="text-gray-700 mb-4">Send SMS or call about your food order</p>

            {/* Mode Selection */}
            <div className="flex space-x-2 mb-4">
              <Button
                variant={activeMode === 'sms' ? 'default' : 'outline'}
                onClick={() => setActiveMode('sms')}
                className={`flex-1 ${activeMode === 'sms' ? 'bg-red-600 hover:bg-red-700' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Send SMS
              </Button>
              <Button
                variant={activeMode === 'call' ? 'default' : 'outline'}
                onClick={() => setActiveMode('call')}
                className={`flex-1 ${activeMode === 'call' ? 'bg-red-600 hover:bg-red-700' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
              >
                <Phone className="h-4 w-4 mr-2" />
                Make Call
              </Button>
            </div>
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
              className="font-mono"
            />
            <p className="text-sm text-gray-500">
              Using phone number: {phoneNumber}
            </p>
          </div>

          {/* Active Mode Content */}
          {activeMode === 'sms' && (
            <div className="space-y-4">
              {/* Message History */}
              {messageHistory.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">Message History</h4>
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
                  <div className="max-h-60 overflow-y-auto space-y-2 bg-gray-50 p-3 rounded-lg">
                    {messageHistory.map((msg, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded text-sm ${
                          msg.status === 'sent'
                            ? 'bg-red-100 text-red-800 ml-8'
                            : msg.status === 'received'
                            ? 'bg-blue-100 text-blue-800 mr-8'
                            : 'bg-gray-200 text-gray-600 ml-8'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-medium">
                            {msg.status === 'sent' ? 'You:' : 'Response:'}
                          </span>
                          <span className="text-xs opacity-75">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        <div>{msg.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Form */}
              <MessageForm 
                phoneNumber={phoneNumber}
                onMessageSent={handleMessageSent}
              />
            </div>
          )}

          {activeMode === 'call' && (
            <div className="space-y-4">
              <CallForm 
                phoneNumber={phoneNumber}
                onCallInitiated={() => console.log('Call initiated')}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TwilioContact;