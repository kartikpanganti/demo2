import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const EditMedicine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    manufacturer: '',
    category: '',
    description: '',
    price: '',
    reorderLevel: '',
    barcode: '',
    location: ''
  });
  
  const categories = [
    'tablet', 'capsule', 'syrup', 'injection', 'ointment', 
    'cream', 'solution', 'powder', 'drops', 'inhaler', 'other'
  ];
  
  // Fetch medicine data
  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await axios.get(`/medicines/${id}`);
        const medicine = res.data;
        
        // Set form data with medicine details
        setFormData({
          name: medicine.name,
          manufacturer: medicine.manufacturer,
          category: medicine.category,
          description: medicine.description || '',
          price: medicine.price.toString(),
          reorderLevel: medicine.reorderLevel.toString(),
          barcode: medicine.barcode || '',
          location: medicine.location || ''
        });
      } catch (err) {
        setError('Failed to load medicine details');
        console.error('Fetch medicine error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicine();
  }, [id]);
  
  // Redirect if user is not admin or pharmacist
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'pharmacist') {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
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
      setSubmitting(true);
      setError(null);
      
      // Validate form data
      if (!formData.name || !formData.manufacturer || !formData.price) {
        setError('Please fill in all required fields');
        setSubmitting(false);
        return;
      }
      
      // Convert string values to appropriate types
      const medicineData = {
        ...formData,
        price: parseFloat(formData.price),
        reorderLevel: parseInt(formData.reorderLevel) || 10
      };
      
      // Send request to server
      await axios.put(`/medicines/${id}`, medicineData);
      
      // Navigate back to medicine detail
      navigate(`/medicines/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update medicine');
      console.error('Update medicine error:', err);
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Medicine</h1>
        <button
          onClick={() => navigate(`/medicines/${id}`)}
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
            <p className="text-sm text-gray-500 mb-4">
              Note: Some inventory details like quantity, batch number, and expiry date can only be modified through transactions.
            </p>
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
            onClick={() => navigate(`/medicines/${id}`)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
          >
            {submitting ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                Updating...
              </>
            ) : (
              'Update Medicine'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMedicine; 