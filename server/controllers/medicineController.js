// Commented out actual MongoDB models
// const Medicine = require('../models/Medicine');
// const Transaction = require('../models/Transaction');

// Using mock data instead
const { 
  medicines, 
  transactions, 
  getMedicineWithPopulatedFields 
} = require('../mock/mockData');

// Get all medicines with optional filters
exports.getMedicines = async (req, res) => {
  try {
    const { category, search, lowStock, expired } = req.query;
    let filteredMedicines = [...medicines];

    // Apply filters if provided
    if (category) {
      filteredMedicines = filteredMedicines.filter(med => med.category === category);
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filteredMedicines = filteredMedicines.filter(med => 
        searchRegex.test(med.name) || 
        searchRegex.test(med.manufacturer) || 
        searchRegex.test(med.batchNumber) || 
        searchRegex.test(med.barcode)
      );
    }

    // Filter for low stock if requested
    if (lowStock === 'true') {
      filteredMedicines = filteredMedicines.filter(med => med.quantity <= med.reorderLevel);
    }

    // Filter for expired if requested
    if (expired === 'true') {
      const now = new Date();
      filteredMedicines = filteredMedicines.filter(med => new Date(med.expiryDate) <= now);
    }

    // Populate addedBy
    const populatedMedicines = filteredMedicines.map(med => getMedicineWithPopulatedFields(med._id));

    res.json(populatedMedicines);
  } catch (error) {
    console.error('Get medicines error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single medicine by ID
exports.getMedicineById = async (req, res) => {
  try {
    const medicine = getMedicineWithPopulatedFields(req.params.id);
    
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    res.json(medicine);
  } catch (error) {
    console.error('Get medicine error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new medicine
exports.createMedicine = async (req, res) => {
  try {
    const {
      name,
      manufacturer,
      batchNumber,
      expiryDate,
      quantity,
      price,
      reorderLevel,
      barcode,
      category,
      description,
      location
    } = req.body;

    // Check if medicine with same barcode already exists
    const existingMedicine = medicines.find(med => med.barcode === barcode);
    if (existingMedicine) {
      return res.status(400).json({ message: 'Medicine with this barcode already exists' });
    }

    // Create new medicine
    const newMedicine = {
      _id: `med_${Date.now()}`, // Generate a unique ID
      name,
      manufacturer,
      batchNumber,
      expiryDate,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      reorderLevel: parseInt(reorderLevel) || 10,
      barcode,
      category,
      description,
      location,
      addedBy: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to mock database
    medicines.push(newMedicine);

    // Create a transaction record
    const transaction = {
      _id: `trans_${Date.now()}`, // Generate a unique ID
      medicine: newMedicine._id,
      type: 'stock-in',
      quantity: parseInt(quantity),
      previousQuantity: 0,
      updatedQuantity: parseInt(quantity),
      reason: 'Initial stock',
      performedBy: req.user.id,
      createdAt: new Date()
    };

    transactions.push(transaction);

    res.status(201).json(newMedicine);
  } catch (error) {
    console.error('Create medicine error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a medicine
exports.updateMedicine = async (req, res) => {
  try {
    const {
      name,
      manufacturer,
      batchNumber,
      expiryDate,
      quantity,
      price,
      reorderLevel,
      category,
      description,
      location
    } = req.body;

    // Find the medicine
    const medicineIndex = medicines.findIndex(med => med._id === req.params.id);
    if (medicineIndex === -1) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    const medicine = medicines[medicineIndex];
    // Store previous quantity for transaction record
    const previousQuantity = medicine.quantity;

    // Update fields
    if (name) medicine.name = name;
    if (manufacturer) medicine.manufacturer = manufacturer;
    if (batchNumber) medicine.batchNumber = batchNumber;
    if (expiryDate) medicine.expiryDate = expiryDate;
    if (price) medicine.price = parseFloat(price);
    if (reorderLevel) medicine.reorderLevel = parseInt(reorderLevel);
    if (category) medicine.category = category;
    if (description !== undefined) medicine.description = description;
    if (location !== undefined) medicine.location = location;

    // If quantity changed, create transaction record
    if (quantity !== undefined && parseInt(quantity) !== medicine.quantity) {
      const newQuantity = parseInt(quantity);
      medicine.quantity = newQuantity;

      const transaction = {
        _id: `trans_${Date.now()}`, // Generate a unique ID
        medicine: medicine._id,
        type: newQuantity > previousQuantity ? 'stock-in' : 'stock-out',
        quantity: Math.abs(newQuantity - previousQuantity),
        previousQuantity,
        updatedQuantity: newQuantity,
        reason: req.body.reason || 'Stock adjustment',
        performedBy: req.user.id,
        createdAt: new Date()
      };

      transactions.push(transaction);
    }

    medicine.updatedAt = new Date();
    medicines[medicineIndex] = medicine;

    res.json(medicine);
  } catch (error) {
    console.error('Update medicine error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a medicine
exports.deleteMedicine = async (req, res) => {
  try {
    const medicineIndex = medicines.findIndex(med => med._id === req.params.id);
    
    if (medicineIndex === -1) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    medicines.splice(medicineIndex, 1);
    
    res.json({ message: 'Medicine removed' });
  } catch (error) {
    console.error('Delete medicine error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get medicine by barcode
exports.getMedicineByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    
    const medicine = medicines.find(med => med.barcode === barcode);
    
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    const populatedMedicine = getMedicineWithPopulatedFields(medicine._id);
    res.json(populatedMedicine);
  } catch (error) {
    console.error('Get medicine by barcode error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 