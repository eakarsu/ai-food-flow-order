
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from 'react-router-dom';

const FAQ = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="bg-food-primary/10 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-food-dark mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-600 mb-6">Find answers to common questions about BiteBot AI</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-10 flex-grow">
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-medium">How does BiteBot's AI recommendation system work?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                BiteBot uses advanced machine learning algorithms to analyze your preferences, past orders, and seasonal trends. 
                The AI considers factors like your taste profile, dietary restrictions, time of day, and even weather to suggest 
                the perfect meal for your current situation.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-medium">Is there a minimum order amount?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Minimum order amounts vary by restaurant. You can see the specific minimum order amount on each restaurant's page 
                before you begin your order.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-medium">How do I modify or cancel my order?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                You can modify your order before it's confirmed by the restaurant. To do so, go to your account, find the order 
                in "Current Orders," and select "Modify." If the restaurant has already started preparing your food, you may not 
                be able to make changes. For cancellations, please contact customer support as soon as possible.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-medium">Are my payment details secure?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Yes, absolutely. BiteBot uses industry-standard encryption and security measures to protect your payment information. 
                We comply with PCI DSS (Payment Card Industry Data Security Standard) requirements and never store your full card details 
                on our servers.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-medium">What delivery areas do you cover?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Our delivery coverage depends on our restaurant partners' delivery zones. When you enter your address, 
                you'll see all restaurants that deliver to your location. We're constantly expanding our service areas to 
                reach more customers.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-lg font-medium">How do I report issues with my order?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                If there's an issue with your order, you can report it through the "Help" section in your account within 24 hours 
                of delivery. Our customer service team will review your case and assist with appropriate solutions, which may include 
                refunds, credits, or redelivery.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-7">
              <AccordionTrigger className="text-lg font-medium">Do you accommodate dietary restrictions?</AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Yes, our AI system can filter recommendations based on dietary preferences including vegetarian, vegan, gluten-free, 
                dairy-free, nut-free, and more. You can set your dietary preferences in your account profile, and our AI will 
                prioritize suitable options.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <div className="mt-10 text-center">
            <p className="text-gray-700 mb-4">
              Can't find what you're looking for? Feel free to reach out to our support team.
            </p>
            <Link to="/contact" className="text-food-primary hover:underline font-medium">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FAQ;
