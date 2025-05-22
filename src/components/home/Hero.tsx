
import TwilioContact from '../twilio/TwilioContact';

const Hero = () => {
  return (
    <div className="bg-gradient-to-r from-food-primary to-food-secondary text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
          OrderlyBite Deli & Cafe
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto animate-fade-in opacity-90">
          Fresh, delicious meals made just for you
        </p>
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <h3 className="text-xl font-semibold text-food-primary mb-3">Contact Us Directly</h3>
            <p className="text-gray-600 mb-4">Place your order or inquire about our daily specials</p>
            <TwilioContact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
