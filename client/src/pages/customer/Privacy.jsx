import React from 'react';

export default function CustomerPrivacy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white 
                      rounded-2xl shadow-sm p-8 md:p-12">

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Privacy Policy — For Customers
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
              <li>Account details: name, email, phone (if you create an account to order or save your try-on history)</li>
              <li>The photo you upload for a virtual try-on</li>
              <li>Try-on results generated from your photo</li>
              <li>Delivery address, if you place an order with a seller</li>
              <li>Basic usage data, like which products you've tried on</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              2. How Your Photo Is Used
            </h2>
            <p className="text-sm">
              Your photo is used solely to generate your virtual
              try-on result. It's sent to our verified AI processing partners
              for that purpose only, and the result
              is shown back to you. Your try-on history and photos
              are private to your account — other customers, and
              the seller whose shop you used, cannot see your
              uploaded photo or your personal try-on gallery.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              3. Third-Party AI Processors
            </h2>
            <p className="text-sm mb-3">
              To generate your try-on result, your photo is sent to
              secured third-party cloud AI compute infrastructure providers for processing.
              These providers process the image to return a result
              to us — they do not use your photo to build their own
              products or train machine learning models on it under our explicit 
              data protection agreements with them:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Cloud-Based AI Vision Infrastructure</strong> — for upper-body garment virtual try-on processing</li>
              <li><strong>Generative Imagery Compute Clusters</strong> — for lower-body and full-dress model rendering</li>
              <li><strong>Automated Language Assistance Services</strong> — for providing real-time personalized style advice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              4. What Sellers Can and Can't See
            </h2>
            <p className="text-sm">
              A seller can see that a try-on happened on their shop
              and, if you place an order, the delivery details you
              provide for that order. Sellers cannot see your
              uploaded photo, your try-on results from other
              products, or your try-on history with other sellers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              5. Data Storage & Security
            </h2>
            <p className="text-sm">
              Your data is stored securely using encrypted cloud databases 
              and authorized network access tokens. Images and generated visual assets 
              are stored with secured cloud object storage networks. We use 
              industry-standard practices to protect your information, but no 
              online system can be guaranteed 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              6. Data Retention & Deletion
            </h2>
            <p className="text-sm">
              You can request deletion of your account, photos, and
              try-on history at any time by emailing us. We process
              deletion requests within 30 days. Note: if you've
              placed an order with a seller, some order-related
              information may be retained by that seller separately,
              for their own records — that's outside our control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              7. Your Rights
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Access and update your account information</li>
              <li>Request a copy of the data we hold about you</li>
              <li>Request deletion of your account, photos, and try-on history</li>
              <li>Ask us not to retain your uploaded photo after a session</li>
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
  );
}
