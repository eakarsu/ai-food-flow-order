
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface BlogSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const BlogSearch = ({ 
  searchTerm, 
  onSearchChange, 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: BlogSearchProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search articles, tags, or topics..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border-2 border-gray-200 focus:border-food-primary rounded-lg"
          />
        </div>
        
        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category)}
              className={`transition-all duration-200 ${
                selectedCategory === category 
                  ? 'bg-food-primary hover:bg-food-primary/90 text-white' 
                  : 'border-food-primary text-food-primary hover:bg-food-primary hover:text-white'
              }`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogSearch;
