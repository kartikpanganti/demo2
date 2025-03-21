const Transaction = require('../models/Transaction');
const Medicine = require('../models/Medicine');

// Get all transactions with optional filters
exports.getTransactions = async (req, res) => {
  try {
    const { medicineId, type, startDate, endDate } = req.query;
    let query = {};

    // Apply filters if provided
    if (medicineId) {
      query.medicine = medicineId;
    }

    if (type) {
      query.type = type;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const transactions = await Transaction.find(query)
      .populate('medicine', 'name barcode')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(transactions);
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
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

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
    await medicine.save();

    // Create transaction record
    const transaction = new Transaction({
      medicine: medicineId,
      type,
      quantity: parseInt(quantity),
      previousQuantity,
      updatedQuantity,
      reason,
      performedBy: req.user.id
    });

    await transaction.save();

    // Return transaction with populated references
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('medicine', 'name barcode')
      .populate('performedBy', 'name');

    res.status(201).json(populatedTransaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('medicine', 'name barcode')
      .populate('performedBy', 'name');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 