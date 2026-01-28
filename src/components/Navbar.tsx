import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogIn, Package, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Cart from './Cart';
import UserProfile from './UserProfile';
import { AuthModal } from './AuthModal';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { getTotalItems } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/menu', label: 'Menu' },
    { path: '/restaurants', label: 'Restaurant' },
    { path: '/blog', label: 'Blog' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md ${
        isScrolled
          ? 'bg-white/95 shadow-soft py-2'
          : 'bg-black/20 py-4'
      }`}
    >
      <div className="section-container">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isScrolled ? 'bg-food-primary' : 'bg-white'
            }`}>
              <span className={`text-xl font-bold ${isScrolled ? 'text-white' : 'text-food-primary'}`}>
                O
              </span>
            </div>
            <span className={`font-display font-bold text-xl transition-colors duration-300 ${
              isScrolled ? 'text-food-secondary' : 'text-white'
            }`}>
              OrderlyBite
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNavigation(link.path)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? isScrolled
                      ? 'text-food-primary bg-food-primary/10'
                      : 'text-white bg-white/20'
                    : isScrolled
                    ? 'text-food-gray-600 hover:text-food-primary hover:bg-food-gray-100'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/orders')}
                  className={`rounded-xl transition-all duration-200 ${
                    isScrolled
                      ? 'text-food-gray-600 hover:text-food-primary hover:bg-food-gray-100'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  title="My Orders"
                >
                  <Package size={20} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/automated-calls')}
                  className={`rounded-xl transition-all duration-200 ${
                    isScrolled
                      ? 'text-food-gray-600 hover:text-food-primary hover:bg-food-gray-100'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  title="Automated Calls"
                >
                  <Phone size={20} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsProfileOpen(true)}
                  className={`rounded-xl transition-all duration-200 ${
                    isScrolled
                      ? 'text-food-gray-600 hover:text-food-primary hover:bg-food-gray-100'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  title={user?.firstName || 'Profile'}
                >
                  <User size={20} />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAuthModalOpen(true)}
                className={`rounded-xl font-medium transition-all duration-200 ${
                  isScrolled
                    ? 'text-food-gray-600 hover:text-food-primary hover:bg-food-gray-100'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <LogIn size={18} className="mr-2" />
                Sign In
              </Button>
            )}

            {/* Cart Button */}
            <Button
              onClick={() => setIsCartOpen(true)}
              className={`relative rounded-xl font-medium transition-all duration-300 ${
                isScrolled
                  ? 'bg-food-primary text-white hover:bg-food-primary-dark'
                  : 'bg-white text-food-primary hover:bg-white/90'
              }`}
            >
              <ShoppingCart size={18} className="mr-2" />
              <span className="hidden sm:inline">Cart</span>
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-food-accent text-food-secondary text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className={`lg:hidden rounded-xl transition-all duration-200 ${
                isScrolled
                  ? 'text-food-gray-600 hover:text-food-primary hover:bg-food-gray-100'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 animate-slide-up">
            <div className="bg-white rounded-2xl shadow-soft-lg p-4 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => handleNavigation(link.path)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'text-food-primary bg-food-primary/10'
                      : 'text-food-gray-700 hover:bg-food-gray-100'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              {isAuthenticated && (
                <>
                  <hr className="my-2 border-food-gray-200" />
                  <button
                    onClick={() => handleNavigation('/orders')}
                    className="w-full text-left px-4 py-3 rounded-xl font-medium text-food-gray-700 hover:bg-food-gray-100 flex items-center gap-2"
                  >
                    <Package size={18} />
                    My Orders
                  </button>
                  <button
                    onClick={() => handleNavigation('/automated-calls')}
                    className="w-full text-left px-4 py-3 rounded-xl font-medium text-food-gray-700 hover:bg-food-gray-100 flex items-center gap-2"
                  >
                    <Phone size={18} />
                    Automated Calls
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <>
                  <hr className="my-2 border-food-gray-200" />
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl font-medium text-food-primary hover:bg-food-primary/10 flex items-center gap-2"
                  >
                    <LogIn size={18} />
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Profile Sheet */}
      <UserProfile open={isProfileOpen} onOpenChange={setIsProfileOpen} />

      {/* Shopping Cart Sheet */}
      <Cart open={isCartOpen} onOpenChange={setIsCartOpen} />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
};

export default Navbar;
