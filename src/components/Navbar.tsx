
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleCartClick = () => {
    toast({
      title: "Coming Soon!",
      description: "Cart functionality will be available soon.",
    });
  };
  
  const handleProfileClick = () => {
    toast({
      title: "Coming Soon!",
      description: "User profiles will be available soon.",
    });
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and Name */}
          <Link to="/" className="flex items-center">
            <span className="text-food-primary font-bold text-2xl">BiteBot</span>
            <span className="ml-1 text-xs bg-food-secondary text-white px-1 rounded">AI</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <Link to="/" className="text-gray-700 hover:text-food-primary transition-colors">Home</Link>
            <Link to="/" className="text-gray-700 hover:text-food-primary transition-colors">Restaurants</Link>
            <Link to="/" className="text-gray-700 hover:text-food-primary transition-colors">About</Link>
            <Link to="/" className="text-gray-700 hover:text-food-primary transition-colors">Contact</Link>
          </div>
          
          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleProfileClick}
              className="text-gray-700 hover:text-food-primary hover:bg-gray-100"
            >
              <User size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleCartClick}
              className="text-gray-700 hover:text-food-primary hover:bg-gray-100 relative"
            >
              <ShoppingCart size={20} />
              <span className="absolute -top-1 -right-1 bg-food-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
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
              <Link to="/" className="text-gray-700 py-2 px-3 hover:bg-gray-100 rounded-md" onClick={toggleMenu}>Home</Link>
              <Link to="/" className="text-gray-700 py-2 px-3 hover:bg-gray-100 rounded-md" onClick={toggleMenu}>Restaurants</Link>
              <Link to="/" className="text-gray-700 py-2 px-3 hover:bg-gray-100 rounded-md" onClick={toggleMenu}>About</Link>
              <Link to="/" className="text-gray-700 py-2 px-3 hover:bg-gray-100 rounded-md" onClick={toggleMenu}>Contact</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
