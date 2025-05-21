
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";

// Single restaurant data - same as in Index.tsx
const restaurantData = {
  id: "1",
  name: "OrderlyBite Deli & Cafe",
  imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000",
  cuisine: "American, Deli, Breakfast",
  rating: 4.8,
  deliveryTime: "15-25",
  featured: true,
  description: "Your local deli serving breakfast, sandwiches, and more. Fresh ingredients, made-to-order meals, and friendly service.",
  phone: "1 (804) 360-1129",
  hours: "Mon-Fri: 6:00 AM - 8:00 PM, Sat-Sun: 7:00 AM - 6:00 PM"
};

const Restaurants = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="bg-food-primary/10 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-food-dark mb-2">Our Restaurant</h1>
          <p className="text-gray-600 mb-6">Serving delicious food since 2010</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-10 flex-grow">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <img 
            src={restaurantData.imageUrl} 
            alt={restaurantData.name}
            className="w-full h-64 object-cover"
          />
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-food-dark">{restaurantData.name}</h2>
                <p className="text-gray-600">{restaurantData.cuisine}</p>
              </div>
              
              <div className="flex items-center bg-green-100 px-3 py-1 rounded mt-2 md:mt-0">
                <span className="font-semibold text-green-800">{restaurantData.rating}</span>
                <span className="text-yellow-500 ml-1">★</span>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">{restaurantData.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold text-food-dark mb-2">Contact</h3>
                <p className="text-gray-600">{restaurantData.phone}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold text-food-dark mb-2">Hours</h3>
                <p className="text-gray-600">{restaurantData.hours}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button
                className="bg-food-primary hover:bg-food-primary/90 text-white"
                onClick={() => navigate('/menu')}
              >
                View Menu
              </Button>
              
              <Button
                variant="outline"
                className="border-food-primary text-food-primary hover:bg-food-primary/10"
                onClick={() => navigate('/contact')}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-food-dark mb-6">Location</h2>
          <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3161.1134241101!2d-77.6402289234138!3d37.60127072532116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDM2JzA0LjYiTiA3N8KwMzgnMTkuMyJX!5e0!3m2!1sen!2sus!4v1716258195874!5m2!1sen!2sus"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Restaurant Location"
            ></iframe>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Restaurants;
