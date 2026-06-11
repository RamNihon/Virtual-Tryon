import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API_URL from "../api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Analytics() {
  const { seller, token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seller || !token) {
      navigate("/login");
      return;
    }
    // Free plan check
    if (seller.plan === "free") {
      setLoading(false);
      return;
    }
    fetchAnalytics();
    // eslint-disable-next-line
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/seller/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 25000, // 15 second timeout
      });
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.log("Analytics error:", err.message);
      // Error pe bhi loading band karo
      setData({
        stats: {
          totalTryons: 0,
          totalProducts: 0,
          recentTryons: 0,
          totalOrders: 0,
          fabricGenCount: 0,
          fabricTryonCount: 0,
          recentOrders: 0,
          plan: seller?.plan,
          tryonLimit: seller?.tryonLimit,
        },
        dailyData: [],
        productTryons: [],
      });
    } finally {
      setLoading(false);
    }
  };
  // Free plan wall
  if (!loading && seller?.plan === "free") {
    return (
      <div
        className="min-h-screen bg-gray-50
                      flex items-center justify-center px-4"
      >
        <div
          className="bg-white rounded-3xl shadow-sm
                        p-10 max-w-md w-full text-center
                        border border-gray-100"
        >
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Analytics - Basic/Pro/Elite Only
          </h2>
          <p className="text-gray-500 mb-6 leading-relaxed">
            To view detailed analytics and graphs, get the Basic, Pro or Elite
            plan!
          </p>
          <div className="bg-purple-50 rounded-2xl p-4 mb-6">
            <p className="text-purple-700 text-sm font-medium">
              📈 What you will get:
            </p>
            <ul
              className="text-gray-600 text-sm mt-2
                           space-y-1 text-left"
            >
              <li>✅ Daily try-on graph</li>
              <li>✅ Order tracking</li>
              <li>✅ Product performance</li>
              <li>✅ 30 day history</li>
            </ul>
          </div>
          <Link
            to="/pricing"
            className="block w-full bg-gradient-to-r
                       from-purple-600 to-indigo-600
                       text-white py-3 rounded-xl
                       font-bold hover:opacity-90 transition"
          >
            🚀 Upgrade your plan
          </Link>
          <Link
            to="/dashboard"
            className="block mt-3 text-gray-400
                       text-sm hover:text-gray-600"
          >
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center
                      justify-center"
      >
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">📊</div>
          <p className="text-purple-600 animate-pulse">
            The analytics are loading...
          </p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const dailyData = data?.dailyData || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="bg-gradient-to-br from-slate-900
                      via-purple-900 to-indigo-900
                      py-12 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <Link
            to="/dashboard"
            className="text-purple-300 hover:text-white
                       text-sm transition mb-4 inline-block"
          >
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-black text-white mb-1">
            📊 Analytics Dashboard
          </h1>
          <p className="text-purple-200">{seller?.name} 's Performance Data</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div
          className="grid grid-cols-2 md:grid-cols-4
                        gap-4 mb-8"
        >
          {[
            {
              icon: "👗",
              label: "Total Try-Ons",
              value: stats.totalTryons || 0,
              color: "bg-purple-50 border-purple-100",
            },
            {
              icon: "📱",
              label: "Total Orders",
              value: stats.totalOrders || 0,
              color: "bg-green-50 border-green-100",
            },
            {
              icon: "🧵",
              label: "Fabric Generations",
              value: stats.fabricGenCount || 0,
              color: "bg-blue-50 border-blue-100",
            },
            {
              icon: "✨",
              label: "Fabric Try-Ons",
              value: stats.fabricTryonCount || 0,
              color: "bg-indigo-50 border-indigo-100",
            },
            {
              icon: "🔥",
              label: "This Week Try-Ons",
              value: stats.recentTryons || 0,
              color: "bg-orange-50 border-orange-100",
            },
            {
              icon: "💳",
              label: "Credits Baaki",
              value: stats.credits || 0,
              color:
                stats.credits < 50
                  ? "bg-red-50 border-red-200"
                  : "bg-emerald-50 border-emerald-100",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`${stat.color} border rounded-2xl
                         p-5 text-center`}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-2xl font-black text-gray-800">{stat.value}</p>
              <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Try-On + Orders Graph */}
        <div
          className="bg-white rounded-3xl p-6
                        shadow-sm border border-gray-100 mb-6"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-6">
            📈 Last 7 Days Activity
          </h2>
          <ResponsiveContainer width="100%" height={300} key={dailyData.length}>
            <LineChart
              data={dailyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="tryons"
                stroke="#7C3AED"
                strokeWidth={3}
                dot={{ r: 4, fill: "#7C3AED", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                name="Try-Ons"
                isAnimationActive={true}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                name="Orders"
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div
          className="bg-white rounded-3xl p-6
                        shadow-sm border border-gray-100 mb-6"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-6">
            📊 Try-Ons vs Orders Comparison
          </h2>
          <ResponsiveContainer
            width="100%"
            height={280}
            key={"bar-" + dailyData.length}
          >
            <BarChart
              data={dailyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }}
              />
              <Legend />
              <Bar
                dataKey="tryons"
                fill="#7C3AED"
                name="Try-Ons"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              />
              <Bar
                dataKey="orders"
                fill="#10b981"
                name="Orders"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Rate */}
        <div
          className="bg-white rounded-3xl p-6
                        shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            🎯 Conversion Rate
          </h2>
          <div className="flex items-center gap-4">
            <div
              className="flex-1 bg-gray-100
                            rounded-full h-4 overflow-hidden"
            >
              <div
                className="bg-gradient-to-r from-purple-600
                           to-green-500 h-full rounded-full
                           transition-all duration-1000"
                style={{
                  width:
                    stats.totalTryons > 0
                      ? `${Math.min(
                          (stats.totalOrders / stats.totalTryons) * 100,
                          100,
                        ).toFixed(0)}%`
                      : "0%",
                }}
              ></div>
            </div>
            <span className="text-2xl font-black text-gray-800">
              {stats.totalTryons > 0
                ? `${((stats.totalOrders / stats.totalTryons) * 100).toFixed(
                    1,
                  )}%`
                : "0%"}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Conversion from Try-On to Orders
          </p>
        </div>
      </div>
    </div>
  );
}
