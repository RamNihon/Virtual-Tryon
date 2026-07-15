export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white 
                      rounded-2xl shadow-sm p-8 md:p-12">

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Privacy Policy — For Sellers
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Last updated: July 2026
        </p>

        <div className="space-y-8 text-gray-600 
                        leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              1. Information We Collect
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Account details: name, email, password (encrypted), shop name</li>
              <li>Business details: WhatsApp number, UPI ID, product listings</li>
              <li>Product and fabric images you upload</li>
              <li>Usage data: credits used, try-on activity, order history</li>
              <li>Payment information, processed securely via Razorpay — we do not store your card or bank details ourselves</li>
              <li>Device information for push notifications, if you enable them</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>To create and operate your shop and seller dashboard</li>
              <li>To process AI try-on and fabric generation requests</li>
              <li>To send order, billing, and (if enabled) push notifications</li>
              <li>To process payments and manage your subscription</li>
              <li>To improve our services and troubleshoot issues</li>
              <li>To send optional email updates, based on your notification preferences in Settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              3. Third-Party AI Processors
            </h2>
            <p className="text-sm mb-3">
              To generate try-on results and fabric previews, images you and your
  customers upload are sent to verified third-party AI compute providers for
  processing. These infrastructure providers process the images to return a
  result to us — they do not use your data to build their own products or train
  models on it under our secure cloud data protection agreements with them.
</p>
<ul className="list-disc pl-6 space-y-2 text-sm">
  <li><strong>Cloud-Based AI Vision Models</strong> — for upper-body garment try-on processing</li>
  <li><strong>Generative Imagery Models</strong> — for lower-body and full-dress virtual try-on</li>
  <li><strong>AI Fabric Texture Processors</strong> — for fabric-to-garment preview generation</li>
  <li><strong>Secure Large Language Models (LLMs)</strong> — for automated AI style advice and text responses</li>
</ul>
</section>

<section>
<h2 className="text-xl font-semibold text-gray-800 mb-3">
  4. Other Service Providers
</h2>
<ul className="list-disc pl-6 space-y-2 text-sm">
  <li><strong>Cloud Object Storage Infrastructure</strong> — for secure image storage, hosting, and global asset delivery</li>
  <li><strong>Encrypted Database Service Providers</strong> — for secure user account metadata and data management hosting</li>
  <li><strong>PCI-DSS Compliant Payment Gateways</strong> — for handling financial transactions safely and securely</li>
  <li><strong>Cloud Hosting and Content Delivery Networks (CDN)</strong> — for core application hosting and interface stability</li>
</ul>
</section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              5. Data Storage & Security
            </h2>
            <p className="text-sm">
              Your data is stored securely with encrypted passwords
              (bcrypt) and authenticated access (JWT). We use
              industry-standard practices to protect your
              information, but no online system can be guaranteed
              100% secure. Please keep your password and API key
              confidential.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              6. Data Retention & Deletion
            </h2>
            <p className="text-sm">
              You can delete your account at any time from
              Dashboard → Settings → Danger Zone. Deleting your
              account removes your seller profile, product listings,
              and fabric products immediately. Some records (such as
              past order and transaction history) may be retained
              for a limited period as required for legal, tax, or
              accounting purposes, in line with Indian law.
              Deletion requests submitted by email are processed
              within 30 days, though in most cases the in-app
              deletion above takes effect immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              7. Your Rights
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Access and update your account information anytime from Settings</li>
              <li>Request a copy of the data we hold about you</li>
              <li>Request deletion of your account and data</li>
              <li>Opt out of promotional emails and push notifications, while keeping essential account/order alerts</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              8. Contact
            </h2>
            <p className="text-sm">
              Questions about this policy or your data? Email:
              <br />
              <a href="mailto:virtualtryon.service@gmail.com"
                className="text-purple-600 hover:underline">
                virtualtryon.service@gmail.com
              </a>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}