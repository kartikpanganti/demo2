import { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const MedicineList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    lowStock: searchParams.get('lowStock') === 'true',
    expired: searchParams.get('expired') === 'true'
  });
  
  const { user } = useContext(AuthContext);
  const isAdminOrPharmacist = user && (user.role === 'admin' || user.role === 'pharmacist');

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query string from filters
        const queryParams = new URLSearchParams();
        if (filters.search) queryParams.set('search', filters.search);
        if (filters.category) queryParams.set('category', filters.category);
        if (filters.lowStock) queryParams.set('lowStock', 'true');
        if (filters.expired) queryParams.set('expired', 'true');
        
        const res = await axios.get(`/medicines?${queryParams.toString()}`);
        setMedicines(res.data);
      } catch (err) {
        setError('Failed to load medicines');
        console.error('Fetch medicines error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    // For checkboxes use the checked property, for other inputs use value
    const newValue = type === 'checkbox' ? checked : value;
    
    setFilters({
      ...filters,
      [name]: newValue
    });
    
    // Update URL query parameters
    const queryParams = new URLSearchParams(location.search);
    if (newValue && newValue !== false) {
      queryParams.set(name, type === 'checkbox' ? 'true' : newValue);
    } else {
      queryParams.delete(name);
    }
    
    navigate(`${location.pathname}?${queryParams.toString()}`);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      lowStock: false,
      expired: false
    });
    
    navigate(location.pathname);
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
        <h1 className="text-3xl font-bold">Medicines</h1>
        {isAdminOrPharmacist && (
          <Link 
            to="/medicines/new" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Medicine
          </Link>
        )}
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by name, manufacturer, barcode..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="tablet">Tablet</option>
              <option value="capsule">Capsule</option>
              <option value="syrup">Syrup</option>
              <option value="injection">Injection</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="lowStock"
              name="lowStock"
              checked={filters.lowStock}
              onChange={handleFilterChange}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="lowStock" className="text-sm font-medium text-gray-700">Low Stock</label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="expired"
              name="expired"
              checked={filters.expired}
              onChange={handleFilterChange}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="expired" className="text-sm font-medium text-gray-700">Expired</label>
          </div>
          
          <button
            onClick={handleResetFilters}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
          >
            Reset Filters
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block">{error}</span>
        </div>
      )}
      
      {/* Medicines List */}
      {medicines.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {medicines.map((medicine) => {
                  const isExpired = new Date(medicine.expiryDate) <= new Date();
                  const isLowStock = medicine.quantity <= medicine.reorderLevel;
                  
                  return (
                    <tr key={medicine._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                        <div className="text-sm text-gray-500">{medicine.manufacturer}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {medicine.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {medicine.batchNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(medicine.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {medicine.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${medicine.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isExpired ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Expired
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          to={`/medicines/${medicine._id}`} 
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View
                        </Link>
                        {isAdminOrPharmacist && (
                          <Link 
                            to={`/medicines/edit/${medicine._id}`} 
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-500 mb-4">No medicines found matching your criteria.</p>
          <button 
            onClick={handleResetFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default MedicineList; 