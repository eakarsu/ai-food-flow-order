
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import TwilioContact from '../twilio/TwilioContact';

const Hero = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
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
          <button
            onClick={() => handleNavigation('/menu')}
            className="bg-white text-food-primary hover:bg-gray-100 px-8 py-3 text-lg font-semibold cursor-pointer border-none rounded-md transition-colors"
          >
            Order Now
          </button>
          <button
            onClick={() => handleNavigation('/menu')}
            className="border-2 border-white text-white hover:bg-white hover:text-food-primary px-8 py-3 text-lg font-semibold cursor-pointer bg-transparent rounded-md transition-colors"
          >
            View Menu
          </button>
          <button
            onClick={() => handleNavigation('/menu')}
            className="border-2 border-white text-white hover:bg-white hover:text-food-primary px-8 py-3 text-lg font-semibold cursor-pointer bg-transparent rounded-md transition-colors"
          >
            View Full Menu
          </button>
        </div>

        {/* Contact Form - Direct at top */}
        <div className="max-w-4xl mx-auto">
          <TwilioContact />
        </div>
      </div>
    </div>
  );
};

export default Hero;
