/*
  # Smart Lockers Database Schema

  1. New Tables
    - `companies` - Company information and settings
    - `users` - User accounts with role-based access
    - `locker_cabinets` - Physical locker cabinet locations
    - `compartments` - Individual compartments within cabinets
    - `deliveries` - Package delivery tracking
    - `activity_logs` - System activity logging
    - `notifications` - User notifications
    - `system_settings` - Global system configuration

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for role-based access
    - Secure data access based on company and user roles

  3. Features
    - Automatic timestamp updates
    - Comprehensive indexing for performance
    - Default data for system initialization
*/

-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    phone text,
    address text,
    status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Users table (ensure proper column definition)
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid,
    email text UNIQUE NOT NULL,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text,
    role text NOT NULL CHECK (role IN ('superadmin', 'admin', 'delivery', 'client', 'helpdesk')),
    status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint after table creation
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_company_id_fkey'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_company_id_fkey 
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Locker cabinets table
CREATE TABLE IF NOT EXISTS locker_cabinets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL,
    name text NOT NULL,
    location_address text NOT NULL,
    latitude decimal(10, 8),
    longitude decimal(11, 8),
    esp32_id text UNIQUE NOT NULL,
    mqtt_topic text NOT NULL,
    total_compartments integer NOT NULL DEFAULT 0,
    status text DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'maintenance')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint for locker_cabinets
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'locker_cabinets_company_id_fkey'
    ) THEN
        ALTER TABLE locker_cabinets ADD CONSTRAINT locker_cabinets_company_id_fkey 
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Individual compartments table
CREATE TABLE IF NOT EXISTS compartments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cabinet_id uuid NOT NULL,
    compartment_number integer NOT NULL,
    size text NOT NULL CHECK (size IN ('small', 'medium', 'large')),
    gpio_pin integer NOT NULL,
    status text DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add constraints for compartments
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'compartments_cabinet_id_fkey'
    ) THEN
        ALTER TABLE compartments ADD CONSTRAINT compartments_cabinet_id_fkey 
        FOREIGN KEY (cabinet_id) REFERENCES locker_cabinets(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'compartments_cabinet_compartment_key'
    ) THEN
        ALTER TABLE compartments ADD CONSTRAINT compartments_cabinet_compartment_key 
        UNIQUE(cabinet_id, compartment_number);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'compartments_cabinet_pin_key'
    ) THEN
        ALTER TABLE compartments ADD CONSTRAINT compartments_cabinet_pin_key 
        UNIQUE(cabinet_id, gpio_pin);
    END IF;
END $$;

-- Deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number text UNIQUE NOT NULL,
    company_id uuid NOT NULL,
    delivery_person_id uuid,
    recipient_name text NOT NULL,
    recipient_email text NOT NULL,
    recipient_phone text,
    compartment_id uuid,
    pickup_code text NOT NULL,
    qr_code text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'picked_up', 'returned', 'expired')),
    delivery_date timestamptz,
    pickup_date timestamptz,
    expiry_date timestamptz NOT NULL,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraints for deliveries
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'deliveries_company_id_fkey'
    ) THEN
        ALTER TABLE deliveries ADD CONSTRAINT deliveries_company_id_fkey 
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'deliveries_delivery_person_id_fkey'
    ) THEN
        ALTER TABLE deliveries ADD CONSTRAINT deliveries_delivery_person_id_fkey 
        FOREIGN KEY (delivery_person_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'deliveries_compartment_id_fkey'
    ) THEN
        ALTER TABLE deliveries ADD CONSTRAINT deliveries_compartment_id_fkey 
        FOREIGN KEY (compartment_id) REFERENCES compartments(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    delivery_id uuid,
    compartment_id uuid,
    action text NOT NULL,
    description text,
    ip_address inet,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

-- Add foreign key constraints for activity_logs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'activity_logs_user_id_fkey'
    ) THEN
        ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'activity_logs_delivery_id_fkey'
    ) THEN
        ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_delivery_id_fkey 
        FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'activity_logs_compartment_id_fkey'
    ) THEN
        ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_compartment_id_fkey 
        FOREIGN KEY (compartment_id) REFERENCES compartments(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    delivery_id uuid,
    type text NOT NULL CHECK (type IN ('email', 'sms', 'system')),
    title text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    sent_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Add foreign key constraints for notifications
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_user_id_fkey'
    ) THEN
        ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_delivery_id_fkey'
    ) THEN
        ALTER TABLE notifications ADD CONSTRAINT notifications_delivery_id_fkey 
        FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE;
    END IF;
END $$;

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key text UNIQUE NOT NULL,
    setting_value text,
    description text,
    updated_by uuid,
    updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint for system_settings
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'system_settings_updated_by_fkey'
    ) THEN
        ALTER TABLE system_settings ADD CONSTRAINT system_settings_updated_by_fkey 
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Insert default data (after all tables and constraints are created)
DO $$
DECLARE
    system_company_id uuid;
    superadmin_user_id uuid;
BEGIN
    -- Check if system company already exists
    SELECT id INTO system_company_id FROM companies WHERE email = 'admin@smartlockers.com';
    
    IF system_company_id IS NULL THEN
        -- Insert system company
        INSERT INTO companies (name, email, phone, address) 
        VALUES ('System Administration', 'admin@smartlockers.com', '+1234567890', 'System HQ')
        RETURNING id INTO system_company_id;
    END IF;

    -- Check if superadmin user already exists
    SELECT id INTO superadmin_user_id FROM users WHERE email = 'superadmin@smartlockers.com';
    
    IF superadmin_user_id IS NULL THEN
        -- Insert superadmin user (now that company_id column definitely exists)
        INSERT INTO users (company_id, email, password, first_name, last_name, role) 
        VALUES (system_company_id, 'superadmin@smartlockers.com', '$2b$10$rQZ8kHWKtGkVQWOoN8.rKOqGqGqGqGqGqGqGqGqGqGqGqGqGqGqGq', 'Super', 'Admin', 'superadmin')
        RETURNING id INTO superadmin_user_id;
    END IF;

    -- Insert default system settings (with conflict handling)
    INSERT INTO system_settings (setting_key, setting_value, description, updated_by) VALUES 
    ('pickup_expiry_hours', '72', 'Hours after which undelivered packages expire', superadmin_user_id),
    ('max_delivery_attempts', '3', 'Maximum delivery attempts before marking as failed', superadmin_user_id),
    ('notification_email_enabled', 'true', 'Enable email notifications', superadmin_user_id),
    ('notification_sms_enabled', 'false', 'Enable SMS notifications', superadmin_user_id),
    ('maintenance_mode', 'false', 'System maintenance mode', superadmin_user_id)
    ON CONFLICT (setting_key) DO NOTHING;
END $$;

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locker_cabinets ENABLE ROW LEVEL SECURITY;
ALTER TABLE compartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create triggers for updated_at columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_companies_updated_at') THEN
        CREATE TRIGGER update_companies_updated_at 
        BEFORE UPDATE ON companies 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at 
        BEFORE UPDATE ON users 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_locker_cabinets_updated_at') THEN
        CREATE TRIGGER update_locker_cabinets_updated_at 
        BEFORE UPDATE ON locker_cabinets 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_compartments_updated_at') THEN
        CREATE TRIGGER update_compartments_updated_at 
        BEFORE UPDATE ON compartments 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_deliveries_updated_at') THEN
        CREATE TRIGGER update_deliveries_updated_at 
        BEFORE UPDATE ON deliveries 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_system_settings_updated_at') THEN
        CREATE TRIGGER update_system_settings_updated_at 
        BEFORE UPDATE ON system_settings 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_tracking ON deliveries(tracking_number);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_company ON deliveries(company_id);
CREATE INDEX IF NOT EXISTS idx_compartments_status ON compartments(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

-- RLS Policies (created after all data exists)
DO $$
BEGIN
    -- Companies policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Superadmin can manage companies') THEN
        CREATE POLICY "Superadmin can manage companies" ON companies
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE users.id = auth.uid() 
                    AND users.role = 'superadmin'
                )
            );
    END IF;

    -- Users policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can read own profile') THEN
        CREATE POLICY "Users can read own profile" ON users
            FOR SELECT USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON users
            FOR UPDATE USING (auth.uid() = id)
            WITH CHECK (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Superadmin can manage all users') THEN
        CREATE POLICY "Superadmin can manage all users" ON users
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users u2
                    WHERE u2.id = auth.uid() 
                    AND u2.role = 'superadmin'
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Admin can manage company users') THEN
        CREATE POLICY "Admin can manage company users" ON users
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users u1 
                    WHERE u1.id = auth.uid() 
                    AND u1.role = 'admin'
                    AND u1.company_id = users.company_id
                )
            );
    END IF;

    -- Locker cabinets policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'locker_cabinets' AND policyname = 'Users can view company cabinets') THEN
        CREATE POLICY "Users can view company cabinets" ON locker_cabinets
            FOR SELECT USING (
                company_id IN (
                    SELECT company_id FROM users WHERE id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'locker_cabinets' AND policyname = 'Admin can manage company cabinets') THEN
        CREATE POLICY "Admin can manage company cabinets" ON locker_cabinets
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users u3
                    WHERE u3.id = auth.uid() 
                    AND u3.role IN ('superadmin', 'admin')
                    AND (u3.role = 'superadmin' OR u3.company_id = locker_cabinets.company_id)
                )
            );
    END IF;

    -- Compartments policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'compartments' AND policyname = 'Users can view compartments') THEN
        CREATE POLICY "Users can view compartments" ON compartments
            FOR SELECT USING (
                cabinet_id IN (
                    SELECT lc.id FROM locker_cabinets lc
                    JOIN users u ON u.company_id = lc.company_id
                    WHERE u.id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'compartments' AND policyname = 'Admin can manage compartments') THEN
        CREATE POLICY "Admin can manage compartments" ON compartments
            FOR ALL USING (
                cabinet_id IN (
                    SELECT lc.id FROM locker_cabinets lc
                    JOIN users u ON (u.role = 'superadmin' OR u.company_id = lc.company_id)
                    WHERE u.id = auth.uid() AND u.role IN ('superadmin', 'admin', 'helpdesk')
                )
            );
    END IF;

    -- Deliveries policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deliveries' AND policyname = 'Users can view company deliveries') THEN
        CREATE POLICY "Users can view company deliveries" ON deliveries
            FOR SELECT USING (
                company_id IN (
                    SELECT company_id FROM users WHERE id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deliveries' AND policyname = 'Delivery person can manage own deliveries') THEN
        CREATE POLICY "Delivery person can manage own deliveries" ON deliveries
            FOR ALL USING (
                delivery_person_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM users u4
                    WHERE u4.id = auth.uid() 
                    AND u4.role IN ('superadmin', 'admin')
                    AND (u4.role = 'superadmin' OR u4.company_id = deliveries.company_id)
                )
            );
    END IF;

    -- Activity logs policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activity_logs' AND policyname = 'Users can view company activity') THEN
        CREATE POLICY "Users can view company activity" ON activity_logs
            FOR SELECT USING (
                user_id IN (
                    SELECT u.id FROM users u
                    WHERE EXISTS (
                        SELECT 1 FROM users auth_user 
                        WHERE auth_user.id = auth.uid()
                        AND (auth_user.role = 'superadmin' OR u.company_id = auth_user.company_id)
                    )
                )
            );
    END IF;

    -- Notifications policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view own notifications') THEN
        CREATE POLICY "Users can view own notifications" ON notifications
            FOR SELECT USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'System can create notifications') THEN
        CREATE POLICY "System can create notifications" ON notifications
            FOR INSERT WITH CHECK (true);
    END IF;

    -- System settings policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'system_settings' AND policyname = 'Superadmin can manage settings') THEN
        CREATE POLICY "Superadmin can manage settings" ON system_settings
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users u5
                    WHERE u5.id = auth.uid() 
                    AND u5.role = 'superadmin'
                )
            );
    END IF;
END $$;