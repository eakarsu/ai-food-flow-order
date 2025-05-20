
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface FoodItemProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  featured?: boolean;
}

const FoodItem = ({
  id,
  name,
  description,
  price,
  imageUrl,
  featured = false
}: FoodItemProps) => {
  const { toast } = useToast();
  
  const handleAddToCart = () => {
    toast({
      title: "Added to cart",
      description: `${name} has been added to your cart`,
    });
  };

  return (
    <Card className={`overflow-hidden hover:shadow-md transition-all duration-300 ${featured ? 'border-food-accent border-2' : ''}`}>
      <div className="flex flex-col md:flex-row h-full">
        <div className="md:w-2/5 h-32 md:h-auto relative">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
          {featured && (
            <div className="absolute top-2 left-0 bg-food-accent text-food-dark text-xs py-1 px-2 rounded-r-md font-medium">
              Popular Choice
            </div>
          )}
        </div>
        <CardContent className="p-4 md:w-3/5 flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-food-dark">{name}</h3>
              <span className="font-bold text-food-primary">${price.toFixed(2)}</span>
            </div>
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{description}</p>
          </div>
          <div className="mt-3 flex justify-end">
            <Button 
              size="sm" 
              onClick={handleAddToCart}
              className="bg-food-secondary hover:bg-food-secondary/90 text-white"
            >
              <Plus size={16} className="mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default FoodItem;
