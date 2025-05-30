import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Clock, Star, Users, Shield } from "lucide-react";

const RestaurantInfo = () => {
  const restaurantData = {
    name: "OrderlyBite",
    description: "Experience the finest selection of freshly prepared meals, artisanal coffee, and gourmet sandwiches. Our commitment to quality ingredients and exceptional service makes every bite memorable.",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    features: [
      {
        icon: Clock,
        title: "Fast Service",
        description: "Quick preparation and delivery times"
      },
      {
        icon: Star,
        title: "Premium Quality",
        description: "Only the finest, freshest ingredients"
      },
      {
        icon: Users,
        title: "Friendly Staff",
        description: "Exceptional customer service every time"
      },
      {
        icon: Shield,
        title: "Health & Safety",
        description: "Highest standards of cleanliness and safety"
      }
    ]
  };

  return (
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div>
            <h3 className="text-3xl font-bold text-food-dark mb-4">
              {restaurantData.name}
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              {restaurantData.description}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {restaurantData.features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <feature.icon className="w-6 h-6 text-food-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-food-dark mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <img
            src={restaurantData.imageUrl}
            alt="OrderlyBite Restaurant"
            className="rounded-2xl shadow-2xl w-full h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantInfo;