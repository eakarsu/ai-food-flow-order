
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RulesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RulesModal = ({ open, onOpenChange }: RulesModalProps) => {
  const rules = [
    {
      title: "Order Policies",
      items: [
        "All orders must be placed during business hours: Mon-Sun 11:00 AM - 10:00 PM",
        "Minimum order amount is $15 for delivery",
        "Orders are typically ready within 20-30 minutes",
        "Please provide accurate contact information for order confirmation"
      ]
    },
    {
      title: "SMS & Phone Ordering",
      items: [
        "Text your order to our number with your name and delivery address",
        "Call us directly for special requests or dietary accommodations",
        "You'll receive confirmation via SMS with estimated pickup/delivery time",
        "Payment can be made over the phone or upon delivery"
      ]
    },
    {
      title: "Delivery & Pickup",
      items: [
        "Free delivery within 5 miles of our location",
        "$3 delivery fee for distances beyond 5 miles",
        "Pickup orders receive a 10% discount",
        "Please be available at your delivery address during the estimated time window"
      ]
    },
    {
      title: "Payment & Refunds",
      items: [
        "We accept cash, credit cards, and digital payments",
        "Payment is required upon delivery or pickup",
        "Refunds available for cancelled orders (before preparation begins)",
        "Contact us immediately for any order issues"
      ]
    },
    {
      title: "AI Recommendations",
      items: [
        "Our AI suggests dishes based on your preferences and past orders",
        "Recommendations consider dietary restrictions when provided",
        "You can always customize or ignore AI suggestions",
        "The more you order, the better our recommendations become"
      ]
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] pointer-events-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-food-dark">
            OrderlyBite Rules & Policies
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {rules.map((section, index) => (
              <div key={index} className="space-y-3">
                <h3 className="text-lg font-semibold text-food-primary border-b border-gray-200 pb-2">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-2">
                      <span className="text-food-primary mt-1">•</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            
            <div className="bg-food-primary/5 p-4 rounded-lg border border-food-primary/20">
              <h3 className="text-lg font-semibold text-food-dark mb-2">
                Contact Information
              </h3>
              <div className="space-y-1 text-gray-700">
                <p><strong>Phone:</strong> +1 (804) 360-1129</p>
                <p><strong>Address:</strong> 2807 Hampton Woods Dr, Henrico, VA 23233</p>
                <p><strong>Hours:</strong> Mon-Sun: 11:00 AM - 10:00 PM</p>
                <p><strong>Email:</strong> support@orderlybite.com</p>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="flex justify-end pt-4 border-t">
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-food-primary hover:bg-food-primary/90 text-white pointer-events-auto"
          >
            I Understand
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RulesModal;
