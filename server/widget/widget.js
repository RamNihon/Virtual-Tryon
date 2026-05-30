(function () {
  const script = document.currentScript;
  const SELLER_ID = script.getAttribute("data-seller-id");
  const API_KEY = script.getAttribute("data-api-key");
  const API_URL = "http://localhost:5000";

  // CSS inject karo
  const style = document.createElement("style");
  style.innerHTML = `
    .tryon-btn {
      background: #7C3AED;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 14px;
      margin-top: 8px;
      width: max-content !important;
      white-space: nowrap !important;
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      box-shadow: 0px 4px 6px rgba(0,0,0.1);
      transition: background 0.2s ease;

    }
    .tryon-btn:hover {
      background: #6D28D9;
    }
    .tryon-overlay {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .tryon-modal {
      background: white;
      padding: 30px;
      border-radius: 16px;
      width: 420px;
      max-height: 90vh;
      overflow-y: auto;
      text-align: center;
    }
    .tryon-result-img {
      width: 100%;
      border-radius: 12px;
      margin-top: 15px;
    }
    .tryon-buy-btn {
      display: block;
      margin-top: 12px;
      background: #22C55E;
      color: white;
      padding: 12px;
      border-radius: 25px;
      text-decoration: none;
      font-weight: bold;
    }
    .tryon-close-btn {
      background: #eee;
      border: none;
      padding: 8px 20px;
      border-radius: 20px;
      cursor: pointer;
      margin-top: 10px;
      width: 100%;
    }
    .tryon-loading {
      color: #7C3AED;
      margin-top: 15px;
      font-size: 14px;
    }
  `;
  document.head.appendChild(style);

  // Try On buttons add karo
  function addTryOnButtons() {
    const products = document.querySelectorAll(
      ".tryon-product, .cloth, .product-card, .product-item, .product-single, [data-product-id]",
    );

    products.forEach((product) => {
      const productId = product.getAttribute("data-product-id");
      const productUrl = product.getAttribute("data-product-url") || "#";

      const btn = document.createElement("button");
      btn.className = "tryon-btn";
      btn.innerText = "👗 Virtual Try On";
      btn.onclick = () => openModal(productId, productUrl);

      product.appendChild(btn);
    });
  }

  // Modal kholna
  function openModal(productId, productUrl) {
    const overlay = document.createElement("div");
    overlay.className = "tryon-overlay";

    overlay.innerHTML = `
      <div class="tryon-modal">
        <h3 style="margin-bottom:8px">👗 Virtual Try-On</h3>
        <p style="color:#666; font-size:14px; margin-bottom:15px">
          Apni photo upload karen aur dekhe kaisa lagega!
        </p>

        <input 
          type="file" 
          id="tryon-file-input"
          accept="image/*"
          style="width:100%; margin-bottom:15px; padding:8px;
                 border:2px dashed #7C3AED; border-radius:8px;
                 cursor:pointer;"
        />

        <button class="tryon-btn" id="tryon-submit">
          ✨ Try On Karen!
        </button>

        <div id="tryon-result-area"></div>

        <button class="tryon-close-btn" id="tryon-close">
          ✕ Close
        </button>

        <p style="color:#999; font-size:11px; margin-top:12px">
          Powered by VirtualTryOn
        </p>
      </div>
    `;

    document.body.appendChild(overlay);

    // Close button
    overlay.querySelector("#tryon-close").onclick = () => overlay.remove();

    // Overlay click se band karo
    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };

    // Submit button
    overlay.querySelector("#tryon-submit").onclick = () =>
      submitTryOn(productId, productUrl, overlay);
  }

  // Try-on submit
  async function submitTryOn(productId, productUrl, overlay) {
    const fileInput = overlay.querySelector("#tryon-file-input");
    const resultArea = overlay.querySelector("#tryon-result-area");
    const submitBtn = overlay.querySelector("#tryon-submit");

    if (!fileInput.files[0]) {
      alert("Pehle apni photo select karo!");
      return;
    }

    // Loading state
    submitBtn.innerText = "⏳ Processing...";
    submitBtn.disabled = true;
    resultArea.innerHTML = `
      <p class="tryon-loading">
        🤖 AI kaam kar raha hai...<br>
        20-30 second lagenge, ruko! 😊
      </p>
    `;

    const formData = new FormData();
    formData.append("humanImage", fileInput.files[0]);
    formData.append("productId", productId);
    formData.append("description", "clothing item");

    try {
      const response = await fetch(`${API_URL}/api/tryon`, {
        method: "POST",
        headers: { "x-api-key": API_KEY },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        resultArea.innerHTML = `
          <img 
            src="${data.resultImage}" 
            class="tryon-result-img"
            alt="Try-on result"
          />
          <a 
            href="${productUrl}" 
            target="_blank"
            class="tryon-buy-btn">
            🛍️ Abhi Kharido!
          </a>
        `;
      } else {
        resultArea.innerHTML = `
          <p style="color:red; margin-top:15px">
            ❌ Error aaya: ${data.message}
          </p>
        `;
      }
    } catch (error) {
      resultArea.innerHTML = `
        <p style="color:red; margin-top:15px">
          ❌ Server se connect nahi ho paya!
        </p>
      `;
    }

    submitBtn.innerText = "✨ Dobara Try Karo!";
    submitBtn.disabled = false;
  }

  // Page ready hone par run karo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addTryOnButtons);
  } else {
    addTryOnButtons();
  }
})();
