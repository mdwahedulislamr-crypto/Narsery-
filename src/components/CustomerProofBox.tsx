import React, { useState } from "react";
import { ShieldCheck, MessageCircle, CheckCircle, Truck, ZoomIn, X, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { motion } from "motion/react";

import messengerImg from "../assets/images/messenger_review_proof_1788636720213.jpg";
import whatsappImg from "../assets/images/whatsapp_review_proof_1788636734428.jpg";
import courierParcelsImg from "../assets/images/courier_plant_parcels_1788636603625.jpg";
import plantDeliveredImg from "../assets/images/customer_sapling_delivered_1788636619640.jpg";
import tallBagsImg from "../assets/images/tall_rambutan_courier_bag_1788636637047.jpg";

interface ProofItem {
  id: string;
  type: "messenger" | "whatsapp" | "courier_dispatch" | "delivery_photo";
  title: string;
  source: string;
  badge: string;
  badgeColor: string;
  image: string;
  quote: string;
  date: string;
}

const PROOF_ITEMS: ProofItem[] = [
  {
    id: "proof_1",
    type: "messenger",
    title: "Md Israfil (মেসেঞ্জার রিভিউ)",
    source: "Facebook Messenger",
    badge: "ভেরিফায়েড ক্রেতা",
    badgeColor: "bg-blue-600 text-white",
    image: messengerImg,
    quote: "“আলহামদুলিল্লাহ গাছ পেয়েছি ভাই। আপনাকে অনেক অনেক ধন্যবাদ!”",
    date: "২৭ আগস্ট, ২০২৬"
  },
  {
    id: "proof_2",
    type: "delivery_photo",
    title: "Mustafa Ashfaque (চারা প্রাপ্তি)",
    source: "কুরিয়ার ডেলিভারি ফটো",
    badge: "ডেলিভারি সফল",
    badgeColor: "bg-emerald-600 text-white",
    image: plantDeliveredImg,
    quote: "“অনেক ধন্যবাদ। চারাগুলি পেয়েছি। জাযাকাল্লাহ।” — সুস্থ সবল কলমের চারা বাড়িতে বুঝে পেয়ে সন্তুষ্টি প্রকাশ।",
    date: "২৬ আগস্ট, ২০২৬"
  },
  {
    id: "proof_3",
    type: "courier_dispatch",
    title: "সরাসরি কুরিয়ার পার্সেল বুকিং প্রমাণ",
    source: "AJ Express ও সুন্দরবন কুরিয়ার",
    badge: "নার্সারি ডিসপ্যাচ",
    badgeColor: "bg-amber-600 text-white",
    image: courierParcelsImg,
    quote: "কুরিয়ার কনসাইনমেন্ট স্লিপসহ নিরাপদে বস্তাবন্দি করা তাজা চারাগাছ সারা বাংলাদেশে ডেলিভারির জন্য প্রস্তুত।",
    date: "৩১ আগস্ট, ২০২৬"
  },
  {
    id: "proof_4",
    type: "whatsapp",
    title: "হোয়াটসঅ্যাপ রিভিউ (অনলাইন আস্থার প্রমাণ)",
    source: "WhatsApp চ্যাট",
    badge: "১০০% সন্তুষ্টি",
    badgeColor: "bg-emerald-700 text-white",
    image: whatsappImg,
    quote: "“আসসালামু আলাইকুম ভাইজান, চারা গুলা খুবই সুস্থ সবল এবং কোয়ালিটি যেমন দেখাইছেন ঠিক তেমন পেয়েছি আলহামদুলিল্লাহ... আপনার সার্ভিস দেখে আমি সত্যিই মুগ্ধ।”",
    date: "২৮ আগস্ট, ২০২৬"
  },
  {
    id: "proof_5",
    type: "courier_dispatch",
    title: "সুরক্ষিত প্যাকেজিং ও রোপণ উপযোগী চারা",
    source: "আল খায়ের এগ্রো নিজস্ব সংগ্রহ",
    badge: "নিরাপদ প্যাকেজিং",
    badgeColor: "bg-teal-700 text-white",
    image: tallBagsImg,
    quote: "চারার গোড়ার মাটির আর্দ্রতা যাতে অক্ষুণ্ণ থাকে সেজন্য বিশেষ প্যাকেজিং করে সরাসরি গ্রাহকের ঠিকানায় পাঠানো হয়।",
    date: "২৮ আগস্ট, ২০২৬"
  },
  {
    id: "proof_6",
    type: "whatsapp",
    title: "গ্রাহকের বিশেষ কৃতজ্ঞতা বার্তা",
    source: "WhatsApp স্ক্রিনশট",
    badge: "সফল কন্ডিশন ডেলিভারি",
    badgeColor: "bg-emerald-800 text-white",
    image: whatsappImg,
    quote: "“ধন্যবাদ ভাই। আমার চারাগুলা খুবই সুন্দরভাবে হাতে পেয়েছি। প্রথমে ভেবেছিলাম হয়তো প্রতারিত হবো... বাহ ভাই আবারও অসংখ্য ধন্যবাদ আপনাকে 🥰”",
    date: "০৫ জুলাই, ২০২৬"
  }
];

export default function CustomerProofBox() {
  const [selectedProof, setSelectedProof] = useState<ProofItem | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate items to ensure smooth infinite loop animation
  const infiniteProofs = [...PROOF_ITEMS, ...PROOF_ITEMS];

  return (
    <motion.section 
      id="customer-proofs-box" 
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="py-10 px-4 max-w-5xl mx-auto"
    >
      {/* Box Container with elegant border & shadow */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-5 sm:p-8 shadow-2xl border-2 border-emerald-500/30 overflow-hidden relative">
        
        {/* Glow ambient background accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="text-center space-y-2 relative z-10 mb-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-4 py-1 rounded-full text-xs sm:text-sm font-bold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>১০০% বাস্তব প্রমাণ ও গ্রাহক মতামত</span>
          </div>

          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
            কাস্টমারদের বাস্তব অভিজ্ঞতা ও পার্সেল ডেলিভারি প্রমাণ
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            আল খায়ের এগ্রো থেকে চারা গ্রহণ করে সম্মানিত গ্রাহকদের সরাসরি মেসেঞ্জার ও হোয়াটসঅ্যাপ বার্তা এবং নার্সারি থেকে সারা দেশে বুকিং করা পার্সেলের বাস্তব চিত্র।
          </p>

          {/* Quick trust metrics row */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] sm:text-xs text-emerald-200">
            <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> ডেলিভারি চার্জ দিয়ে কনফার্ম
            </span>
            <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
              <Truck className="w-3.5 h-3.5 text-amber-400" /> সারা দেশে নিরাপদ পার্সেল
            </span>
            <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> ১০০% ফলবতী মাতৃগাছের কলম
            </span>
          </div>
        </div>

        {/* Moving Carousel Box with smooth right-to-left animation */}
        <div 
          className="relative overflow-hidden py-3 rounded-2xl bg-black/30 border border-white/10"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Edge blur fade gradients */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

          {/* Moving Track */}
          <div 
            className={`flex gap-4 w-max ${isPaused ? "animate-none" : "animate-marquee"}`}
            style={{
              animationDuration: "35s",
              animationTimingFunction: "linear",
              animationIterationCount: "infinite"
            }}
          >
            {infiniteProofs.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                onClick={() => setSelectedProof(item)}
                className="w-64 sm:w-72 bg-slate-900/90 rounded-2xl border border-white/15 p-3.5 shadow-lg flex flex-col justify-between hover:border-emerald-400/80 hover:shadow-emerald-500/20 transition-all duration-300 cursor-pointer group shrink-0"
              >
                {/* Card Top Label */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.date}
                  </span>
                </div>

                {/* Card Image with zoom icon */}
                <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-slate-950 border border-white/10 mb-3 group-hover:scale-[1.02] transition-transform">
                  <img
                    src={item.image}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:brightness-105 transition"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="bg-emerald-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                      <ZoomIn className="w-3.5 h-3.5" /> বড় করে দেখুন
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1 group-hover:text-emerald-300 transition">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed italic bg-white/5 p-2 rounded-lg border border-white/5">
                    {item.quote}
                  </p>
                </div>

                {/* Source hint */}
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <MessageCircle className="w-3 h-3" /> {item.source}
                  </span>
                  <span className="text-slate-500 underline text-[9px]">ক্লিক করুন</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Notice */}
        <div className="mt-4 text-center">
          <p className="text-slate-400 text-xs flex items-center justify-center gap-1">
            <span>💡 যেকোনো ছবিতে ক্লিক করে বড় আকারে স্পষ্ট দেখতে পারেন (কার্সার রাখলে স্লাইড থেমে যাবে)</span>
          </p>
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {selectedProof && (
        <div 
          id="proof-lightbox-modal"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedProof(null)}
        >
          <div 
            className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl relative text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedProof(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${selectedProof.badgeColor}`}>
                {selectedProof.badge}
              </span>
              <h4 className="text-lg font-black text-white mt-1.5">
                {selectedProof.title}
              </h4>
              <p className="text-xs text-slate-400">{selectedProof.source} • {selectedProof.date}</p>
            </div>

            {/* Full Image */}
            <div className="rounded-2xl overflow-hidden border border-white/20 max-h-[60vh] bg-black flex items-center justify-center">
              <img
                src={selectedProof.image}
                alt={selectedProof.title}
                referrerPolicy="no-referrer"
                className="max-h-[58vh] w-auto object-contain mx-auto"
              />
            </div>

            {/* Review quote */}
            <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
              <p className="text-xs sm:text-sm text-emerald-200 font-medium leading-relaxed">
                {selectedProof.quote}
              </p>
            </div>

            <button
              onClick={() => setSelectedProof(null)}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm transition cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      {/* Global CSS for seamless marquee */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </motion.section>
  );
}
