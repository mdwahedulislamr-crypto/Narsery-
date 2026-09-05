import React from "react";
import { Check, ShieldCheck, Heart, Droplet, Sparkles, Sun, Leaf, HelpCircle, PhoneCall } from "lucide-react";
import { motion } from "motion/react";

interface BenefitsSectionProps {
  onOrderClick?: () => void;
}

const smoothTransition = { duration: 0.65, ease: [0.22, 1, 0.36, 1] };

export default function BenefitsSection({ onOrderClick }: BenefitsSectionProps) {
  return (
    <div id="rambutan-info-container" className="space-y-12 max-w-4xl mx-auto px-4 my-8">
      
      {/* 1. রাম্বুটানের উপকারিতাঃ Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={smoothTransition}
        className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300"
      >
        <div className="bg-[#1b4332] text-white py-4 px-6 text-center">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-wide">
            রাম্বুটানের উপকারিতাঃ
          </h3>
        </div>

        <div className="bg-white p-6 sm:p-8 space-y-4">
          {[
            "হার্ট ভালো রাখে",
            "ব্লাড সুগার নিয়ন্ত্রণ রাখে",
            "শরীরের রোগপ্রতিরোধ ক্ষমতা বাড়ায়",
            "কোলেস্টেরল নিয়ন্ত্রণ করে",
            "মাথা ব্যথা ও আলঝেইমার প্রতিরোধ করে",
            "ত্বক ও চুলের প্রাকৃতিক উজ্জ্বলতা বৃদ্ধি করে"
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-slate-800 text-base sm:text-lg font-bold">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 text-xs font-black shadow-sm">
                ✓
              </span>
              <span>{item}</span>
            </div>
          ))}

          {/* Green CTA Button */}
          {onOrderClick && (
            <div className="pt-6 text-center">
              <button
                onClick={onOrderClick}
                className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-extrabold text-base sm:text-lg px-10 py-3.5 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-emerald-900/20"
              >
                অর্ডার করুন
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* 2. রাম্বুটান চাষের প্রয়োজনীয় নিয়ম কানুন ও চারা রোপণ */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={smoothTransition}
        className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300"
      >
        <div className="bg-[#9d0208] text-white py-4 px-6 text-center">
          <h3 className="text-lg sm:text-xl md:text-2xl font-black tracking-wide">
            রাম্বুটান চাষের প্রয়োজনীয় নিয়ম কানুন ও চারা রোপণ
          </h3>
        </div>

        <div className="bg-white p-6 sm:p-8 space-y-4 text-sm sm:text-base leading-relaxed text-slate-800">
          {[
            "চারা হাতে পাওয়ার ৪-৭ দিন পর চারাটি রোপণ করবেন।",
            "৭০% মাটি + ২০% জৈব সার + ৫% বালি + ৫% ইটের গুঁড়া দিয়ে মাটি প্রস্তুত করবেন।",
            "প্রতি মাসে ৫০০ গ্রাম জৈব সার দিতে হবে।",
            "দুই মাস পর পর ৩০ গ্রাম TSP, ৫০ গ্রাম MOP, ৫০ গ্রাম DAP এবং এক কেজি জৈব সার দিতে হবে।",
            "স্প্রে ১: Vertimec গ্রুপের কীটনাশক (১ লিটার পানিতে ০.৫ গ্রাম) + জাদ পাউডার (Mencozeb group ১ লিটার পানিতে ১.৫ গ্রাম) ২০-৩০ দিন পর পর।",
            "স্প্রে ২: সাইপারমেথ্রিন/কার্বোরেট/নাইট্রো (২ লিটার পানিতে ০.৫ গ্রাম) + জাদ পাউডার (Mencozeb group) ২০-৩০ দিন পর পর।",
            "এই স্প্রে ১ ও স্প্রে ২ পর্যায়ক্রমে দিতে হবে, একসাথে দেওয়া যাবে না।",
            "স্প্রের পরিবর্তে হলুদ গুঁড়া, নিম তেল গুঁড়া, মরিচের গুঁড়া, মেহগনি ফলের গুঁড়া স্প্রে করতে পারেন।",
            "Gibberellic acid / G-3 Tablet/Powder পরিমাণ মতো পানিতে গুলে স্প্রে করতে পারেন。",
            "এরপরও কোন ধরনের সমস্যায় পড়লে আমাদের সাথে যোগাযোগ করবেন (মোবাইল: 01680589614)।"
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 text-xs font-black shadow-sm mt-0.5">
                ✓
              </span>
              <span className="font-semibold text-slate-800">{item}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 3. আমাদের কাছ থেকে কেন নিবেন? */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={smoothTransition}
        className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300"
      >
        <div className="bg-[#1f2937] text-white py-4 px-6 text-center">
          <h3 className="text-xl sm:text-2xl font-black tracking-wide">
            আমাদের কাছ থেকে কেন নিবেন?
          </h3>
        </div>

        <div className="bg-white p-6 sm:p-8 space-y-4">
          {[
            "Al khair agro LTD দীর্ঘদিন ধরে বিশ্বস্ততার সাথে কৃষিপণ্য ও চারাগাছ সরবরাহ করে আসছে।",
            "আমরা সুস্থ সবল ১০০% ফলবতী মাতৃগাছ থেকে কলম (Grafted) করা জাতের চারা সরবরাহ করি — কোনো বীজের ভেজাল চারা নয়।",
            "সারা দেশে সুরক্ষিত বিশেষ কুরিয়ার প্যাকিংয়ে চারা পৌঁছানো হয় — কুরিয়ারে কোনো ক্ষতি হলে সম্পূর্ণ ফ্রিতে রিপ্লেসমেন্ট গ্যারান্টি।",
            "শুধুমাত্র ডেলিভারি চার্জ অগ্রিম দিয়ে বুকিং নিশ্চিত করুন, চারার সমস্ত মূল্যের টাকা চারা হাতে পেয়ে পরিশোধ করবেন।"
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 text-xs font-black shadow-sm mt-0.5">
                ✓
              </span>
              <span className="text-slate-800 text-base sm:text-lg font-bold">{item}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 4. বিকাশ/নগদ পার্সোনাল ব্যানার */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={smoothTransition}
        className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 text-center shadow-xl space-y-3 border-2 border-emerald-500/40"
      >
        <div className="inline-block bg-amber-400 text-slate-950 font-black text-xs sm:text-sm px-4 py-1 rounded-full uppercase tracking-wider shadow">
          জরুরি পেমেন্ট ও বুকিং নির্দেশিকা
        </div>
        <h4 className="text-2xl sm:text-3xl font-black text-amber-300 font-mono tracking-tight">
          বিকাশ/নগদ পার্সোনাল: 01680589614
        </h4>
        <p className="text-slate-200 text-base sm:text-lg font-bold max-w-xl mx-auto leading-relaxed">
          চারা জীবিত পণ্য হওয়ায় শুধুমাত্র ডেলিভারি চার্জ অগ্রিম বিকাশ/নগদ করে বুকিং নিশ্চিত করতে হবে। বাকি টাকা গাছ বুঝে পেয়ে প্রদান করবেন।
        </p>
      </motion.div>

    </div>
  );
}
