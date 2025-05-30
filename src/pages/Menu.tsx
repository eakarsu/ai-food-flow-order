import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MenuCategory, { MenuItem } from '../components/MenuCategory';
import SearchBar from '../components/SearchBar';

// Rules data structure
const rulesData = {
  "BYO Breakfast": {
    "Bagel Options": {
      rule: "Select 1",
      options: [
        { name: "Cinnamon Raisin (Small)", price: 1.50 },
        { name: "Egg (Small)", price: 1.50 },
        { name: "Egg Everything (Small)", price: 1.50 },
        { name: "Everything (Small)", price: 1.50 },
        { name: "Garlic (Small)", price: 1.50 },
        { name: "Multigrain (Small)", price: 1.50 },
        { name: "Onion (Small)", price: 1.50 },
        { name: "Plain (Small)", price: 1.50 },
        { name: "Poppy (Small)", price: 1.50 },
        { name: "Pumpernickel (Small)", price: 1.50 },
        { name: "Salt (Small)", price: 1.50 },
        { name: "Sesame (Small)", price: 1.50 },
        { name: "Wheat (Small)", price: 1.50 },
        { name: "Whole Wheat (Small)", price: 1.50 }
      ]
    },
    "Bagel Spreads": {
      rule: "select 1 to 6",
      options: [
        { name: "Bacon (Small)", price: 4.00 },
        { name: "Butter (Small)", price: 1.00 },
        { name: "Cream Cheese (Small)", price: 2.00 },
        { name: "Cream Cheese Bacon Scallion (Small)", price: 3.00 },
        { name: "Cream Cheese Blueberry (Small)", price: 3.00 },
        { name: "Cream Cheese Chive (Small)", price: 3.00 },
        { name: "Cream Cheese Honey Walnut (Small)", price: 3.00 },
        { name: "Cream Cheese Jalapeno (Small)", price: 3.00 },
        { name: "Cream Cheese Lite (Small)", price: 3.00 },
        { name: "Cream Cheese Lox Spread (Small)", price: 3.00 },
        { name: "Cream Cheese Olive (Small)", price: 3.00 },
        { name: "Cream Cheese Scallion (Small)", price: 3.00 },
        { name: "Cream Cheese Strawberry (Small)", price: 3.00 },
        { name: "Cream Cheese Sundried Tomato (Small)", price: 3.00 },
        { name: "Cream Cheese Vegetable (Small)", price: 3.00 },
        { name: "Egg Salad (Small)", price: 3.00 },
        { name: "Grape Jelly (Small)", price: 1.00 },
        { name: "Ham (Small)", price: 4.00 },
        { name: "Honey (Small)", price: 1.00 },
        { name: "Hummus (Small)", price: 2.00 },
        { name: "Peanut Butter (Small)", price: 2.00 },
        { name: "Sausage (Small)", price: 4.00 },
        { name: "Strawberry Jelly (Small)", price: 1.00 },
        { name: "Turkey (Small)", price: 4.00 }
      ]
    },
    "Breakfast Add-ons": {
      rule: "Select up to 10",
      options: [
        { name: "Avocado (Medium)", price: 2.00 },
        { name: "Bacon (Medium)", price: 2.00 },
        { name: "Banana Peppers (Medium)", price: 0.50 },
        { name: "Black Olives (Medium)", price: 0.50 },
        { name: "Broccoli (Medium)", price: 0.50 },
        { name: "Carrots (Medium)", price: 0.50 },
        { name: "Cheddar Cheese (Medium)", price: 1.00 },
        { name: "Chicken Cutlet (Medium)", price: 3.00 },
        { name: "Cucumbers (Medium)", price: 0.50 },
        { name: "Feta Cheese (Medium)", price: 1.00 },
        { name: "Green Peppers (Medium)", price: 0.50 },
        { name: "Grilled Chicken (Medium)", price: 3.00 },
        { name: "Ham (Medium)", price: 2.00 },
        { name: "Hot Peppers (Medium)", price: 0.50 },
        { name: "Jalapenos (Medium)", price: 0.50 },
        { name: "Lettuce (Medium)", price: 0.50 },
        { name: "Mozzarella Cheese (Medium)", price: 1.00 },
        { name: "Mushrooms (Medium)", price: 0.50 },
        { name: "Onions (Medium)", price: 0.50 },
        { name: "Pepperoni (Medium)", price: 2.00 },
        { name: "Pickles (Medium)", price: 0.50 },
        { name: "Provolone Cheese (Medium)", price: 1.00 },
        { name: "Red Onions (Medium)", price: 0.50 },
        { name: "Red Peppers (Medium)", price: 0.50 },
        { name: "Roast Beef (Medium)", price: 2.00 },
        { name: "Salami (Medium)", price: 2.00 },
        { name: "Sausage (Medium)", price: 2.00 },
        { name: "Spinach (Medium)", price: 0.50 },
        { name: "Swiss Cheese (Medium)", price: 1.00 },
        { name: "Tomatoes (Medium)", price: 0.50 },
        { name: "Turkey (Medium)", price: 2.00 }
      ]
    },
    "Breakfast Bread": {
      rule: "Select 1",
      options: [
        { name: "Bagel (Medium)", price: 0.00 },
        { name: "Brioche Roll (Medium)", price: 0.00 },
        { name: "Croissant (Medium)", price: 1.00 },
        { name: "English Muffin (Medium)", price: 0.00 },
        { name: "Hard Roll (Medium)", price: 0.00 },
        { name: "Hero (Medium)", price: 1.00 },
        { name: "Plain Wrap (Medium)", price: 0.00 },
        { name: "Rye Bread (Medium)", price: 0.00 },
        { name: "Sourdough Bread (Medium)", price: 0.00 },
        { name: "White Bread (Medium)", price: 0.00 },
        { name: "Whole Wheat Bread (Medium)", price: 0.00 },
        { name: "Whole Wheat Wrap (Medium)", price: 0.00 }
      ]
    },
    "Breakfast Cheese": {
      rule: "Select up to 2",
      options: [
        { name: "American Cheese (Medium)", price: 1.00 },
        { name: "Cheddar Cheese (Medium)", price: 1.00 },
        { name: "Feta Cheese (Medium)", price: 1.00 },
        { name: "Mozzarella Cheese (Medium)", price: 1.00 },
        { name: "Pepper Jack Cheese (Medium)", price: 1.00 },
        { name: "Provolone Cheese (Medium)", price: 1.00 },
        { name: "Swiss Cheese (Medium)", price: 1.00 }
      ]
    },
    "Breakfast Dressing": {
      rule: "Select up to 2",
      options: [
        { name: "BBQ Sauce (Medium)", price: 0.00 },
        { name: "Blue Cheese (Medium)", price: 0.00 },
        { name: "Chipotle Mayo (Medium)", price: 0.00 },
        { name: "Honey Mustard (Medium)", price: 0.00 },
        { name: "Hot Sauce (Medium)", price: 0.00 },
        { name: "Italian (Medium)", price: 0.00 },
        { name: "Ketchup (Medium)", price: 0.00 },
        { name: "Mayo (Medium)", price: 0.00 },
        { name: "Mustard (Medium)", price: 0.00 },
        { name: "Ranch (Medium)", price: 0.00 },
        { name: "Russian (Medium)", price: 0.00 },
        { name: "Salsa (Medium)", price: 0.00 },
        { name: "Spicy Mayo (Medium)", price: 0.00 }
      ]
    },
    "Breakfast Egg Option": {
      rule: "Select 1",
      options: [
        { name: "Egg (Medium)", price: 0.00 },
        { name: "Egg Whites (Medium)", price: 1.00 },
        { name: "No Egg (Medium)", price: 0.00 }
      ]
    },
    "Breakfast Egg Quantity": {
      rule: "Select 1",
      options: [
        { name: "1 Egg (Medium)", price: 0.00 },
        { name: "2 Eggs (Medium)", price: 1.00 },
        { name: "3 Eggs (Medium)", price: 2.00 },
        { name: "4 Eggs (Medium)", price: 3.00 },
        { name: "5 Eggs (Medium)", price: 4.00 }
      ]
    },
    "Breakfast Meat": {
      rule: "Select up to 3",
      options: [
        { name: "Bacon (Medium)", price: 2.00 },
        { name: "Chicken Cutlet (Medium)", price: 3.00 },
        { name: "Grilled Chicken (Medium)", price: 3.00 },
        { name: "Ham (Medium)", price: 2.00 },
        { name: "Pepperoni (Medium)", price: 2.00 },
        { name: "Roast Beef (Medium)", price: 2.00 },
        { name: "Salami (Medium)", price: 2.00 },
        { name: "Sausage (Medium)", price: 2.00 },
        { name: "Turkey (Medium)", price: 2.00 }
      ]
    }
  },
  "BYO Sandwiches": {
    "Bread": {
      rule: "Select 1",
      options: [
        { name: "Cinnamon Raisin Bagel (Medium)", price: 0.50 },
        { name: "Croissant (Medium)", price: 2.00 },
        { name: "Egg Bagel (Medium)", price: 0.50 },
        { name: "Egg Everything Bagel (Medium)", price: 0.50 },
        { name: "Everything Bagel (Medium)", price: 0.50 },
        { name: "Garlic Bagel (Medium)", price: 0.50 },
        { name: "Garlic Hero (Medium)", price: 0.00 },
        { name: "Gluten Free Bread (Medium)", price: 2.00 },
        { name: "Hard Roll (Medium)", price: 0.00 },
        { name: "Hero (Medium)", price: 0.00 },
        { name: "Multigrain Bagel (Medium)", price: 0.50 },
        { name: "Onion Bagel (Medium)", price: 0.50 },
        { name: "Plain Bagel (Medium)", price: 0.50 },
        { name: "Plain Wrap (Medium)", price: 0.00 },
        { name: "Poppy Bagel (Medium)", price: 0.50 },
        { name: "Pumpernickel Bagel (Medium)", price: 0.50 },
        { name: "Rye Bread (Medium)", price: 0.00 },
        { name: "Salt Bagel (Medium)", price: 0.50 },
        { name: "Sesame Bagel (Medium)", price: 0.50 },
        { name: "Sourdough Bread (Medium)", price: 0.00 },
        { name: "Wheat Bagel (Medium)", price: 0.50 },
        { name: "White Bread (Medium)", price: 0.00 },
        { name: "Whole Wheat Bagel (Medium)", price: 0.50 },
        { name: "Whole Wheat Bread (Medium)", price: 0.00 },
        { name: "Whole Wheat Wrap (Medium)", price: 0.00 }
      ]
    },
    "Cheese": {
      rule: "Select up to 5",
      options: [
        { name: "American Cheese (Medium)", price: 1.00 },
        { name: "Blue Cheese Crumble (Medium)", price: 1.00 },
        { name: "Cheddar Cheese (Medium)", price: 1.00 },
        { name: "Feta Cheese (Medium)", price: 1.00 },
        { name: "Fresh Mozzarella (Medium)", price: 2.00 },
        { name: "Mozzarella Cheese (Medium)", price: 1.00 },
        { name: "Muenster Cheese (Medium)", price: 1.00 },
        { name: "Parmesan Cheese (Medium)", price: 1.00 },
        { name: "Pepper Jack Cheese (Medium)", price: 1.00 },
        { name: "Provolone Cheese (Medium)", price: 1.00 },
        { name: "Swiss Cheese (Medium)", price: 1.00 }
      ]
    },
    "Protein": {
      rule: "Select up to 5",
      options: [
        { name: "Bacon (Medium)", price: 2.00 },
        { name: "Boar's Head Bologna (Medium)", price: 2.00 },
        { name: "Boar's Head Buffalo Chicken (Medium)", price: 2.00 },
        { name: "Boar's Head Cajun Roast Beef (Medium)", price: 2.00 },
        { name: "Boar's Head Chicken (Medium)", price: 2.00 },
        { name: "Boar's Head Corned Beef (Medium)", price: 2.00 },
        { name: "Boar's Head Genoa Salami (Medium)", price: 2.00 },
        { name: "Boar's Head Ham (Medium)", price: 2.00 },
        { name: "Boar's Head Honey Ham (Medium)", price: 2.00 },
        { name: "Boar's Head Honey Turkey (Medium)", price: 2.00 },
        { name: "Boar's Head Liverwurst (Medium)", price: 2.00 },
        { name: "Boar's Head Pastrami (Medium)", price: 2.00 },
        { name: "Boar's Head Pepperoni (Medium)", price: 2.00 },
        { name: "Boar's Head Prosciutto (Medium)", price: 3.00 },
        { name: "Boar's Head Roast Beef (Medium)", price: 2.00 },
        { name: "Boar's Head Salami (Medium)", price: 2.00 },
        { name: "Boar's Head Sopressata (Medium)", price: 3.00 },
        { name: "Boar's Head Turkey (Medium)", price: 2.00 },
        { name: "Chicken Cutlet (Medium)", price: 3.00 },
        { name: "Chicken Salad (Medium)", price: 2.00 },
        { name: "Egg Salad (Medium)", price: 2.00 },
        { name: "Grilled Chicken (Medium)", price: 3.00 },
        { name: "Tuna Salad (Medium)", price: 2.00 }
      ]
    },
    "Toppings": {
      rule: "Select up to 10",
      options: [
        { name: "Avocado (Medium)", price: 2.00 },
        { name: "Banana Peppers (Medium)", price: 0.50 },
        { name: "Black Olives (Medium)", price: 0.50 },
        { name: "Carrots (Medium)", price: 0.50 },
        { name: "Coleslaw (Medium)", price: 1.00 },
        { name: "Cucumbers (Medium)", price: 0.50 },
        { name: "Fried Onions (Medium)", price: 0.50 },
        { name: "Green Peppers (Medium)", price: 0.50 },
        { name: "Hot Peppers (Medium)", price: 0.50 },
        { name: "Jalapenos (Medium)", price: 0.50 },
        { name: "Lettuce (Medium)", price: 0.50 },
        { name: "Macaroni Salad (Medium)", price: 1.00 },
        { name: "Mushrooms (Medium)", price: 0.50 },
        { name: "Oil & Vinegar (Medium)", price: 0.00 },
        { name: "Onions (Medium)", price: 0.50 },
        { name: "Pickles (Medium)", price: 0.50 },
        { name: "Potato Salad (Medium)", price: 1.00 },
        { name: "Red Onions (Medium)", price: 0.50 },
        { name: "Roasted Red Peppers (Medium)", price: 1.00 },
        { name: "Salt & Pepper (Medium)", price: 0.00 },
        { name: "Spinach (Medium)", price: 0.50 },
        { name: "Tomatoes (Medium)", price: 0.50 }
      ]
    }
  },
  "Chopped Salad": {
    "Salad Add-ons": {
      rule: "select up to 10",
      options: [
        { name: "Almonds (Small)", price: 2.00 },
        { name: "Black olives (Small)", price: 0.50 },
        { name: "Broccoli (Small)", price: 0.50 },
        { name: "Carrots (Small)", price: 0.50 },
        { name: "Cheddar cheese (Small)", price: 1.00 },
        { name: "Chicken cutlet (Small)", price: 3.00 },
        { name: "Craisins (Small)", price: 1.00 },
        { name: "Croutons (Small)", price: 0.50 },
        { name: "Cucumbers (Small)", price: 0.50 },
        { name: "Feta cheese (Small)", price: 1.00 },
        { name: "Grilled chicken (Small)", price: 3.00 },
        { name: "Hard boiled egg (Small)", price: 1.00 },
        { name: "Mozzarella cheese (Small)", price: 1.00 },
        { name: "Mushrooms (Small)", price: 0.50 },
        { name: "Parmesan cheese (Small)", price: 1.00 },
        { name: "Peppers (Small)", price: 0.50 },
        { name: "Red onions (Small)", price: 0.50 },
        { name: "Roasted red peppers (Small)", price: 1.00 },
        { name: "Tomatoes (Small)", price: 0.50 },
        { name: "Walnuts (Small)", price: 2.00 }
      ]
    },
    "Salad Base": {
      rule: "Select 1",
      options: [
        { name: "Chopped romaine lettuce (Small)", price: 0.00 },
        { name: "Mixed greens (Small)", price: 0.00 },
        { name: "Spinach (Small)", price: 0.00 }
      ]
    },
    "Salad Dressing": {
      rule: "Select 1",
      options: [
        { name: "Balsamic vinaigrette (Small)", price: 0.00 },
        { name: "Blue cheese (Small)", price: 0.00 },
        { name: "Caesar (Small)", price: 0.00 },
        { name: "Honey mustard (Small)", price: 0.00 },
        { name: "Italian (Small)", price: 0.00 },
        { name: "Oil & vinegar (Small)", price: 0.00 },
        { name: "Ranch (Small)", price: 0.00 },
        { name: "Russian (Small)", price: 0.00 }
      ]
    }
  },
  "Coffee": {
    "Coffee Creamers": {
      rule: "Select up to 1 item",
      options: [
        { name: "Milk", price: 0.00 },
        { name: "Fat-Free Milk", price: 0.00 },
        { name: "Half & Half", price: 0.00 },
        { name: "Oat Milk", price: 0.50 },
        { name: "Almond Milk", price: 0.50 }
      ]
    }
  }
};

// Enhanced menu data with better categorization and visual presentation
const menuData: Array<{
  category: string;
  categoryImage?: string;
  items: MenuItem[];
  categoryIcon?: string;
  gradient?: string;
}> = [
  {
    category: "🌟 Featured Breakfast",
    categoryImage: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=1000",
    gradient: "from-orange-400 to-red-500",
    items: [
      {
        name: "Acai Bowl",
        price: 12.97,
        description: "Nutrient-rich acai blend topped with fresh banana slices, sweet blueberries, strawberries, crunchy granola, coconut flakes, and a drizzle of organic honey",
        imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=1000"
      },
      {
        name: "French Toast",
        price: 9.95,
        description: "Thick-sliced Texas style French toast with a rich vanilla-cinnamon batter, served with whipped butter and pure maple syrup",
        imageUrl: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=1000"
      },
      {
        name: "Melville Platter",
        price: 12.95,
        description: "Classic American breakfast featuring two eggs any style, ham, bacon, sausage, homestyle potatoes, and toast of your choice",
        imageUrl: "https://images.unsplash.com/photo-1529604278261-8bfcdb8a6f1d?q=80&w=1000"
      }
    ]
  },
  {
    category: "🥯 Build Your Breakfast",
    categoryImage: "https://images.unsplash.com/photo-1592321675774-3cbc1d00fb0c?q=80&w=1000",
    gradient: "from-yellow-400 to-orange-500",
    items: [
      {
        name: "Custom Bagel",
        price: 0.00,
        description: "Choose from our selection of fresh bagels and spreads - from everything to sesame, with cream cheese, lox, or your favorite toppings",
        imageUrl: "https://images.unsplash.com/photo-1592321675774-3cbc1d00fb0c?q=80&w=1000",
        rules: ["Bagel Options", "Bagel Spreads"]
      },
      {
        name: "Build Your Breakfast",
        price: 2.60,
        description: "Create your perfect breakfast with your choice of bread, eggs, cheese, meat, and fresh toppings",
        imageUrl: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=1000",
        rules: ["Breakfast Add-ons", "Breakfast Bread", "Breakfast Cheese", "Breakfast Dressing", "Breakfast Egg Option", "Breakfast Egg Quantity", "Breakfast Meat"]
      }
    ]
  },
  {
    category: "🥪 Gourmet Sandwiches & Heroes",
    categoryImage: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=1000",
    gradient: "from-green-400 to-blue-500",
    items: [
      {
        name: "Italian Hero",
        price: 17.95,
        description: "Capicola ham, salami, pepperoni, lettuce, tomato, Provolone cheese and Italian dressing on a hero",
        imageUrl: "https://images.unsplash.com/photo-1511344407683-b1172dce025e?q=80&w=1000"
      },
      {
        name: "Philly Cheese Steak",
        price: 14.24,
        description: "Tender rib-eye steak, sautéed peppers, onions, and mixed cheese on a fresh hero roll",
        imageUrl: "https://images.unsplash.com/photo-1600628421066-f6bda6a7b976?q=80&w=1000"
      },
      {
        name: "Chicken Fiesta Hero",
        price: 17.95,
        description: "Fried chicken cutlet, fresh mozzarella, roasted red peppers and spicy mayo on a toasted hero",
        imageUrl: "https://images.unsplash.com/photo-1550507992-eb63ffee0847?q=80&w=1000"
      },
      {
        name: "Build Your Own Sandwich",
        price: 16.00,
        description: "Create your perfect sandwich with premium Boar's Head meats, artisanal cheeses, fresh vegetables, and your choice of bread",
        imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=1000",
        rules: ["Bread", "Cheese", "Protein", "Toppings"]
      }
    ]
  },
  {
    category: "🥗 Fresh Salads & Healthy Options",
    categoryImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000",
    gradient: "from-green-300 to-emerald-600",
    items: [
      {
        name: "Chef Salad",
        price: 15.95,
        description: "Mixed lettuce, ham, eggs, turkey, carrots, Cheddar cheese, cucumber, tomatoes and green peppers",
        imageUrl: "https://images.unsplash.com/photo-1607532941433-304659e8198a?q=80&w=1000"
      },
      {
        name: "Greek Salad",
        price: 15.95,
        description: "Romaine lettuce, tomatoes, stuffed grape leaves, green peppers, Feta cheese and black olives",
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?q=80&w=1000"
      },
      {
        name: "Build Your Own Salad",
        price: 9.95,
        description: "Fresh greens with your choice of proteins, toppings, and dressing",
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000",
        rules: ["Salad Add-ons", "Salad Base", "Salad Dressing"]
      }
    ]
  },
  {
    category: "☕ Coffee & Tea",
    categoryImage: "https://images.unsplash.com/photo-1503481766315-7a586b20f66d?q=80&w=1000",
    gradient: "from-amber-600 to-brown-700",
    items: [
      { name: "Hot Coffee - Large", price: 2.76, description: "Rich Colombian coffee, freshly brewed", imageUrl: "https://images.unsplash.com/photo-1503481766315-7a586b20f66d?q=80&w=1000" },
      { name: "Cappuccino - Large", price: 2.76, description: "Espresso with steamed milk and foam", imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=1000" },
      { name: "French Vanilla Coffee - Large", price: 2.76, description: "Smooth vanilla-flavored coffee", imageUrl: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?q=80&w=1000" },
      { name: "Green Tea - Large", price: 2.76, description: "Antioxidant-rich green tea", imageUrl: "https://images.unsplash.com/photo-1546877625-cb8c71916608?q=80&w=1000" }
    ]
  },
  {
    category: "🥤 Beverages & Refreshments",
    categoryImage: "https://images.unsplash.com/photo-1595983033734-6da0cf8e4137?q=80&w=1000",
    gradient: "from-blue-400 to-cyan-600",
    items: [
      { name: "Fresh Orange Juice", price: 3.59, description: "Freshly squeezed orange juice, packed with vitamin C", imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=1000" },
      { name: "Arizona Iced Tea", price: 3.59, description: "Classic iced tea with perfect sweetness", imageUrl: "https://images.unsplash.com/photo-1556679343-cbc6e39c07dc?q=80&w=1000" },
      { name: "Home-Made Lemonade - Large", price: 3.50, description: "Fresh squeezed lemonade made daily", imageUrl: "https://images.unsplash.com/photo-1595983033734-6da0cf8e4137?q=80&w=1000" },
      { name: "Coca-Cola 20oz", price: 3.59, description: "Classic refreshing cola", imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1000" }
    ]
  },
  {
    category: "🧁 Pastries & Desserts",
    categoryImage: "https://images.unsplash.com/photo-1607958996333-41320fd96e49?q=80&w=1000",
    gradient: "from-pink-400 to-purple-600",
    items: [
      { name: "Blueberry Muffin", price: 3.59, description: "Fresh baked with plump blueberries", imageUrl: "https://images.unsplash.com/photo-1607958996333-41320fd96e49?q=80&w=1000" },
      { name: "Chocolate Chip Cookies", price: 2.29, description: "Warm, chewy cookies with chocolate chips", imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1000" },
      { name: "Fresh Croissant", price: 3.89, description: "Buttery, flaky French pastry", imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1000" },
      { name: "Apple Turnover", price: 3.59, description: "Flaky pastry filled with spiced apples", imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000" }
    ]
  },
  {
    category: "🍳 Specialty Omelets",
    categoryImage: "https://images.unsplash.com/photo-1510693206972-df098062fc71?q=80&w=1000",
    gradient: "from-yellow-300 to-red-500",
    items: [
      {
        name: "American Omelet",
        price: 10.32,
        description: "Ham, American cheese, and fresh tomato in fluffy eggs",
        imageUrl: "https://images.unsplash.com/photo-1510693206972-df098062fc71?q=80&w=1000"
      },
      {
        name: "Western Omelet",
        price: 10.32,
        description: "Bell peppers, onions, and ham in a three-egg omelet",
        imageUrl: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?q=80&w=1000"
      },
      {
        name: "Simon's Omelet",
        price: 11.64,
        description: "Avocado, spinach, Feta cheese and fresh salsa",
        imageUrl: "https://images.unsplash.com/photo-1526206062472-a9d4511ad433?q=80&w=1000"
      }
    ]
  },
  {
    category: "🔥 Paninis & Grilled Specialties",
    categoryImage: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=1000",
    gradient: "from-orange-500 to-red-600",
    items: [
      {
        name: "Caprese Panini",
        price: 15.95,
        description: "Grilled chicken, mozzarella cheese, roasted red peppers, pesto sauce",
        imageUrl: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=1000"
      },
      {
        name: "Cuban Sandwich",
        price: 18.12,
        description: "Pulled pork, ham, Swiss cheese, pickles and tomatoes on garlic bread",
        imageUrl: "https://images.unsplash.com/photo-1565299585323-38174c31d0a4?q=80&w=1000"
      },
      {
        name: "Texas Panini",
        price: 15.95,
        description: "Fried chicken cutlet, bacon, fried onions, cheddar cheese and BBQ sauce",
        imageUrl: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=1000"
      }
    ]
  }
];

const Menu = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Parse URL parameters on load
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get('search');

    if (searchParam) {
      setSearchQuery(searchParam);
    }

    // Set initial load to false after a short delay
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.search]);

  // Convert searchQuery to lowercase for case-insensitive comparison
  const searchLower = searchQuery.toLowerCase();

  // Filter menu items based on search query
  const filteredCategories = menuData.map(category => {
    // If search query is empty, return all items
    if (!searchQuery) {
      return category;
    }

    // Special handling for drink-related searches
    const isDrinkSearch = searchLower.includes("drink") || searchLower.includes("beverage");

    // Special handling for drink-related searches at the category level
    const isDrinkCategory = 
      category.category.toLowerCase().includes("drink") ||
      category.category.toLowerCase().includes("coffee") ||
      category.category.toLowerCase().includes("tea") ||
      category.category.toLowerCase().includes("beverage");

    // Match drink categories for drink-related searches
    if (isDrinkSearch && isDrinkCategory) {
      return category;
    }

    // Filter individual items
    const filteredItems = category.items.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(searchLower);
      const descMatch = item.description && item.description.toLowerCase().includes(searchLower);

      // Check for matches in rules if they exist
      let rulesMatch = false;
      if (item.rules) {
        rulesMatch = item.rules.some(rule => {
          // Look in rules data for this category
          const ruleData = rulesData[category.category.replace(/🌟|🥯|🥪|🥗|☕|🥤|🧁|🍳|🔥|\s/g, '')]?.[rule];
          if (ruleData) {
            // Search in rule description and options
            const ruleTextToSearch = JSON.stringify(ruleData).toLowerCase();
            return ruleTextToSearch.includes(searchLower);
          }
          return rule.toLowerCase().includes(searchLower);
        });
      }

      return nameMatch || descMatch || rulesMatch;
    });

    return { ...category, items: filteredItems };
  }).filter(category => category.items.length > 0);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-gray-100">
      <Navbar />

      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-r from-food-primary via-orange-500 to-red-500 py-16 shadow-xl overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.3%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>

        <div className="relative container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in drop-shadow-lg">
              🍽️ OrderlyBite Menu
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100 max-w-3xl mx-auto">
              Discover our carefully crafted selection of fresh, delicious meals made with premium ingredients
            </p>

            <div className="max-w-4xl mx-auto mb-8">
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm">Menu Items</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">Fresh</div>
                <div className="text-sm">Daily Made</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">Local</div>
                <div className="text-sm">Ingredients</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">Fast</div>
                <div className="text-sm">Service</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="container mx-auto px-4 py-12">
        {filteredCategories.length > 0 ? (
          <div className="space-y-12">
            {filteredCategories.map((category, index) => (
              <div 
                key={category.category} 
                className={`transform transition-all duration-700 ${
                  isInitialLoad ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Items Grid */}
                <MenuCategory 
                  title={category.category} 
                  items={category.items}
                  categoryImage={category.categoryImage}
                  showTitle={true}
                  searchQuery={searchQuery}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-3xl font-bold text-gray-700 mb-4">No Results Found</h3>
            <p className="text-xl text-gray-600 mb-6 max-w-md mx-auto">
              We couldn't find any menu items matching "{searchQuery}"
            </p>
            <p className="text-lg text-gray-500 mb-8">
              Try a different search term or browse our delicious categories below
            </p>
            <button 
              onClick={() => setSearchQuery("")}
              className="bg-gradient-to-r from-food-primary to-food-secondary text-white py-4 px-8 rounded-xl hover:shadow-lg transition-all duration-300 text-lg font-semibold"
            >
              Browse All Items
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Menu;