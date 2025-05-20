
import { Star } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface RestaurantCardProps {
  id: string;
  name: string;
  imageUrl: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  featured?: boolean;
}

const RestaurantCard = ({
  id,
  name,
  imageUrl,
  cuisine,
  rating,
  deliveryTime,
  featured = false
}: RestaurantCardProps) => {
  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${featured ? 'border-food-primary border-2' : ''}`}>
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {featured && (
          <Badge className="absolute top-2 right-2 bg-food-primary hover:bg-food-primary/90">
            Featured
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg text-food-dark truncate">{name}</h3>
          <div className="flex items-center bg-green-100 px-2 py-1 rounded text-xs">
            <Star size={12} className="text-yellow-500 mr-1" fill="currentColor" />
            <span className="font-semibold">{rating}</span>
          </div>
        </div>
        <p className="text-gray-500 text-sm mt-1">{cuisine}</p>
      </CardContent>
      <CardFooter className="px-4 py-3 flex justify-between items-center text-sm bg-gray-50">
        <span className="text-gray-600">{deliveryTime} min</span>
        <Badge variant="outline" className="bg-white hover:bg-white">
          Order Now
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default RestaurantCard;
