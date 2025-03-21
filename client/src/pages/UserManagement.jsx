import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const UserManagement = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee'
  });
  
  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if user is admin
        if (!user || user.role !== 'admin') {
          navigate('/dashboard');
          return;
        }
        
        const response = await axios.get('/users');
        setUsers(response.data);
      } catch (err) {
        setError('Failed to fetch users');
        console.error('Fetch users error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [user, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const openAddModal = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'employee'
    });
    setModalMode('add');
    setShowModal(true);
  };
  
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
    setModalMode('edit');
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      
      // Validate form data
      if (!formData.name || !formData.email || (modalMode === 'add' && !formData.password)) {
        setError('Please fill in all required fields');
        return;
      }
      
      if (modalMode === 'add') {
        // Create new user
        const response = await axios.post('/users', formData);
        setUsers([...users, response.data]);
      } else {
        // Update existing user
        const userData = { ...formData };
        // Only include password if it was provided
        if (!userData.password) delete userData.password;
        
        const response = await axios.put(`/users/${selectedUser._id}`, userData);
        setUsers(users.map(u => u._id === selectedUser._id ? response.data : u));
      }
      
      // Close modal and reset form
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${modalMode === 'add' ? 'add' : 'update'} user`);
      console.error(`${modalMode === 'add' ? 'Add' : 'Update'} user error:`, err);
    }
  };
  
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      setError(null);
      
      await axios.delete(`/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      console.error('Delete user error:', err);
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
        <h1 className="text-3xl font-bold">User Management</h1>
        <button
          onClick={openAddModal}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add User
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block">{error}</span>
        </div>
      )}
      
      {users.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No users found. Add your first user by clicking the "Add User" button.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                          user.role === 'pharmacist' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      {user._id !== user._id && (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {modalMode === 'add' ? 'Add New User' : 'Edit User'}
                    </h3>
                    
                    <div className="mt-4">
                      <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password {modalMode === 'add' && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required={modalMode === 'add'}
                          />
                          {modalMode === 'edit' && (
                            <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
                          )}
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="admin">Admin</option>
                            <option value="pharmacist">Pharmacist</option>
                            <option value="employee">Employee</option>
                          </select>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {modalMode === 'add' ? 'Add User' : 'Update User'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 