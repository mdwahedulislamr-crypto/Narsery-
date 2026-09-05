import React from "react";
import { ArrowDown, Sparkles, ShieldCheck, Truck, RefreshCw, Headphones, Phone } from "lucide-react";
import { motion } from "motion/react";

interface HeroSectionProps {
  onOrderClick: () => void;
}

export default function HeroSection({ onOrderClick }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#062912] via-[#0d3b1a] to-[#0a2e14] text-white py-10 sm:py-16 px-4 border-b border-emerald-900/40">
      
      {/* Decorative ambient garden glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[380px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-8 right-8 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-4 left-8 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto text-center relative z-10 space-y-6 sm:space-y-7">
        
        {/* Top Floating Mini Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 bg-emerald-800/80 border border-emerald-400/40 text-emerald-200 text-xs sm:text-sm font-black px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span>১০০% পরীক্ষিত ফলবতী মাতৃগাছের কলম চারা</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md font-sans"
        >
          আপনার বাগানকে পরিণত করুন একটি স্বর্গে!
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-base sm:text-lg md:text-xl font-bold text-[#bbf7d0] leading-relaxed max-w-2xl mx-auto"
        >
          🔥 <span className="text-amber-300">আপনি কি চান নিজের বাগানে মিষ্টি, রসালো মালেশিয়ান লাল রাম্বুটানের স্বাদ?</span> আমাদের বিশেষ প্যাকেজে রয়েছে ১০০% ফলবতী মাতৃগাছ থেকে কলম করা প্রিমিয়াম বিদেশি রাম্বুটান চারা!
        </motion.p>

        {/* Big High-Converting Orange CTA Button with Pulse & Glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="pt-2 sm:pt-3"
        >
          <div className="relative inline-block w-full sm:w-auto">
            {/* Glowing ambient ring */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse pointer-events-none" />
            
            <button
              id="hero-order-cta-btn"
              onClick={onOrderClick}
              className="relative w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#f97316] via-[#ea580c] to-[#c2410c] hover:from-[#ea580c] hover:to-[#9a3412] active:scale-95 text-white font-black text-xl sm:text-2xl px-10 sm:px-14 py-4 sm:py-5 rounded-2xl shadow-2xl hover:scale-103 transition-all cursor-pointer border-2 border-orange-300/50"
            >
              <span className="tracking-wide">অর্ডার করতে চাই</span>
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
                <ArrowDown className="w-5 h-5 text-white animate-bounce" />
              </span>
            </button>
          </div>
        </motion.div>

        {/* High-Impact Trust Badges Strip directly under CTA (No picture section) */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-2xl mx-auto"
        >
          {/* Card 1 */}
          <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-400/25 flex items-start gap-3 transition shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-300/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-amber-300 text-xs sm:text-sm block">
                ১০০% ফলবতী মাতৃগাছের কলম
              </span>
              <p className="text-[11px] text-emerald-100/90 leading-tight mt-0.5">
                বীজের ভেজাল চারা নয়! প্রমাণিত মিষ্টি জাতের ফলবতী মাতৃগাছ থেকে গুটি কলম করা। মাত্র ৭-৮ মাসেই ফলন শুরু।
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-400/25 flex items-start gap-3 transition shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-300/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-emerald-300 text-xs sm:text-sm block">
                ডেলিভারি চার্জ দিয়ে কনফার্ম করুন
              </span>
              <p className="text-[11px] text-emerald-100/90 leading-tight mt-0.5">
                কুরিয়ার বুকিংয়ের জন্য শুধুমাত্র ডেলিভারি চার্জ বিকাশ/নগদে অগ্রিম দিবেন। চারার সমস্ত মূল্য গাছ বুঝে পেয়ে পরিশোধ।
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-400/25 flex items-start gap-3 transition shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-300/30">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-cyan-300 text-xs sm:text-sm block">
                ফ্রি রিপ্লেসমেন্ট গ্যারান্টি
              </span>
              <p className="text-[11px] text-emerald-100/90 leading-tight mt-0.5">
                কুরিয়ারে পরিবহনে চারা ভেঙে গেলে বা ক্ষতি হলে কোনো বাড়তি টাকা ছাড়াই সম্পূর্ণ নতুন চারা দেওয়া হবে।
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-400/25 flex items-start gap-3 transition shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-pink-400/20 text-pink-300 flex items-center justify-center shrink-0 border border-pink-300/30">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-pink-300 text-xs sm:text-sm block">
                আজীবন কৃষিবিদ পরামর্শ ফ্রি
              </span>
              <p className="text-[11px] text-emerald-100/90 leading-tight mt-0.5">
                চারা রোপণ, টব বা ড্রামের মাটি প্রস্তুত এবং দ্রুত ফলন নিশ্চিত করার জন্য আমাদের কৃষিবিদ টিমের সরাসরি গাইডলাইন।
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
