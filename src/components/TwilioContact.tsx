
import { useState } from 'react';
import { Phone, MessageSquare, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import TwilioSoftphone from './TwilioSoftphone';

// Twilio configuration - replace with your actual credentials
const TWILIO_PHONE_NUMBER = "+18043601129"; // Your Twilio phone number

const TwilioContact = () => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("sms");
  const [softphoneOpen, setSoftphoneOpen] = useState(false);

  const handleSendSMS = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

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
      // Call your secure backend endpoint that handles Twilio SMS sending
      const response = await fetch("/api/send-sms", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          body: message
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send SMS');
      }
      
      const result = await response.json();
      
      toast({
        title: "Message Sent",
        description: `SMS sent to ${phoneNumber}`,
      });
      
      setMessage("");
    } catch (error) {
      console.error("SMS Error:", error);
      
      toast({
        title: "Failed to Send Message",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMakeCall = () => {
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    // Open the softphone dialog
    setSoftphoneOpen(true);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="bg-food-primary/10 rounded-t-lg">
          <CardTitle className="text-food-primary flex items-center">
            <Phone className="mr-2" size={20} />
            Food Order Communications
          </CardTitle>
          <CardDescription>
            Send SMS or call about your food order
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-sms">Customer Phone Number</Label>
                  <Input 
                    id="phone-sms"
                    type="tel" 
                    placeholder="+1 (555) 123-4567" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message"
                    placeholder="Enter your message here..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="call">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-call">Customer Phone Number</Label>
                  <Input 
                    id="phone-call"
                    type="tel" 
                    placeholder="+1 (555) 123-4567" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                
                <p className="text-sm text-gray-500 mt-4">
                  Click the "Call Customer" button to initiate a browser-based call using Twilio's Voice SDK.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
          {activeTab === "sms" ? (
            <Button 
              onClick={handleSendSMS} 
              disabled={loading}
              className="bg-food-primary hover:bg-food-primary/90"
            >
              {loading ? "Sending..." : (
                <>
                  <Send className="mr-2" size={16} />
                  Send Message
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleMakeCall} 
              disabled={loading}
              className="bg-food-primary hover:bg-food-primary/90"
            >
              <Phone className="mr-2" size={16} />
              Call Customer
            </Button>
          )}
        </CardFooter>
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
