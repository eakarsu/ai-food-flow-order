
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

interface RestaurantInfoProps {
  restaurant: {
    id: string;
    name: string;
    imageUrl: string;
    cuisine: string;
    rating: number;
    deliveryTime: string;
    featured: boolean;
    description: string;
  };
}

const RestaurantInfo = ({ restaurant }: RestaurantInfoProps) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3">
            <img 
              src={restaurant.imageUrl} 
              alt={restaurant.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-6 md:w-2/3">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-food-dark">{restaurant.name}</h2>
                <p className="text-gray-600 mt-1">{restaurant.cuisine}</p>
              </div>
              <div className="flex items-center bg-green-100 px-3 py-1 rounded">
                <span className="font-semibold text-green-800">{restaurant.rating}</span>
                <span className="text-yellow-500 ml-1">★</span>
              </div>
            </div>
            
            <p className="mt-4 text-gray-700 leading-relaxed">{restaurant.description}</p>
            
            <div className="mt-6 space-y-2 text-gray-600">
              <p><span className="font-semibold">Delivery Time:</span> {restaurant.deliveryTime} min</p>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-3">
              <Button 
                className="bg-food-primary hover:bg-food-primary/90 text-white"
                onClick={() => navigate('/menu')}
              >
                View Full Menu
              </Button>
              <Button variant="outline" className="border-food-primary text-food-primary hover:bg-food-primary/10">
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantInfo;
