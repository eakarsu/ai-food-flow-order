import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, Phone, Settings, Trash2 } from "lucide-react";
import MessageForm from './MessageForm';
import CallForm from './CallForm';
import TwilioSoftphone from './TwilioSoftphone';
import { useSendSMS } from '@/hooks/useSendSMS';

const TwilioContact = () => {
  const [phoneNumber, setPhoneNumber] = useState('+18001234567');
  const [activeMode, setActiveMode] = useState<'sms' | 'call' | null>('sms');
  const [showSoftphone, setShowSoftphone] = useState(false);
  const { messageHistory, clearHistory } = useSendSMS({ phoneNumber });

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
          {/* Food Order Communications Section */}
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-food-primary" />
                  <h3 className="text-lg font-semibold text-food-primary">Food Order Communications</h3>
                </div>
                <Settings className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-6">Send SMS or call about your food order</p>
      
              {/* Tab Selection */}
              <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveMode('sms');
                  }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeMode === 'sms'
                      ? 'bg-food-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MessageSquare className="h-4 w-4 inline mr-2" />
                  Send SMS
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveMode('call');
                    setShowSoftphone(true);
                  }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeMode === 'call'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Phone className="h-4 w-4 inline mr-2" />
                  Make Call
                </Button>
              </div>
      
              {/* Phone Number Input */}
              <div className="space-y-2 mb-6">
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
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Message History</h4>
                  <Button
                    onClick={() => clearHistory()}
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {messageHistory.length === 0 ? (
                    <p className="text-gray-500 text-sm">No messages yet</p>
                  ) : (
                    messageHistory.map((msg, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          msg.status === 'sent' 
                            ? 'bg-red-100 text-right' 
                            : msg.status === 'received'
                            ? 'bg-blue-100 text-left'
                            : 'bg-gray-100 text-right'
                        }`}
                      >
                        <div className="text-sm">
                          <span className="font-medium">
                            {msg.status === 'sent' ? 'You:' : 'Response:'}
                          </span>
                          <span className="float-right text-xs text-gray-500 ml-2">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        <div className="mt-1">{msg.text}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
      
              {/* Tab Content */}
              {activeMode === 'sms' && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Your Message</h4>
                  <MessageForm 
                    phoneNumber={phoneNumber}
                    onMessageSent={handleMessageSent}
                  />
                </div>
              )}
              {activeMode === 'call' && <CallForm />}
            </CardContent>
          </Card>
      
          {/* Twilio Softphone for calls */}
          <TwilioSoftphone
            phoneNumber={phoneNumber}
            open={showSoftphone}
            onOpenChange={setShowSoftphone}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TwilioContact;