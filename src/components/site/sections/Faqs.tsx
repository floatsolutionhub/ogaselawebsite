"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Container } from "../Container";
import { FadeIn } from "../FadeIn";

const faqs = [
  {
    question: "When can I download Ogasela?",
    answer:
      "We're preparing the iOS and Android apps for launch. Join the waiting list and we'll email you the day Ogasela is in the App Store and Google Play. If you'd like to try it sooner, volunteer as a tester.",
  },
  {
    question: "Is it free to post an ad?",
    answer:
      "Yes. The Free plan keeps an ad live for 7 days with up to 5 photos, and you can run a few Free ads at once in eligible categories. Paid plans (Basic, Standard and Premium) give a longer run, more photos and video, a boost in search, full AI listing tools and promotion on TikTok and Facebook. Current prices are shown in the app before you pay.",
  },
  {
    question: "Does Ogasela take a commission when I sell?",
    answer:
      "No. When you deal directly with a buyer, the full price is yours. Ogasela earns from optional paid ad plans and promotions, and from a small, clearly shown fee when a buyer chooses Office Pickup.",
  },
  {
    question: "What is Office Pickup?",
    answer:
      "On eligible items, the buyer pays Ogasela the item price plus a 3% service fee. The seller drops the item at an Ogasela branch, our staff inspect it against the ad, and the buyer collects it (or has it delivered where available). If the item fails inspection, or the buyer cancels before collection, we refund the payment less a 1% processing fee.",
  },
  {
    question: "How do I know a seller is genuine?",
    answer:
      "Verified sellers have submitted a government ID, passed a live face check and provided proof of address, which our team reviews. Look for the verified badge and read their reviews. Keep chats in the app, never pay before you've seen the item, and meet in safe public places, or use Office Pickup.",
  },
  {
    question: "What can I sell on Ogasela?",
    answer:
      "Almost anything legal: phones and electronics, fashion, home and furniture, vehicles, property, jobs, services and more. Prohibited items, such as weapons, drugs, counterfeit or stolen goods, are listed in our Terms & Conditions, and every ad can be reviewed by our moderation team.",
  },
  {
    question: "How do I pay for an ad plan?",
    answer:
      "By card, bank transfer or USSD on Paystack's secure checkout. Ogasela never sees your card details. If an ad you paid for is rejected in review, we refund the plan fee to your original payment method.",
  },
  {
    question: "How do I delete my account or my data?",
    answer:
      "Use the Account / Data Deletion page (linked in our footer) at any time to ask us to delete your account or specific personal data. You can also email privacy@ogasela.com.",
  },
];

export function Faqs() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faqs" className="bg-white py-24">
      <Container className="max-w-3xl">
        <FadeIn className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">FAQs</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Frequently asked questions
          </h2>
        </FadeIn>

        <div className="mt-12 divide-y divide-ink-900/10 rounded-3xl border border-ink-900/5 bg-surface px-6">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={faq.question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="font-semibold text-ink-900">{faq.question}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm"
                  >
                    <ChevronDown size={16} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm leading-relaxed text-ink-500">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
