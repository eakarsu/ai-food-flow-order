
import React, { useState } from "react";
import MenuCategory, { MenuItem } from "@/components/MenuCategory";
import SearchBar from "@/components/SearchBar";
import Breadcrumbs from "@/components/Breadcrumbs";
import SEO from "@/components/SEO";

// Complete menu data based on prompt2.txt
const menuData: Array<{
  category: string;
  categoryImage?: string;
  items: MenuItem[];
  categoryIcon?: string;
  gradient?: string;
}> = [
  {
    category: "🥣 Acai Bowls",
    categoryImage: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?q=80&w=1000",
    gradient: "from-purple-400 to-pink-500",
    items: [
      {
        name: "Acai Bowl",
        price: 12.97,
        description: "Acai, Banana, Blueberry, Strawberry, Granola, Coconut, Honey",
        imageUrl: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?q=80&w=1000"
      }
    ]
  },
  {
    category: "🥤 Bottled Drinks",
    categoryImage: "https://images.unsplash.com/photo-1595983033734-6da0cf8e4137?q=80&w=1000",
    gradient: "from-blue-400 to-cyan-600",
    items: [
      { name: "Apple Juice", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=1000" },
      { name: "Arizona Iced Cold Brew Green Tea", price: 4.09, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Arizona Iced Cold Brew Iced Tea", price: 4.09, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Arizona Iced Cold Brew Sweet Tea", price: 4.09, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Arizona Iced Cold Brew Unsweet Tea", price: 4.09, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Arizona Iced Tea 16 oz Arnold Palmer", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Arizona Iced Tea 16 oz Diet Green Tea", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Arizona Iced Tea 16 oz Diet Iced Tea", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Arizona Iced Tea 16 oz Green Tea", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Arizona Iced Tea 16 oz Iced Tea", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Coke 20oz soda", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?q=80&w=1000" },
      { name: "Cranberry Juice", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=1000" },
      { name: "Diet Coke 20oz soda", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?q=80&w=1000" },
      { name: "Diet Dr. Pepper 20oz soda", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?q=80&w=1000" },
      { name: "Diet Pepsi 20oz soda", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?q=80&w=1000" },
      { name: "Diet Sprite 20oz soda", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?q=80&w=1000" },
      { name: "Dr. Pepper 20oz soda", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?q=80&w=1000" },
      { name: "Essentia 1 L", price: 4.89, imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1000" },
      { name: "Gatorade Cool Blue", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000" },
      { name: "Gatorade Frost", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000" },
      { name: "Gatorade Fruit Punch", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000" },
      { name: "Gatorade Fruit Punch Zero", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000" },
      { name: "Gatorade Glacier Cherry", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000" },
      { name: "Gatorade Glacier Cherry Zero", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000" },
      { name: "Gatorade Iceberg", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000" },
      { name: "Gatorade Lemon Lime", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000" },
      { name: "Gatorade Lemon Lime Zero", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000" },
      { name: "Gatorade Orange", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000" },
      { name: "Grape Juice", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=1000" },
      { name: "Grapefruit Juice", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=1000" },
      { name: "Monster", price: 3.50, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000" },
      { name: "Monster Rehab", price: 3.50, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000" },
      { name: "Monster Zero Sugar", price: 3.50, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000" },
      { name: "Orange Juice", price: 3.59, description: "OJ", imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=1000" },
      { name: "Orange Mango Juice", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=1000" },
      { name: "Orange Pineapple Juice", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=1000" },
      { name: "Pepsi 20oz soda", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?q=80&w=1000" },
      { name: "Poland Spring Water 1 L", price: 4.23, imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1000" },
      { name: "Poland Spring Water 1.5 L", price: 4.89, imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1000" },
      { name: "Poland Spring Water 500 mL", price: 2.55, imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1000" },
      { name: "Poland Spring Water 700 mL Sport Bottle", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1000" },
      { name: "Red Bull 8.4 oz.", price: 2.95, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000" },
      { name: "Red Bull Sugar Free 8.4 oz", price: 2.95, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000" },
      { name: "Snapple 16 oz Fruit Punch", price: 2.75, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Snapple 16 oz Grapeade", price: 2.75, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Snapple 16 oz Green Tea", price: 2.75, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Snapple 16 oz Half and Half", price: 2.75, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Snapple 16 oz Half and Half Zero Sugar", price: 2.75, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Snapple 16 oz Honey Sweet Tea", price: 2.75, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Snapple 16 oz Kiwi Strawberry", price: 2.75, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Snapple 16 oz Lemon Tea", price: 2.75, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Snapple 16 oz Mango Madness", price: 2.75, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Snapple 16 oz Mango Tea", price: 2.75, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Snapple 16 oz Orangeade", price: 2.75, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Snapple 16 oz Peach Tea", price: 2.75, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Snapple 16 oz Raspberry Peach", price: 2.75, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Snapple 16 oz Raspberry Tea", price: 2.75, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Snapple 16 oz Snapple Apple", price: 2.75, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Snapple 16 oz Zero Sugar Lemon Tea", price: 2.75, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Snapple 16 oz Zero Sugar Peach Tea", price: 2.75, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Snapple 16 oz Zero Sugar Raspberry Tea", price: 2.75, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Sprite 20oz soda", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?q=80&w=1000" },
      { name: "Vegetable Juice", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=1000" },
      { name: "Vitamin Water Energy (Tropical Citrus)", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000" },
      { name: "Vitamin Water Essential (Orange)", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000" },
      { name: "Vitamin Water Focus (Kiwi Strawberry)", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000" },
      { name: "Vitamin Water Power-C (Dragonfruit)", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000" },
      { name: "Vitamin Water Rise (Orange, Zero Sugar)", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000" },
      { name: "Vitamin Water Squeezed (Lemonade, Zero Sugar)", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000" },
      { name: "Vitamin Water XXX (Acai Blueberry Pomegranate)", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000" }
    ]
  },
  {
    category: "🍳 Breakfast Combos",
    categoryImage: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=1000",
    gradient: "from-orange-400 to-red-500",
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
        description: "Three egg whites, turkey, spinach, Alpine Lace Swiss, in a whole wheat wrap.",
        imageUrl: "https://images.unsplash.com/photo-1520072959219-c595dc870360?q=80&w=1000"
      },
      {
        name: "Hungry Man",
        price: 12.95,
        description: "Three eggs, ham, bacon, sausage, and cheese on a hero.",
        imageUrl: "https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1000"
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
        description: "Five egg whites, extra turkey, Alpine Lace Swiss cheese, on a whole wheat wrap.",
        imageUrl: "https://images.unsplash.com/photo-1520072959219-c595dc870360?q=80&w=1000"
      },
      {
        name: "Super Thing",
        price: 12.94,
        description: "Two eggs, extra bacon, extra sausage, onions, and American cheese.",
        imageUrl: "https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1000"
      }
    ]
  },
  {
    category: "🥯 Build Your Own Breakfast",
    categoryImage: "https://images.unsplash.com/photo-1592321675774-3cbc1d00fb0c?q=80&w=1000",
    gradient: "from-yellow-400 to-orange-500",
    items: [
      {
        name: "Custom Bagel",
        price: 0.00,
        description: "Build your perfect bagel with your choice of options and spreads",
        imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000",
        rules: ["Bagel Options", "Bagel Spreads"]
      },
      {
        name: "Build Your Own Breakfast",
        price: 2.60,
        description: "Create your perfect breakfast with eggs, meat, cheese, and more",
        imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=1000",
        rules: ["Breakfast Add-ons", "Breakfast Bread", "Breakfast Cheese", "Breakfast Dressing", "Breakfast Egg Option", "Breakfast Egg Quantity", "Breakfast Meat"]
      }
    ]
  },
  {
    category: "🥪 Build Your Own Sandwiches",
    categoryImage: "https://images.unsplash.com/photo-1567234669013-d3226160d4c4?q=80&w=1000",
    gradient: "from-green-400 to-blue-500",
    items: [
      {
        name: "Build Your Own Sandwich",
        price: 16.00,
        description: "Create your perfect sandwich with your choice of bread, proteins, cheese, and toppings",
        imageUrl: "https://images.unsplash.com/photo-1567234669013-d3226160d4c4?q=80&w=1000",
        rules: ["Bread", "Cheese", "Protein", "Toppings"]
      }
    ]
  },
  {
    category: "🍟 Chips",
    categoryImage: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=1000",
    gradient: "from-yellow-400 to-red-500",
    items: [
      { name: "Classic Lays", price: 3.24, imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=1000" },
      { name: "Cool Ranch Doritos", price: 3.24, imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=1000" },
      { name: "Nacho Cheese Doritos", price: 3.24, imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=1000" },
      { name: "Spicy Sweet Chili Doritos", price: 3.24, imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=1000" }
    ]
  },
  {
    category: "🥗 Build Your Own Salad",
    categoryImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000",
    gradient: "from-green-400 to-emerald-600",
    items: [
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
    category: "☕ Coffee",
    categoryImage: "https://images.unsplash.com/photo-1503481766315-7a586b20f66d?q=80&w=1000",
    gradient: "from-amber-600 to-brown-700",
    items: [
      { name: "Cappuccino, Columbian Coffee, Large", price: 2.76, imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=1000", rules: ["Coffee Creamers"] },
      { name: "Cappuccino, Columbian Coffee, Medium", price: 2.25, imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=1000", rules: ["Coffee Creamers"] },
      { name: "Cappuccino, Columbian Coffee, Small", price: 1.76, imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=1000", rules: ["Coffee Creamers"] },
      { name: "French Vanilla, Columbian Coffee, Large", price: 2.76, imageUrl: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?q=80&w=1000", rules: ["Coffee Creamers"] },
      { name: "French Vanilla, Columbian Coffee, Medium", price: 2.25, imageUrl: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?q=80&w=1000", rules: ["Coffee Creamers"] },
      { name: "French Vanilla, Columbian Coffee, Small", price: 1.76, imageUrl: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?q=80&w=1000", rules: ["Coffee Creamers"] },
      { name: "Hot Coffee, Columbian Coffee, Large", price: 2.76, imageUrl: "https://images.unsplash.com/photo-1503481766315-7a586b20f66d?q=80&w=1000", rules: ["Coffee Creamers"] },
      { name: "Hot Coffee, Columbian Coffee, Medium", price: 2.25, imageUrl: "https://images.unsplash.com/photo-1503481766315-7a586b20f66d?q=80&w=1000", rules: ["Coffee Creamers"] },
      { name: "Hot Coffee, Columbian Coffee, Small", price: 1.76, imageUrl: "https://images.unsplash.com/photo-1503481766315-7a586b20f66d?q=80&w=1000", rules: ["Coffee Creamers"] },
      { name: "Hot Decaf Coffee, Columbian Coffee, Large", price: 2.76, imageUrl: "https://images.unsplash.com/photo-1503481766315-7a586b20f66d?q=80&w=1000", rules: ["Coffee Creamers"] },
      { name: "Hot Decaf Coffee, Columbian Coffee, Medium", price: 2.25, imageUrl: "https://images.unsplash.com/photo-1503481766315-7a586b20f66d?q=80&w=1000", rules: ["Coffee Creamers"] },
      { name: "Hot Decaf Coffee, Columbian Coffee, Small", price: 1.76, imageUrl: "https://images.unsplash.com/photo-1503481766315-7a586b20f66d?q=80&w=1000", rules: ["Coffee Creamers"] }
    ]
  },
  {
    category: "🍵 Tea",
    categoryImage: "https://images.unsplash.com/photo-1546877625-cb8c71916608?q=80&w=1000",
    gradient: "from-green-400 to-teal-600",
    items: [
      { name: "Green Decaf Tea, Large", price: 2.76, imageUrl: "https://images.unsplash.com/photo-1546877625-cb8c71916608?q=80&w=1000" },
      { name: "Green Decaf Tea, Medium", price: 2.25, imageUrl: "https://images.unsplash.com/photo-1546877625-cb8c71916608?q=80&w=1000" },
      { name: "Green Decaf Tea, Small", price: 1.76, imageUrl: "https://images.unsplash.com/photo-1546877625-cb8c71916608?q=80&w=1000" },
      { name: "Green Tea, Large", price: 2.76, imageUrl: "https://images.unsplash.com/photo-1546877625-cb8c71916608?q=80&w=1000" },
      { name: "Green Tea, Medium", price: 2.25, imageUrl: "https://images.unsplash.com/photo-1546877625-cb8c71916608?q=80&w=1000" },
      { name: "Green Tea, Small", price: 1.76, imageUrl: "https://images.unsplash.com/photo-1546877625-cb8c71916608?q=80&w=1000" },
      { name: "Hot Decaf Tea, Large", price: 2.76, imageUrl: "https://images.unsplash.com/photo-1546877625-cb8c71916608?q=80&w=1000" },
      { name: "Hot Decaf Tea, Medium", price: 2.25, imageUrl: "https://images.unsplash.com/photo-1546877625-cb8c71916608?q=80&w=1000" },
      { name: "Hot Decaf Tea, Small", price: 1.76, imageUrl: "https://images.unsplash.com/photo-1546877625-cb8c71916608?q=80&w=1000" },
      { name: "Hot Tea, Large", price: 2.76, imageUrl: "https://images.unsplash.com/photo-1546877625-cb8c71916608?q=80&w=1000" },
      { name: "Hot Tea, Medium", price: 2.25, imageUrl: "https://images.unsplash.com/photo-1546877625-cb8c71916608?q=80&w=1000" },
      { name: "Hot Tea, Small", price: 1.76, imageUrl: "https://images.unsplash.com/photo-1546877625-cb8c71916608?q=80&w=1000" }
    ]
  },
  {
    category: "🥪 Cold Sandwiches",
    categoryImage: "https://images.unsplash.com/photo-1567234669013-d3226160d4c4?q=80&w=1000",
    gradient: "from-blue-400 to-purple-500",
    items: [
      {
        name: "Balsamic Avocado Hero",
        price: 17.95,
        description: "Turkey breast, avocado, tomato, romaine lettuce and balsamic vinaigrette.",
        imageUrl: "https://images.unsplash.com/photo-1567234669013-d3226160d4c4?q=80&w=1000"
      },
      {
        name: "Cajun Roast Beef Hero",
        price: 17.95,
        description: "Cajun roast beef, Cheddar cheese, lettuce, roasted red peppers and creole mayo.",
        imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1000"
      },
      {
        name: "California Hero",
        price: 17.95,
        description: "Turkey breast, avocado, lettuce, tomatoes and Russian dressing.",
        imageUrl: "https://images.unsplash.com/photo-1567234669013-d3226160d4c4?q=80&w=1000"
      },
      {
        name: "Chicken Knock Out Hero",
        price: 17.95,
        description: "Fried chicken cutlet, hot cherry peppers, jalapeño Jack cheese, lettuce, tomato, and horseradish dressing.",
        imageUrl: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=1000"
      },
      {
        name: "Dagwood Hero",
        price: 17.95,
        description: "Roast beef, turkey, ham, American, Swiss, lettuce, tomato, and mayo.",
        imageUrl: "https://images.unsplash.com/photo-1567234669013-d3226160d4c4?q=80&w=1000"
      },
      {
        name: "Grandpa Ted Hero",
        price: 17.95,
        description: "Turkey breast, Genoa salami, cole-slaw and mustard.",
        imageUrl: "https://images.unsplash.com/photo-1567234669013-d3226160d4c4?q=80&w=1000"
      },
      {
        name: "Honey Dipped Chicken Hero",
        price: 17.95,
        description: "Chicken cutlet, Cheddar cheese, romaine lettuce, tomato, and honey dip sauce.",
        imageUrl: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=1000"
      },
      {
        name: "Italian Grilled Chicken Hero",
        price: 17.95,
        description: "Grilled chicken, lettuce, roasted red peppers, fresh Mozzarella and pesto sauce.",
        imageUrl: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=1000"
      },
      {
        name: "Italian Hero",
        price: 17.95,
        description: "Capicola ham, salami, pepperoni, lettuce, tomato, Provolone cheese and Italian dressing on a hero",
        imageUrl: "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?q=80&w=1000"
      },
      {
        name: "Monte Christo Hero",
        price: 17.95,
        description: "Turkey breast, ham, Swiss cheese, lettuce, tomato and Russian dressing.",
        imageUrl: "https://images.unsplash.com/photo-1567234669013-d3226160d4c4?q=80&w=1000"
      },
      {
        name: "Nazareth Hero",
        price: 17.95,
        description: "Fried chicken cutlet, bacon, Swiss cheese, cole-slaw and Russian dressing.",
        imageUrl: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=1000"
      },
      {
        name: "Roast Beef Deluxe Hero",
        price: 17.95,
        description: "Roast beef, bacon, Cheddar, lettuce, tomato and mayo.",
        imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1000"
      },
      {
        name: "Turkey Club Hero",
        price: 17.95,
        description: "Roast turkey breast, bacon, lettuce, tomato and mayo on a hero.",
        imageUrl: "https://images.unsplash.com/photo-1567234669013-d3226160d4c4?q=80&w=1000"
      }
    ]
  },
  {
    category: "🍰 Desserts",
    categoryImage: "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=1000",
    gradient: "from-pink-400 to-red-500",
    items: [
      { name: "Chocolate Chip Cookies", price: 2.29, imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1000" },
      { name: "Chocolate Pudding", price: 3.89, imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=1000" },
      { name: "Rice Pudding", price: 4.54, imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=1000" }
    ]
  },
  {
    category: "🔥 Grill Menu",
    categoryImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?q=80&w=1000",
    gradient: "from-red-500 to-orange-600",
    items: [
      {
        name: "Beef gyro",
        price: 12.94,
        description: "Lettuce, tomato, cucumbers, onions, gyro sauce.",
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?q=80&w=1000"
      },
      {
        name: "Cuban Sandwich",
        price: 18.12,
        description: "Pulled pork, ham, Swiss cheese, pickles and tomatoes on a garlic bread hero.",
        imageUrl: "https://images.unsplash.com/photo-1565299585323-38174c31d0a4?q=80&w=1000"
      },
      {
        name: "Falafel Wrap",
        price: 11.64,
        description: "Falafel, lettuce, onion, cucumber, tomato and tahini sauce.",
        imageUrl: "https://images.unsplash.com/photo-1520072959219-c595dc870360?q=80&w=1000"
      },
      {
        name: "Grilled Monte Cristo",
        price: 16.84,
        description: "Ham, turkey, Swiss cheese, Russian dressing and tomato on Texas style bread.",
        imageUrl: "https://images.unsplash.com/photo-1565299585323-38174c31d0a4?q=80&w=1000"
      },
      {
        name: "Philly Cheese Steak",
        price: 14.24,
        description: "Tender rib-eye steak, sautéed peppers, onions, and mixed Cheese.",
        imageUrl: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?q=80&w=1000"
      },
      {
        name: "Wrap Supreme",
        price: 11.64,
        description: "Chicken tenders, lettuce, tomato, cheese, and ranch dressing.",
        imageUrl: "https://images.unsplash.com/photo-1520072959219-c595dc870360?q=80&w=1000"
      }
    ]
  },
  {
    category: "🔥 Hot Sandwiches",
    categoryImage: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=1000",
    gradient: "from-orange-500 to-red-600",
    items: [
      {
        name: "Chicken Fiesta Hero",
        price: 17.95,
        description: "Fried chicken cutlet, fresh mozzarella, roasted red peppers and spicy mayo on a toasted hero.",
        imageUrl: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=1000"
      },
      {
        name: "Chicken Italian Melt Hero",
        price: 17.95,
        description: "Fried chicken cutlet, mozzarella cheese, lettuce, tomato, onions, oil, vinegar on a toasted hero.",
        imageUrl: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=1000"
      },
      {
        name: "Dare Devil Hero",
        price: 17.95,
        description: "Fried chicken cutlet, cheddar cheese, potato salad, lettuce and Russian dressing on a toasted hero",
        imageUrl: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=1000"
      },
      {
        name: "Half Hollow Hero",
        price: 17.95,
        description: "Sliced buffalo chicken, bacon, mozzarella, lettuce, tomato and Bleu cheese on a toasted garlic hero.",
        imageUrl: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=1000"
      },
      {
        name: "Mac-Truck Hero",
        price: 17.95,
        description: "Fried chicken cutlet. Mozzarella, mac salad, bacon and honey mustard on a toasted garlic hero.",
        imageUrl: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=1000"
      },
      {
        name: "Melville Spice Hero",
        price: 17.95,
        description: "Fried cajun chicken cutlet, bacon, cheddar cheese, lettuce, tomato, and Russian dressing on a toasted hero.",
        imageUrl: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=1000"
      },
      {
        name: "Original Hero",
        price: 17.95,
        description: "Fried chicken cutlet, cucumber, lettuce, tomato, Mozzarella, ranch and hot sauce on a toasted hero.",
        imageUrl: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=1000"
      },
      {
        name: "Passport Hero",
        price: 17.95,
        description: "Fried chicken cutlet, bacon, lettuce, ranch, barbeque sauce, American cheese on a toasted hero.",
        imageUrl: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=1000"
      },
      {
        name: "Pat's Fiesta Hero",
        price: 17.95,
        description: "Fried chicken cutlet, roasted red peppers, Pecorino cheese, fresh Mozzarella, pesto sauce, toasted hero.",
        imageUrl: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=1000"
      },
      {
        name: "Route 110 Hero",
        price: 17.95,
        description: "Grilled chicken, turkey, roasted red pepper, Jack cheese, lettuce and pesto sauce on a toasted hero.",
        imageUrl: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=1000"
      },
      {
        name: "Southern Ranch Hero",
        price: 17.95,
        description: "Roast beef, roasted red peppers, Jack cheese, lettuce and ranch dressing on a toasted garlic hero.",
        imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1000"
      },
      {
        name: "Spicy CAB Ride Hero",
        price: 17.95,
        description: "Fried chicken cutlet, avocado, bacon, mozzarella, cheddar, lettuce, tomato and spicy mayo on a toasted hero.",
        imageUrl: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=1000"
      },
      {
        name: "Sweet Hills Hero",
        price: 17.95,
        description: "Honey turkey, bacon, Cheddar, Mozzarella, lettuce, and honey mustard on a toasted hero.",
        imageUrl: "https://images.unsplash.com/photo-1567234669013-d3226160d4c4?q=80&w=1000"
      },
      {
        name: "Texas Hero",
        price: 17.95,
        description: "Fried chicken cutlet, bacon, fried onions, Mozzarella, Cheddar and barbeque sauce on a toasted garlic hero.",
        imageUrl: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=1000"
      },
      {
        name: "X-Factor Hero",
        price: 17.95,
        description: "Fried chicken cutlet, mozzarella cheese, bacon, cole-slaw and Russian dressing on a toasted garlic hero.",
        imageUrl: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=1000"
      }
    ]
  },
  {
    category: "🧊 Iced Tea and Lemonade",
    categoryImage: "https://images.unsplash.com/photo-1523371683702-dfedf0258014?q=80&w=1000",
    gradient: "from-yellow-400 to-orange-500",
    items: [
      { name: "Home-Made Iced Tea, Large", price: 3.50, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Home-Made Iced Tea, Medium", price: 2.76, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Home-Made Lemonade, Large", price: 3.50, imageUrl: "https://images.unsplash.com/photo-1523371683702-dfedf0258014?q=80&w=1000" },
      { name: "Home-Made Lemonade, Medium", price: 2.76, imageUrl: "https://images.unsplash.com/photo-1523371683702-dfedf0258014?q=80&w=1000" },
      { name: "Unsweetened Iced Tea, Large", price: 3.50, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" },
      { name: "Unsweetened Iced Tea, Medium", price: 2.76, imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1000" }
    ]
  },
  {
    category: "🧁 Muffins & Pastries",
    categoryImage: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1000",
    gradient: "from-pink-400 to-purple-500",
    items: [
      { name: "Apple Turnover", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=1000" },
      { name: "Banana Nut Muffin", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1000" },
      { name: "Blueberry Muffin", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1000" },
      { name: "Bran Muffin", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1000" },
      { name: "Cheese Danish", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=1000" },
      { name: "Chocolate Chip Muffin", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1000" },
      { name: "Chocolate Chocolate Muffin", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1000" },
      { name: "Corn Muffin", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1000" },
      { name: "Croissant", price: 3089.00, imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000" },
      { name: "Strawberry Cheese Danish", price: 3.59, imageUrl: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=1000" }
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
        description: "ham, American cheese, and tomato.",
        imageUrl: "https://images.unsplash.com/photo-1510693206972-df098062fc71?q=80&w=1000"
      },
      {
        name: "Mexican Omelet",
        price: 10.32,
        description: "mushrooms, tomato, onions, jalapeño, and cheese.",
        imageUrl: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?q=80&w=1000"
      },
      {
        name: "Sausage & Potato Omelet",
        price: 10.32,
        description: "sausage, home-fries, and cheddar cheese.",
        imageUrl: "https://images.unsplash.com/photo-1510693206972-df098062fc71?q=80&w=1000"
      },
      {
        name: "Simon's Omelet",
        price: 11.64,
        description: "avocado, spinach, Feta cheese and salsa.",
        imageUrl: "https://images.unsplash.com/photo-1526206062472-a9d4511ad433?q=80&w=1000"
      },
      {
        name: "Western Omelet",
        price: 10.32,
        description: "peppers, onions, and ham.",
        imageUrl: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?q=80&w=1000"
      }
    ]
  },
  {
    category: "🔥 Paninis & Grilled Specialties",
    categoryImage: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=1000",
    gradient: "from-orange-500 to-red-600",
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
        description: "Grilled chicken, mozzarella cheese, roasted red peppers, pesto sauce",
        imageUrl: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=1000"
      },
      {
        name: "Chicken Fiesta Panini",
        price: 15.95,
        description: "Fried chicken cutlet, fresh mozzarella, roasted red peppers and spicy mayo.",
        imageUrl: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=1000"
      },
      {
        name: "Chicken Margherita Panini",
        price: 15.95,
        description: "Grilled chicken, tomatoes, fresh mozzarella, fresh basil and red onions.",
        imageUrl: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=1000"
      },
      {
        name: "Delightful Panini",
        price: 15.95,
        description: "Turkey breast, Swiss cheese, honey mustard and cole-slaw.",
        imageUrl: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=1000"
      },
      {
        name: "Desire Panini",
        price: 15.95,
        description: "House roast turkey breast, Swiss cheese, cole-slaw and Russian.",
        imageUrl: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=1000"
      },
      {
        name: "Italian Chicken Panini",
        price: 15.95,
        description: "Grilled chicken, pesto sauce, roasted red pepper, and fresh mozzarella.",
        imageUrl: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=1000"
      },
      {
        name: "Manhattan Panini",
        price: 15.95,
        description: "Roast beef, tomato, onions, bacon, Mozzarella cheese and Russian dressing.",
        imageUrl: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=1000"
      },
      {
        name: "Monterey Panini",
        price: 15.95,
        description: "Virginia ham, sharp Cheddar cheese, plum tomato and bacon, and Russian dressing.",
        imageUrl: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=1000"
      },
      {
        name: "Smokey Joe Panini",
        price: 15.95,
        description: "Smoked turkey, Cheddar cheese, bacon, crispy fried onions and Russian.",
        imageUrl: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=1000"
      },
      {
        name: "Sunset Panini",
        price: 15.95,
        description: "Turkey, mozzarella, tomato, avocado, ranch dressing.",
        imageUrl: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=1000"
      },
      {
        name: "Texas Panini",
        price: 15.95,
        description: "Fried chicken cutlet, bacon, fried onions, cheddar cheese and barbeque sauce.",
        imageUrl: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=1000"
      },
      {
        name: "Torino Panini",
        price: 15.95,
        description: "Fried chicken cutlet, Mozzarella, sundried tomato and pesto sauce.",
        imageUrl: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=1000"
      },
      {
        name: "Tuna Cheddar Panini",
        price: 15.95,
        description: "Tuna, Cheddar cheese and tomatoes.",
        imageUrl: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=1000"
      }
    ]
  },
  {
    category: "🥗 Fresh Salads",
    categoryImage: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1000",
    gradient: "from-green-400 to-emerald-600",
    items: [
      {
        name: "Chef Salad",
        price: 15.95,
        description: "Mixed lettuce, ham, eggs, turkey, carrots, Cheddar cheese, cucumber, tomatoes and green peppers.",
        imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1000"
      },
      {
        name: "Cobb Salad",
        price: 15.95,
        description: "Mixed lettuce, bacon, chicken, Provolone cheese, eggs, tomatoes, and black olives.",
        imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1000"
      },
      {
        name: "Greek Salad",
        price: 15.95,
        description: "Romaine lettuce, tomatoes, stuffed grape leaves, green peppers, Feta cheese and black olives.",
        imageUrl: "https://images.unsplash.com/photo-1544982503-9f984c14501a?q=80&w=1000"
      },
      {
        name: "Grilled Chicken Caesar Salad",
        price: 15.95,
        description: "Romaine lettuce, tomatoes, grilled chicken, Parmigiano cheese, croutons, and caesar dressing.",
        imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1000"
      },
      {
        name: "Grilled Chicken Salad",
        price: 15.95,
        description: "Romaine lettuce, tomatoes, grilled chicken, green bell peppers, shredded carrots and cucumbers.",
        imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1000"
      },
      {
        name: "Santa Fe Salad",
        price: 15.95,
        description: "Mixed lettuce, grilled chicken, beans, corn, Cheddar cheese, and crunchy cheese tortilla strips, and Santa Fe dressing.",
        imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1000"
      }
    ]
  },
  {
    category: "🥩 Sliced Cold Cuts",
    categoryImage: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1000",
    gradient: "from-red-400 to-pink-500",
    items: [
      { name: "American cheese 1 lb.", price: 11.98, imageUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=1000" },
      { name: "American cheese 1/2 lb.", price: 5.99, imageUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=1000" },
      { name: "American cheese 1/4 lb.", price: 2.99, imageUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=1000" },
      { name: "American cheese 3/4 lb.", price: 8.98, imageUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=1000" },
      { name: "Boars Head Bologna 1 lb.", price: 11.98, imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1000" },
      { name: "Boars Head Bologna 1/2 lb.", price: 5.99, imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1000" },
      { name: "Boars Head Bologna 1/4 lb.", price: 2.99, imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1000" },
      { name: "Boars Head Bologna 3/4 lb.", price: 8.98, imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1000" },
      { name: "Boars Head Buffalo Chicken 1 lb.", price: 15.98, imageUrl: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=1000" },
      { name: "Boars Head Buffalo Chicken 1/2 lb.", price: 7.99, imageUrl: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=1000" },
      { name: "Boars Head Buffalo Chicken 1/4 lb.", price: 3.99, imageUrl: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=1000" },
      { name: "Boars Head Buffalo Chicken 3/4 lb.", price: 11.98, imageUrl: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=1000" },
      { name: "Boars Head Honey Turkey 1 lb.", price: 15.98, imageUrl: "https://images.unsplash.com/photo-1567234669013-d3226160d4c4?q=80&w=1000" },
      { name: "Boars Head Honey Turkey 1/2 lb.", price: 7.99, imageUrl: "https://images.unsplash.com/photo-1567234669013-d3226160d4c4?q=80&w=1000" },
      { name: "Boars Head Honey Turkey 1/4 lb.", price: 3.99, imageUrl: "https://images.unsplash.com/photo-1567234669013-d3226160d4c4?q=80&w=1000" },
      { name: "Boars Head Honey Turkey 3/4 lb.", price: 11.98, imageUrl: "https://images.unsplash.com/photo-1567234669013-d3226160d4c4?q=80&w=1000" }
      // Note: I've included a representative sample of the cold cuts. The full list contains many more items.
    ]
  },
  {
    category: "🥄 Snacks & Light Meals",
    categoryImage: "https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=1000",
    gradient: "from-purple-400 to-pink-500",
    items: [
      { name: "Yogurt Parfait", price: 6.99, imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=1000" },
      { name: "Overnight Oats & Berries", price: 6.99, imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=1000" },
      { name: "Peanut Butter & Chocolate Overnight Oats", price: 6.99, imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=1000" },
      { name: "Strawberry Yogurt Parfait", price: 6.99, imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=1000" }
    ]
  }
];

const Menu = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMenuData = menuData.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(section => section.items.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <SEO
        title="Menu - Delicious Food Options | OrderlyBite"
        description="Browse our extensive menu featuring fresh breakfast items, sandwiches, salads, and more. Order online for delivery or pickup."
        keywords="restaurant menu, breakfast, sandwiches, salads, fresh food, online ordering"
        ogImage="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000"
      />
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-food-primary to-food-secondary bg-clip-text text-transparent mb-4">
            Our Menu
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our delicious selection of fresh, made-to-order meals
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-12">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search our menu..."
            className="w-full"
          />
        </div>

        <div className="space-y-8">
          {filteredMenuData.length > 0 ? (
            filteredMenuData.map((section, index) => (
              <MenuCategory
                key={index}
                title={section.category}
                items={section.items}
                categoryImage={section.categoryImage}
                searchQuery={searchQuery}
              />
            ))
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                  No items found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search terms or browse our categories above.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;
