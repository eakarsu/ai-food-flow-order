
import { useState, useEffect, useCallback } from 'react';
import { Phone, MessageSquare, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import MessageForm from './MessageForm';
import CallForm from './CallForm';
import TwilioSoftphone from './TwilioSoftphone';
import NgrokSettings from './NgrokSettings';

const TwilioContact = () => {
  console.log("TwilioContact: Starting component render");
  
  // Initialize with a default value that is synchronized with localStorage
  const [phoneNumber, setPhoneNumber] = useState(() => {
    const stored = localStorage.getItem('lastPhoneNumber') || "+18001234567";
    console.log("TwilioContact: Initializing with stored phone:", stored);
    return stored;
  });
  
  const [activeTab, setActiveTab] = useState("sms");
  const [softphoneOpen, setSoftphoneOpen] = useState(false);
  const [ngrokSettingsOpen, setNgrokSettingsOpen] = useState(false);
  
  // Function to update phone number both in state and localStorage
  const handleSetPhoneNumber = useCallback((value: string) => {
    // Ensure we always have a value by providing a default
    const numberToUse = value && value.trim() !== '' ? value : "+18001234567";
    
    console.log("TwilioContact: Setting phone number to:", numberToUse);
    
    // Update state
    setPhoneNumber(numberToUse);
    
    // Store in localStorage for persistence
    localStorage.setItem('lastPhoneNumber', numberToUse);
    console.log("TwilioContact: Saved to localStorage:", numberToUse);
  }, []);

  // Debug logging and initialize with default if needed
  useEffect(() => {
    console.log("TwilioContact: Component mounted");
    console.log("TwilioContact: Initial phoneNumber state:", phoneNumber);
    
    // Force default if phone number is empty
    if (!phoneNumber || phoneNumber.trim() === '') {
      const defaultPhone = "+18001234567";
      console.log("TwilioContact: Using default phone:", defaultPhone);
      setPhoneNumber(defaultPhone);
      localStorage.setItem('lastPhoneNumber', defaultPhone);
    }
    
    // Log environment variables for debugging
    console.log("TwilioContact: Environment variables check");
    if (import.meta.env.VITE_NGROK_VOICE_URL) {
      console.log("VITE_NGROK_VOICE_URL is set");
    } else {
      console.log("VITE_NGROK_VOICE_URL is not set");
    }
    
    if (import.meta.env.VITE_NGROK_SMS_URL) {
      console.log("VITE_NGROK_SMS_URL is set");
    } else {
      console.log("VITE_NGROK_SMS_URL is not set");
    }
  }, []);

  // Debug when phoneNumber changes
  useEffect(() => {
    console.log("TwilioContact: phoneNumber state changed to:", phoneNumber);
  }, [phoneNumber]);

  const handleMakeCall = () => {
    const phoneToUse = phoneNumber || localStorage.getItem('lastPhoneNumber') || "+18001234567";
    console.log("TwilioContact: handleMakeCall with phoneNumber:", phoneToUse);
    
    // Set default if empty before proceeding
    if (!phoneNumber || phoneNumber.trim() === '') {
      setPhoneNumber(phoneToUse);
    }
    
    setSoftphoneOpen(true);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    console.log("TwilioContact: Tab changed to:", value);
  };

  return (
    <>
      <Card className="w-full mx-auto bg-white shadow-lg">
        <CardHeader className="bg-food-primary/10 rounded-t-lg">
          <div className="flex justify-between items-center">
            <CardTitle className="text-food-primary flex items-center">
              <Phone className="mr-2" size={20} />
              Food Order Communications
            </CardTitle>
            
            <Dialog open={ngrokSettingsOpen} onOpenChange={setNgrokSettingsOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-food-primary"
                >
                  <Settings size={16} />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Ngrok Settings</DialogTitle>
                </DialogHeader>
                <NgrokSettings />
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription className="text-gray-600">
            Send SMS or call about your food order
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs 
            defaultValue="sms" 
            className="w-full"
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="sms" className="flex items-center">
                <MessageSquare className="mr-2" size={16} />
                Send SMS
              </TabsTrigger>
              <TabsTrigger value="call" className="flex items-center">
                <Phone className="mr-2" size={16} />
                Make Call
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="sms">
              <MessageForm 
                phoneNumber={phoneNumber}
                setPhoneNumber={handleSetPhoneNumber}
              />
            </TabsContent>
            
            <TabsContent value="call">
              <CallForm 
                phoneNumber={phoneNumber}
                setPhoneNumber={handleSetPhoneNumber}
                handleMakeCall={handleMakeCall}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Softphone Dialog */}
      <TwilioSoftphone 
        phoneNumber={phoneNumber || "+18001234567"}
        open={softphoneOpen}
        onOpenChange={setSoftphoneOpen}
      />
    </>
  );
};

export default TwilioContact;
