import { ArrowRight, Clock, Star, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import TwilioContact from '../twilio/TwilioContact';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070"
          alt="Delicious food"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-food-secondary/95 via-food-secondary/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-food-secondary/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 section-container w-full py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-8 animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-food-success rounded-full animate-pulse" />
              <span className="text-sm font-medium">Now accepting orders</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight">
              Delicious Food,
              <span className="block text-food-primary">Delivered Fast</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-white/80 max-w-lg leading-relaxed">
              Experience the finest cuisine from OrderlyBite Deli & Cafe.
              Fresh ingredients, made-to-order meals, delivered right to your door.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-food-primary/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-food-accent fill-food-accent" />
                </div>
                <div>
                  <p className="font-bold">4.8 Rating</p>
                  <p className="text-sm text-white/60">500+ Reviews</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-food-primary/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-food-primary" />
                </div>
                <div>
                  <p className="font-bold">15-25 min</p>
                  <p className="text-sm text-white/60">Delivery Time</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-food-primary/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-food-success" />
                </div>
                <div>
                  <p className="font-bold">Henrico, VA</p>
                  <p className="text-sm text-white/60">Local Delivery</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => navigate('/menu')}
                className="bg-food-primary hover:bg-food-primary-dark text-white px-8 py-6 text-lg rounded-xl font-semibold transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5"
              >
                Order Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => navigate('/menu')}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl font-semibold"
              >
                View Menu
              </Button>
            </div>
          </div>

          {/* Right Content - Contact Card */}
          <div className="hidden lg:block animate-slide-in-right">
            <div className="bg-white rounded-3xl p-8 shadow-soft-lg max-w-md ml-auto">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-food-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📞</span>
                </div>
                <h3 className="text-2xl font-display font-bold text-food-secondary">
                  Order by Phone
                </h3>
                <p className="text-food-gray-500 mt-2">
                  Prefer to order over the phone? We're here to help!
                </p>
              </div>
              <TwilioContact />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-food-light to-transparent z-10" />

      {/* Floating Food Images (decorative) */}
      <div className="absolute top-20 right-10 w-20 h-20 rounded-full bg-food-accent/20 blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-40 left-20 w-32 h-32 rounded-full bg-food-primary/20 blur-3xl animate-pulse-soft" />
    </section>
  );
};

export default Hero;
