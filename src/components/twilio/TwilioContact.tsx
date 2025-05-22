
import { useState } from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import MessageForm from './MessageForm';
import CallForm from './CallForm';
import TwilioSoftphone from './TwilioSoftphone';

const TwilioContact = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [activeTab, setActiveTab] = useState("sms");
  const [softphoneOpen, setSoftphoneOpen] = useState(false);

  const handleMakeCall = () => {
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
              <MessageForm 
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
              />
            </TabsContent>
            
            <TabsContent value="call">
              <CallForm 
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
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
