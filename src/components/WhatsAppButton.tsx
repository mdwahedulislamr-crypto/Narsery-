import React, { useState } from "react";
import { Phone, X, PhoneCall } from "lucide-react";
import { trackEvent } from "../lib/pixel";

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);

  const whatsappNumber = "8801306729720";
  const whatsappMessage = encodeURIComponent(
    "আসসালামু আলাইকুম, আমি তাক্কওয়া এগ্রো লিমিটেড থেকে ফলসহ জাপানিজ পার্সিমন প্যাকেজটি (৪৫০০ টাকা) নিতে চাই।"
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
  const callUrl = "tel:01306729720";

  const handleWhatsAppClick = () => {
    // Fire Lead event for WhatsApp click
    trackEvent("Lead", {
      content_name: "WhatsApp Click",
      value: 4500,
      currency: "BDT"
    });
    setIsOpen(false);
  };

  const handleCallClick = () => {
    // Fire Lead event for Phone Call click
    trackEvent("Lead", {
      content_name: "Phone Call Click",
      value: 4500,
      currency: "BDT"
    });
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    trackEvent("Lead", {
      content_name: "Contact Us Menu Toggle",
      value: 4500,
      currency: "BDT"
    });
  };

  return (
    <div 
      id="floating-contact-menu-container" 
      className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end gap-3"
    >
      {/* Expanded Menu Options (Stacked above the trigger) */}
      <div 
        id="contact-options-popup"
        className={`flex flex-col gap-2.5 transition-all duration-300 transform origin-bottom ${
          isOpen 
            ? "translate-y-0 opacity-100 pointer-events-auto scale-100" 
            : "translate-y-4 opacity-0 pointer-events-none scale-95"
        }`}
      >
        {/* WhatsApp Option */}
        <a
          id="btn-popup-whatsapp"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppClick}
          className="bg-[#25D366] hover:bg-[#20ba5a] text-white px-5 py-3 rounded-full shadow-[0_4px_18px_rgba(37,211,102,0.25)] font-bold text-xs sm:text-sm tracking-wide transition-all duration-300 hover:scale-[1.03] flex items-center justify-center gap-2.5 select-none cursor-pointer border border-[#25D366]"
        >
          {/* Custom WhatsApp SVG Icon */}
          <svg 
            className="w-4 h-4 sm:w-5 sm:h-5 fill-white shrink-0" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.333 4.993L2 22l5.188-1.358a9.923 9.923 0 004.82 1.24c5.507 0 9.99-4.478 9.99-9.984 0-2.667-1.04-5.174-2.927-7.062C17.186 3.048 14.683 2 12.012 2zm6.671 14.288c-.274.768-1.34 1.393-1.848 1.442-.475.045-.968.064-3.136-.77-2.775-1.066-4.57-3.896-4.708-4.081-.137-.184-1.121-1.48-1.121-2.825 0-1.344.706-2.006.957-2.274.25-.268.547-.335.73-.335.183 0 .365.003.524.01.164.007.387-.063.607.464.224.538.766 1.867.834 2.007.069.14.115.304.023.49-.092.186-.138.303-.274.462-.137.16-.288.356-.411.478-.137.135-.28.283-.12.558.16.274.71 1.164 1.523 1.885.813.722 1.498.945 1.773 1.08.274.134.433.111.593-.075.16-.186.685-.797.868-1.07.183-.274.365-.23.616-.137.252.093 1.597.753 1.871.89.274.137.457.206.525.321.068.116.068.67-.206 1.438z"/>
          </svg>
          <span>হোয়াটসঅ্যাপে মেসেজ</span>
        </a>

        {/* Call Option */}
        <a
          id="btn-popup-call"
          href={callUrl}
          onClick={handleCallClick}
          className="bg-white hover:bg-slate-50 text-slate-800 px-5 py-3 rounded-full shadow-[0_4px_18px_rgba(0,0,0,0.1)] font-bold text-xs sm:text-sm tracking-wide transition-all duration-300 hover:scale-[1.03] flex items-center justify-center gap-2.5 border border-slate-200 select-none cursor-pointer"
        >
          <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 animate-pulse shrink-0" />
          <span>সরাসরি কল করুন</span>
        </a>
      </div>

      {/* Floating Toggle Widget layout matching the exact screenshot */}
      <div id="contact-us-trigger-group" className="flex items-center gap-2">
        
        {/* White "Contact us" pill bubble with a pointing triangle to its right */}
        <button
          id="bubble-contact-text"
          onClick={toggleMenu}
          className={`relative bg-white hover:bg-slate-50 text-slate-800 px-6 py-3 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-slate-100 font-bold text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer select-none flex items-center justify-center min-w-[110px] ${
            isOpen ? "opacity-30" : "opacity-100"
          }`}
        >
          <span>Contact us</span>
          
          {/* Small Speech Bubble pointing arrow to the right */}
          <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rotate-45 border-r border-t border-slate-100"></div>
        </button>

        {/* Round Green Chat Bubble Button */}
        <button
          id="btn-contact-circle"
          onClick={toggleMenu}
          className="w-14 h-14 bg-[#76c893] hover:bg-[#68b282] text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(118,200,147,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer relative shrink-0"
          title="যোগাযোগ করুন"
        >
          {/* Pulsing ring in closed state */}
          {!isOpen && (
            <span className="animate-ping absolute inset-0 rounded-full bg-[#76c893] opacity-40 pointer-events-none"></span>
          )}

          {isOpen ? (
            <X className="w-6 h-6 text-white transition-transform duration-300" />
          ) : (
            /* Custom white speech bubble icon with 3 dots inside, matching the screenshot icon */
            <svg 
              className="w-7 h-7 text-white fill-white relative z-10 shrink-0" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.01 1 4.33L1.03 21.92c-.15.43.26.83.69.69L7.33 21c1.32.64 2.79 1 4.33 1 5.52 0 10-4.48 10-10S17.52 2 12 2zm-4 11c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

