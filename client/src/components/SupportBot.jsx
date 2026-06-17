import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import API_URL from '../api'

export default function SupportBot() {
  const { seller, token } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [chatId, setChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [escalated, setEscalated] = useState(false)
  const [escalating, setEscalating] = useState(false)
  const [showEscalate, setShowEscalate] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Body scroll lock jab chat khuli ho
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const startChat = async () => {
    if (chatId) return
    try {
      const res = await axios.post(
        `${API_URL}/api/support/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setChatId(res.data.chat._id)
      setMessages(res.data.chat.messages)
    } catch (e) {
      console.log(e)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput('')
    setLoading(true)

    setMessages(prev => [
      ...prev,
      { role: 'user', text: userMsg, time: new Date() }
    ])

    try {
      const res = await axios.post(
        `${API_URL}/api/support/message`,
        { chatId, message: userMsg },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessages(res.data.messages)

      // 2 unsolved message ke baad exclate button dikhayen
      const userMsgs = res.data.messages
        .filter(m => m.role === 'user').length
      if (userMsgs >= 2) setShowEscalate(true)

    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  const handleEscalate = async () => {
    if (escalating || escalated) return
    setEscalating(true)
    try {
      await axios.post(
        `${API_URL}/api/support/escalate`,
        {
          chatId,
          issue: messages
            .filter(m => m.role === 'user')
            .map(m => m.text)
            .join(', ')
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setEscalated(true)
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          text: '✅ Developer ko notify kar diya hai ! Aapko jald hi email milega.',
          time: new Date()
        }
      ])
    } catch (e) {
      console.log(e)
      alert('Error aaya, dobara try karen!')
    } finally {
      setEscalating(false)
    }
  }

  if (!seller || !token) return null

  return (
    <>
      {/* Backdrop - jab open hota hai, dashboard click block */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30
                     z-40 backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Button */}
      <button
        onClick={() => {
          const next = !isOpen
          setIsOpen(next)
          if (next && !chatId) startChat()
        }}
        className={`fixed bottom-5 right-5 z-50
                   w-16 h-16 rounded-full shadow-2xl
                   flex items-center justify-center
                   text-white transition-all duration-500
                   ${isOpen
                     ? 'bg-red-500 rotate-[360deg] scale-105'
                     : 'bg-gradient-to-br from-green-500 to-emerald-600 hover:scale-110'
                   }`}
        style={{
          boxShadow: isOpen
            ? '0 8px 30px rgba(239,68,68,0.5)'
            : '0 8px 30px rgba(16,185,129,0.5)'
        }}>
        {isOpen ? (
          <span className="text-2xl font-light">✕</span>
        ) : (
          <div className="relative">
            <span className="text-2xl">🤖</span>
            <span className="absolute -top-1 -right-1 w-3 h-3
                             bg-yellow-300 rounded-full
                             animate-ping"/>
            <span className="absolute -top-1 -right-1 w-3 h-3
                             bg-yellow-400 rounded-full"/>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
     <div
  className="fixed bottom-24 z-50 bg-white rounded-[28px] overflow-hidden flex flex-col 
             animate-[slideUp_0.3s_ease-out] border border-gray-100/90
             right-4 left-4 sm:left-auto sm:right-5 w-auto sm:w-[920px]"
  style={{
    height: '690px',
    maxHeight: 'calc(100vh - 140px)',
    boxShadow: '0 25px 70px rgba(0,0,0,0.22)'
  }}
>


          {/* Header */}
          <div className="bg-gradient-to-r from-green-500
                          via-emerald-500 to-teal-600
                          p-4 flex-shrink-0 relative
                          overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute -top-6 -right-6 w-24 h-24
                            bg-white opacity-10 rounded-full"/>
            <div className="absolute -bottom-8 -left-4 w-20 h-20
                            bg-white opacity-10 rounded-full"/>

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-11 h-11 bg-white bg-opacity-20
                              rounded-2xl flex items-center
                              justify-center text-2xl
                              backdrop-blur-sm border
                              border-white border-opacity-30">
                🤖
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">
                  Support Assistant
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-300
                                   rounded-full animate-pulse"/>
                  <p className="text-green-50 text-xs">
                    Online · Always Available
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white
                           bg-opacity-15 flex items-center
                           justify-center text-white text-sm
                           hover:bg-opacity-25 transition">
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3
                          bg-gradient-to-b from-gray-50 to-white">
            {messages.map((msg, i) => (
              <div key={i}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}>
                {msg.role !== 'user' && (
                  <div className="w-8 h-8 rounded-full
                                  bg-gradient-to-br from-green-400
                                  to-emerald-600 flex items-center
                                  justify-center text-sm mr-2
                                  flex-shrink-0 mt-1 shadow-sm">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl
                             text-sm leading-relaxed whitespace-pre-wrap
                             shadow-sm
                             ${msg.role === 'user'
                               ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-br-md'
                               : 'bg-white text-gray-700 rounded-bl-md border border-gray-100'
                             }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full
                                bg-gradient-to-br from-green-400
                                to-emerald-600 flex items-center
                                justify-center text-sm mr-2 mt-1">
                  🤖
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl
                                shadow-sm rounded-bl-md
                                border border-gray-100">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i}
                        className="w-2 h-2 bg-emerald-400
                                   rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}/>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef}/>
          </div>

          {/* Escalate Option */}
          {showEscalate && !escalated && (
            <div className="px-4 py-3 bg-orange-50
                            border-t border-orange-100
                            flex-shrink-0">
              <p className="text-orange-700 text-xs mb-2 font-medium">
                😕 Problem solve nahi hui?
              </p>
              <button
                onClick={handleEscalate}
                disabled={escalating}
                className="w-full bg-gradient-to-r from-orange-500
                           to-amber-500 text-white py-2.5
                           rounded-xl text-xs font-bold
                           hover:opacity-90 transition
                           disabled:opacity-50
                           flex items-center justify-center gap-2">
                {escalating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2
                                     border-white border-t-transparent
                                     rounded-full animate-spin"/>
                    Email bheji ja rahi hai...
                  </>
                ) : (
                  <>👨‍💻 Talk to Developer</>
                )}
              </button>
            </div>
          )}

          {escalated && (
            <div className="px-4 py-3 bg-green-50
                            border-t border-green-100
                            flex-shrink-0 text-center">
              <p className="text-green-700 text-xs font-medium">
                ✅ The developer has been notified!
                Please keep checking your email, Our team will reach out to you soon. 📧
              </p>
            </div>
          )}

          {/* Input */}
          {!escalated && (
            <div className="p-3 border-t bg-white flex-shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter') sendMessage()
                  }}
                  placeholder="Apni problem likhiye..."
                  className="flex-1 border border-gray-200
                             rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none
                             focus:border-green-400
                             focus:ring-2 focus:ring-green-100"/>
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-br from-green-500
                             to-emerald-600 text-white
                             w-11 h-11 rounded-xl flex
                             items-center justify-center
                             hover:opacity-90 transition
                             disabled:opacity-40 flex-shrink-0
                             shadow-md">
                  ➤
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}