import React, { useState, useEffect, useRef } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./lib/firebase";
import { initPixel, trackPurchase, trackLead, trackInitiateCheckout } from "./lib/pixel";
import BenefitsSection from "./components/BenefitsSection";
import ReviewList from "./components/ReviewList";
import WhatsAppButton from "./components/WhatsAppButton";
import AdminPanel from "./components/AdminPanel";
import ImgBBLoader from "./components/ImgBBLoader";
import { motion } from "motion/react";
import { 
  Phone, 
  MapPin, 
  ShoppingBag, 
  ShieldCheck, 
  CheckCircle, 
  Truck, 
  Lock, 
  ArrowRight, 
  Gift, 
  ChevronRight,
  Info,
  X,
  Clock,
  Sparkles,
  HelpCircle,
  Award,
  AlertTriangle
} from "lucide-react";

export default function App() {
  // Form State
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [deliveryArea, setDeliveryArea] = useState<"jela" | "upajela" | "home">("jela"); // 'jela' | 'upajela' | 'home'
  const [note, setNote] = useState("");
  
  // App UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState("");
  const [lastOrderDeliveryCharge, setLastOrderDeliveryCharge] = useState(300);
  
  // Admin Authentication State
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Countdown Timer State (Urgency countdown matching screenshot 1st style)
  const [timeLeft, setTimeLeft] = useState({ days: 1, hours: 22, minutes: 58, seconds: 54 });

  // Order Details Refs
  const formRef = useRef<HTMLDivElement>(null);
  const hasTrackedInitiateCheckout = useRef(false);

  // Constants
  const PRODUCT_PRICE = 4500;
  
  // Custom delivery charge computation based on new rules:
  // জেলা = ৩০০, উপজেলা = ৪০০, হোমডেলিভারী = ৫০০
  const getDeliveryCharge = () => {
    if (deliveryArea === "jela") return 300;
    if (deliveryArea === "upajela") return 400;
    return 500;
  };
  const deliveryCharge = getDeliveryCharge();
  const totalPrice = PRODUCT_PRICE + deliveryCharge;

  // Real-time Countdown logic with Days, Hours, Minutes, Seconds
  useEffect(() => {
    // 1 day + 22 hours + 58 minutes + 54 seconds
    let currentSeconds = 1 * 86400 + 22 * 3600 + 58 * 60 + 54;

    const timer = setInterval(() => {
      if (currentSeconds <= 0) {
        currentSeconds = 1 * 86400 + 23 * 3600 + 59 * 60 + 59; // Reset to approx 2 days
      } else {
        currentSeconds--;
      }

      const d = Math.floor(currentSeconds / 86400);
      const h = Math.floor((currentSeconds % 86400) / 3600);
      const m = Math.floor((currentSeconds % 3600) / 60);
      const s = currentSeconds % 60;

      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Initialize Meta Pixel on Mount
  useEffect(() => {
    initPixel();
  }, []);

  // Check URL pathname/search query for Admin Panel entry trigger
  useEffect(() => {
    const checkForAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const searchParams = new URLSearchParams(window.location.search);
      if (
        path.includes("/admin") ||
        path.includes("/taqwaagro") ||
        searchParams.get("admin") === "true" ||
        searchParams.get("view") === "admin"
      ) {
        setShowPasswordPrompt(true);
      }
    };
    checkForAdminRoute();
  }, []);

  // Smooth scroll to order form
  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
    if (!hasTrackedInitiateCheckout.current) {
      trackInitiateCheckout();
      hasTrackedInitiateCheckout.current = true;
    }
  };

  const triggerInitiateCheckoutOnFocus = () => {
    if (!hasTrackedInitiateCheckout.current) {
      trackInitiateCheckout();
      hasTrackedInitiateCheckout.current = true;
    }
  };

  // Form Submission
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!name.trim()) {
      alert("দয়া করে আপনার নাম লিখুন।");
      return;
    }
    if (!address.trim()) {
      alert("দয়া করে আপনার পূর্ণাঙ্গ ঠিকানা লিখুন।");
      return;
    }
    if (!mobile.trim() || mobile.length < 11) {
      alert("দয়া করে একটি সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন।");
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("bn-BD", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }) + " " + now.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });

      const areaText = deliveryArea === "jela" ? "জেলা শহর (৳৩০০)" : deliveryArea === "upajela" ? "উপজেলা (৳৪০০)" : "হোম ডেলিভারি (৳৫০০)";

      const newOrder = {
        name,
        address,
        mobile,
        note,
        district: areaText,
        price: PRODUCT_PRICE,
        deliveryCharge,
        totalPrice,
        date: formattedDate,
        timestamp: Date.now(),
        status: "pending"
      };

      // Add to Firestore Database
      const docRef = await addDoc(collection(db, "orders"), newOrder);
      
      setLastOrderId(docRef.id);
      setLastOrderDeliveryCharge(deliveryCharge);
      setOrderSuccess(true);
      
      // Track Meta Pixel Conversion Events
      trackLead();
      trackPurchase(totalPrice, "BDT");

      // Reset form
      setName("");
      setAddress("");
      setMobile("");
      setNote("");
    } catch (error) {
      console.error("Error creating order in Firestore:", error);
      alert("অর্ডার সাবমিট করতে সমস্যা হয়েছে। দয়া করে ইন্টারনেট কানেকশন চেক করে আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Admin Login submission
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === "taqwa123") {
      setIsAdminOpen(true);
      setShowPasswordPrompt(false);
      setAdminPassword("");
      setPasswordError("");
    } else {
      setPasswordError("ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-emerald-600 selection:text-white pb-12">
      
      {/* 1. Timer at the absolute top (Exactly matching 1st screenshot design with Days, Hours, Minutes, Seconds blue blocks) */}
      <motion.section 
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-slate-50 py-5 px-3 flex flex-col items-center border-b border-slate-200"
      >
        <div className="grid grid-cols-4 gap-2 max-w-md w-full">
          {/* Days Box */}
          <div className="bg-[#3b82f6] rounded-2xl p-2.5 sm:p-4 flex flex-col items-center justify-center text-white shadow-lg border border-blue-400/20">
            <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight font-mono">
              {String(timeLeft.days).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold mt-1 uppercase tracking-wider text-blue-100">Days</span>
          </div>
          {/* Hours Box */}
          <div className="bg-[#3b82f6] rounded-2xl p-2.5 sm:p-4 flex flex-col items-center justify-center text-white shadow-lg border border-blue-400/20">
            <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight font-mono">
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold mt-1 uppercase tracking-wider text-blue-100">Hours</span>
          </div>
          {/* Minutes Box */}
          <div className="bg-[#3b82f6] rounded-2xl p-2.5 sm:p-4 flex flex-col items-center justify-center text-white shadow-lg border border-blue-400/20">
            <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight font-mono">
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold mt-1 uppercase tracking-wider text-blue-100">Minutes</span>
          </div>

          {/* Seconds Box */}
          <div className="bg-[#3b82f6] rounded-2xl p-2.5 sm:p-4 flex flex-col items-center justify-center text-white shadow-lg border border-blue-400/20">
            <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight font-mono">
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold mt-1 uppercase tracking-wider text-blue-100">Seconds</span>
          </div>
        </div>
      </motion.section>

      {/* 2. Islamic Quote Forest Green Header block (Exactly matching 1st screenshot design and content) */}
      <motion.section 
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        className="bg-[#1c3f06] text-white py-8 px-4 text-center relative overflow-hidden flex flex-col items-center border-b-4 border-[#122c04]"
      >
        <div className="max-w-3xl mx-auto space-y-5 relative z-10">
          <h2 className="text-[#dff51c] text-xl sm:text-2xl md:text-3xl font-extrabold leading-relaxed tracking-normal">
            রাসুল (সা.) বলেন, ‘যে ব্যক্তি বৃক্ষরোপণ করে আর ফলদার হওয়া নাগাদ তার দেখাশোনা ও সংরক্ষণে ধৈর্য ধারণ করে, তার প্রতিটি ফলের বিনিময়ে আল্লাহ তাকে সদকার সওয়াব দেবেন।’ (মুসনাদে আহমদ, হাদিস:- ১৬৭০২)
          </h2>
          
          <p className="text-white text-sm sm:text-base md:text-lg font-bold leading-relaxed max-w-2xl mx-auto pt-1">
            ছাদবাগান এবং বাড়ির আঙিনায় রোপনের জন্য ফলসহ জাপানিজ পার্সিমন পাচ্ছেন মাত্র ৪৫০০ টাকা
          </p>

          <div className="pt-3 flex justify-center">
            <button
              onClick={scrollToForm}
              className="bg-[#54df7d] hover:bg-[#48ce70] text-slate-900 font-extrabold text-base sm:text-lg px-8 py-3 rounded-xl shadow-lg transition-transform duration-200 hover:scale-105 border border-emerald-950 flex items-center gap-1.5 cursor-pointer"
            >
              অর্ডার করতে এখানে ক্লিক করুন
            </button>
          </div>
        </div>
        
        {/* Curved Wave shape divider at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-white/10" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0, 85% 60%, 70% 20%, 55% 70%, 40% 30%, 25% 80%, 10% 40%, 0 0)" }}></div>
      </motion.section>

      {/* 3. Brand & Navigation bar */}
      <motion.section 
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="bg-white border-b border-slate-100 py-4 px-4 shadow-sm"
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-lime-500 flex items-center justify-center text-white shadow-md">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-emerald-800 tracking-tight">তাক্কওয়া এগ্রো লিমিটেড</h1>
              <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">শতভাগ বিশুদ্ধ ও বিশ্বস্ত</p>
            </div>
          </div>
          
          <a
            href="tel:01306729720"
            className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2.5 rounded-xl border border-emerald-100 font-extrabold text-sm sm:text-base hover:bg-emerald-100 transition"
          >
            <Phone className="w-5 h-5 text-emerald-600 animate-bounce" />
            <span>কল করুন: ০১৩০৬৭২৯৭২০</span>
          </a>
        </div>
      </motion.section>

      {/* Hero Intro text */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        className="bg-gradient-to-b from-emerald-900 to-emerald-950 text-white py-12 px-4 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-emerald-950 px-5 py-2 rounded-full text-xs md:text-sm font-black tracking-wide shadow-xl">
            🌱 শতভাগ অরিজিনাল জাপানিজ ফুইয়ু জাতের গ্যারান্টি!
          </div>

          <h2 className="text-3xl md:text-6xl font-black leading-tight text-white drop-shadow-md">
            বাংলাদেশের আবহাওয়াতে শতভাগ ফলনশীল <span className="text-yellow-400">ফলসহ জাপানিজ পার্সিমন চারাগাছ</span>
          </h2>
          
          <p className="text-lg md:text-xl font-medium text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            বাড়ির ছাদে বা আঙিনায় ড্রামে রোপণের উপযুক্ত জাপানিজ ফুইয়ু জাতের কলম চারা। খুবই দ্রুত ফল আসবে এবং ফলন হবে বাম্পার!
          </p>

          {/* Quick CTA */}
          <div className="pt-4">
            <button
              onClick={scrollToForm}
              className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-emerald-950 font-black text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-yellow-400/20 transition cursor-pointer flex items-center justify-center gap-2 mx-auto animate-pulse-slow"
            >
              <ShoppingBag className="w-5.5 h-5.5" />
              ২ পিস চারাগাছ প্যাকেজ অর্ডার করুন
            </button>
          </div>
        </div>
      </motion.section>
      {/* Product Images & Description section (Redesigned for Ultra Clarity!) */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-16 px-4 max-w-6xl mx-auto scroll-mt-20"
      >
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="bg-emerald-100 text-emerald-800 text-xs md:text-sm font-black px-4 py-1.5 rounded-full">
            আমাদের বাস্তব মাতৃচারা ও ফলের চিত্র
          </span>
          <h3 className="text-3xl md:text-4xl font-extrabold text-slate-800">
            চারাগাছের বাস্তব ও স্পষ্ট ছবিসমূহ
          </h3>
          <p className="text-slate-600 text-sm md:text-base">
            গ্রাহকদের সুবিধার্থে নিচে আমাদের নার্সারির অরিজিনাল চারাগাছের বাস্তব ও সর্বোচ্চ স্পষ্ট ছবি দুটি তুলে ধরা হলো:
          </p>
        </div>

        {/* Dynamic Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch bg-white p-6 md:p-10 rounded-3xl border border-slate-150 shadow-lg">
          
          {/* Visual Presentation Box */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Image 1 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col items-center group">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white flex items-center justify-center border border-slate-150 shadow-inner">
                  {/* High Quality Render with fallbacks */}
                  <ImgBBLoader
                    id="zTwFc571"
                    alt="জাপানিজ ফুইয়ু জাতের কলম চারাগাছ"
                    className="w-full h-full object-contain p-2 transition duration-500 group-hover:scale-105"
                    fallbackUrl="https://images.unsplash.com/photo-1634819777926-d3a95c34e004?auto=format&fit=crop&q=80&w=800"
                  />
                  <span className="absolute bottom-2.5 right-2.5 bg-emerald-800 text-white text-[10px] font-black px-2.5 py-1 rounded shadow-md">
                    বাস্তব ছবি ১
                  </span>
                </div>
                <h4 className="text-slate-800 text-base font-bold mt-4 text-center">জাপানিজ ফুইয়ু কলম চারা</h4>
                <p className="text-slate-500 text-xs mt-1 text-center">উচ্চতা ১.৫ থেকে ২.৫ ফিট (টবের জন্য উপযুক্ত)</p>
              </div>

              {/* Image 2 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col items-center group">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white flex items-center justify-center border border-slate-150 shadow-inner">
                  <ImgBBLoader
                    id="V0f0n9QW"
                    alt="আমাদের নার্সারির তরতাজা কলম চারা ও ফল"
                    className="w-full h-full object-contain p-2 transition duration-500 group-hover:scale-105"
                    fallbackUrl="https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=800"
                  />
                  <span className="absolute bottom-2.5 right-2.5 bg-emerald-800 text-white text-[10px] font-black px-2.5 py-1 rounded shadow-md">
                    বাস্তব ছবি ২
                  </span>
                </div>
                <h4 className="text-slate-800 text-base font-bold mt-4 text-center">জাপানিজ ফুইয়ু লালচে হলুদ ফল</h4>
                <p className="text-slate-500 text-xs mt-1 text-center">শতভাগ মিষ্টি ও আকর্ষণীয় জাপানিজ জাত</p>
              </div>
            </div>

            <div className="bg-emerald-50 p-4.5 rounded-xl border border-emerald-100 text-xs text-emerald-900 font-semibold leading-relaxed flex items-start gap-2.5 shadow-sm">
              <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5 animate-pulse" />
              <span>তথ্য গ্যারান্টি: উপরের চারাগুলোর ছবি সরাসরি তাক্কওয়া এগ্রো লিমিটেডের নিজস্ব স্টক থেকে সংগৃহীত। কুরিয়ারে পাঠানোর সময় আমরা ঠিক একই রকম রোগমুক্ত এবং সতেজ চারা সুন্দর প্যাকিংয়ের মাধ্যমে আপনাদের ঠিকানায় ডেলিভারি করব।</span>
            </div>
          </div>

          {/* Details & Combo package */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="bg-red-500 text-white text-xs font-black px-3 py-1 rounded-md shadow">
                স্পেশাল কম্বো অফার!
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">
                ২ পিছ পার্সিমন চারাগাছ <span className="text-emerald-700">ধামাকা ধামাকা কম্বো প্যাক</span>
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                জাপানিজ ফুইয়ু জাতের এই চারাটি দেশের যেকোনো মাটিতে খুব সুন্দরভাবে খাপ খাইয়ে নিতে পারে। এটি অত্যন্ত লাভজনক এবং রোগবালাই প্রতিরোধে অতুলনীয়।
              </p>

              <div className="space-y-3 text-slate-700 text-sm md:text-base pt-2 font-medium">
                <p className="flex items-center gap-2.5 font-bold text-slate-800">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  প্যাকেজে পাবেন: <span className="text-emerald-700 font-bold">২ পিছ সতেজ গ্রাফটিং চারাগাছ</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  চারাগুলোর উচ্চতা ১.৫ থেকে ২.৫ ফিট এর মধ্যে হবে।
                </p>
                <p className="flex items-center gap-2.5">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  বিশেষ জোরকলম পদ্ধতিতে মাদার প্ল্যান্ট থেকে তৈরি।
                </p>
              </div>
            </div>

            {/* Price section */}
            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-emerald-800 text-xs font-black block mb-1">প্যাকেজ মূল্য (২ পিস চারাগাছ)</span>
                <span className="text-4xl font-black text-emerald-900">৳ ৪৫০০</span>
                <span className="text-slate-400 text-xs font-bold line-through ml-2">৳ ৬০০০</span>
              </div>
              <div className="bg-red-600 text-white text-xs font-black px-4 py-2 rounded-lg animate-pulse shadow">
                ২৫% ডিসকাউন্ট!
              </div>
            </div>

            <button
              onClick={scrollToForm}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-lg py-4 rounded-xl shadow-lg hover:scale-[1.01] active:scale-98 transition cursor-pointer"
            >
              এখনই অর্ডার করুন
            </button>
          </div>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Review List Section */}
      <ReviewList />

      {/* Sky-Blue Container wrapping Billing & Shipping input fields */}
      <div ref={formRef} id="order-form-container" className="bg-[#00d0ff] p-5 sm:p-8">
        <form onSubmit={handleOrderSubmit} className="space-y-6">
              
              {/* Billing details card */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 text-slate-950 border border-slate-200 shadow-md space-y-5 text-left">
                <h3 className="text-xl font-black text-slate-800 border-b border-slate-100 pb-2">Billing details</h3>
                
                {/* Customer Name */}
                <div className="space-y-1.5">
                  <label htmlFor="customer-name" className="block text-slate-700 font-extrabold text-sm sm:text-base">
                    আপনার নাম <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="customer-name"
                    type="text"
                    required
                    placeholder="আপনার নাম লিখুন"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={triggerInitiateCheckoutOnFocus}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 font-bold text-base shadow-sm"
                  />
                </div>

                {/* Customer Mobile */}
                <div className="space-y-1.5">
                  <label htmlFor="customer-mobile" className="block text-slate-700 font-extrabold text-sm sm:text-base">
                    আপনার মোবাইল নাম্বার <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="customer-mobile"
                    type="tel"
                    required
                    maxLength={11}
                    placeholder="আপনার ১১ ডিজিটের মোবাইল নাম্বার লিখুন"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                    onFocus={triggerInitiateCheckoutOnFocus}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 font-bold text-base shadow-sm font-mono"
                  />
                </div>

                {/* Customer Full Address */}
                <div className="space-y-1.5">
                  <label htmlFor="customer-address" className="block text-slate-700 font-extrabold text-sm sm:text-base">
                    আপনার নিকটতম কুরিয়ারের ঠিকানা (জেলা/উপজেলা সদর) <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="customer-address"
                    required
                    rows={3}
                    placeholder="জেলা, থানা বা ইউনিয়ন সহ বিস্তারিত ঠিকানা দিন"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onFocus={triggerInitiateCheckoutOnFocus}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 font-semibold text-base leading-relaxed shadow-sm"
                  ></textarea>
                </div>

                {/* Static Country / Region selection block */}
                <div className="space-y-1.5">
                  <span className="block text-slate-700 font-extrabold text-sm sm:text-base">
                    Country / Region <span className="text-red-600">*</span>
                  </span>
                  <div className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold text-base shadow-sm flex items-center justify-between select-none">
                    <span>Bangladesh</span>
                    <span className="text-slate-400 text-xs font-semibold">Default</span>
                  </div>
                </div>

                {/* Note / Special instructions */}
                <div className="space-y-1.5">
                  <label htmlFor="customer-note" className="block text-slate-700 font-bold text-xs sm:text-sm">
                    বিশেষ অনুরোধ বা নোট (অপশনাল)
                  </label>
                  <input
                    id="customer-note"
                    type="text"
                    placeholder="যেমন: গেটের সামনে এসে কল দিবেন।"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onFocus={triggerInitiateCheckoutOnFocus}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 font-medium text-sm shadow-sm"
                  />
                </div>
              </div>

              {/* Product and Order summary table matching Screenshot 3 exactly */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 text-slate-950 border border-slate-200 shadow-md space-y-4 text-left">
                <h4 className="text-lg font-black border-b border-slate-100 pb-2 text-slate-800">আপনার অর্ডার বিবরণ</h4>
                
                {/* Order Table Layout */}
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 bg-slate-50 font-black text-slate-700 p-3 text-xs sm:text-sm">
                    <div className="col-span-8">Product</div>
                    <div className="col-span-4 text-right">Subtotal</div>
                  </div>

                  {/* Line Item */}
                  <div className="grid grid-cols-12 p-3 text-xs sm:text-sm items-center gap-2">
                    <div className="col-span-8 flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-slate-150">
                        <ImgBBLoader 
                          id="zTwFc571" 
                          alt="ফলসহ জাপানিজ পার্সিমন" 
                          className="w-full h-full object-cover" 
                          fallbackUrl="https://images.unsplash.com/photo-1634819777926-d3a95c34e004?auto=format&fit=crop&q=80&w=150"
                        />
                      </div>
                      <span className="font-extrabold text-slate-800">ফলসহ জাপানিজ পার্সিমন <span className="text-slate-500 whitespace-nowrap">× 1</span></span>
                    </div>
                    <div className="col-span-4 text-right font-black text-slate-900">৳ ৪,৫০০.০০</div>
                  </div>

                  {/* Subtotal Row */}
                  <div className="grid grid-cols-12 p-3 text-xs sm:text-sm font-bold bg-slate-50/50">
                    <div className="col-span-8 text-slate-600">Subtotal</div>
                    <div className="col-span-4 text-right text-slate-900 font-black">৳ ৪,৫০০.০০</div>
                  </div>

                  {/* Shipping Selection Row */}
                  <div className="grid grid-cols-12 p-3 text-xs sm:text-sm items-start gap-2">
                    <div className="col-span-4 font-bold text-slate-600 pt-2">Shipping</div>
                    <div className="col-span-8 space-y-3">
                      {/* District Option */}
                      <label className="flex items-start gap-2 cursor-pointer group text-slate-800">
                        <input
                          type="radio"
                          name="shipping_area"
                          checked={deliveryArea === "jela"}
                          onChange={() => setDeliveryArea("jela")}
                          className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                        />
                        <span className="font-semibold leading-snug">
                          জেলা পর্যায়ে ডেলিভারি চার্জ: <span className="font-black text-slate-900">৳ ৩০০.০০</span>
                        </span>
                      </label>

                      {/* Upazila Option */}
                      <label className="flex items-start gap-2 cursor-pointer group text-slate-800">
                        <input
                          type="radio"
                          name="shipping_area"
                          checked={deliveryArea === "upajela"}
                          onChange={() => setDeliveryArea("upajela")}
                          className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                        />
                        <span className="font-semibold leading-snug">
                          উপজেলা পর্যায়ে ডেলিভারি চার্জ: <span className="font-black text-slate-900">৳ ৪০০.০০</span>
                        </span>
                      </label>

                      {/* Home Option */}
                      <label className="flex items-start gap-2 cursor-pointer group text-slate-800">
                        <input
                          type="radio"
                          name="shipping_area"
                          checked={deliveryArea === "home"}
                          onChange={() => setDeliveryArea("home")}
                          className="mt-1 w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                        />
                        <span className="font-semibold leading-snug">
                          হোম ডেলিভারী: <span className="font-black text-slate-900">৳ ৫০০.০০</span>
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Grand Total Row */}
                  <div className="grid grid-cols-12 p-4 text-base font-black bg-emerald-50 text-emerald-950 rounded-b-xl border-t-2 border-emerald-100">
                    <div className="col-span-6 text-slate-700">Total</div>
                    <div className="col-span-6 text-right text-emerald-900 text-lg">৳ {totalPrice.toLocaleString("bn-BD")}.০০</div>
                  </div>
                </div>

                {/* Cash on Delivery & Adv Warning Block exactly matching Screenshot style */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="text-slate-700 text-sm md:text-base font-bold tracking-wide">
                    Cash on delivery
                  </div>
                  
                  {/* Speech bubble pointer container */}
                  <div className="relative bg-[#f5f5f5] p-5 rounded-lg text-[13px] leading-relaxed text-[#333333] font-medium">
                    {/* Triangle pointer */}
                    <div className="absolute -top-[6px] left-8 w-3 h-3 bg-[#f5f5f5] transform rotate-45 border-t border-l border-transparent"></div>
                    
                    <p className="relative z-10 flex items-start gap-1.5 text-slate-800">
                      <span className="text-base leading-none shrink-0">⛔</span>
                      <span className="leading-relaxed font-semibold">
                        <strong className="text-slate-900 font-extrabold">বিঃদ্রঃ-</strong> শুধুমাত্র ডেলিভারি চার্জ এডভান্স করে অর্ডারটি কনফর্ম করতে হবে। কারন গাছের পার্সেল বুকিং দেওয়ার সময় কুরিয়ার সার্ভিস ডেলিভারি চার্জের টাকা নিয়ে তারপর বুকিং করে। সবকিছু দেখে শুনে শিওর হয়ে অর্ডার প্লেস করবেন। একবার অর্ডার করলে ক্যানসেল করতে পারবেন না।
                      </span>
                    </p>
                  </div>
                </div>

                {/* Submit button inside the Order details block */}
                <div className="pt-4">
                  <button
                    id="btn-submit-order"
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full text-white font-extrabold text-xl py-4.5 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isSubmitting 
                        ? "bg-slate-400 cursor-not-allowed" 
                        : "bg-[#008751] hover:bg-[#007043] hover:scale-[1.01] active:scale-98"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin rounded-full h-5.5 w-5.5 border-b-2 border-white"></span>
                        অর্ডারটি সাবমিট হচ্ছে...
                      </>
                    ) : (
                      <>
                        Place Order ৳ {totalPrice.toLocaleString("bn-BD")}.০০
                      </>
                    )}
                  </button>
                </div>

              </div>

            </form>
          </div>

      {/* Footer Brand Info and Admin trigger */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-800 text-center">
        <div className="max-w-6xl mx-auto space-y-6">
          <h4 className="text-white text-lg font-bold">তাক্কওয়া এগ্রো লিমিটেড</h4>
          <p className="text-xs max-w-lg mx-auto leading-relaxed">
            কপিরাইট © ২০২৬ তাক্কওয়া এগ্রো লিমিটেড। সর্বস্বত্ব সংরক্ষিত। আমাদের সকল পার্সিমন চারা ১০০% রোগমুক্ত এবং আমাদের নিজস্ব তত্ত্বাবধানে উৎপাদিত ও গ্রাফটিং বা কলম করা।
          </p>

          <div className="flex justify-center gap-6 text-xs text-slate-500 font-semibold">
            <a href="https://www.facebook.com/share/1D7RstLjhk/" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition">ফেসবুক পেজ</a>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <WhatsAppButton />

      {/* Order Success Thank You Modal Screen */}
      {orderSuccess && (
        <div id="thank-you-popup" className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 md:p-8 text-center space-y-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-800">অর্ডার সফল হয়েছে! 🎉</h3>
              <p className="text-slate-400 text-xs font-mono">অর্ডার আইডি: #{lastOrderId.slice(0, 8)}</p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-4">
              <p className="text-slate-800 font-bold text-base text-center leading-relaxed">
                প্রিয় গ্রাহক,
                <br />
                আপনার অডার সফলভাবে গ্রহন করা হয়েছে। ২৪ ঘন্টার মধ্যে আমাদের একজন প্রতিনিধি আপনার সাথে যোগাযোগ করে ডেলিভারী চার্জ এর টাকা নিয়ে অডার কনফার্ম করবেন। ধন্যবাদ 🥰
              </p>
              
              <div className="border-t border-slate-200 pt-3 text-center space-y-1">
                <span className="text-xs text-slate-500 block font-semibold">অগ্রিম ডেলিভারি চার্জ পরিশোধের পরিমাণ:</span>
                <span className="text-lg font-black text-red-600 block">৳ {lastOrderDeliveryCharge}</span>
                <p className="text-[10px] text-slate-400">আমাদের প্রতিনিধি আপনাকে কল করে বিকাশ/রকেট নম্বর জানিয়ে দেবেন।</p>
              </div>
            </div>

            <button
              id="btn-close-thankyou"
              onClick={() => setOrderSuccess(false)}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-base py-3.5 rounded-xl shadow-md transition cursor-pointer"
            >
              ধন্যবাদ, ঠিক আছে
            </button>
          </div>
        </div>
      )}

      {/* Admin Panel Password Prompt Modal */}
      {showPasswordPrompt && (
        <div id="admin-login-popup" className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            id="admin-login-form"
            onSubmit={handleAdminLogin} 
            className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-5"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-800" /> এডমিন অথেন্টিকেশন
              </h3>
              <button
                id="btn-close-login-popup"
                type="button"
                onClick={() => {
                  setShowPasswordPrompt(false);
                  setPasswordError("");
                  setAdminPassword("");
                }}
                className="text-slate-400 hover:text-slate-600 transition p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label htmlFor="admin-password-input" className="block text-slate-700 text-sm font-bold">
                কন্ট্রোল প্যানেল পাসওয়ার্ড দিন
              </label>
              <input
                id="admin-password-input"
                type="password"
                required
                placeholder="পাসওয়ার্ড লিখুন..."
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition text-slate-700 font-semibold"
              />
              {passwordError && (
                <p className="text-rose-600 text-xs font-semibold">{passwordError}</p>
              )}
              <p className="text-[10px] text-slate-400 leading-normal">
                পাসওয়ার্ড নিশ্চিত করুন (ডিফল্ট: <span className="font-mono font-bold text-slate-600">taqwa123</span>)
              </p>
            </div>

            <button
              id="btn-submit-admin-login"
              type="submit"
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 rounded-xl transition cursor-pointer"
            >
              প্রবেশ করুন
            </button>
          </form>
        </div>
      )}

      {/* Real-time Admin Panel Drawer Overlay */}
      {isAdminOpen && (
        <AdminPanel onClose={() => setIsAdminOpen(false)} />
      )}

    </div>
  );
}
