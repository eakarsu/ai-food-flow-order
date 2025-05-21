
import { Search, Coffee, Bottle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onCategoryChange?: (category: string) => void;
}

const SearchBar = ({ onSearch, onCategoryChange }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "italian", label: "Italian" },
    { value: "chinese", label: "Chinese" },
    { value: "indian", label: "Indian" },
    { value: "mexican", label: "Mexican" },
    { value: "japanese", label: "Japanese" },
    { value: "drinks", label: "Drinks" },
    { value: "bottled drinks", label: "Bottled Drinks" },
    { value: "coffee", label: "Coffee" },
    { value: "tea", label: "Tea" },
    { value: "iced tea", label: "Iced Tea and Lemonade" },
    { value: "desserts", label: "Desserts" },
  ];
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };
  
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
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
            className="pl-10 border-gray-200 focus-visible:ring-food-primary text-gray-800" 
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="flex gap-4">
          <div className="w-full md:w-48">
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full border-gray-200 bg-white text-gray-700">
                <SelectValue placeholder="Categories" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {categories.map((category) => (
                  <SelectItem 
                    key={category.value} 
                    value={category.value}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    {category.label}
                  </SelectItem>
                ))}
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
