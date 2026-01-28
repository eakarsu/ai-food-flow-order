import { Search, ShoppingBag, Truck, Utensils } from 'lucide-react';

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Browse Menu',
    description: 'Explore our delicious selection of freshly prepared meals, from breakfast favorites to gourmet sandwiches.',
    color: 'food-primary',
  },
  {
    icon: ShoppingBag,
    number: '02',
    title: 'Place Order',
    description: 'Customize your meal to perfection and complete your order with our seamless checkout process.',
    color: 'food-accent',
  },
  {
    icon: Truck,
    number: '03',
    title: 'Fast Delivery',
    description: 'Sit back and relax while we prepare and deliver your meal fresh to your doorstep.',
    color: 'food-success',
  },
  {
    icon: Utensils,
    number: '04',
    title: 'Enjoy!',
    description: 'Savor every bite of your delicious meal, made with love and premium ingredients.',
    color: 'food-secondary',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-food-gray-50">
      <div className="section-container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-food-secondary/10 text-food-secondary rounded-full text-sm font-semibold mb-4">
            Simple Process
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-food-secondary mb-4">
            How It Works
          </h2>
          <p className="text-food-gray-500 text-lg max-w-2xl mx-auto">
            Getting your favorite food delivered is as easy as 1-2-3-4
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative group animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Connector Line (hidden on mobile and last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[60%] w-full h-0.5 bg-gradient-to-r from-food-gray-300 to-transparent" />
              )}

              <div className="bg-white rounded-2xl p-8 shadow-soft card-hover text-center relative z-10">
                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-food-secondary rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-sm">{step.number}</span>
                </div>

                {/* Icon */}
                <div className={`w-20 h-20 rounded-2xl bg-${step.color}/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className={`w-10 h-10 text-${step.color}`} />
                </div>

                {/* Content */}
                <h3 className="font-display font-bold text-xl text-food-secondary mb-3">
                  {step.title}
                </h3>
                <p className="text-food-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 bg-gradient-to-r from-food-primary to-food-primary-dark rounded-3xl p-8 md:p-12 text-white text-center">
          <h3 className="text-2xl md:text-3xl font-display font-bold mb-4">
            Ready to Order?
          </h3>
          <p className="text-white/80 text-lg mb-6 max-w-2xl mx-auto">
            Join thousands of satisfied customers who enjoy fresh, delicious meals delivered right to their door.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold">15-25</div>
              <div className="text-white/70 text-sm">Min Delivery</div>
            </div>
            <div className="w-px bg-white/20 hidden sm:block" />
            <div className="text-center">
              <div className="text-4xl font-bold">500+</div>
              <div className="text-white/70 text-sm">Happy Customers</div>
            </div>
            <div className="w-px bg-white/20 hidden sm:block" />
            <div className="text-center">
              <div className="text-4xl font-bold">4.8</div>
              <div className="text-white/70 text-sm">Star Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
