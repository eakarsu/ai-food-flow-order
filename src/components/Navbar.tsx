
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useCart } from '@/context/CartContext';
import Cart from './Cart';
import UserProfile from './UserProfile';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  // Enhanced navigation handler for iOS compatibility
  const handleLinkClick = (path: string, event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    navigate(path);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and Name */}
          <Link to="/" className="flex items-center">
            <span className="text-food-primary font-bold text-2xl">OrderlyBite</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <button 
              onClick={(e) => handleLinkClick('/', e)}
              onTouchEnd={(e) => handleLinkClick('/', e)}
              className="text-gray-700 hover:text-food-primary transition-colors cursor-pointer bg-transparent border-none p-0 font-inherit"
            >
              Home
            </button>
            <button 
              onClick={(e) => handleLinkClick('/restaurants', e)}
              onTouchEnd={(e) => handleLinkClick('/restaurants', e)}
              className="text-gray-700 hover:text-food-primary transition-colors cursor-pointer bg-transparent border-none p-0 font-inherit"
            >
              Restaurant
            </button>
            <button 
              onClick={(e) => handleLinkClick('/blog', e)}
              onTouchEnd={(e) => handleLinkClick('/blog', e)}
              className="text-gray-700 hover:text-food-primary transition-colors cursor-pointer bg-transparent border-none p-0 font-inherit"
            >
              Blog
            </button>
            <button 
              onClick={(e) => handleLinkClick('/about', e)}
              onTouchEnd={(e) => handleLinkClick('/about', e)}
              className="text-gray-700 hover:text-food-primary transition-colors cursor-pointer bg-transparent border-none p-0 font-inherit"
            >
              About
            </button>
            <button 
              onClick={(e) => handleLinkClick('/contact', e)}
              onTouchEnd={(e) => handleLinkClick('/contact', e)}
              className="text-gray-700 hover:text-food-primary transition-colors cursor-pointer bg-transparent border-none p-0 font-inherit"
            >
              Contact
            </button>
          </div>
          
          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsProfileOpen(true)}
              className="text-gray-700 hover:text-food-primary hover:bg-gray-100"
            >
              <User size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsCartOpen(true)}
              className="text-gray-700 hover:text-food-primary hover:bg-gray-100 relative"
            >
              <ShoppingCart size={20} />
              <span className="absolute -top-1 -right-1 bg-food-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getTotalItems()}
              </span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleMenu}
              className="md:hidden text-gray-700 hover:text-food-primary hover:bg-gray-100"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-fade-in">
            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => handleNavigation('/')}
                onTouchEnd={() => handleNavigation('/')}
                className="text-gray-700 py-2 px-3 hover:bg-gray-100 rounded-md text-left w-full bg-transparent border-none cursor-pointer"
              >
                Home
              </button>
              <button 
                onClick={() => handleNavigation('/restaurants')}
                onTouchEnd={() => handleNavigation('/restaurants')}
                className="text-gray-700 py-2 px-3 hover:bg-gray-100 rounded-md text-left w-full bg-transparent border-none cursor-pointer"
              >
                Restaurant
              </button>
              <button 
                onClick={() => handleNavigation('/blog')}
                onTouchEnd={() => handleNavigation('/blog')}
                className="text-gray-700 py-2 px-3 hover:bg-gray-100 rounded-md text-left w-full bg-transparent border-none cursor-pointer"
              >
                Blog
              </button>
              <button 
                onClick={() => handleNavigation('/about')}
                onTouchEnd={() => handleNavigation('/about')}
                className="text-gray-700 py-2 px-3 hover:bg-gray-100 rounded-md text-left w-full bg-transparent border-none cursor-pointer"
              >
                About
              </button>
              <button 
                onClick={() => handleNavigation('/contact')}
                onTouchEnd={() => handleNavigation('/contact')}
                className="text-gray-700 py-2 px-3 hover:bg-gray-100 rounded-md text-left w-full bg-transparent border-none cursor-pointer"
              >
                Contact
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Sheet */}
      <UserProfile open={isProfileOpen} onOpenChange={setIsProfileOpen} />
      
      {/* Shopping Cart Sheet */}
      <Cart open={isCartOpen} onOpenChange={setIsCartOpen} />
    </nav>
  );
};

export default Navbar;
