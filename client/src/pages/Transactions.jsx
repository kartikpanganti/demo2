import { useState, useEffect } from 'react';
import axios from 'axios';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    startDate: '',
    endDate: '',
    medicineId: ''
  });
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query string from filters
        const queryParams = new URLSearchParams();
        if (filters.type) queryParams.set('type', filters.type);
        if (filters.startDate) queryParams.set('startDate', filters.startDate);
        if (filters.endDate) queryParams.set('endDate', filters.endDate);
        if (filters.medicineId) queryParams.set('medicineId', filters.medicineId);
        
        const res = await axios.get(`/medicines/transactions/all?${queryParams.toString()}`);
        setTransactions(res.data);
      } catch (err) {
        setError('Failed to load transactions');
        console.error('Fetch transactions error:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchMedicines = async () => {
      try {
        const res = await axios.get('/medicines');
        setMedicines(res.data);
      } catch (err) {
        console.error('Fetch medicines error:', err);
      }
    };

    fetchTransactions();
    fetchMedicines();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleResetFilters = () => {
    setFilters({
      type: '',
      startDate: '',
      endDate: '',
      medicineId: ''
    });
  };

  const getTransactionTypeClass = (type) => {
    switch (type) {
      case 'stock-in':
        return 'bg-green-100 text-green-800';
      case 'stock-out':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'adjustment':
        return 'bg-yellow-100 text-yellow-800';
      case 'return':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Transaction History</h1>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="stock-in">Stock In</option>
              <option value="stock-out">Stock Out</option>
              <option value="adjustment">Adjustment</option>
              <option value="expired">Expired</option>
              <option value="return">Return</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medicine</label>
            <select
              name="medicineId"
              value={filters.medicineId}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Medicines</option>
              {medicines.map(medicine => (
                <option key={medicine._id} value={medicine._id}>
                  {medicine.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
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
      
      {/* Transaction List */}
      {transactions.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previous</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performed By</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.medicine?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.medicine?.barcode || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTransactionTypeClass(transaction.type)}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.previousQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.updatedQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.performedBy?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.reason || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-500 mb-4">No transactions found matching your criteria.</p>
          {filters.type || filters.startDate || filters.endDate || filters.medicineId ? (
            <button 
              onClick={handleResetFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Reset Filters
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Transactions; 