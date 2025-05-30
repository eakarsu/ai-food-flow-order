
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Phone, Star, Users, Award } from "lucide-react";

interface RestaurantInfoProps {
  restaurant: any;
}

const RestaurantInfo: React.FC<RestaurantInfoProps> = ({ restaurant }) => {
  // Default restaurant data when no restaurant is provided
  const restaurantData = restaurant || {
    name: "OrderlyBite",
    rating: 4.8,
    reviewCount: 250,
    deliveryTime: "25-35 min",
    phone: "(804) 360-1129",
    address: "2807 Hampton Woods Dr, Henrico, VA 23233",
    openHours: "Mon-Sun 6:00 AM - 10:00 PM",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000",
    specialties: [
      "Fresh Ingredients",
      "Made to Order",
      "Fast Delivery",
      "AI Recommendations"
    ]
  };

  const features = [
    {
      icon: Star,
      title: "Top Rated",
      description: "Highly rated by our customers with excellent reviews"
    },
    {
      icon: Clock,
      title: "Fast Service",
      description: "Quick preparation and delivery times"
    },
    {
      icon: Award,
      title: "AI-Powered",
      description: "Smart recommendations tailored to your preferences"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Restaurant Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={restaurantData.imageUrl}
                alt={restaurantData.name}
                className="w-full h-96 object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              
              {/* Rating Badge */}
              <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-bold text-gray-800">{restaurantData.rating}</span>
                  <span className="text-gray-600">({restaurantData.reviewCount})</span>
                </div>
              </div>
            </div>

            {/* Contact Info Cards */}
            <div className="absolute -bottom-8 left-6 right-6 space-y-3">
              <div className="bg-white rounded-xl p-4 shadow-xl border border-gray-100">
                <div className="flex items-center space-x-3 text-gray-600">
                  <Clock className="w-5 h-5 text-food-primary" />
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Delivery Time</p>
                    <p className="text-sm">{restaurantData.deliveryTime}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-gray-600">
                  <Phone className="w-5 h-5 text-food-primary" />
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Phone</p>
                    <p className="text-sm">{restaurantData.phone}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-food-primary" />
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Address</p>
                    <p className="text-sm">{restaurantData.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Restaurant Details */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-food-dark mb-4">
                {restaurantData.name}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Experience the future of food ordering with our AI-powered platform. 
                Fresh ingredients, quick service, and delicious meals delivered right to your door.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 gap-4">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-food-primary/10 p-3 rounded-full">
                          <IconComponent className="w-6 h-6 text-food-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-food-dark">{feature.title}</h3>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Specialties */}
            <div>
              <h3 className="text-xl font-bold text-food-dark mb-4 flex items-center">
                <Award className="w-6 h-6 text-food-primary mr-2" />
                What Makes Us Special
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {restaurantData.specialties.map((specialty, index) => (
                  <div key={index} className="bg-food-light/50 rounded-lg p-3 text-center">
                    <span className="text-food-dark font-medium">{specialty}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hours */}
            <div className="bg-gradient-to-r from-food-primary/10 to-food-secondary/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-food-primary" />
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Hours</p>
                    <p className="text-lg font-semibold text-food-dark">{restaurantData.openHours}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-green-600">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Open Now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RestaurantInfo;
