
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-food-dark text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="text-food-primary">OrderlyBite</span>
              <span className="ml-1 text-xs bg-food-secondary text-white px-1 rounded">AI</span>
            </h3>
            <p className="text-gray-300 text-sm">
              Revolutionizing food ordering with AI-powered recommendations tailored to your taste.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-food-accent">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/" className="hover:text-food-primary transition-colors">Home</Link></li>
              <li><Link to="/restaurants" className="hover:text-food-primary transition-colors">Restaurants</Link></li>
              <li><Link to="/how-it-works" className="hover:text-food-primary transition-colors">How It Works</Link></li>
              <li><Link to="/about" className="hover:text-food-primary transition-colors">About Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-food-accent">Support</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/contact" className="hover:text-food-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-food-primary transition-colors">FAQ</Link></li>
              <li><Link to="/privacy" className="hover:text-food-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-food-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-food-accent">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <Mail size={16} className="mr-2 mt-1 flex-shrink-0" />
                <span>eakarsu@orderlybite.com</span>
              </li>
              <li className="flex items-start">
                <Phone size={16} className="mr-2 mt-1 flex-shrink-0" />
                <span>1 (804) 360-1129</span>
              </li>
              <li className="flex items-start">
                <MapPin size={16} className="mr-2 mt-1 flex-shrink-0" />
                <span>2807 Hampton Woods Dr Henrico 23233</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} OrderlyBite AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
