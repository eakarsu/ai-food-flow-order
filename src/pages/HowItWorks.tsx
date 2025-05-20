
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="bg-food-primary/10 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-food-dark mb-2">How BiteBot AI Works</h1>
          <p className="text-gray-600 mb-6">Learn how our AI-powered platform helps you discover the perfect meal</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-10 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 gap-16 py-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2 order-2 md:order-1">
                <div className="bg-food-primary/5 p-1 rounded-lg">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold text-food-dark mb-4">1. Share Your Cravings</h2>
                    <p className="text-gray-700 mb-4">
                      Start by telling our AI what you're in the mood for. You can be specific ("spicy Thai curry") or vague ("something light for lunch"). 
                      Our natural language processing understands your preferences and dietary requirements.
                    </p>
                    <p className="text-gray-700">
                      You can also browse through restaurants and menus directly if you already know what you're looking for.
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 order-1 md:order-2">
                <div className="rounded-lg overflow-hidden shadow-md">
                  <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000" alt="Food selection" className="w-full h-64 object-cover" />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2">
                <div className="rounded-lg overflow-hidden shadow-md">
                  <img src="https://images.unsplash.com/photo-1567103472667-6898f3a79cf2?q=80&w=1000" alt="AI recommendation" className="w-full h-64 object-cover" />
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <div className="bg-food-secondary/5 p-1 rounded-lg">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold text-food-dark mb-4">2. Get Personalized Recommendations</h2>
                    <p className="text-gray-700 mb-4">
                      Our AI analyzes your preferences, past orders, and current trends to suggest dishes and restaurants that match what you're looking for.
                    </p>
                    <p className="text-gray-700">
                      The more you use BiteBot, the better it gets at understanding your unique taste profile and dietary needs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2 order-2 md:order-1">
                <div className="bg-food-accent/5 p-1 rounded-lg">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold text-food-dark mb-4">3. Order & Enjoy</h2>
                    <p className="text-gray-700 mb-4">
                      Once you've found the perfect meal, ordering is just a few clicks away. Choose your delivery time, payment method, and any special instructions.
                    </p>
                    <p className="text-gray-700">
                      Track your order in real-time and get notified when your delicious food is on its way to you.
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 order-1 md:order-2">
                <div className="rounded-lg overflow-hidden shadow-md">
                  <img src="https://images.unsplash.com/photo-1526367790999-0150786686a2?q=80&w=1000" alt="Food delivery" className="w-full h-64 object-cover" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <h3 className="text-2xl font-bold text-food-dark mb-4">Ready to experience AI-powered food ordering?</h3>
            <Link to="/">
              <Button className="bg-food-primary hover:bg-food-primary/90 text-white px-8 py-6 text-lg">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default HowItWorks;
