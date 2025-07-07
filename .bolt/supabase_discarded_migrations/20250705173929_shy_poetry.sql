/*
  # Smart Lockers Database Schema
  
  1. New Tables
    - `companies` - Sociétés clientes
    - `users` - Utilisateurs du système
    - `locker_cabinets` - Armoires de casiers
    - `compartments` - Compartiments individuels
    - `deliveries` - Livraisons
    - `activity_logs` - Journaux d'activité
    - `notifications` - Notifications
    - `system_settings` - Paramètres système
    
  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access
    
  3. Sample Data
    - Default companies and users
    - System settings
*/

-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Table des sociétés
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

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
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

-- Table des armoires de casiers
CREATE TABLE IF NOT EXISTS locker_cabinets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
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

-- Table des compartiments individuels
CREATE TABLE IF NOT EXISTS compartments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cabinet_id uuid NOT NULL REFERENCES locker_cabinets(id) ON DELETE CASCADE,
    compartment_number integer NOT NULL,
    size text NOT NULL CHECK (size IN ('small', 'medium', 'large')),
    gpio_pin integer NOT NULL,
    status text DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(cabinet_id, compartment_number),
    UNIQUE(cabinet_id, gpio_pin)
);

-- Table des livraisons
CREATE TABLE IF NOT EXISTS deliveries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number text UNIQUE NOT NULL,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    delivery_person_id uuid REFERENCES users(id) ON DELETE SET NULL,
    recipient_name text NOT NULL,
    recipient_email text NOT NULL,
    recipient_phone text,
    compartment_id uuid REFERENCES compartments(id) ON DELETE SET NULL,
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

-- Table des journaux d'activité
CREATE TABLE IF NOT EXISTS activity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    delivery_id uuid REFERENCES deliveries(id) ON DELETE SET NULL,
    compartment_id uuid REFERENCES compartments(id) ON DELETE SET NULL,
    action text NOT NULL,
    description text,
    ip_address inet,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    delivery_id uuid REFERENCES deliveries(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('email', 'sms', 'system')),
    title text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    sent_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Table des paramètres système
CREATE TABLE IF NOT EXISTS system_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key text UNIQUE NOT NULL,
    setting_value text,
    description text,
    updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
    updated_at timestamptz DEFAULT now()
);

-- Insert default data
DO $$
DECLARE
    smartlockers_company_id uuid;
    delivery_company_id uuid;
    superadmin_user_id uuid;
BEGIN
    -- Insert companies
    INSERT INTO companies (name, email, phone, address) 
    VALUES ('Smart Lockers Corp', 'contact@smartlockers.com', '+33123456789', '123 Tech Street, Paris')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO smartlockers_company_id;
    
    -- Get company ID if already exists
    IF smartlockers_company_id IS NULL THEN
        SELECT id INTO smartlockers_company_id FROM companies WHERE email = 'contact@smartlockers.com';
    END IF;
    
    INSERT INTO companies (name, email, phone, address) 
    VALUES ('Delivery Express', 'info@deliveryexpress.com', '+33987654321', '456 Logistics Ave, Lyon')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO delivery_company_id;
    
    -- Get company ID if already exists
    IF delivery_company_id IS NULL THEN
        SELECT id INTO delivery_company_id FROM companies WHERE email = 'info@deliveryexpress.com';
    END IF;

    -- Insert users (password: password123)
    INSERT INTO users (company_id, email, password, first_name, last_name, phone, role) 
    VALUES (smartlockers_company_id, 'superadmin@smartlockers.com', '$2b$10$rQZ8kHWKtGkVQWOoN8.rKOqGqGqGqGqGqGqGqGqGqGqGqGqGqGqGq', 'Super', 'Admin', '+33100000001', 'superadmin')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO superadmin_user_id;
    
    -- Get user ID if already exists
    IF superadmin_user_id IS NULL THEN
        SELECT id INTO superadmin_user_id FROM users WHERE email = 'superadmin@smartlockers.com';
    END IF;
    
    INSERT INTO users (company_id, email, password, first_name, last_name, phone, role) VALUES 
    (delivery_company_id, 'admin@company.com', '$2b$10$rQZ8kHWKtGkVQWOoN8.rKOqGqGqGqGqGqGqGqGqGqGqGqGqGqGqGq', 'Admin', 'Company', '+33100000002', 'admin'),
    (delivery_company_id, 'delivery@company.com', '$2b$10$rQZ8kHWKtGkVQWOoN8.rKOqGqGqGqGqGqGqGqGqGqGqGqGqGqGqGq', 'Jean', 'Livreur', '+33100000003', 'delivery'),
    (delivery_company_id, 'client@company.com', '$2b$10$rQZ8kHWKtGkVQWOoN8.rKOqGqGqGqGqGqGqGqGqGqGqGqGqGqGqGq', 'Marie', 'Client', '+33100000004', 'client'),
    (smartlockers_company_id, 'helpdesk@smartlockers.com', '$2b$10$rQZ8kHWKtGkVQWOoN8.rKOqGqGqGqGqGqGqGqGqGqGqGqGqGqGqGq', 'Support', 'Technique', '+33100000005', 'helpdesk')
    ON CONFLICT (email) DO NOTHING;

    -- Insert system settings
    INSERT INTO system_settings (setting_key, setting_value, description, updated_by) VALUES 
    ('pickup_expiry_hours', '72', 'Heures après lesquelles les colis non récupérés expirent', superadmin_user_id),
    ('max_delivery_attempts', '3', 'Nombre maximum de tentatives de livraison avant échec', superadmin_user_id),
    ('notification_email_enabled', 'true', 'Activer les notifications par email', superadmin_user_id),
    ('notification_sms_enabled', 'false', 'Activer les notifications par SMS', superadmin_user_id),
    ('maintenance_mode', 'false', 'Mode maintenance du système', superadmin_user_id)
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
CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON companies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locker_cabinets_updated_at 
    BEFORE UPDATE ON locker_cabinets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compartments_updated_at 
    BEFORE UPDATE ON compartments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at 
    BEFORE UPDATE ON deliveries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- RLS Policies

-- Companies policies
CREATE POLICY "Superadmin can manage companies" ON companies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

-- Users policies
CREATE POLICY "Users can read own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Superadmin can manage all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u2
            WHERE u2.id = auth.uid() 
            AND u2.role = 'superadmin'
        )
    );

CREATE POLICY "Admin can manage company users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u1 
            WHERE u1.id = auth.uid() 
            AND u1.role = 'admin'
            AND u1.company_id = users.company_id
        )
    );

-- Locker cabinets policies
CREATE POLICY "Users can view company cabinets" ON locker_cabinets
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admin can manage company cabinets" ON locker_cabinets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u3
            WHERE u3.id = auth.uid() 
            AND u3.role IN ('superadmin', 'admin')
            AND (u3.role = 'superadmin' OR u3.company_id = locker_cabinets.company_id)
        )
    );

-- Compartments policies
CREATE POLICY "Users can view compartments" ON compartments
    FOR SELECT USING (
        cabinet_id IN (
            SELECT lc.id FROM locker_cabinets lc
            JOIN users u ON u.company_id = lc.company_id
            WHERE u.id = auth.uid()
        )
    );

CREATE POLICY "Admin can manage compartments" ON compartments
    FOR ALL USING (
        cabinet_id IN (
            SELECT lc.id FROM locker_cabinets lc
            JOIN users u ON (u.role = 'superadmin' OR u.company_id = lc.company_id)
            WHERE u.id = auth.uid() AND u.role IN ('superadmin', 'admin', 'helpdesk')
        )
    );

-- Deliveries policies
CREATE POLICY "Users can view company deliveries" ON deliveries
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

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

-- Activity logs policies
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

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- System settings policies
CREATE POLICY "Superadmin can manage settings" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u5
            WHERE u5.id = auth.uid() 
            AND u5.role = 'superadmin'
        )
    );