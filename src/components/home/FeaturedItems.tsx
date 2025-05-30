
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Star } from "lucide-react";

const FeaturedItems = () => {
  // Featured items data with fallback
  const featuredItems = [
    {
      id: 1,
      name: "Signature Burger",
      description: "Juicy beef patty with fresh lettuce, tomato, and our special sauce",
      price: 12.99,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500",
      rating: 4.9,
      category: "Burgers"
    },
    {
      id: 2,
      name: "Margherita Pizza",
      description: "Fresh mozzarella, basil, and tomato sauce on crispy crust",
      price: 14.99,
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?q=80&w=500",
      rating: 4.8,
      category: "Pizza"
    },
    {
      id: 3,
      name: "Caesar Salad",
      description: "Crisp romaine lettuce, parmesan cheese, croutons, and caesar dressing",
      price: 9.99,
      image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?q=80&w=500",
      rating: 4.7,
      category: "Salads"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-food-dark mb-4">
            Featured Items
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our most popular dishes, crafted with fresh ingredients and love
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {featuredItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
              <div className="relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                  <span className="text-xs font-semibold text-food-primary">{item.category}</span>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs font-semibold">{item.rating}</span>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-food-dark mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-food-primary">
                    ${item.price}
                  </span>
                  <Button 
                    size="sm" 
                    className="bg-food-primary hover:bg-food-primary/90 text-white rounded-lg px-4 py-2 flex items-center space-x-2 transition-all duration-300 hover:shadow-lg"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            size="lg" 
            variant="outline"
            className="border-food-primary text-food-primary hover:bg-food-primary hover:text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300"
          >
            View Full Menu
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedItems;
