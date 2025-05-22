
const LoadingScreen = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-food-light">
      <div className="text-center">
        <div className="text-3xl font-bold text-food-primary mb-2 animate-bounce-subtle">
          OrderlyBite<span className="text-xs bg-food-secondary text-white px-1 ml-1 rounded">AI</span>
        </div>
        <p className="text-gray-500">Loading delicious options...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
