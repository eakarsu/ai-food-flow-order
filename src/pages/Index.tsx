
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AiRecommendation from '../components/AiRecommendation';
import Footer from '../components/Footer';
import TwilioContact from '../components/twilio/TwilioContact';
import LoadingScreen from '../components/home/LoadingScreen';
import Hero from '../components/home/Hero';
import RestaurantInfo from '../components/home/RestaurantInfo';
import FeaturedItems from '../components/home/FeaturedItems';
import HowItWorks from '../components/home/HowItWorks';
import CallToAction from '../components/home/CallToAction';

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
  
  // Simulate page loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Restaurant Info Section */}
      <RestaurantInfo restaurant={restaurantData} />
      
      {/* AI Recommendation Section */}
      <div className="container mx-auto px-4 py-8">
        <AiRecommendation />
      </div>
      
      {/* Twilio Communication Section */}
      <div className="container mx-auto px-4 py-12 bg-food-light rounded-lg my-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-food-dark mb-3">Order Your Favorite Food</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Contact us directly to place your order or inquire about our daily specials</p>
        </div>
        
        <div className="max-w-xl mx-auto">
          <TwilioContact />
        </div>
      </div>
      
      {/* Featured Items */}
      <FeaturedItems items={featuredFoodItems} />
      
      {/* How It Works */}
      <HowItWorks />
      
      {/* CTA Section */}
      <CallToAction />
      
      <Footer />
    </div>
  );
};

export default Index;
