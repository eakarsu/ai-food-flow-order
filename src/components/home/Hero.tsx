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
            size="lg" 
            onClick={() => window.open('tel:+18043601129')}
            className="bg-green-600 text-white hover:bg-green-700 border-2 border-green-600 font-semibold px-8 py-4 text-lg transition-all duration-300 hover:scale-105 cursor-pointer flex items-center gap-2"
            type="button"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5h-2c-7.732 0-14-6.268-14-14V3.5z" clipRule="evenodd" />
            </svg>
            Call Now
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