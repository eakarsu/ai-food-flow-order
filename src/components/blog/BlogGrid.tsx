
import BlogCard from './BlogCard';
import { BlogArticle } from '../../data/blogArticles';

interface BlogGridProps {
  articles: BlogArticle[];
}

const BlogGrid = ({ articles }: BlogGridProps) => {
  return (
    <main className="container mx-auto px-4 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map(article => (
          <BlogCard key={article.id} article={article} />
        ))}
      </div>
      
      {articles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No articles found matching your search criteria.</p>
        </div>
      )}
    </main>
  );
};

export default BlogGrid;
