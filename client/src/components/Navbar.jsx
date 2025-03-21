import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                />
              </svg>
              <span className="font-bold text-xl">MedInventory</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/" className="px-3 py-2 rounded-md hover:bg-blue-700">
                  Dashboard
                </Link>
                <Link to="/medicines" className="px-3 py-2 rounded-md hover:bg-blue-700">
                  Medicines
                </Link>
                <Link to="/scanner" className="px-3 py-2 rounded-md hover:bg-blue-700">
                  Barcode Scanner
                </Link>
                <Link to="/transactions" className="px-3 py-2 rounded-md hover:bg-blue-700">
                  Transactions
                </Link>
                <Link to="/reports" className="px-3 py-2 rounded-md hover:bg-blue-700">
                  Reports
                </Link>
                {user && user.role === 'admin' && (
                  <>
                    <Link to="/users" className="px-3 py-2 rounded-md hover:bg-blue-700">
                      Users
                    </Link>
                  </>
                )}
                <div className="relative ml-3">
                  <div className="flex items-center">
                    <span className="mr-2">{user?.name}</span>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 rounded-md hover:bg-blue-700">
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className="block px-3 py-2 rounded-md hover:bg-blue-700"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/medicines"
                  className="block px-3 py-2 rounded-md hover:bg-blue-700"
                  onClick={toggleMenu}
                >
                  Medicines
                </Link>
                <Link
                  to="/scanner"
                  className="block px-3 py-2 rounded-md hover:bg-blue-700"
                  onClick={toggleMenu}
                >
                  Barcode Scanner
                </Link>
                <Link
                  to="/transactions"
                  className="block px-3 py-2 rounded-md hover:bg-blue-700"
                  onClick={toggleMenu}
                >
                  Transactions
                </Link>
                <Link
                  to="/reports"
                  className="block px-3 py-2 rounded-md hover:bg-blue-700"
                  onClick={toggleMenu}
                >
                  Reports
                </Link>
                {user && user.role === 'admin' && (
                  <>
                    <Link
                      to="/users"
                      className="block px-3 py-2 rounded-md hover:bg-blue-700"
                      onClick={toggleMenu}
                    >
                      Users
                    </Link>
                  </>
                )}
                <div className="flex justify-between items-center px-3 py-2">
                  <span>{user?.name}</span>
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md hover:bg-blue-700"
                onClick={toggleMenu}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 