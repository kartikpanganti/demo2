import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Reports = () => {
  const [reportType, setReportType] = useState('inventory');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [categories, setCategories] = useState([]);
  const reportContainerRef = useRef(null);

  // Fetch available categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/medicines/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'reportType') {
      setReportType(value);
    } else if (name === 'category') {
      setCategory(value);
    } else {
      setDateRange({
        ...dateRange,
        [name]: value
      });
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params
      const params = new URLSearchParams();
      params.append('startDate', dateRange.startDate);
      params.append('endDate', dateRange.endDate);
      if (category) params.append('category', category);
      
      let endpoint;
      switch (reportType) {
        case 'inventory':
          endpoint = '/reports/inventory';
          break;
        case 'expiry':
          endpoint = '/reports/expiry';
          break;
        case 'transactions':
          endpoint = '/reports/transactions';
          break;
        case 'lowStock':
          endpoint = '/reports/low-stock';
          break;
        default:
          endpoint = '/reports/inventory';
      }
      
      const res = await axios.get(`${endpoint}?${params.toString()}`);
      setReportData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report');
      console.error('Report generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    window.print();
  };

  const exportToCSV = () => {
    if (!reportData) return;
    
    let csvContent = '';
    let headers = [];
    let rows = [];
    
    // Prepare headers and rows based on report type
    switch (reportType) {
      case 'inventory':
        headers = ['Name', 'Category', 'Batch Number', 'Quantity', 'Price', 'Value', 'Expiry Date', 'Status'];
        rows = reportData.medicines.map(item => [
          item.name,
          item.category,
          item.batchNumber,
          item.quantity,
          item.price.toFixed(2),
          (item.price * item.quantity).toFixed(2),
          new Date(item.expiryDate).toLocaleDateString(),
          item.status
        ]);
        break;
      case 'expiry':
        headers = ['Name', 'Category', 'Batch Number', 'Quantity', 'Expiry Date', 'Days Until Expiry'];
        rows = reportData.medicines.map(item => [
          item.name,
          item.category,
          item.batchNumber,
          item.quantity,
          new Date(item.expiryDate).toLocaleDateString(),
          item.daysUntilExpiry
        ]);
        break;
      case 'transactions':
        headers = ['Date', 'Medicine', 'Type', 'Quantity', 'Previous', 'Updated', 'Performed By', 'Reason'];
        rows = reportData.transactions.map(item => [
          new Date(item.createdAt).toLocaleString(),
          item.medicine?.name || 'N/A',
          item.type,
          item.quantity,
          item.previousQuantity,
          item.updatedQuantity,
          item.performedBy?.name || 'N/A',
          item.reason || '-'
        ]);
        break;
      case 'lowStock':
        headers = ['Name', 'Category', 'Quantity', 'Reorder Level', 'Shortage', 'Price'];
        rows = reportData.medicines.map(item => [
          item.name,
          item.category,
          item.quantity,
          item.reorderLevel,
          item.reorderLevel - item.quantity,
          item.price.toFixed(2)
        ]);
        break;
      default:
        break;
    }
    
    // Add headers
    csvContent += headers.join(',') + '\r\n';
    
    // Add rows
    rows.forEach(row => {
      // Escape values that contain commas
      const escapedRow = row.map(value => {
        if (value && typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      });
      csvContent += escapedRow.join(',') + '\r\n';
    });
    
    // Create download link
    const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const link = document.createElement('a');
    const reportDate = new Date().toISOString().split('T')[0];
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportType}_report_${reportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reports</h1>
      
      {/* Report Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              name="reportType"
              value={reportType}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="inventory">Inventory Report</option>
              <option value="expiry">Expiry Report</option>
              <option value="transactions">Transaction Report</option>
              <option value="lowStock">Low Stock Report</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category (Optional)</label>
            <select
              name="category"
              value={category}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={generateReport}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
          >
            {loading ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                Generating...
              </>
            ) : (
              'Generate Report'
            )}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block">{error}</span>
        </div>
      )}
      
      {/* Report Display */}
      {reportData && (
        <div ref={reportContainerRef} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">
                {reportType === 'inventory' ? 'Inventory Report' :
                 reportType === 'expiry' ? 'Expiry Report' :
                 reportType === 'transactions' ? 'Transaction Report' :
                 'Low Stock Report'}
              </h2>
              <p className="text-sm text-gray-500">
                {dateRange.startDate} to {dateRange.endDate}
                {category && ` | Category: ${category}`}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                CSV
              </button>
              <button
                onClick={exportToPDF}
                className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
            </div>
          </div>
          
          {/* Report Content based on type */}
          {reportType === 'inventory' && (
            <>
              <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Items</p>
                  <p className="text-2xl font-bold">{reportData.totalItems}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Quantity</p>
                  <p className="text-2xl font-bold">{reportData.totalQuantity}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Value</p>
                  <p className="text-2xl font-bold">${reportData.totalValue.toFixed(2)}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Categories</p>
                  <p className="text-2xl font-bold">{reportData.categories.length}</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 border-b text-left">Name</th>
                      <th className="py-2 px-4 border-b text-left">Category</th>
                      <th className="py-2 px-4 border-b text-left">Batch</th>
                      <th className="py-2 px-4 border-b text-left">Quantity</th>
                      <th className="py-2 px-4 border-b text-left">Price</th>
                      <th className="py-2 px-4 border-b text-left">Value</th>
                      <th className="py-2 px-4 border-b text-left">Expiry Date</th>
                      <th className="py-2 px-4 border-b text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.medicines.map((medicine, index) => {
                      const isExpired = new Date(medicine.expiryDate) <= new Date();
                      const isLowStock = medicine.quantity <= medicine.reorderLevel;
                      
                      return (
                        <tr key={index} className={isExpired ? 'bg-red-50' : isLowStock ? 'bg-yellow-50' : ''}>
                          <td className="py-2 px-4 border-b">{medicine.name}</td>
                          <td className="py-2 px-4 border-b">{medicine.category}</td>
                          <td className="py-2 px-4 border-b">{medicine.batchNumber}</td>
                          <td className="py-2 px-4 border-b">{medicine.quantity}</td>
                          <td className="py-2 px-4 border-b">${medicine.price.toFixed(2)}</td>
                          <td className="py-2 px-4 border-b">${(medicine.price * medicine.quantity).toFixed(2)}</td>
                          <td className="py-2 px-4 border-b">{new Date(medicine.expiryDate).toLocaleDateString()}</td>
                          <td className="py-2 px-4 border-b">
                            {isExpired ? (
                              <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">Expired</span>
                            ) : isLowStock ? (
                              <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">Low Stock</span>
                            ) : (
                              <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">In Stock</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
          
          {reportType === 'expiry' && (
            <>
              <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Expired Items</p>
                  <p className="text-2xl font-bold">{reportData.expiredCount}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Expiring in 30 Days</p>
                  <p className="text-2xl font-bold">{reportData.expiringSoonCount}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Expired Value</p>
                  <p className="text-2xl font-bold">${reportData.expiredValue.toFixed(2)}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Expiring Soon Value</p>
                  <p className="text-2xl font-bold">${reportData.expiringSoonValue.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 border-b text-left">Name</th>
                      <th className="py-2 px-4 border-b text-left">Category</th>
                      <th className="py-2 px-4 border-b text-left">Batch</th>
                      <th className="py-2 px-4 border-b text-left">Quantity</th>
                      <th className="py-2 px-4 border-b text-left">Expiry Date</th>
                      <th className="py-2 px-4 border-b text-left">Days Until Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.medicines.map((medicine, index) => {
                      const isExpired = medicine.daysUntilExpiry < 0;
                      const isExpiringSoon = medicine.daysUntilExpiry >= 0 && medicine.daysUntilExpiry <= 30;
                      
                      return (
                        <tr key={index} className={isExpired ? 'bg-red-50' : isExpiringSoon ? 'bg-yellow-50' : ''}>
                          <td className="py-2 px-4 border-b">{medicine.name}</td>
                          <td className="py-2 px-4 border-b">{medicine.category}</td>
                          <td className="py-2 px-4 border-b">{medicine.batchNumber}</td>
                          <td className="py-2 px-4 border-b">{medicine.quantity}</td>
                          <td className="py-2 px-4 border-b">{new Date(medicine.expiryDate).toLocaleDateString()}</td>
                          <td className="py-2 px-4 border-b">
                            {isExpired ? (
                              <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                                Expired ({medicine.daysUntilExpiry * -1} days ago)
                              </span>
                            ) : isExpiringSoon ? (
                              <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                                {medicine.daysUntilExpiry} days
                              </span>
                            ) : (
                              <span>{medicine.daysUntilExpiry} days</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
          
          {reportType === 'transactions' && (
            <>
              <div className="mb-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Transactions</p>
                  <p className="text-2xl font-bold">{reportData.totalCount}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Stock In</p>
                  <p className="text-2xl font-bold">{reportData.stockInCount}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Stock Out</p>
                  <p className="text-2xl font-bold">{reportData.stockOutCount}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Expired</p>
                  <p className="text-2xl font-bold">{reportData.expiredCount}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Adjustments</p>
                  <p className="text-2xl font-bold">{reportData.adjustmentCount}</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 border-b text-left">Date</th>
                      <th className="py-2 px-4 border-b text-left">Medicine</th>
                      <th className="py-2 px-4 border-b text-left">Type</th>
                      <th className="py-2 px-4 border-b text-left">Quantity</th>
                      <th className="py-2 px-4 border-b text-left">Previous</th>
                      <th className="py-2 px-4 border-b text-left">Updated</th>
                      <th className="py-2 px-4 border-b text-left">Performed By</th>
                      <th className="py-2 px-4 border-b text-left">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.transactions.map((transaction, index) => {
                      let typeClass = '';
                      switch (transaction.type) {
                        case 'stock-in': typeClass = 'bg-green-100 text-green-800'; break;
                        case 'stock-out': typeClass = 'bg-blue-100 text-blue-800'; break;
                        case 'expired': typeClass = 'bg-red-100 text-red-800'; break;
                        case 'adjustment': typeClass = 'bg-yellow-100 text-yellow-800'; break;
                        case 'return': typeClass = 'bg-purple-100 text-purple-800'; break;
                        default: typeClass = 'bg-gray-100 text-gray-800';
                      }
                      
                      return (
                        <tr key={index}>
                          <td className="py-2 px-4 border-b">{new Date(transaction.createdAt).toLocaleString()}</td>
                          <td className="py-2 px-4 border-b">{transaction.medicine?.name || 'N/A'}</td>
                          <td className="py-2 px-4 border-b">
                            <span className={`px-2 py-1 rounded text-xs ${typeClass}`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className="py-2 px-4 border-b">{transaction.quantity}</td>
                          <td className="py-2 px-4 border-b">{transaction.previousQuantity}</td>
                          <td className="py-2 px-4 border-b">{transaction.updatedQuantity}</td>
                          <td className="py-2 px-4 border-b">{transaction.performedBy?.name || 'N/A'}</td>
                          <td className="py-2 px-4 border-b">{transaction.reason || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
          
          {reportType === 'lowStock' && (
            <>
              <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Low Stock Items</p>
                  <p className="text-2xl font-bold">{reportData.totalLowStock}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Out of Stock Items</p>
                  <p className="text-2xl font-bold">{reportData.outOfStockCount}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Estimated Restock Cost</p>
                  <p className="text-2xl font-bold">${reportData.estimatedRestockCost.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 border-b text-left">Name</th>
                      <th className="py-2 px-4 border-b text-left">Category</th>
                      <th className="py-2 px-4 border-b text-left">Quantity</th>
                      <th className="py-2 px-4 border-b text-left">Reorder Level</th>
                      <th className="py-2 px-4 border-b text-left">Shortage</th>
                      <th className="py-2 px-4 border-b text-left">Price</th>
                      <th className="py-2 px-4 border-b text-left">Restock Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.medicines.map((medicine, index) => {
                      const shortage = medicine.reorderLevel - medicine.quantity;
                      const restockCost = shortage * medicine.price;
                      const isOutOfStock = medicine.quantity === 0;
                      
                      return (
                        <tr key={index} className={isOutOfStock ? 'bg-red-50' : 'bg-yellow-50'}>
                          <td className="py-2 px-4 border-b">{medicine.name}</td>
                          <td className="py-2 px-4 border-b">{medicine.category}</td>
                          <td className="py-2 px-4 border-b">{medicine.quantity}</td>
                          <td className="py-2 px-4 border-b">{medicine.reorderLevel}</td>
                          <td className="py-2 px-4 border-b">{shortage}</td>
                          <td className="py-2 px-4 border-b">${medicine.price.toFixed(2)}</td>
                          <td className="py-2 px-4 border-b">${restockCost.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports; 