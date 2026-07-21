import React from "react";
import { Star, Quote } from "lucide-react";
import { REVIEWS } from "../data";
import { motion } from "motion/react";

export default function ReviewList() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      id="customer-reviews-section" 
      className="py-16 px-4 bg-white rounded-3xl border border-slate-100 shadow-md max-w-6xl mx-auto my-12"
    >
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="bg-emerald-100 text-emerald-800 text-sm font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
          গ্রাহকদের সন্তুষ্টি
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mt-4 leading-tight">
          আমাদের ওপর কেন <span className="text-emerald-700">ভরসা করবেন?</span>
        </h2>
        <p className="text-slate-600 mt-3 text-lg">
          তাক্কওয়া এগ্রো লিমিটেড থেকে চারা কিনে গ্রাহকদের বাস্তব অভিজ্ঞতা ও মতামত দেখে নিন:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {REVIEWS.map((review, index) => (
          <motion.div
            key={review.id}
            id={`review-${review.id}`}
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
            className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-100 hover:border-emerald-200 shadow-sm relative flex flex-col justify-between transition-all duration-300"
          >
            {/* Quote Icon Background */}
            <Quote className="absolute right-6 top-6 w-12 h-12 text-slate-200 pointer-events-none" />

            <div>
              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Comment */}
              <p className="text-slate-700 text-base italic leading-relaxed mb-6 relative z-10">
                "{review.comment}"
              </p>
            </div>

            {/* Profile Info */}
            <div className="flex items-center gap-4 border-t border-slate-200 pt-4">
              <div className={`w-12 h-12 rounded-full ${review.avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
                {review.name.split(" ")[0][0] || "গ"}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base">{review.name}</h4>
                <p className="text-slate-500 text-xs">{review.date}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 bg-emerald-50 p-8 rounded-2xl border border-emerald-100 text-center">
        <div>
          <div className="text-3xl md:text-4xl font-bold text-emerald-800">৯৯.৮%</div>
          <div className="text-slate-600 text-sm mt-1 font-medium">সন্তুষ্ট গ্রাহক</div>
        </div>
        <div className="border-y sm:border-y-0 sm:border-x border-emerald-200 py-4 sm:py-0">
          <div className="text-3xl md:text-4xl font-bold text-emerald-800">১০০০০+</div>
          <div className="text-slate-600 text-sm mt-1 font-medium">সফলভাবে ডেলিভারি</div>
        </div>
        <div>
          <div className="text-3xl md:text-4xl font-bold text-emerald-800">২৪ ঘন্টা</div>
          <div className="text-slate-600 text-sm mt-1 font-medium">গ্রাহক সেবা ও লাইভ সাপোর্ট</div>
        </div>
      </div>
    </motion.section>
  );
}
