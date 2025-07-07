// Service de mock pour les données
export interface LockerCabinet {
  id: number;
  name: string;
  location_address: string;
  company_name: string;
  status: 'online' | 'offline' | 'maintenance';
  total_compartments: number;
  available_compartments: number;
  occupied_compartments: number;
}

export interface Delivery {
  id: number;
  tracking_number: string;
  recipient_name: string;
  recipient_email: string;
  status: 'pending' | 'delivered' | 'picked_up' | 'returned' | 'expired';
  delivery_person_name: string;
  cabinet_name: string;
  compartment_number: number;
  created_at: string;
  pickup_code?: string;
}

export interface DashboardStats {
  totalDeliveries: number;
  activeLockers: number;
  availableCompartments: number;
  pendingPickups: number;
}

// Données de démonstration
const mockLockers: LockerCabinet[] = [
  {
    id: 1,
    name: 'Armoire Central',
    location_address: '123 Rue de la Paix, 75001 Paris',
    company_name: 'Delivery Express',
    status: 'online',
    total_compartments: 12,
    available_compartments: 4,
    occupied_compartments: 8
  },
  {
    id: 2,
    name: 'Armoire Nord',
    location_address: '456 Avenue du Nord, 75018 Paris',
    company_name: 'Delivery Express',
    status: 'online',
    total_compartments: 8,
    available_compartments: 5,
    occupied_compartments: 3
  },
  {
    id: 3,
    name: 'Armoire Sud',
    location_address: '789 Boulevard du Sud, 75013 Paris',
    company_name: 'Delivery Express',
    status: 'maintenance',
    total_compartments: 10,
    available_compartments: 0,
    occupied_compartments: 0
  }
];

const mockDeliveries: Delivery[] = [
  {
    id: 1,
    tracking_number: 'TRK1704123456ABCD',
    recipient_name: 'Pierre Dupont',
    recipient_email: 'pierre.dupont@email.com',
    status: 'delivered',
    delivery_person_name: 'Jean',
    cabinet_name: 'Armoire Central',
    compartment_number: 5,
    created_at: '2024-01-15T10:30:00Z',
    pickup_code: 'ABC123XY'
  },
  {
    id: 2,
    tracking_number: 'TRK1704123457EFGH',
    recipient_name: 'Sophie Martin',
    recipient_email: 'sophie.martin@email.com',
    status: 'picked_up',
    delivery_person_name: 'Jean',
    cabinet_name: 'Armoire Nord',
    compartment_number: 3,
    created_at: '2024-01-15T09:15:00Z'
  },
  {
    id: 3,
    tracking_number: 'TRK1704123458IJKL',
    recipient_name: 'Marc Leblanc',
    recipient_email: 'marc.leblanc@email.com',
    status: 'delivered',
    delivery_person_name: 'Jean',
    cabinet_name: 'Armoire Central',
    compartment_number: 8,
    created_at: '2024-01-15T08:45:00Z',
    pickup_code: 'DEF456ZW'
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockDataService = {
  async getStats(): Promise<DashboardStats> {
    await delay(500);
    
    return {
      totalDeliveries: mockDeliveries.length,
      activeLockers: mockLockers.filter(l => l.status === 'online').length,
      availableCompartments: mockLockers.reduce((sum, l) => sum + l.available_compartments, 0),
      pendingPickups: mockDeliveries.filter(d => d.status === 'delivered').length
    };
  },

  async getLockers(): Promise<LockerCabinet[]> {
    await delay(600);
    return [...mockLockers];
  },

  async getDeliveries(): Promise<Delivery[]> {
    await delay(700);
    return [...mockDeliveries];
  },

  async createDelivery(data: {
    recipientName: string;
    recipientEmail: string;
    recipientPhone?: string;
    compartmentId: number;
    notes?: string;
  }): Promise<{ deliveryId: number; trackingNumber: string; pickupCode: string }> {
    await delay(1000);
    
    const trackingNumber = `TRK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const pickupCode = Math.random().toString(36).substr(2, 8).toUpperCase();
    
    const newDelivery: Delivery = {
      id: mockDeliveries.length + 1,
      tracking_number: trackingNumber,
      recipient_name: data.recipientName,
      recipient_email: data.recipientEmail,
      status: 'delivered',
      delivery_person_name: 'Jean',
      cabinet_name: 'Armoire Central',
      compartment_number: Math.floor(Math.random() * 12) + 1,
      created_at: new Date().toISOString(),
      pickup_code: pickupCode
    };
    
    mockDeliveries.unshift(newDelivery);
    
    return {
      deliveryId: newDelivery.id,
      trackingNumber,
      pickupCode
    };
  },

  async pickupDelivery(trackingNumber: string, pickupCode: string): Promise<{ compartmentNumber: number }> {
    await delay(800);
    
    const delivery = mockDeliveries.find(d => 
      d.tracking_number === trackingNumber && 
      d.pickup_code === pickupCode && 
      d.status === 'delivered'
    );
    
    if (!delivery) {
      throw new Error('Colis non trouvé ou déjà récupéré');
    }
    
    delivery.status = 'picked_up';
    
    return {
      compartmentNumber: delivery.compartment_number
    };
  }
};