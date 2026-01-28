import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface FoodItemType {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  featured: boolean;
}

interface FeaturedItemsProps {
  items: FoodItemType[];
}

const FeaturedItems = ({ items }: FeaturedItemsProps) => {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const handleAddToCart = (item: FoodItemType) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      imageUrl: item.imageUrl,
    });
    toast.success(`${item.name} added to cart`);
  };

  return (
    <section className="py-20 bg-white">
      <div className="section-container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-food-primary/10 text-food-primary rounded-full text-sm font-semibold mb-4">
            Customer Favorites
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-food-secondary mb-4">
            Popular Menu Items
          </h2>
          <p className="text-food-gray-500 text-lg max-w-2xl mx-auto">
            Discover our most loved dishes, crafted with premium ingredients and passionate attention to detail
          </p>
        </div>

        {/* Food Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="group food-card animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image Container */}
              <div className="relative overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="food-card-image"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Quick Add Button */}
                <button
                  onClick={() => handleAddToCart(item)}
                  className="absolute bottom-4 right-4 w-12 h-12 bg-food-primary text-white rounded-full flex items-center justify-center shadow-lg transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-food-primary-dark hover:scale-110"
                >
                  <Plus size={24} />
                </button>

                {/* Featured Badge */}
                {item.featured && (
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-food-accent text-food-secondary rounded-full text-xs font-bold">
                      <Star size={12} className="fill-current" />
                      Popular
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-display font-bold text-lg text-food-secondary mb-2 group-hover:text-food-primary transition-colors">
                  {item.name}
                </h3>
                <p className="text-food-gray-500 text-sm line-clamp-2 mb-4">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-food-primary">
                    ${item.price.toFixed(2)}
                  </span>
                  <div className="flex items-center gap-1 text-food-accent">
                    <Star size={14} className="fill-current" />
                    <span className="text-sm font-medium text-food-gray-600">4.8</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-16">
          <Button
            onClick={() => navigate('/menu')}
            className="bg-food-secondary hover:bg-food-dark text-white px-10 py-6 text-lg rounded-xl font-semibold transition-all duration-300 hover:-translate-y-0.5"
          >
            View Complete Menu
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedItems;
