-- AI Features Migration
-- Tables for inventory tracking, staff scheduling, reviews, and AI predictions

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    sku VARCHAR(100),
    unit VARCHAR(50) NOT NULL DEFAULT 'units',
    current_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    min_quantity DECIMAL(10, 2) NOT NULL DEFAULT 10,
    max_quantity DECIMAL(10, 2) NOT NULL DEFAULT 100,
    reorder_point DECIMAL(10, 2) NOT NULL DEFAULT 20,
    unit_cost DECIMAL(10, 2) DEFAULT 0,
    supplier VARCHAR(255),
    supplier_contact VARCHAR(255),
    storage_location VARCHAR(100),
    expiry_date DATE,
    last_restocked_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory usage history for AI predictions
CREATE TABLE IF NOT EXISTS inventory_usage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    quantity_used DECIMAL(10, 2) NOT NULL,
    usage_type VARCHAR(50) DEFAULT 'consumption',
    notes TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Staff members table
CREATE TABLE IF NOT EXISTS staff_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(100) NOT NULL,
    hourly_rate DECIMAL(10, 2) DEFAULT 0,
    employment_type VARCHAR(50) DEFAULT 'full_time',
    hire_date DATE,
    skills JSONB DEFAULT '[]',
    availability JSONB DEFAULT '{}',
    max_hours_per_week INTEGER DEFAULT 40,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Staff schedules table
CREATE TABLE IF NOT EXISTS staff_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_member_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_minutes INTEGER DEFAULT 0,
    role_for_shift VARCHAR(100),
    status VARCHAR(50) DEFAULT 'scheduled',
    ai_suggested BOOLEAN DEFAULT FALSE,
    ai_confidence DECIMAL(3, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customer reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT NOT NULL,
    sentiment VARCHAR(50),
    ai_response TEXT,
    ai_response_generated_at TIMESTAMP WITH TIME ZONE,
    is_published BOOLEAN DEFAULT TRUE,
    is_responded BOOLEAN DEFAULT FALSE,
    response_published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wait time predictions table
CREATE TABLE IF NOT EXISTS wait_time_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    predicted_minutes INTEGER NOT NULL,
    actual_minutes INTEGER,
    order_items_count INTEGER,
    current_queue_size INTEGER,
    time_of_day VARCHAR(20),
    day_of_week VARCHAR(20),
    confidence DECIMAL(3, 2),
    factors JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Upsell recommendations history
CREATE TABLE IF NOT EXISTS upsell_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    cart_id UUID REFERENCES carts(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    cart_items JSONB NOT NULL,
    recommended_items JSONB NOT NULL,
    recommendation_reason TEXT,
    confidence DECIMAL(3, 2),
    was_accepted BOOLEAN,
    accepted_item_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for AI feature tables
CREATE INDEX IF NOT EXISTS idx_inventory_items_restaurant_id ON inventory_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_usage_history_item_id ON inventory_usage_history(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_usage_history_recorded_at ON inventory_usage_history(recorded_at);
CREATE INDEX IF NOT EXISTS idx_staff_members_restaurant_id ON staff_members(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_role ON staff_members(role);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_staff_id ON staff_schedules(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_restaurant_id ON staff_schedules(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_date ON staff_schedules(shift_date);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_wait_time_predictions_restaurant_id ON wait_time_predictions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_wait_time_predictions_order_id ON wait_time_predictions(order_id);
CREATE INDEX IF NOT EXISTS idx_upsell_recommendations_restaurant_id ON upsell_recommendations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_upsell_recommendations_user_id ON upsell_recommendations(user_id);

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_members_updated_at ON staff_members;
CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON staff_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_schedules_updated_at ON staff_schedules;
CREATE TRIGGER update_staff_schedules_updated_at BEFORE UPDATE ON staff_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
