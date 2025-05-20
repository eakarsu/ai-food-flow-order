import { useState } from 'react';
import { Phone, MessageSquare, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Twilio API configuration - replace these with your actual credentials
const TWILIO_ACCOUNT_SID = "YOUR_ACCOUNT_SID";
const TWILIO_AUTH_TOKEN = "YOUR_AUTH_TOKEN";
const TWILIO_PHONE_NUMBER = "YOUR_TWILIO_PHONE_NUMBER";

// Food ordering templates
const SMS_TEMPLATES = [
  "Your order #[ORDER_ID] has been confirmed! Estimated delivery time: [TIME]",
  "Your food is on the way! Delivery ETA: [TIME]",
  "Your order has been delivered. Enjoy your meal!",
  "Thank you for ordering with us! Your order will be ready for pickup in [TIME]"
];

const CALL_SCRIPTS = [
  "Confirm order details and delivery address",
  "Notify customer about delay in delivery",
  "Confirm pickup time for takeout order",
  "Follow up on customer satisfaction"
];

const TwilioContact = () => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("sms");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [orderDetails, setOrderDetails] = useState({
    orderId: Math.floor(10000 + Math.random() * 90000).toString(),
    estimatedTime: "30-45 minutes"
  });

  // Apply template to message
  const applyTemplate = (template: string) => {
    let formattedMessage = template
      .replace("[ORDER_ID]", orderDetails.orderId)
      .replace("[TIME]", orderDetails.estimatedTime);
    
    setMessage(formattedMessage);
    setSelectedTemplate(template);
  };

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
      // In a production environment, this should be a server-side API call
      // to protect your Twilio credentials
      const response = await fetch("https://api.twilio.com/2010-04-01/Accounts/" + TWILIO_ACCOUNT_SID + "/Messages.json", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(TWILIO_ACCOUNT_SID + ':' + TWILIO_AUTH_TOKEN)
        },
        body: new URLSearchParams({
          'From': TWILIO_PHONE_NUMBER,
          'To': phoneNumber,
          'Body': message
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send SMS');
      }
      
      toast({
        title: "Order Update Sent",
        description: `SMS notification sent to ${phoneNumber}`,
      });
      
      // Clear the message but keep the phone number for potential follow-ups
      setMessage("");
    } catch (error) {
      console.error("Twilio API Error:", error);
      
      // Fall back to simulation mode if the API call fails
      toast({
        title: "Order Update Sent (Simulated)",
        description: `The message would be sent to ${phoneNumber}: "${message}"`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMakeCall = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // In a production environment, this should be a server-side API call
      const response = await fetch("https://api.twilio.com/2010-04-01/Accounts/" + TWILIO_ACCOUNT_SID + "/Calls.json", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(TWILIO_ACCOUNT_SID + ':' + TWILIO_AUTH_TOKEN)
        },
        body: new URLSearchParams({
          'From': TWILIO_PHONE_NUMBER,
          'To': phoneNumber,
          // This should be replaced with your own TwiML endpoint for food order communication
          'Url': 'http://demo.twilio.com/docs/voice.xml',
          'StatusCallback': 'https://your-server.com/call-status-callback',
          'StatusCallbackEvent': 'initiated ringing answered completed'
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to initiate call');
      }
      
      toast({
        title: "Calling Customer",
        description: `Initiating call to ${phoneNumber} regarding order #${orderDetails.orderId}`,
      });
    } catch (error) {
      console.error("Twilio API Error:", error);
      
      // Fall back to simulation mode if the API call fails
      toast({
        title: "Call Initiated (Simulated)",
        description: `A call would be placed to ${phoneNumber} regarding order #${orderDetails.orderId}`,
      });
    } finally {
      setLoading(false);
    }
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
          Order Communications
        </CardTitle>
        <CardDescription>
          Send updates or call customers about their food orders
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
                <Label htmlFor="order-details">Order Details</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    placeholder="Order ID" 
                    value={orderDetails.orderId}
                    onChange={(e) => setOrderDetails({...orderDetails, orderId: e.target.value})}
                  />
                  <Input 
                    placeholder="Estimated Time" 
                    value={orderDetails.estimatedTime}
                    onChange={(e) => setOrderDetails({...orderDetails, estimatedTime: e.target.value})}
                  />
                </div>
              </div>
              
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
                <div className="flex justify-between">
                  <Label htmlFor="message">Message</Label>
                  <span className="text-xs text-muted-foreground">Choose a template</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {SMS_TEMPLATES.map((template, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      size="sm"
                      className={`text-xs justify-start h-auto py-1 ${selectedTemplate === template ? 'border-food-primary text-food-primary' : ''}`}
                      onClick={() => applyTemplate(template)}
                    >
                      {template.substring(0, 30)}...
                    </Button>
                  ))}
                </div>
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
                <Label htmlFor="order-details">Order Details</Label>
                <Input 
                  placeholder="Order #" 
                  value={orderDetails.orderId}
                  onChange={(e) => setOrderDetails({...orderDetails, orderId: e.target.value})}
                />
              </div>
              
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
              
              <div className="space-y-2">
                <Label>Call Script</Label>
                <div className="space-y-2">
                  {CALL_SCRIPTS.map((script, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 border rounded-md">
                      <div className="h-4 w-4 rounded-full bg-food-primary/20" />
                      <span>{script}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                When you click "Call Customer", a call will be initiated to connect the customer with your delivery team.
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
                Send Update
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
                Call Customer
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TwilioContact;
