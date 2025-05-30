
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin, Phone, Star } from 'lucide-react';

const RestaurantInfo = () => {
  const restaurantData = {
    name: "OrderlyBite",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000",
    rating: 4.8,
    cuisine: "American, Sandwiches, Breakfast",
    deliveryTime: "25-40 min",
    address: "2807 Hampton Woods Dr, Henrico, VA 23233",
    phone: "+1-804-360-1129",
    description: "Fresh, made-to-order meals with AI-powered recommendations"
  };

  return (
    <div className="bg-white py-16">
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
              </div>
              
              {/* Floating Rating Card */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-bold text-lg">{restaurantData.rating}</span>
                  <span className="text-gray-600 text-sm">(500+ reviews)</span>
                </div>
              </div>
            </div>

            {/* Restaurant Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-4xl font-bold text-food-dark mb-2">{restaurantData.name}</h2>
                <p className="text-xl text-gray-600 mb-4">{restaurantData.description}</p>
                <p className="text-lg text-food-primary font-semibold">{restaurantData.cuisine}</p>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-food-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-food-primary" />
                      <div>
                        <p className="font-semibold text-sm">Delivery Time</p>
                        <p className="text-food-dark">{restaurantData.deliveryTime}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-food-secondary">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-food-secondary" />
                      <div>
                        <p className="font-semibold text-sm">Location</p>
                        <p className="text-food-dark text-xs">Henrico, VA</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-semibold text-sm">Contact</p>
                        <p className="text-food-dark text-xs">{restaurantData.phone}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Full Address */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-food-dark mb-2">Full Address</h3>
                <p className="text-gray-700">{restaurantData.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantInfo;
