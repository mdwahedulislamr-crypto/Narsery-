import React from "react";

export default function WhatsAppButton() {
  const whatsappNumber = "8801306729720";
  const whatsappMessage = encodeURIComponent(
    "আসসালামু আলাইকুম, আমি তাক্কওয়া এগ্রো লিমিটেড থেকে ফলসহ জাপানিজ পার্সিমন প্যাকেজটি (৪৫০০ টাকা) নিতে চাই।"
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
  const callUrl = "tel:01306729720";

  return (
    <div 
      id="floating-contact-actions" 
      className="fixed bottom-6 right-4 sm:right-6 z-50 flex items-center gap-3"
    >
      {/* "Contact us" Pill Button (Triggers phone call) */}
      <a
        id="btn-floating-call-pill"
        href={callUrl}
        className="bg-white hover:bg-slate-50 text-slate-800 px-5 py-3 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.12)] font-black text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] flex items-center justify-center border border-slate-150 cursor-pointer select-none"
      >
        Contact us
      </a>

      {/* Round Green Chat Bubble Button (Triggers WhatsApp) */}
      <a
        id="btn-floating-whatsapp-circle"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-[#76c893] hover:bg-[#68b282] text-white rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-105 cursor-pointer relative shrink-0"
        title="হোয়াটসঅ্যাপে যোগাযোগ করুন"
      >
        {/* Dynamic pulse background */}
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#76c893] opacity-40"></span>
        
        {/* SVG Chat bubble icon matching the screenshot */}
        <svg 
          className="w-8 h-8 relative z-10 text-white fill-white" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.01 1 4.33L1.03 21.92c-.15.43.26.83.69.69L7.33 21c1.32.64 2.79 1 4.33 1 5.52 0 10-4.48 10-10S17.52 2 12 2zm-4 11c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
        </svg>
      </a>
    </div>
  );
}

