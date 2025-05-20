
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-food-dark text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="text-food-primary">BiteBot</span>
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
                <span className="mr-2">📧</span>
                <span>support@bitebot.com</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📱</span>
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🏙️</span>
                <span>123 Food Street, Tasteville, TC 98765</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} BiteBot AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
