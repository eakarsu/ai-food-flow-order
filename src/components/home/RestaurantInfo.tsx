import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Phone, Star } from "lucide-react";

const RestaurantInfo = () => {
  // Restaurant data with fallback values
  const restaurant = {
    name: "OrderlyBite Kitchen",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000",
    address: "2807 Hampton Woods Dr, Henrico, VA 23233",
    phone: "+1 (804) 360-1129",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    rating: 4.8,
    description: "Fresh, made-to-order meals with AI-powered recommendations. Order by SMS, phone, or online for the best food experience in Henrico!"
  };

  const features = [
    {
      icon: <Phone className="h-5 w-5" />,
      title: "SMS & Phone Ordering",
      description: "Order easily by text or call"
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: "AI Recommendations",
      description: "Personalized food suggestions"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Fast Delivery",
      description: "Fresh meals delivered quickly"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Restaurant Image */}
          <div className="relative">
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
            />
            <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="font-bold text-lg">{restaurant.rating}</span>
                <span className="text-gray-600">Rating</span>
              </div>
            </div>
          </div>

          {/* Restaurant Details */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-food-dark mb-4">
                {restaurant.name}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {restaurant.description}
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-700">
                <MapPin className="h-5 w-5 text-food-primary" />
                <span>{restaurant.address}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <Phone className="h-5 w-5 text-food-primary" />
                <span>{restaurant.phone}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <Clock className="h-5 w-5 text-food-primary" />
                <span>{restaurant.hours}</span>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 gap-4 mt-8">
              {features.map((feature, index) => (
                <Card key={index} className="border-0 bg-white/70 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-food-primary/10 rounded-lg text-food-primary">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-food-dark">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button 
                size="lg" 
                className="bg-food-primary hover:bg-food-primary/90 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Order Now
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-food-primary text-food-primary hover:bg-food-primary hover:text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300"
              >
                View Menu
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RestaurantInfo;