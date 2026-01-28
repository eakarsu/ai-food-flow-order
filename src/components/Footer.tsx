import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, Facebook, Twitter, Instagram, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/restaurants', label: 'Restaurant' },
    { to: '/about', label: 'About Us' },
    { to: '/blog', label: 'Blog' },
  ];

  const supportLinks = [
    { to: '/contact', label: 'Contact Us' },
    { to: '/faq', label: 'FAQ' },
    { to: '/privacy', label: 'Privacy Policy' },
    { to: '/terms', label: 'Terms of Service' },
    { to: '/how-it-works', label: 'How It Works' },
  ];

  return (
    <footer className="bg-food-secondary text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="section-container py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-display font-bold mb-2">
                Get exclusive offers & updates
              </h3>
              <p className="text-white/60">
                Subscribe to our newsletter for special deals and new menu items
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-food-primary focus:ring-2 focus:ring-food-primary/20"
              />
              <Button className="bg-food-primary hover:bg-food-primary-dark text-white px-6 py-3 rounded-xl font-semibold whitespace-nowrap">
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-food-primary flex items-center justify-center">
                <span className="text-white font-bold text-xl">O</span>
              </div>
              <span className="font-display font-bold text-2xl">OrderlyBite</span>
            </div>
            <p className="text-white/60 leading-relaxed mb-6">
              Revolutionizing food ordering with AI-powered recommendations tailored to your taste preferences and dietary needs.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-food-primary flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-food-primary flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-food-primary flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/60 hover:text-food-primary transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-food-primary mr-0 group-hover:mr-2 transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6">Support</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/60 hover:text-food-primary transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-food-primary mr-0 group-hover:mr-2 transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-food-primary" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">
                    2807 Hampton Woods Dr<br />
                    Henrico, VA 23233
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-food-primary" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">+1 (804) 360-1129</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-food-primary" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">support@orderlybite.com</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-food-primary" />
                </div>
                <div className="text-white/60 text-sm">
                  <p>Mon-Fri: 9am - 6pm</p>
                  <p>Sat: 10am - 4pm</p>
                  <p>Sun: Closed</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="section-container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
            <p>&copy; {currentYear} OrderlyBite. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="hover:text-food-primary transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-food-primary transition-colors">
                Terms
              </Link>
              <span>Made with love in Virginia</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
