import React from 'react';

export default function CustomerRefund() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white 
                      rounded-2xl shadow-sm p-8 md:p-12">

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Refund & Buyer Protection Policy
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Last updated: July 2026
        </p>

        <div className="space-y-8 text-gray-600 
                        leading-relaxed">

          {/* Core Framework Alert Box */}
          <section>
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3.5 text-sm">
              <strong className="text-amber-800">Important Framework Notice:</strong> VirtualTryOn provides the technical infrastructure for independent merchant storefronts. Financial liability, return timelines, and refund processing depend entirely on the <strong>Checkout Method</strong> utilized during your transaction. Please verify your order mode below.
            </div>
          </section>

          {/* Section 1: Direct Platform Orders via Integrated Payment Gateways */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              1. Direct Platform Orders (Online Payment Gateway)
            </h2>
            <p className="text-sm mb-3">
              If you placed an order utilizing the <strong>"Order & Pay Now"</strong> button directly on our secure platform interface and completed your checkout through our integrated payment processor, you are automatically covered under our <strong>SaaS Buyer Protection Program</strong>.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li><strong>Eligible Unfair Cases:</strong> In the event of confirmed fraudulent merchant activity—such as deliberate non-delivery of items, counterfeit listings, or unfair refusal of baseline service—VirtualTryOn reserves the right to issue a financial refund or transaction reversal following an internal audit.</li>
              <li><strong>Dispute Timeline:</strong> To be eligible under the buyer protection framework, dispute claims and transaction receipts must be submitted to our operations desk within <strong>7 calendar days</strong> from the successful transaction date.</li>
            </ul>
          </section>

          {/* Section 2: WhatsApp Checkout & External Transactions */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              2. WhatsApp Checkout (Direct Merchant-to-Buyer Deals)
            </h2>
            <p className="text-sm">
              If your checkout flow redirected your session to the merchant's individual <strong>WhatsApp Business chat</strong>, or any external third-party communication channel to finalize fulfillment, your payment did not traverse our secure platform gateway.
            </p>
            <p className="text-sm mt-2">
              Because VirtualTryOn possesses no custody, logging, or record of financial assets exchanged during off-platform WhatsApp deals, <strong>we cannot issue, facilitate, or guarantee refunds on behalf of the seller</strong>. All requests for cancellations, order modifications, or cash refunds for these transactions must be negotiated directly with the seller under their storefront's independent policy.
            </p>
          </section>

          {/* Section 3: Merchant Escrow & Global Enforcement */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              3. Unresolved Disputes & Platform Enforcement Operations
            </h2>
            <p className="text-sm">
              We maintain a zero-tolerance operational standard against scam vendors or malicious storefronts. If an independent seller acts unfairly, remains unresponsive to valid customer inquiries, or fails to uphold basic commercial ethics, you are strongly encouraged to register a formal complaint with us.
            </p>
            <p className="text-sm mt-2">
              While we are financially unable to reverse capital for WhatsApp/external orders, confirmed violations of our Merchant Terms of Service will trigger absolute compliance penalties—including immediate <strong>store suspension, merchant account freeze, or permanent blacklisting</strong> of that merchant from our global AI try-on ecosystem.
            </p>
          </section>

          {/* Section 4: Interface & Infrastructure Reliability */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              4. SaaS Feature & Interface Accountability
            </h2>
            <p className="text-sm">
              VirtualTryOn remains fully accountable for the underlying software performance. If your generated virtual try-on asset fails to render, crashes the user agent, or experiences severe UI errors during the session, please report it to our engineering team for an immediate system hotfix.
            </p>
          </section>

          {/* Section 5: Support Operations Desk */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              5. Dispute Registration & Support Channel
            </h2>
            <p className="text-sm">
              To log a buyer dispute, submit transaction invoices for online orders, or report fraudulent seller behavior, please connect directly with our global infrastructure desk:
              <br />
              <a href="mailto:virtualtryon.service@gmail.com"
                className="text-purple-600 font-medium hover:underline inline-block mt-2">
                virtualtryon.service@gmail.com
              </a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
