
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronUp, ImageOff, Star, Clock, Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCart } from "@/context/CartContext";
import RulesModal from "./RulesModal";

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
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  
  // Don't render category if no items are available
  if (items.length === 0) {
    return null;
  }

  // Sample rules data - in a real app, this would come from your backend
  const getSampleRules = (itemName: string) => {
    if (itemName.includes("Build Your Own Breakfast")) {
      return [
        {
          name: "Breakfast Bread",
          type: "select_1" as const,
          options: [
            { name: "English Muffin", price: 0.50 },
            { name: "Everything Bagel", price: 0.50 },
            { name: "Whole Wheat Wrap", price: 1.00 },
            { name: "Croissant", price: 2.00 }
          ]
        },
        {
          name: "Breakfast Egg Quantity",
          type: "select_1" as const,
          options: [
            { name: "1 Egg", price: 0.75 },
            { name: "2 Eggs", price: 1.50 },
            { name: "3 Eggs", price: 2.25 }
          ]
        },
        {
          name: "Breakfast Meat",
          type: "select_up_to" as const,
          max: 1,
          options: [
            { name: "No Meat", price: 0.00 },
            { name: "Bacon", price: 2.00 },
            { name: "Sausage", price: 1.50 },
            { name: "Ham", price: 1.50 }
          ]
        },
        {
          name: "Breakfast Cheese",
          type: "select_up_to" as const,
          max: 2,
          options: [
            { name: "American Cheese", price: 1.00 },
            { name: "Cheddar", price: 1.00 },
            { name: "Swiss", price: 1.00 }
          ]
        }
      ];
    }
    if (itemName.includes("Build Your Own Sandwich")) {
      return [
        {
          name: "Bread",
          type: "select_1" as const,
          options: [
            { name: "Hero", price: 1.00 },
            { name: "White Wrap", price: 1.00 },
            { name: "Whole Wheat Bread", price: 0.00 },
            { name: "Rye Bread", price: 0.00 }
          ]
        },
        {
          name: "Protein",
          type: "select_range" as const,
          min: 1,
          max: 5,
          options: [
            { name: "Turkey", price: 2.00 },
            { name: "Ham", price: 2.00 },
            { name: "Roast Beef", price: 3.00 },
            { name: "Grilled Chicken", price: 2.00 }
          ]
        }
      ];
    }
    if (itemName.includes("Build Your Own Salad")) {
      return [
        {
          name: "Salad Base",
          type: "select_1" as const,
          options: [
            { name: "Mixed Greens", price: 0.00 },
            { name: "Romaine", price: 0.00 },
            { name: "Spinach", price: 0.00 }
          ]
        },
        {
          name: "Salad Add-ons",
          type: "select_up_to" as const,
          max: 10,
          options: [
            { name: "Grilled Chicken", price: 2.00 },
            { name: "Feta Cheese", price: 2.00 },
            { name: "Croutons", price: 0.50 },
            { name: "Tomatoes", price: 0.50 }
          ]
        }
      ];
    }
    return [];
  };

  const handleAddToCart = (item: MenuItem) => {
    if (item.rules && item.rules.length > 0) {
      setSelectedItem(item);
      setIsRulesModalOpen(true);
    } else {
      addToCart(item);
      toast({
        title: "Added to cart! 🎉",
        description: `${item.name} has been added to your cart`,
        className: "bg-green-50 border-green-200",
      });
    }
  };

  const handleRulesConfirm = (selections: Record<string, any>, totalPrice: number) => {
    if (selectedItem) {
      const customizedItem = {
        ...selectedItem,
        price: totalPrice,
        customizations: selections
      };
      addToCart(customizedItem);
      toast({
        title: "Added to cart! 🎉",
        description: `Customized ${selectedItem.name} has been added to your cart`,
        className: "bg-green-50 border-green-200",
      });
    }
  };

  // Enhanced image mapping for better visual accuracy
  const getSpecificImage = (itemName: string) => {
    const nameLower = itemName.toLowerCase();
    
    // Specific breakfast items
    if (nameLower.includes("acai bowl") || nameLower.includes("acai")) {
      return "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?q=80&w=1000";
    }
    if (nameLower.includes("french toast")) {
      return "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=1000";
    }
    if (nameLower.includes("melville platter") || nameLower.includes("breakfast platter")) {
      return "https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1000";
    }
    if (nameLower.includes("custom bagel") || nameLower.includes("bagel")) {
      return "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000";
    }
    if (nameLower.includes("build your breakfast") || nameLower.includes("build your own breakfast")) {
      return "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=1000";
    }
    
    // Sandwiches and heroes
    if (nameLower.includes("italian hero")) {
      return "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?q=80&w=1000";
    }
    if (nameLower.includes("philly") || nameLower.includes("cheese steak")) {
      return "https://images.unsplash.com/photo-1565299507177-b0ac66763828?q=80&w=1000";
    }
    if (nameLower.includes("chicken fiesta")) {
      return "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=1000";
    }
    if (nameLower.includes("build your own sandwich") || nameLower.includes("build your sandwich")) {
      return "https://images.unsplash.com/photo-1567234669013-d3226160d4c4?q=80&w=1000";
    }
    
    // Salads
    if (nameLower.includes("chef salad")) {
      return "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1000";
    }
    if (nameLower.includes("greek salad")) {
      return "https://images.unsplash.com/photo-1544982503-9f984c14501a?q=80&w=1000";
    }
    if (nameLower.includes("build your own salad") || nameLower.includes("build your salad")) {
      return "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1000";
    }

    // Coffee and hot beverages
    if (nameLower.includes("hot coffee") || nameLower.includes("coffee")) {
      return "https://images.unsplash.com/photo-1503481766315-7a586b20f66d?q=80&w=1000";
    }
    if (nameLower.includes("cappuccino")) {
      return "https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=1000";
    }
    if (nameLower.includes("french vanilla")) {
      return "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?q=80&w=1000";
    }
    
    // Tea - Fix the woman pictures issue
    if (nameLower.includes("green decaf tea")) {
      return "https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=1000"; // Green tea in cup
    }
    if (nameLower.includes("green tea")) {
      return "https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=1000"; // Green tea in cup
    }
    if (nameLower.includes("hot decaf tea")) {
      return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1000"; // Herbal tea
    }
    if (nameLower.includes("hot tea") || nameLower.includes("tea")) {
      return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1000"; // Hot tea in cup
    }

    // Cold beverages
    if (nameLower.includes("orange juice") || nameLower.includes("fresh orange")) {
      return "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=1000";
    }
    if (nameLower.includes("arizona") || nameLower.includes("iced tea")) {
      return "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000";
    }
    if (nameLower.includes("lemonade")) {
      return "https://images.unsplash.com/photo-1523371683702-dfedf0258014?q=80&w=1000";
    }
    if (nameLower.includes("coca-cola") || nameLower.includes("coke") || nameLower.includes("cola")) {
      return "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?q=80&w=1000";
    }

    // Pastries and desserts
    if (nameLower.includes("blueberry muffin") || nameLower.includes("muffin")) {
      return "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1000";
    }
    if (nameLower.includes("chocolate chip cookies") || nameLower.includes("cookies")) {
      return "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1000";
    }
    if (nameLower.includes("croissant")) {
      return "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000";
    }
    if (nameLower.includes("apple turnover") || nameLower.includes("turnover")) {
      return "https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=1000";
    }

    // Omelets
    if (nameLower.includes("american omelet")) {
      return "https://images.unsplash.com/photo-1510693206972-df098062fc71?q=80&w=1000";
    }
    if (nameLower.includes("western omelet")) {
      return "https://images.unsplash.com/photo-1565299507177-b0ac66763828?q=80&w=1000";
    }
    if (nameLower.includes("simon's omelet") || nameLower.includes("simons omelet")) {
      return "https://images.unsplash.com/photo-1526206062472-a9d4511ad433?q=80&w=1000";
    }
    if (nameLower.includes("omelet") || nameLower.includes("omelette")) {
      return "https://images.unsplash.com/photo-1510693206972-df098062fc71?q=80&w=1000";
    }

    // Paninis and grilled items
    if (nameLower.includes("caprese panini")) {
      return "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=1000";
    }
    if (nameLower.includes("cuban sandwich")) {
      return "https://images.unsplash.com/photo-1565299585323-38174c31d0a4?q=80&w=1000";
    }
    if (nameLower.includes("texas panini")) {
      return "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=1000";
    }
    if (nameLower.includes("panini")) {
      return "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=1000";
    }

    // General categories
    if (nameLower.includes("sandwich") || nameLower.includes("hero")) {
      return "https://images.unsplash.com/photo-1567234669013-d3226160d4c4?q=80&w=1000";
    }
    if (nameLower.includes("salad")) {
      return "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1000";
    }
    
    // Default food image
    return "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1000";
  };
  
  // Categories should be closed by default, only open when user clicks
  const [isOpen, setIsOpen] = React.useState(false);
  
  React.useEffect(() => {
    // Open categories when user searches
    if (searchQuery && searchQuery.trim() !== '') {
      setIsOpen(true);
    }
    // Close when search is cleared
    if (!searchQuery || searchQuery.trim() === '') {
      setIsOpen(false);
    }
  }, [searchQuery]);
  
  // If showTitle is false, just render the items directly
  if (!showTitle) {
    return (
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item, index) => {
            const specificImage = item.imageUrl || getSpecificImage(item.name);
            
            return (
              <Card key={`${title}-${index}`} className="overflow-hidden hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-2 border-0 shadow-lg bg-white">
                <div className="h-56 overflow-hidden relative bg-gradient-to-br from-gray-50 to-gray-100">
                  <img
                    src={specificImage}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = getSpecificImage(item.name);
                    }}
                  />
                  
                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-food-primary to-food-secondary text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                    ${item.price.toFixed(2)}
                  </div>
                  
                  {/* Quality Indicator */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-xs font-semibold text-gray-700">Fresh</span>
                  </div>
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-food-dark leading-tight group-hover:text-food-primary transition-colors">
                      {item.name}
                    </h3>
                  </div>
                  
                  {item.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {item.rules && item.rules.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center space-x-2 text-blue-700 text-sm">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">Customizable</span>
                      </div>
                      <p className="text-blue-600 text-xs mt-1">
                        {item.rules.slice(0, 2).join(", ")}{item.rules.length > 2 && ` +${item.rules.length - 2} more`}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-2xl font-bold text-food-primary">
                      ${item.price.toFixed(2)}
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleAddToCart(item)}
                      className="bg-gradient-to-r from-food-secondary to-food-primary hover:from-food-primary hover:to-food-secondary text-white px-6 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Plus size={16} className="mr-2" /> 
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        itemName={selectedItem?.name || ""}
        basePrice={selectedItem?.price || 0}
        rules={selectedItem ? getSampleRules(selectedItem.name) : []}
        onConfirm={handleRulesConfirm}
      />
    );
  }

  return (
    <div className="mb-8">
      <Accordion type="single" collapsible className="w-full" value={isOpen ? title : ""} onValueChange={(value) => setIsOpen(value === title)}>
        <AccordionItem value={title} className="border-none">
          <AccordionTrigger className="flex justify-between bg-gradient-to-r from-food-primary/10 to-food-secondary/10 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center space-x-6">
              {categoryImage ? (
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md">
                  <img 
                    src={categoryImage} 
                    alt={title} 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = getSpecificImage(title);
                    }}
                  />
                </div>
              ) : null}
              <div>
                <h2 className="text-3xl font-bold text-food-dark mb-1">{title}</h2>
                <p className="text-gray-600">{items.length} delicious options</p>
              </div>
            </div>
          </AccordionTrigger>
          
          <AccordionContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item, index) => {
                const specificImage = item.imageUrl || getSpecificImage(item.name);
                
                return (
                  <Card key={`${title}-${index}`} className="overflow-hidden hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-2 border-0 shadow-lg bg-white">
                    <div className="h-56 overflow-hidden relative bg-gradient-to-br from-gray-50 to-gray-100">
                      <img
                        src={specificImage}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = getSpecificImage(item.name);
                        }}
                      />
                      
                      {/* Price Badge */}
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-food-primary to-food-secondary text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                        ${item.price.toFixed(2)}
                      </div>
                      
                      {/* Quality Indicator */}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-xs font-semibold text-gray-700">Fresh</span>
                      </div>
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-food-dark leading-tight group-hover:text-food-primary transition-colors">
                          {item.name}
                        </h3>
                      </div>
                      
                      {item.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      {item.rules && item.rules.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center space-x-2 text-blue-700 text-sm">
                            <Clock className="w-4 h-4" />
                            <span className="font-semibold">Customizable</span>
                          </div>
                          <p className="text-blue-600 text-xs mt-1">
                            {item.rules.slice(0, 2).join(", ")}{item.rules.length > 2 && ` +${item.rules.length - 2} more`}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="text-2xl font-bold text-food-primary">
                          ${item.price.toFixed(2)}
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleAddToCart(item)}
                          className="bg-gradient-to-r from-food-secondary to-food-primary hover:from-food-primary hover:to-food-secondary text-white px-6 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          {item.rules && item.rules.length > 0 ? (
                            <>
                              <Settings size={16} className="mr-2" /> 
                              Customize
                            </>
                          ) : (
                            <>
                              <Plus size={16} className="mr-2" /> 
                              Add to Cart
                            </>
                          )}
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

      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        itemName={selectedItem?.name || ""}
        basePrice={selectedItem?.price || 0}
        rules={selectedItem ? getSampleRules(selectedItem.name) : []}
        onConfirm={handleRulesConfirm}
      />
    </div>
  );
};

export default MenuCategory;
