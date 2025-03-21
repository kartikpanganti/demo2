import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'staff'
  });
  const [formErrors, setFormErrors] = useState({});
  const { register, isAuthenticated, error, user, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if not an admin user
  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Clear any auth errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const { name, email, password, confirmPassword, role } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear errors when user types
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!name) {
      errors.name = 'Name is required';
      isValid = false;
    }

    if (!email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Remove confirmPassword before sending to API
        const { confirmPassword, ...registerData } = formData;
        await register(registerData);
        
        // Reset form after successful registration
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'staff'
        });
        
        // Show success message or redirect
        alert('User registered successfully!');
      } catch (err) {
        // Error handling is done in the AuthContext
        console.error('Registration error:', err);
      }
    }
  };

  return (
    <div className="flex justify-center items-center py-8">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Register New User</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block">{error}</span>
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                formErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter user's name"
            />
            {formErrors.name && (
              <p className="text-red-500 text-xs italic mt-1">{formErrors.name}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter user's email"
            />
            {formErrors.email && (
              <p className="text-red-500 text-xs italic mt-1">{formErrors.email}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                formErrors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter a password"
            />
            {formErrors.password && (
              <p className="text-red-500 text-xs italic mt-1">{formErrors.password}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm password"
            />
            {formErrors.confirmPassword && (
              <p className="text-red-500 text-xs italic mt-1">{formErrors.confirmPassword}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="staff">Staff</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="mb-6">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-blue-700"
            >
              Register User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 