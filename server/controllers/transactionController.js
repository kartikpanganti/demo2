// Commented out actual MongoDB models
// const Transaction = require('../models/Transaction');
// const Medicine = require('../models/Medicine');

// Using mock data instead
const { 
  medicines, 
  transactions, 
  getTransactionWithPopulatedFields 
} = require('../mock/mockData');

// Get all transactions with optional filters
exports.getTransactions = async (req, res) => {
  try {
    const { medicineId, type, startDate, endDate } = req.query;
    let filteredTransactions = [...transactions];

    // Apply filters if provided
    if (medicineId) {
      filteredTransactions = filteredTransactions.filter(trans => trans.medicine === medicineId);
    }

    if (type) {
      filteredTransactions = filteredTransactions.filter(trans => trans.type === type);
    }

    // Date range filter
    if (startDate || endDate) {
      if (startDate) {
        const startDateTime = new Date(startDate).getTime();
        filteredTransactions = filteredTransactions.filter(trans => 
          new Date(trans.createdAt).getTime() >= startDateTime
        );
      }
      if (endDate) {
        const endDateTime = new Date(endDate).getTime();
        filteredTransactions = filteredTransactions.filter(trans => 
          new Date(trans.createdAt).getTime() <= endDateTime
        );
      }
    }

    // Sort by createdAt in descending order
    filteredTransactions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Populate references
    const populatedTransactions = filteredTransactions.map(trans => 
      getTransactionWithPopulatedFields(trans._id)
    );

    res.json(populatedTransactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new transaction
exports.createTransaction = async (req, res) => {
  try {
    const { medicineId, type, quantity, reason } = req.body;

    // Validate input
    if (!medicineId || !type || !quantity) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Find the medicine
    const medicineIndex = medicines.findIndex(med => med._id === medicineId);
    if (medicineIndex === -1) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    const medicine = medicines[medicineIndex];
    // Store previous quantity
    const previousQuantity = medicine.quantity;
    let updatedQuantity;

    // Update medicine quantity based on transaction type
    switch (type) {
      case 'stock-in':
        updatedQuantity = previousQuantity + parseInt(quantity);
        medicine.quantity = updatedQuantity;
        break;
        
      case 'stock-out':
        if (previousQuantity < parseInt(quantity)) {
          return res.status(400).json({ message: 'Insufficient stock' });
        }
        updatedQuantity = previousQuantity - parseInt(quantity);
        medicine.quantity = updatedQuantity;
        break;
        
      case 'adjustment':
        updatedQuantity = parseInt(quantity);
        medicine.quantity = updatedQuantity;
        break;
        
      case 'expired':
        if (previousQuantity < parseInt(quantity)) {
          return res.status(400).json({ message: 'Expired quantity cannot exceed available stock' });
        }
        updatedQuantity = previousQuantity - parseInt(quantity);
        medicine.quantity = updatedQuantity;
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid transaction type' });
    }

    // Save updated medicine
    medicine.updatedAt = new Date();
    medicines[medicineIndex] = medicine;

    // Create transaction record
    const newTransaction = {
      _id: `trans_${Date.now()}`,
      medicine: medicineId,
      type,
      quantity: parseInt(quantity),
      previousQuantity,
      updatedQuantity,
      reason,
      performedBy: req.user.id,
      createdAt: new Date()
    };

    transactions.push(newTransaction);

    // Return transaction with populated references
    const populatedTransaction = getTransactionWithPopulatedFields(newTransaction._id);

    res.status(201).json(populatedTransaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = getTransactionWithPopulatedFields(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 