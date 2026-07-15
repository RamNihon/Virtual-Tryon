export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white 
                      rounded-2xl shadow-sm p-8 md:p-12">

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Terms of Service — For Sellers
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
              These Terms of Service govern your use of VirtualTryOn
              as a registered seller. By creating a seller account,
              you agree to these terms. If you do not agree, please
              do not register or use our services. If you're a
              customer trying on products through a seller's shop,
              a separate Customer Terms of Service applies instead.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              2. Service Description
            </h2>
            <p className="text-sm">
              VirtualTryOn provides AI-powered virtual try-on
              technology for clothing and fabric sellers. We offer
              a shareable shop page, an embeddable widget for your
              own website, and AI tools that let your customers
              preview products before buying. We act as a
              technology provider — we are not a marketplace, and
              we are not a party to any sale between you and your
              customers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              3. Seller Responsibilities
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Provide accurate product information, pricing, and availability</li>
              <li>Upload only images you own or have the legal right to use</li>
              <li>Not upload inappropriate, illegal, or infringing content</li>
              <li>Keep your account credentials and API key confidential</li>
              <li>Pay subscription and credit charges on time</li>
              <li>Fulfil orders received through your shop in good faith and within a reasonable time</li>
              <li>Comply with applicable Indian consumer protection and e-commerce laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              4. Subscriptions, Credits & Payments
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Plans are billed monthly and paid via Razorpay</li>
              <li>Each AI action (a try-on, a fabric generation) consumes credits at the rate shown in your dashboard</li>
              <li>Unused credits do not roll over between billing cycles unless stated otherwise at time of purchase</li>
              <li>No automatic plan upgrades without your consent</li>
              <li>Upgrades take effect immediately; downgrades take effect at the next billing cycle</li>
              <li>See our Refund Policy for cancellation and refund terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              5. Try-On & AI-Generated Content Limitations
            </h2>
            <p className="text-sm">
              AI try-on results and AI-generated fabric previews are
              approximations intended to help customers make a
              purchase decision — they are not exact representations
              of the final product. Actual product appearance,
              colour, fit, and fabric drape may vary. We do not
              guarantee the accuracy of AI-generated results and are
              not liable for purchase decisions made based on them.
              We recommend including your own product photos and
              accurate descriptions alongside the AI try-on feature.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              6. Prohibited Uses
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Uploading inappropriate, adult, or sexually explicit content</li>
              <li>Uploading images of minors for try-on purposes</li>
              <li>Misusing the platform for spam or unsolicited messaging</li>
              <li>Attempting to hack, reverse-engineer, or disrupt our services</li>
              <li>Creating fake or duplicate seller accounts</li>
              <li>Reselling, sublicensing, or white-labelling our services without written permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              7. Intellectual Property
            </h2>
            <p className="text-sm">
              You retain all rights to the product images, fabric
              images, and shop content you upload. By uploading
              content, you grant VirtualTryOn a limited licence to
              process, display, and store it solely to provide the
              service to you and your customers. VirtualTryOn
              retains all rights to its own platform, branding, and
              underlying technology.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              8. Termination
            </h2>
            <p className="text-sm">
              We reserve the right to suspend or terminate accounts
              that violate these terms. Where possible, sellers will
              be notified and given an opportunity to resolve the
              issue before termination, except in cases of serious
              or repeated violations. You may delete your own
              account at any time from Settings — see our Privacy
              Policy for what happens to your data afterward.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              9. Limitation of Liability
            </h2>
            <p className="text-sm">
              VirtualTryOn is provided "as is." To the maximum
              extent permitted by law, we are not liable for
              indirect, incidental, or consequential damages
              arising from your use of the platform, including lost
              sales, disputes with customers, or inaccuracies in
              AI-generated try-on results. Our total liability for
              any claim is limited to the amount you paid us in the
              3 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              10. Governing Law
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
              11. Contact
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