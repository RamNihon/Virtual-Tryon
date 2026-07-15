import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API_URL from "../api";

export default function SupportBot() {
  const { seller, token } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [topics, setTopics] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [showEscalate, setShowEscalate] = useState(false);
  const [showTopics, setShowTopics] = useState(true);
  const [showFreeInput, setShowFreeInput] = useState(false);
  const [lastActions, setLastActions] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, lastActions]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const startChat = async () => {
    if (chatId) return;
    try {
      const res = await axios.post(
        `${API_URL}/api/support/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setChatId(res.data.chat._id);
      setMessages(res.data.chat.messages);
      setTopics(res.data.topics || []);
      setShowTopics(true);
    } catch (e) {
      console.log(e);
    }
  };

  const selectTopic = async (topicKey) => {
    setLoading(true);
    setShowTopics(false);
    setLastActions([]);
    try {
      const res = await axios.post(
        `${API_URL}/api/support/select-topic`,
        { chatId, topicKey },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessages(res.data.messages);
      setLastActions(res.data.actions || []);
      setShowFreeInput(!!res.data.showOthersInput);

      if (res.data.followUp === "ask_more" || res.data.followUp === "solved") {
        setShowEscalate(true);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setLoading(true);
    setLastActions([]);

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMsg, time: new Date() },
    ]);

    try {
      const res = await axios.post(
        `${API_URL}/api/support/message`,
        { chatId, message: userMsg },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessages(res.data.messages);
      setLastActions(res.data.actions || []);
      if (res.data.showEscalate) setShowEscalate(true);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (escalating || escalated) return;
    setEscalating(true);
    try {
      await axios.post(
        `${API_URL}/api/support/escalate`,
        {
          chatId,
          issue: messages
            .filter((m) => m.role === "user")
            .map((m) => m.text)
            .join(", "),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setEscalated(true);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "✅ Developer ko notify kar diya gaya hai ! Aapko jald hi email milegi.",
          time: new Date(),
        },
      ]);
    } catch (e) {
      console.log(e);
      alert("Error aaya, dobara try karen!");
    } finally {
      setEscalating(false);
    }
  };

  const handleActionClick = (action) => {
    setIsOpen(false);
    navigate(action.url);
  };

  const resetToTopics = () => {
    setShowTopics(true);
    setShowFreeInput(false);
    setShowEscalate(false);
    setLastActions([]);
    setMessages((prev) => [
      ...prev,
      {
        role: "bot",
        text: "Need help with something else? Please select another topic:",
      },
    ]);
  };

  if (!seller || !token) return null;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30
                     z-40 backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
        />
      )}

      <button
        onClick={() => {
          const next = !isOpen;
          setIsOpen(next);
          if (next && !chatId) startChat();
        }}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-500 shadow-xl group border border-white/20 active:scale-95
    ${
      isOpen
        ? "bg-gradient-to-r from-red-500 to-rose-600 rotate-[360deg] scale-105"
        : "bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 hover:scale-110"
    }`}
        style={{
          boxShadow: isOpen
            ? "0 10px 30px rgba(244, 63, 94, 0.4), inset 0 1.5px 3px rgba(255,255,255,0.25)"
            : "0 12px 35px rgba(99, 102, 241, 0.4), inset 0 1.5px 3px rgba(255,255,255,0.25)",
        }}
      >
        {isOpen ? (
          /* चैट ओपन होने पर: एकदम साफ और मिनिमल क्रॉस */
          <svg
            xmlns="http://w3.org"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          /* चैट क्लोज होने पर: असली रियलिस्टिक एजेंट इमेज (SaaS Standard) */
          <div className="relative w-full h-full flex items-center justify-center p-0.5 overflow-hidden rounded-full">
            {/* इमेज के पीछे का हल्का आंतरिक नियॉन ग्लो इफेक्ट */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-950/40 z-0 pointer-events-none" />

            <img
              src="/support-agent.avif" // public फोल्डर से सीधे लोड होगी
              alt="Support Agent"
              className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-105 z-10"
              onError={(e) => {
                // यदि किसी वजह से इमेज लोड न हो, तो यह बैकअप आइकॉन दिखाएगा (ताकि UI टूटे नहीं)
                e.target.style.display = "none";
              }}
            />
          </div>
        )}
      </button>

      {isOpen && (
        <div
          className="fixed z-50 bg-white rounded-[28px] shadow-2xl border border-gray-100 overflow-hidden flex flex-col
             bottom-4 right-4 left-4 h-[calc(100vh-100px)] max-h-[700px]
             md:bottom-20 md:right-6 md:left-auto md:w-[59rem] md:h-[710px] md:max-h-[calc(100vh-140px)]"
          style={{
            boxShadow: "0 25px 70px rgba(0,0,0,0.3)",
          }}
        >
          {/* Header */}
          <div
            className="bg-gradient-to-r from-green-500
                          via-emerald-500 to-teal-600
                          p-4 flex-shrink-0 relative overflow-hidden"
          >
            <div
              className="absolute -top-6 -right-6 w-24 h-24
                            bg-white opacity-10 rounded-full"
            />
            <div
              className="absolute -bottom-8 -left-4 w-20 h-20
                            bg-white opacity-10 rounded-full"
            />
            <div className="flex items-center gap-3 relative z-10">
              <div
                className="w-11 h-11 bg-white bg-opacity-20
                              rounded-2xl flex items-center
                              justify-center text-2xl backdrop-blur-sm
                              border border-white border-opacity-30"
              >
                🤖
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">
                  Support Assistant
                </p>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 bg-green-300
                                   rounded-full animate-pulse"
                  />
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
                           hover:bg-opacity-25 transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3
                          bg-gradient-to-b from-gray-50 to-white"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role !== "user" && (
                  <div
                    className="w-8 h-8 rounded-full
                                  bg-gradient-to-br from-green-400
                                  to-emerald-600 flex items-center
                                  justify-center text-sm mr-2
                                  flex-shrink-0 mt-1 shadow-sm"
                  >
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl
                             text-sm leading-relaxed whitespace-pre-wrap
                             shadow-sm
                             ${
                               msg.role === "user"
                                 ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-br-md"
                                 : "bg-white text-gray-700 rounded-bl-md border border-gray-100"
                             }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Topic Buttons - radio-button jaisa feel, single-select */}
            {showTopics && topics.length > 0 && !loading && (
              <div className="grid grid-cols-1 gap-2 pt-1">
                {topics.map((topic) => (
                  <button
                    key={topic.key}
                    onClick={() => selectTopic(topic.key)}
                    className="w-full text-left px-4 py-3
                               bg-white border-2 border-green-100
                               rounded-2xl text-sm font-medium
                               text-gray-700 hover:border-green-400
                               hover:bg-green-50 transition-all
                               flex items-center gap-3 group"
                  >
                    <span
                      className="w-5 h-5 rounded-full border-2
                                     border-green-300 flex-shrink-0
                                     group-hover:border-green-500
                                     group-hover:bg-green-500
                                     transition-all relative"
                    >
                      <span
                        className="absolute inset-0 m-auto w-2 h-2
                                       bg-white rounded-full opacity-0
                                       group-hover:opacity-100 transition"
                        style={{
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%,-50%)",
                        }}
                      />
                    </span>
                    <span>{topic.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Action Buttons - jaise "Top-Up Page" */}
            {lastActions.length > 0 && !loading && (
              <div className="flex flex-col gap-2 pt-1">
                {lastActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleActionClick(action)}
                    className="w-full bg-gradient-to-r from-purple-600
                               to-indigo-600 text-white px-4 py-2.5
                               rounded-xl text-sm font-bold
                               hover:opacity-90 transition
                               flex items-center justify-center gap-2"
                  >
                    {action.label} →
                  </button>
                ))}
              </div>
            )}

            {/* Back to topics button */}
            {!showTopics && !loading && !escalated && (
              <button
                onClick={() => {
                  setInput("");
                  resetToTopics();
                }}
                className="text-green-600 text-xs font-medium
                           hover:underline pt-1"
              >
                <span>←</span> Need help with something else? Return to main
                topics
              </button>
            )}

            {loading && (
              <div className="flex justify-start">
                <div
                  className="w-8 h-8 rounded-full
                                bg-gradient-to-br from-green-400
                                to-emerald-600 flex items-center
                                justify-center text-sm mr-2 mt-1"
                >
                  🤖
                </div>
                <div
                  className="bg-white px-4 py-3 rounded-2xl
                                shadow-sm rounded-bl-md
                                border border-gray-100"
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-emerald-400
                                   rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Escalate Option */}
          {showEscalate && !escalated && (
            <div
              className="px-4 py-3.5 bg-orange-50/60
                            border-t border-orange-100 flex-shrink-0 transition-all duration-300"
            >
              <p className="text-orange-800 text-xs mb-1.5 font-bold text-center">
                😕 Problem solve nahi hui?
              </p>
              {/* Upper Alert Text */}
              <p className="text-gray-500 text-[12px] font-medium text-center  mb-3 px-2 leading-relaxed">
                {!input?.trim()
                  ? "✍️ Please describe your query in the input field below to enable → Escalate to Developer button."
                  : "✅ Message ready. Click the button below to submit and send Email to our Technical team / Developer."}
              </p>

              {/* Main Premium Button */}
              <button
                onClick={handleEscalate}
                disabled={escalating || !input?.trim()}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2.5 rounded-xl text-[14px] font-semibold hover:opacity-90 transition disabled:opacity-40 flex items-center justify-center gap-2 shadow-sm"
              >
                {escalating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending Email...
                  </>
                ) : (
                  <>👨‍💻 Escalate to Developer</>
                )}
              </button>
            </div>
          )}

          {escalated && (
            <div
              className="px-4 py-3 bg-green-50
                            border-t border-green-100
                            flex-shrink-0 text-center"
            >
              <p className="text-green-700 text-xs font-medium">
                ✅The developer has been notified! Please keep checking your
                email, Our team will reach out to you soon. 📧
              </p>
            </div>
          )}

          {/* Free text input - sirf "Others" select karne par ya escalate na hua ho */}
          {!escalated && (showFreeInput || !showTopics) && (
            <div className="p-3 border-t bg-white flex-shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                  placeholder="Apni problem likhiye..."
                  className="flex-1 border border-gray-200
                             rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:border-green-400
                             focus:ring-2 focus:ring-green-100"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-br from-green-500
                             to-emerald-600 text-white
                             w-11 h-11 rounded-xl flex
                             items-center justify-center
                             hover:opacity-90 transition
                             disabled:opacity-40 flex-shrink-0
                             shadow-md"
                >
                  ➤
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
