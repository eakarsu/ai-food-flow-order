import { Search, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  initialQuery?: string;
}

const SearchBar = ({ onSearch, initialQuery = "" }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Real-time search - trigger search on every keystroke
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleSearchClick = () => {
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const popularSearches = ['Gyro', 'Salad', 'Acai Bowl', 'Sandwich'];

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div
        className={`relative bg-white rounded-2xl shadow-soft transition-all duration-300 ${
          isFocused ? 'shadow-soft-lg ring-2 ring-food-primary/20' : ''
        }`}
      >
        <div className="flex items-center">
          <div className="pl-6">
            <Search className={`transition-colors duration-200 ${isFocused ? 'text-food-primary' : 'text-food-gray-400'}`} size={22} />
          </div>
          <input
            type="text"
            placeholder="Search for dishes, cuisines, or ingredients..."
            className="flex-1 px-4 py-5 bg-transparent border-none outline-none text-food-secondary placeholder-food-gray-400 text-lg"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <div className="pr-3">
            <Button
              onClick={handleSearchClick}
              className="bg-food-primary hover:bg-food-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-glow"
            >
              Search
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Popular Searches */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-food-gray-500 text-sm">Popular:</span>
        {popularSearches.map((term) => (
          <button
            key={term}
            onClick={() => {
              setSearchQuery(term);
              if (onSearch) onSearch(term);
            }}
            className="px-4 py-2 bg-white hover:bg-food-primary hover:text-white rounded-full text-sm font-medium text-food-gray-600 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
