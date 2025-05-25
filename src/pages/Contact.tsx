import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TwilioContact from '../components/TwilioContact';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Phone, Settings } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import NgrokSettings from '../components/twilio/NgrokSettings';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';

const Contact = () => {
  const { toast } = useToast();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  
  // Toggle admin mode when clicking 5 times on the footer
  const handleAdminClick = () => {
    setIsAdminMode(true);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "We've received your message and will get back to you soon!",
    });
  };
  
  const contactStructuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact OrderlyBite",
    "description": "Get in touch with OrderlyBite for support, questions, or to learn more about our AI-powered food ordering platform",
    "url": "https://orderlybite.com/contact"
  };
  
  return (
    <>
      <SEO
        title="Contact OrderlyBite - Get Support & Information"
        description="Contact OrderlyBite for support, questions, or to learn more about our AI-powered food ordering platform. Call +1 (804) 360-1129 or send a message."
        keywords="contact OrderlyBite, customer support, phone number, SMS ordering support, AI food ordering help"
        structuredData={contactStructuredData}
      />
      
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        
        <div className="bg-food-primary/10 py-10">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-food-dark mb-2">Contact Us</h1>
              <p className="text-gray-600 mb-2">We'd love to hear from you</p>
              <p className="flex items-center text-food-primary font-medium">
                <Phone size={16} className="mr-1" />
                +1 (804) 360-1129
              </p>
            </div>
            
            {isAdminMode && (
              <Dialog open={showAdminSettings} onOpenChange={setShowAdminSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-food-primary flex items-center">
                    <Settings size={16} className="mr-1" />
                    Twilio Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Twilio Ngrok Configuration</DialogTitle>
                  </DialogHeader>
                  <NgrokSettings />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs />
        </div>
        
        <main className="container mx-auto px-4 py-10 flex-grow">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-2xl font-bold text-food-dark mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <Input id="name" placeholder="Your name" />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input id="email" type="email" placeholder="your.email@example.com" />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <Input id="subject" placeholder="What is this regarding?" />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <Textarea id="message" placeholder="Your message..." className="min-h-[150px]" />
                </div>
                
                <Button type="submit" className="bg-food-primary hover:bg-food-primary/90 w-full">
                  Send Message
                </Button>
              </form>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-food-dark mb-6">Contact By Phone/SMS</h2>
              <TwilioContact />
              
              <div className="mt-10 bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-food-dark mb-4">Office Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="mr-3 text-food-primary">📍</span>
                    <span>2807 Hampton Woods Dr, Henrico, VA 23233</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-3 text-food-primary">📞</span>
                    <span onClick={handleAdminClick}>+1 (804) 360-1129</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-3 text-food-primary">📧</span>
                    <span>support@orderlybite.com</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-3 text-food-primary">🕒</span>
                    <span>Monday-Friday: 9am-6pm<br />Saturday: 10am-4pm<br />Sunday: Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Contact;
