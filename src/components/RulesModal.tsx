import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

interface RulesModalProps {
  trigger?: React.ReactNode;
}

const RulesModal = ({ trigger }: RulesModalProps) => {
  // Define default rules with fallbacks
  const defaultRules = [
    "All orders must be placed during business hours (11:00 AM - 10:00 PM)",
    "Delivery is available within a 5-mile radius of our location",
    "Minimum order amount for delivery is $15",
    "Payment is accepted via cash, card, or mobile payment apps",
    "Special dietary requests should be mentioned when placing the order",
    "Cancellations must be made at least 15 minutes before pickup/delivery time",
    "Fresh ingredients are used daily - some items may be unavailable if ingredients run out",
    "SMS and phone orders are processed by our AI system for accuracy",
    "Delivery times may vary during peak hours (12-2 PM, 6-8 PM)",
    "Please provide accurate contact information for order updates"
  ];

  // Use provided rules or fall back to defaults
  const rules = defaultRules;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="text-food-primary border-food-primary">
            <FileText className="w-4 h-4 mr-2" />
            View Rules
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-food-primary">Restaurant Rules & Policies</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            <p className="text-gray-600">
              Please review our restaurant rules and policies before placing your order:
            </p>
            <ul className="space-y-3">
              {rules && rules.length > 0 ? (
                rules.map((rule, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-food-primary text-white text-sm rounded-full flex items-center justify-center mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{rule}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-600">
                  <span className="flex-shrink-0 w-6 h-6 bg-food-primary text-white text-sm rounded-full flex items-center justify-center mr-3 mt-0.5">
                    1
                  </span>
                  Standard restaurant policies apply. Please contact us for specific information.
                </li>
              )}
            </ul>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default RulesModal;