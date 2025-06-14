
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbNameMap: Record<string, string> = {
    'menu': 'Menu',
    'about': 'About Us',
    'contact': 'Contact',
    'restaurants': 'Restaurants',
    'blog': 'Blog',
    'faq': 'FAQ',
    'how-it-works': 'How It Works',
    'privacy': 'Privacy Policy',
    'terms': 'Terms of Service'
  };

  if (pathnames.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <Link 
        to="/" 
        className="flex items-center hover:text-food-primary transition-colors duration-200"
      >
        <Home className="w-4 h-4 mr-1" />
        Home
      </Link>
      
      {pathnames.map((pathname, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const breadcrumbName = breadcrumbNameMap[pathname] || pathname.charAt(0).toUpperCase() + pathname.slice(1);

        return (
          <React.Fragment key={pathname}>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {isLast ? (
              <span className="text-food-primary font-medium">
                {breadcrumbName}
              </span>
            ) : (
              <Link 
                to={routeTo}
                className="hover:text-food-primary transition-colors duration-200"
              >
                {breadcrumbName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
