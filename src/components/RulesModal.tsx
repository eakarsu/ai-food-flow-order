import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Plus, Minus } from "lucide-react";

interface RuleOption {
  name: string;
  price: number;
  size?: string;
}

interface Rule {
  name: string;
  type: "select_1" | "select_up_to" | "select_range";
  min?: number;
  max?: number;
  options: RuleOption[];
}

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  basePrice: number;
  rules: Rule[];
  onConfirm: (selections: Record<string, any>, totalPrice: number) => void;
}

const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  itemName,
  basePrice,
  rules,
  onConfirm
}) => {
  const [selections, setSelections] = useState<Record<string, any>>({});

  const handleRadioChange = (ruleName: string, value: string) => {
    setSelections(prev => ({
      ...prev,
      [ruleName]: value
    }));
  };

  const handleCheckboxChange = (ruleName: string, optionName: string, checked: boolean) => {
    setSelections(prev => {
      const currentSelections = prev[ruleName] || [];
      if (checked) {
        return {
          ...prev,
          [ruleName]: [...currentSelections, optionName]
        };
      } else {
        return {
          ...prev,
          [ruleName]: currentSelections.filter((item: string) => item !== optionName)
        };
      }
    });
  };

  const calculateTotalPrice = () => {
    let total = basePrice;
    if(rules) {
        rules.forEach(rule => {
            const ruleSelections = selections[rule.name];
            if (rule.type === "select_1" && ruleSelections) {
              const option = rule.options.find(opt => opt.name === ruleSelections);
              if (option) total += option.price;
            } else if (Array.isArray(ruleSelections)) {
              ruleSelections.forEach((selectedOption: string) => {
                const option = rule.options.find(opt => opt.name === selectedOption);
                if (option) total += option.price;
              });
            }
          });
    }
    return total;
  };

  const isValidSelection = () => {
    return rules?.every(rule => {
      const selection = selections[rule.name];
      if (rule.type === "select_1") {
        return selection !== undefined;
      }
      return true; // Optional selections are always valid
    }) ?? true;
  };

  const handleConfirm = () => {
    if (isValidSelection()) {
      onConfirm(selections, calculateTotalPrice());
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-food-primary">
            Customize Your {itemName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {rules && Array.isArray(rules) && rules.map((rule, ruleIndex) => (
            <div key={ruleIndex} className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-lg mb-3 text-food-dark">
                {rule.name}
                {rule.type === "select_1" && <span className="text-red-500 ml-1">*</span>}
                {rule.max && rule.max > 1 && (
                  <span className="text-sm text-gray-500 ml-2">
                    (Select up to {rule.max})
                  </span>
                )}
              </h3>

              {rule.type === "select_1" ? (
                <RadioGroup
                  value={selections[rule.name] || ""}
                  onValueChange={(value) => handleRadioChange(rule.name, value)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {rule.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2 p-2 rounded hover:bg-white transition-colors">
                        <RadioGroupItem value={option.name} id={`${ruleIndex}-${optionIndex}`} />
                        <Label
                          htmlFor={`${ruleIndex}-${optionIndex}`}
                          className="flex-1 cursor-pointer flex justify-between"
                        >
                          <span>{option.name}</span>
                          <span className="font-semibold text-food-primary">
                            {option.price > 0 ? `+$${option.price.toFixed(2)}` : 'Free'}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {rule.options.map((option, optionIndex) => {
                    const isSelected = Array.isArray(selections[rule.name]) && 
                      selections[rule.name].includes(option.name);
                    const selectionCount = Array.isArray(selections[rule.name]) ? 
                      selections[rule.name].length : 0;
                    const canSelect = !rule.max || selectionCount < rule.max || isSelected;

                    return (
                      <div key={optionIndex} className="flex items-center space-x-2 p-2 rounded hover:bg-white transition-colors">
                        <Checkbox
                          id={`${ruleIndex}-${optionIndex}`}
                          checked={isSelected}
                          disabled={!canSelect}
                          onCheckedChange={(checked) => 
                            handleCheckboxChange(rule.name, option.name, !!checked)
                          }
                        />
                        <Label
                          htmlFor={`${ruleIndex}-${optionIndex}`}
                          className={`flex-1 cursor-pointer flex justify-between ${!canSelect ? 'opacity-50' : ''}`}
                        >
                          <span>{option.name}</span>
                          <span className="font-semibold text-food-primary">
                            {option.price > 0 ? `+$${option.price.toFixed(2)}` : 'Free'}
                          </span>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 text-center sm:text-left">
            <div className="text-2xl font-bold text-food-primary">
              Total: ${calculateTotalPrice().toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">
              Base price: ${basePrice.toFixed(2)}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!isValidSelection()}
              className="bg-gradient-to-r from-food-secondary to-food-primary hover:from-food-primary hover:to-food-secondary"
            >
              Add to Cart
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RulesModal;