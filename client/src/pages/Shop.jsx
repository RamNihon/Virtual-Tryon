import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import API_URL from "../api";


export default function Shop() {
  const { sellerId } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [humanImage, setHumanImage] = useState(null);
  const [humanPreview, setHumanPreview] = useState(null);
  const [tryonLoading, setTryonLoading] = useState(false);
  const [tryonResult, setTryonResult] = useState(null);
  const [styleAdvice, setStyleAdvice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchShop = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/seller/shop/${sellerId}`);
      setShop(res.data.shop);
      setProducts(res.data.products);
    } catch (err) {
      setError("Shop nahi mila!");
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    fetchShop();
  }, [fetchShop]);

  const openTryOn = (product) => {
    setSelectedProduct(product);
    setHumanImage(null);
    setHumanPreview(null);
    setTryonResult(null);
    setStyleAdvice(null);
    setShowModal(true);
  };

  const handleHumanImage = (e) => {
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
      formData.append("garmentUrl", selectedProduct.imageUrl);
      formData.append("description", selectedProduct.category);

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
    } catch (err) {
      alert("Failed ! Please try again.");
    } finally {
      setTryonLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center
                      justify-center"
      >
        <p className="text-purple-700 text-xl">⏳ Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center
                      justify-center"
      >
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="bg-purple-700 text-white
                      text-center py-12"
      >
        <h1 className="text-4xl font-bold mb-2">👗 {shop?.name}'s Shopping Site</h1>
        <p className="text-purple-200">Try on clothes at home!</p>
      </div>

      {/* Products */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {products.length === 0 ? (
          <p
            className="text-center text-gray-400 
                        text-xl py-20"
          >
            Abhi koi product nahi hai 😕
          </p>
        ) : (
          <div
            className="grid grid-cols-2 md:grid-cols-3
                          lg:grid-cols-4 gap-6"
          >
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-sm
                           overflow-hidden hover:shadow-md
                           transition"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800">
                    {product.name}
                  </h3>
                  <p className="text-purple-600 font-bold mt-1">
                    ₹{product.price}
                  </p>
                  <p
                    className="text-gray-400 text-xs 
                                mt-1 capitalize"
                  >
                    {product.category.replace("_", " ")}
                  </p>

                  <button
                    onClick={() => openTryOn(product)}
                    className="w-full mt-3 bg-purple-700
                               text-white py-2 rounded-full
                               text-sm font-semibold
                               hover:bg-purple-800 transition"
                  >
                    👗 Try On Karen
                  </button>

                  {shop?.whatsapp && (
                    <a
                      href={`https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(
                        `Hi! Mujhe chahiye:\nProduct: ${product.name}\nPrice: ₹${product.price}`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full mt-2 bg-green-500
                                 text-white py-2 rounded-full
                                 text-sm font-semibold
                                 text-center block
                                 hover:bg-green-600 transition"
                    >
                      📱 Order Karen
                    </a>
                  )}

                  {shop?.upiId && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shop.upiId);
                        alert(`UPI: ${shop.upiId}\nAmount: ₹${product.price}`);
                      }}
                      className="w-full mt-2 border-2
                                 border-green-500 text-green-600
                                 py-2 rounded-full text-sm
                                 font-semibold
                                 hover:bg-green-50 transition"
                    >
                      💳 UPI Pay
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80
                        z-50 flex items-center justify-center p-4"
        >
          <div
            className="bg-white rounded-2xl w-full
                          max-w-lg max-h-screen overflow-y-auto"
          >
            <div
              className="flex justify-between items-center
                            p-6 border-b"
            >
              <h2 className="text-xl font-bold">👗 {selectedProduct?.name}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600
                           text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 text-center">
                  <p className="text-sm text-gray-500 mb-2">👕 Cloth</p>
                  <img
                    src={selectedProduct?.imageUrl}
                    alt="Product"
                    className="w-full h-32 object-contain
                               rounded-xl border"
                  />
                </div>
                <div className="flex-1 text-center">
                  <p className="text-sm text-gray-500 mb-2">📸 Your Photo</p>
                  {humanPreview ? (
                    <img
                      src={humanPreview}
                      alt="Preview"
                      className="w-full h-32 object-cover
                                 rounded-xl border"
                    />
                  ) : (
                    <div
                      className="w-full h-32 border-2
                                    border-dashed border-gray-300
                                    rounded-xl flex items-center
                                    justify-center text-gray-400
                                    text-sm"
                    >
                      Upload karen
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium
                                  text-gray-700 mb-2"
                >
                  📸 Apni Photo Upload Karen
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHumanImage}
                  className="w-full text-sm border
                             border-gray-300 rounded-lg p-2"
                />
                <p className="text-xs text-gray-400 mt-1">
                  💡 Seedhi khadi photo best result deti hai!
                </p>
              </div>

              <button
                onClick={handleTryOn}
                disabled={tryonLoading || !humanImage}
                className="w-full bg-purple-700 text-white
                           py-3 rounded-full font-semibold
                           hover:bg-purple-800 transition
                           disabled:opacity-50"
              >
                {tryonLoading
                  ? "⏳ AI kaam kar raha hai... (30 sec)"
                  : "✨ Try On Karen!"}
              </button>

              {tryonResult && (
                <div>
                  <p className="font-semibold text-center mb-3">🎉 Result!</p>
                  <img
                    src={tryonResult}
                    alt="Result"
                    className="w-full rounded-xl"
                  />

                  {styleAdvice && (
                    <div
                      className="mt-4 bg-purple-50
                                    rounded-xl p-4"
                    >
                      <p className="font-semibold text-purple-700 mb-2">
                        ✨ AI Style Advice
                      </p>
                      <p
                        className="text-sm text-gray-700
                                    whitespace-pre-line"
                      >
                        {styleAdvice}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 space-y-2">
                    {shop?.whatsapp && (
                      <a
                        href={`https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(
                          `Hi! Maine try on kiya!\nProduct: ${selectedProduct?.name}\nPrice: ₹${selectedProduct?.price}\nMujhe chahiye!`,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block bg-green-500
                                   text-white text-center
                                   py-3 rounded-full font-semibold
                                   hover:bg-green-600 transition"
                      >
                        📱 WhatsApp Par Order Karen
                      </a>
                    )}

                    {shop?.upiId && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(shop.upiId);
                          alert(
                            `UPI copy ho gaya!\n${shop.upiId}\nAmount: ₹${selectedProduct?.price}`,
                          );
                        }}
                        className="w-full border-2 border-green-500
                                   text-green-600 py-3 rounded-full
                                   font-semibold hover:bg-green-50
                                   transition"
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
      )}
    </div>
  );
}
