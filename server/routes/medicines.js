const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// @route   GET /api/medicines
// @desc    Get all medicines
// @access  Private
router.get('/', auth, medicineController.getMedicines);

// @route   GET /api/medicines/:id
// @desc    Get medicine by ID
// @access  Private
router.get('/:id', auth, medicineController.getMedicineById);

// @route   POST /api/medicines
// @desc    Create a new medicine
// @access  Private - Admin & Pharmacist only
router.post(
  '/',
  [auth, checkRole(['admin', 'pharmacist'])],
  medicineController.createMedicine
);

// @route   PUT /api/medicines/:id
// @desc    Update a medicine
// @access  Private - Admin & Pharmacist only
router.put(
  '/:id',
  [auth, checkRole(['admin', 'pharmacist'])],
  medicineController.updateMedicine
);

// @route   DELETE /api/medicines/:id
// @desc    Delete a medicine
// @access  Private - Admin only
router.delete(
  '/:id',
  [auth, checkRole(['admin'])],
  medicineController.deleteMedicine
);

// @route   GET /api/medicines/barcode/:barcode
// @desc    Get medicine by barcode
// @access  Private
router.get('/barcode/:barcode', auth, medicineController.getMedicineByBarcode);

// @route   POST /api/medicines/transaction
// @desc    Create a transaction
// @access  Private
router.post('/transaction', auth, transactionController.createTransaction);

// @route   GET /api/medicines/transactions
// @desc    Get all transactions
// @access  Private
router.get('/transactions/all', auth, transactionController.getTransactions);

// @route   GET /api/medicines/transactions/:id
// @desc    Get transaction by ID
// @access  Private
router.get('/transactions/:id', auth, transactionController.getTransactionById);

module.exports = router; 