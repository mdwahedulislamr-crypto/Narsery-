import React, { useState } from "react";
import { 
  CheckCircle, 
  Copy, 
  Check, 
  Phone, 
  Printer, 
  ShieldCheck, 
  Clock, 
  HelpCircle, 
  Package, 
  MapPin, 
  ArrowRight,
  ExternalLink,
  Sparkles
} from "lucide-react";
import logoImg from "../assets/images/alkhair_logo_1788636566664.jpg";

interface OrderSuccessScreenProps {
  orderId: string;
  orderData: {
    name: string;
    mobile: string;
    address: string;
    district: string;
    packageName: string;
    packageQty: number;
    itemsPrice: number;
    deliveryCharge: number;
    totalPrice: number;
    deliveryArea: "jela" | "upajela" | "home";
    date: string;
    note?: string;
  };
  onClose: () => void;
  onOpenInvoice?: () => void;
}

export default function OrderSuccessScreen({
  orderId,
  orderData,
  onClose,
  onOpenInvoice
}: OrderSuccessScreenProps) {
  const [copiedBkash, setCopiedBkash] = useState(false);
  const [copiedNagad, setCopiedNagad] = useState(false);

  const copyNumber = (type: "bkash" | "nagad") => {
    navigator.clipboard.writeText("01680589614");
    if (type === "bkash") {
      setCopiedBkash(true);
      setTimeout(() => setCopiedBkash(false), 2500);
    } else {
      setCopiedNagad(true);
      setTimeout(() => setCopiedNagad(false), 2500);
    }
  };

  const deliveryAreaLabel = 
    orderData.deliveryArea === "jela" 
      ? "জেলা সদর কুরিয়ার অফিস (৳২৮০)" 
      : orderData.deliveryArea === "upajela" 
        ? "উপজেলা কুরিয়ার পয়েন্ট (৳৩৫০)" 
        : "সরাসরি হোমডেলিভারী (৳৫০০)";

  const whatsappMessage = encodeURIComponent(
    `আসসালামু আলাইকুম আল খায়ের এগ্রো,\nআমি এইমাত্র অর্ডার করেছি।\n\nঅর্ডার আইডি: #${orderId.slice(0, 8)}\nনাম: ${orderData.name}\nমোবাইল: ${orderData.mobile}\nপ্যাকেজ: ${orderData.packageName}\nঅগ্রিম ডেলিভারি চার্জ: ৳${orderData.deliveryCharge}\n\nআমি ডেলিভারি চার্জ বিকাশ/নগদে পাঠিয়ে অর্ডারটি কনফার্ম করতে চাই।`
  );

  return (
    <div id="order-success-overlay" className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 overflow-y-auto p-3 sm:p-6 flex items-center justify-center">
      <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl border-2 border-emerald-600/30 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-300">
        
        {/* Top Celebration Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 space-y-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-xl ring-4 ring-emerald-400/30">
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>

            <div>
              <span className="inline-block bg-amber-400 text-emerald-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-2 shadow-xs">
                অর্ডার সফলভাবে গ্রহণ করা হয়েছে
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                ধন্যবাদ, {orderData.name}!
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 font-mono mt-1">
                অর্ডার ট্র্যাকিং আইডি: <span className="font-bold text-amber-300">#{orderId.slice(0, 10)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* 1. Official Order Confirmation Notice Box (Exact text requested by User) */}
          <div className="bg-gradient-to-r from-amber-50 via-emerald-50/70 to-teal-50 border-2 border-emerald-600/40 rounded-2xl p-4 sm:p-5 shadow-xs text-left space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-950 font-black text-sm sm:text-base border-b border-emerald-200/60 pb-2">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
              <span>অর্ডার কনফার্ম করার প্রসেস ও নোটিশ:</span>
            </div>
            <p className="text-slate-900 font-bold text-xs sm:text-sm sm:leading-relaxed leading-normal">
              সন্মানিত গ্রাহক আপনার অডার টি সফলভাবে সাবমিট হয়েছে অডার টি কনফার্ম এর জন্য শুধুমাত্র ডেলিভারী চার্জ এর টাকা পাঠিয়ে অডার টি কনফর্ম করতে হবে কিছুক্ষণের মধ্যে আমাদের একজন প্রতি নিধি আপনার সাথে যোগাযোগ করে ডেলিভারী চার্জের টাকা গ্রহন করবেন এবং অডার কনফর্ম করবেন।
            </p>
            <p className="text-emerald-800 font-extrabold text-xs sm:text-sm pt-0.5 flex items-center gap-1.5">
              <span>আল খাইর এগ্রো তে অডার করার জন্য আপনাকে ধন্যবাদ 🤍</span>
            </p>
          </div>

          {/* 2. Ordered Products Itemized Breakdown Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-700" />
                আপনার অর্ডারকৃত পণ্যের তালিকা (Order Details):
              </h3>
              <span className="text-[11px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-md">
                ১০০% কলমের চারা
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black text-slate-900 text-sm sm:text-base">
                    {orderData.packageName}
                  </h4>
                  <p className="text-xs text-emerald-800 font-bold mt-0.5">
                    উন্নত জাতের মালেশিয়ান মিষ্টি লাল রাম্বুটান (১০০% ফলবতী মাতৃগাছের কলম)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    পরিমাণ: <span className="font-bold text-slate-800">{orderData.packageQty} টি প্যাকেজ</span>
                  </p>
                </div>
                <span className="font-black text-slate-900 text-sm sm:text-base whitespace-nowrap">
                  ৳ {orderData.itemsPrice.toLocaleString("bn-BD")}
                </span>
              </div>
            </div>

            {/* Delivery address row */}
            <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>ডেলিভারি ঠিকানা ও গ্রাহকের তথ্য:</span>
              </div>
              <p className="pl-5 font-bold text-slate-800">গ্রাহকের নাম: {orderData.name}</p>
              <p className="pl-5 font-medium text-slate-700">ঠিকানা: {orderData.address}</p>
              <p className="pl-5 font-semibold text-emerald-800">এলাকা: {deliveryAreaLabel}</p>
              <p className="pl-5 font-mono text-slate-600 font-bold">মোবাইল: {orderData.mobile}</p>
            </div>
          </div>

          {/* 3. Delivery Charge Advance Payment Box */}
          <div className="bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-100/40 border-2 border-amber-400 rounded-2xl p-5 space-y-4 shadow-sm text-left">
            
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-md uppercase shadow-xs">
                  <Clock className="w-3 h-3 animate-spin" /> জরুরি নির্দেশিকা
                </div>
                <h3 className="text-base sm:text-lg font-black text-amber-950">
                  শুধুমাত্র ডেলিভারি চার্জ দিয়ে অর্ডার কনফার্ম করুন
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-600 block font-bold">অগ্রিম প্রদেয়:</span>
                <span className="text-xl sm:text-2xl font-black text-red-600 block">
                  ৳ {orderData.deliveryCharge}
                </span>
              </div>
            </div>

            {/* Price Table Summary */}
            <div className="bg-white/90 rounded-xl p-3 text-xs space-y-1.5 border border-amber-200">
              <div className="flex justify-between text-slate-700">
                <span>চারার মোট মূল্য (গাছ পেয়ে পরিশোধ করবেন):</span>
                <span className="font-bold">৳ {orderData.itemsPrice.toLocaleString("bn-BD")}</span>
              </div>
              <div className="flex justify-between text-red-700 font-bold border-t border-slate-100 pt-1">
                <span>কুরিয়ার ডেলিভারি চার্জ (অগ্রিম পরিশোধযোগ্য):</span>
                <span>৳ {orderData.deliveryCharge}</span>
              </div>
              <div className="flex justify-between text-emerald-950 font-black text-sm border-t border-slate-200 pt-1.5">
                <span>সর্বমোট বিল:</span>
                <span className="text-emerald-800">৳ {orderData.totalPrice.toLocaleString("bn-BD")}</span>
              </div>
            </div>

            {/* BKash & Nagad Numbers with One-Click Copy */}
            <div className="space-y-2.5 pt-1">
              <p className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                নিচের যেকোনো নম্বরে ৳ {orderData.deliveryCharge} সেন্ড মানি করুন:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* bKash */}
                <div className="bg-white p-3 rounded-xl border border-pink-200 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[11px] font-black text-[#d12053] block">bKash Personal</span>
                    <span className="font-mono font-black text-slate-900 text-sm sm:text-base">01680589614</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyNumber("bkash")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      copiedBkash 
                        ? "bg-emerald-600 text-white" 
                        : "bg-pink-50 text-[#d12053] border border-pink-200 hover:bg-pink-100"
                    }`}
                  >
                    {copiedBkash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedBkash ? "কপি হয়েছে" : "কপি"}
                  </button>
                </div>

                {/* Nagad */}
                <div className="bg-white p-3 rounded-xl border border-orange-200 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[11px] font-black text-[#f7941d] block">Nagad Personal</span>
                    <span className="font-mono font-black text-slate-900 text-sm sm:text-base">01680589614</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyNumber("nagad")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      copiedNagad 
                        ? "bg-emerald-600 text-white" 
                        : "bg-orange-50 text-[#f7941d] border border-orange-200 hover:bg-orange-100"
                    }`}
                  >
                    {copiedNagad ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedNagad ? "কপি হয়েছে" : "কপি"}
                  </button>
                </div>
              </div>
            </div>

            {/* 3 Step Instruction */}
            <div className="bg-white/80 rounded-xl p-3 border border-amber-200/80 space-y-1.5 text-xs text-slate-700">
              <div className="font-black text-slate-900">ডেলিভারি চার্জ পরিশোধ করার নিয়ম:</div>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 font-medium">
                <li>বিকাশ বা নগদ অ্যাপ ওপেন করে <strong>Send Money</strong> সিলেক্ট করুন।</li>
                <li>প্রাপক নম্বর দিন: <strong className="font-mono text-slate-900">01680589614</strong></li>
                <li>টাকার পরিমাণ দিন: <strong className="text-red-600">৳ {orderData.deliveryCharge}</strong> এবং রেফারেন্সে আপনার নাম বা মোবাইল নম্বর দিন।</li>
                <li>পেমেন্ট সফল হলে নিচের হোয়াটসঅ্যাপ বাটনে মেসেজ বা স্ক্রিনশট পাঠিয়ে দিন।</li>
              </ol>
            </div>
          </div>

          {/* 3. Safe Feel & Trust Assurance Guarantee Box */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 space-y-2.5">
            <h4 className="font-black text-emerald-950 text-xs sm:text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>কেন আপনি আল খায়ের এগ্রো-তে শতভাগ নিরাপদ?</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              <div className="bg-white p-2.5 rounded-xl border border-emerald-100 space-y-0.5">
                <span className="font-bold text-emerald-900 flex items-center gap-1">
                  ✓ শতভাগ মাতৃগাছের কলম
                </span>
                <p className="text-[11px] text-slate-600 leading-tight">
                  বীজের ভেজাল চারা নয়, প্রতিটি চারা পরীক্ষিত মিষ্টি রাম্বুটান মাতৃগাছ থেকে কলম করা।
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-emerald-100 space-y-0.5">
                <span className="font-bold text-emerald-900 flex items-center gap-1">
                  ✓ বাকি টাকা চারা পেয়ে পরিশোধ
                </span>
                <p className="text-[11px] text-slate-600 leading-tight">
                  চারার সমস্ত মূল্য ৳ {orderData.itemsPrice} কুরিয়ার ডেলিভারিম্যানের কাছ থেকে গাছ বুঝে পেয়ে পরিশোধ করবেন।
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-emerald-100 space-y-0.5">
                <span className="font-bold text-emerald-900 flex items-center gap-1">
                  ✓ ফ্রি রিপ্লেসমেন্ট নিশ্চয়তা
                </span>
                <p className="text-[11px] text-slate-600 leading-tight">
                  কুরিয়ারে পরিবহনে চারা নষ্ট হলে কোনো অতিরিক্ত খরচ ছাড়াই সম্পূর্ণ নতুন চারা পাবেন।
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-emerald-100 space-y-0.5">
                <span className="font-bold text-emerald-900 flex items-center gap-1">
                  ✓ রিয়েলটাইম পার্সেল ট্র্যাকিং
                </span>
                <p className="text-[11px] text-slate-600 leading-tight">
                  বুকিং নিশ্চিতের পর কুরিয়ার রশিদ স্লিপ ও চারাগাছের লাইভ ভিডিও হোয়াটসঅ্যাপে দেওয়া হবে।
                </p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-2">
            {/* Primary Action: WhatsApp Confirmation */}
            <a
              href={`https://wa.me/8801680589614?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#1ebd5a] text-white font-black text-sm sm:text-base py-3.5 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>হোয়াটসঅ্যাপে ডেলিভারি চার্জ নিশ্চিত করুন</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Call Hotline */}
              <a
                href="tel:01680589614"
                className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold text-xs sm:text-sm py-3 px-3 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-300" />
                <span>কল দিন: 01680589614</span>
              </a>

              {/* View Cash Memo / Invoice */}
              {onOpenInvoice && (
                <button
                  type="button"
                  onClick={onOpenInvoice}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs sm:text-sm py-3 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>মেমো প্রিন্ট করুন</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full text-slate-500 hover:text-slate-800 text-xs font-bold py-2 transition text-center cursor-pointer"
            >
              পেজে ফিরে যান (Close)
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
