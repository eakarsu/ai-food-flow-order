import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AiRecommendation from '../components/AiRecommendation';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import LoadingScreen from '../components/home/LoadingScreen';
import Hero from '../components/home/Hero';
import RestaurantInfo from '../components/home/RestaurantInfo';
import FeaturedItems from '../components/home/FeaturedItems';
import HowItWorks from '../components/home/HowItWorks';
import CallToAction from '../components/home/CallToAction';
import SEO from '../components/SEO';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  
  // Simulate page loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleSearch = (query: string) => {
    navigate(`/menu?search=${encodeURIComponent(query)}`);
  };
  
  // Structured data for SEO
  const restaurantStructuredData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "OrderlyBite Deli & Cafe",
    "description": "AI-powered food ordering platform featuring fresh, made-to-order meals with SMS and phone ordering capabilities",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "2807 Hampton Woods Dr",
      "addressLocality": "Henrico",
      "addressRegion": "VA",
      "postalCode": "23233",
      "addressCountry": "US"
    },
    "telephone": "+1-804-360-1129",
    "url": "https://orderlybite.com",
    "servesCuisine": ["American", "Deli", "Breakfast"],
    "priceRange": "$$",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127"
    },
    "openingHours": "Mo-Fr 06:00-20:00, Sa-Su 07:00-18:00"
  };
  
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <SEO
        title="AI-Powered Food Ordering Platform"
        description="Order delicious meals with AI-powered recommendations. SMS & phone ordering available. Fresh, made-to-order food from OrderlyBite Deli & Cafe in Henrico, VA."
        keywords="AI food ordering, SMS ordering, phone ordering, restaurant delivery, Henrico VA, fresh meals, deli, breakfast"
        structuredData={restaurantStructuredData}
      />
      
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        
        {/* Hero Section with Twilio Contact */}
        <Hero />
        
        {/* Restaurant Info Section */}
        <RestaurantInfo restaurant={restaurantData} />
        
        {/* AI Recommendation Section */}
        <section className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold text-center mb-6">AI-Powered Recommendations</h2>
          <AiRecommendation />
        </section>
        
        {/* Search Section */}
        <section className="container mx-auto px-4 py-12 bg-food-light rounded-lg my-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-food-dark mb-3">Find Your Favorite Food</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Search our extensive menu for delicious options</p>
          </div>
          
          <div className="max-w-xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
        </section>
        
        {/* Featured Items */}
        <FeaturedItems items={featuredFoodItems} />
        
        {/* How It Works */}
        <HowItWorks />
        
        {/* CTA Section */}
        <CallToAction />
        
        <Footer />
      </div>
    </>
  );
};

export default Index;
