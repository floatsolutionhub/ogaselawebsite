"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Camera, MapPin, MessageCircle, PackageCheck, ShieldCheck, Sparkles } from "lucide-react";
import { Container } from "../Container";
import { Button } from "../Button";
import { GetAppButton } from "../GetAppButton";
import { AnimatedText } from "../AnimatedText";
import { StoreBadges } from "../StoreBadges";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-surface to-surface">
      <div className="bg-noise absolute inset-0 opacity-40" />
      <div className="absolute -top-32 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-brand-300/30 blur-3xl" />

      <Container className="relative grid gap-16 py-20 md:py-28 lg:grid-cols-2 lg:items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-brand-700 shadow-sm ring-1 ring-brand-100"
          >
            <Sparkles size={14} className="text-gold-500" />
            Launching soon across all 36 states &amp; the FCT
          </motion.div>

          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
            <AnimatedText text="Buy and sell" className="block" />
            <AnimatedText
              text="anything, from anyone,"
              delay={0.15}
              className="block text-brand-600"
            />
            <AnimatedText text="near you." delay={0.3} className="block" />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-6 max-w-lg text-lg leading-relaxed text-ink-500"
          >
            Ogasela is the marketplace built for the everyday Nigerian hustle. List an ad in
            minutes, chat with verified sellers and real buyers near you, and when you want
            extra peace of mind, let us inspect the item before you collect it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <GetAppButton className="px-8 py-4 text-base" />
            <Button href="/how-it-works" variant="secondary" className="px-8 py-4 text-base">
              See how it works
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-ink-500"
          >
            <Highlight icon={<ShieldCheck size={16} />} label="Verified sellers" />
            <Highlight icon={<MessageCircle size={16} />} label="In-app chat" />
            <Highlight icon={<MapPin size={16} />} label="Nearby listings" />
            <Highlight icon={<PackageCheck size={16} />} label="Office Pickup" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <StoreBadges variant="dark" className="mt-8" />
          </motion.div>
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <FloatingMock />
        </div>
      </Container>
    </section>
  );
}

function Highlight({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-brand-600">{icon}</span>
      {label}
    </span>
  );
}

function FloatingMock() {
  return (
    <div className="relative aspect-[4/5] w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="absolute inset-4 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-600 to-brand-800 shadow-2xl shadow-brand-900/30"
      >
        <Image
          src="/images/ladies-phone.jpg"
          alt="Two Nigerian women smiling at a phone"
          fill
          priority
          sizes="(min-width: 1024px) 40vw, 384px"
          className="object-cover object-[30%_50%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/40 via-transparent to-transparent" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -30, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="absolute left-0 top-6 w-40 rounded-2xl bg-white p-4 shadow-xl"
      >
        <div className="mb-2 flex h-20 items-center justify-center rounded-xl bg-brand-50">
          <Camera size={22} className="text-brand-500" />
        </div>
        <p className="text-xs font-semibold text-ink-900">iPhone 13 Pro</p>
        <p className="text-xs text-brand-600 font-bold">₦450,000</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 1.1 }}
        className="absolute right-0 top-1/2 w-44 -translate-y-1/2 rounded-2xl bg-white p-4 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-100 text-gold-600">
            <MessageCircle size={16} />
          </span>
          <div>
            <p className="text-xs font-semibold text-ink-900">New message</p>
            <p className="text-[10px] text-ink-300">about your sofa ad</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-ink-500">&quot;Is it still available? I&apos;m in Yaba.&quot;</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.3 }}
        className="absolute bottom-6 left-1/2 w-48 -translate-x-1/2 rounded-2xl bg-white p-4 shadow-xl"
      >
        <p className="text-xs font-medium text-ink-500">Near Ikeja, Lagos</p>
        <p className="mt-1 text-sm font-bold text-ink-900">3-Bedroom Flat</p>
        <p className="text-xs text-brand-600 font-bold">₦3.2m / year</p>
      </motion.div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-4 top-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-400 shadow-lg shadow-gold-500/30"
      >
        <Sparkles size={22} className="text-white" />
      </motion.div>
    </div>
  );
}
