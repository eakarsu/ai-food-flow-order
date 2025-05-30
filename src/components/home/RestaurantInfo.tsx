
import React from 'react';
import { Clock, Phone, MapPin, Star, Award, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const RestaurantInfo = () => {
  const restaurantData = {
    name: "OrderlyBite Kitchen",
    rating: 4.8,
    reviewCount: 1247,
    deliveryTime: "25-40 min",
    phone: "(804) 360-1129",
    address: "2807 Hampton Woods Dr, Henrico, VA 23233",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000",
    specialties: ["Fresh Ingredients", "Quick Service", "AI-Powered", "Local Favorite"],
    openHours: "6:00 AM - 10:00 PM",
    status: "Open Now"
  };

  const features = [
    { icon: Clock, text: restaurantData.deliveryTime, label: "Delivery Time" },
    { icon: Phone, text: restaurantData.phone, label: "Phone" },
    { icon: MapPin, text: restaurantData.address, label: "Address" }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Restaurant Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={restaurantData.imageUrl}
                  alt={restaurantData.name}
                  className="w-full h-96 object-cover"
                  loading="lazy"
                />
                
                {/* Status Badge */}
                <div className="absolute top-6 left-6 bg-green-500 text-white px-4 py-2 rounded-full font-semibold flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>{restaurantData.status}</span>
                </div>
                
                {/* Rating Badge */}
                <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-bold text-gray-800">{restaurantData.rating}</span>
                  <span className="text-gray-600">({restaurantData.reviewCount})</span>
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
                            <p className="text-sm text-gray-500 uppercase tracking-wide">{feature.label}</p>
                            <p className="text-lg font-semibold text-food-dark">{feature.text}</p>
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
                    <span className="font-medium">Busy</span>
                  </div>
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
