import { useState } from "react";
import {  useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  MessageCircleQuestion,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  ArrowLeft,
} from "lucide-react";

const faqItems = [
  {
    question: "What is VirtualTryOn?",
    answer:
      "VirtualTryOn is an AI-powered shopping experience where customers can try outfits virtually before placing an order. It helps shoppers make better buying decisions with more confidence.",
  },
  {
    question: "How does the try-on feature work?",
    answer:
      "Open a product, tap Try-On, upload your photo, and the system generates a virtual preview. You can then review the result, read style advice, and decide whether to order.",
  },
  {
    question: "Do I need to install any app?",
    answer:
      "No app is required. You can use the shop directly in your browser on mobile or desktop.",
  },
  {
    question: "How do I place an order?",
    answer:
      "After checking the product and try-on result, you can either order directly on WhatsApp or use the payment option available on the shop, depending on the seller's setup.",
  },
  {
    question: "Is payment secure?",
    answer:
      "Yes. Payments are handled through secure checkout options provided by the seller, such as UPI or other supported payment methods.",
  },
  {
    question: "What if the size does not fit?",
    answer:
      "Always check product details before ordering. If you still need help, contact the seller using WhatsApp or the support options shown on the page.",
  },
  {
    question: "Can I see my previous try-ons?",
    answer:
      "Yes. Your try-on history can be shown in the Try-on Gallery 𓃑  or My Try-ons section.",
  },
  {
    question: "How do I contact the seller?",
    answer:
      "Use the Contact Seller or Chat on WhatsApp option shown in the footer or product page. That is the fastest way to ask about size, fit, availability, or order status.",
  },
  {
    question: "Is my data safe?",
    answer:
      "We keep the experience simple and privacy-friendly. Only the information needed to generate the try-on and complete the order is used.",
  },
  {
    question: "What should I do if I still need help?",
    answer:
      "Use the seller's contact options or go back to the shop and try the product details again. Most questions can be solved quickly through WhatsApp support.",
  },
];

function FaqItem({ item, isOpen, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-3xl border border-white/10 bg-white/5 p-5 text-left backdrop-blur-sm transition hover:border-white/20 hover:bg-white/[0.07]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white sm:text-lg">
            {item.question}
          </h3>
          <p
            className={`mt-3 text-sm leading-7 text-white/70 transition-all duration-300 ${
              isOpen ? "block" : "line-clamp-2"
            }`}
          >
            {item.answer}
          </p>
        </div>
        <span
          className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <ChevronDown className="h-4 w-4 text-white/75" />
        </span>
      </div>
    </button>
  );
}

export default function ShopFAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_30%),linear-gradient(to_bottom,#020617,#0f172a)]">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-1/4 top-16 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute right-1/4 top-24 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/85 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-fuchsia-300" />
            Frequently Asked Questions
          </div>

          <div className="mt-6 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Questions before buying?
            </h1>
            <p className="mt-5 text-base leading-8 text-white/70 sm:text-lg">
              Get quick answers about try-on, ordering, payments, returns, and how to use the shop with confidence.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
                <ArrowLeft className="h-4 w-4" />
              Back to Shop
              
            </button>

            <a
              href="#faq-list"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Browse FAQs
            </a>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: MessageCircleQuestion,
                title: "Fast answers",
                desc: "Know how try-on and orders work in seconds.",
              },
              {
                icon: ShieldCheck,
                title: "Trust focused",
                desc: "Built to make shopping feel safer and simpler.",
              },
              {
                icon: PhoneCall,
                title: "Seller support",
                desc: "Chat with the seller for size, fit, and order help.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                >
                  <div className="inline-flex rounded-2xl bg-white/10 p-3">
                    <Icon className="h-5 w-5 text-fuchsia-300" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ LIST */}
      <section id="faq-list" className="bg-slate-950 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-fuchsia-300">
              Shop help
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white">
              Common questions
            </h2>
            <p className="mt-3 text-white/65">
              Tap any question to see the answer.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <FaqItem
                key={item.question}
                item={item}
                isOpen={openIndex === index}
                onClick={() =>
                  setOpenIndex(openIndex === index ? -1 : index)
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 bg-slate-950 px-6 py-14">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
          <h3 className="text-2xl font-bold text-white">
            Still need help?
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/70">
            Contact the seller directly on WhatsApp for size help, product details,order updates or  for any other queries.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Return to Shop
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}