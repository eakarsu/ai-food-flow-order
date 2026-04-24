import { Response } from 'express';
import { getClient } from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

// Sample inventory items
const inventoryItems = [
  { name: 'All-Purpose Flour', category: 'Dry Goods', unit: 'lbs', currentQuantity: 45, minQuantity: 20, maxQuantity: 100, reorderPoint: 30, unitCost: 0.75, supplier: 'Sysco Foods', storageLocation: 'Dry Storage A1' },
  { name: 'Whole Milk', category: 'Dairy', unit: 'gallons', currentQuantity: 12, minQuantity: 5, maxQuantity: 30, reorderPoint: 8, unitCost: 4.25, supplier: 'Dairy Fresh Co', storageLocation: 'Walk-in Cooler' },
  { name: 'Ground Beef 80/20', category: 'Meat', unit: 'lbs', currentQuantity: 35, minQuantity: 15, maxQuantity: 80, reorderPoint: 25, unitCost: 5.50, supplier: 'Prime Meats Inc', storageLocation: 'Walk-in Freezer' },
  { name: 'Roma Tomatoes', category: 'Produce', unit: 'lbs', currentQuantity: 28, minQuantity: 10, maxQuantity: 50, reorderPoint: 15, unitCost: 2.25, supplier: 'Local Farms Direct', storageLocation: 'Walk-in Cooler' },
  { name: 'Fresh Mozzarella', category: 'Dairy', unit: 'lbs', currentQuantity: 18, minQuantity: 8, maxQuantity: 40, reorderPoint: 12, unitCost: 8.50, supplier: 'Italian Imports', storageLocation: 'Walk-in Cooler' },
  { name: 'Extra Virgin Olive Oil', category: 'Oils', unit: 'liters', currentQuantity: 8, minQuantity: 4, maxQuantity: 20, reorderPoint: 6, unitCost: 12.00, supplier: 'Mediterranean Goods', storageLocation: 'Dry Storage B2' },
  { name: 'Chicken Breast', category: 'Meat', unit: 'lbs', currentQuantity: 42, minQuantity: 20, maxQuantity: 100, reorderPoint: 30, unitCost: 4.25, supplier: 'Prime Meats Inc', storageLocation: 'Walk-in Freezer' },
  { name: 'Romaine Lettuce', category: 'Produce', unit: 'heads', currentQuantity: 24, minQuantity: 12, maxQuantity: 48, reorderPoint: 18, unitCost: 2.50, supplier: 'Local Farms Direct', storageLocation: 'Walk-in Cooler' },
  { name: 'Applewood Bacon', category: 'Meat', unit: 'lbs', currentQuantity: 15, minQuantity: 8, maxQuantity: 40, reorderPoint: 12, unitCost: 7.50, supplier: 'Prime Meats Inc', storageLocation: 'Walk-in Cooler' },
  { name: 'Large Eggs', category: 'Dairy', unit: 'dozens', currentQuantity: 20, minQuantity: 10, maxQuantity: 50, reorderPoint: 15, unitCost: 4.50, supplier: 'Dairy Fresh Co', storageLocation: 'Walk-in Cooler' },
  { name: 'Sharp Cheddar', category: 'Dairy', unit: 'lbs', currentQuantity: 22, minQuantity: 10, maxQuantity: 50, reorderPoint: 15, unitCost: 6.25, supplier: 'Dairy Fresh Co', storageLocation: 'Walk-in Cooler' },
  { name: 'Sourdough Bread', category: 'Bakery', unit: 'loaves', currentQuantity: 16, minQuantity: 8, maxQuantity: 32, reorderPoint: 12, unitCost: 4.00, supplier: 'Artisan Bakery', storageLocation: 'Bread Rack' },
  { name: 'Yellow Onions', category: 'Produce', unit: 'lbs', currentQuantity: 30, minQuantity: 15, maxQuantity: 60, reorderPoint: 20, unitCost: 1.25, supplier: 'Local Farms Direct', storageLocation: 'Dry Storage C1' },
  { name: 'Arabica Coffee Beans', category: 'Beverages', unit: 'lbs', currentQuantity: 12, minQuantity: 6, maxQuantity: 30, reorderPoint: 10, unitCost: 14.00, supplier: 'Coffee Roasters Inc', storageLocation: 'Dry Storage A3' },
  { name: 'Granulated Sugar', category: 'Dry Goods', unit: 'lbs', currentQuantity: 25, minQuantity: 15, maxQuantity: 75, reorderPoint: 20, unitCost: 0.65, supplier: 'Sysco Foods', storageLocation: 'Dry Storage A2' },
  { name: 'Unsalted Butter', category: 'Dairy', unit: 'lbs', currentQuantity: 14, minQuantity: 8, maxQuantity: 40, reorderPoint: 12, unitCost: 5.50, supplier: 'Dairy Fresh Co', storageLocation: 'Walk-in Cooler' },
];

// Sample staff members
const staffMembers = [
  { firstName: 'Michael', lastName: 'Rodriguez', email: 'michael.r@orderlybite.com', phone: '555-0101', role: 'Head Chef', hourlyRate: 35.00, employmentType: 'full_time', skills: ['cooking', 'menu planning', 'team leadership'], maxHoursPerWeek: 45 },
  { firstName: 'Sarah', lastName: 'Chen', email: 'sarah.c@orderlybite.com', phone: '555-0102', role: 'Sous Chef', hourlyRate: 28.00, employmentType: 'full_time', skills: ['cooking', 'prep work', 'inventory'], maxHoursPerWeek: 40 },
  { firstName: 'James', lastName: 'Wilson', email: 'james.w@orderlybite.com', phone: '555-0103', role: 'Line Cook', hourlyRate: 18.00, employmentType: 'full_time', skills: ['grill', 'frying', 'prep work'], maxHoursPerWeek: 40 },
  { firstName: 'Emily', lastName: 'Davis', email: 'emily.d@orderlybite.com', phone: '555-0104', role: 'Line Cook', hourlyRate: 17.50, employmentType: 'full_time', skills: ['salads', 'sandwiches', 'prep work'], maxHoursPerWeek: 40 },
  { firstName: 'David', lastName: 'Martinez', email: 'david.m@orderlybite.com', phone: '555-0105', role: 'Prep Cook', hourlyRate: 15.00, employmentType: 'part_time', skills: ['chopping', 'prep work', 'cleaning'], maxHoursPerWeek: 30 },
  { firstName: 'Jessica', lastName: 'Thompson', email: 'jessica.t@orderlybite.com', phone: '555-0106', role: 'Cashier', hourlyRate: 14.50, employmentType: 'full_time', skills: ['customer service', 'POS', 'cash handling'], maxHoursPerWeek: 40 },
  { firstName: 'Robert', lastName: 'Garcia', email: 'robert.g@orderlybite.com', phone: '555-0107', role: 'Cashier', hourlyRate: 14.00, employmentType: 'part_time', skills: ['customer service', 'POS'], maxHoursPerWeek: 25 },
  { firstName: 'Amanda', lastName: 'Brown', email: 'amanda.b@orderlybite.com', phone: '555-0108', role: 'Server', hourlyRate: 12.00, employmentType: 'full_time', skills: ['customer service', 'food running', 'table service'], maxHoursPerWeek: 40 },
  { firstName: 'Chris', lastName: 'Lee', email: 'chris.l@orderlybite.com', phone: '555-0109', role: 'Server', hourlyRate: 12.00, employmentType: 'part_time', skills: ['customer service', 'food running'], maxHoursPerWeek: 20 },
  { firstName: 'Michelle', lastName: 'Taylor', email: 'michelle.t@orderlybite.com', phone: '555-0110', role: 'Server', hourlyRate: 12.00, employmentType: 'part_time', skills: ['customer service', 'table service'], maxHoursPerWeek: 25 },
  { firstName: 'Kevin', lastName: 'Anderson', email: 'kevin.a@orderlybite.com', phone: '555-0111', role: 'Manager', hourlyRate: 25.00, employmentType: 'full_time', skills: ['management', 'scheduling', 'customer service', 'inventory'], maxHoursPerWeek: 45 },
  { firstName: 'Lisa', lastName: 'White', email: 'lisa.w@orderlybite.com', phone: '555-0112', role: 'Delivery Driver', hourlyRate: 15.00, employmentType: 'part_time', skills: ['driving', 'customer service', 'navigation'], maxHoursPerWeek: 30 },
  { firstName: 'Tom', lastName: 'Jackson', email: 'tom.j@orderlybite.com', phone: '555-0113', role: 'Delivery Driver', hourlyRate: 15.00, employmentType: 'part_time', skills: ['driving', 'customer service'], maxHoursPerWeek: 30 },
  { firstName: 'Nancy', lastName: 'Harris', email: 'nancy.h@orderlybite.com', phone: '555-0114', role: 'Dishwasher', hourlyRate: 13.00, employmentType: 'full_time', skills: ['cleaning', 'dish washing', 'sanitization'], maxHoursPerWeek: 40 },
  { firstName: 'Brian', lastName: 'Clark', email: 'brian.c@orderlybite.com', phone: '555-0115', role: 'Host', hourlyRate: 13.50, employmentType: 'part_time', skills: ['customer service', 'seating', 'phone'], maxHoursPerWeek: 25 },
];

// Sample reviews
const reviews = [
  { customerName: 'John D.', rating: 5, title: 'Best deli in town!', content: 'The sandwiches here are incredible! Fresh ingredients, generous portions, and the staff is always friendly. My go-to spot for lunch.', sentiment: 'positive' },
  { customerName: 'Maria S.', rating: 4, title: 'Great food, slightly slow', content: 'Food quality is excellent and the menu has great variety. Only reason for 4 stars is the wait time during lunch rush can be long.', sentiment: 'positive' },
  { customerName: 'Robert K.', rating: 5, title: 'Amazing breakfast', content: 'Their breakfast sandwiches are to die for! The BYO option lets me customize exactly what I want. Coffee is also top notch.', sentiment: 'positive' },
  { customerName: 'Jennifer L.', rating: 3, title: 'Good but pricey', content: 'Food tastes great but I think the prices are a bit high for what you get. The portions could be bigger for the price point.', sentiment: 'neutral' },
  { customerName: 'Michael T.', rating: 2, title: 'Disappointing experience', content: 'Ordered a turkey club and the turkey was dry. Also waited 25 minutes for a simple sandwich. Expected better based on reviews.', sentiment: 'negative' },
  { customerName: 'Susan B.', rating: 5, title: 'Perfect every time', content: 'Been coming here for months and they never disappoint. The Caesar salad with grilled chicken is my favorite. Highly recommend!', sentiment: 'positive' },
  { customerName: 'David W.', rating: 4, title: 'Solid choice for lunch', content: 'Good variety of options and everything I have tried has been tasty. The paninis are especially good. Would come back.', sentiment: 'positive' },
  { customerName: 'Emily R.', rating: 1, title: 'Order was wrong', content: 'They messed up my order twice. Asked for no onions and got extra onions both times. Very frustrating when you have allergies.', sentiment: 'negative' },
  { customerName: 'Chris M.', rating: 5, title: 'Hidden gem!', content: 'Just discovered this place and I am hooked. The Philly cheesesteak is authentic and delicious. Staff remembered my name on second visit!', sentiment: 'positive' },
  { customerName: 'Amanda P.', rating: 4, title: 'Great healthy options', content: 'Love that they have vegetarian and vegan options. The falafel wrap is amazing. Wish they had more smoothie flavors though.', sentiment: 'positive' },
  { customerName: 'Jason H.', rating: 3, title: 'Average experience', content: 'Nothing special but nothing bad either. Food was okay, service was fine. Probably would try other places before coming back.', sentiment: 'neutral' },
  { customerName: 'Lisa G.', rating: 5, title: 'Catering was perfect!', content: 'Ordered catering for our office meeting and it was a huge hit. Everything arrived on time, fresh, and beautifully presented.', sentiment: 'positive' },
  { customerName: 'Mark F.', rating: 2, title: 'Not worth the hype', content: 'Heard great things but was let down. Bagel was stale and the lox spread tasted off. Maybe I caught them on a bad day.', sentiment: 'negative' },
  { customerName: 'Rachel N.', rating: 4, title: 'Quick and tasty', content: 'Great spot for a quick bite. Love their coffee and the muffins are freshly baked. Only wish they had more seating.', sentiment: 'positive' },
  { customerName: 'Steve O.', rating: 5, title: 'Family favorite', content: 'We bring the whole family here every weekend. Kids love the smoothies and we love that there is something for everyone.', sentiment: 'positive' },
];

async function getOrCreateRestaurant(client: any): Promise<string> {
  const result = await client.query(
    "SELECT id FROM restaurants WHERE name = 'OrderlyBite Deli' LIMIT 1"
  );
  if (result.rows.length > 0) {
    return result.rows[0].id;
  }
  const newRestaurant = await client.query(
    `INSERT INTO restaurants (name, description, cuisine_type)
     VALUES ('OrderlyBite Deli', 'Fresh, delicious food made to order', 'American Deli')
     RETURNING id`
  );
  return newRestaurant.rows[0].id;
}

// Seed inventory sample data
export const seedInventory = async (req: AuthRequest, res: Response) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const restaurantId = await getOrCreateRestaurant(client);

    let created = 0;
    for (const item of inventoryItems) {
      const existing = await client.query(
        'SELECT id FROM inventory_items WHERE restaurant_id = $1 AND name = $2',
        [restaurantId, item.name]
      );
      if (existing.rows.length === 0) {
        await client.query(
          `INSERT INTO inventory_items
           (restaurant_id, name, category, unit, current_quantity, min_quantity, max_quantity,
            reorder_point, unit_cost, supplier, storage_location)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [restaurantId, item.name, item.category, item.unit, item.currentQuantity,
           item.minQuantity, item.maxQuantity, item.reorderPoint, item.unitCost,
           item.supplier, item.storageLocation]
        );
        created++;
      }
    }

    // Add usage history
    const inventoryIds = await client.query(
      'SELECT id FROM inventory_items WHERE restaurant_id = $1',
      [restaurantId]
    );
    for (const row of inventoryIds.rows) {
      const usageCount = Math.floor(Math.random() * 6) + 5;
      for (let i = 0; i < usageCount; i++) {
        const daysAgo = Math.floor(Math.random() * 7);
        const recordedAt = new Date();
        recordedAt.setDate(recordedAt.getDate() - daysAgo);
        await client.query(
          `INSERT INTO inventory_usage_history
           (inventory_item_id, quantity_used, usage_type, recorded_at)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [row.id, Math.random() * 5 + 0.5, 'consumption', recordedAt.toISOString()]
        );
      }
    }

    await client.query('COMMIT');
    const totalInDb = (await client.query('SELECT COUNT(*) FROM inventory_items')).rows[0].count;
    res.json({ message: created > 0 ? `Loaded ${created} new inventory items (${totalInDb} total)` : `${totalInDb} inventory items already loaded`, total: parseInt(totalInDb) });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed inventory error:', error);
    res.status(500).json({ error: 'Failed to seed inventory data' });
  } finally {
    client.release();
  }
};

// Seed staff sample data
export const seedStaff = async (req: AuthRequest, res: Response) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const restaurantId = await getOrCreateRestaurant(client);

    let created = 0;
    const staffMemberIds: string[] = [];
    for (const member of staffMembers) {
      const existing = await client.query(
        'SELECT id FROM staff_members WHERE restaurant_id = $1 AND email = $2',
        [restaurantId, member.email]
      );
      let memberId: string;
      if (existing.rows.length === 0) {
        const result = await client.query(
          `INSERT INTO staff_members
           (restaurant_id, first_name, last_name, email, phone, role, hourly_rate,
            employment_type, skills, max_hours_per_week, hire_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING id`,
          [restaurantId, member.firstName, member.lastName, member.email, member.phone,
           member.role, member.hourlyRate, member.employmentType,
           JSON.stringify(member.skills), member.maxHoursPerWeek,
           new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]
        );
        memberId = result.rows[0].id;
        created++;
      } else {
        memberId = existing.rows[0].id;
      }
      staffMemberIds.push(memberId);
    }

    // Generate schedules for current week
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);

    const shifts = [
      { start: '06:00', end: '14:00' },
      { start: '10:00', end: '18:00' },
      { start: '14:00', end: '22:00' },
    ];

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const shiftDate = new Date(startOfWeek);
      shiftDate.setDate(startOfWeek.getDate() + dayOffset);
      const dateStr = shiftDate.toISOString().split('T')[0];

      const staffCount = Math.min(3, staffMemberIds.length);
      for (let i = 0; i < staffCount; i++) {
        const staffIndex = (dayOffset + i) % staffMemberIds.length;
        const shiftIndex = i % shifts.length;
        const existing = await client.query(
          'SELECT id FROM staff_schedules WHERE staff_member_id = $1 AND shift_date = $2 AND start_time = $3',
          [staffMemberIds[staffIndex], dateStr, shifts[shiftIndex].start]
        );
        if (existing.rows.length === 0) {
          await client.query(
            `INSERT INTO staff_schedules
             (staff_member_id, restaurant_id, shift_date, start_time, end_time,
              break_minutes, status, ai_suggested, ai_confidence)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [staffMemberIds[staffIndex], restaurantId, dateStr,
             shifts[shiftIndex].start, shifts[shiftIndex].end, 30,
             dayOffset < dayOfWeek ? 'completed' : 'scheduled',
             Math.random() > 0.5, Math.random() * 0.3 + 0.7]
          );
        }
      }
    }

    await client.query('COMMIT');
    const totalStaff = (await client.query('SELECT COUNT(*) FROM staff_members')).rows[0].count;
    res.json({ message: created > 0 ? `Loaded ${created} new staff members with schedules (${totalStaff} total)` : `${totalStaff} staff members already loaded`, total: parseInt(totalStaff) });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed staff error:', error);
    res.status(500).json({ error: 'Failed to seed staff data' });
  } finally {
    client.release();
  }
};

// Seed reviews sample data
export const seedReviews = async (req: AuthRequest, res: Response) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const restaurantId = await getOrCreateRestaurant(client);

    let created = 0;
    for (const review of reviews) {
      const existing = await client.query(
        'SELECT id FROM reviews WHERE restaurant_id = $1 AND customer_name = $2 AND title = $3',
        [restaurantId, review.customerName, review.title]
      );
      if (existing.rows.length === 0) {
        await client.query(
          `INSERT INTO reviews
           (restaurant_id, customer_name, rating, title, content, sentiment, is_published)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [restaurantId, review.customerName, review.rating, review.title,
           review.content, review.sentiment, true]
        );
        created++;
      }
    }

    await client.query('COMMIT');
    const totalReviews = (await client.query('SELECT COUNT(*) FROM reviews')).rows[0].count;
    res.json({ message: created > 0 ? `Loaded ${created} new reviews (${totalReviews} total)` : `${totalReviews} reviews already loaded`, total: parseInt(totalReviews) });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed reviews error:', error);
    res.status(500).json({ error: 'Failed to seed review data' });
  } finally {
    client.release();
  }
};

// Sample wait time predictions
const waitTimePredictions = [
  { predictedMinutes: 12, orderItemsCount: 2, queueSize: 3, timeOfDay: 'morning', dayOfWeek: 'Monday', confidence: 0.88, actualMinutes: 14 },
  { predictedMinutes: 25, orderItemsCount: 5, queueSize: 8, timeOfDay: 'lunch_rush', dayOfWeek: 'Tuesday', confidence: 0.72, actualMinutes: 28 },
  { predictedMinutes: 8, orderItemsCount: 1, queueSize: 1, timeOfDay: 'afternoon', dayOfWeek: 'Wednesday', confidence: 0.95, actualMinutes: 7 },
  { predictedMinutes: 18, orderItemsCount: 3, queueSize: 5, timeOfDay: 'lunch_rush', dayOfWeek: 'Thursday', confidence: 0.81, actualMinutes: 20 },
  { predictedMinutes: 35, orderItemsCount: 7, queueSize: 12, timeOfDay: 'dinner_rush', dayOfWeek: 'Friday', confidence: 0.65, actualMinutes: 40 },
  { predictedMinutes: 15, orderItemsCount: 3, queueSize: 4, timeOfDay: 'morning', dayOfWeek: 'Saturday', confidence: 0.85, actualMinutes: null },
  { predictedMinutes: 22, orderItemsCount: 4, queueSize: 6, timeOfDay: 'lunch_rush', dayOfWeek: 'Sunday', confidence: 0.78, actualMinutes: 19 },
  { predictedMinutes: 10, orderItemsCount: 2, queueSize: 2, timeOfDay: 'afternoon', dayOfWeek: 'Monday', confidence: 0.92, actualMinutes: 11 },
  { predictedMinutes: 45, orderItemsCount: 8, queueSize: 15, timeOfDay: 'dinner_rush', dayOfWeek: 'Saturday', confidence: 0.60, actualMinutes: null },
  { predictedMinutes: 30, orderItemsCount: 6, queueSize: 10, timeOfDay: 'dinner_rush', dayOfWeek: 'Friday', confidence: 0.70, actualMinutes: 33 },
  { predictedMinutes: 14, orderItemsCount: 2, queueSize: 3, timeOfDay: 'morning', dayOfWeek: 'Tuesday', confidence: 0.90, actualMinutes: 13 },
  { predictedMinutes: 20, orderItemsCount: 4, queueSize: 7, timeOfDay: 'lunch_rush', dayOfWeek: 'Wednesday', confidence: 0.76, actualMinutes: 22 },
  { predictedMinutes: 9, orderItemsCount: 1, queueSize: 2, timeOfDay: 'evening', dayOfWeek: 'Thursday', confidence: 0.93, actualMinutes: 8 },
  { predictedMinutes: 28, orderItemsCount: 5, queueSize: 9, timeOfDay: 'dinner_rush', dayOfWeek: 'Saturday', confidence: 0.68, actualMinutes: null },
  { predictedMinutes: 16, orderItemsCount: 3, queueSize: 4, timeOfDay: 'afternoon', dayOfWeek: 'Sunday', confidence: 0.84, actualMinutes: 15 },
];

// Sample upsell recommendations
const upsellRecommendations = [
  { cartItems: [{ name: 'Turkey Club', price: 12.99 }, { name: 'Iced Tea', price: 3.49 }], recommendedItems: [{ itemName: 'Chocolate Chip Cookie', reason: 'Popular dessert pairing', confidence: 0.85 }], confidence: 0.85, wasAccepted: true },
  { cartItems: [{ name: 'Caesar Salad', price: 9.99 }], recommendedItems: [{ itemName: 'Garlic Bread', reason: 'Complementary side', confidence: 0.78 }], confidence: 0.78, wasAccepted: false },
  { cartItems: [{ name: 'Margherita Pizza', price: 14.99 }, { name: 'Garlic Knots', price: 5.99 }], recommendedItems: [{ itemName: 'Tiramisu', reason: 'Italian dessert pairing', confidence: 0.82 }], confidence: 0.82, wasAccepted: true },
  { cartItems: [{ name: 'Grilled Chicken Wrap', price: 11.49 }], recommendedItems: [{ itemName: 'Sweet Potato Fries', reason: 'Popular side upgrade', confidence: 0.90 }], confidence: 0.90, wasAccepted: null },
  { cartItems: [{ name: 'BLT Sandwich', price: 10.99 }, { name: 'Soup of the Day', price: 5.99 }], recommendedItems: [{ itemName: 'Fresh Lemonade', reason: 'Refreshing beverage match', confidence: 0.73 }], confidence: 0.73, wasAccepted: true },
  { cartItems: [{ name: 'Breakfast Burrito', price: 9.99 }], recommendedItems: [{ itemName: 'Orange Juice', reason: 'Breakfast beverage pairing', confidence: 0.92 }], confidence: 0.92, wasAccepted: true },
  { cartItems: [{ name: 'Fish Tacos', price: 13.49 }, { name: 'Chips & Salsa', price: 4.99 }], recommendedItems: [{ itemName: 'Mango Smoothie', reason: 'Tropical flavor complement', confidence: 0.70 }], confidence: 0.70, wasAccepted: false },
  { cartItems: [{ name: 'Philly Cheesesteak', price: 13.99 }], recommendedItems: [{ itemName: 'Onion Rings', reason: 'Classic combo side', confidence: 0.88 }], confidence: 0.88, wasAccepted: null },
  { cartItems: [{ name: 'Avocado Toast', price: 8.99 }, { name: 'Cappuccino', price: 5.49 }], recommendedItems: [{ itemName: 'Fruit Bowl', reason: 'Healthy breakfast add-on', confidence: 0.80 }], confidence: 0.80, wasAccepted: true },
  { cartItems: [{ name: 'Veggie Burger', price: 12.49 }], recommendedItems: [{ itemName: 'Side Salad', reason: 'Light healthy pairing', confidence: 0.75 }], confidence: 0.75, wasAccepted: false },
  { cartItems: [{ name: 'Steak Sandwich', price: 15.99 }, { name: 'Coleslaw', price: 3.99 }], recommendedItems: [{ itemName: 'Craft Beer', reason: 'Premium beverage upgrade', confidence: 0.68 }], confidence: 0.68, wasAccepted: null },
  { cartItems: [{ name: 'Chicken Tenders', price: 10.99 }, { name: 'French Fries', price: 4.49 }], recommendedItems: [{ itemName: 'Milkshake', reason: 'Classic combo beverage', confidence: 0.87 }], confidence: 0.87, wasAccepted: true },
  { cartItems: [{ name: 'Greek Salad', price: 10.49 }], recommendedItems: [{ itemName: 'Pita Bread', reason: 'Mediterranean pairing', confidence: 0.83 }], confidence: 0.83, wasAccepted: true },
  { cartItems: [{ name: 'BBQ Pulled Pork', price: 13.99 }, { name: 'Mac & Cheese', price: 5.99 }], recommendedItems: [{ itemName: 'Cornbread', reason: 'Southern comfort pairing', confidence: 0.91 }], confidence: 0.91, wasAccepted: null },
  { cartItems: [{ name: 'Lobster Roll', price: 18.99 }], recommendedItems: [{ itemName: 'Clam Chowder', reason: 'Seafood soup pairing', confidence: 0.77 }], confidence: 0.77, wasAccepted: false },
];

// Seed wait time predictions
export const seedWaitTime = async (req: AuthRequest, res: Response) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const restaurantId = await getOrCreateRestaurant(client);

    // Check existing count
    const existing = await client.query(
      'SELECT COUNT(*) FROM wait_time_predictions WHERE restaurant_id = $1',
      [restaurantId]
    );
    if (parseInt(existing.rows[0].count) >= 15) {
      await client.query('COMMIT');
      return res.json({ message: `${existing.rows[0].count} wait time predictions already loaded`, total: parseInt(existing.rows[0].count) });
    }

    let created = 0;
    for (const pred of waitTimePredictions) {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 14));
      createdAt.setHours(Math.floor(Math.random() * 12) + 8);

      await client.query(
        `INSERT INTO wait_time_predictions
         (restaurant_id, predicted_minutes, order_items_count, current_queue_size,
          time_of_day, day_of_week, confidence, actual_minutes, created_at,
          factors)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [restaurantId, pred.predictedMinutes, pred.orderItemsCount, pred.queueSize,
         pred.timeOfDay, pred.dayOfWeek, pred.confidence, pred.actualMinutes,
         createdAt.toISOString(),
         JSON.stringify({ orderComplexity: 'medium', queueImpact: 'moderate', timeImpact: pred.timeOfDay, staffingImpact: 'adequate' })]
      );
      created++;
    }

    await client.query('COMMIT');
    const total = (await client.query('SELECT COUNT(*) FROM wait_time_predictions')).rows[0].count;
    res.json({ message: `Loaded ${created} wait time predictions (${total} total)`, total: parseInt(total) });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed wait time error:', error);
    res.status(500).json({ error: 'Failed to seed wait time data' });
  } finally {
    client.release();
  }
};

// Seed upsell recommendations
export const seedUpsell = async (req: AuthRequest, res: Response) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const restaurantId = await getOrCreateRestaurant(client);

    const existing = await client.query(
      'SELECT COUNT(*) FROM upsell_recommendations WHERE restaurant_id = $1',
      [restaurantId]
    );
    if (parseInt(existing.rows[0].count) >= 15) {
      await client.query('COMMIT');
      return res.json({ message: `${existing.rows[0].count} upsell recommendations already loaded`, total: parseInt(existing.rows[0].count) });
    }

    let created = 0;
    for (const rec of upsellRecommendations) {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 14));

      await client.query(
        `INSERT INTO upsell_recommendations
         (restaurant_id, cart_items, recommended_items, confidence, was_accepted, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [restaurantId, JSON.stringify(rec.cartItems), JSON.stringify(rec.recommendedItems),
         rec.confidence, rec.wasAccepted, createdAt.toISOString()]
      );
      created++;
    }

    await client.query('COMMIT');
    const total = (await client.query('SELECT COUNT(*) FROM upsell_recommendations')).rows[0].count;
    res.json({ message: `Loaded ${created} upsell recommendations (${total} total)`, total: parseInt(total) });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed upsell error:', error);
    res.status(500).json({ error: 'Failed to seed upsell data' });
  } finally {
    client.release();
  }
};

// Seed all data at once
export const seedAll = async (req: AuthRequest, res: Response) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const restaurantId = await getOrCreateRestaurant(client);

    // Seed inventory
    let inventoryCreated = 0;
    for (const item of inventoryItems) {
      const existing = await client.query(
        'SELECT id FROM inventory_items WHERE restaurant_id = $1 AND name = $2',
        [restaurantId, item.name]
      );
      if (existing.rows.length === 0) {
        await client.query(
          `INSERT INTO inventory_items
           (restaurant_id, name, category, unit, current_quantity, min_quantity, max_quantity,
            reorder_point, unit_cost, supplier, storage_location)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [restaurantId, item.name, item.category, item.unit, item.currentQuantity,
           item.minQuantity, item.maxQuantity, item.reorderPoint, item.unitCost,
           item.supplier, item.storageLocation]
        );
        inventoryCreated++;
      }
    }

    // Seed staff
    let staffCreated = 0;
    const staffMemberIds: string[] = [];
    for (const member of staffMembers) {
      const existing = await client.query(
        'SELECT id FROM staff_members WHERE restaurant_id = $1 AND email = $2',
        [restaurantId, member.email]
      );
      let memberId: string;
      if (existing.rows.length === 0) {
        const result = await client.query(
          `INSERT INTO staff_members
           (restaurant_id, first_name, last_name, email, phone, role, hourly_rate,
            employment_type, skills, max_hours_per_week, hire_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING id`,
          [restaurantId, member.firstName, member.lastName, member.email, member.phone,
           member.role, member.hourlyRate, member.employmentType,
           JSON.stringify(member.skills), member.maxHoursPerWeek,
           new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]
        );
        memberId = result.rows[0].id;
        staffCreated++;
      } else {
        memberId = existing.rows[0].id;
      }
      staffMemberIds.push(memberId);
    }

    // Seed reviews
    let reviewsCreated = 0;
    for (const review of reviews) {
      const existing = await client.query(
        'SELECT id FROM reviews WHERE restaurant_id = $1 AND customer_name = $2 AND title = $3',
        [restaurantId, review.customerName, review.title]
      );
      if (existing.rows.length === 0) {
        await client.query(
          `INSERT INTO reviews
           (restaurant_id, customer_name, rating, title, content, sentiment, is_published)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [restaurantId, review.customerName, review.rating, review.title,
           review.content, review.sentiment, true]
        );
        reviewsCreated++;
      }
    }

    // Seed wait time predictions
    let waitTimeCreated = 0;
    const existingWt = await client.query(
      'SELECT COUNT(*) FROM wait_time_predictions WHERE restaurant_id = $1',
      [restaurantId]
    );
    if (parseInt(existingWt.rows[0].count) < 15) {
      for (const pred of waitTimePredictions) {
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 14));
        createdAt.setHours(Math.floor(Math.random() * 12) + 8);
        await client.query(
          `INSERT INTO wait_time_predictions
           (restaurant_id, predicted_minutes, order_items_count, current_queue_size,
            time_of_day, day_of_week, confidence, actual_minutes, created_at, factors)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [restaurantId, pred.predictedMinutes, pred.orderItemsCount, pred.queueSize,
           pred.timeOfDay, pred.dayOfWeek, pred.confidence, pred.actualMinutes,
           createdAt.toISOString(),
           JSON.stringify({ orderComplexity: 'medium', queueImpact: 'moderate', timeImpact: pred.timeOfDay, staffingImpact: 'adequate' })]
        );
        waitTimeCreated++;
      }
    }

    // Seed upsell recommendations
    let upsellCreated = 0;
    const existingUp = await client.query(
      'SELECT COUNT(*) FROM upsell_recommendations WHERE restaurant_id = $1',
      [restaurantId]
    );
    if (parseInt(existingUp.rows[0].count) < 15) {
      for (const rec of upsellRecommendations) {
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 14));
        await client.query(
          `INSERT INTO upsell_recommendations
           (restaurant_id, cart_items, recommended_items, confidence, was_accepted, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [restaurantId, JSON.stringify(rec.cartItems), JSON.stringify(rec.recommendedItems),
           rec.confidence, rec.wasAccepted, createdAt.toISOString()]
        );
        upsellCreated++;
      }
    }

    await client.query('COMMIT');
    const totals = {
      inventory: parseInt((await client.query('SELECT COUNT(*) FROM inventory_items')).rows[0].count),
      staff: parseInt((await client.query('SELECT COUNT(*) FROM staff_members')).rows[0].count),
      reviews: parseInt((await client.query('SELECT COUNT(*) FROM reviews')).rows[0].count),
      waitTime: parseInt((await client.query('SELECT COUNT(*) FROM wait_time_predictions')).rows[0].count),
      upsell: parseInt((await client.query('SELECT COUNT(*) FROM upsell_recommendations')).rows[0].count),
    };
    const totalCreated = inventoryCreated + staffCreated + reviewsCreated + waitTimeCreated + upsellCreated;
    res.json({
      message: totalCreated > 0
        ? `Loaded ${inventoryCreated} inventory, ${staffCreated} staff, ${reviewsCreated} reviews, ${waitTimeCreated} wait-time, ${upsellCreated} upsell`
        : `All data already loaded`,
      inventory: totals.inventory,
      staff: totals.staff,
      reviews: totals.reviews,
      waitTime: totals.waitTime,
      upsell: totals.upsell,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed all error:', error);
    res.status(500).json({ error: 'Failed to seed data' });
  } finally {
    client.release();
  }
};
