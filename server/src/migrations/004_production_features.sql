-- Production Features Migration
-- ai_results audit table, dynamic pricing, voice orders, group orders,
-- loyalty points, coupons, restocking events

-- Central AI results audit table
CREATE TABLE IF NOT EXISTS ai_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint VARCHAR(100) NOT NULL,
    input_data JSONB,
    output_data JSONB,
    model_used VARCHAR(100),
    latency_ms INTEGER,
    tokens_used INTEGER,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_results_endpoint ON ai_results(endpoint);
CREATE INDEX IF NOT EXISTS idx_ai_results_created_by ON ai_results(created_by);
CREATE INDEX IF NOT EXISTS idx_ai_results_created_at ON ai_results(created_at);

-- Dynamic pricing suggestions table
CREATE TABLE IF NOT EXISTS dynamic_pricing_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    base_price DECIMAL(10, 2) NOT NULL,
    modifier_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
    suggested_price DECIMAL(10, 2) NOT NULL,
    direction VARCHAR(20) DEFAULT 'none',
    reasoning TEXT,
    confidence DECIMAL(3, 2),
    queue_size INTEGER,
    time_of_day VARCHAR(30),
    is_applied BOOLEAN DEFAULT FALSE,
    applied_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_menu_item ON dynamic_pricing_suggestions(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_created_at ON dynamic_pricing_suggestions(created_at);

-- Voice order sessions
CREATE TABLE IF NOT EXISTS voice_order_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id VARCHAR(100) UNIQUE NOT NULL,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    transcript_text TEXT,
    transcript_confidence DECIMAL(3, 2),
    parsed_items JSONB DEFAULT '[]',
    total_amount DECIMAL(10, 2) DEFAULT 0,
    agent_reply TEXT,
    needs_confirmation BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'pending',
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_voice_orders_call_id ON voice_order_sessions(call_id);
CREATE INDEX IF NOT EXISTS idx_voice_orders_user_id ON voice_order_sessions(user_id);

-- Group orders
CREATE TABLE IF NOT EXISTS group_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_code VARCHAR(10) UNIQUE NOT NULL,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    host_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    host_name VARCHAR(100),
    status VARCHAR(50) DEFAULT 'open',
    items JSONB DEFAULT '[]',
    members JSONB DEFAULT '[]',
    total_amount DECIMAL(10, 2) DEFAULT 0,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '2 hours'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_group_orders_invite_code ON group_orders(invite_code);
CREATE INDEX IF NOT EXISTS idx_group_orders_status ON group_orders(status);

-- Loyalty points
CREATE TABLE IF NOT EXISTS loyalty_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL DEFAULT 0,
    reason VARCHAR(255),
    reference_id UUID,
    reference_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_loyalty_points_user_id ON loyalty_points(user_id);

-- User loyalty balance view helper (summed)
-- Use: SELECT COALESCE(SUM(points), 0) FROM loyalty_points WHERE user_id = $1

-- Coupons / Discount codes
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL DEFAULT 'percent',  -- 'percent' or 'fixed'
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);

-- Coupon usages
CREATE TABLE IF NOT EXISTS coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory restocking events
CREATE TABLE IF NOT EXISTS inventory_restocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    quantity_added DECIMAL(10, 2) NOT NULL,
    unit_cost DECIMAL(10, 2),
    supplier VARCHAR(255),
    invoice_number VARCHAR(100),
    notes TEXT,
    restocked_by UUID REFERENCES users(id) ON DELETE SET NULL,
    restocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_restocks_item_id ON inventory_restocks(inventory_item_id);

-- Sustainability scores
CREATE TABLE IF NOT EXISTS sustainability_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(255),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    items JSONB DEFAULT '[]',
    delivery_distance_km DECIMAL(8, 2),
    packaging_type VARCHAR(50),
    total_co2_kg DECIMAL(8, 3),
    ingredient_score INTEGER,
    delivery_score INTEGER,
    packaging_score INTEGER,
    overall_score INTEGER,
    rating VARCHAR(2),
    loyalty_points_earned INTEGER DEFAULT 0,
    suggestions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sustainability_scores_user_id ON sustainability_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_sustainability_scores_order_id ON sustainability_scores(order_id);

-- Affiliate / partner restaurants
CREATE TABLE IF NOT EXISTS affiliate_restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    cuisine_types JSONB DEFAULT '[]',
    address TEXT,
    city VARCHAR(100),
    distance_km DECIMAL(8, 2),
    current_capacity DECIMAL(3, 2) DEFAULT 0.5,
    estimated_wait_min INTEGER DEFAULT 20,
    contact_email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Affiliate routing decisions
CREATE TABLE IF NOT EXISTS affiliate_routing_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
    recommended_affiliate_id UUID REFERENCES affiliate_restaurants(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    reason TEXT,
    expected_time_savings_min INTEGER,
    was_accepted BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_voice_order_sessions_updated_at ON voice_order_sessions;
CREATE TRIGGER update_voice_order_sessions_updated_at BEFORE UPDATE ON voice_order_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_group_orders_updated_at ON group_orders;
CREATE TRIGGER update_group_orders_updated_at BEFORE UPDATE ON group_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_affiliate_restaurants_updated_at ON affiliate_restaurants;
CREATE TRIGGER update_affiliate_restaurants_updated_at BEFORE UPDATE ON affiliate_restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add role column to users if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer';

-- Add discount_amount to orders if not exists
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL;
