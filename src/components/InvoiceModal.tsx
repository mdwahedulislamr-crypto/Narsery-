import React from "react";
import { Order } from "../types";
import { Printer, X, CheckCircle, MapPin, Phone, Calendar, ShieldCheck, QrCode } from "lucide-react";
import logoImg from "../assets/images/alkhair_logo_1788636566664.jpg";

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export default function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 print:shadow-none print:border-none print:max-w-none print:w-full">
        
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded uppercase">Memo Invoice</span>
            <h3 className="font-extrabold text-sm sm:text-base">অর্ডার ক্যাশ মেমো / ইনভয়েস</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" /> প্রিন্ট করুন
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Memo Content */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800 print:p-6">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs shrink-0">
                  <img src={logoImg} alt="Al khair agro LTD" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight leading-tight">Al khair agro LTD</h1>
                  <p className="text-[11px] text-emerald-800 font-bold">উন্নত জাতের মালেশিয়ান লাল রাম্বুটান ও নার্সারি পণ্য</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">হটলাইন / হোয়াটসঅ্যাপ: 01680589614 | আল খায়ের এগ্রো লিঃ</p>
            </div>

            <div className="text-right space-y-1">
              <div className="inline-block bg-slate-100 text-slate-900 font-mono font-bold text-xs px-2.5 py-1 rounded-md border border-slate-200">
                MEMO #{order.id.slice(0, 8).toUpperCase()}
              </div>
              <p className="text-xs font-medium text-slate-500">{order.date}</p>
              <span className="inline-block uppercase text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {order.status}
              </span>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">প্রাপকের নাম ও ঠিকানা:</span>
              <p className="font-extrabold text-slate-900 text-sm">{order.name}</p>
              <p className="font-bold text-slate-700 flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-emerald-700" /> {order.mobile}
              </p>
              <p className="text-slate-600 leading-relaxed font-medium">
                {order.address} ({order.district})
              </p>
            </div>

            <div className="space-y-1 text-right">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">কুরিয়ার ও পেমেন্ট তথ্য:</span>
              <p className="font-bold text-slate-800">কুরিয়ার: {order.courierName || 'Steadfast Courier'}</p>
              <p className="text-slate-600">মেথড: {order.paymentMethod?.toUpperCase() || 'COD'}</p>
              {order.transactionId && (
                <p className="font-mono text-emerald-800 font-bold">TrxID: {order.transactionId}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 text-slate-500 uppercase text-[10px] font-black">
                  <th className="py-2">বিবরণ</th>
                  <th className="py-2 text-center">পরিমাণ</th>
                  <th className="py-2 text-right">মূল্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-3">
                    <p className="font-extrabold text-slate-900">{order.packageName || 'মালেশিয়ান লাল রাম্বুটান চারাগাছ'}</p>
                    <p className="text-[11px] text-slate-500">উন্নত জাতের কলমের চারা (কুরিয়ারে নিরাপদ সুরক্ষিত প্যাকেজিং)</p>
                  </td>
                  <td className="py-3 text-center font-bold">{order.packageQty || 1} সেট</td>
                  <td className="py-3 text-right font-bold text-slate-900">৳ {order.price.toLocaleString('bn-BD')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary Breakdown */}
          <div className="border-t border-slate-200 pt-3 flex justify-between items-end">
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1 text-emerald-800 font-bold">
                <ShieldCheck className="w-4 h-4" /> ১০০% অরিজিনাল মালেশিয়ান জাতের গ্যারান্টি
              </div>
              <p className="text-[10px] text-slate-400">পণ্য রিসিভ করার সময় চেক করে কুরিয়ার ডেলিভারিম্যানকে বিল দিন।</p>
            </div>

            <div className="w-48 space-y-1 text-xs text-right">
              <div className="flex justify-between text-slate-600">
                <span>পণ্যের দাম:</span>
                <span className="font-bold">৳ {order.price}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ডেলিভারি চার্জ:</span>
                <span className="font-bold">৳ {order.deliveryCharge}</span>
              </div>
              {order.advancePaid ? (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>পরিশোধিত অগ্রিম:</span>
                  <span>- ৳ {order.advancePaid}</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-slate-300 pt-1 text-sm font-black text-slate-900">
                <span>গাছ বুঝে পেয়ে প্রদেয় (Due):</span>
                <span>৳ {(order.dueAmount ?? order.totalPrice).toLocaleString('bn-BD')}</span>
              </div>
            </div>
          </div>

          {/* Footer & QR */}
          <div className="border-t border-dashed border-slate-300 pt-4 flex justify-between items-center text-[10px] text-slate-500">
            <div>
              <p className="font-bold text-slate-700">ধন্যবাদ আমাদের সাথে কেনাকাটা করার জন্য!</p>
              <p>আল খায়ের এগ্রো লিঃ (Al khair agro LTD) - সেরা কৃষি চারাগাছ ট্রাস্টেড নার্সারি।</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 border border-slate-300 rounded flex items-center justify-center bg-slate-50 text-slate-400">
                <QrCode className="w-7 h-7" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
