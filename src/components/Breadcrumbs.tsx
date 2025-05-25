
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbNameMap: { [key: string]: string } = {
    'restaurants': 'Restaurant',
    'menu': 'Menu',
    'blog': 'Blog',
    'about': 'About',
    'contact': 'Contact',
    'how-it-works': 'How It Works',
    'faq': 'FAQ',
    'privacy': 'Privacy Policy',
    'terms': 'Terms of Service'
  };

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      <Link to="/" className="flex items-center hover:text-food-primary">
        <Home size={16} />
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const name = breadcrumbNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

        return (
          <div key={to} className="flex items-center space-x-2">
            <ChevronRight size={16} className="text-gray-400" />
            {isLast ? (
              <span className="text-gray-900 font-medium">{name}</span>
            ) : (
              <Link to={to} className="hover:text-food-primary">
                {name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
