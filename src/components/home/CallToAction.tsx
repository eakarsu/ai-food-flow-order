import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Clock, Shield } from 'lucide-react';

const CallToAction = () => {
  const navigate = useNavigate();

  const benefits = [
    { icon: Smartphone, text: 'Easy mobile ordering' },
    { icon: Clock, text: 'Fast 15-25 min delivery' },
    { icon: Shield, text: 'Secure payment' },
  ];

  return (
    <section className="py-20 bg-food-secondary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-food-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-food-accent rounded-full blur-3xl" />
      </div>

      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-food-success rounded-full animate-pulse" />
            <span className="text-white/80 text-sm font-medium">Order now & get free delivery</span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
            Ready to taste the
            <span className="block text-food-primary">difference?</span>
          </h2>

          {/* Subheadline */}
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of satisfied customers who enjoy fresh, delicious meals
            delivered right to their doorstep. Your next favorite meal is just a click away.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {benefits.map((benefit) => (
              <div
                key={benefit.text}
                className="flex items-center gap-2 text-white/80"
              >
                <div className="w-8 h-8 rounded-lg bg-food-primary/20 flex items-center justify-center">
                  <benefit.icon size={16} className="text-food-primary" />
                </div>
                <span className="text-sm font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => navigate('/menu')}
              className="bg-food-primary hover:bg-food-primary-dark text-white px-10 py-7 text-lg rounded-xl font-semibold transition-all duration-300 hover:shadow-glow hover:-translate-y-1"
            >
              Order Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={() => navigate('/restaurants')}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 px-10 py-7 text-lg rounded-xl font-semibold"
            >
              Explore Menu
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-white/40 text-sm mb-4">Trusted by food lovers everywhere</p>
            <div className="flex flex-wrap justify-center gap-8 text-white/60">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">500+</p>
                <p className="text-sm">Happy Customers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">4.8</p>
                <p className="text-sm">Average Rating</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">15min</p>
                <p className="text-sm">Avg. Delivery</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">100%</p>
                <p className="text-sm">Fresh Ingredients</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
