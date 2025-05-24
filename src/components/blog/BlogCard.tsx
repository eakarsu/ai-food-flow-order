
import { Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BlogArticle {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  category: string;
  imageUrl: string;
  tags: string[];
  readTime: string;
}

interface BlogCardProps {
  article: BlogArticle;
}

const BlogCard = ({ article }: BlogCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="blog-card h-full flex flex-col hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white">
      <div className="relative overflow-hidden rounded-t-lg">
        <img 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-food-primary text-white px-3 py-1 rounded-full text-sm font-medium">
            {article.category}
          </span>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <h3 className="blog-title text-xl font-bold text-food-dark line-clamp-2 hover:text-food-primary transition-colors">
          {article.title}
        </h3>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
          <div className="flex items-center gap-1">
            <User size={14} />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{formatDate(article.publishDate)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{article.readTime}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="blog-excerpt text-gray-600 line-clamp-3 leading-relaxed">
          {article.excerpt}
        </p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {article.tags.slice(0, 3).map(tag => (
            <span 
              key={tag}
              className="bg-food-light text-food-dark px-2 py-1 rounded text-xs font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          variant="outline" 
          className="w-full group border-food-primary text-food-primary hover:bg-food-primary hover:text-white transition-all duration-300"
        >
          Read More 
          <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BlogCard;
