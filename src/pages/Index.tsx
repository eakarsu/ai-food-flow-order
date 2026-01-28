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
import { Search, Sparkles } from 'lucide-react';

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

      <div className="min-h-screen flex flex-col bg-food-light">
        <Navbar />

        {/* Hero Section */}
        <Hero />

        {/* Restaurant Info Section */}
        <RestaurantInfo restaurant={restaurantData} />

        {/* Search Section */}
        <section className="py-20 bg-white">
          <div className="section-container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <span className="inline-block px-4 py-2 bg-food-primary/10 text-food-primary rounded-full text-sm font-semibold mb-4">
                  <Search size={14} className="inline mr-2" />
                  Find Your Favorites
                </span>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-food-secondary mb-4">
                  What are you craving?
                </h2>
                <p className="text-food-gray-500 text-lg max-w-2xl mx-auto">
                  Search our extensive menu for delicious options tailored to your taste
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                <SearchBar onSearch={handleSearch} />
              </div>
            </div>
          </div>
        </section>

        {/* AI Recommendation Section */}
        <section className="py-20 bg-gradient-to-br from-food-gray-50 to-white">
          <div className="section-container">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-food-accent/20 text-food-secondary rounded-full text-sm font-semibold mb-4">
                <Sparkles size={14} />
                AI-Powered
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-food-secondary mb-4">
                Smart Recommendations
              </h2>
              <p className="text-food-gray-500 text-lg max-w-2xl mx-auto">
                Let our AI help you discover new favorites based on your preferences
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <AiRecommendation />
            </div>
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
