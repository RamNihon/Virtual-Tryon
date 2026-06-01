export default function Refund() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white 
                      rounded-2xl shadow-sm p-8 md:p-12">

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Refund Policy
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Last updated: January 2025
        </p>

        <div className="space-y-8 text-gray-600 
                        leading-relaxed">

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
                Service must not have been 
                significantly used (less than 
                10 try-ons used)
              </li>
              <li>
                Technical issues caused by 
                our platform qualify for 
                full refund
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              2. Non-Refundable Cases
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>After 7 days of purchase</li>
              <li>If plan limits were significantly used</li>
              <li>Dissatisfaction with AI result quality</li>
              <li>Change of mind after extensive use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              3. Refund Process
            </h2>
            <ol className="list-decimal pl-6 
                           space-y-2 text-sm">
              <li>Email us at refund@virtualtryon.com</li>
              <li>Include your registered email and order ID</li>
              <li>We review within 2 business days</li>
              <li>
                Approved refunds credited within 
                5-7 business days
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              4. Free Plan
            </h2>
            <p className="text-sm">
              Free plan users are not eligible for 
              refunds as no payment is involved.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold 
                           text-gray-800 mb-3">
              5. Contact for Refunds
            </h2>
            <p className="text-sm">
              Email:
              <a href="mailto:virtualtryon.service+refund@gmail.com"
                className="text-purple-600 
                           hover:underline ml-1">
                refund@virtualtryon.com
              </a>
              <br />
              {/* WhatsApp:
              <a href="https://wa.me/91XXXXXXXXXX"
                target="_blank"
                rel="noreferrer"
                className="text-purple-600 
                           hover:underline ml-1">
                +91 XXXXXXXXXX
              </a> */}
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}