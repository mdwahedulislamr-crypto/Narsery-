import React, { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Order } from "../types";
import { 
  Search, 
  X, 
  Phone, 
  MapPin, 
  Calendar, 
  Trash2, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Truck, 
  DollarSign, 
  FileText, 
  ChevronRight, 
  Filter,
  Download
} from "lucide-react";

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Load orders from Firestore in real-time
  useEffect(() => {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("timestamp", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData: Order[] = [];
      snapshot.forEach((doc) => {
        ordersData.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching real-time orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update order status in Firestore
  const updateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const orderDocRef = doc(db, "orders", orderId);
      await updateDoc(orderDocRef, { status: newStatus });
      
      // Update selected order details in state if active
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      alert("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  // Delete order from Firestore
  const deleteOrder = async (orderId: string) => {
    if (window.confirm("আপনি কি নিশ্চিতভাবে এই অর্ডারটি ডিলিট করতে চান? এটি রিভার্স করা যাবে না।")) {
      try {
        await deleteDoc(doc(db, "orders", orderId));
        setSelectedOrder(null);
      } catch (error) {
        alert("অর্ডার ডিলিট করতে সমস্যা হয়েছে।");
      }
    }
  };

  // Export orders to CSV (extremely useful for Netlify/standalone nursery admins!)
  const exportToCSV = () => {
    if (orders.length === 0) return;
    
    const headers = ["Order ID,Date,Name,Mobile,Address,District,Note,Price,Delivery Charge,Total Price,Status\n"];
    const rows = orders.map(o => {
      return `"${o.id}","${o.date}","${o.name.replace(/"/g, '""')}","${o.mobile}","${o.address.replace(/"/g, '""')}","${o.district}","${(o.note || '').replace(/"/g, '""')}",${o.price},${o.deliveryCharge},${o.totalPrice},"${o.status}"`;
    });
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Taqwa_Agro_Orders_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Search Logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.mobile.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Analytics
  const totalCount = orders.length;
  const pendingCount = orders.filter(o => o.status === "pending").length;
  const confirmedCount = orders.filter(o => o.status === "confirmed").length;
  const deliveredCount = orders.filter(o => o.status === "delivered").length;
  const totalRevenue = orders
    .filter(o => o.status === "confirmed" || o.status === "delivered")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" /> পেন্ডিং
          </span>
        );
      case "confirmed":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" /> কনফার্মড
          </span>
        );
      case "delivered":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
            <Truck className="w-3.5 h-3.5" /> ডেলিভারড
          </span>
        );
      case "cancelled":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" /> ক্যানসেলড
          </span>
        );
    }
  };

  return (
    <div id="admin-panel-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end">
      {/* Drawer Container */}
      <div 
        id="admin-drawer" 
        className="w-full max-w-4xl bg-slate-50 h-full flex flex-col shadow-2xl overflow-hidden relative"
      >
        {/* Header */}
        <div className="bg-emerald-950 text-white p-6 flex justify-between items-center border-b border-emerald-800 shadow-md">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">তাক্কওয়া এগ্রো লিমিটেড - কন্ট্রোল প্যানেল</h2>
            <p className="text-emerald-300 text-xs mt-1">সবগুলো অর্ডারের বিবরণ এবং রিয়েল-টাইম তথ্য</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-export-csv"
              onClick={exportToCSV}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 px-3.5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
              title="অর্ডার এক্সপোর্ট করুন"
            >
              <Download className="w-4 h-4" /> এক্সপোর্ট (CSV)
            </button>
            <button
              id="btn-close-admin"
              onClick={onClose}
              className="p-2 hover:bg-emerald-900/50 rounded-lg transition text-slate-200 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-white border-b border-slate-200">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center shadow-sm">
            <div className="text-slate-500 text-xs font-medium uppercase">মোট অর্ডার</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">{totalCount}</div>
          </div>
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-center shadow-sm">
            <div className="text-amber-600 text-xs font-medium uppercase">পেন্ডিং</div>
            <div className="text-2xl font-bold text-amber-700 mt-1">{pendingCount}</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-center shadow-sm">
            <div className="text-blue-600 text-xs font-medium uppercase">কনফার্মড</div>
            <div className="text-2xl font-bold text-blue-700 mt-1">{confirmedCount}</div>
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center shadow-sm">
            <div className="text-emerald-600 text-xs font-medium uppercase">ডেলিভারড</div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{deliveredCount}</div>
          </div>
          <div className="col-span-2 md:col-span-1 bg-purple-50 p-3 rounded-xl border border-purple-200 text-center shadow-sm">
            <div className="text-purple-600 text-xs font-medium uppercase text-ellipsis overflow-hidden whitespace-nowrap">মোট রেভিনিউ</div>
            <div className="text-xl font-bold text-purple-700 mt-1">৳ {totalRevenue.toLocaleString()}</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="p-4 bg-white border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
            <input
              id="admin-search-input"
              type="text"
              placeholder="গ্রাহকের নাম বা মোবাইল নম্বর দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition text-slate-700 font-medium text-sm"
            />
          </div>

          {/* Status Filter Tab row */}
          <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { label: "সকল", value: "all" },
              { label: "পেন্ডিং", value: "pending" },
              { label: "কনফার্মড", value: "confirmed" },
              { label: "ডেলিভারড", value: "delivered" },
              { label: "ক্যানসেলড", value: "cancelled" },
            ].map(tab => (
              <button
                key={tab.value}
                id={`btn-filter-${tab.value}`}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all shrink-0 ${
                  statusFilter === tab.value 
                    ? "bg-emerald-800 text-white shadow-sm" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Listing & Details Section */}
        <div className="flex-1 flex overflow-hidden">
          {/* List Part */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-800 mb-3"></div>
                অর্ডার লিস্ট লোড হচ্ছে...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-20 text-slate-500 font-medium text-sm">
                কোনো অর্ডার পাওয়া যায়নি!
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  id={`order-summary-${order.id}`}
                  onClick={() => setSelectedOrder(order)}
                  className={`bg-white p-4 rounded-xl border transition-all cursor-pointer shadow-sm hover:shadow-md flex items-center justify-between ${
                    selectedOrder?.id === order.id 
                      ? "border-emerald-600 bg-emerald-50/20" 
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-base">{order.name}</span>
                      <span className="text-slate-400 text-xs font-mono">#{order.id.slice(0, 6)}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {order.mobile}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {order.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-emerald-800 text-sm">৳ {order.totalPrice}</div>
                      <div className="text-slate-400 text-[10px]">{order.district}</div>
                    </div>
                    <div>
                      {getStatusBadge(order.status)}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Details Part - Sliding Drawer on Wide Screens or Overlay */}
          {selectedOrder && (
            <div id="order-detail-view" className="w-full md:w-[450px] bg-white border-l border-slate-200 h-full overflow-y-auto flex flex-col shadow-xl fixed md:relative inset-y-0 right-0 z-50">
              {/* Detail Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-lg">অর্ডারের বিস্তারিত বিবরণ</h3>
                <button
                  id="btn-close-detail"
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 hover:bg-slate-200 rounded-full transition text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Detail Body */}
              <div className="p-6 space-y-6 flex-1">
                {/* ID and Date */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>অর্ডার আইডি:</span>
                    <span className="font-mono font-bold text-slate-700">#{selectedOrder.id}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>অর্ডারের সময়:</span>
                    <span className="font-medium text-slate-700">{selectedOrder.date}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 text-xs font-semibold">
                    <span className="text-slate-500">বর্তমান স্ট্যাটাস:</span>
                    <div>{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-1.5">গ্রাহকের তথ্য</h4>
                  
                  <div className="space-y-3.5 text-sm text-slate-600">
                    <div>
                      <div className="text-xs text-slate-400 mb-0.5">নাম:</div>
                      <div className="font-bold text-slate-800">{selectedOrder.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-0.5">মোবাইল নম্বর:</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono font-bold text-slate-800 text-base">{selectedOrder.mobile}</span>
                        <a 
                          href={`tel:${selectedOrder.mobile}`}
                          className="p-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-full transition"
                          title="সরাসরি কল দিন"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        <a 
                          href={`https://wa.me/88${selectedOrder.mobile}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-full transition font-semibold"
                          title="হোয়াটসঅ্যাপ চ্যাট"
                        >
                          WA
                        </a>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-0.5">ডেলিভারি ঠিকানা:</div>
                      <div className="font-semibold text-slate-800 flex items-start gap-1">
                        <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <span>{selectedOrder.address}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-0.5">জেলা/অবস্থান:</div>
                      <div className="font-semibold text-slate-800">{selectedOrder.district}</div>
                    </div>
                  </div>
                </div>

                {/* Product Detail */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-1.5">প্রোডাক্টের বিবরণ</h4>
                  <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-emerald-950 text-sm">৩ পিছ ফলসহ জাপানিজ পার্সিমন চারাগাছ</div>
                      <div className="text-slate-500 text-xs mt-0.5">জাপানিজ ফুইয়ু জাতের কলম চারা</div>
                    </div>
                    <div className="font-bold text-emerald-800">৳ {selectedOrder.price}</div>
                  </div>
                </div>

                {/* Order Note */}
                {selectedOrder.note && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-1.5">গ্রাহকের নোট</h4>
                    <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-100 text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                      <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{selectedOrder.note}</span>
                    </div>
                  </div>
                )}

                {/* Pricing Summary */}
                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>প্রোডাক্টের দাম:</span>
                    <span className="font-medium">৳ {selectedOrder.price}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>ডেলিভারি চার্জ:</span>
                    <span className="font-medium">৳ {selectedOrder.deliveryCharge}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-emerald-800">
                    <span>সর্বমোট বিল:</span>
                    <span>৳ {selectedOrder.totalPrice}</span>
                  </div>
                </div>

                {/* Change Status Action Row */}
                <div className="space-y-2.5">
                  <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-1.5">স্ট্যাটাস আপডেট করুন</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="btn-status-pending"
                      onClick={() => updateStatus(selectedOrder.id, "pending")}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer border transition ${
                        selectedOrder.status === "pending"
                          ? "bg-amber-500 border-amber-600 text-white shadow"
                          : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" /> পেন্ডিং রাখুন
                    </button>
                    <button
                      id="btn-status-confirm"
                      onClick={() => updateStatus(selectedOrder.id, "confirmed")}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer border transition ${
                        selectedOrder.status === "confirmed"
                          ? "bg-blue-600 border-blue-700 text-white shadow"
                          : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> কনফার্ম করুন
                    </button>
                    <button
                      id="btn-status-delivered"
                      onClick={() => updateStatus(selectedOrder.id, "delivered")}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer border transition ${
                        selectedOrder.status === "delivered"
                          ? "bg-emerald-600 border-emerald-700 text-white shadow"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" /> ডেলিভার্ড করুন
                    </button>
                    <button
                      id="btn-status-cancelled"
                      onClick={() => updateStatus(selectedOrder.id, "cancelled")}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer border transition ${
                        selectedOrder.status === "cancelled"
                          ? "bg-rose-600 border-rose-700 text-white shadow"
                          : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" /> ক্যানসেল করুন
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Bar Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <button
                  id="btn-delete-order"
                  onClick={() => deleteOrder(selectedOrder.id)}
                  className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 text-rose-600 border border-rose-200 py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> এই অর্ডার মুছুন
                </button>
                <button
                  id="btn-save-close"
                  onClick={() => setSelectedOrder(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-white py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
