const LoadingScreen = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-food-secondary">
      <div className="text-center">
        {/* Logo Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-3xl bg-food-primary flex items-center justify-center mx-auto animate-pulse-soft">
            <span className="text-white font-display font-bold text-4xl">O</span>
          </div>
          {/* Spinning ring */}
          <div className="absolute inset-0 w-24 h-24 mx-auto">
            <div className="w-full h-full rounded-3xl border-4 border-transparent border-t-food-accent animate-spin" style={{ animationDuration: '1s' }} />
          </div>
        </div>

        {/* Brand Name */}
        <div className="text-3xl font-display font-bold text-white mb-3">
          OrderlyBite
        </div>

        {/* Loading Text */}
        <p className="text-white/60 text-sm">
          Preparing something delicious...
        </p>

        {/* Loading Dots */}
        <div className="flex justify-center gap-1 mt-6">
          <div className="w-2 h-2 rounded-full bg-food-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-food-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-food-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
