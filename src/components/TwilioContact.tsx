
import { useState } from 'react';
import { Phone, MessageSquare, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const TwilioContact = () => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("sms");

  const handleSendSMS = () => {
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
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Feature Not Yet Implemented",
        description: "This would send an SMS via Twilio: \"" + message + "\" to " + phoneNumber,
      });
    }, 1500);
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

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Feature Not Yet Implemented",
        description: "This would initiate a Twilio call to " + phoneNumber,
      });
    }, 1500);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="bg-food-primary/10 rounded-t-lg">
        <CardTitle className="text-food-primary flex items-center">
          <Phone className="mr-2" size={20} />
          Twilio Contact
        </CardTitle>
        <CardDescription>
          Connect with customers via SMS or phone call
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
                <Label htmlFor="phone-sms">Phone Number</Label>
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
                <Label htmlFor="phone-call">Phone Number</Label>
                <Input 
                  id="phone-call"
                  type="tel" 
                  placeholder="+1 (555) 123-4567" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Click the button below to initiate a call to this number. Normal carrier charges may apply.
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
            {loading ? "Connecting..." : (
              <>
                <Phone className="mr-2" size={16} />
                Call Now
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TwilioContact;
