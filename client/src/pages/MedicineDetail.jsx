import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const MedicineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const action = searchParams.get('action');
  
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactionData, setTransactionData] = useState({
    type: 'stock-in',
    quantity: '',
    reason: ''
  });
  const [transactionError, setTransactionError] = useState(null);
  const [showTransaction, setShowTransaction] = useState(action === 'transaction');
  
  const { user } = useContext(AuthContext);
  const isAdminOrPharmacist = user && (user.role === 'admin' || user.role === 'pharmacist');

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await axios.get(`/medicines/${id}`);
        setMedicine(res.data);
      } catch (err) {
        setError('Failed to load medicine details');
        console.error('Fetch medicine error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicine();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTransactionData({
      ...transactionData,
      [name]: value
    });
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setTransactionError(null);
      
      // Basic validation
      if (!transactionData.quantity || isNaN(transactionData.quantity) || parseInt(transactionData.quantity) <= 0) {
        setTransactionError('Please enter a valid quantity');
        return;
      }
      
      // Additional validation for stock-out
      if (transactionData.type === 'stock-out' && parseInt(transactionData.quantity) > medicine.quantity) {
        setTransactionError('Cannot withdraw more than available stock');
        return;
      }

      // Create transaction
      await axios.post('/medicines/transaction', {
        medicineId: medicine._id,
        type: transactionData.type,
        quantity: parseInt(transactionData.quantity),
        reason: transactionData.reason
      });

      // Refresh medicine data
      const res = await axios.get(`/medicines/${id}`);
      setMedicine(res.data);
      
      // Reset form and hide transaction panel
      setTransactionData({
        type: 'stock-in',
        quantity: '',
        reason: ''
      });
      setShowTransaction(false);
      
      // Show success message
      alert('Transaction completed successfully');
    } catch (err) {
      setTransactionError(err.response?.data?.message || 'Failed to process transaction');
      console.error('Transaction error:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this medicine? This action cannot be undone.')) {
      try {
        await axios.delete(`/medicines/${id}`);
        navigate('/medicines');
      } catch (err) {
        setError('Failed to delete medicine');
        console.error('Delete medicine error:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
        <span className="block">{error}</span>
        <button
          onClick={() => navigate('/medicines')}
          className="mt-2 bg-red-600 text-white py-1 px-3 rounded text-sm"
        >
          Back to Medicines
        </button>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4" role="alert">
        <span className="block">Medicine not found</span>
        <button
          onClick={() => navigate('/medicines')}
          className="mt-2 bg-yellow-600 text-white py-1 px-3 rounded text-sm"
        >
          Back to Medicines
        </button>
      </div>
    );
  }

  const isExpired = new Date(medicine.expiryDate) <= new Date();
  const isLowStock = medicine.quantity <= medicine.reorderLevel;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{medicine.name}</h1>
        <div className="flex space-x-2">
          {isAdminOrPharmacist && (
            <>
              <button
                onClick={() => setShowTransaction(!showTransaction)}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              >
                {showTransaction ? 'Cancel Transaction' : 'Add Transaction'}
              </button>
              <button
                onClick={() => navigate(`/medicines/edit/${medicine._id}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Edit
              </button>
              {user && user.role === 'admin' && (
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                >
                  Delete
                </button>
              )}
            </>
          )}
          <button
            onClick={() => navigate('/medicines')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
          >
            Back
          </button>
        </div>
      </div>

      {/* Transaction Form */}
      {showTransaction && isAdminOrPharmacist && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Add Transaction</h2>
          
          {transactionError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="block">{transactionError}</span>
            </div>
          )}
          
          <form onSubmit={handleTransactionSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                <select
                  name="type"
                  value={transactionData.type}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="stock-in">Stock In</option>
                  <option value="stock-out">Stock Out</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="expired">Expired</option>
                  <option value="return">Return</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                  {transactionData.type === 'stock-out' && medicine.quantity > 0 && (
                    <span className="text-xs text-gray-500 ml-1">
                      (Max: {medicine.quantity})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={transactionData.quantity}
                  onChange={handleInputChange}
                  placeholder="Enter quantity"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max={transactionData.type === 'stock-out' ? medicine.quantity : undefined}
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
              <textarea
                name="reason"
                value={transactionData.reason}
                onChange={handleInputChange}
                placeholder="Enter reason for this transaction"
                rows="3"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              >
                Submit Transaction
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Medicine Details */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Left Section */}
          <div className="p-6 md:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">General Information</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{medicine.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Manufacturer</p>
                    <p>{medicine.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="capitalize">{medicine.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Description</p>
                    <p>{medicine.description || 'No description provided'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Inventory Details</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Batch Number</p>
                    <p>{medicine.batchNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Barcode</p>
                    <p>{medicine.barcode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p>{medicine.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Added By</p>
                    <p>{medicine.addedBy?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p>{new Date(medicine.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="bg-gray-50 p-6 md:w-1/3">
            <h3 className="text-lg font-semibold mb-4">Stock Information</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Current Stock</p>
                <p className="text-2xl font-bold">{medicine.quantity}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Reorder Level</p>
                <p>{medicine.reorderLevel}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Price per Unit</p>
                <p className="font-medium">${medicine.price.toFixed(2)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Expiry Date</p>
                <p className={isExpired ? 'text-red-600 font-medium' : ''}>
                  {new Date(medicine.expiryDate).toLocaleDateString()}
                  {isExpired && ' (Expired)'}
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">Status</p>
                {isExpired ? (
                  <div className="mt-1 flex items-center">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Expired
                    </span>
                  </div>
                ) : isLowStock ? (
                  <div className="mt-1 flex items-center">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Low Stock
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      Reorder soon
                    </span>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      In Stock
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetail; 