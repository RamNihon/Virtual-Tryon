export default function Refund() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white 
                      rounded-2xl shadow-sm p-8 md:p-12">

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Refund Policy — For Sellers
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Last updated: July 2026
        </p>

        <div className="space-y-8 text-gray-600 
                        leading-relaxed">

          <section>
            <p className="text-sm bg-blue-50 border border-blue-100
                          rounded-xl px-4 py-3">
              This policy covers refunds for VirtualTryOn
              subscription and credit purchases. If you're a
              customer with a question about a product order, refer
              to the seller you purchased from — VirtualTryOn does
              not process product payments or refunds for orders
              placed on a seller's shop.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              1. Refund Eligibility
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>
                Refund requests within
                <strong> 7 days </strong>
                of payment are eligible
              </li>
              <li>
                Fewer than 50 credits from the purchased plan or
                top-up must have been used
              </li>
              <li>
                Technical issues caused by our platform (e.g. a paid
                feature not working as described) qualify for a
                full refund, regardless of usage
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              2. Non-Refundable Cases
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Requests made after 7 days of purchase</li>
              <li>Plans or credit top-ups where 50 or more credits have already been used</li>
              <li>Dissatisfaction with AI try-on or fabric generation result quality — see our Terms for accuracy limitations</li>
              <li>Change of mind after extensive use of the plan</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              3. Refund Process
            </h2>
            <ol className="list-decimal pl-6 
                           space-y-2 text-sm">
              <li>Email us at the address below from your registered email</li>
              <li>Include your registered email and payment/order ID (visible in Billing → Credit History)</li>
              <li>We review requests within 2 business days</li>
              <li>
                Approved refunds are credited to your original
                payment method within 5-7 business days
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              4. Free Plan
            </h2>
            <p className="text-sm">
              The Free plan does not involve any payment, so it is
              not eligible for refunds.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              5. Contact for Refunds
            </h2>
            <p className="text-sm">
              Email:
              <a href="mailto:virtualtryon.service@gmail.com"
                className="text-purple-600 
                           hover:underline ml-1">
                virtualtryon.service@gmail.com
              </a>
              <br />
              Please use the subject line "Refund Request" so we
              can route it quickly.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}