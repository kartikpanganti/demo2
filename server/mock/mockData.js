// Mock data for testing the application without a database connection

// Mock Users
const users = [
  {
    _id: '60d0fe4f5311236168a109ca',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    password: '$2a$10$XG4hkC5TqQYLuCn/Rb/JT.a9yh7o5gPhjW6zILGvvsUQY6s8.USei' // admin123
  },
  {
    _id: '60d0fe4f5311236168a109cb',
    name: 'Pharmacist User',
    email: 'pharmacist@example.com',
    role: 'pharmacist',
    password: '$2a$10$XG4hkC5TqQYLuCn/Rb/JT.a9yh7o5gPhjW6zILGvvsUQY6s8.USei' // admin123
  },
  {
    _id: '60d0fe4f5311236168a109cc',
    name: 'Staff User',
    email: 'staff@example.com',
    role: 'staff',
    password: '$2a$10$XG4hkC5TqQYLuCn/Rb/JT.a9yh7o5gPhjW6zILGvvsUQY6s8.USei' // admin123
  }
];

// Mock Medicines
const medicines = [
  {
    _id: '60d0fe4f5311236168a109d0',
    name: 'Paracetamol',
    manufacturer: 'ABC Pharma',
    category: 'tablet',
    description: 'For pain relief and fever reduction',
    price: 5.99,
    quantity: 150,
    expiryDate: new Date('2024-12-31'),
    batchNumber: 'PCM123456',
    reorderLevel: 30,
    barcode: '1234567890123',
    location: 'Shelf A1',
    addedBy: '60d0fe4f5311236168a109ca',
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-06-01')
  },
  {
    _id: '60d0fe4f5311236168a109d1',
    name: 'Amoxicillin',
    manufacturer: 'XYZ Pharmaceuticals',
    category: 'capsule',
    description: 'Antibiotic used to treat bacterial infections',
    price: 12.50,
    quantity: 80,
    expiryDate: new Date('2024-10-15'),
    batchNumber: 'AMX789012',
    reorderLevel: 20,
    barcode: '2345678901234',
    location: 'Shelf B3',
    addedBy: '60d0fe4f5311236168a109ca',
    createdAt: new Date('2023-06-05'),
    updatedAt: new Date('2023-06-05')
  },
  {
    _id: '60d0fe4f5311236168a109d2',
    name: 'Ibuprofen',
    manufacturer: 'MedPharma Ltd',
    category: 'tablet',
    description: 'Non-steroidal anti-inflammatory drug',
    price: 7.25,
    quantity: 15,
    expiryDate: new Date('2024-09-20'),
    batchNumber: 'IBP345678',
    reorderLevel: 25,
    barcode: '3456789012345',
    location: 'Shelf A2',
    addedBy: '60d0fe4f5311236168a109cb',
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2023-06-10')
  },
  {
    _id: '60d0fe4f5311236168a109d3',
    name: 'Cetirizine',
    manufacturer: 'HealthPharm',
    category: 'tablet',
    description: 'Antihistamine for allergy relief',
    price: 8.75,
    quantity: 200,
    expiryDate: new Date('2024-11-30'),
    batchNumber: 'CTR456789',
    reorderLevel: 40,
    barcode: '4567890123456',
    location: 'Shelf C1',
    addedBy: '60d0fe4f5311236168a109cb',
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date('2023-06-15')
  },
  {
    _id: '60d0fe4f5311236168a109d4',
    name: 'Cough Syrup',
    manufacturer: 'WellMed Inc',
    category: 'syrup',
    description: 'For relief from cough and throat irritation',
    price: 15.99,
    quantity: 5,
    expiryDate: new Date('2023-12-31'),
    batchNumber: 'CSP567890',
    reorderLevel: 10,
    barcode: '5678901234567',
    location: 'Shelf D2',
    addedBy: '60d0fe4f5311236168a109ca',
    createdAt: new Date('2023-06-20'),
    updatedAt: new Date('2023-06-20')
  },
  {
    _id: '60d0fe4f5311236168a109d5',
    name: 'Vitamin D3',
    manufacturer: 'NutriHealth',
    category: 'tablet',
    description: 'Supports bone health and immune function',
    price: 11.25,
    quantity: 300,
    expiryDate: new Date('2025-01-15'),
    batchNumber: 'VTD678901',
    reorderLevel: 50,
    barcode: '6789012345678',
    location: 'Shelf E1',
    addedBy: '60d0fe4f5311236168a109cb',
    createdAt: new Date('2023-06-25'),
    updatedAt: new Date('2023-06-25')
  },
  {
    _id: '60d0fe4f5311236168a109d6',
    name: 'Insulin',
    manufacturer: 'DiabeteCare',
    category: 'injection',
    description: 'For diabetes management',
    price: 45.00,
    quantity: 0,
    expiryDate: new Date('2023-11-15'),
    batchNumber: 'INS789012',
    reorderLevel: 15,
    barcode: '7890123456789',
    location: 'Refrigerator',
    addedBy: '60d0fe4f5311236168a109ca',
    createdAt: new Date('2023-07-01'),
    updatedAt: new Date('2023-07-01')
  }
];

// Mock Transactions
const transactions = [
  {
    _id: '60d0fe4f5311236168a109e0',
    medicine: '60d0fe4f5311236168a109d0',
    type: 'stock-in',
    quantity: 100,
    previousQuantity: 50,
    updatedQuantity: 150,
    reason: 'Regular restock',
    performedBy: '60d0fe4f5311236168a109ca',
    createdAt: new Date('2023-07-15')
  },
  {
    _id: '60d0fe4f5311236168a109e1',
    medicine: '60d0fe4f5311236168a109d1',
    type: 'stock-in',
    quantity: 50,
    previousQuantity: 30,
    updatedQuantity: 80,
    reason: 'New supply received',
    performedBy: '60d0fe4f5311236168a109cb',
    createdAt: new Date('2023-07-20')
  },
  {
    _id: '60d0fe4f5311236168a109e2',
    medicine: '60d0fe4f5311236168a109d2',
    type: 'stock-out',
    quantity: 10,
    previousQuantity: 25,
    updatedQuantity: 15,
    reason: 'Dispensed to patient',
    performedBy: '60d0fe4f5311236168a109cc',
    createdAt: new Date('2023-07-22')
  },
  {
    _id: '60d0fe4f5311236168a109e3',
    medicine: '60d0fe4f5311236168a109d4',
    type: 'stock-out',
    quantity: 5,
    previousQuantity: 10,
    updatedQuantity: 5,
    reason: 'Dispensed to patient',
    performedBy: '60d0fe4f5311236168a109cb',
    createdAt: new Date('2023-07-25')
  },
  {
    _id: '60d0fe4f5311236168a109e4',
    medicine: '60d0fe4f5311236168a109d5',
    type: 'stock-in',
    quantity: 200,
    previousQuantity: 100,
    updatedQuantity: 300,
    reason: 'Bulk order received',
    performedBy: '60d0fe4f5311236168a109ca',
    createdAt: new Date('2023-07-28')
  },
  {
    _id: '60d0fe4f5311236168a109e5',
    medicine: '60d0fe4f5311236168a109d6',
    type: 'expired',
    quantity: 8,
    previousQuantity: 8,
    updatedQuantity: 0,
    reason: 'Expired items removed',
    performedBy: '60d0fe4f5311236168a109ca',
    createdAt: new Date('2023-08-01')
  }
];

// Helper function to get a medicine with populated fields
const getMedicineWithPopulatedFields = (id) => {
  const medicine = medicines.find(m => m._id === id);
  if (!medicine) return null;
  
  const user = users.find(u => u._id === medicine.addedBy);
  return {
    ...medicine,
    addedBy: { _id: user._id, name: user.name }
  };
};

// Helper function to get a transaction with populated fields
const getTransactionWithPopulatedFields = (id) => {
  const transaction = transactions.find(t => t._id === id);
  if (!transaction) return null;
  
  const medicine = medicines.find(m => m._id === transaction.medicine);
  const user = users.find(u => u._id === transaction.performedBy);
  
  return {
    ...transaction,
    medicine: { _id: medicine._id, name: medicine.name, barcode: medicine.barcode },
    performedBy: { _id: user._id, name: user.name }
  };
};

module.exports = {
  users,
  medicines,
  transactions,
  getMedicineWithPopulatedFields,
  getTransactionWithPopulatedFields
}; 