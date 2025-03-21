import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MedicineList from './pages/MedicineList'
import MedicineDetail from './pages/MedicineDetail'
import AddMedicine from './pages/AddMedicine'
import EditMedicine from './pages/EditMedicine'
import BarcodeScanner from './pages/BarcodeScanner'
import Transactions from './pages/Transactions'
import Reports from './pages/Reports'
import UserManagement from './pages/UserManagement'
import NotFound from './pages/NotFound'

// Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'

// Context
import { AuthProvider } from './context/AuthContext'

// Set default axios config
axios.defaults.baseURL = '/api'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Private Routes */}
              <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />
              <Route path="/medicines" element={<PrivateRoute element={<MedicineList />} />} />
              <Route path="/medicines/:id" element={<PrivateRoute element={<MedicineDetail />} />} />
              <Route path="/medicines/new" element={<PrivateRoute element={<AddMedicine />} />} />
              <Route path="/medicines/edit/:id" element={<PrivateRoute element={<EditMedicine />} />} />
              <Route path="/scanner" element={<PrivateRoute element={<BarcodeScanner />} />} />
              <Route path="/transactions" element={<PrivateRoute element={<Transactions />} />} />
              <Route path="/reports" element={<PrivateRoute element={<Reports />} />} />
              <Route path="/users" element={<PrivateRoute element={<UserManagement />} />} />
              <Route path="/register" element={<PrivateRoute element={<Register />} />} />
              
              {/* 404 Route */}
              <Route path="/not-found" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/not-found" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
