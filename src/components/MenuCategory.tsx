
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface MenuItem {
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

interface MenuCategoryProps {
  title: string;
  items: MenuItem[];
}

const MenuCategory = ({ title, items }: MenuCategoryProps) => {
  const { toast } = useToast();
  
  const handleAddToCart = (itemName: string) => {
    toast({
      title: "Added to cart",
      description: `${itemName} has been added to your cart`,
    });
  };
  
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-5 text-food-dark border-b pb-2">{title}</h2>
      
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
    </div>
  );
};

export default MenuCategory;
