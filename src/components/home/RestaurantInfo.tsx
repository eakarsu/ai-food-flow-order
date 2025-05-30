import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Phone, MapPin, Star, Award, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RestaurantInfoProps {
  restaurant?: any;
}

const RestaurantInfo: React.FC<RestaurantInfoProps> = ({ restaurant }) => {
  const navigate = useNavigate();

  // Default restaurant data
  const restaurantData = restaurant || {
    name: "OrderlyBite",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000",
    rating: 4.8,
    reviewCount: "2.1k+ reviews",
    deliveryTime: "25-35 min",
    phone: "804-360-1129",
    address: "2807 Hampton Woods Dr, Henrico, VA 23233",
    openHours: "Mon-Sun: 7:00 AM - 9:00 PM",
    specialties: ["Fresh Ingredients", "Quick Service", "Custom Orders", "AI-Powered Recommendations"]
  };

  const features = [
    {
      icon: Clock,
      title: "Fast Delivery",
      description: "Get your food delivered quickly with our efficient service"
    },
    {
      icon: Award,
      title: "Quality Assured",
      description: "Fresh ingredients and carefully prepared meals"
    },
    {
      icon: Phone,
      title: "Easy Ordering",
      description: "Order by phone, SMS, or through our website"
    },
    {
      icon: Star,
      title: "AI-Powered",
      description: "Smart recommendations tailored to your preferences"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-white via-gray-50 to-orange-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Restaurant Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl group">
              <img
                src={restaurantData.imageUrl}
                alt={restaurantData.name}
                className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

              {/* Rating Badge */}
              <div className="absolute top-6 left-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-bold text-gray-800">{restaurantData.rating}</span>
                    <span className="text-gray-600">({restaurantData.reviewCount})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 gap-4 mt-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="bg-food-primary/10 p-3 rounded-full">
                    <Clock className="w-6 h-6 text-food-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Delivery Time</p>
                    <p className="text-lg font-semibold text-food-dark">{restaurantData.deliveryTime}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="bg-food-primary/10 p-3 rounded-full">
                    <Phone className="w-6 h-6 text-food-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Phone</p>
                    <p className="text-lg font-semibold text-food-dark">{restaurantData.phone}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="bg-food-primary/10 p-3 rounded-full">
                    <MapPin className="w-6 h-6 text-food-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Address</p>
                    <p className="text-lg font-semibold text-food-dark">{restaurantData.address}</p>
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
                          <h4 className="font-semibold text-food-dark">{feature.title}</h4>
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
                {restaurantData.specialties.map((specialty: string, index: number) => (
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

            {/* CTA Button */}
            <div className="pt-4">
              <Button 
                onClick={() => navigate('/menu')}
                className="w-full bg-gradient-to-r from-food-primary to-food-secondary hover:from-food-primary/90 hover:to-food-secondary/90 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                View Full Menu
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RestaurantInfo;