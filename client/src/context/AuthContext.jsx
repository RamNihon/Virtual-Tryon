import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [seller, setSeller] = useState(
    JSON.parse(localStorage.getItem('seller')) || null
  )
  const [token, setToken] = useState(
    localStorage.getItem('token') || null
  )

  const login = (sellerData, tokenData) => {
    setSeller(sellerData)
    setToken(tokenData)
    localStorage.setItem('seller', JSON.stringify(sellerData))
    localStorage.setItem('token', tokenData)
  }

  const logout = () => {
    setSeller(null)
    setToken(null)
    localStorage.removeItem('seller')
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ seller, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)