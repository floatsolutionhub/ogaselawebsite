"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Container } from "../Container";
import { FadeIn } from "../FadeIn";

const faqs = [
  {
    question: "Is it free to post a listing on Ogasela?",
    answer:
      "Yes. Posting a standard listing is free. You can optionally pay to boost a listing so it reaches more buyers, faster.",
  },
  {
    question: "How do I know a seller or buyer is legit?",
    answer:
      "Sellers can complete KYC verification and earn a verified badge on their profile. We recommend chatting in-app first and meeting in safe, public locations for in-person exchanges.",
  },
  {
    question: "What can I sell on Ogasela?",
    answer:
      "Almost anything — electronics, fashion, home & furniture, vehicles, real estate, jobs, and more. Prohibited and restricted items are outlined in our Terms & Conditions.",
  },
  {
    question: "How do payments work?",
    answer:
      "Ogasela includes an in-app wallet you can fund and withdraw from. Sellers using in-app payments get paid directly into their wallet once a transaction is confirmed.",
  },
  {
    question: "Is Ogasela available outside Nigeria?",
    answer:
      "Right now Ogasela is focused on connecting buyers and sellers across Nigeria's states and cities, with more regions planned as we grow.",
  },
  {
    question: "How do I delete my account or my data?",
    answer:
      "Visit the Account / Data Deletion page from our footer at any time to request deletion of your account or specific personal data.",
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
