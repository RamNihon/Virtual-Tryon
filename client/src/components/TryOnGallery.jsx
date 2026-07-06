import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import API_URL from '../api'

// ─── Detail Modal ─────────────────────────
function GalleryDetailModal({ item, onClose }) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const response = await fetch(item.resultImage)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tryon-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.log('Download error:', e)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center
                 justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.92)' }}>

      {/* Close - fixed top so mobile address bar
          nahi chhupata */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[100000]
                   w-11 h-11 rounded-full flex items-center
                   justify-center text-white font-bold text-lg
                   shadow-2xl transition-all hover:scale-110"
        style={{
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          boxShadow: '0 4px 20px rgba(239,68,68,0.5)'
        }}>
        ✕
      </button>

      <div className="w-full max-w-sm mx-auto pt-10">

        {/* Result Image - Main */}
        <div className="relative rounded-3xl overflow-hidden
                        shadow-2xl mb-4 "
          style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
                     <a
               href={item.resultImage} 
    // target="_blank" 
    rel="noreferrer"
    className="block w-full h-full cursor-zoom-in flex items-center justify-center"
    title="Click to view full image"
  >
          <img
            src={item.resultImage}
            alt="Try-on result"
            className="w-full h-full object-cover object-top"
            style={{ maxHeight: '60vh' }}
          />
</a>
          {/* Gradient overlay bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-16"
            style={{
              background: 'linear-gradient(transparent, rgba(0,0,0,0.6))'
            }}/>

          {/* Date badge */}
          <div className="absolute top-3 left-3
                          rounded-full px-3 py-1 text-xs
                          text-white font-medium"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
            {new Date(item.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short'
            })}
          </div>
        </div>

        {/* Input details - compact card */}
        <div className="rounded-2xl p-4 mb-4"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
          <p className="text-white text-xs font-bold uppercase
                        tracking-widest mb-3 opacity-60">
            Try-On Details
          </p>

          <div className="flex gap-3 items-center">
            {/* Garment thumbnail */}
            {item.garmentImage && (
              <div className="flex-shrink-0">
                <p className="text-white text-xs opacity-50 mb-1
                              text-center">Garment</p>
                <div className="w-16 h-20 rounded-xl overflow-hidden
                                border border-white border-opacity-20">
                  <img src={item.garmentImage}
                    alt="Garment"
                    className="w-full h-full object-contain"/>
                </div>
              </div>
            )}

            {/* Your photo thumbnail */}
            {item.humanImage && (
              <div className="flex-shrink-0">
                <p className="text-white text-xs opacity-50 mb-1
                              text-center">Your Photo</p>
                <div className="w-16 h-20 rounded-xl overflow-hidden
                                border border-white border-opacity-20">
                  <img src={item.humanImage}
                    alt="User Preview"
                    className="w-full h-full object-contain"/>
                </div>
              </div>
            )}

            {/* Product info */}
            <div className="flex-1 min-w-0">
              {item.productName && (
                <p className="text-white text-sm font-bold
                              truncate mb-1">
                  {item.productName}
                </p>
              )}
              <p className="text-white text-xs opacity-50 capitalize">
                {item.category?.replace('_', ' ') || 'Clothing'}
              </p>
              <div className="mt-2 inline-flex items-center gap-1
                              rounded-full px-2 py-1"
                style={{ background: 'rgba(139,92,246,0.3)' }}>
                <span className="text-purple-300 text-xs">✨ AI Try-On</span>
              </div>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full py-4 rounded-2xl font-bold text-white
                     text-base flex items-center justify-center gap-3
                     transition-all active:scale-95"
          style={{
            background: downloading
              ? 'rgba(139,92,246,0.4)'
              : 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            boxShadow: '0 8px 30px rgba(139,92,246,0.4)'
          }}>
          {downloading ? (
            <>
              <span className="w-5 h-5 border-2 border-white
                               border-t-transparent rounded-full
                               animate-spin"/>
              Downloading...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download Full Quality
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Main Gallery Component ───────────────
export default function TryOnGallery({ shop, apiKey, customerToken,openSignal }) {
  const [isOpen, setIsOpen] = useState(false)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isTranslucent, setIsTranslucent] = useState(false)
  const timerRef = useRef(null)
  const fadeTimerRef = useRef(null)

  // Auto-fade after 6 seconds of no interaction
  const resetFadeTimer = () => {
    clearTimeout(fadeTimerRef.current)
    setIsTranslucent(false)
    fadeTimerRef.current = setTimeout(() => {
      if (!isOpen) setIsTranslucent(true)
    }, 6000)
  }

  useEffect(() => {
    resetFadeTimer()
    return () => {
      clearTimeout(fadeTimerRef.current)
      // eslint-disable-next-line
      clearTimeout(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

   // ✅ Navbar se "My Try-Ons" click hone par gallery kholne ke liye
  useEffect(() => {
    if (openSignal) {
      handleOpen()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSignal])

const fetchGallery = async () => {
    if (!apiKey || !customerToken) return   // ✅ Token nahi to fetch mat karo
    setLoading(true)
    try {
      const res = await axios.get(
        `${API_URL}/api/tryon/gallery`,
        {
          headers: {
            'x-api-key': apiKey,
            'Authorization': `Bearer ${customerToken}`,  // ✅ Customer auth
          }
        }
      )
      setHistory(res.data.history || [])
    } catch (e) {
      console.log('Gallery fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
    setIsTranslucent(false)
    clearTimeout(fadeTimerRef.current)
    fetchGallery()
    // Body scroll lock
    document.body.style.overflow = 'hidden'
  }

  const handleClose = () => {
    setIsOpen(false)
    setSelectedItem(null)
    document.body.style.overflow = ''
    resetFadeTimer()
  }

  return (
    <>
      {/* Floating Gallery Button */}
      <button
  onClick={handleOpen}
  onMouseEnter={() => {
    setIsTranslucent(false);
    resetFadeTimer();
  }}
  className="fixed transition-all duration-700 ease-out group"
  style={{
    bottom: '90px', 
    right: '8px', // 👈 वॉइस बटन के साथ सटीक वर्टिकल अलाइनमेंट के लिए 16px से बढ़ाकर 20px किया
    zIndex: 9999,
    // ट्रांसपेरेंसी को थोड़ा और कम (यानी बटन को थोड़ा और साफ़ दिखाने) के लिए opacity को 0.5 से बढ़ाकर 0.65 किया
    opacity: isTranslucent ? 0.65 : 1, 
    transform: isTranslucent ? 'scale(0.92)' : 'scale(1)'
  }}
>
  {/* अल्ट्रा-एडवांस ग्लो इफ़ेक्ट */}
  {!isTranslucent && (
    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse -z-10" />
  )}

  <div
    className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl relative transition-all duration-500"
    style={{
      // ट्रांसलूसेंट स्टेट में बैकग्राउंड को थोड़ा और गाढ़ा किया ताकि आइकॉन साफ़ दिखे
      background: isTranslucent
        ? 'rgba(99, 102, 241, 0.40)' 
        : 'linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)',
      backdropFilter: 'blur(10px)',
      border: isTranslucent ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: isTranslucent
        ? '0 4px 15px rgba(0, 0, 0, 0.1)'
        : '0 12px 30px rgba(139, 92, 246, 0.4)'
    }}
  >
    {/* Gallery SVG icon */}
    <svg 
      className={`w-6 h-6 transition-transform duration-500 ${!isTranslucent ? 'group-hover:scale-110 group-hover:rotate-6' : 'opacity-85'}`}
      viewBox="0 0 24 24"
      fill="none" 
      stroke="white" 
      strokeWidth="2.5"
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>

    {/* Count badge */}
    {history.length > 0 && !isTranslucent && (
      <div className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center text-white text-[10px] font-black tracking-tighter border-2 border-white"
        style={{
          background: 'linear-gradient(135deg, #FF007A, #FF4500)',
          boxShadow: '0 4px 10px rgba(255,0,122,0.4)'
        }}
      >
        {history.length > 9 ? '9+' : history.length}
      </div>
    )}
  </div>

  {/* शत-प्रतिशत फिक्स्ड टूलटिप: अब यह हमेशा बटन के बाईं तरफ (Left Side) ही खुलेगा */}
  {!isTranslucent && (
    <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 pointer-events-none flex items-center structure-left">
      <div className="whitespace-nowrap rounded-xl bg-slate-900/95 backdrop-blur-md px-3.5 py-2 text-white text-xs font-bold tracking-wide shadow-xl border border-slate-800">
        Try-On Gallery
      </div>
      {/* टूलटिप का तीर - अब यह टेक्स्ट के बाद आकर बटन की तरफ इशारा करेगा */}
      <div className="w-2 h-2 bg-slate-900/95 border-r border-t border-slate-800 rotate-45 -ml-1" />
    </div>
  )}
</button>


      {/* Gallery Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-[9998]"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={handleClose}>

          <div
            className="absolute bottom-0 left-0 right-0
                       rounded-t-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #0f0c29 0%, #1a1040 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              maxHeight: '85vh',
              boxShadow: '0 -20px 60px rgba(0,0,0,0.5)'
            }}
            onClick={e => e.stopPropagation()}>

            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.2)' }}/>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between
                            px-5 py-4">
              <div>
                <h2 className="text-white font-black text-xl">
                  ✨ My Try-On Gallery
                </h2>
                <p className="text-purple-300 text-xs mt-0.5">
                  {history.length} try-ons saved
                </p>
              </div>

              {/* Close button - inside panel, not hidden */}
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-full flex items-center
                           justify-center text-white font-bold
                           transition-all hover:scale-110"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                ✕
              </button>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }}/>

            {/* Content */}
            <div className="overflow-y-auto px-4 py-4"
              style={{ maxHeight: 'calc(85vh - 100px)' }}>

              {loading ? (
                <div className="flex flex-col items-center
                                justify-center py-16">
                  <div className="w-12 h-12 rounded-full border-4
                                  border-purple-500 border-t-transparent
                                  animate-spin mb-4"/>
                  <p className="text-purple-300 text-sm animate-pulse">
                    Gallery load ho rahi hai...
                  </p>
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center
                                justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-3xl flex
                                  items-center justify-center mb-4"
                    style={{ background: 'rgba(139,92,246,0.15)' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24"
                      fill="none" stroke="#8B5CF6" strokeWidth="1.5">
                      <rect x="3" y="3" width="7" height="7" rx="1"/>
                      <rect x="14" y="3" width="7" height="7" rx="1"/>
                      <rect x="3" y="14" width="7" height="7" rx="1"/>
                      <rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                  </div>
                  <p className="text-white font-bold text-lg mb-2">
                    Gallery Empty Hai
                  </p>
                  <p className="text-purple-300 text-sm">
                    Pehle koi try-on karen — apke tryon yahan save rahenge!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {history.map((item, i) => (
                    <button
                      key={item._id || i}
                      onClick={() => setSelectedItem(item)}
                      className="relative rounded-2xl overflow-hidden
                                 group transition-all duration-200
                                 active:scale-95"
                      style={{
                        aspectRatio: '3/4',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: '#1a1a2e'
                      }}>

                      <img
                        src={item.resultImage}
                        alt="Try-on"
                        className="w-full h-full object-cover
                                   group-hover:scale-105 transition-transform
                                   duration-300"/>

                      {/* Overlay */}
                      <div className="absolute inset-0 opacity-0
                                      group-hover:opacity-100 transition-all
                                      flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(rgba(139,92,246,0.3), rgba(0,0,0,0.5))'
                        }}>
                        <div className="rounded-full p-3"
                          style={{ background: 'rgba(255,255,255,0.2)' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24"
                            fill="none" stroke="white" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                          </svg>
                        </div>
                      </div>

                      {/* Date badge */}
                      <div className="absolute bottom-2 left-2 right-2
                                      rounded-lg px-2 py-1"
                        style={{
                          background: 'rgba(0,0,0,0.6)',
                          backdropFilter: 'blur(8px)'
                        }}>
                        <p className="text-white text-xs truncate font-medium">
                          {item.productName ||
                            new Date(item.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short'
                            })
                          }
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <GalleryDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  )
}