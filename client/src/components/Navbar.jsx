import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { seller, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation();

 if (location.pathname.startsWith('/shop/')) {
    return null
  }


  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-purple-700 text-white 
                    px-6 py-4 flex justify-between 
                    items-center">
      <Link to="/" className="text-xl font-bold">
        👗 VirtualTryOn
      </Link>

      <div className="flex gap-4 items-center">
        {seller ? (
          <>
            <span className="text-sm">
              Hi, {seller.name}! 👋
            </span>
            <Link
              to="/dashboard"
              className="bg-white text-purple-700
                         px-4 py-2 rounded-full
                         font-semibold text-sm">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-purple-500 px-4 py-2
                         rounded-full text-sm">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login"
              className="text-white text-sm">
              Login
            </Link>
            <Link to="/register"
              className="bg-white text-purple-700
                         px-4 py-2 rounded-full
                         font-semibold text-sm">
              Register
            </Link>
          </>
        )}
        <hr></hr>
      </div>
    </nav>
  )
}