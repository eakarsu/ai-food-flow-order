
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import TwilioContact from '../twilio/TwilioContact';
import MessageForm from '../twilio/MessageForm';

const Hero = () => {
  const navigate = useNavigate();

  const handleOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/menu');
  };

  const handleViewMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/menu');
  };

  const handleViewFullMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/menu');
  };

  return (
    <div className="bg-gradient-to-r from-food-primary to-food-secondary text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
          OrderlyBite Deli & Cafe
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto animate-fade-in opacity-90">
          Fresh, delicious meals made just for you
        </p>

        {/* Navigation Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <Button 
            size="lg" 
            onClick={handleOrderNow}
            className="bg-white text-food-primary hover:bg-gray-50 border-2 border-white font-semibold px-8 py-4 text-lg transition-all duration-300 hover:scale-105 cursor-pointer"
            type="button"
          >
            Order Now
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleViewMenu}
            className="border-white text-white hover:bg-white hover:text-food-primary font-semibold px-8 py-4 text-lg transition-all duration-300 hover:scale-105 cursor-pointer"
            type="button"
          >
            View Menu
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleViewFullMenu}
            className="border-white text-white hover:bg-white hover:text-food-primary font-semibold px-8 py-4 text-lg transition-all duration-300 hover:scale-105 cursor-pointer"
            type="button"
          >
            View Full Menu
          </Button>
        </div>

        {/* Contact Section */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Contact Us Directly</h3>
            <p className="text-white/90 text-center mb-6">Place your order or inquire about our daily specials</p>

            <div className="bg-white rounded-xl p-6">
              <h4 className="text-lg font-semibold text-food-primary mb-4">Send SMS</h4>
              <MessageForm 
                phoneNumber="+18043601129"
                onMessageSent={(message) => console.log('Message sent:', message)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
