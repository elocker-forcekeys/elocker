-- Smart Lockers Database Schema
-- Version: 1.0
-- Description: Système de gestion de casiers intelligents

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS smart_lockers CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_lockers;

-- Table des sociétés/entreprises
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    role ENUM('superadmin', 'admin', 'delivery', 'client', 'helpdesk') NOT NULL DEFAULT 'client',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_users_email (email),
    INDEX idx_users_company (company_id),
    INDEX idx_users_role (role)
);

-- Table des armoires/cabinets
CREATE TABLE IF NOT EXISTS locker_cabinets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    location_address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    esp32_id VARCHAR(100) UNIQUE NOT NULL,
    mqtt_topic VARCHAR(255),
    total_compartments INT NOT NULL DEFAULT 0,
    status ENUM('online', 'offline', 'maintenance') DEFAULT 'offline',
    last_ping TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_cabinets_company (company_id),
    INDEX idx_cabinets_esp32 (esp32_id),
    INDEX idx_cabinets_status (status)
);

-- Table des compartiments/casiers
CREATE TABLE IF NOT EXISTS compartments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cabinet_id INT NOT NULL,
    compartment_number INT NOT NULL,
    size ENUM('small', 'medium', 'large') NOT NULL DEFAULT 'medium',
    gpio_pin INT NOT NULL,
    status ENUM('available', 'occupied', 'maintenance', 'reserved') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cabinet_id) REFERENCES locker_cabinets(id) ON DELETE CASCADE,
    UNIQUE KEY unique_compartment (cabinet_id, compartment_number),
    INDEX idx_compartments_cabinet (cabinet_id),
    INDEX idx_compartments_status (status)
);

-- Table des livraisons
CREATE TABLE IF NOT EXISTS deliveries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    company_id INT NOT NULL,
    delivery_person_id INT NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_phone VARCHAR(50),
    compartment_id INT,
    pickup_code VARCHAR(20),
    qr_code TEXT,
    status ENUM('pending', 'delivered', 'picked_up', 'returned', 'expired') DEFAULT 'pending',
    notes TEXT,
    delivery_date TIMESTAMP NULL,
    pickup_date TIMESTAMP NULL,
    expiry_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (delivery_person_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (compartment_id) REFERENCES compartments(id) ON DELETE SET NULL,
    INDEX idx_deliveries_tracking (tracking_number),
    INDEX idx_deliveries_company (company_id),
    INDEX idx_deliveries_person (delivery_person_id),
    INDEX idx_deliveries_status (status),
    INDEX idx_deliveries_pickup_code (pickup_code)
);

-- Table des logs d'activité
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    compartment_id INT,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (compartment_id) REFERENCES compartments(id) ON DELETE SET NULL,
    INDEX idx_logs_user (user_id),
    INDEX idx_logs_compartment (compartment_id),
    INDEX idx_logs_action (action),
    INDEX idx_logs_created (created_at)
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    delivery_id INT,
    type ENUM('email', 'sms', 'push') NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_delivery (delivery_id),
    INDEX idx_notifications_status (status)
);

-- Table des paramètres système
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_settings_key (setting_key)
);

-- Insertion des données de démonstration

-- Sociétés
INSERT INTO companies (name, email, phone, address, status) VALUES
('Smart Lockers Corp', 'contact@smartlockers.com', '+33123456789', '123 Tech Street, Paris', 'active'),
('Delivery Express', 'info@deliveryexpress.com', '+33987654321', '456 Logistics Ave, Lyon', 'active'),
('Quick Transport', 'contact@quicktransport.com', '+33555666777', '789 Speed Road, Marseille', 'active');

-- Utilisateurs (mot de passe: password123 - hash bcrypt)
INSERT INTO users (company_id, email, password, first_name, last_name, phone, role, status) VALUES
(1, 'superadmin@smartlockers.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.', 'Super', 'Admin', '+33100000001', 'superadmin', 'active'),
(2, 'admin@company.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.', 'Admin', 'Company', '+33100000002', 'admin', 'active'),
(2, 'delivery@company.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.', 'Jean', 'Livreur', '+33100000003', 'delivery', 'active'),
(2, 'client@company.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.', 'Marie', 'Client', '+33100000004', 'client', 'active'),
(1, 'helpdesk@smartlockers.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.', 'Support', 'Technique', '+33100000005', 'helpdesk', 'active');

-- Armoires
INSERT INTO locker_cabinets (company_id, name, location_address, latitude, longitude, esp32_id, mqtt_topic, total_compartments, status) VALUES
(2, 'Armoire Central', '123 Rue de la Paix, 75001 Paris', 48.8566, 2.3522, 'ESP32_CENTRAL_001', 'lockers/ESP32_CENTRAL_001', 16, 'online'),
(2, 'Armoire Nord', '456 Avenue du Nord, 75018 Paris', 48.8932, 2.3417, 'ESP32_NORD_002', 'lockers/ESP32_NORD_002', 12, 'online'),
(2, 'Armoire Sud', '789 Boulevard du Sud, 75013 Paris', 48.8323, 2.3559, 'ESP32_SUD_003', 'lockers/ESP32_SUD_003', 20, 'maintenance');

-- Compartiments pour Armoire Central (16 casiers)
INSERT INTO compartments (cabinet_id, compartment_number, size, gpio_pin, status) VALUES
(1, 1, 'small', 1, 'available'),
(1, 2, 'small', 2, 'available'),
(1, 3, 'small', 3, 'available'),
(1, 4, 'small', 4, 'available'),
(1, 5, 'medium', 5, 'occupied'),
(1, 6, 'medium', 6, 'available'),
(1, 7, 'medium', 7, 'available'),
(1, 8, 'medium', 8, 'occupied'),
(1, 9, 'medium', 9, 'available'),
(1, 10, 'medium', 10, 'available'),
(1, 11, 'medium', 11, 'available'),
(1, 12, 'medium', 12, 'available'),
(1, 13, 'large', 13, 'available'),
(1, 14, 'large', 14, 'available'),
(1, 15, 'large', 15, 'occupied'),
(1, 16, 'large', 16, 'maintenance');

-- Compartiments pour Armoire Nord (12 casiers)
INSERT INTO compartments (cabinet_id, compartment_number, size, gpio_pin, status) VALUES
(2, 1, 'small', 1, 'available'),
(2, 2, 'small', 2, 'available'),
(2, 3, 'small', 3, 'occupied'),
(2, 4, 'small', 4, 'available'),
(2, 5, 'medium', 5, 'available'),
(2, 6, 'medium', 6, 'available'),
(2, 7, 'medium', 7, 'available'),
(2, 8, 'medium', 8, 'available'),
(2, 9, 'large', 9, 'available'),
(2, 10, 'large', 10, 'available'),
(2, 11, 'large', 11, 'available'),
(2, 12, 'large', 12, 'available');

-- Compartiments pour Armoire Sud (20 casiers) - tous en maintenance
INSERT INTO compartments (cabinet_id, compartment_number, size, gpio_pin, status) VALUES
(3, 1, 'small', 1, 'maintenance'),
(3, 2, 'small', 2, 'maintenance'),
(3, 3, 'small', 3, 'maintenance'),
(3, 4, 'small', 4, 'maintenance'),
(3, 5, 'small', 5, 'maintenance'),
(3, 6, 'small', 6, 'maintenance'),
(3, 7, 'medium', 7, 'maintenance'),
(3, 8, 'medium', 8, 'maintenance'),
(3, 9, 'medium', 9, 'maintenance'),
(3, 10, 'medium', 10, 'maintenance'),
(3, 11, 'medium', 11, 'maintenance'),
(3, 12, 'medium', 12, 'maintenance'),
(3, 13, 'medium', 13, 'maintenance'),
(3, 14, 'medium', 14, 'maintenance'),
(3, 15, 'large', 15, 'maintenance'),
(3, 16, 'large', 16, 'maintenance'),
(3, 17, 'large', 17, 'maintenance'),
(3, 18, 'large', 18, 'maintenance'),
(3, 19, 'large', 19, 'maintenance'),
(3, 20, 'large', 20, 'maintenance');

-- Livraisons de démonstration
INSERT INTO deliveries (tracking_number, company_id, delivery_person_id, recipient_name, recipient_email, recipient_phone, compartment_id, pickup_code, status, notes, delivery_date, expiry_date) VALUES
('TRK1704123456ABCD', 2, 3, 'Pierre Dupont', 'pierre.dupont@email.com', '+33123456789', 5, 'ABC123XY', 'delivered', 'Fragile - Manipuler avec précaution', '2024-01-15 10:30:00', '2024-01-18 10:30:00'),
('TRK1704123457EFGH', 2, 3, 'Sophie Martin', 'sophie.martin@email.com', '+33987654321', 15, 'DEF456ZW', 'delivered', 'Livraison urgente', '2024-01-15 09:15:00', '2024-01-18 09:15:00'),
('TRK1704123458IJKL', 2, 3, 'Marc Leblanc', 'marc.leblanc@email.com', NULL, 8, 'GHI789AB', 'delivered', NULL, '2024-01-15 08:45:00', '2024-01-18 08:45:00'),
('TRK1704123459MNOP', 2, 3, 'Julie Rousseau', 'julie.rousseau@email.com', '+33555123456', 3, 'JKL012CD', 'picked_up', 'Colis récupéré avec succès', '2024-01-14 16:20:00', '2024-01-17 16:20:00');

-- Paramètres système
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('delivery_expiry_hours', '72', 'Durée en heures avant expiration d\'une livraison'),
('max_pickup_attempts', '3', 'Nombre maximum de tentatives de récupération'),
('notification_email_enabled', 'true', 'Activation des notifications par email'),
('notification_sms_enabled', 'false', 'Activation des notifications par SMS'),
('maintenance_mode', 'false', 'Mode maintenance du système'),
('default_compartment_size', 'medium', 'Taille par défaut des compartiments');

-- Logs d'activité de démonstration
INSERT INTO activity_logs (user_id, compartment_id, action, description, ip_address) VALUES
(3, 5, 'compartment_open', 'Ouverture du casier 5 pour livraison TRK1704123456ABCD', '192.168.1.100'),
(3, 15, 'compartment_open', 'Ouverture du casier 15 pour livraison TRK1704123457EFGH', '192.168.1.100'),
(4, 3, 'compartment_open', 'Récupération du colis TRK1704123459MNOP', '192.168.1.150'),
(2, NULL, 'user_login', 'Connexion administrateur', '192.168.1.200');

-- Création des vues utiles

-- Vue des statistiques par armoire
CREATE OR REPLACE VIEW cabinet_stats AS
SELECT 
    lc.id,
    lc.name,
    lc.company_id,
    lc.status,
    lc.total_compartments,
    COUNT(CASE WHEN c.status = 'available' THEN 1 END) as available_compartments,
    COUNT(CASE WHEN c.status = 'occupied' THEN 1 END) as occupied_compartments,
    COUNT(CASE WHEN c.status = 'maintenance' THEN 1 END) as maintenance_compartments,
    COUNT(CASE WHEN c.status = 'reserved' THEN 1 END) as reserved_compartments
FROM locker_cabinets lc
LEFT JOIN compartments c ON lc.id = c.cabinet_id
GROUP BY lc.id, lc.name, lc.company_id, lc.status, lc.total_compartments;

-- Vue des livraisons actives
CREATE OR REPLACE VIEW active_deliveries AS
SELECT 
    d.*,
    u.first_name as delivery_person_first_name,
    u.last_name as delivery_person_last_name,
    lc.name as cabinet_name,
    c.compartment_number,
    c.size as compartment_size,
    comp.name as company_name
FROM deliveries d
JOIN users u ON d.delivery_person_id = u.id
LEFT JOIN compartments c ON d.compartment_id = c.id
LEFT JOIN locker_cabinets lc ON c.cabinet_id = lc.id
JOIN companies comp ON d.company_id = comp.id
WHERE d.status IN ('pending', 'delivered');

-- Index pour optimiser les performances
CREATE INDEX idx_deliveries_expiry ON deliveries(expiry_date);
CREATE INDEX idx_deliveries_created ON deliveries(created_at);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);

-- Procédures stockées utiles

DELIMITER //

-- Procédure pour nettoyer les livraisons expirées
CREATE PROCEDURE CleanExpiredDeliveries()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE delivery_id INT;
    DECLARE compartment_id INT;
    
    DECLARE expired_cursor CURSOR FOR 
        SELECT id, compartment_id 
        FROM deliveries 
        WHERE status = 'delivered' 
        AND expiry_date < NOW();
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN expired_cursor;
    
    read_loop: LOOP
        FETCH expired_cursor INTO delivery_id, compartment_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Marquer la livraison comme expirée
        UPDATE deliveries SET status = 'expired' WHERE id = delivery_id;
        
        -- Libérer le compartiment
        UPDATE compartments SET status = 'available' WHERE id = compartment_id;
        
        -- Log de l'action
        INSERT INTO activity_logs (compartment_id, action, description) 
        VALUES (compartment_id, 'delivery_expired', CONCAT('Livraison expirée ID: ', delivery_id));
        
    END LOOP;
    
    CLOSE expired_cursor;
END //

-- Fonction pour générer un code de récupération unique
CREATE FUNCTION GeneratePickupCode() RETURNS VARCHAR(20)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE new_code VARCHAR(20);
    DECLARE code_exists INT DEFAULT 1;
    
    WHILE code_exists > 0 DO
        SET new_code = UPPER(CONCAT(
            CHAR(65 + FLOOR(RAND() * 26)),
            CHAR(65 + FLOOR(RAND() * 26)),
            CHAR(65 + FLOOR(RAND() * 26)),
            LPAD(FLOOR(RAND() * 1000), 3, '0'),
            CHAR(65 + FLOOR(RAND() * 26)),
            CHAR(65 + FLOOR(RAND() * 26))
        ));
        
        SELECT COUNT(*) INTO code_exists 
        FROM deliveries 
        WHERE pickup_code = new_code 
        AND status IN ('pending', 'delivered');
    END WHILE;
    
    RETURN new_code;
END //

DELIMITER ;

-- Événement pour nettoyer automatiquement les livraisons expirées (toutes les heures)
CREATE EVENT IF NOT EXISTS cleanup_expired_deliveries
ON SCHEDULE EVERY 1 HOUR
STARTS CURRENT_TIMESTAMP
DO
  CALL CleanExpiredDeliveries();

-- Activer l'événement scheduler
SET GLOBAL event_scheduler = ON;

-- Affichage des informations de fin
SELECT 'Base de données Smart Lockers créée avec succès!' as message;
SELECT 'Utilisateurs de démonstration créés avec le mot de passe: password123' as info;
SELECT COUNT(*) as total_companies FROM companies;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_cabinets FROM locker_cabinets;
SELECT COUNT(*) as total_compartments FROM compartments;
SELECT COUNT(*) as total_deliveries FROM deliveries;