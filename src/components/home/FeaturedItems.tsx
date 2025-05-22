
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import FoodItem from '../FoodItem';

interface FoodItemType {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  featured: boolean;
}

interface FeaturedItemsProps {
  items: FoodItemType[];
}

const FeaturedItems = ({ items }: FeaturedItemsProps) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-food-dark">Popular Menu Items</h2>
        <p className="text-gray-600 mt-2">Our customers' favorite choices, crafted with care and quality ingredients</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {items.map((item) => (
          <FoodItem key={item.id} {...item} />
        ))}
      </div>
      
      <div className="text-center mt-10">
        <Button 
          className="bg-food-primary hover:bg-food-primary/90 text-white px-8 py-6 text-lg"
          onClick={() => navigate('/menu')}
        >
          View Complete Menu
        </Button>
      </div>
    </div>
  );
};

export default FeaturedItems;
