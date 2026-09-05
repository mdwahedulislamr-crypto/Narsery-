import React, { useState, useEffect, useRef } from "react";
import { collection, addDoc, setDoc, doc, deleteDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./lib/firebase";
import { initPixel, trackPurchase, trackLead, trackInitiateCheckout, trackEvent, trackViewContent, trackAddPaymentInfo } from "./lib/pixel";
import BenefitsSection from "./components/BenefitsSection";
import CustomerProofBox from "./components/CustomerProofBox";
import WhatsAppButton from "./components/WhatsAppButton";
import AdminPanel from "./components/AdminPanel";
import ImgBBLoader from "./components/ImgBBLoader";
import HeroSection from "./components/HeroSection";
import OrderSuccessScreen from "./components/OrderSuccessScreen";
import InvoiceModal from "./components/InvoiceModal";
import { motion, useScroll, useSpring } from "motion/react";
import logoImg from "./assets/images/alkhair_logo_1788636566664.jpg";
import { Order } from "./types";
import { 
  Phone, 
  MapPin, 
  ShoppingBag, 
  ShieldCheck, 
  CheckCircle, 
  Truck, 
  Lock, 
  ArrowRight, 
  Sparkles,
  AlertTriangle,
  CreditCard,
  Check,
  X,
  Clock,
  Award,
  ChevronDown,
  Plus,
  Minus,
  Info
} from "lucide-react";

interface ProductPackage {
  id: string;
  name: string;
  badge?: string;
  badgeColor?: string;
  pieces: number;
  price: number;
  originalPrice: number;
  image: string;
  imgId: string;
  description: string;
}

const PACKAGES: ProductPackage[] = [
  {
    id: "combo_5_plus_1",
    name: "৫ পিছ নিলে ১ পিছ ফ্রি (মোট ৬ পিছ)",
    badge: "সেরা অফার / সবচেয়ে জনপ্রিয়",
    badgeColor: "bg-red-600 text-white",
    pieces: 6,
    price: 2000,
    originalPrice: 3000,
    image: "https://i.ibb.co/V0wzfZ6b/file-00000000d0bc821082cb2b84f48f1430.png",
    imgId: "HLhb5sZR",
    description: "মালেশিয়ান লাল রাম্বুটান চারা - ৫ পিছ অর্ডার করলে ১ পিছ সম্পূর্ণ ফ্রি!"
  },
  {
    id: "with_fruits_2pcs",
    name: "২ পিছ ফলসহ মালেশিয়ান রাম্বুটান",
    badge: "ফলসহ বড় চারাগাছ",
    badgeColor: "bg-emerald-700 text-white",
    pieces: 2,
    price: 3500,
    originalPrice: 4500,
    image: "https://i.ibb.co/JWjv3VY7/file-0000000086b482089b85b2cb2fba4460.png",
    imgId: "1YGrz1Cq",
    description: "ফলসহ বড় সাইজের পরিপক্ক ও মিষ্টি মালেশিয়ান রাম্বুটান চারা"
  },
  {
    id: "single_1pc",
    name: "১ পিছ মালেশিয়ান লাল রাম্বুটান চারা",
    badge: "সিঙ্গেল চারা",
    badgeColor: "bg-slate-700 text-white",
    pieces: 1,
    price: 500,
    originalPrice: 700,
    image: "https://i.ibb.co/NgwxdhSZ/file-00000000300481fa8784f816dfc70b66.png",
    imgId: "KcC6pZwF",
    description: "উন্নত জাতের সুস্থ সবল ১০০% অরিজিনাল কলমের চারা"
  }
];

const SHOWCASE_CARDS = [
  {
    id: "card_1",
    imgId: "1YGrz1Cq",
    directUrl: "https://i.ibb.co/JWjv3VY7/file-0000000086b482089b85b2cb2fba4460.png",
    title: "ফলসহ মালেশিয়ান লাল রাম্বুটান",
    caption: "ফলসহ পরিপক্ক বড় চারা"
  },
  {
    id: "card_2",
    imgId: "HLhb5sZR",
    directUrl: "https://i.ibb.co/V0wzfZ6b/file-00000000d0bc821082cb2b84f48f1430.png",
    title: "গাছে থোকায় থোকায় রাম্বুটান",
    caption: "অসাধারণ ফলনশীল জাত"
  },
  {
    id: "card_3",
    imgId: "DHG7rkJY",
    directUrl: "https://i.ibb.co/hJXKYH6c/file-000000004cf88211b21046762550d407.png",
    title: "রসালো মিষ্টি লাল রাম্বুটান",
    caption: "অতুলনীয় মিষ্টি ও সুস্বাদু"
  },
  {
    id: "card_4",
    imgId: "KcC6pZwF",
    directUrl: "https://i.ibb.co/NgwxdhSZ/file-00000000300481fa8784f816dfc70b66.png",
    title: "সুস্থ সবল কলমের চারা",
    caption: "১০০% অরিজিনাল জাত"
  },
  {
    id: "card_5",
    imgId: "6cXy2rvj",
    directUrl: "https://i.ibb.co/kVmGp53N/FB-IMG-1788208310227.jpg",
    title: "ঝাঁকড়া পাতার চারাগাছ",
    caption: "দ্রুত বর্ধনশীল ও সতেজ"
  },
  {
    id: "card_6",
    imgId: "LX4bH1DS",
    directUrl: "https://i.ibb.co/MxqWQ7yn/IMG-20260901-023357.jpg",
    title: "নার্সারি থেকে সরাসরি চারা",
    caption: "সুরক্ষিত বিশেষ প্যাকিং"
  }
];

export default function App() {
  // Top Scroll Progress Bar calculation
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Package & Order State
  const [selectedPackageId, setSelectedPackageId] = useState<string>("combo_5_plus_1");
  const [quantity, setQuantity] = useState<number>(1);

  // Form State
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [district, setDistrict] = useState("");
  const [deliveryArea, setDeliveryArea] = useState<"jela" | "upajela" | "home">("jela");
  const [note, setNote] = useState("");

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [transactionId, setTransactionId] = useState("");

  // UI & Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState("");
  const [lastOrderTotal, setLastOrderTotal] = useState(0);
  const [lastOrderDeliveryCharge, setLastOrderDeliveryCharge] = useState(280);
  const [lastOrderData, setLastOrderData] = useState<any>(null);
  const [lastOrderRecord, setLastOrderRecord] = useState<Order | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isFormHighlighted, setIsFormHighlighted] = useState(false);

  // Admin Authentication State
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Order Details Refs
  const formRef = useRef<HTMLDivElement>(null);
  const hasTrackedInitiateCheckout = useRef(false);

  // Selected package calculation
  const currentPackage = PACKAGES.find(p => p.id === selectedPackageId) || PACKAGES[0];
  const itemsPrice = currentPackage.price * quantity;
  const deliveryCharge = deliveryArea === "jela" ? 280 : deliveryArea === "upajela" ? 350 : 500;
  const totalPrice = itemsPrice + deliveryCharge;

  // Live Mobile Operator Detection
  const getMobileOperator = (num: string) => {
    if (num.length < 3) return null;
    const prefix = num.substring(0, 3);
    if (prefix === "017" || prefix === "013") return { name: "Grameenphone", color: "bg-cyan-700" };
    if (prefix === "018") return { name: "Robi", color: "bg-red-600" };
    if (prefix === "019" || prefix === "014") return { name: "Banglalink", color: "bg-orange-600" };
    if (prefix === "015") return { name: "Teletalk", color: "bg-emerald-700" };
    if (prefix === "016") return { name: "Airtel", color: "bg-rose-600" };
    return null;
  };

  // Incomplete Order Tracking - Auto Save Draft
  useEffect(() => {
    if (mobile.length >= 11 && (name.trim() || address.trim())) {
      const timer = setTimeout(async () => {
        try {
          const draftRef = doc(db, "drafts", `draft_${mobile}`);
          await setDoc(draftRef, {
            id: `draft_${mobile}`,
            name,
            mobile,
            address,
            district,
            note,
            deliveryArea,
            packageName: currentPackage.name,
            packageQty: quantity,
            lastUpdated: Date.now(),
            dateStr: new Date().toLocaleTimeString("bn-BD"),
            status: 'incomplete'
          });
        } catch (e) {
          console.warn("Draft auto-save notice:", e);
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [name, mobile, address, district, note, deliveryArea, currentPackage, quantity]);

  // Initialize Meta Pixel on Mount and track ViewContent
  useEffect(() => {
    initPixel();
    trackViewContent(currentPackage.name, currentPackage.price);
  }, []);

  // Check URL pathname/search query/hash for Secret Admin Panel entry trigger
  useEffect(() => {
    const checkForAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const searchParams = new URLSearchParams(window.location.search);
      const isAdminRoute = 
        path.includes("/admin") ||
        path.includes("/alkhair") ||
        path.includes("/panel") ||
        hash === "#admin" ||
        hash === "#alkhair" ||
        searchParams.get("admin") === "true" ||
        searchParams.get("admin") === "alkhair" ||
        searchParams.get("view") === "admin" ||
        searchParams.get("page") === "admin";

      if (isAdminRoute) {
        const isAlreadyAuthed = sessionStorage.getItem("alkhair_admin_session") === "true";
        if (isAlreadyAuthed) {
          setIsAdminOpen(true);
        } else {
          setShowPasswordPrompt(true);
        }
      }
    };

    checkForAdminRoute();
    window.addEventListener("hashchange", checkForAdminRoute);
    window.addEventListener("popstate", checkForAdminRoute);

    // Secret shortcut: Alt + A or Ctrl + Alt + A opens Admin Login
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === "a") || (e.ctrlKey && e.altKey && e.key.toLowerCase() === "a")) {
        e.preventDefault();
        setShowPasswordPrompt(true);
      }
    };
    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("hashchange", checkForAdminRoute);
      window.removeEventListener("popstate", checkForAdminRoute);
      window.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  // Ultra-Smooth animated scroll to order form with header offset & highlight
  const scrollToForm = () => {
    if (formRef.current) {
      const headerOffset = 75;
      const elementPosition = formRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      // Highlight the order form container to instantly draw focus
      setIsFormHighlighted(true);
      setTimeout(() => setIsFormHighlighted(false), 2600);
    }
    trackEvent("Lead", {
      content_name: "Order CTA Button Click",
      value: totalPrice,
      currency: "BDT"
    });
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

    trackEvent("Lead", {
      content_name: "Place Order Submit Click",
      value: totalPrice,
      currency: "BDT"
    });

    // Validations
    if (!name.trim()) {
      alert("দয়া করে আপনার নাম লিখুন।");
      return;
    }
    if (!mobile.trim() || mobile.length < 11) {
      alert("দয়া করে একটি সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন।");
      return;
    }
    if (!address.trim()) {
      alert("দয়া করে আপনার পূর্ণাঙ্গ ঠিকানা লিখুন।");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if phone or IP is blocked
      try {
        const blockQuery = query(collection(db, "blocked"), where("value", "==", mobile.trim()));
        const blockSnap = await getDocs(blockQuery);
        if (!blockSnap.empty) {
          alert("দুঃখিত, এই নম্বরটি সাময়িকভাবে ব্লক করা হয়েছে। বিস্তারিত জানতে 01680589614 নাম্বারে যোগাযোগ করুন।");
          setIsSubmitting(false);
          return;
        }
      } catch (blockErr) {
        console.warn("Blocked list check skipped or unavailable:", blockErr);
      }

      const now = new Date();
      const formattedDate = now.toLocaleDateString("bn-BD", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }) + " " + now.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });

      const areaText = deliveryArea === "jela" 
        ? "জেলা সদর (৳২৮০)" 
        : deliveryArea === "upajela" 
          ? "উপজেলা (৳৩৫০)" 
          : "হোমডেলিভারী (৳৫০০)";

      const orderDetails = {
        name,
        address,
        mobile,
        note,
        district: district.trim() ? `${district} - ${areaText}` : areaText,
        packageName: currentPackage.name,
        packageQty: quantity,
        itemsPrice,
        deliveryCharge,
        totalPrice,
        deliveryArea,
        date: formattedDate
      };

      const newOrder = {
        ...orderDetails,
        price: itemsPrice,
        paymentMethod: paymentMethod === 'bkash' ? 'bkash' : paymentMethod === 'nagad' ? 'nagad' : 'advance_delivery_due_balance',
        transactionId: transactionId.trim().toUpperCase(),
        advancePaid: deliveryCharge,
        dueAmount: itemsPrice,
        timestamp: Date.now(),
        status: "pending"
      };

      // Add to Firestore Database
      const docRef = await addDoc(collection(db, "orders"), newOrder);
      
      // Clear draft upon completion
      try {
        await deleteDoc(doc(db, "drafts", `draft_${mobile}`));
      } catch (e) {}

      setLastOrderId(docRef.id);
      setLastOrderTotal(totalPrice);
      setLastOrderDeliveryCharge(deliveryCharge);
      setLastOrderData(orderDetails);
      setLastOrderRecord({ ...newOrder, id: docRef.id } as any);
      setOrderSuccess(true);
      
      // Track Meta Pixel Conversion Events
      trackLead(totalPrice, currentPackage.name);
      trackPurchase(docRef.id, totalPrice, currentPackage.name, deliveryCharge, quantity);

      // Reset form
      setName("");
      setAddress("");
      setMobile("");
      setDistrict("");
      setNote("");
      setTransactionId("");

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
    if (adminPassword === "alkhair123" || adminPassword === "alkhair2026" || adminPassword === "taqwa123") {
      sessionStorage.setItem("alkhair_admin_session", "true");
      setIsAdminOpen(true);
      setShowPasswordPrompt(false);
      setAdminPassword("");
      setPasswordError("");
    } else {
      setPasswordError("ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড লিখুন (alkhair123)");
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-600 selection:text-white pb-12 font-sans">
      
      {/* 1. Top Scroll Progress Bar */}
      <motion.div
        id="top-scroll-progress-bar"
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500 origin-left z-50 shadow-sm pointer-events-none"
        style={{ scaleX }}
      />

      {/* 2. Top Header Brand & Call Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-emerald-600/30 shadow-xs bg-white shrink-0">
              <img 
                src={logoImg} 
                alt="Al khair agro LTD Logo" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain p-0.5" 
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight leading-none">
                  Al khair agro LTD
                </h1>
                <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-md hidden sm:inline-block">
                  অরিজিনাল নার্সারি
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-bold text-emerald-800 tracking-wide mt-0.5">
                উন্নত জাতের মালেশিয়ান লাল রাম্বুটান চারা
              </p>
            </div>
          </div>

          <a
            href="tel:01680589614"
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white px-3.5 sm:px-4 py-2 rounded-xl font-extrabold text-xs sm:text-sm hover:brightness-110 transition shadow-sm"
          >
            <Phone className="w-4 h-4 text-emerald-200 animate-pulse" />
            <span className="font-mono">01680589614</span>
          </a>
        </div>
      </header>

      {/* 3. High-Converting Attractive Hero Section with Banner Image & Carousel */}
      <HeroSection onOrderClick={scrollToForm} />

      {/* 4. Product Gallery Cards (6 Cards with border, image, and dark blue label as in video) */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="py-10 px-4 max-w-4xl mx-auto"
      >
        <div className="text-center mb-8 space-y-1.5">
          <span className="bg-red-50 text-red-700 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
            বাস্তব চিত্র ও মাতৃগাছ
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            আমাদের মালেশিয়ান লাল রাম্বুটান চারাগাছ
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            নিচে আমাদের নার্সারির বাস্তব ও অরিজিনাল চারাগাছের চিত্রসমূহ তুলে ধরা হলো:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {SHOWCASE_CARDS.map((card, index) => (
            <motion.div 
              key={card.id}
              initial={{ opacity: 0, y: 35, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ 
                duration: 0.55, 
                delay: (index % 3) * 0.12, 
                ease: [0.22, 1, 0.36, 1] 
              }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-500/60 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                <ImgBBLoader
                  id={card.imgId}
                  directUrl={card.directUrl}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  fallbackUrl="https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&q=80&w=600"
                />
              </div>
              <div className="bg-[#1e3a8a] text-white p-3 text-center">
                <h4 className="font-extrabold text-sm sm:text-base leading-snug">
                  {card.title}
                </h4>
                <p className="text-[11px] text-blue-200 font-medium mt-0.5">
                  {card.caption}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 5. Benefits, Care Guidelines, and Reasons to Buy Section */}
      <BenefitsSection onOrderClick={scrollToForm} />

      {/* 6. Customer Proof & Delivery Box with Infinite Leftward Marquee Animation */}
      <CustomerProofBox />

      {/* 7. Compact Checkout & Billing Details Section (Smooth Animated Box) */}
      <motion.div 
        ref={formRef} 
        id="order-form-container" 
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl mx-auto px-4 my-10 scroll-mt-20"
      >
        <div className={`bg-slate-50 rounded-3xl border-2 transition-all duration-700 p-5 sm:p-8 shadow-xl space-y-6 ${
          isFormHighlighted 
            ? "border-emerald-500 ring-4 ring-emerald-400/50 shadow-2xl shadow-emerald-950/20 scale-[1.01]" 
            : "border-emerald-600/30"
        }`}>
          
          <div className="text-center space-y-1.5 pb-3 border-b border-slate-200">
            <span className="bg-emerald-700 text-white text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
              সহজ ও সুরক্ষিত বুকিং ফর্ম
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              অর্ডার করতে নিচের তথ্যগুলো পূরণ করুন
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl mx-auto">
              শুধুমাত্র ডেলিভারি চার্জ অগ্রিম বিকাশ/নগদে দিয়ে অর্ডার কনফার্ম করুন, চারা হাতে পেয়ে অবশিষ্ট মূল্য পরিশোধ করবেন। ১০০% ফলবতী মাতৃগাছ থেকে কলম করা চারা।
            </p>
          </div>

          <form onSubmit={handleOrderSubmit} className="space-y-6">
            
            {/* Step 1: Package Selection (Clean & Clear) */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <label className="block text-slate-900 font-black text-base sm:text-lg">
                ১. আপনার পছন্দের প্যাকেজটি সিলেক্ট করুন: <span className="text-red-600">*</span>
              </label>

              <div className="space-y-2.5">
                {PACKAGES.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition flex items-center justify-between gap-3 ${
                        isSelected 
                          ? "border-emerald-700 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600" 
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="product_package"
                          checked={isSelected}
                          onChange={() => setSelectedPackageId(pkg.id)}
                          className="w-4 h-4 text-emerald-700 focus:ring-emerald-600 cursor-pointer shrink-0"
                        />
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          <ImgBBLoader
                            id={pkg.imgId}
                            directUrl={pkg.image}
                            alt={pkg.name}
                            className="w-full h-full object-cover"
                            fallbackUrl="https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&q=80&w=150"
                          />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-sm sm:text-base text-slate-900">
                              {pkg.name}
                            </span>
                            {pkg.badge && (
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${pkg.badgeColor || "bg-emerald-700 text-white"}`}>
                                {pkg.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium line-clamp-1">
                            {pkg.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base sm:text-lg font-black text-emerald-800 block">
                          ৳ {pkg.price}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ৳ {pkg.originalPrice}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs sm:text-sm font-bold text-slate-700">
                  প্যাকেজ সংখ্যা (পরিমাণ):
                </span>
                <div className="flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-7 h-7 rounded-lg bg-white text-slate-800 font-black flex items-center justify-center hover:bg-slate-200 shadow-xs cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-black text-base text-slate-900 w-6 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="w-7 h-7 rounded-lg bg-white text-slate-800 font-black flex items-center justify-center hover:bg-slate-200 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Customer Billing Details (Compact & Streamlined) */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-left">
              <h4 className="text-base sm:text-lg font-black text-slate-900 border-b border-slate-100 pb-2">
                ২. আপনার নাম ও ঠিকানা লিখুন (Billing Details):
              </h4>

              {/* Full Name */}
              <div className="space-y-1">
                <label htmlFor="customer-name" className="block text-slate-800 font-bold text-sm">
                  আপনার পুরো নাম <span className="text-red-600">*</span>
                </label>
                <input
                  id="customer-name"
                  type="text"
                  required
                  placeholder="যেমন: মোঃ আব্দুল্লাহ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={triggerInitiateCheckoutOnFocus}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 font-semibold text-sm shadow-xs"
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="customer-mobile" className="block text-slate-800 font-bold text-sm">
                    মোবাইল নাম্বার <span className="text-red-600">*</span>
                  </label>
                  {getMobileOperator(mobile) && (
                    <span className={`${getMobileOperator(mobile)?.color} text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1`}>
                      <Check className="w-3 h-3" /> {getMobileOperator(mobile)?.name}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="customer-mobile"
                    type="tel"
                    required
                    maxLength={11}
                    placeholder="১১ ডিজিটের মোবাইল নাম্বার দিন (যেমন: 017xxxxxxxx)"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                    onFocus={triggerInitiateCheckoutOnFocus}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 font-bold text-sm font-mono tracking-wide shadow-xs"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 font-mono">
                    {mobile.length}/11
                  </span>
                </div>
                {mobile.length > 0 && mobile.length < 11 && (
                  <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> ১১ ডিজিটের সঠিক মোবাইল নম্বর দিন
                  </p>
                )}
              </div>

              {/* Delivery Address */}
              <div className="space-y-1">
                <label htmlFor="customer-address" className="block text-slate-800 font-bold text-sm">
                  পূর্ণাঙ্গ ঠিকানা বা নিকটতম কুরিয়ারের নাম <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="customer-address"
                  required
                  rows={2}
                  placeholder="যেমন: গ্রাম, ইউনিয়ন/থানা, কুরিয়ার শাখা"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onFocus={triggerInitiateCheckoutOnFocus}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 font-medium text-sm leading-relaxed shadow-xs"
                />
              </div>

              {/* District & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="customer-district" className="block text-slate-800 font-bold text-sm">
                    জেলা (District)
                  </label>
                  <input
                    id="customer-district"
                    type="text"
                    placeholder="যেমন: ঢাকা / চট্টগ্রাম / রাজশাহী"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 font-medium text-sm shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <span className="block text-slate-800 font-bold text-sm">Country / Region</span>
                  <div className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold text-sm select-none">
                    Bangladesh
                  </div>
                </div>
              </div>

              {/* Optional Note */}
              <div className="space-y-1">
                <label htmlFor="customer-note" className="block text-slate-700 font-semibold text-xs">
                  বিশেষ অনুরোধ বা নোট (অপশনাল)
                </label>
                <input
                  id="customer-note"
                  type="text"
                  placeholder="যেমন: কুরিয়ারে পৌঁছালে ফোন দিবেন"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs shadow-xs"
                />
              </div>
            </div>

            {/* Step 3: Shipping Selection */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <label className="block text-slate-900 font-black text-sm sm:text-base">
                ৩. ডেলিভারি এলাকা নির্বাচন করুন: <span className="text-red-600">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. District Sadar 280 */}
                <label className={`p-3 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between ${
                  deliveryArea === "jela"
                    ? "border-emerald-700 bg-emerald-50 text-emerald-950 shadow-xs ring-1 ring-emerald-600"
                    : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                }`}>
                  <div className="flex items-center gap-2.5 mb-1">
                    <input
                      type="radio"
                      name="delivery_area"
                      checked={deliveryArea === "jela"}
                      onChange={() => setDeliveryArea("jela")}
                      className="w-4 h-4 text-emerald-700"
                    />
                    <span className="font-bold text-xs sm:text-sm">জেলা সদর</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-500">কুরিয়ার অফিস</span>
                    <span className="font-black text-emerald-800 text-sm">৳ ২৮০</span>
                  </div>
                </label>

                {/* 2. Upazila 350 */}
                <label className={`p-3 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between ${
                  deliveryArea === "upajela"
                    ? "border-emerald-700 bg-emerald-50 text-emerald-950 shadow-xs ring-1 ring-emerald-600"
                    : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                }`}>
                  <div className="flex items-center gap-2.5 mb-1">
                    <input
                      type="radio"
                      name="delivery_area"
                      checked={deliveryArea === "upajela"}
                      onChange={() => setDeliveryArea("upajela")}
                      className="w-4 h-4 text-emerald-700"
                    />
                    <span className="font-bold text-xs sm:text-sm">উপজেলা</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-500">উপজেলা পয়েন্ট</span>
                    <span className="font-black text-emerald-800 text-sm">৳ ৩৫০</span>
                  </div>
                </label>

                {/* 3. Home Delivery 500 */}
                <label className={`p-3 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between ${
                  deliveryArea === "home"
                    ? "border-emerald-700 bg-emerald-50 text-emerald-950 shadow-xs ring-1 ring-emerald-600"
                    : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                }`}>
                  <div className="flex items-center gap-2.5 mb-1">
                    <input
                      type="radio"
                      name="delivery_area"
                      checked={deliveryArea === "home"}
                      onChange={() => setDeliveryArea("home")}
                      className="w-4 h-4 text-emerald-700"
                    />
                    <span className="font-bold text-xs sm:text-sm">হোমডেলিভারী</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-500">সরাসরি ঠিকানায়</span>
                    <span className="font-black text-emerald-800 text-sm">৳ ৫০০</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Step 4: Compact Order Summary Table */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-base font-black text-slate-900 border-b border-slate-100 pb-2">
                ৪. আপনার অর্ডার বিবরণী (Your Order):
              </h4>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
                <div className="flex justify-between bg-slate-50 p-2.5 font-bold text-slate-600">
                  <span>Product</span>
                  <span>Subtotal</span>
                </div>

                <div className="flex justify-between items-center p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">
                      {currentPackage.name}
                    </span>
                    <span className="text-slate-500 font-mono">× {quantity}</span>
                  </div>
                  <span className="font-black text-slate-900">৳ {itemsPrice.toLocaleString("bn-BD")}</span>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-slate-50/50">
                  <span className="text-slate-600 font-semibold">ডেলিভারি চার্জ:</span>
                  <span className="font-bold text-slate-800">৳ {deliveryCharge}</span>
                </div>

                <div className="flex justify-between items-center p-3.5 bg-emerald-50 font-black text-emerald-950 text-base">
                  <span>সর্বমোট (Total):</span>
                  <span className="text-emerald-900 text-lg">৳ {totalPrice.toLocaleString("bn-BD")}.০০</span>
                </div>
              </div>
            </div>

            {/* বিঃদ্রঃ ডেলিভারি চার্জ অগ্রিম সংক্রান্ত তথ্য (আগের নোট) */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs sm:text-sm text-amber-950 space-y-2 text-left shadow-xs">
              <div className="font-black flex items-center gap-1.5 text-amber-900 text-sm">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                বিঃদ্রঃ ডেলিভারি চার্জ অগ্রিম সংক্রান্ত তথ্য:
              </div>
              <p className="leading-relaxed font-medium">
                গাছের পার্সেল বুকিংয়ের সময় কুরিয়ার সার্ভিস ডেলিভারি চার্জের টাকা নিয়ে বুকিং করে। তাই শুধুমাত্র ডেলিভারি চার্জ (৳ {deliveryCharge}) আমাদের বিকাশ/নগদ নাম্বারে (<strong>01680589614</strong>) অগ্রিম দিয়ে অর্ডারটি কনফার্ম করতে হবে। অর্ডার প্লেস করার পর কিছুক্ষণের মধ্যে আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।
              </p>
            </div>

            {/* Step 6: Place Order Submit Button */}
            <div className="pt-2">
              <button
                id="btn-submit-order"
                type="submit"
                disabled={isSubmitting}
                className={`w-full text-white font-black text-lg sm:text-xl py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isSubmitting 
                    ? "bg-slate-400 cursor-not-allowed" 
                    : "bg-[#008751] hover:bg-[#007043] hover:scale-[1.01] active:scale-98"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    অর্ডারটি কনফার্ম হচ্ছে...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    অর্ডার কনফার্ম করুন ৳ {totalPrice.toLocaleString("bn-BD")}.০০
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-slate-500 font-semibold mt-2.5 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                আপনার তথ্য সম্পূর্ণ সুরক্ষিত এবং অর্ডারটি সরাসরি নার্সারিতে সংরক্ষিত হবে।
              </p>
            </div>

          </form>
        </div>
      </motion.div>

      {/* 8. Footer Brand Info */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-4 border-t border-slate-800 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div 
            onClick={() => setShowPasswordPrompt(true)}
            title="Al khair agro LTD"
            className="w-14 h-14 mx-auto rounded-2xl overflow-hidden bg-white p-1 border border-slate-700 shadow-md cursor-pointer hover:border-emerald-500 transition"
          >
            <img 
              src={logoImg} 
              alt="Al khair agro LTD" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain" 
            />
          </div>
          <h4 className="text-white text-base sm:text-lg font-bold">Al khair agro LTD</h4>
          <p className="text-xs max-w-md mx-auto leading-relaxed text-slate-400">
            কপিরাইট © ২০২৬ Al khair agro LTD। সর্বস্বত্ব সংরক্ষিত। আমাদের সকল রাম্বুটান চারা ১০০% রোগমুক্ত এবং আমাদের নিজস্ব নার্সারিতে কলম করা।
          </p>
          <div className="text-xs text-emerald-400 font-mono flex items-center justify-center gap-1.5 pt-1">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>হটলাইন / হোয়াটসঅ্যাপ: 01680589614</span>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <WhatsAppButton />

      {/* Order Success Full-Page Modal Screen with Ordered Items List & Payment Instructions */}
      {orderSuccess && lastOrderData && (
        <OrderSuccessScreen
          orderId={lastOrderId}
          orderData={lastOrderData}
          onClose={() => setOrderSuccess(false)}
          onOpenInvoice={() => {
            setIsInvoiceOpen(true);
            setOrderSuccess(false);
          }}
        />
      )}

      {/* Printable Invoice / Cash Memo Modal */}
      {isInvoiceOpen && lastOrderRecord && (
        <InvoiceModal
          order={lastOrderRecord}
          onClose={() => setIsInvoiceOpen(false)}
        />
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
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-800" /> এডমিন প্যানেল
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
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition text-slate-800 font-semibold text-sm"
              />
              {passwordError && (
                <p className="text-rose-600 text-xs font-semibold">{passwordError}</p>
              )}
            </div>

            <button
              id="btn-submit-admin-login"
              type="submit"
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 rounded-xl transition cursor-pointer text-sm"
            >
              লগইন করুন
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
