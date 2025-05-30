
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbNameMap: { [key: string]: string } = {
    menu: 'Menu',
    about: 'About',
    contact: 'Contact',
    blog: 'Blog',
    restaurants: 'Restaurants',
    faq: 'FAQ',
    'how-it-works': 'How It Works',
    'privacy-policy': 'Privacy Policy',
    'terms-of-service': 'Terms of Service'
  };

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <Link to="/" className="flex items-center hover:text-food-primary transition-colors">
        <Home size={16} className="mr-1" />
        Home
      </Link>
      
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = breadcrumbNameMap[name] || name.charAt(0).toUpperCase() + name.slice(1);

        return (
          <React.Fragment key={name}>
            <ChevronRight size={16} className="text-gray-400" />
            {isLast ? (
              <span className="text-food-primary font-medium">{displayName}</span>
            ) : (
              <Link 
                to={routeTo} 
                className="hover:text-food-primary transition-colors"
              >
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
