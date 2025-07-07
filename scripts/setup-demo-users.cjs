const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const setupDemoUsers = async () => {
  try {
    console.log('🔧 Configuration des utilisateurs de démonstration...');

    // Configuration de la base de données
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'smart_lockers'
    };

    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connexion à la base de données établie');

    // Mot de passe par défaut pour tous les comptes de test
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    // Créer les sociétés de test
    const companies = [
      { name: 'Smart Lockers Corp', email: 'contact@smartlockers.com', phone: '+33123456789', address: '123 Tech Street, Paris' },
      { name: 'Delivery Express', email: 'info@deliveryexpress.com', phone: '+33987654321', address: '456 Logistics Ave, Lyon' }
    ];

    console.log('📦 Création des sociétés...');
    for (const company of companies) {
      await connection.execute(`
        INSERT INTO companies (name, email, phone, address) 
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name)
      `, [company.name, company.email, company.phone, company.address]);
    }

    // Récupérer les IDs des sociétés
    const [companyRows] = await connection.execute('SELECT id, name FROM companies ORDER BY id');
    const systemCompanyId = companyRows[0].id;
    const deliveryCompanyId = companyRows[1].id;

    // Créer les utilisateurs de test
    const users = [
      {
        company_id: systemCompanyId,
        email: 'superadmin@smartlockers.com',
        first_name: 'Super',
        last_name: 'Admin',
        phone: '+33100000001',
        role: 'superadmin'
      },
      {
        company_id: deliveryCompanyId,
        email: 'admin@company.com',
        first_name: 'Admin',
        last_name: 'Company',
        phone: '+33100000002',
        role: 'admin'
      },
      {
        company_id: deliveryCompanyId,
        email: 'delivery@company.com',
        first_name: 'Jean',
        last_name: 'Livreur',
        phone: '+33100000003',
        role: 'delivery'
      },
      {
        company_id: deliveryCompanyId,
        email: 'client@company.com',
        first_name: 'Marie',
        last_name: 'Client',
        phone: '+33100000004',
        role: 'client'
      },
      {
        company_id: systemCompanyId,
        email: 'helpdesk@smartlockers.com',
        first_name: 'Support',
        last_name: 'Technique',
        phone: '+33100000005',
        role: 'helpdesk'
      }
    ];

    console.log('👥 Création des utilisateurs...');
    for (const user of users) {
      await connection.execute(`
        INSERT INTO users (company_id, email, password, first_name, last_name, phone, role, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
        ON DUPLICATE KEY UPDATE 
          password = VALUES(password),
          first_name = VALUES(first_name),
          last_name = VALUES(last_name),
          phone = VALUES(phone),
          status = 'active'
      `, [user.company_id, user.email, hashedPassword, user.first_name, user.last_name, user.phone, user.role]);
    }

    // Créer quelques armoires de test
    console.log('🏢 Création des armoires de test...');
    const cabinets = [
      {
        company_id: deliveryCompanyId,
        name: 'Armoire Central',
        location_address: '123 Rue de la Paix, 75001 Paris',
        latitude: 48.8566,
        longitude: 2.3522,
        esp32_id: 'ESP32_CENTRAL_001',
        total_compartments: 12
      },
      {
        company_id: deliveryCompanyId,
        name: 'Armoire Nord',
        location_address: '456 Avenue du Nord, 75018 Paris',
        latitude: 48.8932,
        longitude: 2.3417,
        esp32_id: 'ESP32_NORD_002',
        total_compartments: 8
      }
    ];

    for (const cabinet of cabinets) {
      const mqttTopic = `lockers/${cabinet.esp32_id}`;
      
      const [result] = await connection.execute(`
        INSERT INTO locker_cabinets (company_id, name, location_address, latitude, longitude, esp32_id, mqtt_topic, total_compartments, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'online')
        ON DUPLICATE KEY UPDATE 
          name = VALUES(name),
          location_address = VALUES(location_address),
          status = 'online'
      `, [cabinet.company_id, cabinet.name, cabinet.location_address, cabinet.latitude, cabinet.longitude, cabinet.esp32_id, mqttTopic, cabinet.total_compartments]);

      const cabinetId = result.insertId || (await connection.execute('SELECT id FROM locker_cabinets WHERE esp32_id = ?', [cabinet.esp32_id]))[0][0].id;

      // Créer les compartiments pour cette armoire
      console.log(`📦 Création des compartiments pour ${cabinet.name}...`);
      for (let i = 1; i <= cabinet.total_compartments; i++) {
        await connection.execute(`
          INSERT INTO compartments (cabinet_id, compartment_number, size, gpio_pin, status) 
          VALUES (?, ?, ?, ?, 'available')
          ON DUPLICATE KEY UPDATE status = 'available'
        `, [cabinetId, i, i <= 4 ? 'small' : i <= 8 ? 'medium' : 'large', i]);
      }
    }

    await connection.end();

    console.log('\n✅ Configuration terminée avec succès !');
    console.log('\n📋 Comptes de démonstration créés :');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│                    COMPTES DE TEST                      │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ Email                        │ Rôle       │ Mot de passe │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ superadmin@smartlockers.com  │ Superadmin │ password123  │');
    console.log('│ admin@company.com            │ Admin      │ password123  │');
    console.log('│ delivery@company.com         │ Livreur    │ password123  │');
    console.log('│ client@company.com           │ Client     │ password123  │');
    console.log('│ helpdesk@smartlockers.com    │ Helpdesk   │ password123  │');
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log('\n🚀 Vous pouvez maintenant vous connecter avec ces comptes !');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration :', error);
    process.exit(1);
  }
};

setupDemoUsers();