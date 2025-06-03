import './App.css'
import Login from './pages/user/login'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className='min-h-screen bg-gray-50'>
      <Routes>      
      <Route path="/" element={<Login/>} />
</Routes>
</div>
    </Router>
  )
}

export default App
 