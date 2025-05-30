import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { MenuItem } from './MenuCategory';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: MenuItem, selections: Record<string, any>) => void;
  item: MenuItem | null;
  itemName: string;
}

// Mock rules data structure
const rulesData: Record<string, any> = {
  "Bagel Options": {
    type: "single",
    required: true,
    options: [
      { name: "Plain Bagel", price: 0 },
      { name: "Everything Bagel", price: 0.50 },
      { name: "Sesame Bagel", price: 0.25 },
      { name: "Poppy Seed Bagel", price: 0.25 }
    ]
  },
  "Bagel Spreads": {
    type: "single",
    required: false,
    options: [
      { name: "Cream Cheese", price: 1.50 },
      { name: "Butter", price: 0.75 },
      { name: "Jelly", price: 0.50 },
      { name: "Peanut Butter", price: 1.00 }
    ]
  },
  "Breakfast Add-ons": {
    type: "multiple",
    required: false,
    options: [
      { name: "Extra Bacon", price: 2.00 },
      { name: "Avocado", price: 1.50 },
      { name: "Hash Browns", price: 2.50 },
      { name: "Fresh Fruit", price: 2.00 }
    ]
  },
  "Breakfast Bread": {
    type: "single",
    required: true,
    options: [
      { name: "White Bread", price: 0 },
      { name: "Wheat Bread", price: 0.50 },
      { name: "Sourdough", price: 0.75 },
      { name: "English Muffin", price: 1.00 },
      { name: "Bagel", price: 1.50 }
    ]
  },
  "Breakfast Cheese": {
    type: "single",
    required: false,
    options: [
      { name: "American Cheese", price: 1.00 },
      { name: "Cheddar Cheese", price: 1.25 },
      { name: "Swiss Cheese", price: 1.25 },
      { name: "Pepper Jack", price: 1.50 }
    ]
  },
  "Breakfast Dressing": {
    type: "single",
    required: false,
    options: [
      { name: "Ketchup", price: 0 },
      { name: "Hot Sauce", price: 0 },
      { name: "Mayo", price: 0 },
      { name: "Mustard", price: 0 }
    ]
  },
  "Breakfast Egg Option": {
    type: "single",
    required: true,
    options: [
      { name: "Scrambled", price: 0 },
      { name: "Fried", price: 0 },
      { name: "Over Easy", price: 0 },
      { name: "Poached", price: 0.50 }
    ]
  },
  "Breakfast Egg Quantity": {
    type: "single",
    required: true,
    options: [
      { name: "1 Egg", price: 0 },
      { name: "2 Eggs", price: 1.50 },
      { name: "3 Eggs", price: 3.00 }
    ]
  },
  "Breakfast Meat": {
    type: "single",
    required: false,
    options: [
      { name: "Bacon", price: 2.50 },
      { name: "Sausage", price: 2.50 },
      { name: "Ham", price: 3.00 },
      { name: "Turkey Sausage", price: 3.00 }
    ]
  },
  "Bread": {
    type: "single",
    required: true,
    options: [
      { name: "White Bread", price: 0 },
      { name: "Wheat Bread", price: 0.50 },
      { name: "Sourdough", price: 0.75 },
      { name: "Rye Bread", price: 0.75 },
      { name: "Hero Roll", price: 1.00 }
    ]
  },
  "Cheese": {
    type: "single",
    required: false,
    options: [
      { name: "American Cheese", price: 1.00 },
      { name: "Cheddar Cheese", price: 1.25 },
      { name: "Swiss Cheese", price: 1.25 },
      { name: "Provolone", price: 1.25 },
      { name: "Mozzarella", price: 1.50 }
    ]
  },
  "Protein": {
    type: "multiple",
    required: true,
    options: [
      { name: "Turkey", price: 4.00 },
      { name: "Ham", price: 4.00 },
      { name: "Roast Beef", price: 5.00 },
      { name: "Chicken", price: 4.50 },
      { name: "Tuna", price: 3.50 }
    ]
  },
  "Toppings": {
    type: "multiple",
    required: false,
    options: [
      { name: "Lettuce", price: 0 },
      { name: "Tomato", price: 0.50 },
      { name: "Onion", price: 0.25 },
      { name: "Pickles", price: 0.25 },
      { name: "Avocado", price: 1.50 }
    ]
  },
  "Salad Add-ons": {
    type: "multiple",
    required: false,
    options: [
      { name: "Grilled Chicken", price: 4.00 },
      { name: "Hard Boiled Egg", price: 1.50 },
      { name: "Avocado", price: 1.50 },
      { name: "Bacon Bits", price: 2.00 }
    ]
  },
  "Salad Base": {
    type: "single",
    required: true,
    options: [
      { name: "Mixed Greens", price: 0 },
      { name: "Romaine Lettuce", price: 0 },
      { name: "Spinach", price: 0.50 },
      { name: "Arugula", price: 0.75 }
    ]
  },
  "Salad Dressing": {
    type: "single",
    required: false,
    options: [
      { name: "Ranch", price: 0 },
      { name: "Italian", price: 0 },
      { name: "Caesar", price: 0 },
      { name: "Balsamic Vinaigrette", price: 0 },
      { name: "Honey Mustard", price: 0 }
    ]
  },
  "Coffee Creamers": {
    type: "multiple",
    required: false,
    options: [
      { name: "Whole Milk", price: 0 },
      { name: "Skim Milk", price: 0 },
      { name: "Half & Half", price: 0.25 },
      { name: "Almond Milk", price: 0.50 },
      { name: "Oat Milk", price: 0.50 }
    ]
  }
};

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, onSubmit, item, itemName }) => {
  const [selections, setSelections] = useState<Record<string, any>>({});
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (item) {
      setSelections({});
      setTotalPrice(item.price || 0);
    }
  }, [item]);

  useEffect(() => {
    if (!item) return;

    let additionalPrice = 0;
    Object.entries(selections).forEach(([ruleCategory, selection]) => {
      const rule = rulesData[ruleCategory];
      if (!rule || !rule.options) return;

      if (rule.type === 'single' && selection) {
        const option = rule.options.find((opt: any) => opt.name === selection);
        if (option && typeof option.price === 'number') {
          additionalPrice += option.price;
        }
      } else if (rule.type === 'multiple' && Array.isArray(selection)) {
        selection.forEach(selectedOption => {
          const option = rule.options.find((opt: any) => opt.name === selectedOption);
          if (option && typeof option.price === 'number') {
            additionalPrice += option.price;
          }
        });
      }
    });

    const basePrice = typeof item.price === 'number' ? item.price : 0;
    setTotalPrice(basePrice + additionalPrice);
  }, [selections, item]);

  const handleSingleSelection = (ruleCategory: string, optionName: string) => {
    setSelections(prev => ({
      ...prev,
      [ruleCategory]: optionName
    }));
  };

  const handleMultipleSelection = (ruleCategory: string, optionName: string, checked: boolean) => {
    setSelections(prev => {
      const currentSelections = prev[ruleCategory] || [];
      if (checked) {
        return {
          ...prev,
          [ruleCategory]: [...currentSelections, optionName]
        };
      } else {
        return {
          ...prev,
          [ruleCategory]: currentSelections.filter((item: string) => item !== optionName)
        };
      }
    });
  };

  const isValid = () => {
    if (!item?.rules) return true;

    return item.rules.every(ruleCategory => {
      const rule = rulesData[ruleCategory];
      if (!rule || !rule.required) return true;

      const selection = selections[ruleCategory];
      if (rule.type === 'single') {
        return selection && selection.length > 0;
      } else if (rule.type === 'multiple') {
        return Array.isArray(selection) && selection.length > 0;
      }
      return true;
    });
  };

  const handleSubmit = () => {
    if (item && isValid()) {
      onSubmit(item, selections);
    }
  };

  if (!item || !item.rules) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Customize Your {itemName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {(item.rules || []).map((ruleCategory) => {
            const rule = rulesData[ruleCategory];
            if (!rule || !rule.options) return null;

            return (
              <div key={ruleCategory} className="space-y-3">
                <h3 className="font-semibold text-lg">
                  {ruleCategory}
                  {rule.required && <span className="text-red-500 ml-1">*</span>}
                </h3>

                {rule.type === 'single' ? (
                  <RadioGroup
                    value={selections[ruleCategory] || ''}
                    onValueChange={(value) => handleSingleSelection(ruleCategory, value)}
                  >
                    {rule.options.map((option: any, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.name} id={`${ruleCategory}-${index}`} />
                        <Label htmlFor={`${ruleCategory}-${index}`} className="flex-1 cursor-pointer">
                          <div className="flex justify-between">
                            <span>{option.name}</span>
                            {option.price > 0 && (
                              <span className="text-food-primary font-medium">
                                +${option.price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="space-y-2">
                    {rule.options.map((option: any, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${ruleCategory}-${index}`}
                          checked={(selections[ruleCategory] || []).includes(option.name)}
                          onCheckedChange={(checked) => 
                            handleMultipleSelection(ruleCategory, option.name, checked as boolean)
                          }
                        />
                        <Label htmlFor={`${ruleCategory}-${index}`} className="flex-1 cursor-pointer">
                          <div className="flex justify-between">
                            <span>{option.name}</span>
                            {option.price > 0 && (
                              <span className="text-food-primary font-medium">
                                +${option.price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter className="flex justify-between items-center">
          <div className="text-xl font-bold text-food-primary">
            Total: ${(typeof totalPrice === 'number' ? totalPrice : 0).toFixed(2)}
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!isValid()}
              className="bg-food-primary hover:bg-food-primary/90"
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