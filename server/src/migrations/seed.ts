import pool, { query } from '../config/database.js';

// Sample restaurant data
const restaurant = {
  name: 'OrderlyBite Deli',
  description: 'Fresh, delicious food made to order. From breakfast to dinner, we have everything you need.',
  imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000',
  address: '123 Main Street',
  city: 'New York',
  state: 'NY',
  zipCode: '10001',
  phone: '(555) 123-4567',
  email: 'info@orderlybite.com',
  latitude: 40.7484,
  longitude: -73.9857,
  rating: 4.5,
  reviewCount: 328,
  cuisineType: 'American Deli',
  priceRange: '$$',
  deliveryFee: 2.99,
  minOrderAmount: 10.00,
  estimatedDeliveryTime: 30,
  openingHours: JSON.stringify({
    monday: { open: '06:00', close: '22:00' },
    tuesday: { open: '06:00', close: '22:00' },
    wednesday: { open: '06:00', close: '22:00' },
    thursday: { open: '06:00', close: '22:00' },
    friday: { open: '06:00', close: '23:00' },
    saturday: { open: '07:00', close: '23:00' },
    sunday: { open: '07:00', close: '21:00' },
  }),
};

// Menu data (sample categories with items)
const menuData = [
  {
    category: 'BYO Breakfast',
    categoryImage: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=1000',
    items: [
      { name: 'Build Your Own Breakfast', price: 5.99, description: 'Create your perfect breakfast sandwich with your choice of bread, eggs, meat, and cheese.', imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=1000', isFeatured: true },
    ],
  },
  {
    category: 'BYO Sandwiches',
    categoryImage: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?q=80&w=1000',
    items: [
      { name: 'Build Your Own Sandwich', price: 8.99, description: 'Create your perfect sandwich with your choice of bread, meat, cheese, and toppings.', imageUrl: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?q=80&w=1000', isFeatured: true },
    ],
  },
  {
    category: 'Bagels',
    categoryImage: 'https://images.unsplash.com/photo-1627308595171-d1b5d67129c4?q=80&w=1000',
    items: [
      { name: 'Plain Bagel', price: 1.50, imageUrl: 'https://images.unsplash.com/photo-1627308595171-d1b5d67129c4?q=80&w=1000' },
      { name: 'Everything Bagel', price: 1.50 },
      { name: 'Sesame Bagel', price: 1.50 },
      { name: 'Cinnamon Raisin Bagel', price: 1.50 },
      { name: 'Whole Wheat Bagel', price: 1.50 },
      { name: 'Bagel with Cream Cheese', price: 3.50, description: 'Fresh bagel with a generous spread of cream cheese.' },
      { name: 'Bagel with Lox Spread', price: 5.50, description: 'Bagel with our special lox cream cheese spread.' },
    ],
  },
  {
    category: 'Coffee',
    categoryImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000',
    items: [
      { name: 'Coffee, Small', price: 2.25, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000' },
      { name: 'Coffee, Medium', price: 2.75 },
      { name: 'Coffee, Large', price: 3.25 },
      { name: 'Iced Coffee, Small', price: 3.25 },
      { name: 'Iced Coffee, Medium', price: 3.75 },
      { name: 'Iced Coffee, Large', price: 4.25 },
      { name: 'Cappuccino', price: 4.50, isFeatured: true },
      { name: 'Latte', price: 4.50 },
      { name: 'Espresso', price: 2.75 },
    ],
  },
  {
    category: 'Hot Tea',
    categoryImage: 'https://images.unsplash.com/photo-1546877625-cb8c71916608?q=80&w=1000',
    items: [
      { name: 'Green Tea, Small', price: 1.76 },
      { name: 'Green Tea, Medium', price: 2.25, imageUrl: 'https://images.unsplash.com/photo-1546877625-cb8c71916608?q=80&w=1000' },
      { name: 'Green Tea, Large', price: 2.76 },
      { name: 'Hot Tea, Small', price: 1.76 },
      { name: 'Hot Tea, Medium', price: 2.25 },
      { name: 'Hot Tea, Large', price: 2.76 },
    ],
  },
  {
    category: 'Cold Sandwiches',
    categoryImage: 'https://images.unsplash.com/photo-1621800043295-a73fe8894df0?q=80&w=1000',
    items: [
      { name: 'Balsamic Avocado Hero', price: 17.95, description: 'Turkey breast, avocado, tomato, romaine lettuce and balsamic vinaigrette.', imageUrl: 'https://images.unsplash.com/photo-1621800043295-a73fe8894df0?q=80&w=1000', isFeatured: true },
      { name: 'Italian Hero', price: 17.95, description: 'Capicola ham, salami, pepperoni, lettuce, tomato, Provolone cheese and Italian dressing.' },
      { name: 'Turkey Club Hero', price: 17.95, description: 'Roast turkey breast, bacon, lettuce, tomato and mayo.' },
      { name: 'California Hero', price: 17.95, description: 'Turkey breast, avocado, lettuce, tomatoes and Russian dressing.' },
      { name: 'Roast Beef Deluxe Hero', price: 17.95, description: 'Roast beef, bacon, Cheddar, lettuce, tomato and mayo.' },
    ],
  },
  {
    category: 'Hot Sandwiches',
    categoryImage: 'https://images.unsplash.com/photo-1550507992-eb63ffee0847?q=80&w=1000',
    items: [
      { name: 'Chicken Fiesta Hero', price: 17.95, description: 'Fried chicken cutlet, fresh mozzarella, roasted red peppers and spicy mayo.', imageUrl: 'https://images.unsplash.com/photo-1550507992-eb63ffee0847?q=80&w=1000', isFeatured: true },
      { name: 'Texas Hero', price: 17.95, description: 'Fried chicken cutlet, bacon, fried onions, Mozzarella, Cheddar and BBQ sauce.' },
      { name: 'Passport Hero', price: 17.95, description: 'Fried chicken cutlet, bacon, lettuce, ranch, BBQ sauce, American cheese.' },
      { name: 'X-Factor Hero', price: 17.95, description: 'Fried chicken cutlet, mozzarella cheese, bacon, cole-slaw and Russian dressing.' },
    ],
  },
  {
    category: 'Grill Menu',
    categoryImage: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=1000',
    items: [
      { name: 'Beef Gyro', price: 12.94, description: 'Lettuce, tomato, cucumbers, onions, gyro sauce.', imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=1000' },
      { name: 'Philly Cheese Steak', price: 14.24, description: 'Tender rib-eye steak, sautéed peppers, onions, and mixed cheese.', isFeatured: true },
      { name: 'Cuban Sandwich', price: 18.12, description: 'Pulled pork, ham, Swiss cheese, pickles and tomatoes on garlic bread.' },
      { name: 'Falafel Wrap', price: 11.64, description: 'Falafel, lettuce, onion, cucumber, tomato and tahini sauce.', isVegetarian: true, isVegan: true },
    ],
  },
  {
    category: 'Paninis',
    categoryImage: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=1000',
    items: [
      { name: 'California Panini', price: 15.95, description: 'Turkey breast, tomato, avocado, Mozzarella cheese and Russian dressing.', imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=1000' },
      { name: 'Caprese Style Panini', price: 15.95, description: 'Grilled chicken, mozzarella cheese, roasted red peppers, pesto sauce.' },
      { name: 'Chicken Margherita Panini', price: 15.95, description: 'Grilled chicken, tomatoes, fresh mozzarella, fresh basil and red onions.' },
    ],
  },
  {
    category: 'Omelets',
    categoryImage: 'https://images.unsplash.com/photo-1510693206972-df098062fc71?q=80&w=1000',
    items: [
      { name: 'American Omelet', price: 10.32, description: 'Ham, American cheese, and tomato.', imageUrl: 'https://images.unsplash.com/photo-1510693206972-df098062fc71?q=80&w=1000' },
      { name: 'Western Omelet', price: 10.32, description: 'Peppers, onions, and ham.' },
      { name: 'Mexican Omelet', price: 10.32, description: 'Mushrooms, tomato, onions, jalapeño, and cheese.' },
      { name: 'Veggie Omelet', price: 10.32, description: 'Spinach, tomato, mushrooms, peppers, and cheese.', isVegetarian: true },
    ],
  },
  {
    category: 'Salads',
    categoryImage: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000',
    items: [
      { name: 'Caesar Salad', price: 10.95, description: 'Romaine lettuce, parmesan cheese, croutons, Caesar dressing.', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000', isVegetarian: true },
      { name: 'Grilled Chicken Caesar', price: 14.95, description: 'Caesar salad topped with grilled chicken breast.', isFeatured: true },
      { name: 'Garden Salad', price: 8.95, description: 'Mixed greens, tomatoes, cucumbers, onions, carrots.', isVegetarian: true, isVegan: true },
      { name: 'Greek Salad', price: 12.95, description: 'Romaine, feta cheese, olives, tomatoes, cucumbers, red onions.', isVegetarian: true },
    ],
  },
  {
    category: 'Smoothies',
    categoryImage: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=1000',
    items: [
      { name: 'Strawberry Banana Smoothie', price: 6.95, description: 'Fresh strawberries, banana, yogurt, honey.', imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=1000' },
      { name: 'Mango Pineapple Smoothie', price: 6.95, description: 'Mango, pineapple, coconut milk, honey.' },
      { name: 'Berry Blast Smoothie', price: 7.50, description: 'Mixed berries, banana, almond milk.' },
      { name: 'Green Power Smoothie', price: 7.95, description: 'Spinach, kale, banana, apple juice, ginger.', isVegetarian: true, isVegan: true },
    ],
  },
  {
    category: 'Desserts',
    categoryImage: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1000',
    items: [
      { name: 'Chocolate Chip Cookies', price: 2.29, imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1000' },
      { name: 'Chocolate Pudding', price: 3.89 },
      { name: 'Rice Pudding', price: 4.54 },
      { name: 'Cheesecake Slice', price: 5.95, isFeatured: true },
    ],
  },
  {
    category: 'Muffins & Pastries',
    categoryImage: 'https://images.unsplash.com/photo-1607958996333-41320fd96e49?q=80&w=1000',
    items: [
      { name: 'Blueberry Muffin', price: 3.59, imageUrl: 'https://images.unsplash.com/photo-1607958996333-41320fd96e49?q=80&w=1000' },
      { name: 'Chocolate Chip Muffin', price: 3.59 },
      { name: 'Banana Nut Muffin', price: 3.59 },
      { name: 'Croissant', price: 3.89, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1000' },
      { name: 'Cheese Danish', price: 3.59 },
    ],
  },
  {
    category: 'Iced Tea & Lemonade',
    categoryImage: 'https://images.unsplash.com/photo-1556679343-cbc6e39c07dc?q=80&w=1000',
    items: [
      { name: 'Home-Made Iced Tea, Medium', price: 2.76, imageUrl: 'https://images.unsplash.com/photo-1556679343-cbc6e39c07dc?q=80&w=1000' },
      { name: 'Home-Made Iced Tea, Large', price: 3.50 },
      { name: 'Home-Made Lemonade, Medium', price: 2.76 },
      { name: 'Home-Made Lemonade, Large', price: 3.50 },
      { name: 'Arnold Palmer, Large', price: 3.75 },
    ],
  },
];

async function seed() {
  const client = await pool.connect();

  try {
    console.log('Starting database seed...');

    await client.query('BEGIN');

    // Check if restaurant already exists
    const existingRestaurant = await client.query(
      'SELECT id FROM restaurants WHERE name = $1',
      [restaurant.name]
    );

    let restaurantId: string;

    if (existingRestaurant.rows.length > 0) {
      restaurantId = existingRestaurant.rows[0].id;
      console.log('Restaurant already exists, using existing ID:', restaurantId);
    } else {
      // Insert restaurant
      const restaurantResult = await client.query(
        `INSERT INTO restaurants
         (name, description, image_url, address, city, state, zip_code, phone, email,
          latitude, longitude, rating, review_count, cuisine_type, price_range,
          delivery_fee, min_order_amount, estimated_delivery_time, opening_hours)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
         RETURNING id`,
        [
          restaurant.name,
          restaurant.description,
          restaurant.imageUrl,
          restaurant.address,
          restaurant.city,
          restaurant.state,
          restaurant.zipCode,
          restaurant.phone,
          restaurant.email,
          restaurant.latitude,
          restaurant.longitude,
          restaurant.rating,
          restaurant.reviewCount,
          restaurant.cuisineType,
          restaurant.priceRange,
          restaurant.deliveryFee,
          restaurant.minOrderAmount,
          restaurant.estimatedDeliveryTime,
          restaurant.openingHours,
        ]
      );
      restaurantId = restaurantResult.rows[0].id;
      console.log('Created restaurant with ID:', restaurantId);
    }

    // Insert categories and items
    let displayOrder = 0;
    for (const category of menuData) {
      // Check if category exists
      const existingCategory = await client.query(
        'SELECT id FROM menu_categories WHERE restaurant_id = $1 AND name = $2',
        [restaurantId, category.category]
      );

      let categoryId: string;

      if (existingCategory.rows.length > 0) {
        categoryId = existingCategory.rows[0].id;
        console.log(`Category "${category.category}" already exists`);
      } else {
        const categoryResult = await client.query(
          `INSERT INTO menu_categories (restaurant_id, name, image_url, display_order)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          [restaurantId, category.category, category.categoryImage, displayOrder++]
        );
        categoryId = categoryResult.rows[0].id;
        console.log(`Created category: ${category.category}`);
      }

      // Insert items
      for (const item of category.items) {
        const existingItem = await client.query(
          'SELECT id FROM menu_items WHERE category_id = $1 AND name = $2',
          [categoryId, item.name]
        );

        if (existingItem.rows.length === 0) {
          await client.query(
            `INSERT INTO menu_items
             (category_id, restaurant_id, name, description, price, image_url,
              is_featured, is_vegetarian, is_vegan)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              categoryId,
              restaurantId,
              item.name,
              item.description || null,
              item.price,
              item.imageUrl || null,
              item.isFeatured || false,
              item.isVegetarian || false,
              item.isVegan || false,
            ]
          );
        }
      }
    }

    await client.query('COMMIT');
    console.log('Seed completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
