import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function Home() {
  const { token } = useAuth();
  return (
    <div
      className="min-h-screen bg-gradient-to-br
                    from-purple-50 to-pink-50"
    >
      {/* Hero */}
      <div className="text-center py-20 px-6">
        <h1
          className="text-5xl font-bold 
                       text-purple-700 mb-4"
        >
          👗 Virtual Try-On
        </h1>
        <p
          className="text-xl text-gray-600 mb-8 
                      max-w-2xl mx-auto"
        >
          Apne customers ko kapde try karne den ghar baithe! AI se sales
          badhayen! 🚀
        </p>

        <div
          className="flex gap-4 justify-center 
                        flex-wrap"
        >
          {token ? (
            <Link
              to="/dashboard"
              className="bg-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:big-purple-800 transition shadow-md "
            >
              Go to Dashboard 📊
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="bg-purple-700 text-white
                       px-8 py-4 rounded-full
                       text-lg font-semibold
                       hover:bg-purple-800 transition"
              >
                Start Using in Free! ✨
              </Link>
              <Link
                to="/login"
                className="bg-white text-purple-700
                       border-2 border-purple-700
                       px-8 py-4 rounded-full
                       text-lg font-semibold
                       hover:bg-purple-50 transition"
              >
                Login Now
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <h2
          className="text-3xl font-bold text-center
                       text-gray-800 mb-12"
        >
          Why Choose Us? 🤔
        </h2>

        <div
          className="grid grid-cols-1 md:grid-cols-3 
                        gap-8"
        >
          {[
            {
              icon: "🤖",
              title: "AI Powered",
              desc: " Realistic Try-on By Advanced AI",
            },
            {
              icon: "🔌",
              title: "Easy Integration",
              desc: "Just add one Script tag in your Website!",
            },
            {
              icon: "🛍️",
              title: "Sales Badhao",
              desc: "Low Returns, More sales!",
            },
            {
              icon: "👗",
              title: "Fashion Advice",
              desc: "AI stylist will also give you pro tips",
            },
            {
              icon: "📱",
              title: "Mobile Friendly",
              desc: "Works Perfectly Also On Smartphones",
            },
            {
              icon: "💰",
              title: "Affordable",
              desc: "Also Affordable For Small Sellers",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6
                         shadow-sm text-center
                         hover:shadow-md transition"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white py-20 px-6">
        <h2
          className="text-3xl font-bold text-center
                       text-gray-800 mb-12"
        >
          Plans 💰
        </h2>

        <div
          className="max-w-4xl mx-auto grid
                        grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              name: "Free",
              price: "₹0",
              limit: "50 try-ons/month",
              color: "border-gray-200",
              btn: "bg-gray-700",
            },
            {
              name: "Starter",
              price: "₹1,999",
              limit: "500 try-ons/month",
              color: "border-purple-500",
              btn: "bg-purple-700",
              popular: true,
            },
            {
              name: "Pro",
              price: "₹4,999",
              limit: "Unlimited try-ons",
              color: "border-pink-500",
              btn: "bg-pink-600",
            },
          ].map((plan, i) => (
            <div
              key={i}
              className={`border-2 ${plan.color} 
                         rounded-2xl p-8 text-center 
                         relative`}
            >
              {plan.popular && (
                <span
                  className="absolute -top-3
                                 left-1/2 -translate-x-1/2
                                 bg-purple-700 text-white
                                 px-4 py-1 rounded-full 
                                 text-sm"
                >
                  Popular ⭐
                </span>
              )}
              <h3 className="font-bold text-xl mb-2">{plan.name}</h3>
              <p className="text-3xl font-bold mb-2">{plan.price}</p>
              <p className="text-gray-500 mb-6">{plan.limit}</p>
              <Link
                to="/register"
                className={`${plan.btn} text-white
                            px-6 py-3 rounded-full
                            font-semibold block
                            hover:opacity-90 transition`}
              >
                Start Now
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
