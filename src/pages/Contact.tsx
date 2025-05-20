
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TwilioContact from '../components/TwilioContact';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "We've received your message and will get back to you soon!",
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="bg-food-primary/10 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-food-dark mb-2">Contact Us</h1>
          <p className="text-gray-600 mb-6">We'd love to hear from you</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-10 flex-grow">
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
                  <span>123 Food Street, Tasteville, TC 98765</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-3 text-food-primary">📞</span>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-3 text-food-primary">📧</span>
                  <span>support@bitebot.com</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-3 text-food-primary">🕒</span>
                  <span>Monday-Friday: 9am-6pm<br />Saturday: 10am-4pm<br />Sunday: Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact;
