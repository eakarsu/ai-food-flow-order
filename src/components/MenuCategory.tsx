
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface MenuItem {
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  rules?: string[];
}

interface MenuCategoryProps {
  title: string;
  items: MenuItem[];
  categoryImage?: string;
}

const MenuCategory = ({ title, items, categoryImage }: MenuCategoryProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleAddToCart = (itemName: string) => {
    toast({
      title: "Added to cart",
      description: `${itemName} has been added to your cart`,
    });
  };
  
  return (
    <div className="mb-8">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger className="w-full flex items-center justify-between bg-food-primary/10 p-4 rounded-lg shadow hover:bg-food-primary/20 transition-colors">
          <div className="flex items-center space-x-4">
            {categoryImage && (
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img 
                  src={categoryImage} 
                  alt={title} 
                  className="w-full h-full object-cover" 
                />
              </div>
            )}
            <h2 className="text-2xl font-bold text-food-dark">{title}</h2>
          </div>
          {isOpen ? <ChevronUp className="text-food-dark" /> : <ChevronDown className="text-food-dark" />}
        </CollapsibleTrigger>
        
        <CollapsibleContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => (
              <Card key={`${title}-${index}`} className="overflow-hidden hover:shadow-md transition-all duration-300">
                {item.imageUrl && (
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <CardContent className={`p-4 flex flex-col ${!item.imageUrl ? "h-full" : ""}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-food-dark">{item.name}</h3>
                    <span className="font-bold text-food-primary">${item.price.toFixed(2)}</span>
                  </div>
                  
                  {item.description && (
                    <p className="text-gray-500 text-sm mb-4">{item.description}</p>
                  )}

                  {item.rules && item.rules.length > 0 && (
                    <div className="text-blue-600 text-xs mb-2">
                      <span className="font-semibold">Rules:</span> {item.rules.join(", ")}
                    </div>
                  )}
                  
                  <div className="mt-auto">
                    <Button 
                      size="sm" 
                      onClick={() => handleAddToCart(item.name)}
                      className="bg-food-secondary hover:bg-food-secondary/90 text-white w-full sm:w-auto"
                    >
                      <Plus size={16} className="mr-1" /> Add to cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default MenuCategory;
