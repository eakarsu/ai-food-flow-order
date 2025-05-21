import { useState } from "react";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MenuCategory from '../components/MenuCategory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Rules data structure
const rulesData = {
  "BYO Breakfast": {
    "Bagel Options": {
      rule: "Select 1",
      options: [
        { name: "Cinnamon Raisin (Small)", price: 1.50 },
        { name: "Egg (Small)", price: 1.50 },
        { name: "Egg Everything (Small)", price: 1.50 },
        // ... keep existing code (remaining Bagel Options)
      ]
    },
    "Bagel Spreads": {
      rule: "select 1 to 6",
      options: [
        { name: "Bacon (Small)", price: 4.00 },
        { name: "Butter (Small)", price: 1.00 },
        // ... keep existing code (remaining Bagel Spreads)
      ]
    },
    // ... keep existing code (remaining BYO Breakfast categories)
  },
  "BYO Sandwiches": {
    "Bread": {
      rule: "Select 1",
      options: [
        { name: "Cinnamon Raisin Bagel (Medium)", price: 0.50 },
        { name: "Croissant (Medium)", price: 2.00 },
        // ... keep existing code (remaining Bread options)
      ]
    },
    "Cheese": {
      rule: "Select up to 5",
      options: [
        { name: "American Cheese (Medium)", price: 1.00 },
        { name: "Blue Cheese Crumble (Medium)", price: 1.00 },
        // ... keep existing code (remaining Cheese options)
      ]
    },
    // ... keep existing code (remaining BYO Sandwiches categories)
  },
  "Chopped Salad": {
    "Salad Add-ons": {
      rule: "select up to 10",
      options: [
        { name: "Almonds (Small)", price: 2.00 },
        { name: "Black olives (Small)", price: 0.50 },
        // ... keep existing code (remaining Salad Add-ons)
      ]
    },
    // ... keep existing code (remaining Chopped Salad categories)
  },
  "Coffee": {
    "Coffee Creamers": {
      rule: "Select up to 1 item",
      options: [
        { name: "Milk", price: 0.00 },
        { name: "Fat-Free Milk", price: 0.00 },
        // ... keep existing code (remaining Coffee Creamers)
      ]
    }
  }
};

// Menu data structure with category images
const menuData = [
  {
    category: "Acai Bowls",
    categoryImage: "https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=1000",
    items: [
      {
        name: "Acai Bowl",
        price: 12.97,
        description: "Acai, Banana, Blueberry, Strawberry, Granola, Coconut, Honey",
        imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=1000"
      }
    ]
  },
  {
    category: "Bottled Drinks",
    categoryImage: "https://images.unsplash.com/photo-1595983033734-6da0cf8e4137?q=80&w=1000",
    items: [
      { name: "Apple Juice", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1595983033734-6da0cf8e4137?q=80&w=1000" },
      { name: "Arizona Iced Cold Brew Green Tea", price: 4.09 },
      { name: "Arizona Iced Cold Brew Iced Tea", price: 4.09 },
      { name: "Arizona Iced Cold Brew Sweet Tea", price: 4.09 },
      { name: "Arizona Iced Cold Brew Unsweet Tea", price: 4.09 },
      { name: "Arizona Iced Tea 16 oz Arnold Palmer", price: 3.59 },
      { name: "Arizona Iced Tea 16 oz Diet Green Tea", price: 3.59 },
      { name: "Arizona Iced Tea 16 oz Diet Iced Tea", price: 3.59 },
      { name: "Arizona Iced Tea 16 oz Green Tea", price: 3.59 },
      { name: "Arizona Iced Tea 16 oz Iced Tea", price: 3.59 },
      { name: "Coke 20oz soda", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=1000" },
      { name: "Cranberry Juice", price: 3.59 },
      { name: "Diet Coke 20oz soda", price: 3.59 },
      { name: "Diet Dr. Pepper 20oz soda", price: 3.59 },
      { name: "Diet Pepsi 20oz soda", price: 3.59 },
      { name: "Diet Sprite 20oz soda", price: 3.59 },
      { name: "Dr. Pepper 20oz soda", price: 3.59 },
      { name: "Essentia 1 L", price: 4.89 },
      { name: "Gatorade Cool Blue", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?q=80&w=1000" },
      { name: "Gatorade Frost", price: 3.59 },
      { name: "Gatorade Fruit Punch", price: 3.59 },
      { name: "Gatorade Fruit Punch Zero", price: 3.59 },
      { name: "Gatorade Glacier Cherry", price: 3.59 },
      { name: "Gatorade Glacier Cherry Zero", price: 3.59 },
      { name: "Gatorade Iceberg", price: 3.59 },
      { name: "Gatorade Lemon Lime", price: 3.59 },
      { name: "Gatorade Lemon Lime Zero", price: 3.59 },
      { name: "Gatorade Orange", price: 3.59 },
      { name: "Grape Juice", price: 3.59 },
      { name: "Grapefruit Juice", price: 3.59 },
      { name: "Monster", price: 3.50, imageUrl: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?q=80&w=1000" },
      { name: "Monster Rehab", price: 3.50 },
      { name: "Monster Zero Sugar", price: 3.50 },
      { name: "Orange Juice", price: 3.59, description: "OJ" },
      { name: "Orange Mango Juice", price: 3.59 },
      { name: "Orange Pineapple Juice", price: 3.59 },
      { name: "Pepsi 20oz soda", price: 3.59 },
      { name: "Poland Spring Water 1 L", price: 4.23 },
      { name: "Poland Spring Water 1.5 L", price: 4.89 },
      { name: "Poland Spring Water 500 mL", price: 2.55 },
      { name: "Poland Spring Water 700 mL Sport Bottle", price: 3.59 },
      { name: "Red Bull 8.4 oz.", price: 2.95, imageUrl: "https://images.unsplash.com/photo-1588340956917-c3976c43fd0d?q=80&w=1000" },
      { name: "Red Bull Sugar Free 8.4 oz", price: 2.95 },
      { name: "Snapple 16 oz Fruit Punch", price: 2.75, imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=1000" },
      { name: "Snapple 16 oz Grapeade", price: 2.75 },
      { name: "Snapple 16 oz Green Tea", price: 2.75 },
      { name: "Snapple 16 oz Half and Half", price: 2.75 },
      { name: "Snapple 16 oz Half and Half Zero Sugar", price: 2.75 },
      { name: "Snapple 16 oz Honey Sweet Tea", price: 2.75 },
      { name: "Snapple 16 oz Kiwi Strawberry", price: 2.75 },
      { name: "Snapple 16 oz Lemon Tea", price: 2.75 },
      { name: "Snapple 16 oz Mango Madness", price: 2.75 },
      { name: "Snapple 16 oz Mango Tea", price: 2.75 },
      { name: "Snapple 16 oz Orangeade", price: 2.75 },
      { name: "Snapple 16 oz Peach Tea", price: 2.75 },
      { name: "Snapple 16 oz Raspberry Peach", price: 2.75 },
      { name: "Snapple 16 oz Raspberry Tea", price: 2.75 },
      { name: "Snapple 16 oz Snapple Apple", price: 2.75 },
      { name: "Snapple 16 oz Zero Sugar Lemon Tea", price: 2.75 },
      { name: "Snapple 16 oz Zero Sugar Peach Tea", price: 2.75 },
      { name: "Snapple 16 oz Zero Sugar Raspberry Tea", price: 2.75 },
      { name: "Sprite 20oz soda", price: 3.59 },
      { name: "Vegetable Juice", price: 3.59 },
      { name: "Vitamin Water Energy (Tropical Citrus)", price: 3.59 },
      { name: "Vitamin Water Essential (Orange)", price: 3.59 },
      { name: "Vitamin Water Focus (Kiwi Strawberry)", price: 3.59 },
      { name: "Vitamin Water Power-C (Dragonfruit)", price: 3.59 },
      { name: "Vitamin Water Rise (Orange, Zero Sugar)", price: 3.59 },
      { name: "Vitamin Water Squeezed (Lemonade, Zero Sugar)", price: 3.59 },
      { name: "Vitamin Water XXX (Acai Blueberry Pomegranate)", price: 3.59 }
    ]
  },
  {
    category: "Breakfast Combos",
    categoryImage: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=1000",
    items: [
      {
        name: "French Toast",
        price: 9.95,
        description: "Texas style french toast served with butter and syrup",
        imageUrl: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=1000"
      },
      {
        name: "Healthy One",
        price: 11.64,
        description: "Three egg whites, turkey, spinach, Alpine Lace Swiss, in a whole wheat wrap."
      },
      {
        name: "Hungry Man",
        price: 12.95,
        description: "Three eggs, ham, bacon, sausage, and cheese on a hero."
      },
      {
        name: "Melville Platter",
        price: 12.95,
        description: "Two eggs, ham, bacon, sausage, home-fries, and toast.",
        imageUrl: "https://images.unsplash.com/photo-1529604278261-8bfcdb8a6f1d?q=80&w=1000"
      },
      {
        name: "Protein Slammer",
        price: 12.94,
        description: "Five egg whites, extra turkey, Alpine Lace Swiss cheese, on a whole wheat wrap."
      },
      {
        name: "Super Thing",
        price: 12.94,
        description: "Two eggs, extra bacon, extra sausage, onions, and American cheese."
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
    category: "Chips",
    categoryImage: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=1000",
    items: [
      { name: "Classic Lays", price: 3.24, imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=1000" },
      { name: "Cool Ranch Doritos", price: 3.24 },
      { name: "Nacho Cheese Doritos", price: 3.24 },
      { name: "Spicy Sweet Chili Doritos", price: 3.24 }
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
        description: "Fried chicken cutlet, hot cherry peppers, jalapeño Jack cheese, lettuce, tomato, and horseradish dressing."
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
        imageUrl: "https://images.unsplash.com/photo-1510693206972-df098062cb71?q=80&w=1000"
      },
      {
        name: "Mexican Omelet",
        price: 10.32,
        description: "mushrooms, tomato, onions, jalapeño, and cheese."
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
      // And so on for other cold cuts - abbreviated for readability
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
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredCategories = searchQuery 
    ? menuData.map(category => ({
        ...category,
        items: category.items.filter(item => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      })).filter(category => category.items.length > 0)
    : menuData;
  
  const displayedCategories = activeCategory === "all" 
    ? filteredCategories 
    : filteredCategories.filter(category => category.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="bg-food-primary/10 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-food-dark mb-2">OrderlyBite Menu</h1>
          <p className="text-gray-600 mb-6">Explore our delicious offerings</p>
          
          <div className="relative max-w-md mx-auto mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input 
              type="text"
              placeholder="Search for food items..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="all" onValueChange={setActiveCategory} className="w-full">
          <div className="mb-6 overflow-x-auto">
            <TabsList className="inline-flex min-w-full">
              <TabsTrigger value="all">All Categories</TabsTrigger>
              {menuData.map((category) => (
                <TabsTrigger key={category.category} value={category.category}>
                  {category.category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <TabsContent value={activeCategory}>
            {displayedCategories.map((category) => (
              <MenuCategory 
                key={category.category} 
                title={category.category} 
                items={category.items}
                categoryImage={category.categoryImage}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default Menu;
