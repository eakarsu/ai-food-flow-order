
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import RestaurantCard from '../components/RestaurantCard';
import FoodItem from '../components/FoodItem';
import AiRecommendation from '../components/AiRecommendation';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for restaurants
const restaurantsData = [
  {
    id: "1",
    name: "Pasta Paradise",
    imageUrl: "https://images.unsplash.com/photo-1579684947550-22e945225d9a?q=80&w=1000",
    cuisine: "Italian",
    rating: 4.8,
    deliveryTime: "25-35",
    featured: true
  },
  {
    id: "2",
    name: "Sushi Station",
    imageUrl: "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1000",
    cuisine: "Japanese",
    rating: 4.6,
    deliveryTime: "20-30",
    featured: false
  },
  {
    id: "3",
    name: "Taco Temple",
    imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=1000",
    cuisine: "Mexican",
    rating: 4.5,
    deliveryTime: "15-25",
    featured: false
  },
  {
    id: "4",
    name: "Curry House",
    imageUrl: "https://images.unsplash.com/photo-1631452180539-96aca7d48617?q=80&w=1000",
    cuisine: "Indian",
    rating: 4.7,
    deliveryTime: "30-40",
    featured: true
  },
  {
    id: "5",
    name: "Burger Barn",
    imageUrl: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?q=80&w=1000",
    cuisine: "American",
    rating: 4.3,
    deliveryTime: "15-25",
    featured: false
  },
  {
    id: "6",
    name: "Pizza Palace",
    imageUrl: "https://images.unsplash.com/photo-1593504049359-74330189a345?q=80&w=1000",
    cuisine: "Italian",
    rating: 4.4,
    deliveryTime: "20-30",
    featured: false
  }
];

// Mock data for food items
const foodItemsData = [
  {
    id: "101",
    name: "Margherita Pizza",
    description: "Classic pizza with tomato sauce, mozzarella, and basil",
    price: 12.99,
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=1000",
    featured: true
  },
  {
    id: "102",
    name: "Chicken Tikka Masala",
    description: "Tender chicken in a creamy, spiced tomato sauce",
    price: 14.99,
    imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1000",
    featured: false
  },
  {
    id: "103",
    name: "Beef Burrito",
    description: "Flour tortilla filled with beef, rice, beans, and cheese",
    price: 11.99,
    imageUrl: "https://images.unsplash.com/photo-1581555675829-4a5a451b6153?q=80&w=1000",
    featured: true
  },
  {
    id: "104",
    name: "Dragon Roll",
    description: "Avocado, cucumber, and eel with tobiko and unagi sauce",
    price: 16.99,
    imageUrl: "https://images.unsplash.com/photo-1617196034183-421b4917c92d?q=80&w=1000",
    featured: false
  }
];

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate page loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-food-light">
        <div className="text-center">
          <div className="text-3xl font-bold text-food-primary mb-2 animate-bounce-subtle">
            BiteBot<span className="text-xs bg-food-secondary text-white px-1 ml-1 rounded">AI</span>
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
            Food Ordering Powered by AI
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto animate-fade-in opacity-90">
            Discover restaurants and get personalized recommendations based on your preferences
          </p>
          <div className="max-w-xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </div>
      
      {/* AI Recommendation Section */}
      <div className="container mx-auto px-4 py-12">
        <AiRecommendation />
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 flex-grow">
        <Tabs defaultValue="restaurants" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="restaurants" className="px-6">Restaurants</TabsTrigger>
              <TabsTrigger value="popular" className="px-6">Popular Items</TabsTrigger>
            </TabsList>
            <Button variant="outline" className="text-food-primary border-food-primary hover:bg-food-primary hover:text-white">
              View All
            </Button>
          </div>
          
          <TabsContent value="restaurants" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurantsData.map((restaurant) => (
                <RestaurantCard key={restaurant.id} {...restaurant} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="popular" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {foodItemsData.map((item) => (
                <FoodItem key={item.id} {...item} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* How It Works */}
      <div className="bg-food-light py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-food-dark">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="h-16 w-16 bg-food-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-food-secondary text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-food-dark">Share Your Cravings</h3>
              <p className="text-gray-600">Tell our AI what you're in the mood for, or browse restaurants and menus</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="h-16 w-16 bg-food-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-food-primary text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-food-dark">Get Personalized Recommendations</h3>
              <p className="text-gray-600">Our AI suggests dishes and restaurants tailored to your preferences</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="h-16 w-16 bg-food-accent/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-food-dark text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-food-dark">Order & Enjoy</h3>
              <p className="text-gray-600">Place your order with a few clicks and get ready for delicious food</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-food-dark py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to experience AI-powered food ordering?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of food lovers who have discovered their new favorite dishes through BiteBot
          </p>
          <Button className="bg-food-primary hover:bg-food-primary/90 text-white px-8 py-6 text-lg">
            Get Started Now
          </Button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
