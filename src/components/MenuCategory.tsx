
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronUp, ImageOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCart } from "@/context/CartContext";

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
  const { addToCart } = useCart();
  
  // Don't render category if no items are available
  if (items.length === 0) {
    return null;
  }

  const handleAddToCart = (item: MenuItem) => {
    addToCart(item);
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart`,
    });
  };

  // Specific placeholder images for different item types
  const getPlaceholderImage = (itemName: string) => {
    const nameLower = itemName.toLowerCase();
    
    if (nameLower.includes("coffee") || nameLower.includes("cappuccino")) {
      return "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?q=80&w=1000";
    } else if (nameLower.includes("tea")) {
      return "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1000";
    } else if (nameLower.includes("juice")) {
      return "https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=1000";
    } else if (nameLower.includes("soda") || nameLower.includes("drink") || nameLower.includes("coke") || nameLower.includes("sprite") || nameLower.includes("pepsi")) {
      return "https://images.unsplash.com/photo-1629203432180-71e9b11626e6?q=80&w=1000";
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
  
  // Set a stable value for the accordion to prevent re-rendering issues
  const accordionValue = searchQuery ? title : undefined;
  
  return (
    <div>
      <Accordion type="single" collapsible defaultValue={accordionValue}>
        <AccordionItem value={title} className="border-none">
          {showTitle && title && (
            <AccordionTrigger className="flex justify-between bg-food-gray-50 hover:bg-food-gray-100 p-5 rounded-xl transition-colors">
              <div className="flex items-center space-x-4">
                {categoryImage ? (
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-food-gray-100 shadow-sm">
                    <img
                      src={categoryImage}
                      alt={title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = getPlaceholderImage(title);
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-food-primary/10 flex items-center justify-center">
                    <span className="text-2xl">🍽️</span>
                  </div>
                )}
                <h2 className="text-xl font-display font-bold text-food-secondary">{title}</h2>
              </div>
            </AccordionTrigger>
          )}
          
          <AccordionContent className="pt-6 px-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item, index) => {
                const placeholderImage = getPlaceholderImage(item.name);

                return (
                  <Card key={`${title}-${index}`} className="overflow-hidden bg-white border-0 shadow-soft hover:shadow-soft-lg transition-all duration-300 group rounded-2xl">
                    <div className="h-44 overflow-hidden relative bg-food-gray-100">
                      <img
                        src={item.imageUrl || placeholderImage}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = placeholderImage;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <CardContent className="p-5 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-display font-semibold text-food-secondary group-hover:text-food-primary transition-colors">{item.name}</h3>
                        <span className="font-bold text-food-primary text-lg">${item.price.toFixed(2)}</span>
                      </div>

                      {item.description && (
                        <p className="text-food-gray-500 text-sm mb-4 line-clamp-2">{item.description}</p>
                      )}

                      {item.rules && item.rules.length > 0 && (
                        <div className="text-food-primary/80 text-xs mb-3 bg-food-primary/5 px-3 py-1.5 rounded-lg inline-block">
                          <span className="font-semibold">Customizable</span>
                        </div>
                      )}

                      <div className="mt-auto pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(item)}
                          className="bg-food-primary hover:bg-food-primary-dark text-white w-full rounded-xl font-semibold transition-all duration-300 hover:shadow-glow"
                        >
                          <Plus size={16} className="mr-2" /> Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default MenuCategory;
