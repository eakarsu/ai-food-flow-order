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
        
        {/* Contact Form - Direct at top */}
        <div className="max-w-4xl mx-auto">
          <TwilioContact />
        </div>
      </div>
    </div>
  );
};

export default Hero;