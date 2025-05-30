import { useEffect, useState } from "react";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import FeaturedItems from "@/components/home/FeaturedItems";
import CallToAction from "@/components/home/CallToAction";
import RestaurantInfo from "@/components/home/RestaurantInfo";
import LoadingScreen from "@/components/home/LoadingScreen";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <SEO 
        title="OrderlyBite - Fresh Food Delivered Fast"
        description="Experience the finest selection of freshly prepared meals, artisanal coffee, and gourmet sandwiches. Order online for fast delivery or pickup."
        keywords="fresh food, delivery, gourmet sandwiches, coffee, breakfast, lunch"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <Navbar />

        {/* Enhanced Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-food-primary/5 to-food-secondary/5"></div>
          <Hero />
        </section>

        {/* Enhanced Featured Items */}
        <section className="py-20 bg-white relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50"></div>
          <div className="relative">
            <div className="container mx-auto px-4 text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-food-dark mb-6">
                🌟 Today's Featured Delights
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover our chef's special selections, crafted with the finest ingredients and bursting with flavor
              </p>
            </div>
            <FeaturedItems />
          </div>
        </section>

        {/* Enhanced How It Works */}
        <section className="py-20 bg-gradient-to-r from-food-light to-orange-50">
          <HowItWorks />
        </section>

        {/* Enhanced Restaurant Info */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-food-dark mb-6">
                🏪 About OrderlyBite
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Your neighborhood destination for exceptional food, warm hospitality, and unforgettable flavors
              </p>
            </div>
            <RestaurantInfo />
          </div>
        </section>

        {/* Enhanced Call to Action */}
        <section className="py-20 bg-gradient-to-r from-food-primary via-orange-500 to-red-500 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.4%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
          </div>
          <div className="relative">
            <CallToAction />
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Index;