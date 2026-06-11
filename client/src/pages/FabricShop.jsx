import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import API_URL from "../api";
// eslint-disable-next-line
import { useCustomer } from "../context/CustomerContext";

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
  const steps = [
    { emoji: "🧵", text: "Fabric is being analyzed..." },
    { emoji: "✂️", text: "AI is stitching..." },
    { emoji: "👔", text: "Garment is being prepared..." },
    { emoji: "✨", text: "Final touches..." },
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((p) => (p === steps.length - 1 ? 0 : p + 1));
    }, 2000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75
                    z-50 flex items-center justify-center
                    backdrop-blur-sm"
    >
      <div
        className="bg-white rounded-3xl p-10 text-center
                      max-w-sm w-full mx-4 shadow-2xl"
      >
        {/* Animated rings */}
        <div className="relative w-28 h-28 mx-auto mb-6">
          <div
            className="absolute inset-0 rounded-full
                          border-4 border-purple-100"
          />
          <div
            className="absolute inset-0 rounded-full
                          border-4 border-purple-600
                          border-t-transparent animate-spin"
          />
          <div
            className="absolute inset-2 rounded-full
                          border-4 border-indigo-200
                          border-b-transparent animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          />
          <div
            className="absolute inset-0 flex items-center
                          justify-center text-4xl"
          >
            {steps[index].emoji}
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {step === "generate"
            ? "AI is making the garment!"
            : "The Virtual Try-on is in progress!"}
        </h3>
        <p className="text-purple-600 font-medium animate-pulse">
          {steps[index].text}
        </p>

        <div className="flex justify-center gap-2 mt-5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500
                         ${
                           i === index
                             ? "w-6 bg-purple-600"
                             : "w-1.5 bg-gray-200"
                         }`}
            />
          ))}
        </div>

        <p className="text-gray-400 text-xs mt-4">
          It will take 30-60 seconds, Please wait patiently... 😊
        </p>
      </div>
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
      setGeneratedImage(cached.imageUrl);
      return;
    }

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

  return (
    <>
      {(generating || tryonStep) && (
        <FabricAnimation step={generating ? "generate" : "tryon"} />
      )}

      <div
        className="fixed inset-0 bg-black bg-opacity-75
                      z-40 flex items-end md:items-center
                      justify-center p-0 md:p-4"
      >
        <div
          className="bg-white w-full md:max-w-2xl
                        rounded-t-3xl md:rounded-3xl
                        max-h-screen overflow-y-auto shadow-2xl"
        >
          {/* 1. ADVANCE HEADER (Sticky) */}
          <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-white/80 backdrop-blur-md rounded-t-3xl sticky top-0 z-10">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                {/* फैब्रिक रोल का छोटा सा प्रीमियम आइकॉन */}
                <svg
                  xmlns="http://w3.org"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-purple-600"
                >
                  <path d="M4 12a8 8 0 0 1 16 0M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
                </svg>
                <h2 className="text-lg font-black text-gray-800 tracking-wide">
                  {product.name}
                </h2>
              </div>
              <p className="text-xs font-semibold text-purple-600/80 bg-purple-50 px-2 py-0.5 rounded-md inline-block">
                {product.fabricType}
              </p>
            </div>

            {/* मॉडर्न क्लोज़ बटन */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 border border-gray-200/40 transform active:scale-95 transition-all duration-200 cursor-pointer"
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
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="p-5 space-y-6">
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
                  <span>Per Meter Price : </span>₹{product.pricePerMeter} per
                  meter
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
            {product.description && (
              <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                <p className="text-gray-600 text-sm leading-relaxed font-medium">
                  {product.description}
                </p>
              </div>
            )}

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

                  return (
                    <button
                      key={garment}
                      onClick={() => handleGenerateGarment(garment)}
                      className={`relative p-3.5 rounded-xl text-xs font-bold transition-all duration-300
                     flex flex-col justify-between items-start gap-2 shadow-sm overflow-hidden
                     transform active:scale-[0.97] group cursor-pointer border-2
                     ${
                       isSelected
                         ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent shadow-md shadow-purple-500/20"
                         : "bg-white text-gray-700 border-gray-100 hover:border-purple-400 hover:shadow-md hover:shadow-purple-500/5"
                     }`}
                    >
                      {/* बटन का मुख्य टेक्स्ट */}
                      <span className="tracking-wide relative z-10 transition-transform duration-300 group-hover:translate-x-0.5">
                        {GARMENT_LABELS[garment]}
                      </span>

                      {/* कंडीशन के आधार पर स्टेटस पिल्स (Status Pills) */}
                      {cached ? (
                        // 1. अगर प्रीव्यू पहले से कैश्ड (Cached) है - सुरक्षित ग्रीन पिल
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
                        // 2. अगर नया जनरेट करना है - क्रेडिट्स काउंट पिल (गोल्डन/नियोन लुक)
                        <div
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider relative z-10 transition-all duration-300
                            ${isSelected ? "bg-white/20 text-white/90" : "bg-amber-50 text-amber-600 group-hover:bg-amber-100"}`}
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

                      {/* एक्टिव बटन के ऊपर से गुजरने वाली बहुत ही हल्की रिफ्लेक्टिव लाइट वेव */}
                      {isSelected && (
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
                <div
                  className="flex justify-between items-center
                    p-4 bg-black bg-opacity-80"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-white font-semibold">
                    ✨ AI Generated Garment
                  </p>
                  <div className="flex gap-3">
                    {/* Download button */}

                    <a
                      href={zoomImage}
                      download="ai-garment.jpg"
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white text-gray-800 px-4 py-2
                     rounded-full text-sm font-bold
                     hover:bg-gray-100 transition"
                    >
                      ⬇️ Download
                    </a>
                    <button
                      onClick={() => setZoomImage(null)}
                      className="bg-white bg-opacity-20 text-white
                     w-10 h-10 rounded-full flex items-center
                     justify-center hover:bg-opacity-30"
                    >
                      ✕
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
                          Upload your photo
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

                  <button
                    onClick={handleTryOn}
                    disabled={!humanImage || tryonStep}
                    className="w-full bg-gradient-to-r from-green-500
                               to-emerald-600 text-white py-3.5 rounded-2xl
                               font-bold disabled:opacity-40
                               hover:opacity-90 transition
                               flex items-center justify-center gap-2"
                  >
                    ✨ Try-On Now! (8 credits)
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
          🔗 Result Dekho (New Tab)
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
                <div className="mt-4 space-y-2">
                  {shop?.whatsapp && (
                    <a
                      href={`https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(
                        `Hi! Maine fabric try on kiya!\n\n` +
                          `Fabric: ${product.name}\n` +
                          `Price: ₹${product.price}\n\n` +
                          `Custom stitch order karna hai!`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full bg-green-500 text-white
                                 py-4 rounded-2xl font-bold text-center
                                 hover:bg-green-600 transition"
                    >
                      📱 WhatsApp Par Custom Order Karen!
                    </a>
                  )}
                  {shop?.upiId && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shop.upiId);
                        alert(`UPI: ${shop.upiId}\nAmount: ₹${product.price}`);
                      }}
                      className="w-full border-2 border-green-500
                                 text-green-600 py-3 rounded-2xl
                                 font-semibold hover:bg-green-50 transition"
                    >
                      💳 UPI Se Pay Karen
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

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/fabric/shop/${sellerId}`);
        setShop(res.data.shop);
        setProducts(res.data.products);
      } catch {
        setError("Fabric shop nahi mili!");
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) {
      fetchShop();
    }
  }, [sellerId]);

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
        <div className="space-y-3 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder=" Search Fabric.."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200
                         rounded-2xl px-5 py-3 pl-12 text-sm
                         focus:outline-none focus:border-purple-400
                         focus:ring-2 focus:ring-purple-100
                         transition shadow-sm"
            />
            <span
              className="absolute left-4 top-1/2
                             -translate-y-1/2 text-gray-400"
            >
              🔍
            </span>
          </div>

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

                  <div className="p-4">
                    <h3
                      className="font-bold text-gray-800 text-sm
                                   truncate mb-1"
                    >
                      {product.name}
                    </h3>
                    {product.fabricType && (
                      <p className="text-gray-400 text-xs mb-2">
                        {product.fabricType}
                      </p>
                    )}

                    <p className="text-purple-600 font-black text-lg mb-2">
                      ₹{product.price}
                    </p>

                    {/* Available garments */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.availableGarments?.slice(0, 3).map((g) => (
                        <span
                          key={g}
                          className="text-xs bg-purple-50 text-purple-600
                                     px-1.5 py-0.5 rounded-lg"
                        >
                          {GARMENT_LABELS[g]?.split(" ").slice(1).join(" ")}
                        </span>
                      ))}
                      {(product.availableGarments?.length || 0) > 3 && (
                        <span className="text-xs text-gray-400">
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
    </div>
  );
}
