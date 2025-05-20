
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RestaurantCard from '../components/RestaurantCard';

// Mock data for restaurants - same as in Index.tsx
const restaurantsData = [
  {
    id: "1",
    name: "Pasta Paradise",
    imageUrl: "https://images.unsplash.com/photo-1579684947550-22e945225d9a?q=80&w=1000",
    cuisine: "Italian",
    rating: 4.8,
    deliveryTime: "25-35",
    featured: true
  },
  {
    id: "2",
    name: "Sushi Station",
    imageUrl: "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1000",
    cuisine: "Japanese",
    rating: 4.6,
    deliveryTime: "20-30",
    featured: false
  },
  {
    id: "3",
    name: "Taco Temple",
    imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=1000",
    cuisine: "Mexican",
    rating: 4.5,
    deliveryTime: "15-25",
    featured: false
  },
  {
    id: "4",
    name: "Curry House",
    imageUrl: "https://images.unsplash.com/photo-1631452180539-96aca7d48617?q=80&w=1000",
    cuisine: "Indian",
    rating: 4.7,
    deliveryTime: "30-40",
    featured: true
  },
  {
    id: "5",
    name: "Burger Barn",
    imageUrl: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?q=80&w=1000",
    cuisine: "American",
    rating: 4.3,
    deliveryTime: "15-25",
    featured: false
  },
  {
    id: "6",
    name: "Pizza Palace",
    imageUrl: "https://images.unsplash.com/photo-1593504049359-74330189a345?q=80&w=1000",
    cuisine: "Italian",
    rating: 4.4,
    deliveryTime: "20-30",
    featured: false
  }
];

const Restaurants = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="bg-food-primary/10 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-food-dark mb-2">Our Restaurants</h1>
          <p className="text-gray-600 mb-6">Discover the best restaurants in your area</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-10 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurantsData.map((restaurant) => (
            <RestaurantCard key={restaurant.id} {...restaurant} />
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Restaurants;
