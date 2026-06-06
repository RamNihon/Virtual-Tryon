import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { seller, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (location.pathname.startsWith('/shop/')) {
    return null
  }
   if (location.pathname.startsWith('/order/')) {
    return null
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-purple-700 text-white px-4 py-3">
      <div className="max-w-6xl mx-auto flex 
                      justify-between items-center">
        
        {/* Logo */}
        <Link to="/" 
          className="text-lg font-bold whitespace-nowrap">
          👗 VirtualTryOn
        </Link>

        {/* Buttons */}
        <div className="flex gap-2 items-center">
          {seller ? (
            <>
              {/* Mobile par naam mat dikhao */}
              <span className="text-sm hidden lg:block
                               truncate max-w-32">
                👋Hi, {seller.name}!
              </span>
              <Link to="/dashboard"
                className="bg-white text-purple-700
                           px-3 py-1.5 rounded-full
                           font-semibold text-sm
                           whitespace-nowrap">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="bg-purple-500 px-3 py-1.5
                           rounded-full text-sm
                           whitespace-nowrap">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                className="text-white text-sm
                           whitespace-nowrap">
                Login
              </Link>
              <Link to="/register"
                className="bg-white text-purple-700
                           px-3 py-1.5 rounded-full
                           font-semibold text-sm
                           whitespace-nowrap">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}