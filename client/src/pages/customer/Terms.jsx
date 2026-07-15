export default function CustomerTerms() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white 
                      rounded-2xl shadow-sm p-8 md:p-12">

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Terms of Service — For Customers
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Last updated: July 2026
        </p>

        <div className="space-y-8 text-gray-600 
                        leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-sm">
              These terms apply to you as a customer using
              VirtualTryOn's virtual try-on feature on a seller's
              shop page or an embedded widget on a seller's own
              website. By uploading a photo or using the try-on
              feature, you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              2. What VirtualTryOn Does
            </h2>
            <p className="text-sm">
              VirtualTryOn is a technology provider that lets you
              upload your own photo and see an AI-generated preview
              of how a seller's product might look on you, before
              you decide to buy. We are not the seller — the
              products shown belong to independent sellers, and any
              purchase you make is a direct agreement between you
              and that seller. VirtualTryOn does not process
              payments for product orders or handle shipping and
              delivery.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              3. Your Photo & Account
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>You must be 18 or older, or have a parent/guardian's permission, to upload your photo</li>
              <li>Only upload photos of yourself — not of another person, without their consent</li>
              <li>Keep your account login details confidential</li>
              <li>You can request deletion of your account and photos at any time — see our Privacy Policy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              4. Try-On Result Accuracy
            </h2>
            <p className="text-sm">
              The try-on preview is AI-generated and approximate —
              it's meant to give you a general sense of fit and
              style, not an exact representation. Actual product
              colour, fabric texture, and fit may differ from the
              preview. Please refer to the seller's product
              description and photos, and check with the seller
              directly, before making a purchase decision.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              5. Orders & Payments
            </h2>
            <p className="text-sm">
              When you place an order through a seller's shop,
              you're transacting directly with that seller. Order
              confirmation, payment, shipping, delivery, and any
              disputes about the product itself are between you and
              the seller — VirtualTryOn is not responsible for
              order fulfilment, product quality, or payment issues
              between you and a seller.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              6. Prohibited Uses
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Uploading photos of anyone other than yourself without their consent</li>
              <li>Uploading inappropriate, offensive, or sexually explicit images</li>
              <li>Uploading photos of minors</li>
              <li>Attempting to misuse, disrupt, or hack the try-on feature</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              7. Limitation of Liability
            </h2>
            <p className="text-sm">
              VirtualTryOn provides the try-on feature "as is." We
              are not liable for purchase decisions made based on
              AI-generated results, or for any dispute, damage, or
              loss arising from your transaction with a seller.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              8. Governing Law
            </h2>
            <p className="text-sm">
              These terms are governed by the laws of India. Any
              disputes will be subject to the exclusive jurisdiction
              of the courts of India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              9. Contact
            </h2>
            <p className="text-sm">
              Questions about these terms? Write to us at:
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