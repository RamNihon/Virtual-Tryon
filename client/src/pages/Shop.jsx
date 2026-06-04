import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import API_URL from "../api";

// Helper function - order track karo
const trackOrder = async (product, orderType, shop) => {
  try {
    await axios.post(`${API_URL}/api/seller/track-order`, {
      sellerId: shop.sellerId,
      productId: product._id,
      productName: product.name,
      productPrice: product.price,
      orderType,
    });
  } catch (e) {
    // Silent fail - tracking fail hone par
    // user experience affect nahi hona chahiye
    console.log("Track error:", e.message);
  }
};
// ─── Loading Animation ────────────────────
function TryOnAnimation() {
  const MESSAGES = [
    { emoji: "📸", text: "Photo is getting uploaded..." },
    { emoji: "🤖", text: "AI is working..." },
    { emoji: "👗", text: "Cloth is getting fitted..." },
    { emoji: "✨", text: "Style advice is generating..." },
    { emoji: "🎨", text: "Result is getting ready..." },
  ];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setIndex((p) => (p === MESSAGES.length - 1 ? 0 : p + 1));
    }, 1800);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70
                    z-50 flex items-center justify-center
                    backdrop-blur-sm"
    >
      <div
        className="bg-white rounded-3xl p-10 text-center
                      shadow-2xl max-w-sm w-full mx-4"
      >
        <div className="relative w-28 h-28 mx-auto mb-6">
          <div
            className="absolute inset-0 rounded-full
                          border-4 border-purple-100"
          />
          <div
            className="absolute inset-0 rounded-full
                          border-4 border-purple-600
                          border-t-transparent
                          border-r-transparent animate-spin"
          />
          <div
            className="absolute inset-3 rounded-full
                          bg-purple-50 animate-pulse
                          flex items-center justify-center text-4xl"
          >
            {MESSAGES[index].emoji}
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          AI Magic is Working!
        </h3>
        <p className="text-purple-600 font-medium animate-pulse">
          {MESSAGES[index].text}
        </p>
        <div className="flex justify-center gap-2 mt-6">
          {MESSAGES.map((_, i) => (
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
          It will take 20-30 seconds 😊
        </p>
      </div>
    </div>
  );
}

// ─── Image Slider ─────────────────────────
function ImageSlider({ images, onClick }) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);

  if (!images || images.length === 0) return null;

  const prev = (e) => {
    e.stopPropagation();
    setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  };

  const next = (e) => {
    e.stopPropagation();
    setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
  };

  // Touch/Swipe support
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next(e) : prev(e);
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="relative w-full h-64 overflow-hidden
             bg-white rounded-t-2xl cursor-pointer"
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={images[current]}
        alt="product"
        className="w-full h-64 object-contain p-2
                   transition-all duration-300"
        style={{ imageRendering: "high-quality" }}
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2
                       -translate-y-1/2 bg-white shadow-md
                       rounded-full w-8 h-8 flex items-center
                       justify-center text-gray-600
                       hover:bg-gray-50 transition z-10"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2
                       -translate-y-1/2 bg-white shadow-md
                       rounded-full w-8 h-8 flex items-center
                       justify-center text-gray-600
                       hover:bg-gray-50 transition z-10"
          >
            ›
          </button>
          <div
            className="absolute bottom-2 left-1/2
                          -translate-x-1/2 flex gap-1.5"
          >
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(i);
                }}
                className={`h-1.5 rounded-full transition-all
                           ${
                             i === current
                               ? "w-4 bg-purple-600"
                               : "w-1.5 bg-gray-300"
                           }`}
              />
            ))}
          </div>
          <div
            className="absolute top-2 right-2
                          bg-black bg-opacity-50 text-white
                          text-xs px-2 py-1 rounded-full"
          >
            {current + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
}

function ZoomModal({ images, initialIndex, onClose }) {
  const [current, setCurrent] = useState(initialIndex || 0);
  const [scale, setScale] = useState(1);
  const touchStartX = useRef(null);

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
      setScale(1);
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="fixed inset-0 bg-black z-[100]
                 flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div
        className="flex justify-between items-center
                      px-4 py-3 bg-black"
      >
        <p className="text-white text-sm">
          {current + 1} / {images.length}
        </p>
        <div className="flex gap-3 items-center">
          {/* Zoom buttons */}
          <button
            onClick={() => setScale((s) => Math.min(s + 0.5, 3))}
            className="text-white text-xl w-9 h-9
                       bg-white bg-opacity-20
                       rounded-full flex items-center
                       justify-center"
          >
            🔍
          </button>
          <button
            onClick={() => setScale(1)}
            className="text-white text-xs
                       bg-white bg-opacity-20
                       px-3 py-1.5 rounded-full"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="text-white text-xl w-9 h-9
                       bg-white bg-opacity-20
                       rounded-full flex items-center
                       justify-center"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Image */}
      <div
        className="flex-1 flex items-center
                      justify-center overflow-hidden
                      relative"
      >
        <img
          src={images[current]}
          alt="zoom"
          style={{
            transform: `scale(${scale})`,
            transition: "transform 0.2s",
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />

        {/* Side arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => {
                prev();
                setScale(1);
              }}
              className="absolute left-3 top-1/2
                         -translate-y-1/2 bg-white
                         bg-opacity-20 text-white
                         rounded-full w-10 h-10
                         flex items-center justify-center
                         text-2xl"
            >
              ‹
            </button>
            <button
              onClick={() => {
                next();
                setScale(1);
              }}
              className="absolute right-3 top-1/2
                         -translate-y-1/2 bg-white
                         bg-opacity-20 text-white
                         rounded-full w-10 h-10
                         flex items-center justify-center
                         text-2xl"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div
          className="flex gap-2 p-3 bg-black
                        overflow-x-auto justify-center"
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrent(i);
                setScale(1);
              }}
              className={`flex-shrink-0 w-14 h-14
                         rounded-lg overflow-hidden border-2
                         ${
                           i === current
                             ? "border-purple-500"
                             : "border-transparent opacity-50"
                         }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <p
        className="text-center text-gray-500
                    text-xs pb-3"
      >
        Swipe to navigate · Tap 🔍 to zoom
      </p>
    </div>
  );
}

// ─── Product Detail Modal ─────────────────
function ProductModal({ product, shop, onClose, onTryOn }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomImages, setZoomImages] = useState(null);
  const [zoomIndex, setZoomIndex] = useState(0);
  const images =
    product.images?.length > 0 ? product.images : [product.imageUrl];

  const openImageZoom = (imageIndex = 0) => {
    setZoomIndex(imageIndex);
    setZoomImages(images);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-70
                      z-40 flex items-end md:items-center
                      justify-center p-0 md:p-4"
        onClick={onClose}
      >
        <div
          className="bg-white w-full md:max-w-2xl
                        rounded-t-3xl md:rounded-3xl
                        max-h-screen overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex justify-between items-center
                          p-5 border-b sticky top-0 bg-white
                          z-10 rounded-t-3xl"
          >
            <h2 className="text-lg font-bold text-gray-800">{product.name}</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100
                         flex items-center justify-center
                         text-gray-500 hover:bg-gray-200
                         transition text-lg"
            >
              ✕
            </button>
          </div>

          <div className="p-5">
            {/* Main Image */}
            <div className="bg-white rounded-2xl mb-4 relative overflow-hidden border border-gray-100">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-72 object-contain p-4 cursor-zoom-in"
                onClick={() => openImageZoom(selectedImage)}
              />
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                      i === selectedImage
                        ? "border-purple-500"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Product Info */}
            <div className="mb-5">
              <h3 className="text-2xl font-bold text-gray-800 mb-1">
                {product.name}
              </h3>
              <p className="text-3xl font-black text-purple-600 mb-2">
                ₹{product.price}
              </p>
              <span
                className="bg-purple-100 text-purple-700
                               px-3 py-1 rounded-full text-sm
                               font-medium capitalize"
              >
                {product.category?.replace("_", " ")}
              </span>
              {product.description && (
                <p className="text-gray-500 mt-3 leading-relaxed text-sm">
                  {product.description}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (product.inStock === false) return;
                  onTryOn(product);
                }}
                disabled={product.inStock === false}
                className={`w-full  py-4 rounded-2xl
                           font-bold text-lg hover:opacity-90
                           transition flex items-center
                           justify-center gap-2 shadow-lg
                           shadow-purple-200
                           ${
                             product.inStock === false
                               ? "bg-gray-100 text-red-500 cursor-not-allowed"
                               : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90"
                           }`}
              >
                {product.inStock === false
                  ? "❌ Out of Stock"
                  : "👗 Virtual Try On Karen!"}
              </button>

              {shop?.whatsapp && (
                <a
                  href={`https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(
                    `Hi! Mujhe yeh chahiye:\n👗 ${product.name}\n💰 ₹${product.price}\n\nKya available hai?`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackOrder(product, "whatsapp")}
                  className="w-full bg-green-500 text-white
                             py-4 rounded-2xl font-bold text-base
                             hover:bg-green-600 transition
                             flex items-center justify-center gap-2"
                >
                  📱 WhatsApp Par Order Karen
                </a>
              )}

              {shop?.upiId && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shop.upiId);
                    alert(
                      `UPI ID copied!\n${shop.upiId}\nAmount: ₹${product.price}`,
                    );
                  }}
                  className="w-full border-2 border-green-500
                             text-green-600 py-3.5 rounded-2xl
                             font-semibold hover:bg-green-50
                             transition flex items-center
                             justify-center gap-2"
                >
                  💳 UPI Se Pay Karen
                </button>
              )}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t">
              {["🔒 Secure", "📦 Fast Delivery", "↩️ Easy Returns"].map(
                (b, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 text-gray-600
                               px-3 py-1.5 rounded-full text-xs
                               font-medium"
                  >
                    {b}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
      {zoomImages && (
        <ZoomModal
          images={zoomImages}
          initialIndex={zoomIndex}
          onClose={() => {
            setZoomImages(null);
            setZoomIndex(0);
          }}
        />
      )}
    </>
  );
}

// ─── Try-On Modal ─────────────────────────
function TryOnModal({ product, shop, onClose, selectedProduct }) {
  const [humanImage, setHumanImage] = useState(null);
  const [humanPreview, setHumanPreview] = useState(null);
  const [tryonLoading, setTryonLoading] = useState(false);
  const [tryonResult, setTryonResult] = useState(null);
  const [styleAdvice, setStyleAdvice] = useState(null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setHumanImage(file);
    setHumanPreview(URL.createObjectURL(file));
  };

  const handleTryOn = async () => {
    if (!humanImage) {
      alert("Pehle apni photo upload karen!");
      return;
    }
    setTryonLoading(true);
    setTryonResult(null);
    setStyleAdvice(null);
    try {
      const formData = new FormData();
      formData.append("humanImage", humanImage);
      formData.append("garmentUrl", product.imageUrl);
      formData.append("description", product.category);

      const res = await axios.post(`${API_URL}/api/tryon`, formData, {
        headers: {
          "x-api-key": shop.apiKey,
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data.success) {
        setTryonResult(res.data.resultImage);
        setStyleAdvice(res.data.styleAdvice);
      }
    } catch {
      alert("Found an error! Please try again.");
    } finally {
      setTryonLoading(false);
    }
  };

  return (
    <>
      {tryonLoading && <TryOnAnimation />}

      <div
        className="fixed inset-0 bg-black bg-opacity-70
                      z-40 flex items-end md:items-center
                      justify-center p-0 md:p-4"
        onClick={onClose}
      >
        <div
          className="bg-white w-full md:max-w-lg
                        rounded-t-3xl md:rounded-3xl
                        max-h-screen overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex justify-between items-center
                          p-5 border-b sticky top-0 bg-white z-10
                          rounded-t-3xl"
          >
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                👗 Virtual Try-On
              </h2>
              <p className="text-xs text-gray-400">{product.name}</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100
                         flex items-center justify-center
                         text-gray-500 hover:bg-gray-200 transition"
            >
              ✕
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Preview Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-2 font-medium">
                  👕 Cloth's Photo
                </p>
                <div
                  className="bg-gray-50 rounded-2xl
                                aspect-square overflow-hidden"
                >
                  <img
                    src={product.imageUrl}
                    alt="product"
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-2 font-medium">
                  📸 Your Photo
                </p>
                <div
                  className="bg-gray-50 rounded-2xl
                                aspect-square overflow-hidden
                                flex items-center justify-center"
                >
                  {humanPreview ? (
                    <img
                      src={humanPreview}
                      alt="you"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-3">
                      <div className="text-3xl mb-1">📷</div>
                      <p className="text-gray-300 text-xs">Upload karen</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Upload */}
            <div>
              <label
                className="block text-sm font-semibold
                                text-gray-700 mb-2"
              >
                Upload your photo
              </label>
              <label
                className="flex flex-col items-center
                                justify-center w-full h-24
                                border-2 border-dashed
                                border-purple-200 rounded-2xl
                                cursor-pointer hover:border-purple-400
                                hover:bg-purple-50 transition bg-gray-50"
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">📸</div>
                  <p className="text-sm text-gray-400">
                    {humanImage
                      ? `✅ ${humanImage.name}`
                      : "Apni photo yahan upload karen"}
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-purple-500 mt-1.5">
                💡 Seedhi khadi photo best result deti hai!
              </p>
            </div>

            {/* Try On Button */}
            <button
              onClick={handleTryOn}
              disabled={tryonLoading || !humanImage}
              className="w-full bg-gradient-to-r from-purple-600
                         to-indigo-600 text-white py-4 rounded-2xl
                         font-bold text-lg hover:opacity-90
                         transition disabled:opacity-40
                         flex items-center justify-center gap-2
                         shadow-lg shadow-purple-200"
            >
              ✨ Try On Karen!
            </button>

            {/* Result */}
            {tryonResult && (
              <div>
                {/* Fullscreen Result */}
                <div
                  className="fixed inset-0 bg-black z-50
                    flex flex-col"
                >
                  {/* Header */}
                  <div
                    className="flex justify-between items-center
                      px-4 py-3 bg-black bg-opacity-80"
                  >
                    <div>
                      <p className="text-white font-bold">🎉 Try-On Result!</p>
                      <p className="text-gray-400 text-xs">{product?.name}</p>
                    </div>
                    <button
                      onClick={() => setTryonResult(null)}
                      className="w-9 h-9 rounded-full bg-white
                     bg-opacity-20 flex items-center
                     justify-center text-white
                     hover:bg-opacity-30 transition"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Result Image - Fullscreen */}
                  <div
                    className="flex-1 flex items-center
                      justify-center p-4 overflow-hidden"
                  >
                    <img
                      src={tryonResult}
                      alt="Try-on result"
                      className="max-w-full max-h-full
                     object-contain rounded-2xl
                     shadow-2xl"
                    />
                  </div>

                  {/* Style Advice */}
                  {styleAdvice && (
                    <div
                      className="bg-gradient-to-t from-black
                        to-transparent px-4 pb-2"
                    >
                      <div
                        className="bg-white bg-opacity-10
                          backdrop-blur-sm rounded-2xl
                          p-4 mb-3"
                      >
                        <p
                          className="text-purple-300 font-bold
                          text-sm mb-2"
                        >
                          ✨ AI Style Advice
                        </p>
                        <p
                          className="text-white text-xs
                          leading-relaxed
                          whitespace-pre-line
                          max-h-24 overflow-y-auto"
                        >
                          {styleAdvice}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div
                    className="bg-black bg-opacity-80
                      px-4 pb-6 pt-2 space-y-2"
                  >
                    {shop?.whatsapp && (
                      <a
                        href={`https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(
                          `Hi! Maine try on kiya!\n👗 ${product?.name}\n💰 ₹${product?.price}\n\n Yah order karna hai!`,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => trackOrder(selectedProduct, "whatsapp")}
                        className="block w-full bg-green-500
                       text-white py-4 rounded-2xl
                       font-bold text-center text-base
                       hover:bg-green-600 transition"
                      >
                        📱 Like it ! Order Now
                      </a>
                    )}

                    {shop?.upiId && (
                      <button
                        onClick={() => {
                          trackOrder(product, "upi");
                          navigator.clipboard.writeText(shop.upiId);
                          alert(
                            `UPI: ${shop.upiId}\nAmount: ₹${product?.price}`,
                          );
                        }}
                        className="w-full border-2 border-white
                       border-opacity-30 text-white
                       py-3 rounded-2xl font-semibold
                       hover:bg-white hover:bg-opacity-10
                       transition"
                      >
                        💳 UPI Se Pay Karen
                      </button>
                    )}

                    <button
                      onClick={() => setTryonResult(null)}
                      className="w-full text-gray-400 text-sm
                     py-2 hover:text-white transition"
                    >
                      ← Try again
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Shop Page ───────────────────────
export default function Shop() {
  const { sellerId } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showTryOn, setShowTryOn] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [zoomImages, setZoomImages] = useState(null);
  const [zoomIndex, setZoomIndex] = useState(0);

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.category === filter;
    return matchSearch && matchFilter;
  });

  useEffect(() => {
    fetchShop();
    // eslint-disable-next-line
  }, [sellerId]);

  const fetchShop = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/seller/shop/${sellerId}`);
      setShop(res.data.shop);
      setProducts(res.data.products);
    } catch {
      setError("Shop nahi mili!");
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (product) => {
    setSelectedProduct(product);
    setShowDetail(true);
    setShowTryOn(false);
  };

  const openTryOn = (product) => {
    setSelectedProduct(product);
    setShowTryOn(true);
    setShowDetail(false);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center
                      justify-center bg-gray-50"
      >
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">👗</div>
          <p className="text-purple-600 font-medium animate-pulse">
            Loading shop...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center
                      justify-center bg-gray-50"
      >
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shop Header */}
      <div
        className="bg-gradient-to-r from-purple-600
                      via-purple-700 to-indigo-700
                      text-white relative overflow-hidden"
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "30px 30px",
          }}
        ></div>

        <div className="relative z-10 text-center py-10 px-4">
          <div
            className="w-16 h-16 bg-white bg-opacity-20
                          rounded-2xl flex items-center
                          justify-center text-3xl mx-auto mb-4"
          >
            👗
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2">{shop?.name}</h1>
          <p className="text-purple-200 text-sm md:text-base">
            Ghar baithe kapde try karen! ✨
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-6 mt-5">
            {[
              { label: "Products", value: products.length },
              { label: "Try-On", value: "🤖 AI" },
              { label: "Order", value: "📞 WhatsApp" },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white bg-opacity-15
                           backdrop-blur-sm rounded-xl
                           px-4 py-2 text-center"
              >
                <p className="font-bold text-base">{s.value}</p>
                <p className="text-purple-200 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="mb-6 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200
                 rounded-2xl px-5 py-3 pl-12
                 focus:outline-none focus:border-purple-400
                 focus:ring-2 focus:ring-purple-100
                 transition text-sm shadow-sm"
          />
          <span
            className="absolute left-4 top-1/2
                     -translate-y-1/2 text-gray-400"
          >
            🔍
          </span>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2
                   -translate-y-1/2 text-gray-400
                   hover:text-gray-600 transition"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: "all", label: "🛍️ All" },
            { key: "upper_body", label: "👕 Shirt" },
            { key: "lower_body", label: "👖 Pant" },
            { key: "dress", label: "👗 Dress" },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`flex-shrink-0 px-4 py-2
                   rounded-full text-sm font-medium
                   transition whitespace-nowrap
                   ${
                     filter === cat.key
                       ? "bg-purple-600 text-white shadow-md"
                       : "bg-white text-gray-600 border border-gray-200 hover:border-purple-300"
                   }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        {(search || filter !== "all") && (
          <p className="text-sm text-gray-400">
            &nbsp;🔍︎ {filteredProducts.length} products found for
            {search && ` "${search}" →`}
          </p>
        )}
      </div>

      {/* Grid mein filteredProducts use karo */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">😕</div>
          <p className="text-gray-400">No any product found!</p>
          <button
            onClick={() => {
              setSearch("");
              setFilter("all");
            }}
            className="mt-3 text-purple-600 text-sm
                 hover:underline"
          >
            View all products
          </button>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 md:grid-cols-3
                            lg:grid-cols-4 gap-4"
        >
          {filteredProducts.map((product) => {
            const images =
              product.images?.length > 0 ? product.images : [product.imageUrl];

            return (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-sm
                               hover:shadow-lg transition-all
                               duration-300 overflow-hidden
                               group cursor-pointer
                               hover:-translate-y-1"
                onClick={() => openDetail(product)}
              >
                {/* Image with slider */}
                <div className="relative">
                  <ImageSlider
                    images={images}
                    onClick={() => openDetail(product)}
                  />

                  {/* Try-On Quick Button */}
                  <div
                    className="absolute bottom-2 right-2
                                      opacity-0 group-hover:opacity-100
                                      transition-all duration-300"
                  >
                    {/* yaha pe hover wala button hai hoverbutton*/}
                    {/* <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openTryOn(product);
                      }}
                      className="bg-purple-600 text-white
                                     text-xs px-3 py-1.5
                                     rounded-full font-medium
                                     shadow-lg hover:bg-purple-700"
                    >
                      👗 Try On
                    </button> */}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* OOS Badge */}
                  {product.inStock === false && (
                    <div
                      className="bg-red-500 text-white text-xs
                    font-bold px-2 py-1 rounded-lg
                    mb-2 inline-block"
                    >
                      ❌ Out of Stock
                    </div>
                  )}
                  <h3
                    className="font-semibold text-gray-800
                 text-sm mb-1 truncate capitalize"
                  >
                    {product.name}
                  </h3>

                  <div
                    className="flex items-center
                                      justify-between mb-3"
                  >
                    <p
                      className="text-purple-600 font-bold
                                      text-base"
                    >
                      ₹{product.price}
                    </p>
                    <span
                      className="text-xs text-gray-400
                                         bg-gray-100 px-2 py-0.5
                                         rounded-full capitalize"
                    >
                      {product.category?.replace("_", " ")}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (product.inStock === false) return;
                      openTryOn(product);
                    }}
                    disabled={product.inStock === false}
                    className={`w-full mt-3 py-2 rounded-xl
             text-sm font-semibold transition
             flex items-center justify-center gap-1.5
             ${
               product.inStock === false
                 ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                 : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90"
             }`}
                  >
                    {product.inStock === false
                      ? "❌ Out of Stock"
                      : "👗 Try On Karo"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}

      {showDetail && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          shop={shop}
          onClose={() => setShowDetail(false)}
          onTryOn={(p) => {
            setShowDetail(false);
            openTryOn(p);
          }}
        />
      )}

      {/* Zoom Modal */}
      {zoomImages && (
        <ZoomModal
          images={zoomImages}
          initialIndex={zoomIndex}
          onClose={() => {
            setZoomImages(null);
            setZoomIndex(0);
          }}
        />
      )}

      {/* Try-On Modal */}
      {showTryOn && selectedProduct && (
        <TryOnModal
          product={selectedProduct}
          shop={shop}
          onClose={() => setShowTryOn(false)}
        />
      )}
    </div>
  );
}
