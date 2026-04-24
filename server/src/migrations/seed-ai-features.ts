import pool from '../config/database.js';

// Inventory items data (16 items)
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

// Staff members data (15 members)
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

// Reviews data (15 reviews)
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

// Generate staff schedules for current week
function generateSchedules(staffMemberIds: string[], restaurantId: string) {
  const schedules: any[] = [];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);

  const shifts = [
    { start: '06:00', end: '14:00', role: 'morning' },
    { start: '10:00', end: '18:00', role: 'mid' },
    { start: '14:00', end: '22:00', role: 'evening' },
  ];

  // Generate 15+ schedules across the week
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const shiftDate = new Date(startOfWeek);
    shiftDate.setDate(startOfWeek.getDate() + dayOffset);
    const dateStr = shiftDate.toISOString().split('T')[0];

    // Assign 2-3 staff per day
    const staffCount = Math.min(3, staffMemberIds.length);
    for (let i = 0; i < staffCount; i++) {
      const staffIndex = (dayOffset + i) % staffMemberIds.length;
      const shiftIndex = i % shifts.length;
      schedules.push({
        staffMemberId: staffMemberIds[staffIndex],
        restaurantId,
        shiftDate: dateStr,
        startTime: shifts[shiftIndex].start,
        endTime: shifts[shiftIndex].end,
        breakMinutes: 30,
        status: dayOffset < dayOfWeek ? 'completed' : 'scheduled',
        aiSuggested: Math.random() > 0.5,
        aiConfidence: Math.random() * 0.3 + 0.7,
      });
    }
  }

  return schedules;
}

async function seedAIFeatures() {
  const client = await pool.connect();

  try {
    console.log('Starting AI features seed...');
    await client.query('BEGIN');

    // Get or create restaurant
    let restaurantResult = await client.query(
      "SELECT id FROM restaurants WHERE name = 'OrderlyBite Deli' LIMIT 1"
    );

    let restaurantId: string;
    if (restaurantResult.rows.length > 0) {
      restaurantId = restaurantResult.rows[0].id;
    } else {
      // Create a basic restaurant if it doesn't exist
      const newRestaurant = await client.query(
        `INSERT INTO restaurants (name, description, cuisine_type)
         VALUES ('OrderlyBite Deli', 'Fresh, delicious food made to order', 'American Deli')
         RETURNING id`
      );
      restaurantId = newRestaurant.rows[0].id;
    }
    console.log('Using restaurant ID:', restaurantId);

    // Seed inventory items
    console.log('Seeding inventory items...');
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
        console.log(`  Created inventory item: ${item.name}`);
      }
    }

    // Seed staff members
    console.log('Seeding staff members...');
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
        console.log(`  Created staff member: ${member.firstName} ${member.lastName}`);
      } else {
        memberId = existing.rows[0].id;
      }
      staffMemberIds.push(memberId);
    }

    // Seed staff schedules
    console.log('Seeding staff schedules...');
    const schedules = generateSchedules(staffMemberIds, restaurantId);
    for (const schedule of schedules) {
      const existing = await client.query(
        `SELECT id FROM staff_schedules
         WHERE staff_member_id = $1 AND shift_date = $2 AND start_time = $3`,
        [schedule.staffMemberId, schedule.shiftDate, schedule.startTime]
      );

      if (existing.rows.length === 0) {
        await client.query(
          `INSERT INTO staff_schedules
           (staff_member_id, restaurant_id, shift_date, start_time, end_time,
            break_minutes, status, ai_suggested, ai_confidence)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [schedule.staffMemberId, schedule.restaurantId, schedule.shiftDate,
           schedule.startTime, schedule.endTime, schedule.breakMinutes,
           schedule.status, schedule.aiSuggested, schedule.aiConfidence]
        );
      }
    }
    console.log(`  Created ${schedules.length} schedule entries`);

    // Seed reviews
    console.log('Seeding reviews...');
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
        console.log(`  Created review: "${review.title}" by ${review.customerName}`);
      }
    }

    // Seed some inventory usage history
    console.log('Seeding inventory usage history...');
    const inventoryIds = await client.query(
      'SELECT id, name FROM inventory_items WHERE restaurant_id = $1',
      [restaurantId]
    );

    for (const item of inventoryIds.rows) {
      // Create 5-10 usage records per item over the past week
      const usageCount = Math.floor(Math.random() * 6) + 5;
      for (let i = 0; i < usageCount; i++) {
        const daysAgo = Math.floor(Math.random() * 7);
        const recordedAt = new Date();
        recordedAt.setDate(recordedAt.getDate() - daysAgo);

        await client.query(
          `INSERT INTO inventory_usage_history
           (inventory_item_id, quantity_used, usage_type, recorded_at)
           VALUES ($1, $2, $3, $4)`,
          [item.id, Math.random() * 5 + 0.5, 'consumption', recordedAt.toISOString()]
        );
      }
    }
    console.log('  Created usage history records');

    await client.query('COMMIT');
    console.log('AI features seed completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('AI features seed failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedAIFeatures().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
