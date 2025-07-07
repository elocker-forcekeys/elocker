-- =====================================================
-- SMART LOCKERS - SCHÉMA MYSQL COMPLET
-- =====================================================

-- Activer les clés étrangères
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. GESTION DES SOCIÉTÉS/ENTREPRISES
-- =====================================================

CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    website VARCHAR(255),
    logo_url VARCHAR(500),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    subscription_plan_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_companies_status (status),
    INDEX idx_companies_email (email)
);

-- =====================================================
-- 2. GESTION DES UTILISATEURS ET RÔLES
-- =====================================================

CREATE TABLE IF NOT EXISTS app_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    role ENUM('superadmin', 'admin', 'delivery', 'client', 'helpdesk') NOT NULL DEFAULT 'client',
    status ENUM('active', 'inactive', 'suspended', 'pending') DEFAULT 'active',
    avatar_url VARCHAR(500),
    last_login TIMESTAMP NULL,
    email_verified_at TIMESTAMP NULL,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP NULL,
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_app_users_email (email),
    INDEX idx_app_users_company (company_id),
    INDEX idx_app_users_role (role),
    INDEX idx_app_users_status (status)
);

-- =====================================================
-- 3. PLANS TARIFAIRES ET ABONNEMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'EUR',
    max_users INT DEFAULT -1 COMMENT '-1 = illimité',
    max_lockers INT DEFAULT -1 COMMENT '-1 = illimité',
    max_deliveries_per_month INT DEFAULT -1 COMMENT '-1 = illimité',
    max_api_calls_per_month INT DEFAULT -1 COMMENT '-1 = illimité',
    features JSON COMMENT 'Liste des fonctionnalités incluses',
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_plans_active (is_active),
    INDEX idx_plans_popular (is_popular)
);

CREATE TABLE IF NOT EXISTS company_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    plan_id INT NOT NULL,
    status ENUM('active', 'cancelled', 'expired', 'trial') DEFAULT 'active',
    billing_cycle ENUM('monthly', 'yearly') DEFAULT 'monthly',
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    trial_ends_at TIMESTAMP NULL,
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    cancelled_at TIMESTAMP NULL,
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
    INDEX idx_subscriptions_company (company_id),
    INDEX idx_subscriptions_status (status),
    INDEX idx_subscriptions_stripe (stripe_subscription_id)
);

-- =====================================================
-- 4. GESTION DES ARMOIRES ET CASIERS
-- =====================================================

CREATE TABLE IF NOT EXISTS locker_cabinets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location_address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    esp32_id VARCHAR(100) NOT NULL UNIQUE,
    mqtt_topic VARCHAR(255),
    wifi_ssid VARCHAR(100),
    total_compartments INT NOT NULL DEFAULT 0,
    status ENUM('online', 'offline', 'maintenance', 'error') DEFAULT 'offline',
    firmware_version VARCHAR(50),
    last_ping TIMESTAMP NULL,
    battery_level INT DEFAULT 100,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    wifi_signal_strength INT,
    installation_date DATE,
    maintenance_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_cabinets_company (company_id),
    INDEX idx_cabinets_status (status),
    INDEX idx_cabinets_esp32 (esp32_id),
    INDEX idx_cabinets_location (latitude, longitude)
);

CREATE TABLE IF NOT EXISTS compartments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cabinet_id INT NOT NULL,
    compartment_number INT NOT NULL,
    size ENUM('small', 'medium', 'large', 'extra_large') NOT NULL DEFAULT 'medium',
    width_cm DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    depth_cm DECIMAL(5,2),
    max_weight_kg DECIMAL(5,2),
    gpio_pin INT,
    status ENUM('available', 'occupied', 'maintenance', 'reserved', 'error') DEFAULT 'available',
    sensor_type VARCHAR(50),
    lock_type VARCHAR(50),
    last_opened TIMESTAMP NULL,
    last_closed TIMESTAMP NULL,
    open_count INT DEFAULT 0,
    maintenance_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cabinet_id) REFERENCES locker_cabinets(id) ON DELETE CASCADE,
    UNIQUE KEY unique_compartment (cabinet_id, compartment_number),
    INDEX idx_compartments_cabinet (cabinet_id),
    INDEX idx_compartments_status (status),
    INDEX idx_compartments_size (size)
);

-- =====================================================
-- 5. SYSTÈME DE LIVRAISONS ET SUIVI
-- =====================================================

CREATE TABLE IF NOT EXISTS deliveries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tracking_number VARCHAR(50) NOT NULL UNIQUE,
    company_id INT NOT NULL,
    delivery_person_id INT,
    compartment_id INT,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_phone VARCHAR(50),
    sender_name VARCHAR(255),
    sender_email VARCHAR(255),
    sender_phone VARCHAR(50),
    package_description TEXT,
    package_weight_kg DECIMAL(5,2),
    package_dimensions VARCHAR(100),
    pickup_code VARCHAR(20) NOT NULL,
    qr_code TEXT,
    status ENUM('pending', 'delivered', 'picked_up', 'returned', 'expired', 'cancelled') DEFAULT 'pending',
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    delivery_instructions TEXT,
    special_requirements TEXT,
    estimated_delivery TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    pickup_date TIMESTAMP NULL,
    expiry_date TIMESTAMP NOT NULL,
    return_date TIMESTAMP NULL,
    delivery_photo_url VARCHAR(500),
    pickup_photo_url VARCHAR(500),
    signature_data TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (delivery_person_id) REFERENCES app_users(id) ON DELETE SET NULL,
    FOREIGN KEY (compartment_id) REFERENCES compartments(id) ON DELETE SET NULL,
    INDEX idx_deliveries_tracking (tracking_number),
    INDEX idx_deliveries_company (company_id),
    INDEX idx_deliveries_status (status),
    INDEX idx_deliveries_recipient (recipient_email),
    INDEX idx_deliveries_delivery_person (delivery_person_id),
    INDEX idx_deliveries_expiry (expiry_date)
);

CREATE TABLE IF NOT EXISTS delivery_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    delivery_id INT NOT NULL,
    status ENUM('created', 'in_transit', 'delivered', 'picked_up', 'returned', 'expired', 'cancelled') NOT NULL,
    location VARCHAR(255),
    description TEXT,
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE SET NULL,
    INDEX idx_tracking_delivery (delivery_id),
    INDEX idx_tracking_status (status),
    INDEX idx_tracking_created (created_at)
);

-- =====================================================
-- 6. SYSTÈME DE TICKETS SUPPORT
-- =====================================================

CREATE TABLE IF NOT EXISTS support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    company_id INT NOT NULL,
    user_id INT,
    assigned_to INT,
    cabinet_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('technical', 'delivery', 'account', 'hardware', 'software', 'billing', 'other') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'waiting_customer', 'resolved', 'closed') DEFAULT 'open',
    resolution TEXT,
    resolved_at TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    customer_rating INT CHECK (customer_rating >= 1 AND customer_rating <= 5),
    customer_feedback TEXT,
    internal_notes TEXT,
    attachments JSON,
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES app_users(id) ON DELETE SET NULL,
    FOREIGN KEY (cabinet_id) REFERENCES locker_cabinets(id) ON DELETE SET NULL,
    INDEX idx_tickets_number (ticket_number),
    INDEX idx_tickets_company (company_id),
    INDEX idx_tickets_status (status),
    INDEX idx_tickets_priority (priority),
    INDEX idx_tickets_assigned (assigned_to),
    INDEX idx_tickets_category (category)
);

CREATE TABLE IF NOT EXISTS ticket_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    user_id INT,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    is_system_message BOOLEAN DEFAULT FALSE,
    attachments JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE SET NULL,
    INDEX idx_comments_ticket (ticket_id),
    INDEX idx_comments_user (user_id),
    INDEX idx_comments_created (created_at)
);

-- =====================================================
-- 7. MONITORING ET LOGS D'ACTIVITÉ
-- =====================================================

CREATE TABLE IF NOT EXISTS cabinet_monitoring (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cabinet_id INT NOT NULL,
    metric_type ENUM('temperature', 'humidity', 'battery', 'wifi_signal', 'door_sensor', 'motion', 'power') NOT NULL,
    value DECIMAL(10,4) NOT NULL,
    unit VARCHAR(20),
    threshold_min DECIMAL(10,4),
    threshold_max DECIMAL(10,4),
    is_alert BOOLEAN DEFAULT FALSE,
    alert_level ENUM('info', 'warning', 'error', 'critical') DEFAULT 'info',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cabinet_id) REFERENCES locker_cabinets(id) ON DELETE CASCADE,
    INDEX idx_monitoring_cabinet (cabinet_id),
    INDEX idx_monitoring_type (metric_type),
    INDEX idx_monitoring_recorded (recorded_at),
    INDEX idx_monitoring_alerts (is_alert, alert_level)
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    company_id INT,
    cabinet_id INT,
    compartment_id INT,
    delivery_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_data JSON,
    response_data JSON,
    execution_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE SET NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (cabinet_id) REFERENCES locker_cabinets(id) ON DELETE SET NULL,
    FOREIGN KEY (compartment_id) REFERENCES compartments(id) ON DELETE SET NULL,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE SET NULL,
    INDEX idx_activity_user (user_id),
    INDEX idx_activity_company (company_id),
    INDEX idx_activity_action (action),
    INDEX idx_activity_created (created_at),
    INDEX idx_activity_entity (entity_type, entity_id)
);

-- =====================================================
-- 8. SYSTÈME DE NOTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS system_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    company_id INT,
    type ENUM('delivery', 'pickup', 'expiry', 'maintenance', 'alert', 'system', 'billing') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON,
    channels JSON COMMENT 'email, sms, push, in_app',
    status ENUM('pending', 'sent', 'delivered', 'failed', 'cancelled') DEFAULT 'pending',
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    scheduled_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    read_at TIMESTAMP NULL,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_company (company_id),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_status (status),
    INDEX idx_notifications_scheduled (scheduled_at)
);

-- =====================================================
-- 9. CONFIGURATION SYSTÈME
-- =====================================================

CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json', 'encrypted') DEFAULT 'string',
    category VARCHAR(50),
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    is_required BOOLEAN DEFAULT FALSE,
    validation_rules JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_company_setting (company_id, setting_key),
    INDEX idx_settings_company (company_id),
    INDEX idx_settings_key (setting_key),
    INDEX idx_settings_category (category)
);

-- =====================================================
-- 10. AUDIT ET SÉCURITÉ
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    company_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(255),
    risk_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE SET NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_company (company_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_created (created_at),
    INDEX idx_audit_risk (risk_level)
);

-- =====================================================
-- 11. DONNÉES DE DÉMONSTRATION
-- =====================================================

-- Insertion des plans tarifaires
INSERT IGNORE INTO subscription_plans (name, description, price_monthly, price_yearly, max_users, max_lockers, max_deliveries_per_month, max_api_calls_per_month, features, is_popular) VALUES
('Starter', 'Parfait pour les petites entreprises qui débutent', 29.00, 290.00, 10, 5, 1000, 10000, '["Jusqu\'à 10 utilisateurs", "Jusqu\'à 5 armoires", "1 000 livraisons/mois", "Support email", "API de base", "Rapports mensuels"]', FALSE),
('Professional', 'Idéal pour les entreprises en croissance', 79.00, 790.00, 50, 20, 5000, 50000, '["Jusqu\'à 50 utilisateurs", "Jusqu\'à 20 armoires", "5 000 livraisons/mois", "Support prioritaire", "API avancée", "Rapports en temps réel", "Intégrations tierces", "Notifications SMS"]', TRUE),
('Enterprise', 'Solution complète pour les grandes entreprises', 199.00, 1990.00, -1, -1, -1, -1, '["Utilisateurs illimités", "Armoires illimitées", "Livraisons illimitées", "Support 24/7", "API complète", "Rapports personnalisés", "Intégrations sur mesure", "Manager dédié", "SLA garanti", "Sécurité renforcée"]', FALSE);

-- Insertion des sociétés de démonstration
INSERT IGNORE INTO companies (name, email, phone, address, status, subscription_plan_id) VALUES
('Smart Lockers Corp', 'contact@smartlockers.com', '+33123456789', '123 Tech Street, Paris', 'active', 3),
('Delivery Express', 'info@deliveryexpress.com', '+33987654321', '456 Logistics Ave, Lyon', 'active', 2),
('Quick Transport', 'contact@quicktransport.com', '+33555666777', '789 Speed Road, Marseille', 'active', 1);

-- Insertion des utilisateurs de démonstration (mot de passe: password123)
INSERT IGNORE INTO app_users (company_id, email, password_hash, first_name, last_name, phone, role, status) VALUES
(1, 'superadmin@smartlockers.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfS', 'Super', 'Admin', '+33100000001', 'superadmin', 'active'),
(2, 'admin@company.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfS', 'Admin', 'Company', '+33100000002', 'admin', 'active'),
(2, 'delivery@company.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfS', 'Jean', 'Livreur', '+33100000003', 'delivery', 'active'),
(2, 'client@company.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfS', 'Marie', 'Client', '+33100000004', 'client', 'active'),
(1, 'helpdesk@smartlockers.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uDfS', 'Support', 'Technique', '+33100000005', 'helpdesk', 'active');

-- Insertion des armoires de démonstration
INSERT IGNORE INTO locker_cabinets (company_id, name, location_address, latitude, longitude, esp32_id, mqtt_topic, total_compartments, status) VALUES
(2, 'Armoire Central', '123 Rue de la Paix, 75001 Paris', 48.8566, 2.3522, 'ESP32_CENTRAL_001', 'lockers/ESP32_CENTRAL_001', 16, 'online'),
(2, 'Armoire Nord', '456 Avenue du Nord, 75018 Paris', 48.8932, 2.3417, 'ESP32_NORD_002', 'lockers/ESP32_NORD_002', 12, 'online'),
(2, 'Armoire Sud', '789 Boulevard du Sud, 75013 Paris', 48.8323, 2.3559, 'ESP32_SUD_003', 'lockers/ESP32_SUD_003', 20, 'maintenance');

-- Insertion des casiers pour l'armoire Central (16 casiers)
INSERT IGNORE INTO compartments (cabinet_id, compartment_number, size, width_cm, height_cm, depth_cm, max_weight_kg, gpio_pin, status) VALUES
(1, 1, 'small', 20, 15, 30, 5, 1, 'available'),
(1, 2, 'small', 20, 15, 30, 5, 2, 'available'),
(1, 3, 'small', 20, 15, 30, 5, 3, 'available'),
(1, 4, 'small', 20, 15, 30, 5, 4, 'available'),
(1, 5, 'medium', 30, 25, 40, 15, 5, 'occupied'),
(1, 6, 'medium', 30, 25, 40, 15, 6, 'available'),
(1, 7, 'medium', 30, 25, 40, 15, 7, 'available'),
(1, 8, 'medium', 30, 25, 40, 15, 8, 'occupied'),
(1, 9, 'medium', 30, 25, 40, 15, 9, 'available'),
(1, 10, 'medium', 30, 25, 40, 15, 10, 'available'),
(1, 11, 'medium', 30, 25, 40, 15, 11, 'available'),
(1, 12, 'medium', 30, 25, 40, 15, 12, 'available'),
(1, 13, 'large', 40, 35, 50, 30, 13, 'available'),
(1, 14, 'large', 40, 35, 50, 30, 14, 'available'),
(1, 15, 'large', 40, 35, 50, 30, 15, 'maintenance'),
(1, 16, 'large', 40, 35, 50, 30, 16, 'available');

-- Insertion des livraisons de démonstration
INSERT IGNORE INTO deliveries (tracking_number, company_id, delivery_person_id, compartment_id, recipient_name, recipient_email, recipient_phone, pickup_code, status, delivered_at, expiry_date, notes) VALUES
('TRK1704123456ABCD', 2, 3, 5, 'Pierre Dupont', 'pierre.dupont@email.com', '+33123456789', 'ABC123XY', 'delivered', '2024-01-15 10:30:00', '2024-01-18 10:30:00', 'Fragile - Manipuler avec précaution'),
('TRK1704123457EFGH', 2, 3, 8, 'Sophie Martin', 'sophie.martin@email.com', '+33987654321', 'DEF456ZW', 'delivered', '2024-01-15 09:15:00', '2024-01-18 09:15:00', 'Livraison urgente');

-- Insertion des paramètres système par défaut
INSERT IGNORE INTO system_settings (company_id, setting_key, setting_value, setting_type, category, description) VALUES
(NULL, 'default_expiry_hours', '72', 'number', 'delivery', 'Durée par défaut avant expiration des colis (en heures)'),
(NULL, 'max_pickup_attempts', '3', 'number', 'delivery', 'Nombre maximum de tentatives de récupération'),
(NULL, 'notification_email_enabled', 'true', 'boolean', 'notification', 'Activer les notifications par email'),
(NULL, 'notification_sms_enabled', 'false', 'boolean', 'notification', 'Activer les notifications par SMS'),
(NULL, 'monitoring_interval_minutes', '5', 'number', 'monitoring', 'Intervalle de monitoring des armoires (en minutes)'),
(NULL, 'maintenance_mode', 'false', 'boolean', 'system', 'Mode maintenance global du système');

-- =====================================================
-- 12. VUES UTILES POUR LES RAPPORTS
-- =====================================================

-- Vue pour les statistiques des livraisons par société
CREATE OR REPLACE VIEW delivery_stats_by_company AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    COUNT(d.id) as total_deliveries,
    COUNT(CASE WHEN d.status = 'delivered' THEN 1 END) as delivered_count,
    COUNT(CASE WHEN d.status = 'picked_up' THEN 1 END) as picked_up_count,
    COUNT(CASE WHEN d.status = 'expired' THEN 1 END) as expired_count,
    AVG(TIMESTAMPDIFF(HOUR, d.delivered_at, d.pickup_date)) as avg_pickup_time_hours
FROM companies c
LEFT JOIN deliveries d ON c.id = d.company_id
GROUP BY c.id, c.name;

-- Vue pour l'occupation des casiers
CREATE OR REPLACE VIEW compartment_utilization AS
SELECT 
    lc.id as cabinet_id,
    lc.name as cabinet_name,
    lc.company_id,
    COUNT(comp.id) as total_compartments,
    COUNT(CASE WHEN comp.status = 'available' THEN 1 END) as available_compartments,
    COUNT(CASE WHEN comp.status = 'occupied' THEN 1 END) as occupied_compartments,
    COUNT(CASE WHEN comp.status = 'maintenance' THEN 1 END) as maintenance_compartments,
    ROUND((COUNT(CASE WHEN comp.status = 'occupied' THEN 1 END) / COUNT(comp.id)) * 100, 2) as utilization_percentage
FROM locker_cabinets lc
LEFT JOIN compartments comp ON lc.id = comp.cabinet_id
GROUP BY lc.id, lc.name, lc.company_id;

-- =====================================================
-- 13. PROCÉDURES STOCKÉES UTILES
-- =====================================================

DELIMITER //

-- Procédure pour nettoyer les livraisons expirées
CREATE PROCEDURE CleanExpiredDeliveries()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE delivery_id INT;
    DECLARE compartment_id INT;
    
    DECLARE expired_cursor CURSOR FOR 
        SELECT d.id, d.compartment_id 
        FROM deliveries d 
        WHERE d.status = 'delivered' 
        AND d.expiry_date < NOW();
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN expired_cursor;
    
    read_loop: LOOP
        FETCH expired_cursor INTO delivery_id, compartment_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Marquer la livraison comme expirée
        UPDATE deliveries SET status = 'expired' WHERE id = delivery_id;
        
        -- Libérer le casier
        UPDATE compartments SET status = 'available' WHERE id = compartment_id;
        
        -- Ajouter un log de suivi
        INSERT INTO delivery_tracking (delivery_id, status, description, created_at)
        VALUES (delivery_id, 'expired', 'Livraison expirée automatiquement', NOW());
        
    END LOOP;
    
    CLOSE expired_cursor;
END //

-- Fonction pour générer un code de retrait unique
CREATE FUNCTION GeneratePickupCode() RETURNS VARCHAR(20)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE code VARCHAR(20);
    DECLARE code_exists INT DEFAULT 1;
    
    WHILE code_exists > 0 DO
        SET code = CONCAT(
            CHAR(65 + FLOOR(RAND() * 26)),
            CHAR(65 + FLOOR(RAND() * 26)),
            CHAR(65 + FLOOR(RAND() * 26)),
            LPAD(FLOOR(RAND() * 1000), 3, '0'),
            CHAR(65 + FLOOR(RAND() * 26)),
            CHAR(65 + FLOOR(RAND() * 26))
        );
        
        SELECT COUNT(*) INTO code_exists 
        FROM deliveries 
        WHERE pickup_code = code 
        AND status IN ('pending', 'delivered');
    END WHILE;
    
    RETURN code;
END //

DELIMITER ;

-- =====================================================
-- 14. INDEX SUPPLÉMENTAIRES POUR LES PERFORMANCES
-- =====================================================

-- Index composites pour les requêtes fréquentes
CREATE INDEX idx_deliveries_company_status ON deliveries(company_id, status);
CREATE INDEX idx_deliveries_status_expiry ON deliveries(status, expiry_date);
CREATE INDEX idx_compartments_cabinet_status ON compartments(cabinet_id, status);
CREATE INDEX idx_tickets_company_status ON support_tickets(company_id, status);
CREATE INDEX idx_notifications_user_status ON system_notifications(user_id, status);

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================

-- Affichage du résumé
SELECT 'Smart Lockers Database Schema Created Successfully!' as Status;
SELECT COUNT(*) as 'Total Tables Created' FROM information_schema.tables WHERE table_schema = DATABASE();