
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  initialQuery?: string;
}

const SearchBar = ({ onSearch, initialQuery = "" }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  
  useEffect(() => {
    // Update the search query when the initial query changes
    setSearchQuery(initialQuery);
  }, [initialQuery]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
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

  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-white p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search for restaurants or dishes..." 
            className="pl-10 border-gray-200 focus-visible:ring-food-primary text-gray-800" 
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            style={{ color: '#333' }}
          />
        </div>
        <Button 
          onClick={handleSearchClick}
          className="bg-food-primary hover:bg-food-primary/90 text-white"
        >
          Search
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
