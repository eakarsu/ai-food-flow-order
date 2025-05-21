
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

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
            className="pl-10 border-gray-200 focus-visible:ring-food-primary"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="flex gap-4">
          <div className="w-full md:w-48">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between border-gray-200 bg-white text-gray-700"
                >
                  {categories.find(c => c.value === selectedCategory)?.label || "Categories"}
                  <Search className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[200px] bg-white">
                {categories.map((category) => (
                  <DropdownMenuItem 
                    key={category.value}
                    onClick={() => handleCategoryChange(category.value)}
                    className="cursor-pointer"
                  >
                    {category.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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
