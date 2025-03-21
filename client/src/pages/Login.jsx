import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const { login, isAuthenticated, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Clear any auth errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const { email, password } = formData;

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

    if (!email) {
      errors.email = 'Username/Email is required';
      isValid = false;
    } else if (email !== 'admin' && !/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await login(formData);
      } catch (err) {
        // Error handling is done in the AuthContext
        console.error('Login error:', err);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block">{error}</span>
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Username or Email
            </label>
            <input
              type="text"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your username or email"
            />
            {formErrors.email && (
              <p className="text-red-500 text-xs italic mt-1">{formErrors.email}</p>
            )}
          </div>
          
          <div className="mb-6">
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
              placeholder="Enter your password"
            />
            {formErrors.password && (
              <p className="text-red-500 text-xs italic mt-1">{formErrors.password}</p>
            )}
          </div>
          
          <div className="mb-6">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-blue-700"
            >
              Sign In
            </button>
          </div>
        </form>
        
        {/* Temporary login hint */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">Temporary login:</p>
          <p className="text-sm text-gray-700">Username: admin</p>
          <p className="text-sm text-gray-700">Password: password</p>
        </div>
      </div>
    </div>
  );
};

export default Login; 