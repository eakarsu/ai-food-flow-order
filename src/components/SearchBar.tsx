
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onCategoryChange?: (category: string) => void;
}

const SearchBar = ({ onSearch, onCategoryChange }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };
  
  const handleCategoryChange = (value: string) => {
    if (onCategoryChange) {
      onCategoryChange(value);
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

  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-white p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search for restaurants or dishes..." 
            className="pl-10 border-gray-200 focus-visible:ring-food-primary"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="flex gap-4">
          <div className="w-full md:w-48">
            <Select defaultValue="all" onValueChange={handleCategoryChange}>
              <SelectTrigger className="border-gray-200 focus:ring-food-primary">
                <SelectValue placeholder="Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="italian">Italian</SelectItem>
                <SelectItem value="chinese">Chinese</SelectItem>
                <SelectItem value="indian">Indian</SelectItem>
                <SelectItem value="mexican">Mexican</SelectItem>
                <SelectItem value="japanese">Japanese</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleSearchClick}
            className="bg-food-primary hover:bg-food-primary/90 text-white"
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
