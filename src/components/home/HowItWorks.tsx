
const HowItWorks = () => {
  return (
    <div className="bg-food-light py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-food-dark">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="h-16 w-16 bg-food-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-food-secondary text-2xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-food-dark">Browse Our Menu</h3>
            <p className="text-gray-600">Explore our extensive menu featuring everything from breakfast favorites to gourmet sandwiches and healthy options</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="h-16 w-16 bg-food-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-food-primary text-2xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-food-dark">Place Your Order</h3>
            <p className="text-gray-600">Select your favorite items, customize them to your preference, and complete your order with our easy checkout process</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="h-16 w-16 bg-food-accent/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-food-dark text-2xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-food-dark">Enjoy Your Meal</h3>
            <p className="text-gray-600">Pick up your freshly prepared order at our location or have it delivered right to your doorstep</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
