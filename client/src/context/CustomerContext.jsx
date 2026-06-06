import { createContext, useContext, useState } from 'react'

const CustomerContext = createContext()

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(
    JSON.parse(localStorage.getItem('customer')) || null
  )
  const [customerToken, setCustomerToken] = useState(
    localStorage.getItem('customerToken') || null
  )

  const loginCustomer = (customerData, token) => {
    setCustomer(customerData)
    setCustomerToken(token)
    localStorage.setItem(
      'customer', JSON.stringify(customerData)
    )
    localStorage.setItem('customerToken', token)
  }

  const logoutCustomer = () => {
    setCustomer(null)
    setCustomerToken(null)
    localStorage.removeItem('customer')
    localStorage.removeItem('customerToken')
  }

  return (
    <CustomerContext.Provider value={{
      customer,
      customerToken,
      loginCustomer,
      logoutCustomer
    }}>
      {children}
    </CustomerContext.Provider>
  )
}

export const useCustomer = () => useContext(CustomerContext)