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
            <h3 className="text-xl font-semibold text-food-primary mb-3">Ready to Order?</h3>
            <p className="text-gray-600 mb-4">Browse our menu or contact us directly</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/menu"
                className="inline-flex items-center justify-center px-6 py-3 bg-food-primary text-white rounded-lg hover:bg-food-primary/90 transition-colors"
              >
                View Menu
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 border border-food-primary text-food-primary rounded-lg hover:bg-food-primary hover:text-white transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
        {/* Adding TwilioContact component here */}
        <TwilioContact />
      </div>
    </div>
  );
};

export default Hero;