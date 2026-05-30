import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import API_URL from '../api'

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      setError('Sab fields bharo!')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await axios.post(
        `${API_URL}/api/seller/register`,
        form
      )

      if (res.data.success) {
        const loginRes = await axios.post(
          `${API_URL}/api/seller/login`,
          {
            email: form.email,
            password: form.password
          }
        )
        login(loginRes.data.seller, loginRes.data.token)
        navigate('/dashboard')
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Error !')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-purple-50
                    flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm
                      p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center
                       text-purple-700 mb-6">
          👗 Register Now
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600
                          p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Your Shop Name"
            value={form.name}
            onChange={e => setForm({
              ...form, name: e.target.value
            })}
            className="w-full border border-gray-300
                       rounded-lg px-4 py-3
                       focus:outline-none
                       focus:border-purple-500"
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({
              ...form, email: e.target.value
            })}
            className="w-full border border-gray-300
                       rounded-lg px-4 py-3
                       focus:outline-none
                       focus:border-purple-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({
              ...form, password: e.target.value
            })}
            className="w-full border border-gray-300
                       rounded-lg px-4 py-3
                       focus:outline-none
                       focus:border-purple-500"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-purple-700 text-white
                       py-3 rounded-full font-semibold
                       hover:bg-purple-800 transition
                       disabled:opacity-50">
            {loading
              ? '⏳ Loading...'
              : '🚀 Register Now'
            }
          </button>
        </div>

        <p className="text-center text-sm
                      text-gray-500 mt-6">
          Already have a account?{' '}
          <Link to="/login"
            className="text-purple-700 font-semibold">
            Login Now
          </Link>
        </p>
      </div>
    </div>
  )
}