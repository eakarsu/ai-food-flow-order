
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BlogSearch from '../components/blog/BlogSearch';
import BlogHero from '../components/blog/BlogHero';
import BlogGrid from '../components/blog/BlogGrid';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { blogArticles, blogCategories } from '../data/blogArticles';

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredArticles = blogArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const blogStructuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "OrderlyBite Blog",
    "description": "Fresh insights about AI-powered food ordering, restaurant technology, and industry trends",
    "url": "https://orderlybite.com/blog",
    "publisher": {
      "@type": "Organization",
      "name": "OrderlyBite",
      "url": "https://orderlybite.com"
    }
  };

  return (
    <>
      <SEO
        title="AI Food Ordering Blog - Industry Insights & Technology Trends"
        description="Discover the latest in AI-powered food ordering, restaurant technology, and industry insights. Learn how OrderlyBite revolutionizes food delivery."
        keywords="AI food ordering blog, restaurant technology, SMS ordering, phone ordering, food delivery insights"
        type="website"
        structuredData={blogStructuredData}
      />
      
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <BlogHero />

        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs />
        </div>

        <div className="container mx-auto px-4 py-8">
          <BlogSearch 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            categories={blogCategories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        <BlogGrid articles={filteredArticles} />
        <Footer />
      </div>
    </>
  );
};

export default Blog;
