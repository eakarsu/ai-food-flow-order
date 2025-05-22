
import { useState, useEffect } from 'react';
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
  const [phoneNumber, setPhoneNumber] = useState("");
  const [activeTab, setActiveTab] = useState("sms");
  const [softphoneOpen, setSoftphoneOpen] = useState(false);
  const [ngrokSettingsOpen, setNgrokSettingsOpen] = useState(false);

  // Add debug logging
  useEffect(() => {
    console.log("TwilioContact: Current phoneNumber state:", phoneNumber);
    
    // Check if there's a stored phone number in localStorage that we can use
    const storedNumber = localStorage.getItem('lastPhoneNumber');
    console.log("TwilioContact: Stored phone number:", storedNumber);
    
    if (storedNumber && !phoneNumber) {
      console.log("TwilioContact: Setting phone number from storage");
      setPhoneNumber(storedNumber);
    }
    
    // Log environment variables for debugging (if any)
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
  }, [phoneNumber]);

  const handleMakeCall = () => {
    // Save the phone number for future use
    if (phoneNumber) {
      localStorage.setItem('lastPhoneNumber', phoneNumber);
    }
    setSoftphoneOpen(true);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
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
                setPhoneNumber={(value) => {
                  console.log("TwilioContact: Setting phone number to:", value);
                  setPhoneNumber(value);
                  if (value) {
                    localStorage.setItem('lastPhoneNumber', value);
                  }
                }}
              />
            </TabsContent>
            
            <TabsContent value="call">
              <CallForm 
                phoneNumber={phoneNumber}
                setPhoneNumber={(value) => {
                  console.log("TwilioContact: Setting phone number to:", value);
                  setPhoneNumber(value);
                  if (value) {
                    localStorage.setItem('lastPhoneNumber', value);
                  }
                }}
                handleMakeCall={handleMakeCall}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Softphone Dialog */}
      <TwilioSoftphone 
        phoneNumber={phoneNumber}
        open={softphoneOpen}
        onOpenChange={setSoftphoneOpen}
      />
    </>
  );
};

export default TwilioContact;
