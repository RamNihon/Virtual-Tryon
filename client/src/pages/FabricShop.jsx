import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import API_URL from "../api";
import { useCustomer } from "../context/CustomerContext";
import VoiceAssistant, { speakText } from "../components/VoiceAssistant";
import TryOnGallery from '../components/TryOnGallery'

// ─── Garment Labels ───────────────────────
const GARMENT_LABELS = {
  shirt_full: "👔 Full Sleeve Shirt",
  shirt_half: "👕 Half Sleeve Shirt",
  pant: "👖 Formal Pant",
  kurta: "🪭 Kurta",
  salwar_suit: "👗 Salwar Suit",
  kurti: "👘 Kurti",
  saree: "🥻 Saree",
};

// ─── Measurement Guide ────────────────────
function MeasurementGuide({ onClose, onSave, existingMeasurements }) {
  const { customerToken } = useCustomer();
  const [measurements, setMeasurements] = useState({
    chest: existingMeasurements?.chest || "",
    waist: existingMeasurements?.waist || "",
    hips: existingMeasurements?.hips || "",
    shoulder: existingMeasurements?.shoulder || "",
    sleeveLength: existingMeasurements?.sleeveLength || "",
    shirtLength: existingMeasurements?.shirtLength || "",
    pantLength: existingMeasurements?.pantLength || "",
    thigh: existingMeasurements?.thigh || "",
    neck: existingMeasurements?.neck || "",
  });
  const [saving, setSaving] = useState(false);
  const [activeGuide, setActiveGuide] = useState(null);

  const fields = [
    {
      key: "chest",
      label: "Chest/Seena",
      icon: "📏",
      unit: "inches",
      guide: "Seene ke sabse chaude hisse ka measurement len.",
      tip: "Saans andar lo aur tape loose rakho.",
      typical: "36-42",
    },
    {
      key: "waist",
      label: "Waist/Kamar",
      icon: "📐",
      unit: "inches",
      guide: "Kamar ka measurement len.",
      tip: "Navel ke niche measurement len.",
      typical: "30-36",
    },
    {
      key: "shoulder",
      label: "Shoulder/Kandha",
      icon: "↔️",
      unit: "inches",
      guide: "Ek kandhe ke end se dusre tak ka measurement.",
      tip: "Seedha khade rahen.",
      typical: "16-18",
    },
    {
      key: "neck",
      label: "Neck/Gardan",
      icon: "🔵",
      unit: "inches",
      guide: "Gardan ke around base pe.",
      tip: "1 finger extra space rakhen.",
      typical: "14-16",
    },
    {
      key: "sleeveLength",
      label: "Sleeve Length",
      icon: "💪",
      unit: "inches",
      guide: "Kandhe se kalai tak ka measurement.",
      tip: "Half sleeve ke liye kandhe se elbow tak.",
      typical: "24-26",
    },
    {
      key: "shirtLength",
      label: "Shirt/Kurta Length",
      icon: "📏",
      unit: "inches",
      guide: "Measure (gardan peeche) se neeche tak.",
      tip: "Kitna lamba shirt chahiye decide karen.",
      typical: "28-32",
    },
    {
      key: "hips",
      label: "Hips",
      icon: "📐",
      unit: "inches",
      guide: "Hips ke sabse chaude hisse ka measurement for Pant.",
      tip: "Seedha khade rahen.",
      typical: "36-42",
    },
    {
      key: "pantLength",
      label: "Pant Length",
      icon: "👖",
      unit: "inches",
      guide: "Kamar se paaon tak ka measurement.",
      tip: "Shoes pehen kar measure karen.",
      typical: "40-44",
    },
    {
      key: "thigh",
      label: "Thigh",
      icon: "📏",
      unit: "inches",
      guide: "Thigh ka sabse chauda hisse ka measurement.",
      tip: "Pants ke liye zaroori hai.",
      typical: "22-26",
    },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      if (customerToken) {
        await axios.post(`${API_URL}/api/customer/measurements`, measurements, {
          headers: {
            Authorization: `Bearer ${customerToken}`,
          },
        });
      }
      onSave(measurements);
    } catch (e) {
      console.log(e);
      onSave(measurements);
    } finally {
      setSaving(false);
    }
  };

  const isComplete =
    Object.values(measurements).filter((v) => v !== "").length >= 4;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70
                    z-50 flex items-end md:items-center
                    justify-center p-0 md:p-4"
    >
      <div
        className="bg-white w-full md:max-w-2xl
                      rounded-t-3xl md:rounded-3xl
                      max-h-screen overflow-y-auto"
      >
        {/* Header */}
        <div
          className="sticky top-0 bg-white border-b
                        p-5 rounded-t-3xl z-10"
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-gray-800">
                📏 Apna Measurement Den
              </h2>
              <p className="text-gray-400 text-sm">
                Perfect fitting ke liye zaroori hai!
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100
                         flex items-center justify-center
                         text-gray-500"
            >
              ✕
            </button>
          </div>

          {/* Progress */}
          <div className="mt-3">
            <div
              className="flex justify-between text-xs
                            text-gray-400 mb-1"
            >
              <span>Progress</span>
              <span>
                {Object.values(measurements).filter((v) => v !== "").length}/
                {fields.length}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full">
              <div
                className="h-full bg-gradient-to-r
                           from-purple-600 to-indigo-600
                           rounded-full transition-all"
                style={{
                  width: `${
                    (Object.values(measurements).filter((v) => v !== "")
                      .length /
                      fields.length) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="p-5">
          {/* How to Measure Banner */}
          <div
            className="bg-gradient-to-br from-blue-50
                          to-indigo-50 rounded-2xl p-4 mb-5
                          border border-blue-100"
          >
            <p className="font-bold text-blue-800 text-sm mb-1">
              💡 Measurement Tips:
            </p>
            <ul className="text-blue-600 text-xs space-y-1">
              <li>• Measuring tape use karen</li>
              <li>• Slim fit clothing pehen kar measure karen</li>
              <li>• Seedha khade rahen</li>
              <li>• Inches mein sari measurements de</li>
            </ul>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.key} className="bg-gray-50 rounded-2xl p-4">
                <div
                  className="flex items-start
                                justify-between mb-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{field.icon}</span>
                    <div>
                      <label
                        className="font-semibold
                                        text-gray-800 text-sm block"
                      >
                        {field.label}
                      </label>
                      <span className="text-xs text-gray-400">
                        Typical: {field.typical} inches
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setActiveGuide(
                        activeGuide === field.key ? null : field.key,
                      )
                    }
                    className="text-xs text-purple-600
                               font-medium hover:text-purple-700"
                  >
                    {activeGuide === field.key ? "Hide" : "How?"}
                  </button>
                </div>

                {/* Guide */}
                {activeGuide === field.key && (
                  <div
                    className="bg-purple-50 rounded-xl p-3 mb-3
                                  border border-purple-100"
                  >
                    <p className="text-purple-700 text-xs mb-1">
                      📐 {field.guide}
                    </p>
                    <p className="text-purple-500 text-xs">
                      💡 Tip: {field.tip}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder={`e.g. ${field.typical.split("-")[0]}`}
                    value={measurements[field.key]}
                    onChange={(e) =>
                      setMeasurements({
                        ...measurements,
                        [field.key]: e.target.value,
                      })
                    }
                    className="flex-1 border border-gray-200
                               bg-white rounded-xl px-4 py-2.5
                               text-sm focus:outline-none
                               focus:border-purple-500
                               focus:ring-2 focus:ring-purple-100"
                  />
                  <span
                    className="text-gray-400 text-sm
                                   flex-shrink-0"
                  >
                    inches
                  </span>
                  {measurements[field.key] && (
                    <span
                      className="text-green-500 text-lg
                                     flex-shrink-0"
                    >
                      ✓
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !isComplete}
            className="mt-6 w-full bg-gradient-to-r
                       from-purple-600 to-indigo-600
                       text-white py-4 rounded-2xl font-bold
                       text-lg disabled:opacity-40
                       hover:opacity-90 transition"
          >
            {saving ? "⏳ Save ho raha hai..." : "✅ Save Measurements"}
          </button>

          {!isComplete && (
            <p className="text-center text-gray-400 text-xs mt-2">
              Kam se kam 4 measurements zaroori hain
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stitching Price Calculator ───────────
function StitchingCalculator({ product, onClose, measurements }) {
  const [garmentType, setGarmentType] = useState("shirt_full");
  const [quality, setQuality] = useState("standard");
  const [addons, setAddons] = useState([]);
  const [urgency, setUrgency] = useState("normal");

  const BASE_PRICES = {
    shirt_full: 400,
    shirt_half: 350,
    pant: 450,
    kurta: 500,
    salwar_suit: 800,
    kurti: 600,
    saree: 300,
  };

  const QUALITY_MULTIPLIER = {
    basic: 1,
    standard: 1.4,
    premium: 2,
  };

  const QUALITY_LABELS = {
    basic: { label: "Basic", desc: "Simple stitching" },
    standard: { label: "Standard", desc: "Good quality" },
    premium: { label: "Premium", desc: "Designer finish" },
  };

  const ADDONS_LIST = [
    { key: "monogram", label: "🔤 Monogram", price: 50 },
    { key: "embroidery", label: "🌸 Embroidery", price: 200 },
    { key: "buttons_premium", label: "🔘 Premium Buttons", price: 80 },
    { key: "lining", label: "🪡 Full Lining", price: 150 },
    { key: "pocket", label: "👝 Extra Pocket", price: 60 },
    { key: "dupatta", label: "🧣 Dupatta Hem", price: 100 },
  ];

  const URGENCY_PRICES = {
    normal: { label: "Normal (7-10 days)", extra: 0 },
    express: { label: "Express (3-5 days)", extra: 150 },
    urgent: { label: "Urgent (1-2 days)", extra: 300 },
  };

  const toggleAddon = (key) => {
    setAddons((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key],
    );
  };

  const basePrice = BASE_PRICES[garmentType] || 400;
  const qualityPrice = Math.round(basePrice * QUALITY_MULTIPLIER[quality]);
  const addonsTotal = addons.reduce((sum, key) => {
    const addon = ADDONS_LIST.find((a) => a.key === key);
    return sum + (addon?.price || 0);
  }, 0);
  const urgencyExtra = URGENCY_PRICES[urgency].extra;
  const fabricPrice = product?.price || 0;
  const stitchingTotal = qualityPrice + addonsTotal + urgencyExtra;
  const grandTotal = fabricPrice + stitchingTotal;

  const availableGarments = product?.availableGarments || [];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70
                    z-50 flex items-end md:items-center
                    justify-center p-0 md:p-4"
    >
      <div
        className="bg-white w-full md:max-w-lg
                      rounded-t-3xl md:rounded-3xl
                      max-h-screen overflow-y-auto"
      >
        <div
          className="sticky top-0 bg-white border-b
                        p-5 rounded-t-3xl z-10"
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-gray-800">
                🧮 Stitching Calculator
              </h2>
              <p className="text-gray-400 text-sm">
                Custom stitching ka estimate len
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100
                         flex items-center justify-center
                         text-gray-500"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Garment Type */}
          <div>
            <label
              className="font-bold text-gray-700
                              text-sm block mb-2"
            >
              👔 Garment Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableGarments.map((g) => (
                <button
                  key={g}
                  onClick={() => setGarmentType(g)}
                  className={`py-2.5 px-3 rounded-xl text-sm
                             font-medium transition border-2 text-left
                             ${
                               garmentType === g
                                 ? "bg-purple-600 text-white border-purple-600"
                                 : "bg-gray-50 text-gray-700 border-gray-200"
                             }`}
                >
                  {GARMENT_LABELS[g]}
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div>
            <label
              className="font-bold text-gray-700
                              text-sm block mb-2"
            >
              ✨ Stitching Quality
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(QUALITY_LABELS).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setQuality(k)}
                  className={`py-3 rounded-xl text-sm
                             font-medium transition border-2
                             ${
                               quality === k
                                 ? "bg-purple-600 text-white border-purple-600"
                                 : "bg-gray-50 text-gray-700 border-gray-200"
                             }`}
                >
                  <span className="block font-bold">{v.label}</span>
                  <span
                    className={`text-xs block mt-0.5
                                   ${
                                     quality === k
                                       ? "text-purple-200"
                                       : "text-gray-400"
                                   }`}
                  >
                    {v.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Delivery */}
          <div>
            <label
              className="font-bold text-gray-700
                              text-sm block mb-2"
            >
              🚀 Delivery Speed
            </label>
            <div className="space-y-2">
              {Object.entries(URGENCY_PRICES).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setUrgency(k)}
                  className={`w-full flex justify-between
                             items-center px-4 py-3 rounded-xl
                             border-2 transition text-sm
                             ${
                               urgency === k
                                 ? "border-purple-500 bg-purple-50"
                                 : "border-gray-200 bg-gray-50"
                             }`}
                >
                  <span
                    className={`font-medium
                                   ${
                                     urgency === k
                                       ? "text-purple-700"
                                       : "text-gray-700"
                                   }`}
                  >
                    {v.label}
                  </span>
                  <span
                    className={`font-bold
                                   ${
                                     v.extra > 0
                                       ? "text-orange-500"
                                       : "text-green-600"
                                   }`}
                  >
                    {v.extra > 0 ? `+₹${v.extra}` : "Free"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <label
              className="font-bold text-gray-700
                              text-sm block mb-2"
            >
              ➕ Extra Add-ons
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ADDONS_LIST.map((addon) => (
                <button
                  key={addon.key}
                  onClick={() => toggleAddon(addon.key)}
                  className={`flex items-center justify-between
                             px-3 py-2.5 rounded-xl border-2
                             text-sm transition
                             ${
                               addons.includes(addon.key)
                                 ? "border-purple-500 bg-purple-50 text-purple-700"
                                 : "border-gray-200 bg-gray-50 text-gray-700"
                             }`}
                >
                  <span>{addon.label}</span>
                  <span
                    className={`font-bold text-xs
                                   ${
                                     addons.includes(addon.key)
                                       ? "text-purple-600"
                                       : "text-gray-400"
                                   }`}
                  >
                    +₹{addon.price}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div
            className="bg-gradient-to-br from-purple-50
                          to-indigo-50 rounded-2xl p-5
                          border border-purple-100"
          >
            <h3 className="font-bold text-gray-800 mb-4">💰 Price Breakdown</h3>
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">🧵 Fabric Price</span>
                <span className="font-semibold">₹{fabricPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  ✂️ Stitching ({QUALITY_LABELS[quality].label})
                </span>
                <span className="font-semibold">₹{qualityPrice}</span>
              </div>
              {addons.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    ➕ Add-ons ({addons.length})
                  </span>
                  <span className="font-semibold">₹{addonsTotal}</span>
                </div>
              )}
              {urgencyExtra > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">🚀 Express Charge</span>
                  <span className="font-semibold text-orange-500">
                    ₹{urgencyExtra}
                  </span>
                </div>
              )}
              <div
                className="border-t border-purple-200 pt-3
                              flex justify-between"
              >
                <span className="font-black text-gray-800 text-lg">
                  Grand Total
                </span>
                <span className="font-black text-purple-600 text-2xl">
                  ₹{grandTotal}
                </span>
              </div>
            </div>
          </div>

          {/* Measurements summary */}
          {measurements && Object.keys(measurements).length > 0 && (
            <div
              className="bg-green-50 rounded-2xl p-4
                            border border-green-100"
            >
              <p className="font-bold text-green-700 text-sm mb-2">
                📏 Your Measurement are ready! ✅
              </p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(measurements)
                  .filter(([, v]) => v)
                  .slice(0, 6)
                  .map(([k, v]) => (
                    <div key={k} className="text-center">
                      <p className="text-xs text-gray-400 capitalize">{k}</p>
                      <p className="font-bold text-gray-700 text-sm">{v}"</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* WhatsApp Order */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Hi! Main custom stitching order karna chahta hun!\n\n` +
                `Fabric: ${product?.name}\n` +
                `Garment: ${GARMENT_LABELS[garmentType]}\n` +
                `Quality: ${QUALITY_LABELS[quality].label}\n` +
                `Delivery: ${URGENCY_PRICES[urgency].label}\n` +
                (addons.length > 0 ? `Add-ons: ${addons.join(", ")}\n` : "") +
                `\nEstimated Total: ₹${grandTotal}\n` +
                (measurements
                  ? `\nMeasurements:\n` +
                    Object.entries(measurements)
                      .filter(([, v]) => v)
                      .map(([k, v]) => `${k}: ${v}"`)
                      .join(", ")
                  : "") +
                `\n\nPlease confirm!`,
            )}`}
            target="_blank"
            rel="noreferrer"
            className="block w-full bg-green-500 text-white
                       py-4 rounded-2xl font-bold text-center
                       text-lg hover:bg-green-600 transition"
          >
            📱 WhatsApp Par Order Karen (₹{grandTotal})
          </a>
        </div>
      </div>
    </div>
  );
}
// ─── Loading Animation ────────────────────
function FabricAnimation({ step }) {
  const generateSteps = [
    {
      label: "Fabric Upload",
      detail: "Analyzing the fabric photo...",
      percent: 15,
      icon: "🧵",
    },
    {
      label: "Pattern Detection",
      detail: "Detecting fabric pattern and texture...",
      percent: 35,
      icon: "🔍",
    },
    {
      label: "AI Stitching",
      detail: "Stitching the garment via AI...",
      percent: 60,
      icon: "✂️",
    },
    {
      label: "Garment Shaping",
      detail: "Shaping and structuring the garment...",
      percent: 82,
      icon: "👔",
    },
    {
      label: "Final Render",
      detail: "Applying final design touches...",
      percent: 97,
      icon: "✨",
    },
  ];

  const tryonSteps = [
    {
      label: "Photo Processing",
      detail: "Uploading and processing your photo...",
      percent: 12,
      icon: "📸",
    },
    {
      label: "Body Detection",
      detail: "Analyzing body structure and measurements...",
      percent: 30,
      icon: "🤖",
    },
    {
      label: "Garment Fitting",
      detail: "Fitting the garment to your body...",
      percent: 55,
      icon: "👗",
    },
    {
      label: "Texture Sync",
      detail: "Syncing and matching fabric texture...",
      percent: 78,
      icon: "🎨",
    },
    {
      label: "Result Ready",
      detail: "Generating your final look!",
      percent: 97,
      icon: "🎉",
    },
  ];

  const STEPS = step === "tryon" ? tryonSteps : generateSteps;
  const [stepIdx, setStepIdx] = useState(0);
  const [displayPercent, setDisplayPercent] = useState(0);
  const [particles, setParticles] = useState([]);
  const spokenRef = useRef(new Set());

  useEffect(() => {
    setParticles(
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 3,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 3 + 2,
      })),
    );
  }, []);

  useEffect(() => {
    spokenRef.current.clear();
    setStepIdx(0);
    setDisplayPercent(0);
    if (!spokenRef.current.has(0)) {
      speakText(STEPS[0].detail, "en");
      spokenRef.current.add(0);
    }
    const t = setInterval(() => {
      setStepIdx((p) => {
        const next = p < STEPS.length - 1 ? p + 1 : p;
        if (!spokenRef.current.has(next) && next !== p) {
          speakText(STEPS[next].detail, "en");
          spokenRef.current.add(next);
        }
        return next;
      });
    }, 3500);
  
    return () => {
      clearInterval(t);
        // eslint-disable-next-line
      spokenRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    const target = STEPS[stepIdx].percent;
    const interval = setInterval(() => {
      setDisplayPercent((prev) => {
        if (prev >= target) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 25);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx]);

  const current = STEPS[stepIdx];
  const circumference = 2 * Math.PI * 54;

  return (
    <div
      style={{ zIndex: 99999 }}
      className="fixed inset-0 flex items-center justify-center"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        }}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full opacity-30"
            style={{
              left: `${p.x}%`,
              bottom: "-10px",
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
              animation: `floatUp ${p.duration}s ${p.delay}s infinite linear`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm mx-4">
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow:
              "0 25px 50px rgba(0,0,0,0.5), 0 0 100px rgba(139,92,246,0.2)",
          }}
        >
          <div
            className="h-1 w-full"
            style={{
              background: `linear-gradient(90deg, #8B5CF6 0%, #EC4899 ${displayPercent}%, rgba(255,255,255,0.1) ${displayPercent}%)`,
            }}
          />

          <div className="p-7">
            <div className="flex justify-center mb-5">
              <div className="relative">
                <svg width="130" height="130" className="-rotate-90">
                  <circle
                    cx="65"
                    cy="65"
                    r="54"
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="65"
                    cy="65"
                    r="62"
                    fill="none"
                    stroke="rgba(139,92,246,0.15)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="65"
                    cy="65"
                    r="54"
                    fill="none"
                    stroke="url(#fabricGrad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={
                      circumference - (displayPercent / 100) * circumference
                    }
                    style={{ transition: "stroke-dashoffset 0.3s ease" }}
                  />
                  <defs>
                    <linearGradient
                      id="fabricGrad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="text-3xl mb-1"
                    style={{
                      filter: "drop-shadow(0 0 8px rgba(139,92,246,0.8))",
                    }}
                  >
                    {current.icon}
                  </span>
                  <span className="text-2xl font-black text-white">
                    {displayPercent}%
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center mb-4">
              <h3 className="text-lg font-black text-white mb-1">
                {current.label}
              </h3>
              <p className="text-purple-300 text-xs">{current.detail}</p>
            </div>

            <div className="flex justify-center gap-1.5 mb-4">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-500"
                  style={{
                    width: i === stepIdx ? "20px" : "6px",
                    height: "6px",
                    background:
                      i <= stepIdx
                        ? "linear-gradient(90deg, #8B5CF6, #EC4899)"
                        : "rgba(255,255,255,0.15)",
                  }}
                />
              ))}
            </div>

            <div
              className="rounded-full overflow-hidden mb-3"
              style={{ height: "5px", background: "rgba(255,255,255,0.08)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${displayPercent}%`,
                  background:
                    "linear-gradient(90deg, #8B5CF6, #EC4899, #F59E0B)",
                }}
              />
            </div>

            {STEPS.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-xl px-3 py-1.5 mb-1 transition-all"
                style={{
                  background:
                    i === stepIdx ? "rgba(139,92,246,0.2)" : "transparent",
                  border:
                    i === stepIdx
                      ? "1px solid rgba(139,92,246,0.3)"
                      : "1px solid transparent",
                }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      i < stepIdx
                        ? "linear-gradient(135deg, #8B5CF6, #EC4899)"
                        : i === stepIdx
                          ? "rgba(139,92,246,0.4)"
                          : "rgba(255,255,255,0.05)",
                  }}
                >
                  {i < stepIdx ? (
                    <span className="text-white text-xs">✓</span>
                  ) : (
                    <span className="text-xs">
                      {i === stepIdx ? s.icon : "○"}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs font-medium
                  ${i === stepIdx ? "text-purple-200" : i < stepIdx ? "text-white opacity-60" : "text-white opacity-20"}`}
                >
                  {s.label}
                </span>
                {i === stepIdx && (
                  <div className="ml-auto flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <div
                        key={d}
                        className="w-1 h-1 rounded-full bg-purple-400 animate-bounce"
                        style={{ animationDelay: `${d * 0.15}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

            <p className="text-center text-white text-xs mt-3 opacity-40">
              It will take 30-60 seconds, Please wait patiently... 😊
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 0.3; }
          100% { transform: translateY(-100vh) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Product Detail Modal ─────────────────
function FabricProductModal({ product, shop, apiKey, onClose }) {
  const [selectedGarment, setSelectedGarment] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [tryonStep, setTryonStep] = useState(false);
  const [humanImage, setHumanImage] = useState(null);
  const [humanPreview, setHumanPreview] = useState(null);
  const [tryonResult, setTryonResult] = useState(null);
  const [styleAdvice, setStyleAdvice] = useState(null);
  const [error, setError] = useState("");
  const [selectedFabricImg, setSelectedFabricImg] = useState(0);
  const [showMeasurement, setShowMeasurement] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [savedMeasurements, setSavedMeasurements] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);

  const fabrics =
    product.fabricImages?.length > 0
      ? product.fabricImages
      : [product.fabricImageUrl];

  // Check cached preview
  const getCachedPreview = (garmentType) => {
    return product.generatedPreviews?.find(
      (p) => p.garmentType === garmentType,
    );
  };

  const handleGenerateGarment = async (garmentType) => {
    setError("");

    // Check cached first
    const cached = getCachedPreview(garmentType);
    if (cached) {
      setSelectedGarment(garmentType);
      setGeneratedImage(
        typeof cached.imageUrl === "string"
          ? cached.imageUrl
          : String(cached.imageUrl),
      );
      return;
    }

    // Generating start - button disable hoga
    setGenerating(true);
    setSelectedGarment(garmentType);

    try {
      const res = await axios.post(`${API_URL}/api/fabric/generate`, {
        productId: product._id,
        garmentType,
        apiKey,
      });

      // String check karke set karo
      const imgUrl =
        typeof res.data.imageUrl === "string"
          ? res.data.imageUrl
          : res.data.imageUrl?.url || String(res.data.imageUrl);

      console.log("Generated image URL:", imgUrl);

      setGeneratedImage(imgUrl);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Error aaya!";
      setError(errMsg);
      setGeneratedImage(null);

      if (err.response?.data?.type === "plan_required") {
        setError("🔒 Fabric generation Pro/Elite plan mein hai!");
      } else if (err.response?.data?.type === "insufficient_credits") {
        setError("💳 Credits khatam! Top-up karen.");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleTryOn = async () => {
    if (!humanImage || !generatedImage) return;
    setTryonStep(true);
    setTryonResult(null);

    try {
      // generatedImage string hai check karo
      const garmentUrl =
        typeof generatedImage === "string"
          ? generatedImage
          : generatedImage?.url || "";

      console.log("Garment URL being sent:", garmentUrl);

      if (!garmentUrl || !garmentUrl.startsWith("http")) {
        alert("Garment image URL invalid hai! Pehle garment generate karen.");
        setTryonStep(false);
        return;
      }

      const formData = new FormData();
      formData.append("humanImage", humanImage);
      formData.append("garmentImageUrl", garmentUrl);
      formData.append("apiKey", apiKey);
      formData.append("productId", product._id);
      // Garment type bhi bhejo taki lower/upper detect ho sake
      formData.append("garmentType", selectedGarment || "");

      const res = await axios.post(`${API_URL}/api/fabric/tryon`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setTryonResult(res.data.resultImage);
      setStyleAdvice(res.data.styleAdvice);
    } catch (err) {
      setError(err.response?.data?.message || "Try-on error!");
    } finally {
      setTryonStep(false);
    }
  };

  useEffect(() => {
    // मोबाइल ब्राउज़र के ओवरफ्लो को पूरी तरह लॉक करें
    document.body.style.overflow = "hidden";
    // document.body.style.height = "100vh";

    // 🔓 Cleanup Function: जब मोडल बंद (onClose) होगा, तो स्क्रॉलिंग वापस नॉर्मल हो जाएगी
    return () => {
      document.body.style.overflow = "unset";
      // document.body.style.height = "unset";
    };
  }, []);

  return (
    <>
      {(generating || tryonStep) && (
        <FabricAnimation step={generating ? "generate" : "tryon"} />
      )}

      {/* ─── 1. सबसे बाहरी बैकड्रॉप ओवरले (लाइन 888) ─── */}
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-end items-end md:items-center justify-center p-0 md:p-4">
        {/* ─── 2. मुख्य मोडल कंटेनर (लाइन 893) ─── */}
        {/* पुराना max-h-screen और overflow-y-auto हटाकर इसे h-screen और flex-col में लॉक कर दिया है */}
        <div
          className="bg-white w-full md:max-w-2xl 
                     h-[100svh] md:h-auto md:max-h-[92vh] 
                     flex flex-col overflow-hidden 
                     rounded-t-3xl md:rounded-3xl shadow-2xl"
        >
          {/* ─── 1. ADVANCE FIXED HEADER BAR (लाइन 898) ─── */}
          <div
            className="flex justify-between items-center p-5 border-b border-gray-100 
                     bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm"
          >
            {/* 🏷️ टाइटल, ब्रांड और फैब्रिक टाइप (Ultra-Luxury Stacked Layout) */}
            <div className="space-y-2 max-w-[70vw] animate-fadeIn">
              {/* 1. मुख्य फैब्रिक का नाम (जैसे GERMAN) - सबसे ऊपर बड़ा और बोल्ड */}
              <div className="flex items-center gap-2 group">
                {/* हैंगर आइकॉन */}
                <svg
                  xmlns="http://w3.org"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-purple-600 flex-shrink-0 transition-transform duration-300 group-hover:rotate-12"
                >
                  <path d="M4 12a8 8 0 0 1 16 0M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
                </svg>
                <h2 className="text-sm font-black text-gray-800 tracking-tight uppercase">
                  {product.name}
                </h2>
              </div>

              {/* 2. ब्रांड और फैब्रिक टाइप पिल्स - अगली लाइन में (Next Line Grid) */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {/* ब्रांड नेम (जैसे RAYMOND) - अगली लाइन में बड़ा और सॉलिड पर्पल लुक */}
                {product.brand && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-purple-600 to-indigo-600 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1 shadow-md shadow-purple-500/10 transform hover:scale-105 transition-transform cursor-pointer">
                    {/* ब्रांड के लिए बारीक वाइट रीटेल टैग आइकॉन */}
                    <svg
                      xmlns="http://w3.org"
                      width="9"
                      height="9"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-white/90"
                    >
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line
                        x1="7"
                        y1="7"
                        x2="7.01"
                        y2="7"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>{product.brand}</span>
                  </span>
                )}

                {/* फैब्रिक टाइप पिल (जैसे SILK) - ब्रांड के ठीक बगल में क्लीन लुक */}
                {product.fabricType && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md inline-flex items-center shadow-sm">
                    {product.fabricType}
                  </span>
                )}
              </div>
            </div>

            {/* अट्रैक्टिव क्लोज बटन - विथ होवर, टच रोटेशन एंड एब्सोल्यूट रिस्पॉन्स */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-red-50 
                       border border-gray-200/60 hover:border-red-100
                       flex items-center justify-center text-gray-400 hover:text-red-500
                       font-bold flex-shrink-0 shadow-sm hover:shadow-md
                       transform active:scale-90 hover:rotate-90
                       transition-all duration-300 ease-out cursor-pointer"
              title="Close Modal"
            >
              <svg
                xmlns="http://w3.org"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="transition-transform duration-300"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* ─── 2. ADVANCE SCROLLABLE CONTENT BODY START (लाइन 944) ─── */}
          {/* अब नीचे की सारी इमेजेस और बटन्स इसके अंदर स्क्रॉल होंगे, जिससे हेडर हमेशा टॉप पर लॉक रहेगा */}
          <div
            className="flex-1 overflow-y-auto p-5 space-y-6 pb-24 
                        [&::-webkit-scrollbar]:w-1.5
                        [&::-webkit-scrollbar-track]:bg-transparent
                        [&::-webkit-scrollbar-thumb]:bg-purple-500/10
                        hover:[&::-webkit-scrollbar-thumb]:bg-purple-500/30
                        [&::-webkit-scrollbar-thumb]:rounded-full"
          >
            {/* 2. PREMIUM FABRIC IMAGES SECTION */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <svg
                  xmlns="http://w3.org"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-gray-500"
                >
                  <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9" />
                </svg>
                <p className="text-xs font-extrabold uppercase text-gray-500 tracking-wider">
                  Original Fabric Preview
                </p>
              </div>

              {/* मुख्य इमेज कंटेनर */}
              <div className="relative rounded-2xl overflow-hidden bg-gray-50 h-56 border border-gray-100 shadow-inner group/preview">
                <img
                  src={fabrics[selectedFabricImg]}
                  alt="fabric"
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover/preview:scale-105"
                />
                {/* <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div> */}
              </div>

              {/* थंबनेल गैलरी (यदि 1 से अधिक इमेज हों) */}
              {fabrics.length > 1 && (
                <div className="flex gap-2.5 mt-2.5 overflow-x-auto pb-1">
                  {fabrics.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedFabricImg(i)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-300 transform active:scale-95 flex-shrink-0 cursor-pointer
                         ${
                           selectedFabricImg === i
                             ? "border-purple-600 shadow-md shadow-purple-500/10 scale-102 opacity-100"
                             : "border-gray-200/60 opacity-50 hover:opacity-100 hover:border-purple-300"
                         }`}
                    >
                      <img
                        src={img}
                        alt="thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between flex-wrap gap-3">
                {product.inStock ? (
                  <span
                    className="text-green-600 text-xs font-bold
                     bg-green-50 px-3 py-1.5 rounded-full
                     border border-green-200"
                  >
                    ✅ In Stock
                  </span>
                ) : (
                  <span
                    className="text-red-500 text-xs font-bold
                     bg-red-50 px-3 py-1.5 rounded-full
                     border border-red-200"
                  >
                    ❌ Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* 3. PRICE TAG UI (Bold & Clear) */}

            <div className="block gap-2.5 bg-purple-50/30 p-3 rounded-2xl border border-purple-100/30">
              <p className="text-xs text-gray-500 mt-5">
                Price of the entire fabric bundle
              </p>
              <span className="text-4xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
                ₹{product.price}
              </span>
              <br />
              {product.pricePerMeter > 0 && (
                <span className="text-green-500 text-sm font-semibold tracking-wide mt-9">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50/60 border border-purple-100 shadow-sm mt-1 transition-all duration-300 hover:shadow-md hover:bg-purple-50">
                    {/* एक छोटा सा प्राइस टैग या स्केल आइकॉन जैसा विजुअल */}
                    <span className="flex items-center justify-center w-4 h-4 text-purple-500 text-xs">
                      🏷️
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Per Meter Price:
                    </span>
                    <span className="text-base font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
                      ₹{product.pricePerMeter}
                    </span>
                    <span className="text-[10px] font-extrabold text-purple-600 bg-purple-100/80 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                      / Mtr
                    </span>
                  </div>
                </span>
              )}
            </div>

            {/* 4. ADVANCED QUICK ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-3">
              {/* बटन: नाप दें (Measurement Button) */}
              <button
                onClick={() => setShowMeasurement(true)}
                className="flex items-center justify-center gap-2 bg-blue-50/60 text-blue-700 p-3 rounded-xl text-xs font-black uppercase tracking-wider
                   border border-blue-200/50 hover:bg-blue-100/80 hover:border-blue-300 shadow-sm
                   transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
              >
                <svg
                  xmlns="http://w3.org"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 3v18M19 3v18M5 7h5M5 12h7M5 17h5M14 7h5M12 12h7M14 17h5" />
                </svg>
                <span>Give Measurements</span>
                {savedMeasurements && (
                  <div className="flex items-center justify-center bg-emerald-500 text-white w-4 h-4 rounded-full p-0.5 animate-bounce shadow-sm">
                    <svg
                      xmlns="http://w3.org"
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                )}
              </button>

              {/* बटन: प्राइस कैलकुलेटर */}
              <button
                onClick={() => setShowCalculator(true)}
                className="flex items-center justify-center gap-2 bg-emerald-50/60 text-emerald-700 p-3 rounded-xl text-xs font-black uppercase tracking-wider
                   border border-emerald-200/50 hover:bg-emerald-100/80 hover:border-emerald-300 shadow-sm
                   transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
              >
                <svg
                  xmlns="http://w3.org"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <line x1="9" y1="9" x2="15" y2="9" />
                  <line x1="9" y1="13" x2="15" y2="13" />
                  <line x1="9" y1="17" x2="15" y2="17" />
                </svg>
                <span>Price Calculator</span>
              </button>
            </div>

            {/* 5. DESCRIPTION BOX */}

            {/* Product Details Grid */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              {/* Description */}
              {product.description && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    ✨ About This Fabric
                  </p>
                  <p className="text-gray-600 text-sm font-medium leading-relaxed bg-gray-50/50 rounded-xl p-3.5 border border-gray-50">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Colors */}
              {product.colors?.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    🎨 Available Colors
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => {
                      const colorMap = {
                        Red: "#EF4444",
                        Blue: "#3B82F6",
                        Green: "#22C55E",
                        Yellow: "#EAB308",
                        Orange: "#F97316",
                        Purple: "#A855F7",
                        Pink: "#EC4899",
                        Black: "#1F2937",
                        White: "#F3F4F6",
                        Grey: "#9CA3AF",
                        Brown: "#92400E",
                        Cream: "#FEF3C7",
                        Navy: "#1E3A5F",
                        Maroon: "#7F1D1D",
                        Teal: "#0D9488",
                        Gold: "#D97706",
                        Silver: "#CBD5E1",
                      };
                      return (
                        <div
                          key={color}
                          className="flex items-center gap-2 bg-gray-50/60 rounded-full px-3.5 py-1.5 border border-gray-200/60 shadow-sm transition duration-200 hover:bg-gray-50"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-gray-300 flex-shrink-0 shadow-sm"
                            style={{ background: colorMap[color] || "#888" }}
                          />
                          <span className="text-xs text-gray-700 font-semibold">
                            {color}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Meta Info Row */}
              <div className="grid grid-cols-2 gap-3.5">
                {/* Brand */}
                {product.brand && (
                  <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-4 transition duration-300 hover:shadow-md hover:border-purple-100 group">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      🏷️{" "}
                      <span className="group-hover:text-purple-600 transition-colors">
                        Brand
                      </span>
                    </p>
                    <p className="text-sm font-bold text-gray-800 tracking-wide">
                      {product.brand}
                    </p>
                  </div>
                )}

                {/* Material */}
                {product.material && (
                  <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-4 transition duration-300 hover:shadow-md hover:border-purple-100 group">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      🧵{" "}
                      <span className="group-hover:text-purple-600 transition-colors">
                        Material
                      </span>
                    </p>
                    <p className="text-sm font-bold text-gray-800 capitalize tracking-wide">
                      {product.material}
                    </p>
                  </div>
                )}

                {/* Type */}
                {product.fabricType && (
                  <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-4 transition duration-300 hover:shadow-md hover:border-purple-100 group">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      📋{" "}
                      <span className="group-hover:text-purple-600 transition-colors">
                        Type
                      </span>
                    </p>
                    <p className="text-sm font-bold text-gray-800 capitalize tracking-wide">
                      {product.fabricType}
                    </p>
                  </div>
                )}

                {/* Occasion */}
                {product.occasion && product.occasion !== "any" && (
                  <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-4 transition duration-300 hover:shadow-md hover:border-purple-100 group">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      🎉{" "}
                      <span className="group-hover:text-purple-600 transition-colors">
                        Occasion
                      </span>
                    </p>
                    <p className="text-sm font-bold text-gray-800 capitalize tracking-wide">
                      {product.occasion}
                    </p>
                  </div>
                )}

                {/* Pattern */}
                {product.pattern && product.pattern !== "solid" && (
                  <div className="col-span-2 bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-4 transition duration-300 hover:shadow-md hover:border-purple-100 group">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      🔹{" "}
                      <span className="group-hover:text-purple-600 transition-colors">
                        Pattern
                      </span>
                    </p>
                    <p className="text-sm font-bold text-gray-800 capitalize tracking-wide">
                      {product.pattern}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 1: Choose Garment - अपग्रेडेड एडवांस लेआउट */}
            <div className="bg-gradient-to-br from-gray-50 via-purple-50/30 to-indigo-50/30 rounded-2xl p-5 border border-purple-100/50 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-600 animate-pulse [animation-duration:3s]">
                  <svg
                    xmlns="http://w3.org"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.38 3.46a1 1 0 0 0-.94-.06l-8.44 4.22a1 1 0 0 1-.94 0L1.62 3.4a1 1 0 0 0-1.42.9l.04 14.8a1 1 0 0 0 .54.89l8.44 4.22a1 1 0 0 0 .94 0l8.44-4.22a1 1 0 0 0 .54-.89l-.04-14.8a1 1 0 0 0-.32-.74z" />
                  </svg>
                </div>
                <h3 className="font-extrabold text-sm text-gray-800 tracking-wide uppercase">
                  Step 1: Select garment type
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {product.availableGarments?.map((garment) => {
                  const cached = getCachedPreview(garment);
                  const isSelected = selectedGarment === garment;
                  // Yeh button disable hoga jab YEH garment generate ho raha ho
                  const isThisGenerating = generating && isSelected;

                  return (
                    <button
                      key={garment}
                      onClick={() => {
                        if (generating) return; // किसी भी जेनरेशन के समय क्लिक ब्लॉक
                        handleGenerateGarment(garment);
                      }}
                      disabled={generating}
                      className={`relative p-3.5 rounded-xl text-xs font-bold transition-all duration-300
             flex flex-col justify-between items-start gap-2 shadow-sm overflow-hidden
             transform active:scale-[0.97] group cursor-pointer border-2 text-left
             ${
               isSelected && !isThisGenerating
                 ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent shadow-md shadow-purple-500/20"
                 : isThisGenerating
                   ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-transparent animate-pulse"
                   : generating
                     ? "bg-gray-50 text-gray-400 border-gray-100 opacity-50 cursor-not-allowed shadow-none"
                     : "bg-white text-gray-700 border-gray-100 hover:border-purple-400 hover:shadow-md hover:shadow-purple-500/5"
             }`}
                    >
                      {isThisGenerating ? (
                        /* 1. STATUS: यह गार्मेट जनरेट हो रहा है - प्रीमियम रोटेटिंग लोडर */
                        <div className="flex items-center gap-2 py-1.5 relative z-10">
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                          <span className="text-xs font-black uppercase tracking-wider">
                            Generating...
                          </span>
                        </div>
                      ) : (
                        /* 2. STATUS: नॉर्मल या रेडी मोड */
                        <>
                          {/* बटन का मुख्य टेक्स्ट */}
                          <span
                            className={`tracking-wide relative z-10 transition-transform duration-300 
                       ${generating ? "" : "group-hover:translate-x-0.5"}`}
                          >
                            {GARMENT_LABELS[garment]}
                          </span>

                          {/* कंडीशन के आधार पर स्टेटस पिल्स (Status Pills) */}
                          {cached ? (
                            /* A. अगर प्रीव्यू पहले से कैश्ड (Cached) है - सुरक्षित ग्रीन पिल */
                            <div
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider relative z-10
            ${isSelected ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-600"}`}
                            >
                              <svg
                                xmlns="http://w3.org"
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                              <span>Ready</span>
                            </div>
                          ) : (
                            /* B. अगर नया जनरेट करना है - क्रेडिट्स काउंट पिल (गोल्डन/नियोन लुक) */
                            <div
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider relative z-10 transition-all duration-300
            ${isSelected ? "bg-white/20 text-white/90" : "bg-amber-50 text-amber-600 " + (generating ? "" : "group-hover:bg-amber-100")}`}
                            >
                              <svg
                                xmlns="http://w3.org"
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={isSelected ? "" : "text-amber-500"}
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                              <span>12 credits</span>
                            </div>
                          )}
                        </>
                      )}

                      {/* एक्टिव बटन के ऊपर से गुजरने वाली बहुत ही हल्की रिफ्लेक्टिव लाइट वेव */}
                      {isSelected && !isThisGenerating && (
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="bg-red-50 border border-red-100
                              text-red-600 p-3 rounded-xl text-sm"
              >
                ❌ {error}
              </div>
            )}

            {/* Zoom Modal */}
            {zoomImage && (
              <div
                className="fixed inset-0 bg-black z-[60]
               flex flex-col"
                onClick={() => setZoomImage(null)}
              >
                {/* Top bar */}
                {/* ─── ULTRA-ADVANCE TOP HEADER BAR ─── */}
                <div
                  className="flex justify-between items-center px-4 py-3 bg-neutral-900/90 backdrop-blur-md border-b border-white/5 z-10 w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-black text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
                      <span className="text-amber-400 animate-pulse text-sm">
                        ✨
                      </span>{" "}
                      AI Generated Garment
                    </p>
                  </div>

                  {/* एक्शन्स कंटेनर - जो कभी नहीं दबेंगे */}
                  <div className="flex items-center gap-2.5 ml-auto flex-shrink-0">
                    {/* एडवांस डाउनलोड बटन - इन्लाइन स्टाइल के साथ ताकि बैकग्राउंड पर्पल ही रहे */}
                    <a
                      href={zoomImage}
                      download={`ai-garment-${Date.now()}.jpg`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        backgroundColor: "#7c3aed",
                      }} /* 👈 ज़बरदस्ती पर्पल बैकग्राउंड लॉक कर दिया */
                      className="text-white px-3.5 py-2 rounded-xl text-xs font-black tracking-wide transition-all shadow-lg shadow-purple-500/20 active:scale-95 flex items-center gap-1 flex-shrink-0 hover:brightness-110"
                    >
                      <span>📥</span> Download
                    </a>

                    {/* एनिमेटेड क्लोज बटन - विथ रिस्पॉन्सिव एक्टिव एनीमेशन */}
                    <button
                      onClick={() => setZoomImage(null)}
                      className="bg-white/10 text-white w-9 h-9 rounded-xl flex items-center justify-center font-bold flex-shrink-0 cursor-pointer border border-white/5 transition-all duration-300 hover:bg-red-500 hover:rotate-90 active:scale-75 active:rotate-180"
                    >
                      <span className="text-xs block leading-none">✕</span>
                    </button>
                  </div>
                </div>

                {/* Image */}
                <div className="flex-1 flex items-center justify-center p-4">
                  <img
                    src={zoomImage}
                    alt="Full size garment"
                    className="max-w-full max-h-full object-contain
                   rounded-2xl shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <p className="text-center text-gray-500 text-xs pb-4">
                  Tap anywhere to close
                </p>
              </div>
            )}
            {/* Generated Garment Preview */}
            {generatedImage && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-sm font-bold text-gray-600">
                    ✨ VTO AI Generated {GARMENT_LABELS[selectedGarment]}
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Generated Image - Clickable for zoom */}
                <div
                  className="relative rounded-2xl overflow-hidden
             bg-gray-50 cursor-zoom-in group"
                  onClick={() => setZoomImage(generatedImage)}
                >
                  <img
                    src={generatedImage}
                    alt="Generated garment"
                    className="w-full rounded-2xl object-contain
               max-h-80 group-hover:scale-105
               transition-transform duration-300"
                  />
                  <div
                    className="absolute top-3 right-3
                  bg-green-500 text-white text-xs
                  px-3 py-1 rounded-full font-bold"
                  >
                    ✅ VTO AI Generated
                  </div>
                  <div
                    className="absolute inset-0 flex items-center
                  justify-center opacity-0
                  group-hover:opacity-100 transition-all
                  bg-black bg-opacity-20"
                  >
                    <span
                      className="bg-white text-gray-800 px-4 py-2
                     rounded-full text-sm font-bold shadow-lg"
                    >
                      🔍 View
                    </span>
                  </div>
                </div>

                {/* Step 2: Try-On */}
                <div
                  className="mt-5 bg-gradient-to-br from-green-50
                                to-emerald-50 rounded-2xl p-5
                                border border-green-100"
                >
                  <h3 className="font-bold text-gray-800 mb-3">
                    Step 2: Upload your photo and Try it on! 📸
                  </h3>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-2">AI Garment</p>
                      <img
                        src={generatedImage}
                        alt=""
                        className="w-full h-28 object-contain
                                   rounded-xl bg-white border"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-2">Your Photo</p>
                      {humanPreview ? (
                        <img
                          src={humanPreview}
                          alt=""
                          className="w-full h-28 object-cover
                                     rounded-xl border"
                        />
                      ) : (
                        <div
                          className="w-full h-28 border-2 border-dashed
                                        border-gray-200 rounded-xl flex
                                        items-center justify-center
                                        text-gray-300"
                        >
                          Image Preview
                        </div>
                      )}
                    </div>
                  </div>

                  <label
                    className="flex items-center gap-3
                                    border-2 border-dashed
                                    border-green-200 rounded-2xl p-3
                                    cursor-pointer hover:border-green-400
                                    transition bg-white mb-4"
                  >
                    <span className="text-2xl">📸</span>
                    <span className="text-sm text-gray-500">
                      {humanImage
                        ? `✅ ${humanImage.name}`
                        : "Upload your straight facing photo"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setHumanImage(file);
                        setHumanPreview(URL.createObjectURL(file));
                      }}
                      className="hidden"
                    />
                  </label>

                  {(selectedGarment === "pant" ||
                    selectedGarment === "trouser" ||
                    selectedGarment === "formal pant") && (
                    <div
                      className="bg-amber-50 border border-amber-200
                  rounded-xl p-3 mb-3"
                    >
                      <p className="text-amber-700 text-xs font-medium">
                        ⚠️ For lower body garments, Upload a straight, Full-body
                        photo. For best results, Your entire body should be in
                        the frame.
                      </p>
                    </div>
                  )}

                   {(selectedGarment === "kurta" ||
  selectedGarment === "salwar_suit" ||
  selectedGarment === "saree" ||
  selectedGarment === "kurti" ||
  selectedGarment === "lehenga" ||
  selectedGarment === "gown") && (
  <div className="relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-4.5 mb-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(99,102,241,0.06)] font-sans group">
    {/* 🌌 बैकग्राउंड में सॉफ्ट और एलिगेंट इंडिगो/पर्पल ग्लो (भद्दा नहीं लगेगा) */}
    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl group-hover:from-indigo-500/8 group-hover:to-purple-500/8 transition-all duration-500"></div>

    <div className="flex items-start gap-4 relative z-10">
      {/* 🔮 सॉफ्ट पर्पल ग्रेडिएंट बैकग्राउंड वाला एडवांस कैमरा फोकस आइकन */}
      <div className="flex-shrink-0 relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 text-indigo-600 shadow-sm">
        <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4.5 h-4.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M10.125 9h3.75M10.125 12h3.75M10.125 15h3.75" />
        </svg>
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
      </div>
      
      {/* 📝 क्रिस्प और प्रीमियम डार्क स्लेट टेक्स्ट */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent text-[11px] font-bold tracking-widest uppercase">
            AI Draping Intelligence
          </h4>
          <span className="px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-purple-600 bg-purple-50 border border-purple-100 rounded-md">
            REQUIRED
          </span>
        </div>
        
        <p className="text-slate-600 text-xs leading-relaxed font-medium">
          For Traditional & Full-Length outfits, please upload a <strong className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold underline decoration-indigo-500/30 decoration-2 underline-offset-2">Straight, Full-Body Photo</strong>. Your entire frame (head-to-toe) must be visible for flawless AI garment stitching and texture mapping.
        </p>
      </div>
    </div>
  </div>
)}


                  <button
                    onClick={handleTryOn}
                    disabled={!humanImage || tryonStep}
                    className="w-full bg-gradient-to-r from-green-500
                               to-emerald-600 text-white py-3.5 rounded-2xl
                               font-bold disabled:opacity-40
                               hover:opacity-90 transition
                               flex items-center justify-center gap-2"
                  >
                    ✨ Try-On Now! (11 credits)
                  </button>
                </div>
              </div>
            )}

            {/* Try-On Result */}
            {tryonResult && typeof tryonResult === "string" && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-sm font-bold text-gray-600">
                    🎉 Final Result!
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                <img
                  src={tryonResult}
                  alt="Try-on result"
                  style={{ display: "block", width: "100%" }}
                  className="w-full rounded-2xl shadow-lg"
                  onLoad={() => console.log("✅ Fabric tryon image loaded!")}
                  onError={(e) => {
                    console.log("❌ Image failed:", e.target.src);
                    // Direct link show karo
                    e.target.style.display = "none";
                    e.target.parentNode.insertAdjacentHTML(
                      "afterend",
                      `<div class="text-center p-4 bg-gray-50 rounded-2xl">
        <p class="text-gray-500 text-sm mb-2">Image load nahi hui.</p>
        <a href="${tryonResult}" target="_blank"
           class="text-purple-600 underline text-sm font-bold">
          🔗 See Results (New Tab)
        </a>
      </div>`,
                    );
                  }}
                />

                {styleAdvice && (
                  <div
                    className="mt-4 bg-gradient-to-br from-purple-50
                                  to-indigo-50 rounded-2xl p-4"
                  >
                    <p className="font-bold text-purple-700 text-sm mb-2">
                      ✨ AI Style Advice
                    </p>
                    <p
                      className="text-gray-600 text-sm
                                  whitespace-pre-line leading-relaxed"
                    >
                      {styleAdvice}
                    </p>
                  </div>
                )}

                {/* Order Buttons */}
                <div className="mt-4 space-y-3">
                  {shop?.whatsapp && (
                    <a
                      href={`https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(
                        `📌 *NEW CUSTOM STITCH ORDER*\n\n` +
                          `👔 *Fabric:* ${product?.name || "N/A"}\n` +
                          `🏷️ *Brand:* ${product?.brand || "Standard"}\n` +
                          `🧵 *Material:* ${product?.fabricType || "N/A"}\n` +
                          `💰 *Price:* ₹${product?.price || "0"}\n\n` +
                          `📸 *Fabric Image:* ${product?.fabricImageUrl || "N/A"}\n` +
                          `💬 _Hi! Mujhe is fabric aur try-on result ke hisab se custom stitch order karna hai!_`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3.5 rounded-2xl font-bold text-center shadow-md shadow-green-500/10 hover:opacity-95 transition cursor-pointer text-sm"
                    >
                      <svg
                        xmlns="http://w3.org"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                      WhatsApp Par Order Karen
                    </a>
                  )}

                  {shop?.upiId && (
                    <button
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(shop.upiId);
                          alert(
                            `✅ UPI ID Copy Ho Gayi Hai!\n\nID: ${shop.upiId}\nAmount: ₹${product?.price || 0}`,
                          );
                        }
                      }}
                      className="flex items-center justify-center gap-2 w-full border border-slate-200 text-slate-700 py-3 rounded-2xl font-semibold bg-slate-50 hover:bg-slate-100 transition cursor-pointer text-sm"
                    >
                      <svg
                        xmlns="http://w3.org"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                      UPI Copy & Pay
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showMeasurement && (
        <MeasurementGuide
          onClose={() => setShowMeasurement(false)}
          onSave={(m) => {
            setSavedMeasurements(m);
            setShowMeasurement(false);
          }}
          existingMeasurements={savedMeasurements}
        />
      )}

      {showCalculator && (
        <StitchingCalculator
          product={product}
          measurements={savedMeasurements}
          onClose={() => setShowCalculator(false)}
        />
      )}
    </>
  );
}

// ─── Main Fabric Shop Page ────────────────
export default function FabricShop() {
  const { sellerId } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  // Advanced filters
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedOccasion, setSelectedOccasion] = useState("all");
  const [selectedPattern, setSelectedPattern] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [filterMeta, setFilterMeta] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const features = [
    "🧵 Unstitched to Stitched AI Magic",
    "✨ Virtual Try-On Technology",
    "👔 Custom Garment Preview",
    "📱 WhatsApp Custom Orders",
    "🎨 AI Style Advice",
  ];

  // SEO - Page title + meta tags
  useEffect(() => {
    if (shop) {
      // Title
      document.title = `${shop.name} - Fabric Shop | VirtualTryOn`;

      // Meta description
      const metaDesc =
        document.querySelector('meta[name="description"]') ||
        document.createElement("meta");
      metaDesc.name = "description";
      metaDesc.content =
        `${shop.name} 's fabric shop. ` +
        `${products.length} fabrics available. ` +
        `View AI-designed and stiched garments and try them on virtually!`;
      document.head.appendChild(metaDesc);

      // OG Tags
      const setOG = (property, content) => {
        const existing = document.querySelector(`meta[property="${property}"]`);
        const tag = existing || document.createElement("meta");
        tag.setAttribute("property", property);
        tag.content = content;
        if (!existing) document.head.appendChild(tag);
      };

      setOG("og:title", `${shop.name} - Fabric Shop`);
      setOG(
        "og:description",
        `See the stitched preview of the fabric using our AI!`,
      );
      setOG("og:type", "website");
      setOG("og:url", window.location.href);

      // Cleanup
      return () => {
        document.title = "VirtualTryOn";
      };
    }
  }, [shop, products]);

  // Typewriter
  useEffect(() => {
    const current = features[textIndex];
    let timeout;
    if (!isDeleting && displayText === current) {
      timeout = setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setTextIndex((i) => (i + 1) % features.length);
    } else {
      timeout = setTimeout(
        () => {
          setDisplayText((prev) =>
            isDeleting ? prev.slice(0, -1) : current.slice(0, prev.length + 1),
          );
        },
        isDeleting ? 50 : 80,
      );
    }
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayText, isDeleting, textIndex]);

  const fetchShop = useCallback(
    async (filters = {}) => {
      try {
        const params = new URLSearchParams();
        if (filters.color) params.append("color", filters.color);
        if (filters.brand) params.append("brand", filters.brand);
        if (filters.occasion && filters.occasion !== "all") {
          params.append("occasion", filters.occasion);
        }
        if (filters.pattern && filters.pattern !== "all") {
          params.append("pattern", filters.pattern);
        }
        if (filters.sort) params.append("sort", filters.sort);
        if (filters.minPrice) params.append("minPrice", filters.minPrice);
        if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);

        const queryString = params.toString();
        const url = `${API_URL}/api/fabric/shop/${sellerId}${queryString ? "?" + queryString : ""}`;

        const res = await axios.get(url);
        setShop(res.data.shop);
        setProducts(res.data.products);
        if (res.data.filterMeta) {
          setFilterMeta(res.data.filterMeta);
        }
      } catch (error) {
        setError("Fabric shop nahi mili!");
      } finally {
        setLoading(false);
      }
    },
    [sellerId],
  );

  useEffect(() => {
    if (sellerId) {
      fetchShop();
    }
  }, [sellerId, fetchShop]);

  const applyFilters = () => {
    setLoading(true);
    fetchShop({
      color: selectedColors.join(","),
      brand: selectedBrand,
      occasion: selectedOccasion,
      pattern: selectedPattern,
      sort: sortBy,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
    });
    setShowFilters(false);
  };

  const resetFilters = () => {
    setSelectedColors([]);
    setSelectedBrand("");
    setSelectedOccasion("all");
    setSelectedPattern("all");
    setSortBy("newest");
    setPriceRange({ min: "", max: "" });
    setLoading(true);
    fetchShop({});
  };

  const toggleColorFilter = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  };

  const activeFilterCount = [
    selectedColors.length > 0,
    selectedBrand !== "",
    selectedOccasion !== "all",
    selectedPattern !== "all",
    priceRange.min !== "" || priceRange.max !== "",
  ].filter(Boolean).length;

  const garmentTypes = [
    "all",
    ...new Set(products.flatMap((p) => p.availableGarments || [])),
  ];

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" || p.availableGarments?.includes(filter);
    return matchSearch && matchFilter;
  });

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center
                    justify-center bg-gray-50"
      >
        <div className="text-center">
          <div className="text-5xl mb-3 animate-bounce">🧵</div>
          <p className="text-purple-600 animate-pulse font-medium">
            Shop is loading...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div
        className="min-h-screen flex items-center
                    justify-center bg-gray-50"
      >
        <div className="text-center">
          <div className="text-5xl mb-3">😕</div>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div
        className="relative bg-gradient-to-br
                      from-slate-900 via-purple-900
                      to-indigo-900 overflow-hidden"
      >
        {/* Background effects */}
        <div className="absolute inset-0">
          <div
            className="absolute top-0 left-1/4 w-72 h-72
                          bg-purple-500 opacity-20 rounded-full
                          blur-3xl animate-pulse"
          />
          <div
            className="absolute bottom-0 right-1/4 w-64 h-64
                          bg-indigo-500 opacity-20 rounded-full
                          blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="relative z-10 text-center py-12 px-4">
          <div
            className="inline-flex items-center gap-2
                          bg-white bg-opacity-10 backdrop-blur-sm
                          border border-white border-opacity-20
                          rounded-full px-4 py-2 mb-4"
          >
            <span
              className="w-2 h-2 bg-green-400
                             rounded-full animate-pulse"
            />
            <span className="text-white text-sm font-medium">
              🧵 AI Fabric Studio
            </span>
          </div>

          <h1
            className="text-3xl md:text-5xl font-black
                         text-white mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {shop?.name}
          </h1>
          <p className="text-purple-200 text-sm md:text-base mb-3">
            Unstitched fabric ko AI se try karein!
          </p>

          {/* Typewriter */}
          <div
            className="bg-white bg-opacity-10 backdrop-blur-sm
                          rounded-full px-6 py-2 inline-block mb-6"
          >
            <p className="text-white text-sm font-medium min-w-48">
              {displayText}
              <span className="animate-pulse">|</span>
            </p>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-4 flex-wrap">
            {[
              { icon: "🧵", label: `${products.length} Fabrics` },
              { icon: "🤖", label: "AI Stitching" },
              { icon: "👗", label: "Virtual Try-On" },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white bg-opacity-10 backdrop-blur-sm
                           rounded-2xl px-4 py-2 text-white text-sm
                           border border-white border-opacity-20"
              >
                {s.icon} {s.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search + Filter */}
        {/* Search + Filter Bar */}
        <div className="space-y-3 mb-6">
          {/* Search + Filter Toggle Row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search any Fabrics"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-200
                   rounded-2xl px-5 py-3 pl-10 text-sm
                   focus:outline-none focus:border-purple-400
                   focus:ring-2 focus:ring-purple-100
                   transition shadow-sm"
              />
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2
                       text-gray-400"
              >
                🔍
              </span>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5
                 rounded-2xl text-sm font-semibold
                 transition shadow-sm border-2
                 ${
                   showFilters || activeFilterCount > 0
                     ? "bg-purple-600 text-white border-purple-600"
                     : "bg-white text-gray-600 border-gray-200"
                 }`}
            >
              <span>⚙️</span>
              Filter
              {activeFilterCount > 0 && (
                <span
                  className="bg-white text-purple-600 text-xs
                         font-black w-5 h-5 rounded-full
                         flex items-center justify-center"
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setLoading(true);
                fetchShop({
                  color: selectedColors.join(","),
                  brand: selectedBrand,
                  occasion: selectedOccasion,
                  pattern: selectedPattern,
                  sort: e.target.value,
                  minPrice: priceRange.min,
                  maxPrice: priceRange.max,
                });
              }}
              className="bg-white border-2 border-gray-200 rounded-2xl
                 px-3 py-2.5 text-sm font-medium text-gray-700
                 focus:outline-none focus:border-purple-400
                 cursor-pointer shadow-sm"
            >
              <option value="newest">🕐 Sort- Newest</option>
              <option value="price_asc">💰 Low to High</option>
              <option value="price_desc">💎 High to Low</option>
              <option value="name_asc">🔤 A to Z</option>
            </select>
          </div>

          {/* Advanced Filter Panel */}
          {showFilters && (
            <div
              className="bg-white rounded-2xl border-2
                    border-purple-100 p-5 shadow-lg space-y-5"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800">🎯 Advanced Filters</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-red-500 font-semibold
                       hover:underline"
                  >
                    ✕ Clear All
                  </button>
                )}
              </div>

              {/* Color Filter */}
              {filterMeta?.colors?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    🎨 Color
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filterMeta.colors.map((color) => {
                      const colorMap = {
                        Red: "#EF4444",
                        Blue: "#3B82F6",
                        Green: "#22C55E",
                        Yellow: "#EAB308",
                        Orange: "#F97316",
                        Purple: "#A855F7",
                        Pink: "#EC4899",
                        Black: "#1F2937",
                        White: "#F3F4F6",
                        Grey: "#9CA3AF",
                        Brown: "#92400E",
                        Cream: "#FEF3C7",
                        Navy: "#1E3A5F",
                        Maroon: "#7F1D1D",
                        Teal: "#0D9488",
                        Gold: "#D97706",
                      };
                      const isSelected = selectedColors.includes(color);
                      return (
                        <button
                          key={color}
                          onClick={() => toggleColorFilter(color)}
                          className={`flex items-center gap-1.5 px-3 py-1.5
                             rounded-full text-xs font-semibold
                             border-2 transition-all
                             ${
                               isSelected
                                 ? "border-purple-600 bg-purple-50 text-purple-700"
                                 : "border-gray-200 text-gray-600 hover:border-gray-400"
                             }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-gray-200"
                            style={{ background: colorMap[color] || "#888" }}
                          />
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Brand Filter */}
              {filterMeta?.brands?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    🏷️ Brand
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedBrand("")}
                      className={`px-3 py-1.5 rounded-full text-xs
                         font-semibold border-2 transition
                         ${
                           selectedBrand === ""
                             ? "border-purple-600 bg-purple-50 text-purple-700"
                             : "border-gray-200 text-gray-600"
                         }`}
                    >
                      All Brands
                    </button>
                    {filterMeta.brands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() =>
                          setSelectedBrand(selectedBrand === brand ? "" : brand)
                        }
                        className={`px-3 py-1.5 rounded-full text-xs
                           font-semibold border-2 transition
                           ${
                             selectedBrand === brand
                               ? "border-purple-600 bg-purple-50 text-purple-700"
                               : "border-gray-200 text-gray-600"
                           }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Occasion Filter */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  🎭 Occasion
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { v: "all", l: "🛍️ All" },
                    { v: "casual", l: "👕 Casual" },
                    { v: "formal", l: "👔 Formal" },
                    { v: "wedding", l: "💍 Wedding" },
                    { v: "festival", l: "🪔 Festival" },
                    { v: "party", l: "🎉 Party" },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      onClick={() => setSelectedOccasion(opt.v)}
                      className={`px-3 py-1.5 rounded-full text-xs
                         font-semibold border-2 transition
                         ${
                           selectedOccasion === opt.v
                             ? "border-purple-600 bg-purple-50 text-purple-700"
                             : "border-gray-200 text-gray-600"
                         }`}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pattern Filter */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  🔷 Pattern
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { v: "all", l: "✨ All" },
                    { v: "solid", l: "⬛ Solid" },
                    { v: "stripes", l: "〓 Stripes" },
                    { v: "checks", l: "▦ Checks" },
                    { v: "floral", l: "🌸 Floral" },
                    { v: "printed", l: "🖨️ Printed" },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      onClick={() => setSelectedPattern(opt.v)}
                      className={`px-3 py-1.5 rounded-full text-xs
                         font-semibold border-2 transition
                         ${
                           selectedPattern === opt.v
                             ? "border-purple-600 bg-purple-50 text-purple-700"
                             : "border-gray-200 text-gray-600"
                         }`}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  💰 Price Range (₹)
                </p>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder={`Min (${filterMeta?.priceRange?.min || 0})`}
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange((p) => ({ ...p, min: e.target.value }))
                    }
                    className="flex-1 border border-gray-200 rounded-xl
                       px-3 py-2 text-sm focus:outline-none
                       focus:border-purple-400"
                  />
                  <span className="text-gray-400 text-sm">—</span>
                  <input
                    type="number"
                    placeholder={`Max (${filterMeta?.priceRange?.max || ""})`}
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange((p) => ({ ...p, max: e.target.value }))
                    }
                    className="flex-1 border border-gray-200 rounded-xl
                       px-3 py-2 text-sm focus:outline-none
                       focus:border-purple-400"
                  />
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={applyFilters}
                className="w-full bg-gradient-to-r from-purple-600
                   to-indigo-600 text-white py-3 rounded-2xl
                   font-bold text-sm hover:opacity-90 transition"
              >
                🎯 Apply Filters
              </button>
            </div>
          )}

          {/* Garment Type Quick Filter (jo pehle tha) */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilter("all")}
              className={`flex-shrink-0 px-4 py-2 rounded-full
                 text-sm font-medium transition
                 ${
                   filter === "all"
                     ? "bg-purple-600 text-white"
                     : "bg-white text-gray-600 border border-gray-200"
                 }`}
            >
              🛍️ All
            </button>
            {garmentTypes.slice(1).map((g) => (
              <button
                key={g}
                onClick={() => setFilter(g)}
                className={`flex-shrink-0 px-4 py-2 rounded-full
                   text-sm font-medium transition whitespace-nowrap
                   ${
                     filter === g
                       ? "bg-purple-600 text-white"
                       : "bg-white text-gray-600 border border-gray-200"
                   }`}
              >
                {GARMENT_LABELS[g] || g}
              </button>
            ))}
          </div>

          {/* Active filters display */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-gray-400">Active:</span>
              {selectedColors.map((c) => (
                <span
                  key={c}
                  className="bg-purple-100 text-purple-700 text-xs
                     px-2 py-1 rounded-full flex items-center gap-1"
                >
                  {c}
                  <button
                    onClick={() => toggleColorFilter(c)}
                    className="hover:text-red-500"
                  >
                    ✕
                  </button>
                </span>
              ))}
              {selectedBrand && (
                <span
                  className="bg-purple-100 text-purple-700 text-xs
                         px-2 py-1 rounded-full flex items-center gap-1"
                >
                  {selectedBrand}
                  <button
                    onClick={() => setSelectedBrand("")}
                    className="hover:text-red-500"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">🧵</div>
            <p className="text-gray-400 text-lg">No any fabric found !</p>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 md:grid-cols-3
                          lg:grid-cols-4 gap-4"
          >
            {filtered.map((product) => {
              const hasPreview = product.generatedPreviews?.length > 0;
              return (
                <div
                  key={product._id}
                  onClick={() => setSelectedProduct(product)}
                  className="bg-white rounded-2xl overflow-hidden
                             shadow-sm hover:shadow-lg transition-all
                             duration-300 hover:-translate-y-1 cursor-pointer
                             border border-gray-100 group"
                >
                  {/* Fabric Image */}
                  <div className="relative h-48 overflow-hidden bg-gray-50">
                    <img
                      src={product.fabricImageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover
                                 group-hover:scale-105 transition-transform
                                 duration-300"
                    />

                    {/* AI Preview Badge */}
                    {hasPreview && (
                      <div
                        className="absolute top-2 left-2
                                      bg-purple-600 text-white text-xs
                                      px-2 py-1 rounded-full font-bold"
                      >
                        ✨ AI Garment Preview Ready
                      </div>
                    )}

                    {/* Hover Overlay - अल्टीमेट साइबर-ग्लास यूआई */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-purple-950/40 via-black/10 to-transparent
             opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out
             flex items-center justify-center backdrop-blur-[2px]"
                    >
                      {/* एडवांस एनिमेटेड होवर बटन */}
                      <span
                        className="relative px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest
               text-white bg-white/10 backdrop-blur-xl border border-white/20
               shadow-[0_8px_32px_0_rgba(121,40,202,0.3)]
               transform scale-90 group-hover:scale-100 transition-all duration-500 ease-out
               flex items-center gap-2 overflow-hidden group/btn cursor-pointer"
                      >
                        {/* बैकग्राउंड में चमकने वाली धीरे से चलती हुई ओरोरा लाइट */}
                        <span className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 mix-blend-overlay"></span>

                        {/* छोटा और बोल्ड मैजिक स्पार्कल आइकॉन जो पल्स करेगा */}
                        <svg
                          xmlns="http://w3.org"
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-cyan-400 animate-pulse [animation-duration:1.5s]"
                        >
                          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
                        </svg>

                        {/* मुख्य टेक्स्ट जो थोड़ा सा शैडो इफेक्ट के साथ है */}
                        <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                          Try it Now
                        </span>

                        {/* बटन के ऊपर बहुत ही तेजी से गुजरने वाली एक रिफ्लेक्टिव लाइट (Shimmer) */}
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite_ease-in-out]"></span>
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    {/* 1. Product Name - Always capitalized */}
                    <h3 className="font-bold text-gray-800 text-base truncate capitalize">
                      {product.name}
                    </h3>

                    {/* 2. Brand Name Tag */}
                    {product.brand ? (
                      <div>
                        <span className="inline-block bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                          {product.brand}
                        </span>
                      </div>
                    ) : (
                      /* Invisible placeholder taaki spacing na bigde agar brand na ho */
                      <div className="h-[21px]"></div>
                    )}

                    {/* 3. Fabric Type */}
                    {product.fabricType ? (
                      <p className="text-gray-400 text-xs capitalize truncate">
                        {product.fabricType}
                      </p>
                    ) : (
                      /* Invisible placeholder for consistent alignment */
                      <p className="text-transparent text-xs">None</p>
                    )}

                    {/* 4. Price Section */}
                    <p className="text-purple-600 font-black text-lg pt-1">
                      ₹{product.price}
                    </p>

                    {/* 5. Available Garments Badges */}
                    <div className="flex flex-wrap gap-1 h-5 overflow-hidden">
                      {product.availableGarments?.slice(0, 3).map((g, i) => (
                        <span
                          key={i}
                          className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-lg font-medium whitespace-nowrap"
                        >
                          {GARMENT_LABELS[g]?.split(" ").slice(1).join(" ")}
                        </span>
                      ))}

                      {(product.availableGarments?.length || 0) > 3 && (
                        <span className="text-xs text-gray-400 self-center pl-1">
                          +{product.availableGarments.length - 3}
                        </span>
                      )}
                    </div>

                    <button
                      className="w-full py-3.5 rounded-2xl font-black text-sm tracking-wider text-white
             relative overflow-hidden transition-all duration-500 ease-out
             bg-gradient-to-r from-[#ff007f] via-[#7928ca] to-[#00dfd8]
             bg-[size:200%_auto] hover:bg-[position:right_center]
             shadow-[0_0_20px_rgba(121,40,202,0.2)] 
             hover:shadow-[0_0_35px_rgba(255,0,127,0.4)]
             border border-white/10 backdrop-blur-md
             transform hover:-translate-y-1 active:scale-[0.97] 
             flex items-center justify-center gap-3 group cursor-pointer"
                    >
                      {/* 1. मूविंग ओरोरा लाइट (Aurora Mesh) - जो बटन के अंदर धीरे-धीरे घूमेगी */}
                      <span className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 via-transparent to-pink-500/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-700"></span>

                      {/* 2. एडवांस नियन आइकॉन (Neon Glow Ring के साथ) */}
                      <div className="relative flex items-center justify-center bg-white/20 p-1.5 rounded-xl transition-all duration-300 group-hover:bg-white/30 group-hover:rotate-12">
                        {/* पीछे पल्स करता हुआ साइबर-पिंग */}
                        <span className="absolute inline-flex h-full w-full rounded-xl bg-cyan-400/50 animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>

                        {/* सुई, धागा और क्राफ्ट को दर्शाने वाला 3D-स्टाइल लाइन SVG */}
                        <svg
                          xmlns="http://w3.org"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="relative z-10 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                        >
                          <path d="M4 12a8 8 0 0 1 16 0M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <circle
                            cx="18"
                            cy="6"
                            r="1"
                            className="fill-cyan-300 stroke-none animate-pulse"
                          />
                        </svg>
                      </div>

                      {/* 3. बोल्ड और एनिमेटेड टेक्स्ट */}
                      <span className="relative z-10 uppercase font-black text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] tracking-widest group-hover:scale-105 transition-transform duration-300">
                        Try it Now
                      </span>

                      {/* 4. सुपर-फास्ट रिफ्लेक्टिव शिमर वेव */}
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite_ease-in-out]"></span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <FabricProductModal
          product={selectedProduct}
          shop={shop}
          apiKey={shop?.apiKey}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Voice Assistant */}
      <VoiceAssistant
        pageType="fabric"
        shopName={shop?.name || ""}
        language="hi"
      />

      {/* Try-On Gallery */}
<TryOnGallery
  shop={shop}
  apiKey={shop?.apiKey}
/>
    </div>
  );
}
