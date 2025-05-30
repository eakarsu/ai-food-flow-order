
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Star, Clock, Flame } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/context/CartContext";

const FeaturedItems = () => {
  const { toast } = useToast();
  const { addToCart } = useCart();

  const featuredItems = [
    {
      name: "Signature Acai Bowl",
      price: 12.97,
      description: "Organic acai blend topped with fresh berries, granola, coconut flakes, and a drizzle of local honey. A perfect healthy start to your day!",
      imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=1000",
      badge: "Most Popular",
      badgeColor: "bg-red-500",
      rating: 4.9
    },
    {
      name: "Artisan Italian Hero",
      price: 17.95,
      description: "Premium Boar's Head capicola, salami, and pepperoni with fresh mozzarella, roasted peppers, and house-made pesto on a crusty hero roll.",
      imageUrl: "https://images.unsplash.com/photo-1511344407683-b1172dce025e?q=80&w=1000",
      badge: "Chef's Choice",
      badgeColor: "bg-green-500",
      rating: 4.8
    },
    {
      name: "Gourmet Coffee Blend",
      price: 2.76,
      description: "Our signature Colombian coffee blend, roasted to perfection. Rich, smooth, and full-bodied with notes of chocolate and caramel.",
      imageUrl: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?q=80&w=1000",
      badge: "House Special",
      badgeColor: "bg-amber-600",
      rating: 4.7
    },
    {
      name: "Farm Fresh Greek Salad",
      price: 15.95,
      description: "Crisp romaine, vine-ripened tomatoes, cucumber, red onions, Kalamata olives, and authentic feta cheese with our signature Greek dressing.",
      imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?q=80&w=1000",
      badge: "Fresh Daily",
      badgeColor: "bg-emerald-500",
      rating: 4.6
    }
  ];

  const handleAddToCart = (item: any) => {
    addToCart(item);
    toast({
      title: "Added to cart! 🎉",
      description: `${item.name} has been added to your cart`,
      className: "bg-green-50 border-green-200",
    });
  };

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {featuredItems.map((item, index) => (
          <Card 
            key={index} 
            className="overflow-hidden hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-3 border-0 shadow-lg bg-white"
          >
            <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              
              {/* Badge */}
              <div className={`absolute top-4 left-4 ${item.badgeColor} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1`}>
                <Flame className="w-3 h-3" />
                <span>{item.badge}</span>
              </div>
              
              {/* Price */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-food-primary px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                ${item.price.toFixed(2)}
              </div>
              
              {/* Rating */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1 shadow-lg">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-semibold text-gray-700">{item.rating}</span>
              </div>
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            <CardContent className="p-6">
              <h3 className="font-bold text-xl text-food-dark mb-3 group-hover:text-food-primary transition-colors leading-tight">
                {item.name}
              </h3>
              
              <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                {item.description}
              </p>
              
              {/* Quick Info */}
              <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Ready in 5-10 min</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Fresh Made</span>
                </div>
              </div>
              
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
        ))}
      </div>
      
      {/* Call to Action */}
      <div className="text-center mt-16">
        <h3 className="text-2xl font-bold text-food-dark mb-4">
          Craving More Delicious Options?
        </h3>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Explore our complete menu featuring over 50 fresh, made-to-order items from breakfast favorites to gourmet dinners.
        </p>
        <Button 
          size="lg"
          onClick={() => window.location.href = '/menu'}
          className="bg-gradient-to-r from-food-primary to-food-secondary hover:from-food-secondary hover:to-food-primary text-white px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          View Full Menu
        </Button>
      </div>
    </div>
  );
};

export default FeaturedItems;
