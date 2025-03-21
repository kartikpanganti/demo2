import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStock: 0,
    expired: 0,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all medicines
        const medicinesRes = await axios.get('/medicines');
        
        // Get low stock medicines
        const lowStockRes = await axios.get('/medicines?lowStock=true');
        
        // Get expired medicines
        const expiredRes = await axios.get('/medicines?expired=true');
        
        // Get recent transactions
        const transactionsRes = await axios.get('/medicines/transactions/all');
        
        setStats({
          totalMedicines: medicinesRes.data.length,
          lowStock: lowStockRes.data.length,
          expired: expiredRes.data.length,
          recentTransactions: transactionsRes.data.slice(0, 5) // Get only the 5 most recent
        });
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Medicines */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Total Medicines</h2>
            <span className="p-2 rounded-full bg-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-3xl font-bold text-gray-800">{stats.totalMedicines}</span>
          </div>
          <Link to="/medicines" className="text-blue-600 hover:text-blue-800 mt-4 block text-sm">
            View All Medicines &rarr;
          </Link>
        </div>
        
        {/* Low Stock */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Low Stock</h2>
            <span className="p-2 rounded-full bg-yellow-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-3xl font-bold text-gray-800">{stats.lowStock}</span>
          </div>
          <Link to="/medicines?lowStock=true" className="text-yellow-600 hover:text-yellow-800 mt-4 block text-sm">
            View Low Stock Medicines &rarr;
          </Link>
        </div>
        
        {/* Expired */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Expired</h2>
            <span className="p-2 rounded-full bg-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-3xl font-bold text-gray-800">{stats.expired}</span>
          </div>
          <Link to="/medicines?expired=true" className="text-red-600 hover:text-red-800 mt-4 block text-sm">
            View Expired Medicines &rarr;
          </Link>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Transactions</h2>
          <Link to="/transactions" className="text-blue-600 hover:text-blue-800">
            View All
          </Link>
        </div>
        
        {stats.recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Medicine</th>
                  <th className="py-2 px-4 border-b text-left">Type</th>
                  <th className="py-2 px-4 border-b text-left">Quantity</th>
                  <th className="py-2 px-4 border-b text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTransactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="py-2 px-4 border-b">{transaction.medicine?.name || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 rounded text-xs ${
                        transaction.type === 'stock-in' 
                          ? 'bg-green-100 text-green-800' 
                          : transaction.type === 'stock-out' 
                            ? 'bg-blue-100 text-blue-800' 
                            : transaction.type === 'expired' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">{transaction.quantity}</td>
                    <td className="py-2 px-4 border-b">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No recent transactions found.</p>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/medicines/new"
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Medicine
          </Link>
          
          <Link
            to="/scanner"
            className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Scan Barcode
          </Link>
          
          <Link
            to="/medicines"
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            View Inventory
          </Link>
          
          <Link
            to="/transactions"
            className="bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View Transactions
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 