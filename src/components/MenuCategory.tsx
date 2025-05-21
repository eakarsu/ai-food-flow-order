import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronUp, ImageOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface MenuItem {
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
  showTitle?: boolean;
  searchQuery?: string;
}

const MenuCategory = ({ title, items, categoryImage, showTitle = true, searchQuery = "" }: MenuCategoryProps) => {
  const { toast } = useToast();
  // Set isOpen to false initially to keep categories collapsed by default
  // Unless there's a search query, then keep them open for visibility
  const [isOpen, setIsOpen] = useState(searchQuery ? true : false);
  
  // Don't render category if no items are available
  if (items.length === 0) {
    return null;
  }

  const handleAddToCart = (itemName: string) => {
    toast({
      title: "Added to cart",
      description: `${itemName} has been added to your cart`,
    });
  };

  // Specific placeholder images for different item types
  const getPlaceholderImage = (itemName: string) => {
    const nameLower = itemName.toLowerCase();
    
    if (nameLower.includes("coffee") || nameLower.includes("cappuccino")) {
      return "https://images.unsplash.com/photo-1503481766315-7a586b20f66d?q=80&w=1000";
    } else if (nameLower.includes("tea")) {
      return "https://images.unsplash.com/photo-1546877625-cb8c71916608?q=80&w=1000";
    } else if (nameLower.includes("juice") || nameLower.includes("drink") || nameLower.includes("soda")) {
      return "https://images.unsplash.com/photo-1595983033734-6da0cf8e4137?q=80&w=1000";
    } else if (nameLower.includes("bagel") || nameLower.includes("bread") || nameLower.includes("toast")) {
      return "https://images.unsplash.com/photo-1592321675774-3cbc1d00fb0c?q=80&w=1000";
    } else if (nameLower.includes("salad")) {
      return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000";
    } else if (nameLower.includes("sandwich") || nameLower.includes("hero")) {
      return "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=1000";
    }
    
    // Default placeholder
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000";
  };
  
  return (
    <div className="mb-8">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        {showTitle && title && (
          <CollapsibleTrigger className="w-full flex items-center justify-between bg-food-primary/10 p-4 rounded-lg shadow hover:bg-food-primary/20 transition-colors">
            <div className="flex items-center space-x-4">
              {categoryImage ? (
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img 
                    src={categoryImage} 
                    alt={title} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.currentTarget.src = getPlaceholderImage(title);
                    }}
                  />
                </div>
              ) : null}
              <h2 className="text-2xl font-bold text-food-dark">{title}</h2>
            </div>
            {isOpen ? <ChevronUp className="text-food-dark" /> : <ChevronDown className="text-food-dark" />}
          </CollapsibleTrigger>
        )}
        
        <CollapsibleContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => {
              const placeholderImage = getPlaceholderImage(item.name);
              
              return (
                <Card key={`${title}-${index}`} className="overflow-hidden hover:shadow-md transition-all duration-300">
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={item.imageUrl || placeholderImage}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = placeholderImage;
                      }}
                    />
                    {!item.imageUrl && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50">
                        <ImageOff className="text-gray-400" size={32} />
                      </div>
                    )}
                  </div>
                  
                  <CardContent className={`p-4 flex flex-col`}>
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
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default MenuCategory;
