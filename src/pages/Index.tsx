
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import RestaurantCard from '../components/RestaurantCard';
import FoodItem from '../components/FoodItem';
import AiRecommendation from '../components/AiRecommendation';
import TwilioContact from '../components/TwilioContact';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";

// Single restaurant data
const restaurantData = {
  id: "1",
  name: "OrderlyBite Deli & Cafe",
  imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000",
  cuisine: "American, Deli, Breakfast",
  rating: 4.8,
  deliveryTime: "15-25",
  featured: true,
  description: "Your local deli serving breakfast, sandwiches, and more. Fresh ingredients, made-to-order meals, and friendly service.",
};

// Featured food items with rephrased descriptions
const featuredFoodItems = [
  {
    id: "101",
    name: "Gourmet Beef Gyro",
    description: "Tender sliced beef wrapped in warm pita with fresh lettuce, juicy tomatoes, crisp cucumbers, red onions, and our signature tzatziki sauce",
    price: 12.94,
    imageUrl: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=1000",
    featured: true
  },
  {
    id: "102",
    name: "Signature Chicken Fiesta Hero",
    description: "Crispy golden chicken cutlet layered with creamy fresh mozzarella and sweet roasted red peppers, finished with our house spicy mayo on a toasted artisan hero roll",
    price: 17.95,
    imageUrl: "https://images.unsplash.com/photo-1550507992-eb63ffee0847?q=80&w=1000",
    featured: true
  },
  {
    id: "103",
    name: "Custom Garden Salad",
    description: "Create your perfect salad with your choice of crisp greens, seasonal vegetables, premium proteins, artisanal cheeses, and housemade dressings",
    price: 9.95,
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000",
    featured: true
  },
  {
    id: "104",
    name: "Superfood Acai Bowl",
    description: "Nutrient-rich acai blend topped with fresh banana slices, sweet blueberries, strawberries, crunchy granola, coconut flakes, and a drizzle of organic honey",
    price: 12.97,
    imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=1000",
    featured: true
  }
];

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  // Simulate page loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle search from the home page
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Navigate to menu page with search query
    navigate(`/menu?search=${encodeURIComponent(query)}`);
  };
  
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-food-light">
        <div className="text-center">
          <div className="text-3xl font-bold text-food-primary mb-2 animate-bounce-subtle">
            OrderlyBite<span className="text-xs bg-food-secondary text-white px-1 ml-1 rounded">AI</span>
          </div>
          <p className="text-gray-500">Loading delicious options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-food-primary to-food-secondary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
            OrderlyBite Deli & Cafe
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto animate-fade-in opacity-90">
            Fresh, delicious meals made just for you
          </p>
          <div className="max-w-xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </div>
      
      {/* Restaurant Info Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3">
              <img 
                src={restaurantData.imageUrl} 
                alt={restaurantData.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-6 md:w-2/3">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-food-dark">{restaurantData.name}</h2>
                  <p className="text-gray-600 mt-1">{restaurantData.cuisine}</p>
                </div>
                <div className="flex items-center bg-green-100 px-3 py-1 rounded">
                  <span className="font-semibold text-green-800">{restaurantData.rating}</span>
                  <span className="text-yellow-500 ml-1">★</span>
                </div>
              </div>
              
              <p className="mt-4 text-gray-700 leading-relaxed">{restaurantData.description}</p>
              
              <div className="mt-6 space-y-2 text-gray-600">
                <p><span className="font-semibold">Delivery Time:</span> {restaurantData.deliveryTime} min</p>
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
      
      {/* AI Recommendation Section */}
      <div className="container mx-auto px-4 py-8">
        <AiRecommendation />
      </div>
      
      {/* Twilio Contact Section */}
      <div className="container mx-auto px-4 py-8 bg-food-light rounded-lg my-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-food-dark mb-3">Order Your Favorite Food</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Contact us directly to place your order or inquire about our daily specials</p>
        </div>
        <TwilioContact />
      </div>
      
      {/* Featured Items */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-food-dark">Popular Menu Items</h2>
          <p className="text-gray-600 mt-2">Our customers' favorite choices, crafted with care and quality ingredients</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {featuredFoodItems.map((item) => (
            <FoodItem key={item.id} {...item} />
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Button 
            className="bg-food-primary hover:bg-food-primary/90 text-white px-8 py-6 text-lg"
            onClick={() => navigate('/menu')}
          >
            View Complete Menu
          </Button>
        </div>
      </div>
      
      {/* How It Works */}
      <div className="bg-food-light py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-food-dark">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="h-16 w-16 bg-food-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-food-secondary text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-food-dark">Browse Our Menu</h3>
              <p className="text-gray-600">Explore our extensive menu featuring everything from breakfast favorites to gourmet sandwiches and healthy options</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="h-16 w-16 bg-food-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-food-primary text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-food-dark">Place Your Order</h3>
              <p className="text-gray-600">Select your favorite items, customize them to your preference, and complete your order with our easy checkout process</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="h-16 w-16 bg-food-accent/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-food-dark text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-food-dark">Enjoy Your Meal</h3>
              <p className="text-gray-600">Pick up your freshly prepared order at our location or have it delivered right to your doorstep</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-food-dark py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to order from OrderlyBite?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Delicious, freshly-prepared meals are just a few clicks away
          </p>
          <Button 
            className="bg-food-primary hover:bg-food-primary/90 text-white px-8 py-6 text-lg"
            onClick={() => navigate('/menu')}
          >
            Order Now
          </Button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
