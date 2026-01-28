import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Star, Clock, MapPin, Phone, ChefHat, Award, ArrowRight } from 'lucide-react';

interface RestaurantInfoProps {
  restaurant: {
    id: string;
    name: string;
    imageUrl: string;
    cuisine: string;
    rating: number;
    deliveryTime: string;
    featured: boolean;
    description: string;
  };
}

const RestaurantInfo = ({ restaurant }: RestaurantInfoProps) => {
  const navigate = useNavigate();

  const features = [
    { icon: ChefHat, label: 'Made Fresh Daily', description: 'All dishes prepared to order' },
    { icon: Award, label: 'Premium Quality', description: 'Locally sourced ingredients' },
    { icon: Clock, label: 'Fast Service', description: `${restaurant.deliveryTime} min delivery` },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-soft-lg">
              <img
                src={restaurant.imageUrl}
                alt={restaurant.name}
                className="w-full h-[500px] object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

              {/* Rating Badge */}
              <div className="absolute top-6 right-6 bg-white rounded-2xl px-4 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-food-accent fill-food-accent" />
                  <span className="font-bold text-food-secondary text-lg">{restaurant.rating}</span>
                </div>
                <p className="text-xs text-food-gray-500 mt-1">500+ reviews</p>
              </div>

              {/* Featured Badge */}
              {restaurant.featured && (
                <div className="absolute top-6 left-6">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-food-primary text-white rounded-full text-sm font-semibold">
                    <Award size={16} />
                    Featured Restaurant
                  </span>
                </div>
              )}
            </div>

            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 left-6 right-6 bg-white rounded-2xl p-6 shadow-soft-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-food-primary">4.8</p>
                  <p className="text-sm text-food-gray-500">Rating</p>
                </div>
                <div className="border-x border-food-gray-200">
                  <p className="text-2xl font-bold text-food-secondary">15-25</p>
                  <p className="text-sm text-food-gray-500">Min Delivery</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-food-success">$0</p>
                  <p className="text-sm text-food-gray-500">Delivery Fee</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="lg:pl-8">
            {/* Badge */}
            <span className="inline-block px-4 py-2 bg-food-primary/10 text-food-primary rounded-full text-sm font-semibold mb-4">
              About Us
            </span>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl font-display font-bold text-food-secondary mb-4">
              {restaurant.name}
            </h2>

            {/* Cuisine Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {restaurant.cuisine.split(', ').map((cuisine) => (
                <span
                  key={cuisine}
                  className="px-3 py-1 bg-food-gray-100 text-food-gray-600 rounded-full text-sm"
                >
                  {cuisine}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="text-food-gray-600 text-lg leading-relaxed mb-8">
              {restaurant.description} We pride ourselves on using only the freshest ingredients,
              sourced locally whenever possible, to create memorable dining experiences for our customers.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {features.map((feature) => (
                <div key={feature.label} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-food-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-food-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-food-secondary">{feature.label}</h4>
                    <p className="text-food-gray-500 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 mb-8 text-sm text-food-gray-600">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-food-primary" />
                <span>Henrico, VA</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-food-primary" />
                <span>(804) 360-1129</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => navigate('/menu')}
                className="bg-food-primary hover:bg-food-primary-dark text-white px-8 py-6 text-lg rounded-xl font-semibold transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5"
              >
                View Full Menu
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => navigate('/contact')}
                variant="outline"
                className="border-food-gray-300 text-food-secondary hover:bg-food-gray-100 px-8 py-6 text-lg rounded-xl font-semibold"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RestaurantInfo;
