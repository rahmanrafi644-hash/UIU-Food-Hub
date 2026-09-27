-- ====================================================================
-- UIU FOOD HUB - SUPABASE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- ====================================================================
-- Run this script in your Supabase Project: Dashboard > SQL Editor > New Query
-- It configures tables, constraints, trigger functions, seed data, and RLS policies.

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create User Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('student', 'vendor')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  student_id TEXT, -- e.g. '011211048' (for students)
  vendor_outlet_id TEXT, -- e.g. 'khans-kitchen' (for vendors)
  vendor_outlet_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Database-level rule: Students MUST have an email ending with .uiu.ac.bd (e.g. @bba.uiu.ac.bd, @cse.uiu.ac.bd) or @uiu.ac.bd
  CONSTRAINT check_student_email CHECK (
    role <> 'student' OR email ILIKE '%.uiu.ac.bd' OR email ILIKE '%@uiu.ac.bd'
  )
);

-- 3. Create Vendors Table
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  outlet_id TEXT NOT NULL,
  outlet_name TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Inventory Table (Persistent stock & items)
CREATE TABLE IF NOT EXISTS public.inventory (
  id TEXT PRIMARY KEY,
  outlet_id TEXT NOT NULL,
  outlet_name TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  description TEXT,
  image TEXT,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Low Stock', 'Sold Out')),
  prep_time_minutes INTEGER DEFAULT 15,
  rating NUMERIC(3, 1) DEFAULT 4.5,
  popular BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL, -- e.g. 'ORD-1045'
  student_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  vendor_id TEXT NOT NULL, -- matches outlet_id (e.g. 'khans-kitchen')
  outlet_name TEXT NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  pickup_type TEXT NOT NULL DEFAULT 'ASAP' CHECK (pickup_type IN ('ASAP', 'Schedule Pickup')),
  pickup_date TEXT DEFAULT 'Today',
  pickup_time TEXT NOT NULL,
  pickup_window TEXT,
  pickup_offset_minutes INTEGER DEFAULT 15,
  is_scheduled_ahead BOOLEAN DEFAULT false,
  slot_secured BOOLEAN DEFAULT true,
  pickup_pin TEXT NOT NULL, -- 4-digit code e.g. '4821'
  special_instructions TEXT,
  payment_method TEXT NOT NULL DEFAULT 'bKash' CHECK (payment_method IN ('Cash', 'bKash', 'Nagad', 'Rocket')),
  status TEXT NOT NULL DEFAULT 'Placed' CHECK (status IN ('Placed', 'Preparing', 'Ready', 'Completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  food_item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create Table Bookings Table
CREATE TABLE IF NOT EXISTS public.table_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number TEXT UNIQUE NOT NULL, -- e.g. 'TB-102'
  student_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_phone TEXT,
  outlet_id TEXT NOT NULL,
  outlet_name TEXT NOT NULL,
  table_number TEXT NOT NULL,
  booking_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  guests INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'Active', 'Completed', 'Cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create Customer Reports Table
CREATE TABLE IF NOT EXISTS public.customer_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  outlet_id TEXT NOT NULL,
  outlet_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Reviewing', 'Resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Create Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  outlet_id TEXT NOT NULL,
  outlet_name TEXT NOT NULL,
  order_id TEXT,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('student', 'vendor')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_full_name TEXT;
  user_phone TEXT;
  user_student_id TEXT;
  user_outlet_id TEXT;
  user_outlet_name TEXT;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  user_phone := NEW.raw_user_meta_data->>'phone';
  user_student_id := NEW.raw_user_meta_data->>'student_id';
  user_outlet_id := NEW.raw_user_meta_data->>'vendor_outlet_id';
  user_outlet_name := NEW.raw_user_meta_data->>'vendor_outlet_name';

  -- Double check student email constraint before inserting (supports @bba.uiu.ac.bd, @cse.uiu.ac.bd, etc.)
  IF user_role = 'student' AND NOT (NEW.email ILIKE '%.uiu.ac.bd' OR NEW.email ILIKE '%@uiu.ac.bd') THEN
    RAISE EXCEPTION 'Students must register using a valid UIU institutional email address ending with .uiu.ac.bd (e.g. yourid@bba.uiu.ac.bd, yourid@cse.uiu.ac.bd).';
  END IF;

  INSERT INTO public.profiles (
    id,
    role,
    full_name,
    email,
    phone,
    student_id,
    vendor_outlet_id,
    vendor_outlet_name
  ) VALUES (
    NEW.id,
    user_role,
    user_full_name,
    NEW.email,
    user_phone,
    user_student_id,
    user_outlet_id,
    user_outlet_name
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    vendor_outlet_id = EXCLUDED.vendor_outlet_id,
    vendor_outlet_name = EXCLUDED.vendor_outlet_name,
    updated_at = NOW();

  -- If vendor, also record in vendors table
  IF user_role = 'vendor' AND user_outlet_id IS NOT NULL THEN
    INSERT INTO public.vendors (
      user_id,
      outlet_id,
      outlet_name,
      vendor_name,
      email,
      phone
    ) VALUES (
      NEW.id,
      user_outlet_id,
      COALESCE(user_outlet_name, user_outlet_id),
      user_full_name,
      NEW.email,
      user_phone
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- 1. Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Vendors RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors viewable by all authenticated users"
  ON public.vendors FOR SELECT
  TO authenticated
  USING (true);

-- 3. Inventory RLS
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inventory is viewable by all users"
  ON public.inventory FOR SELECT
  USING (true);

CREATE POLICY "Vendors can update stock for their own outlet"
  ON public.inventory FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'vendor'
        AND profiles.vendor_outlet_id = inventory.outlet_id
    )
  );

CREATE POLICY "Vendors can insert items for their own outlet"
  ON public.inventory FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'vendor'
        AND profiles.vendor_outlet_id = inventory.outlet_id
    )
  );

-- 4. Orders RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Students can see their own orders
CREATE POLICY "Students can view their own orders"
  ON public.orders FOR SELECT
  USING (student_user_id = auth.uid());

-- Vendors can see orders belonging strictly to their outlet
CREATE POLICY "Vendors can view their outlet orders"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'vendor'
        AND profiles.vendor_outlet_id = orders.vendor_id
    )
  );

-- Students can place orders
CREATE POLICY "Students can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (student_user_id = auth.uid());

-- Vendors can update order status (Placed -> Preparing -> Ready -> Completed)
CREATE POLICY "Vendors can update their outlet orders"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'vendor'
        AND profiles.vendor_outlet_id = orders.vendor_id
    )
  );

-- 5. Order Items RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order items viewable by order owner or outlet vendor"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND (
          orders.student_user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'vendor'
              AND profiles.vendor_outlet_id = orders.vendor_id
          )
        )
    )
  );

CREATE POLICY "Authenticated users can insert order items"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 6. Table Bookings RLS
ALTER TABLE public.table_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own bookings"
  ON public.table_bookings FOR SELECT
  USING (student_user_id = auth.uid());

CREATE POLICY "Vendors can view bookings for their outlet"
  ON public.table_bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'vendor'
        AND profiles.vendor_outlet_id = table_bookings.outlet_id
    )
  );

CREATE POLICY "Students can book tables"
  ON public.table_bookings FOR INSERT
  WITH CHECK (student_user_id = auth.uid());

CREATE POLICY "Vendors can update booking status"
  ON public.table_bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'vendor'
        AND profiles.vendor_outlet_id = table_bookings.outlet_id
    )
  );

-- 7. Chat Messages RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students and outlet vendors can view their messages"
  ON public.chat_messages FOR SELECT
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'vendor'
        AND profiles.vendor_outlet_id = chat_messages.outlet_id
    )
  );

CREATE POLICY "Authenticated users can insert messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'vendor'
    )
  );

-- Enable Realtime replication for dynamic live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.table_bookings;

-- ====================================================================
-- SEED INITIAL CAMPUS INVENTORY DATA
-- ====================================================================
INSERT INTO public.inventory (id, outlet_id, outlet_name, name, category, price, description, image, stock, status, prep_time_minutes, rating, popular)
VALUES
  -- Khan's Kitchen
  ('kk-fried-rice', 'khans-kitchen', 'Khan''s Kitchen', 'Egg Fried Rice', 'Rice', 120, 'Classic wok-tossed fragrant rice with egg ribbons and vegetables.', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80', 25, 'Available', 10, 4.8, true),
  ('kk-chicken-fry', 'khans-kitchen', 'Khan''s Kitchen', 'Crispy Chicken Fry', 'Chicken', 110, 'Golden deep-fried quarter piece spiced with signature UIU recipe.', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80', 10, 'Available', 12, 4.9, true),
  ('kk-vegetables', 'khans-kitchen', 'Khan''s Kitchen', 'Mixed Chinese Vegetables', 'Rice', 60, 'Seasonal garden veggies sauteed in light oyster gravy.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', 18, 'Available', 8, 4.3, false),
  ('kk-dim-khichuri', 'khans-kitchen', 'Khan''s Kitchen', 'Dim Khichuri', 'Rice', 90, 'Comforting yellow lentils and rice served with boiled and fried egg.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80', 15, 'Available', 8, 4.7, false),
  ('kk-chicken-khichuri', 'khans-kitchen', 'Khan''s Kitchen', 'Chicken Khichuri', 'Rice', 160, 'Flavorful Bhuna Khichuri packed with tender spiced chicken.', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80', 12, 'Available', 15, 4.8, true),
  ('kk-sandwich', 'khans-kitchen', 'Khan''s Kitchen', 'Club Sandwich', 'Snacks', 85, 'Triple layer toasted sandwich with chicken and mayo.', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80', 20, 'Available', 6, 4.5, false),
  ('kk-shawarma', 'khans-kitchen', 'Khan''s Kitchen', 'Chicken Shawarma Wrap', 'Snacks', 110, 'Pita bread wrap loaded with shredded roast chicken and garlic tahini.', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80', 16, 'Available', 10, 4.7, true),

  -- Olympia
  ('ol-fried-rice', 'olympia', 'Olympia', 'Olympia Special Fried Rice', 'Rice', 130, 'Spicy stir-fried basmati rice cooked with egg, chicken bits & bell peppers.', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80', 22, 'Available', 12, 4.6, true),
  ('ol-chicken-fry', 'olympia', 'Olympia', 'Southern Fried Chicken', 'Chicken', 115, 'Crunchy breaded chicken leg marinated in buttermilk spice.', 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80', 14, 'Available', 10, 4.7, false),
  ('ol-vegetables', 'olympia', 'Olympia', 'Stir Fry Vegetable Medley', 'Rice', 65, 'Broccoli, carrots, and mushrooms lightly glazed.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', 15, 'Available', 8, 4.2, false),
  ('ol-dim-khichuri', 'olympia', 'Olympia', 'Egg Khichuri Bowl', 'Rice', 95, 'Traditional comfort bowl with golden fried egg & achari pickle.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80', 14, 'Available', 8, 4.5, false),
  ('ol-chicken-khichuri', 'olympia', 'Olympia', 'Olympia Chicken Khichuri', 'Rice', 165, 'Richly aromatic rice and lentils with roasted bone-in chicken piece.', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80', 16, 'Available', 14, 4.9, true),
  ('ol-sandwich', 'olympia', 'Olympia', 'Grilled Chicken Sub', 'Snacks', 90, 'Herb chicken with melting cheese slice in baguette.', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80', 18, 'Available', 7, 4.4, false),
  ('ol-shawarma', 'olympia', 'Olympia', 'Spicy Lebanese Shawarma', 'Snacks', 120, 'Authentic flatbread packed with spiced chicken and cucumber yogurt sauce.', 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=600&q=80', 12, 'Available', 9, 4.8, true),

  -- CP
  ('cp-chicken-fry', 'cp', 'CP', 'CP Five Star Crispy Chicken', 'Chicken', 95, 'The iconic crunchy CP golden drumstick snack.', 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80', 30, 'Available', 5, 4.8, true),
  ('cp-spicy-chicken-fry', 'cp', 'CP', 'Spicy Crispy Chicken', 'Chicken', 105, 'Hot chili battered fried chicken for spice lovers.', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80', 25, 'Available', 5, 4.9, true),
  ('cp-sausage', 'cp', 'CP', 'Smoked Chicken Frank Sausage', 'Snacks', 70, 'Jumbo seasoned chicken sausage on a stick with mustard.', 'https://images.unsplash.com/photo-1597692493630-1c64dfc01bc7?auto=format&fit=crop&w=600&q=80', 35, 'Available', 4, 4.6, false),
  ('cp-meatballs', 'cp', 'CP', 'Spicy Fried Meatballs (5 pcs)', 'Snacks', 85, 'Savory minced chicken balls served with sweet chili dip.', 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&q=80', 20, 'Available', 5, 4.7, false),

  -- Brew
  ('brew-americano', 'brew', 'Brew', 'Hot Caffe Americano', 'Coffee', 90, 'Rich double espresso pulled fresh and diluted with hot mineral water.', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80', 40, 'Available', 4, 4.7, false),
  ('brew-cappuccino', 'brew', 'Brew', 'Frothy Cappuccino', 'Coffee', 130, 'Espresso layered with steamed whole milk and velvety microfoam.', 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80', 35, 'Available', 5, 4.8, true),
  ('brew-latte', 'brew', 'Brew', 'Classic Cafe Latte', 'Coffee', 140, 'Smooth and mild roasted blend with creamy steamed milk.', 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=600&q=80', 30, 'Available', 5, 4.9, false),
  ('brew-mocha', 'brew', 'Brew', 'Chocolate Cafe Mocha', 'Coffee', 160, 'Espresso with rich Belgian cocoa sauce, milk, and chocolate swirl.', 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=600&q=80', 25, 'Available', 6, 4.8, false),
  ('brew-cold-coffee', 'brew', 'Brew', 'UIU Special Cold Coffee', 'Coffee', 120, 'Blended iced cold coffee with vanilla ice cream top.', 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80', 45, 'Available', 5, 5.0, true),
  ('brew-iced-latte', 'brew', 'Brew', 'Iced Caramel Latte', 'Coffee', 150, 'Chilled espresso over milk and ice with drizzle of salted caramel.', 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80', 30, 'Available', 4, 4.8, false),

  -- Toa's Kitchen
  ('toa-mango-juice', 'toas-kitchen', 'Toa''s Kitchen', 'Fresh Rajshahi Mango Juice', 'Juice', 80, 'Pure blended seasonal sweet mango pulp chilled with crushed ice.', 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80', 25, 'Available', 4, 4.9, true),
  ('toa-orange-juice', 'toas-kitchen', 'Toa''s Kitchen', 'Fresh Squeezed Orange Juice', 'Juice', 90, '100% natural Valencia oranges squeezed to order with citrus pulp.', 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80', 20, 'Available', 4, 4.7, false),
  ('toa-watermelon-juice', 'toas-kitchen', 'Toa''s Kitchen', 'Hydrating Watermelon Juice', 'Juice', 70, 'Cold pressed fresh watermelon with pinch of black salt and mint.', 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=600&q=80', 30, 'Available', 3, 4.8, true),
  ('toa-pineapple-juice', 'toas-kitchen', 'Toa''s Kitchen', 'Tangy Pineapple Juice', 'Juice', 85, 'Freshly blended Modhupur pineapple with hint of rock salt.', 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=600&q=80', 20, 'Available', 4, 4.6, false),
  ('toa-lemon-juice', 'toas-kitchen', 'Toa''s Kitchen', 'Iced Fresh Lemonade (Shikanji)', 'Juice', 50, 'Zesty squeezed green lemon with mint leaves and crushed ice.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80', 40, 'Available', 2, 4.9, false)
ON CONFLICT (id) DO UPDATE SET
  stock = EXCLUDED.stock,
  price = EXCLUDED.price,
  status = EXCLUDED.status,
  updated_at = NOW();
