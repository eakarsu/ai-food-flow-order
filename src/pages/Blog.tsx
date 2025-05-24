
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BlogCard from '../components/blog/BlogCard';
import BlogSearch from '../components/blog/BlogSearch';

const blogArticles = [
  {
    id: 1,
    title: "The Art of Perfect Sandwich Making: Tips from Our Kitchen",
    excerpt: "Discover the secrets behind creating the perfect sandwich. From choosing the right bread to layering techniques that make every bite memorable.",
    content: "At OrderlyBite, we believe that sandwich making is truly an art form. It starts with selecting the perfect foundation - our artisan breads are baked fresh daily, providing the ideal canvas for culinary creativity. The key to a great sandwich lies in the balance of flavors, textures, and temperatures...",
    author: "Chef Maria Rodriguez",
    publishDate: "2024-01-15",
    category: "Cooking Tips",
    imageUrl: "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?q=80&w=1000",
    tags: ["sandwich", "cooking", "tips", "recipes"],
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "Farm to Table: Our Commitment to Fresh, Local Ingredients",
    excerpt: "Learn about our partnerships with local farmers and how we ensure every ingredient meets our high standards for freshness and sustainability.",
    content: "When you bite into one of our dishes, you're tasting the result of careful relationships we've built with local farmers and suppliers. Our commitment to farm-to-table dining isn't just a trend - it's a philosophy that drives everything we do at OrderlyBite...",
    author: "David Chen",
    publishDate: "2024-01-10",
    category: "Sustainability",
    imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1000",
    tags: ["local", "fresh", "sustainability", "farming"],
    readTime: "7 min read"
  },
  {
    id: 3,
    title: "Healthy Eating Made Easy: Our New Superfood Menu Items",
    excerpt: "Explore our latest menu additions featuring nutrient-packed superfoods that don't compromise on taste. Healthy eating has never been this delicious.",
    content: "Eating healthy doesn't mean sacrificing flavor, and our new superfood menu items prove just that. We've carefully crafted each dish to maximize nutritional value while delivering the bold, satisfying tastes our customers love...",
    author: "Nutritionist Sarah Johnson",
    publishDate: "2024-01-05",
    category: "Health & Nutrition",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000",
    tags: ["health", "superfoods", "nutrition", "wellness"],
    readTime: "6 min read"
  }
];

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Cooking Tips', 'Sustainability', 'Health & Nutrition'];

  const filteredArticles = blogArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Blog Hero Section */}
      <div className="bg-gradient-to-r from-food-primary to-food-secondary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">OrderlyBite Blog</h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Fresh insights, cooking tips, and stories from our kitchen to yours
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 py-8">
        <BlogSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* Blog Articles Grid */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map(article => (
            <BlogCard key={article.id} article={article} />
          ))}
        </div>
        
        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No articles found matching your search criteria.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Blog;
