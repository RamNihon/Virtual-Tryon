import { useState } from "react";
import { Link } from "react-router-dom";

export default function WidgetGuide() {
  const [language, setLanguage] = useState("hindi");
  const [activeStep, setActiveStep] = useState(1);

  const content = {
    hindi: {
      title: "Widget Integration Guide 🔌",
      subtitle: "Apni website par Virtual Try-On lagane ka tarika",
      steps: [
        {
          num: 1,
          title: "Script Tag Copy Karen",
          desc: "Dashboard ke Integration tab mein jao aur apna script tag copy karo.",
          code: `<script 
  src="https://yoursite.com/widget.js"
  data-seller-id="tumhara_seller_id"
  data-api-key="tumhari_api_key">
</script>`,
          tip: "💡 Yeh code aapke Dashboard → Integration tab mein milega.",
        },
        {
          num: 2,
          title: "Script Tag Website Par Lagayen",
          desc: "Apni website ke HTML file mein </body> tag se theek pehle yeh script paste karen.",
          code: `<!DOCTYPE html>
<html>
<head>
  <title>Meri Shop</title>
</head>
<body>

  <!-- AApki website  ka content -->
  
  <!-- Yahan paste karen - body band hone se thik pehle -->
  <script 
    src="https://yoursite.com/widget.js"
    data-seller-id="tumhara_seller_id"
    data-api-key="apki_api_key">
  </script>
</body>
</html>`,
          tip: "💡 Script hamesha </body> se pehle lagayen!",
        },
        {
          num: 3,
          title: "Product Par Class Lagao",
          desc: 'Jis product par Try-On button chahiye us div par "tryon-product" naam ki class aur "data-product-id"  id ko add karen.',
          code: `<!-- Aapka product card -->
<div 
  class="tryon-product"
  data-product-id="PRODUCT_001"
  data-product-url="https://apki-site.com/product/1">
  
  <img src="shirt.jpg" alt="Blue Shirt">
  <h3>Blue Shirt</h3>
  <p>₹999</p>
  
  <!-- Try On button automatic aa jayega! -->
</div>`,
          tip: "💡 data-product-id unique hona chahiye har product ke liye!",
        },
        {
          num: 4,
          title: "Test Karo",
          desc: 'Website refresh karen. Product par "Virtual Try On" button dikhna chahiye!',
          code: null,
          tip: "✅ Button dikh raha hai? Kisi bhi photo se test karen!",
        },
      ],
      troubleshoot: {
        title: "🔧 Button Nahi Dikh Raha? Yeh Karen:",
        steps: [
          {
            problem: "Script sahi jagah nahi hai",
            solution: "Script ko </body> se bilkul pehle lagayen",
          },
          {
            problem: '"tryon-product" class missing hai',
            solution: 'Product div par class="tryon-product" add karen',
          },
          {
            problem: "JavaScript se class add karen",
            code: `// yah code apne javascript me joden:
        document.querySelectorAll('.your-product-card')
         .forEach((el, index) => {
         el.classList.add('tryon-product');
          el.setAttribute('data-product-id', 'PROD_' + index);
          });`,
          },
          {
            problem: "Shopify use kar rahe ho?",
            solution:
              "Theme Editor → theme.liquid file mein </body> se pehle script lagao",
          },
          {
            problem: "WordPress use kar rahe ho?",
            solution:
              "Appearance → Theme Editor → footer.php mein </body> se pehle lagao",
          },
        ],
      },
    },
    english: {
      title: "Widget Integration Guide 🔌",
      subtitle: "How to add Virtual Try-On to your website",
      steps: [
        {
          num: 1,
          title: "Copy Your Script Tag",
          desc: "Go to Dashboard → Integration tab and copy your unique script tag.",
          code: `<script 
  src="https://your-site.com/widget.js"
  data-seller-id="your_seller_id"
  data-api-key="your_api_key">
</script>`,
          tip: "💡 Your script tag is in Dashboard → Integration tab.",
        },
        {
          num: 2,
          title: "Add Script to Your Website",
          desc: "Paste the script tag in your website HTML file, just before the </body> closing tag.",
          code: `<!DOCTYPE html>
<html>
<head>
  <title>My Shop</title>
</head>
<body>

  <!-- Your website content -->
  
  <!-- Paste here - just before closing body tag -->
  <script 
    src="https://your-site.com/widget.js"
    data-seller-id="your_seller_id"
    data-api-key="your_api_key">
  </script>
</body>
</html>`,
          tip: "💡 Always place the script just before </body>!",
        },
        {
          num: 3,
          title: "Add Class to Your Products",
          desc: 'Add "tryon-product" class and "data-product-id" to each product div where you want the Try-On button.',
          code: `<!-- Your product card -->
<div 
  class="tryon-product"
  data-product-id="PRODUCT_001"
  data-product-url="https://your-site.com/product/1">
  
  <img src="shirt.jpg" alt="Blue Shirt">
  <h3>Blue Shirt</h3>
  <p>₹999</p>
  
  <!-- Try On button will appear automatically! -->
</div>`,
          tip: "💡 data-product-id must be unique for each product!",
        },
        {
          num: 4,
          title: "Test It!",
          desc: 'Refresh your website. You should see "Virtual Try On" button on your products!',
          code: null,
          tip: "✅ Button visible? Test it with any photo!",
        },
      ],
      troubleshoot: {
        title: "🔧 Button Not Showing? Try This:",
        steps: [
          {
            problem: "Script not in right place",
            solution: "Place script just before </body> closing tag",
          },
          {
            problem: '"tryon-product" class is missing',
            solution: 'Add class="tryon-product" to your product div',
          },
          {
            problem: "Need to add class via JavaScript",
            code: `// Add class programmatically:
document.querySelectorAll('.your-product-card')
  .forEach((el, index) => {
    el.classList.add('tryon-product');
    el.setAttribute('data-product-id', 'PROD_' + index);
  });`,
          },
          {
            problem: "Using Shopify?",
            solution: "Theme Editor → theme.liquid → paste before </body>",
          },
          {
            problem: "Using WordPress?",
            solution:
              "Appearance → Theme Editor → footer.php → paste before </body>",
          },
        ],
      },
    },
  };

  const lang = content[language];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div
        className="bg-gradient-to-br from-slate-900
                      via-purple-900 to-indigo-900
                      py-14 px-6"
      >
        <div className="max-w-4xl mx-auto">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2
                       text-purple-300 hover:text-white
                       transition text-sm mb-6"
          >
            ← Go back to Dashboard
          </Link>

          <div
            className="flex flex-col md:flex-row
                          justify-between items-start
                          md:items-center gap-4"
          >
            <div>
              <h1
                className="text-3xl md:text-4xl font-black
                             text-white mb-2"
              >
                {lang.title}
              </h1>
              <p className="text-purple-200">{lang.subtitle}</p>
            </div>

            {/* Language Toggle */}
            <div
              className="flex bg-white bg-opacity-10
                            backdrop-blur-sm rounded-2xl p-1
                            border border-white border-opacity-20"
            >
              {["hindi", "english"].map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-5 py-2 rounded-xl text-sm
                             font-semibold transition capitalize
                             ${
                               language === l
                                 ? "bg-white text-purple-700"
                                 : "text-white hover:bg-white hover:bg-opacity-10"
                             }`}
                >
                  {l === "hindi" ? "🇮🇳 Hindi" : "🇬🇧 English"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress Steps */}
        <div
          className="flex items-center gap-2 mb-10
                        overflow-x-auto pb-2"
        >
          {lang.steps.map((step, i) => (
            <div
              key={i}
              className="flex items-center gap-2
                                    flex-shrink-0"
            >
              <button
                onClick={() => setActiveStep(step.num)}
                className={`w-10 h-10 rounded-full font-bold
                           text-sm transition-all flex items-center
                           justify-center
                           ${
                             activeStep >= step.num
                               ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                               : "bg-gray-200 text-gray-400"
                           }`}
              >
                {step.num}
              </button>
              {i < lang.steps.length - 1 && (
                <div
                  className={`h-0.5 w-12 rounded transition-all
                               ${
                                 activeStep > step.num
                                   ? "bg-purple-600"
                                   : "bg-gray-200"
                               }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {lang.steps.map((step) => (
            <div
              key={step.num}
              className={`bg-white rounded-3xl border-2
                         transition-all duration-300
                         ${
                           activeStep === step.num
                             ? "border-purple-500 shadow-lg shadow-purple-50"
                             : "border-gray-100 shadow-sm"
                         }`}
            >
              <button
                onClick={() =>
                  setActiveStep(activeStep === step.num ? 0 : step.num)
                }
                className="w-full flex items-center gap-4
                           p-6 text-left"
              >
                <div
                  className={`w-12 h-12 rounded-2xl
                                flex items-center justify-center
                                font-black text-lg flex-shrink-0
                                transition-all
                                ${
                                  activeStep >= step.num
                                    ? "bg-purple-600 text-white"
                                    : "bg-gray-100 text-gray-400"
                                }`}
                >
                  {step.num}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-sm mt-0.5">{step.desc}</p>
                </div>
                <span className="text-gray-300 text-xl">
                  {activeStep === step.num ? "↑" : "↓"}
                </span>
              </button>

              {activeStep === step.num && (
                <div className="px-6 pb-6">
                  {/* Code Block */}
                  {step.code && (
                    <div className="relative">
                      <div
                        className="bg-gray-900 rounded-2xl
                                      p-5 overflow-x-auto mb-3"
                      >
                        <pre
                          className="text-green-400 text-sm
                                        font-mono leading-relaxed
                                        whitespace-pre-wrap"
                        >
                          {step.code}
                        </pre>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(step.code);
                          alert("Code copied! ✅");
                        }}
                        className="absolute top-3 right-3
                                   bg-white bg-opacity-10
                                   text-white text-xs px-3 py-1.5
                                   rounded-lg hover:bg-opacity-20
                                   transition"
                      >
                        📋 Copy
                      </button>
                    </div>
                  )}

                  {/* Tip */}
                  <div
                    className="bg-purple-50 rounded-xl p-4
                                  border border-purple-100"
                  >
                    <p className="text-purple-700 text-sm">{step.tip}</p>
                  </div>

                  {/* Next Button */}
                  {step.num < lang.steps.length && (
                    <button
                      onClick={() => setActiveStep(step.num + 1)}
                      className="mt-4 bg-purple-600 text-white
                                 px-6 py-2.5 rounded-xl text-sm
                                 font-semibold hover:bg-purple-700
                                 transition"
                    >
                      Go to Next Step →
                    </button>
                  )}

                  {step.num === lang.steps.length && (
                    <div
                      className="mt-4 bg-green-50 rounded-xl
                                    p-4 border border-green-100"
                    >
                      <p className="text-green-700 font-semibold">
                        🎉 All steps are completed ! Try-On is now ready!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Troubleshooting */}
        <div
          className="mt-10 bg-white rounded-3xl
                        border border-gray-100 shadow-sm
                        overflow-hidden"
        >
          <div
            className="bg-orange-50 border-b border-orange-100
                          p-6"
          >
            <h2 className="text-xl font-bold text-orange-800">
              {lang.troubleshoot.title}
            </h2>
          </div>
          <div className="p-6 space-y-5">
            {lang.troubleshoot.steps.map((item, i) => (
              <div
                key={i}
                className="border border-gray-100
                           rounded-2xl p-5"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className="text-orange-400 font-black
                                   flex-shrink-0"
                  >
                    ⚠️
                  </span>
                  <p className="font-semibold text-gray-800">{item.problem}</p>
                </div>
                {item.solution && (
                  <p className="text-gray-500 text-sm pl-8">
                    ✅ {item.solution}
                  </p>
                )}
                {item.code && (
                  <div className="mt-3 relative">
                    <div
                      className="bg-gray-900 rounded-xl
                                    p-4 overflow-x-auto"
                    >
                      <pre
                        className="text-green-400 text-xs
                                      font-mono whitespace-pre-wrap"
                      >
                        {item.code}
                      </pre>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.code);
                        alert("Copied! ✅");
                      }}
                      className="absolute top-2 right-2
                                 bg-white bg-opacity-10
                                 text-white text-xs px-2 py-1
                                 rounded-lg hover:bg-opacity-20"
                    >
                      📋
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div
          className="mt-8 bg-gradient-to-br from-purple-600
                        to-indigo-600 rounded-3xl p-8 text-center"
        >
          <div className="text-4xl mb-3">🤝</div>
          <h3 className="text-xl font-bold text-white mb-2">
            Still any problem ?
          </h3>
          <p className="text-purple-200 mb-6 text-sm">
            Our team will help you in 24 hours!
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/contact"
              className="bg-white text-purple-700
                         px-6 py-3 rounded-xl font-bold
                         hover:bg-purple-50 transition text-sm"
            >
              📧 Contact Us
            </Link>
            <a
              href="https://wa.me/919801227970"
              target="_blank"
              rel="noreferrer"
              className="bg-green-500 text-white
                         px-6 py-3 rounded-xl font-bold
                         hover:bg-green-600 transition text-sm"
            >
              📱 WhatsApp Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
