export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white 
                      rounded-2xl shadow-sm p-8 md:p-12">
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Privacy Policy
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Last updated: January 2025
        </p>

        <div className="space-y-8 text-gray-600 
                        leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              1. Information We Collect
            </h2>
            <p className="mb-3">
              When you use VirtualTryOn, we collect:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Name and email address during registration</li>
              <li>Payment information (processed securely via Razorpay)</li>
              <li>Product images uploaded by sellers</li>
              <li>User photos uploaded for virtual try-on (temporarily)</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>To provide virtual try-on services</li>
              <li>To process payments and manage subscriptions</li>
              <li>To send important service updates</li>
              <li>To improve our AI models and services</li>
              <li>To provide customer support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              3. Image Data
            </h2>
            <p className="text-sm">
              User photos uploaded for try-on are processed 
              by our AI system and stored temporarily on 
              secure cloud servers (Cloudinary). 
              Product images uploaded by sellers are stored 
              permanently for display purposes. 
              We do not share personal photos with any 
              third parties except for AI processing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              4. Data Security
            </h2>
            <p className="text-sm">
              We use industry-standard encryption and 
              security measures to protect your data. 
              Payments are processed by Razorpay, 
              a PCI-DSS compliant payment gateway. 
              We never store credit card information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              5. Third Party Services
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Razorpay - Payment processing</li>
              <li>Cloudinary - Image storage</li>
              <li>Replicate - AI try-on processing</li>
              <li>MongoDB Atlas - Database</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              6. Your Rights
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Request deletion of your account and data</li>
              <li>Access your personal information</li>
              <li>Opt out of marketing emails</li>
              <li>Request data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              7. Contact Us
            </h2>
            <p className="text-sm">
              For privacy concerns, contact us at:
              <br />
              <a href="mailto:virtualtryon.service@gmail.com"
                className="text-purple-600 
                           hover:underline">
                privacy@virtualtryon.com
              </a>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}