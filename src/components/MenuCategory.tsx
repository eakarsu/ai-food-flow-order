
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ShoppingCart, Info, ChevronDown, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import RulesModal from "./RulesModal";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

export interface MenuItem {
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  rules?: string[];
  ruleSelections?: Record<string, any>;
}

interface MenuCategoryProps {
  title: string;
  items: MenuItem[];
  categoryImage?: string;
  searchQuery?: string;
}

const MenuCategory: React.FC<MenuCategoryProps> = ({ title, items, categoryImage, searchQuery = "" }) => {
  const { addToCart } = useCart();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleAddToCart = (item: MenuItem) => {
    if (item.rules && item.rules.length > 0) {
      setSelectedItem(item);
      setIsRulesModalOpen(true);
    } else {
      addToCart(item);
    }
  };

  const handleRulesSubmit = (item: MenuItem, selections: Record<string, any>) => {
    // Add the item with rule selections
    addToCart({ ...item, ruleSelections: selections });
    setIsRulesModalOpen(false);
    setSelectedItem(null);
  };

  const handleRulesModalClose = () => {
    setIsRulesModalOpen(false);
    setSelectedItem(null);
  };

  if (items.length === 0) return null;

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-8">
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-4 mb-6 cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors">
            {isOpen ? (
              <ChevronDown className="w-6 h-6 text-gray-600" />
            ) : (
              <ChevronRight className="w-6 h-6 text-gray-600" />
            )}
            {categoryImage && (
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                <img 
                  src={categoryImage} 
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
              <p className="text-gray-600">{items.length} items</p>
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-food-primary/20">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={item.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000"}
                    alt={item.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.rules && item.rules.length > 0 && (
                    <Badge 
                      className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 cursor-help"
                      title="This item has customization options"
                    >
                      <Info className="w-3 h-3 mr-1" />
                      Rules Apply
                    </Badge>
                  )}
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold line-clamp-2">
                    {searchQuery ? (
                      <span dangerouslySetInnerHTML={{
                        __html: item.name.replace(
                          new RegExp(`(${searchQuery})`, 'gi'),
                          '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                        )
                      }} />
                    ) : (
                      item.name
                    )}
                  </CardTitle>
                  {item.description && (
                    <CardDescription className="text-sm text-gray-600 line-clamp-2">
                      {searchQuery ? (
                        <span dangerouslySetInnerHTML={{
                          __html: item.description.replace(
                            new RegExp(`(${searchQuery})`, 'gi'),
                            '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                          )
                        }} />
                      ) : (
                        item.description
                      )}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-food-primary">
                      ${item.price.toFixed(2)}
                    </span>
                    <Button 
                      onClick={() => handleAddToCart(item)}
                      className="bg-food-primary hover:bg-food-primary/90 text-white"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={handleRulesModalClose}
        onSubmit={handleRulesSubmit}
        item={selectedItem}
        itemName={selectedItem?.name || ""}
      />
    </>
  );
};

export default MenuCategory;
