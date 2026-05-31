export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white 
                      rounded-2xl shadow-sm p-8 md:p-12">

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Terms of Service
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Last updated: January 2025
        </p>

        <div className="space-y-8 text-gray-600 
                        leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-sm">
              By using VirtualTryOn, you agree to these 
              terms. If you do not agree, please do not 
              use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              2. Service Description
            </h2>
            <p className="text-sm">
              VirtualTryOn provides AI-powered virtual 
              try-on technology for fashion sellers. 
              We offer a widget and shop page that 
              sellers can integrate into their 
              online stores.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              3. Seller Responsibilities
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Provide accurate product information</li>
              <li>Upload only original/owned product images</li>
              <li>Not upload inappropriate or illegal content</li>
              <li>Keep account credentials secure</li>
              <li>Pay subscription fees on time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              4. Subscription & Payments
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Subscriptions are billed monthly</li>
              <li>Payments processed via Razorpay</li>
              <li>No automatic renewals without consent</li>
              <li>Plan limits apply as per chosen plan</li>
              <li>Upgrades take effect immediately</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              5. Try-On Limitations
            </h2>
            <p className="text-sm">
              AI try-on results are approximate and 
              for reference only. Actual product 
              appearance may vary. We do not guarantee 
              100% accuracy of virtual try-on results.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              6. Prohibited Uses
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Uploading inappropriate or adult content</li>
              <li>Misusing the platform for spam</li>
              <li>Attempting to hack or disrupt services</li>
              <li>Creating fake accounts</li>
              <li>Reselling our services without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              7. Termination
            </h2>
            <p className="text-sm">
              We reserve the right to terminate accounts 
              that violate these terms. Sellers will be 
              notified before termination except in cases 
              of serious violations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              8. Contact
            </h2>
            <p className="text-sm">
              Questions about terms?
              <br />
              <a href="mailto:legal@virtualtryon.com"
                className="text-purple-600 hover:underline">
                legal@virtualtryon.com
              </a>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}