import { useState, useEffect, useCallback, useRef } from "react";

// ─── Global speak function (animation ke liye) ──
let globalSpeak = null;

export const speakText = (text, lang = "en") => {
  if (globalSpeak) globalSpeak(text, lang);
};

export default function VoiceAssistant({
  pageType = "shop",
  shopName = "",
  language = "hi",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLang, setSelectedLang] = useState(language);
  const [supported, setSupported] = useState(true);
  const voiceRef = useRef(null);
  const [isVoiceTranslucent, setIsVoiceTranslucent] = useState(false);
  const voiceFadeTimerRef = useRef(null);

  // Auto-fade after 6 seconds of no interaction
  const resetVoiceTimer = () => {
    clearTimeout(voiceFadeTimerRef.current);
    setIsVoiceTranslucent(false);
    voiceFadeTimerRef.current = setTimeout(() => {
      // यहाँ isOpen वॉयस असिस्टेंट का पॉपअप स्टेट है
      if (!isOpen) setIsVoiceTranslucent(true);
    }, 6000);
  };
  useEffect(() => {
    resetVoiceTimer();
    return () => {
      clearTimeout(voiceFadeTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // claude wala code, upar google ne banaya hai tooltip and translucent effect
  useEffect(() => {
    if (!window.speechSynthesis) {
      setSupported(false);
      return;
    }

    const loadVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;

      // Hindi voices - female priority, fir koi bhi Hindi
      const hindiVoices = voices.filter((v) => v.lang === "hi-IN");
      const hiFemale =
        hindiVoices.find(
          (v) =>
            v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("woman") ||
            v.name.toLowerCase().includes("lekha") ||
            v.name.toLowerCase().includes("kalpana") ||
            v.name.toLowerCase().includes("heera") ||
            v.name.toLowerCase().includes("riya") ||
            v.name.toLowerCase().includes("swara"),
        ) ||
        hindiVoices[0] ||
        null;

      // English voices - female priority, fir koi bhi English
      const enVoices = voices.filter(
        (v) => v.lang === "en-IN" || v.lang === "en-US" || v.lang === "en-GB",
      );
      const enFemale =
        enVoices.find(
          (v) =>
            v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("zira") ||
            v.name.toLowerCase().includes("samantha") ||
            v.name.toLowerCase().includes("victoria") ||
            v.name.toLowerCase().includes("karen") ||
            v.name.toLowerCase().includes("moira") ||
            v.name.toLowerCase().includes("aria"),
        ) ||
        enVoices[0] ||
        null;

      voiceRef.current = {
        hi: hiFemale,
        en: enFemale,
        hasHindi: hindiVoices.length > 0,
      };

      console.log("Voice loaded:", {
        hindi: hiFemale?.name || "Not available",
        english: enFemale?.name || "Not available",
        totalVoices: voices.length,
      });
    };

    loadVoice();
    window.speechSynthesis.onvoiceschanged = loadVoice;

    // Kuch browsers mein voices load hone mein time lagta hai
    setTimeout(loadVoice, 500);
  }, []);

  // ─── Speak Function ─────────────────────
  const speak = useCallback(
    (text, lang) => {
      if (!window.speechSynthesis) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const useLang = lang || selectedLang;

      // Agar Hindi select hai but browser mein Hindi voice nahi hai,
      // to bhi hi-IN try karo (kuch browsers system se bol dete hain)
      utterance.lang = useLang === "hi" ? "hi-IN" : "en-US";
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const selectedVoice = voiceRef.current?.[useLang];
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);

      // Agar Hindi mein koi voice hi nahi mili browser mein
      if (useLang === "hi" && !voiceRef.current?.hasHindi) {
        console.log(
          "⚠️ Is browser mein Hindi voice nahi mili, English mein voice assistant use karen",
        );
      }
    },
    [selectedLang],
  );

  // Global speak set karo
  useEffect(() => {
    globalSpeak = speak;
    return () => {
      globalSpeak = null;
    };
  }, [speak]);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // ─── Scripts ────────────────────────────
  const scripts = {
    shop: {
      hi: {
        welcome: `नमस्ते! ${shopName ? shopName + " की" : "इस"} वर्चुअल ट्राई-ऑन शॉप में आपका स्वागत है। यहाँ आप घर बैठे कपड़े ट्राई कर सकते हैं!`,
        howToUse: `इस शॉप को इस्तेमाल करना बहुत आसान है। 
          पहले किसी भी कपड़े पर क्लिक करें। 
          फिर ट्राई ऑन करो बटन दबाएं। 
          अपनी सीधी खड़ी फोटो अपलोड करें। 
          और देखें कपड़ा आप पर कैसा लगेगा!`,
        tips: `बेहतर रिजल्ट के लिए: 
          सीधे खड़े होकर फोटो लें। 
          चेहरा साफ दिखना चाहिए। 
          अच्छी रोशनी में फोटो लें।`,
        order: `ऑर्डर करने के लिए दो तरीके हैं: 
          पहला - ट्राई ऑन के बाद हरा व्हाट्सएप बटन दबाएं, 
          सीधे दुकानदार से बात होगी। 
          दूसरा - "ऑर्डर नाउ" बटन दबाएं, 
          अपना पता भरें, और पेमेंट करें। 
          अपने अकाउंट में जाकर ऑर्डर का स्टेटस भी देख सकते हैं!`,
      },
      en: {
        welcome: `Welcome to ${shopName || "this"} Virtual Try-On Shop! Try clothes from home!`,
        howToUse: `Click on any product. Press Try On button. Upload your straight-facing photo. And see how it looks on you!`,
        tips: `For better results: Stand straight. Face clearly visible. Good lighting. Full body in frame.`,
        order: `There are two ways to order: First - press the green WhatsApp button after trying on, to talk directly with the seller. Second - press the Order Now button, fill your address, and make payment. You can also check your order status in your account!`,
      },
    },
    fabric: {
      hi: {
        welcome: `नमस्ते! ${shopName ? shopName + " के" : "इस"} फैब्रिक शॉप में आपका स्वागत है! यहाँ कपड़े से सिला हुआ कपड़ा देखें!`,
        howToUse: `फैब्रिक शॉप इस्तेमाल करना बहुत आसान है। 
          पहले कोई फैब्रिक चुनें। 
          फिर गारमेंट टाइप सेलेक्ट करें जैसे शर्ट या कुर्ता। 
          एआई उस कपड़े से गारमेंट बना देगी। 
          फिर अपनी फोटो डालें और ट्राई ऑन करें!`,
        tips: `बेहतर रिजल्ट के लिए: 
          फैब्रिक की फ्लैट फोटो अपलोड करें। 
          फोटो में कपड़े का रंग और डिजाइन साफ दिखे। 
          अपनी सीधी खड़ी फोटो डालें।`,
        order: `ऑर्डर करने के लिए: 
          ट्राई ऑन के बाद व्हाट्सएप बटन दबाएं। 
          दुकानदार आपके माप के अनुसार कपड़ा सिलेगा!`,
      },
      en: {
        welcome: `Welcome to ${shopName || "this"} Fabric Shop! See how unstitched fabric looks stitched!`,
        howToUse: `Select a fabric. Choose garment type like shirt or kurta. AI will stitch it. Then upload your photo and try it on!`,
        tips: `For better results: Upload flat fabric photo. Color and design should be clear. Upload straight-facing photo.`,
        order: `To order: After trying on, press WhatsApp button. Seller will stitch it to your measurements!`,
      },
    },
    home: {
      hi: {
        welcome: `नमस्ते! हमारे एडवांस AI वर्चुअल ट्राई-ऑन प्लेटफॉर्म पर आपका स्वागत है! मर्चेंट डैशबोर्ड पर आने के लिए धन्यवाद।`,

        howToUse: `यह प्लेटफॉर्म विशेष रूप से गारमेंट और फैशन मर्चेंट्स के लिए डिज़ाइन किया गया है। 
      सबसे पहले 'रजिस्टर' विकल्प पर जाकर अपना डिजिटल स्टोर/शॉप सेटअप करें। 
      इसके बाद अपने प्रोडक्ट्स या कैटलॉग को अपलोड करें, 
      और तुरंत अपने ग्राहकों को लाइव वर्चुअल ट्राई-ऑन का एक प्रीमियम अनुभव प्रदान करें!`,

        tips: `हमारे प्लेटफॉर्म की प्रमुख विशेषताएं: 
      पहला: अत्याधुनिक एआई-पावर्ड वर्चुअल ट्राई-ऑन टेक्नोलॉजी। 
      दूसरा: इनोवेटिव फैब्रिक-टू-गारमेंट कस्टमाइजेशन की सुविधा। 
      तीसरा: बिना किसी वेबसाइट या कोडिंग के अपना खुद का प्रोफेशनल ई-कॉमर्स स्टोर संचालित करने की आज़ादी!`,

        order: `शुरुआत करने की प्रक्रिया बेहद आसान है: 
      बस स्क्रीन पर दिख रहे 'रजिस्टर' या 'गेट स्टार्टेड' बटन पर क्लिक करें। 
      बिना किसी छुपे हुए शुल्क के, आज ही अपना बिजनेस ऑनलाइन शुरू करें!`,
      },
      en: {
        welcome: `Hello and welcome to the next-generation AI Virtual Try-On Platform! Thank you for choosing us to power your digital fashion journey.`,

        howToUse: `This platform is engineered specifically for fashion retailers and clothing apparel brands. 
      Simply register to instantly create and configure your custom digital storefront. 
      Once set up, upload your product catalog, 
      and seamlessly offer your customers a high-end, immersive virtual try-on experience!`,

        tips: `Our Core Tech Value Proposition Includes: 
      First: State-of-the-art AI-powered virtual try-on engine. 
      Second: Innovative fabric-to-garment visual transformation technology. 
      Third: The power to operate a fully functional digital shop without needing a website or any technical expertise!`,

        order: `To launch your storefront right away: 
      Kindly press the 'Register' or 'Get Started' button visible on your screen. 
      Set up your business today and start your journey completely hassel free with zero upfront costs!`,
      },
    },
  };

  const currentScripts =
    scripts[pageType]?.[selectedLang] || scripts.shop[selectedLang];

  // 🛠️ मान लेते हैं कि 'isHomePage' आपकी एक स्टेट या वेरिएबल है जो बताती है कि यूजर होम पर है।
  // अगर आपके पास ऐसी स्टेट नहीं है, तो आप 'window.location.pathname === "/"' का भी इस्तेमाल कर सकते हैं।
  const isHome =
    typeof window !== "undefined" && window.location.pathname === "/";

  const buttons = [
    {
      key: "welcome",
      icon: "👋",
      label: selectedLang === "hi" ? "आपका स्वागत  है" : "Welcome",
      color:
        "bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-500 shadow-lg shadow-purple-500/20",
    },
    {
      key: "howToUse",
      icon: "📖",
      // 💡 डायनामिक कंडीशन: अगर होम पेज है तो 'What We Do' दिखाओ, बाकी जगह 'User Guide'
      label: isHome
        ? selectedLang === "hi"
          ? "हम क्या करते हैं"
          : "What We Do"
        : selectedLang === "hi"
          ? "उपयोग करने की विधि"
          : "How to Use",
      color:
        "bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/20",
    },
    {
      key: "tips",
      icon: "💡",
      // 💡 डायनामिक कंडीशन: अगर होम पेज है तो 'Our Features' दिखाओ, बाकी जगह 'AI Tips'
      label: isHome
        ? selectedLang === "hi"
          ? "हमारी खास बातें"
          : "Our Features"
        : selectedLang === "hi"
          ? "एआई प्रो टिप्स"
          : "AI Optimization Tips",
      color:
        "bg-gradient-to-tr from-emerald-600 via-teal-500 to-green-400 shadow-lg shadow-teal-500/20",
    },
    {
      key: "order",
      icon: "🛒",
      // 💡 डायनामिक कंडीशन: अगर होम पेज है तो 'How to Start' दिखाओ, बाकी जगह 'Order Process'
      label: isHome
        ? selectedLang === "hi"
          ? "शुरू कैसे करें"
          : "How to Start"
        : selectedLang === "hi"
          ? "ऑर्डर प्रक्रिया"
          : "Order Process Guide",
      color:
        "bg-gradient-to-tr from-rose-600 via-orange-500 to-amber-400 shadow-lg shadow-orange-500/20",
    },
  ];

  if (!supported) return null;

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) stopSpeaking();
        }}
        onMouseEnter={() => {
          setIsVoiceTranslucent(false);
          resetVoiceTimer();
        }}
        /* 👈 यहाँ से सॉलिड bg-gradient-to-r को हटाकर कंडीशनल कर दिया है */
        className={`fixed z-50 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-700 ease-out group
       ${
         isSpeaking
           ? "bg-gradient-to-r from-rose-600 via-red-500 to-orange-500 shadow-xl shadow-red-500/40 scale-110 animate-pulse border-2 border-white"
           : isVoiceTranslucent
             ? "text-white shadow-none" // 👈 ट्रांसलूसेंट होने पर सॉलिड कलर्स गायब हो जाएंगे
             : "bg-gradient-to-r from-amber-400 via-emerald-400 to-indigo-500 text-slate-900 border border-white/40 shadow-xl shadow-emerald-400/30 active:scale-95"
       }`}
        style={{
          bottom: "24px",
          right: "8px",
          // 1. ट्रांसलूसेंट होने पर इसकी ओपेसिटी को और कम (0.4) कर दिया ताकि ये पूरी तरह शांत दिखे
          opacity: isVoiceTranslucent ? 0.5 : 1,
          transform: isSpeaking
            ? "scale(1.1)"
            : isVoiceTranslucent
              ? "scale(0.9)"
              : "scale(1)",
          // 2. ⚡ असली फिक्स: ट्रांसलूसेंट स्टेट में बैकग्राउंड को एकदम हल्का पारदर्शी ग्लास लुक दे दिया
          background: isVoiceTranslucent
            ? "rgba(16, 185, 129, 0.4)" // हल्का सा एमराल्ड/ग्रीन टिंटेड पारदर्शी लुक
            : undefined,
          backdropFilter: isVoiceTranslucent ? "blur(8px)" : "none",
          border: isVoiceTranslucent
            ? "1px solid rgba(255, 255, 255, 0.2)"
            : undefined,
        }}
      >
        {isSpeaking ? (
          /* 🔊 साउंडवेव एनिमेशन */
          <div className="flex items-center gap-[3px] justify-center h-5">
            <div className="w-[3px] h-3 bg-white rounded-full animate-bounce [animation-duration:0.6s]" />
            <div className="w-[3px] h-5 bg-white rounded-full animate-bounce [animation-duration:0.4s] [animation-delay:0.15s]" />
            <div className="w-[3px] h-4 bg-white rounded-full animate-bounce [animation-duration:0.5s] [animation-delay:0.3s]" />
            <div className="w-[3px] h-2 bg-white rounded-full animate-bounce [animation-duration:0.7s] [animation-delay:0.1s]" />
          </div>
        ) : (
          /* 🎙️ माइक्रोफ़ोन विज़ुअल */
          <div className="relative w-full h-full flex items-center justify-center">
            {!isVoiceTranslucent && (
              <div className="absolute inset-1 bg-white/20 rounded-full backdrop-blur-sm mix-blend-overlay animate-ping [animation-duration:3s]" />
            )}
            <svg
              xmlns="http://w3.org"
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              /* 👈 आइकॉन का रंग भी कंडीशनल कर दिया ताकि ट्रांसलूसेंट में सफेद दिखे और एक्टिव में डार्क */
              className={`relative z-10 drop-shadow-sm transition-all duration-500 ${isVoiceTranslucent ? "text-emerald-400 opacity-60" : "text-slate-950 group-hover:scale-110"}`}
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          </div>
        )}

        {/* 🏷️ टूलटिप */}
        {!isVoiceTranslucent && (
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 pointer-events-none flex items-center">
            <div className="whitespace-nowrap rounded-xl bg-slate-900/95 backdrop-blur-md px-3.5 py-2 text-white text-xs font-bold tracking-wide shadow-xl border border-slate-800">
              AI Voice Assistant
            </div>
            <div className="w-2 h-2 bg-slate-900/95 border-r border-t border-slate-800 rotate-45 -ml-1" />
          </div>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          className="fixed bottom-36 right-4 z-50
                        w-72 bg-white rounded-3xl
                        shadow-2xl border border-gray-100
                        overflow-hidden"
        >
          {/* Header */}
          <div
            className="bg-gradient-to-r from-purple-600
                          to-indigo-600 p-4"
          >
            <div
              className="flex justify-between
                            items-center mb-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎙️</span>
                <div>
                  <p className="text-white font-bold text-sm">
                    {selectedLang === "hi"
                      ? "Voice Assistant"
                      : "Voice Assistant"}
                  </p>
                  {isSpeaking && (
                    <p
                      className="text-purple-200 text-xs
                                  animate-pulse"
                    >
                      {selectedLang === "hi"
                        ? "🔊 बोल रही है..."
                        : "🔊 Speaking..."}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  stopSpeaking();
                }}
                className="w-7 h-7 bg-white bg-opacity-20
                           rounded-full flex items-center
                           justify-center text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Language Toggle */}
            <div
              className="flex bg-white bg-opacity-20
                            rounded-xl p-1"
            >
              {["hi", "en"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setSelectedLang(lang);
                    stopSpeaking();
                  }}
                  className={`flex-1 py-1.5 rounded-lg
                             text-xs font-bold transition
                             ${
                               selectedLang === lang
                                 ? "bg-white text-purple-700"
                                 : "text-white"
                             }`}
                >
                  {lang === "hi" ? "🇮🇳 हिंदी" : "🇬🇧 English"}
                </button>
              ))}
            </div>

            {selectedLang === "hi" &&
              voiceRef.current &&
              !voiceRef.current.hasHindi && (
                <p className="text-yellow-300 text-xs mt-2 text-center">
                  <span className="text-base">⚠️</span> Is browser mein Hindi
                  voice available nahi hai. Chrome try karein behtar result ke
                  liye . Ya⟶ English language use karen.
                </p>
              )}
          </div>

          {/* Buttons */}
          <div className="p-3 space-y-2">
            {buttons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => speak(currentScripts[btn.key])}
                className={`w-full ${btn.color} text-white
                           px-4 py-3 rounded-2xl text-sm
                           font-semibold hover:opacity-90
                           transition flex items-center gap-3
                           text-left`}
              >
                <span className="text-lg flex-shrink-0">{btn.icon}</span>
                <span>{btn.label}</span>
              </button>
            ))}

            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="w-full bg-gray-200/80 hover:bg-gradient-to-r hover:from-rose-600 hover:via-red-400 hover:to-orange-400 
             text-gray-700 hover:text-white px-5 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest
             border border-gray-400/50 hover:border-transparent shadow-sm hover:shadow-xl hover:shadow-red-500/20 
             hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer 
             flex items-center justify-center gap-2.5 group relative overflow-hidden"
              >
                <div className="relative flex items-center justify-center w-4 h-4">
                  <div className="absolute w-3 h-3 bg-red-500 group-hover:bg-white rounded-sm animate-ping opacity-0 group-hover:opacity-70 [animation-duration:1.5s] transition-all" />

                  <div className="w-2.5 h-2.5 bg-gray-700 group-hover:bg-white rounded-[3px] relative z-10 group-hover:scale-90 transition-all duration-200" />
                </div>

                <span className="relative z-10 font-black tracking-widest transition-all">
                  {selectedLang === "hi" ? "आवाज़ रोकें" : "Stop Assistant"}
                </span>
              </button>
            )}
          </div>

          <div className="px-4 pb-3 text-center">
            <p className="text-xs text-gray-400">
              {selectedLang === "hi"
                ? "🔊 वॉल्यूम ऑन रखें"
                : "🔊 Keep volume on"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
