import { useParams, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, User, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { blogArticles } from '../data/blogArticles';

const BlogArticle = () => {
  const { id } = useParams();
  const article = blogArticles.find(article => article.id === parseInt(id || ''));

  if (!article) {
    return <Navigate to="/blog" replace />;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Article Header */}
      <div className="bg-gradient-to-r from-food-primary to-food-secondary text-white py-16">
        <div className="container mx-auto px-4">
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Blog
          </Link>
          
          <div className="max-w-4xl">
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
              {article.category}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex items-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <User size={18} />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>{formatDate(article.publishDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Image */}
      <div className="container mx-auto px-4 -mt-8 mb-8">
        <div className="max-w-4xl mx-auto">
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg shadow-xl"
          />
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <div 
              className="blog-content prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {article.tags.map(tag => (
                  <span 
                    key={tag}
                    className="bg-food-light text-food-dark px-3 py-1 rounded-full text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BlogArticle;
