import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const AddMedicine = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    manufacturer: '',
    category: 'tablet',
    description: '',
    price: '',
    quantity: '',
    expiryDate: '',
    batchNumber: '',
    reorderLevel: '',
    barcode: '',
    location: ''
  });
  
  const categories = [
    'tablet', 'capsule', 'syrup', 'injection', 'ointment', 
    'cream', 'solution', 'powder', 'drops', 'inhaler', 'other'
  ];
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate form data
      if (!formData.name || !formData.manufacturer || !formData.price || 
          !formData.quantity || !formData.expiryDate || !formData.batchNumber) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      // Convert string values to appropriate types
      const medicineData = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        reorderLevel: parseInt(formData.reorderLevel) || 10 // Default reorder level
      };
      
      // Send request to server
      const response = await axios.post('/medicines', medicineData);
      
      // Navigate to the medicine detail page
      navigate(`/medicines/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add medicine');
      console.error('Add medicine error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // If user is not admin or pharmacist, redirect to dashboard
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'pharmacist') {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Add New Medicine</h1>
        <button
          onClick={() => navigate('/medicines')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
        >
          Cancel
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Basic Information */}
          <div className="lg:col-span-3">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Basic Information</h2>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Medicine name"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manufacturer <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleInputChange}
              placeholder="Manufacturer name"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter medicine description"
              rows="3"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          
          {/* Inventory Information */}
          <div className="lg:col-span-3">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 mt-4">Inventory Information</h2>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reorder Level
            </label>
            <input
              type="number"
              name="reorderLevel"
              value={formData.reorderLevel}
              onChange={handleInputChange}
              placeholder="10"
              min="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum stock level before reordering</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="batchNumber"
              value={formData.batchNumber}
              onChange={handleInputChange}
              placeholder="Batch number"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Barcode
            </label>
            <input
              type="text"
              name="barcode"
              value={formData.barcode}
              onChange={handleInputChange}
              placeholder="Barcode (if available)"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Storage Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Shelf or storage location"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/medicines')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
          >
            {loading ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                Saving...
              </>
            ) : (
              'Save Medicine'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMedicine; 