
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

// Menu data structure with category images
const menuData: Array<{
  category: string;
  categoryImage?: string;
  items: MenuItem[];
}> = [
  {
    category: "Acai Bowls",
    categoryImage: "https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=1000",
    items: [
      {
        name: "Acai Bowl",
        price: 12.97,
        description: "Nutrient-rich acai blend topped with fresh banana slices, sweet blueberries, strawberries, crunchy granola, coconut flakes, and a drizzle of organic honey",
        imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=1000"
      }
    ]
  },
  {
    category: "Bottled Drinks",
    categoryImage: "https://images.unsplash.com/photo-1595983033734-6da0cf8e4137?q=80&w=1000",
    items: [
      { name: "Apple Juice", price: 3.59, description: "Fresh-pressed apple juice, bottled daily for maximum flavor", imageUrl: "https://images.unsplash.com/photo-1595983033734-6da0cf8e4137?q=80&w=1000" },
      { name: "Arizona Iced Cold Brew Green Tea", price: 4.09, description: "Refreshing cold brew green tea with subtle herbal notes", imageUrl: "https://images.unsplash.com/photo-1620798018123-dce03e4a176b?q=80&w=1000" },
      { name: "Arizona Iced Cold Brew Iced Tea", price: 4.09, description: "Classic cold brew iced tea, perfectly steeped for smooth taste", imageUrl: "https://images.unsplash.com/photo-1556679343-cbc6e39c07dc?q=80&w=1000" },
      { name: "Arizona Iced Cold Brew Sweet Tea", price: 4.09, description: "Southern-inspired sweet tea with a cold brew process for less bitterness", imageUrl: "https://images.unsplash.com/photo-1500631886742-f049cd451bba?q=80&w=1000" },
      { name: "Arizona Iced Cold Brew Unsweet Tea", price: 4.09, description: "Pure unsweetened cold brew tea, showcasing natural tea flavors", imageUrl: "https://images.unsplash.com/photo-1620031351283-d3d04e125745?q=80&w=1000" },
      { name: "Arizona Iced Tea 16 oz Arnold Palmer", price: 3.59, description: "Perfect balance of lemonade and iced tea in the classic combination", imageUrl: "https://images.unsplash.com/photo-1624372652234-74c3b9c1d36b?q=80&w=1000" },
      { name: "Arizona Iced Tea 16 oz Diet Green Tea", price: 3.59, description: "Light and refreshing green tea with zero calories", imageUrl: "https://images.unsplash.com/photo-1556679343-cbc6e39c07dc?q=80&w=1000" },
      { name: "Arizona Iced Tea 16 oz Diet Iced Tea", price: 3.59, description: "Sugar-free classic iced tea for guilt-free refreshment", imageUrl: "https://images.unsplash.com/photo-1556679343-cbc6e39c07dc?q=80&w=1000" },
      { name: "Arizona Iced Tea 16 oz Green Tea", price: 3.59, description: "Traditional green tea with gentle sweetness and antioxidant benefits", imageUrl: "https://images.unsplash.com/photo-1565220847459-762ff497b38e?q=80&w=1000" },
      { name: "Arizona Iced Tea 16 oz Iced Tea", price: 3.59, description: "Classic iced tea with the perfect balance of flavor and sweetness", imageUrl: "https://images.unsplash.com/photo-1572490151003-56ef25b05872?q=80&w=1000" },
      { name: "Coke 20oz soda", price: 3.59, description: "The world-famous cola with its secret recipe of natural flavors", imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1000" },
      { name: "Cranberry Juice", price: 3.59, description: "Tart and tangy cranberry juice, perfect for refreshment or mixing", imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=1000" },
      { name: "Diet Coke 20oz soda", price: 3.59, description: "Zero-calorie version of the classic cola with the same great taste", imageUrl: "https://images.unsplash.com/photo-1581098365948-6a5a912b7a49?q=80&w=1000" },
      { name: "Diet Dr. Pepper 20oz soda", price: 3.59, description: "Sugar-free version of the distinctive 23-flavor blend", imageUrl: "https://images.unsplash.com/photo-1581098365948-6a5a912b7a49?q=80&w=1000" },
      { name: "Diet Pepsi 20oz soda", price: 3.59, description: "Light and refreshing zero-calorie cola alternative", imageUrl: "https://images.unsplash.com/photo-1581098365948-6a5a912b7a49?q=80&w=1000" },
      { name: "Diet Sprite 20oz soda", price: 3.59, description: "Sugar-free lemon-lime soda with a crisp, clean taste", imageUrl: "https://images.unsplash.com/photo-1581098365948-6a5a912b7a49?q=80&w=1000" },
      { name: "Dr. Pepper 20oz soda", price: 3.59, description: "Unique blend of 23 flavors creating an iconic sweet and spicy taste", imageUrl: "https://images.unsplash.com/photo-1629203432180-71e9b11626e6?q=80&w=1000" },
      { name: "Essentia 1 L", price: 4.89, description: "Ionized alkaline water with a pH of 9.5+ for optimal hydration", imageUrl: "https://images.unsplash.com/photo-1564419429381-98dbcf916478?q=80&w=1000" },
      { name: "Gatorade Cool Blue", price: 3.59, description: "Electrolyte-enhanced sports drink with refreshing blue flavor", imageUrl: "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?q=80&w=1000" },
      { name: "Gatorade Frost", price: 3.59, description: "Light and crisp electrolyte beverage for quick hydration", imageUrl: "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?q=80&w=1000" },
      { name: "Monster", price: 3.50, description: "High-energy drink blend with B-vitamins and taurine", imageUrl: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?q=80&w=1000" },
      { name: "Monster Rehab", price: 3.50, description: "Tea and lemonade energy blend for recovery and hydration", imageUrl: "https://images.unsplash.com/photo-1570526427001-9e695fdadd15?q=80&w=1000" },
      { name: "Monster Zero Sugar", price: 3.50, description: "Full energy boost without the sugar or calories", imageUrl: "https://images.unsplash.com/photo-1611066527104-99d69e0c5333?q=80&w=1000" },
      { name: "Orange Juice", price: 3.59, description: "Freshly squeezed orange juice, packed with vitamin C", imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=1000" },
    ]
  },
  {
    category: "Breakfast Combos",
    categoryImage: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=1000",
    items: [
      {
        name: "French Toast",
        price: 9.95,
        description: "Thick-sliced Texas style French toast with a rich vanilla-cinnamon batter, served with whipped butter and pure maple syrup",
        imageUrl: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=1000"
      },
      {
        name: "Healthy One",
        price: 11.64,
        description: "Light and nutritious breakfast featuring fluffy egg whites, lean turkey, fresh spinach, and Alpine Lace Swiss cheese wrapped in a whole wheat tortilla",
        imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=1000"
      },
      {
        name: "Hungry Man",
        price: 12.95,
        description: "The ultimate breakfast sandwich with three eggs, savory ham, crispy bacon, juicy sausage, and melted cheese on a fresh hero roll",
        imageUrl: "https://images.unsplash.com/photo-1533920379810-6bedac961c2a?q=80&w=1000"
      },
      {
        name: "Melville Platter",
        price: 12.95,
        description: "Classic American breakfast featuring two eggs any style, ham, bacon, sausage, homestyle potatoes, and toast of your choice",
        imageUrl: "https://images.unsplash.com/photo-1529604278261-8bfcdb8a6f1d?q=80&w=1000"
      },
      {
        name: "Protein Slammer",
        price: 12.94,
        description: "High-protein breakfast with five egg whites, extra turkey, and Alpine Lace Swiss cheese in a whole wheat wrap - perfect for fitness enthusiasts",
        imageUrl: "https://images.unsplash.com/photo-1613769049987-b31b641f25b1?q=80&w=1000"
      },
      {
        name: "Super Thing",
        price: 12.94,
        description: "Indulgent breakfast featuring two eggs, double portions of bacon and sausage, sautéed onions, and melted American cheese",
        imageUrl: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1000"
      }
    ]
  },
  {
    category: "BYO Breakfast",
    categoryImage: "https://images.unsplash.com/photo-1592321675774-3cbc1d00fb0c?q=80&w=1000",
    items: [
      {
        name: "Bagel",
        price: 0.00,
        description: "Choose from our selection of bagels and spreads",
        imageUrl: "https://images.unsplash.com/photo-1592321675774-3cbc1d00fb0c?q=80&w=1000",
        rules: ["Bagel Options", "Bagel Spreads"]
      },
      {
        name: "Breakfast",
        price: 2.60,
        description: "Build your own breakfast with your choice of bread, cheese, egg options, and more",
        imageUrl: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=1000",
        rules: ["Breakfast Add-ons", "Breakfast Bread", "Breakfast Cheese", "Breakfast Dressing", "Breakfast Egg Option", "Breakfast Egg Quantity", "Breakfast Meat"]
      }
    ]
  },
  {
    category: "BYO Sandwiches",
    categoryImage: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=1000",
    items: [
      {
        name: "BYO Sandwiches",
        price: 16.00,
        description: "Build your own sandwich with your choice of bread, cheese, protein, and toppings",
        imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=1000",
        rules: ["Bread", "Cheese", "Protein", "Toppings"]
      }
    ]
  },
  {
    category: "Chopped Salad",
    categoryImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000",
    items: [
      {
        name: "BYO Salad",
        price: 9.95,
        description: "Build your own salad with your choice of base, add-ons, and dressing",
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000",
        rules: ["Salad Add-ons", "Salad Base", "Salad Dressing"]
      }
    ]
  },
  {
    category: "Coffee",
    categoryImage: "https://images.unsplash.com/photo-1503481766315-7a586b20f66d?q=80&w=1000",
    items: [
      { name: "Cappuccino, Columbian Coffee, Large", price: 2.76 },
      { name: "Cappuccino, Columbian Coffee, Medium", price: 2.25 },
      { name: "Cappuccino, Columbian Coffee, Small", price: 1.76 },
      { name: "French Vanilla, Columbian Coffee, Large", price: 2.76 },
      { name: "French Vanilla, Columbian Coffee, Medium", price: 2.25 },
      { name: "French Vanilla, Columbian Coffee, Small", price: 1.76 },
      { name: "Columbian Coffee, Large", price: 2.76 },
      { name: "Columbian Coffee, Medium", price: 2.25 },
      { name: "Columbian Coffee, Small", price: 1.76 },
      { name: "Hot Coffee, Columbian Coffee, Large", price: 2.76, imageUrl: "https://images.unsplash.com/photo-1503481766315-7a586b20f66d?q=80&w=1000" },
      { name: "Hot Coffee, Columbian Coffee, Medium", price: 2.25 },
      { name: "Hot Coffee, Columbian Coffee, Small", price: 1.76 },
      { name: "Hot Decaf Coffee, Columbian Coffee, Large", price: 2.76 },
      { name: "Hot Decaf Coffee, Columbian Coffee, Medium", price: 2.25 },
      { name: "Hot Decaf Coffee, Columbian Coffee, Small", price: 1.76 }
    ]
  },
  {
    category: "Tea",
    categoryImage: "https://images.unsplash.com/photo-1546877625-cb8c71916608?q=80&w=1000",
    items: [
      { name: "Green Decaf Tea, Large", price: 2.76 },
      { name: "Green Decaf Tea, Medium", price: 2.25 },
      { name: "Green Decaf Tea, Small", price: 1.76 },
      { name: "Green Tea, Large", price: 2.76, imageUrl: "https://images.unsplash.com/photo-1546877625-cb8c71916608?q=80&w=1000" },
      { name: "Green Tea, Medium", price: 2.25 },
      { name: "Green Tea, Small", price: 1.76 },
      { name: "Hot Tea, Large", price: 2.76 },
      { name: "Hot Tea, Medium", price: 2.25 },
      { name: "Hot Tea, Small", price: 1.76 },
      { name: "Hot Decaf Tea, Large", price: 2.76 },
      { name: "Hot Decaf Tea, Medium", price: 2.25 },
      { name: "Hot Decaf Tea, Small", price: 1.76 }
    ]
  },
  {
    category: "Cold Sandwiches",
    categoryImage: "https://images.unsplash.com/photo-1621800043295-a73fe8894df0?q=80&w=1000",
    items: [
      {
        name: "Balsamic Avocado Hero",
        price: 17.95,
        description: "Turkey breast, avocado, tomato, romaine lettuce and balsamic vinaigrette.",
        imageUrl: "https://images.unsplash.com/photo-1621800043295-a73fe8894df0?q=80&w=1000"
      },
      {
        name: "Cajun Roast Beef Hero",
        price: 17.95,
        description: "Cajun roast beef, Cheddar cheese, lettuce, roasted red peppers and creole mayo."
      },
      {
        name: "California Hero",
        price: 17.95,
        description: "Turkey breast, avocado, lettuce, tomatoes and Russian dressing."
      },
      {
        name: "Chicken Knock Out Hero",
        price: 17.95,
        description: "Fried chicken cutlet, hot cherry peppers, jalapeño Jack cheese, lettuce, tomato and horseradish dressing."
      },
      {
        name: "Dagwood Hero",
        price: 17.95,
        description: "Roast beef, turkey, ham, American, Swiss, lettuce, tomato and mayo."
      },
      {
        name: "Grandpa Ted Hero",
        price: 17.95,
        description: "Turkey breast, Genoa salami, cole-slaw and mustard."
      },
      {
        name: "Honey Dipped Chicken Hero",
        price: 17.95,
        description: "Chicken cutlet, Cheddar cheese, romaine lettuce, tomato, and honey dip sauce."
      },
      {
        name: "Italian Grilled Chicken Hero",
        price: 17.95,
        description: "Grilled chicken, lettuce, roasted red peppers, fresh Mozzarella and pesto sauce."
      },
      {
        name: "Italian Hero",
        price: 17.95,
        description: "Capicola ham, salami, pepperoni, lettuce, tomato, Provolone cheese and Italian dressing on a hero",
        imageUrl: "https://images.unsplash.com/photo-1511344407683-b1172dce025e?q=80&w=1000"
      },
      {
        name: "Monte Christo Hero",
        price: 17.95,
        description: "Turkey breast, ham, Swiss cheese, lettuce, tomato and Russian dressing."
      },
      {
        name: "Nazareth Hero",
        price: 17.95,
        description: "Fried chicken cutlet, bacon, Swiss cheese, cole-slaw and Russian dressing."
      },
      {
        name: "Roast Beef Deluxe Hero",
        price: 17.95,
        description: "Roast beef, bacon, Cheddar, lettuce, tomato and mayo."
      },
      {
        name: "Turkey Club Hero",
        price: 17.95,
        description: "Roast turkey breast, bacon, lettuce, tomato and mayo on a hero."
      }
    ]
  },
  {
    category: "Desserts",
    items: [
      { name: "Chocolate Chip Cookies", price: 2.29, imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1000" },
      { name: "Chocolate Pudding", price: 3.89 },
      { name: "Rice Pudding", price: 4.54 }
    ]
  },
  {
    category: "Grill Menu",
    items: [
      {
        name: "Beef gyro",
        price: 12.94,
        description: "Lettuce, tomato, cucumbers, onions, gyro sauce.",
        imageUrl: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=1000"
      },
      {
        name: "Cuban Sandwich",
        price: 18.12,
        description: "Pulled pork, ham, Swiss cheese, pickles and tomatoes on a garlic bread hero."
      },
      {
        name: "Falafel Wrap",
        price: 11.64,
        description: "Falafel, lettuce, onion, cucumber, tomato and tahini sauce."
      },
      {
        name: "Grilled Monte Cristo",
        price: 16.84,
        description: "Ham, turkey, Swiss cheese, Russian dressing and tomato on Texas style bread."
      },
      {
        name: "Philly Cheese Steak",
        price: 14.24,
        description: "Tender rib-eye steak, sautéed peppers, onions, and mixed Cheese.",
        imageUrl: "https://images.unsplash.com/photo-1600628421066-f6bda6a7b976?q=80&w=1000"
      },
      {
        name: "Wrap Supreme",
        price: 11.64,
        description: "Chicken tenders, lettuce, tomato, cheese, and ranch dressing."
      }
    ]
  },
  {
    category: "Hot Sandwiches",
    categoryImage: "https://images.unsplash.com/photo-1550507992-eb63ffee0847?q=80&w=1000",
    items: [
      {
        name: "Chicken Fiesta Hero",
        price: 17.95,
        description: "Fried chicken cutlet, fresh mozzarella, roasted red peppers and spicy mayo on a toasted hero.",
        imageUrl: "https://images.unsplash.com/photo-1550507992-eb63ffee0847?q=80&w=1000"
      },
      {
        name: "Chicken Italian Melt Hero",
        price: 17.95,
        description: "Fried chicken cutlet, mozzarella cheese, lettuce, tomato, onions, oil, vinegar on a toasted hero."
      },
      {
        name: "Dare Devil Hero",
        price: 17.95,
        description: "Fried chicken cutlet, cheddar cheese, potato salad, lettuce and Russian dressing on a toasted hero"
      },
      {
        name: "Half Hollow Hero",
        price: 17.95,
        description: "Sliced buffalo chicken, bacon, mozzarella, lettuce, tomato and Bleu cheese on a toasted garlic hero."
      },
      {
        name: "Mac-Truck Hero",
        price: 17.95,
        description: "Fried chicken cutlet. Mozzarella, mac salad, bacon and honey mustard on a toasted garlic hero."
      },
      {
        name: "Melville Spice Hero",
        price: 17.95,
        description: "Fried cajun chicken cutlet, bacon, cheddar cheese, lettuce, tomato, and Russian dressing on a toasted hero."
      },
      {
        name: "Original Hero",
        price: 17.95,
        description: "Fried chicken cutlet, cucumber, lettuce, tomato, Mozzarella, ranch and hot sauce on a toasted hero."
      },
      {
        name: "Passport Hero",
        price: 17.95,
        description: "Fried chicken cutlet, bacon, lettuce, ranch, barbeque sauce, American cheese on a toasted hero."
      },
      {
        name: "Pat's Fiesta Hero",
        price: 17.95,
        description: "Fried chicken cutlet, roasted red peppers, Pecorino cheese, fresh Mozzarella, pesto sauce, toasted hero."
      },
      {
        name: "Route 110 Hero",
        price: 17.95,
        description: "Grilled chicken, turkey, roasted red pepper, Jack cheese, lettuce and pesto sauce on a toasted hero."
      },
      {
        name: "Southern Ranch Hero",
        price: 17.95,
        description: "Roast beef, roasted red peppers, Jack cheese, lettuce and ranch dressing on a toasted garlic hero."
      },
      {
        name: "Spicy CAB Ride Hero",
        price: 17.95,
        description: "Fried chicken cutlet, avocado, bacon, mozzarella, cheddar, lettuce, tomato and spicy mayo on a toasted hero."
      },
      {
        name: "Sweet Hills Hero",
        price: 17.95,
        description: "Honey turkey, bacon, Cheddar, Mozzarella, lettuce, and honey mustard on a toasted hero."
      },
      {
        name: "Texas Hero",
        price: 17.95,
        description: "Fried chicken cutlet, bacon, fried onions, Mozzarella, Cheddar and barbeque sauce on a toasted garlic hero."
      },
      {
        name: "X-Factor Hero",
        price: 17.95,
        description: "Fried chicken cutlet, mozzarella cheese, bacon, cole-slaw and Russian dressing on a toasted garlic hero."
      }
    ]
  },
  {
    category: "Iced Tea and Lemonade",
    items: [
      { name: "Home-Made Iced Tea, Large", price: 3.50, imageUrl: "https://images.unsplash.com/photo-1556679343-cbc6e39c07dc?q=80&w=1000" },
      { name: "Home-Made Iced Tea, Medium", price: 2.76 },
      { name: "Home-Made Lemonade, Large", price: 3.50 },
      { name: "Home-Made Lemonade, Medium", price: 2.76 },
      { name: "Unsweetened Iced Tea, Large", price: 3.50 },
      { name: "Unsweetened Iced Tea, Medium", price: 2.76 }
    ]
  },
  {
    category: "Muffins & Pastries",
    items: [
      { name: "Apple Turnover", price: 3.59 },
      { name: "Banana Nut Muffin", price: 3.59 },
      { name: "Blueberry Muffin", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1607958996333-41320fd96e49?q=80&w=1000" },
      { name: "Bran Muffin", price: 3.59 },
      { name: "Cheese Danish", price: 3.59 },
      { name: "Chocolate Chip Muffin", price: 3.59 },
      { name: "Chocolate Chocolate Muffin", price: 3.59 },
      { name: "Corn Muffin", price: 3.59 },
      { name: "Croissant", price: 3.89, imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1000" },
      { name: "Strawberry Cheese Danish", price: 3.59 }
    ]
  },
  {
    category: "Omelets",
    items: [
      {
        name: "American Omelet",
        price: 10.32,
        description: "ham, American cheese, and tomato.",
        imageUrl: "https://images.unsplash.com/photo-1510693206972-df098062fc71?q=80&w=1000"
      },
      {
        name: "Mexican Omelet",
        price: 10.32,
        description: "mushrooms, tomato, onions, jalapeno, and cheese."
      },
      {
        name: "Sausage & Potato Omelet",
        price: 10.32,
        description: "sausage, home-fries, and cheddar cheese."
      },
      {
        name: "Simon's Omelet",
        price: 11.64,
        description: "avocado, spinach, Feta cheese and salsa."
      },
      {
        name: "Western Omelet",
        price: 10.32,
        description: "peppers, onions, and ham."
      }
    ]
  },
  {
    category: "Paninis",
    items: [
      {
        name: "California Panini",
        price: 15.95,
        description: "Turkey breast, tomato, avocado, Mozzarella cheese and Russian dressing.",
        imageUrl: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=1000"
      },
      {
        name: "Caprese Style Panini",
        price: 15.95,
        description: "Grilled chicken, mozzarella cheese, roasted red peppers, pesto sauce"
      },
      {
        name: "Chicken Fiesta Panini",
        price: 15.95,
        description: "Fried chicken cutlet, fresh mozzarella, roasted red peppers and spicy mayo."
      },
      {
        name: "Chicken Margherita Panini",
        price: 15.95,
        description: "Grilled chicken, tomatoes, fresh mozzarella, fresh basil and red onions."
      },
      {
        name: "Delightful Panini",
        price: 15.95,
        description: "Turkey breast, Swiss cheese, honey mustard and cole-slaw."
      },
      {
        name: "Desire Panini",
        price: 15.95,
        description: "House roast turkey breast, Swiss cheese, cole-slaw and Russian."
      },
      {
        name: "Italian Chicken Panini",
        price: 15.95,
        description: "Grilled chicken, pesto sauce, roasted red pepper, and fresh mozzarella."
      },
      {
        name: "Manhattan Panini",
        price: 15.95,
        description: "Roast beef, tomato, onions, bacon, Mozzarella cheese and Russian dressing."
      },
      {
        name: "Monterey Panini",
        price: 15.95,
        description: "Virginia ham, sharp Cheddar cheese, plum tomato and bacon, and Russian dressing."
      },
      {
        name: "Smokey Joe Panini",
        price: 15.95,
        description: "Smoked turkey, Cheddar cheese, bacon, crispy fried onions and Russian."
      },
      {
        name: "Sunset Paninic",
        price: 15.95,
        description: "Turkey, mozzarella, tomato, avocado, ranch dressing."
      },
      {
        name: "Texas Panini",
        price: 15.95,
        description: "Fried chicken cutlet, bacon, fried onions, cheddar cheese and barbeque sauce."
      },
      {
        name: "Torino Panini",
        price: 15.95,
        description: "Fried chicken cutlet, Mozzarella, sundried tomato and pesto sauce."
      },
      {
        name: "Tuna Cheddar Panini",
        price: 15.95,
        description: "Tuna, Cheddar cheese and tomatoes."
      }
    ]
  },
  {
    category: "Salads",
    items: [
      {
        name: "Chef Salad",
        price: 15.95,
        description: "Mixed lettuce, ham, eggs, turkey, carrots, Cheddar cheese, cucumber, tomatoes and green peppers.",
        imageUrl: "https://images.unsplash.com/photo-1607532941433-304659e8198a?q=80&w=1000"
      },
      {
        name: "Cobb Salad",
        price: 15.95,
        description: "Mixed lettuce, bacon, chicken, Provolone cheese, eggs, tomatoes, and black olives."
      },
      {
        name: "Greek Salad",
        price: 15.95,
        description: "Romaine lettuce, tomatoes, stuffed grape leaves, green peppers, Feta cheese and black olives."
      },
      {
        name: "Grilled Chicken Caesar Salad",
        price: 15.95,
        description: "Romaine lettuce, tomatoes, grilled chicken, Parmigiano cheese, croutons, and caesar dressing."
      },
      {
        name: "Grilled Chicken Salad",
        price: 15.95,
        description: "Romaine lettuce, tomatoes, grilled chicken, green bell peppers, shredded carrots and cucumbers."
      },
      {
        name: "Santa Fe Salad",
        price: 15.95,
        description: "Mixed lettuce, grilled chicken, beans, corn, Cheddar cheese, and crunchy cheese tortilla strips, and Santa Fe dressing."
      }
    ]
  },
  {
    category: "Sliced Cold Cuts",
    items: [
      { name: "American cheese 1 lb.", price: 11.98 },
      { name: "American cheese 1/2 lb.", price: 5.99 },
      { name: "American cheese 1/4 lb.", price: 2.99 },
      { name: "American cheese 3/4 lb.", price: 8.98 },
      { name: "Boars Head Bologna 1 lb.", price: 11.98 },
      { name: "Boars Head Bologna 1/2 lb.", price: 5.99 },
      { name: "Boars Head Bologna 1/4 lb.", price: 2.99 },
      { name: "Boars Head Bologna 3/4 lb.", price: 8.98 },
      { name: "Boars Head Buffalo Chicken 1 lb.", price: 15.98, imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=1000" },
      { name: "Boars Head Buffalo Chicken 1/2 lb.", price: 7.99 },
      { name: "Boars Head Buffalo Chicken 1/4 lb.", price: 3.99 },
      { name: "Boars Head Buffalo Chicken 3/4 lb.", price: 11.98 },
      { name: "Boars Head Honey Turkey 1 lb.", price: 15.98 },
      { name: "Boars Head Honey Turkey 1/2 lb.", price: 7.99 },
      { name: "Boars Head Honey Turkey 1/4 lb.", price: 3.99 },
      { name: "Boars Head Honey Turkey 3/4 lb.", price: 11.98 }
    ]
  },
  {
    category: "Snacks & Light Meals",
    items: [
      { name: "Yogurt Parfait", price: 6.99, imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=1000" },
      { name: "Overnight Oats & Berries", price: 6.99 },
      { name: "Peanut Butter & Chocolate Overnight Oats", price: 6.99 },
      { name: "Strawberry Yogurt Parfait", price: 6.99 }
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
    
    // Skip Sliced Cold Cuts entirely for drink searches
    if (isDrinkSearch && category.category === "Sliced Cold Cuts") {
      return { ...category, items: [] };
    }
    
    // Special handling for drink-related searches at the category level
    const isDrinkCategory = 
      category.category.toLowerCase().includes("drink") ||
      category.category.toLowerCase().includes("coffee") ||
      category.category.toLowerCase().includes("tea") ||
      category.category.toLowerCase().includes("iced") ||
      category.category.toLowerCase().includes("bottle");
    
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
          const ruleData = rulesData[category.category]?.[rule];
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="bg-gradient-to-r from-food-primary/20 to-food-secondary/20 py-10 shadow-sm">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-food-dark mb-2 animate-fade-in">
            OrderlyBite Menu
          </h1>
          <p className="text-gray-600 mb-6 text-lg">Explore our delicious offerings crafted with care</p>
          
          <div className="max-w-4xl mx-auto mb-8">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {filteredCategories.length > 0 ? (
          <div className="space-y-6">
            {filteredCategories.map((category) => (
              <div 
                key={category.category} 
                className={`border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm transition-all duration-300 ${isInitialLoad ? 'opacity-0' : 'opacity-100'}`}
              >
                <MenuCategory 
                  title={category.category} 
                  items={category.items}
                  categoryImage={category.categoryImage}
                  searchQuery={searchQuery}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-food-primary mb-4 text-5xl">😕</div>
            <p className="text-xl text-gray-600 mb-2">No menu items found matching "{searchQuery}"</p>
            <p className="text-md text-gray-500 mb-4">Try a different search term or browse our categories</p>
            <button 
              onClick={() => setSearchQuery("")}
              className="mt-2 bg-food-primary text-white py-2 px-4 rounded-md hover:bg-food-primary/90 transition-colors"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Menu;
