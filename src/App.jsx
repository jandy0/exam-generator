import './App.css'
import Login from './pages/user/login'
import Register from './pages/user/register'
import Dashboard from './pages/user/dashboard'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className='min-h-screen bg-gray-50'>
          <Routes>      
            <Route path="/" element={<Login/>} />
            <Route path="/user/register" element={<Register/>} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App