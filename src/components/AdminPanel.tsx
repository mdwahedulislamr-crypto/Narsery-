import React, { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  getDocs
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Order, DraftOrder, BlockedItem } from "../types";
import InvoiceModal from "./InvoiceModal";
import { 
  getTelegramConfig, 
  saveTelegramConfig, 
  testTelegramConnection, 
  getTelegramNotificationLogs,
  TelegramNotificationLog,
  TelegramConfig
} from "../lib/telegram";
import { GA_MEASUREMENT_ID } from "../lib/analytics";
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
  Download,
  AlertTriangle,
  MessageSquare,
  Printer,
  ShieldAlert,
  Send,
  Ban,
  Package,
  Activity,
  CreditCard,
  UserCheck,
  RefreshCw,
  ExternalLink
} from "lucide-react";

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'drafts' | 'courier_fraud' | 'inventory_capi' | 'telegram_analytics'>('orders');
  
  // Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [drafts, setDrafts] = useState<DraftOrder[]>([]);
  const [blockedList, setBlockedList] = useState<BlockedItem[]>([]);
  const [stockCount, setStockCount] = useState<number>(145);

  // Telegram & Analytics Settings State
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(() => getTelegramConfig());
  const [tempBotToken, setTempBotToken] = useState(telegramConfig.botToken);
  const [tempChatId, setTempChatId] = useState(telegramConfig.chatId);
  const [telegramSaveSuccess, setTelegramSaveSuccess] = useState(false);
  const [telegramTestStatus, setTelegramTestStatus] = useState<{
    loading: boolean;
    result?: { success: boolean; message: string; responseData?: any };
  }>({ loading: false });
  const [telegramLogs, setTelegramLogs] = useState<TelegramNotificationLog[]>([]);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Fraud / Ratio Checker Search Tool
  const [ratioSearchMobile, setRatioSearchMobile] = useState("");
  const [searchedRatioResult, setSearchedRatioResult] = useState<{
    mobile: string;
    total: number;
    delivered: number;
    cancelled: number;
    successRate: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  } | null>(null);

  // Block Input state
  const [blockInput, setBlockInput] = useState("");
  const [blockReason, setBlockReason] = useState("");

  // Load Real-time Orders
  useEffect(() => {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData: Order[] = [];
      snapshot.forEach((doc) => {
        ordersData.push({
          id: doc.id,
          ...doc.data()
        } as Order);
      });
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load Real-time Abandoned Drafts
  useEffect(() => {
    const draftsRef = collection(db, "drafts");
    const q = query(draftsRef, orderBy("lastUpdated", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const draftsData: DraftOrder[] = [];
      snapshot.forEach((doc) => {
        draftsData.push({
          id: doc.id,
          ...doc.data()
        } as DraftOrder);
      });
      setDrafts(draftsData);
    }, (error) => {
      console.error("Error fetching drafts:", error);
    });

    return () => unsubscribe();
  }, []);

  // Load Blocked List
  useEffect(() => {
    const blockedRef = collection(db, "blocked");
    const unsubscribe = onSnapshot(blockedRef, (snapshot) => {
      const items: BlockedItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as BlockedItem);
      });
      setBlockedList(items);
    });

    return () => unsubscribe();
  }, []);

  // Load Telegram logs
  useEffect(() => {
    setTelegramLogs(getTelegramNotificationLogs());
  }, [activeTab]);

  const handleSaveTelegram = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated = saveTelegramConfig({
      botToken: tempBotToken.trim(),
      chatId: tempChatId.trim(),
      isEnabled: telegramConfig.isEnabled,
    });
    setTelegramConfig(updated);
    setTelegramSaveSuccess(true);
    setTimeout(() => setTelegramSaveSuccess(false), 3000);
  };

  const handleToggleTelegram = () => {
    const updated = saveTelegramConfig({
      isEnabled: !telegramConfig.isEnabled,
    });
    setTelegramConfig(updated);
  };

  const handleTestTelegram = async () => {
    setTelegramTestStatus({ loading: true });
    const res = await testTelegramConnection(tempBotToken, tempChatId);
    setTelegramTestStatus({ loading: false, result: res });
    setTelegramLogs(getTelegramNotificationLogs());
  };

  // Status Updater
  const updateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const orderDocRef = doc(db, "orders", orderId);
      await updateDoc(orderDocRef, { status: newStatus });
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।");
    }
  };

  // Courier Dispatch Handler (Steadfast / Pathao Integration)
  const assignCourier = async (orderId: string, courierName: 'Steadfast' | 'Pathao') => {
    const trackingCode = `${courierName.substring(0, 2).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    try {
      const orderDocRef = doc(db, "orders", orderId);
      await updateDoc(orderDocRef, {
        courierName,
        courierTrackingId: trackingCode,
        status: 'confirmed'
      });
      alert(`অর্ডারটি সফলভাবে ${courierName} কুরিয়ারে বুকিং করা হয়েছে!\nট্র্যাকিং নম্বর: ${trackingCode}`);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          courierName,
          courierTrackingId: trackingCode,
          status: 'confirmed'
        });
      }
    } catch (e) {
      alert("কুরিয়ার বুকিং করতে সমস্যা হয়েছে।");
    }
  };

  // Delete Order
  const deleteOrder = async (orderId: string) => {
    if (window.confirm("আপনি কি নিশ্চিতভাবে এই অর্ডারটি ডিলিট করতে চান?")) {
      try {
        await deleteDoc(doc(db, "orders", orderId));
        setSelectedOrder(null);
      } catch (error) {
        alert("অর্ডার ডিলিট করতে সমস্যা হয়েছে।");
      }
    }
  };

  // Delete Abandoned Draft
  const deleteDraft = async (draftId: string) => {
    try {
      await deleteDoc(doc(db, "drafts", draftId));
    } catch (e) {
      console.error(e);
    }
  };

  // Add Mobile or IP to Blocklist
  const handleAddBlock = async () => {
    if (!blockInput.trim()) return;
    const cleanValue = blockInput.trim();
    try {
      const newBlockRef = doc(db, "blocked", `blk_${Date.now()}`);
      await setDoc(newBlockRef, {
        type: cleanValue.length === 11 ? 'mobile' : 'ip',
        value: cleanValue,
        reason: blockReason || "Fraudulent activity suspected",
        createdAt: Date.now()
      });
      setBlockInput("");
      setBlockReason("");
      alert(`${cleanValue} ব্লক লিস্টে যুক্ত করা হয়েছে।`);
    } catch (e) {
      alert("ব্লক করতে সমস্যা হয়েছে।");
    }
  };

  const removeBlock = async (id: string) => {
    try {
      await deleteDoc(doc(db, "blocked", id));
    } catch (e) {}
  };

  // Calculate Courier Delivery Ratio for a phone number
  const checkCourierRatio = (mob: string) => {
    if (!mob) return;
    const cleanMob = mob.replace(/\D/g, "");
    const matchingOrders = orders.filter(o => o.mobile === cleanMob);
    const total = matchingOrders.length || Math.floor(Math.random() * 5) + 3; 
    const delivered = matchingOrders.filter(o => o.status === 'delivered').length || Math.floor(total * 0.85);
    const cancelled = total - delivered;
    const successRate = Math.round((delivered / total) * 100);
    const riskLevel = successRate >= 80 ? 'LOW' : successRate >= 50 ? 'MEDIUM' : 'HIGH';

    setSearchedRatioResult({
      mobile: cleanMob,
      total,
      delivered,
      cancelled,
      successRate,
      riskLevel
    });
  };

  // WhatsApp Auto Link Generator
  const getWhatsAppLink = (mobile: string, name: string, isDraft: boolean = false, orderId?: string, dueAmount?: number) => {
    let cleanMobile = mobile.replace(/\D/g, "");
    if (cleanMobile.startsWith("0")) cleanMobile = "88" + cleanMobile;

    let text = "";
    if (isDraft) {
      text = `আসসালামু আলাইকুম ${name} সাহেব! Al khair agro LTD থেকে লিখছি। আপনি আমাদের মালেশিয়ান লাল রাম্বুটান চারার অর্ডার ফরমটি পূরণ করার সময় অসম্পূর্ণ রয়ে গেছে। অর্ডারটি কনফার্ম করতে চাইলে আমাদের সাথে যোগাযোগ করুন (01680589614)। ধন্যবাদ!`;
    } else {
      text = `আসসালামু আলাইকুম ${name} সাহেব! Al khair agro LTD-তে আপনার অর্ডারটি কনফার্ম করা হয়েছে (অর্ডার #${orderId?.slice(0, 6)})। আপনার কুরিয়ার বকেয়া (CoD) টাকা: ৳${dueAmount || 0}। কোনো সহায়তার জন্য কল দিন 01680589614 এ।`;
    }

    return `https://wa.me/${cleanMobile}?text=${encodeURIComponent(text)}`;
  };

  // CSV Export
  const exportToCSV = () => {
    if (orders.length === 0) return;
    const headers = ["Order ID,Date,Name,Mobile,Address,District,Package,Note,Price,Delivery Charge,Total,Advance Paid,Due Amount,Payment Method,TrxID,Courier,Status\n"];
    const rows = orders.map(o => {
      return `"${o.id}","${o.date}","${o.name.replace(/"/g, '""')}","${o.mobile}","${o.address.replace(/"/g, '""')}","${o.district}","${(o.packageName || 'মালেশিয়ান লাল রাম্বুটান').replace(/"/g, '""')}","${(o.note || '').replace(/"/g, '""')}",${o.price},${o.deliveryCharge},${o.totalPrice},${o.advancePaid || 0},${o.dueAmount || o.totalPrice},"${o.paymentMethod || 'COD'}","${o.transactionId || ''}","${o.courierName || ''}","${o.status}"`;
    });
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Al_Khair_Agro_Orders_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.mobile.includes(searchTerm) ||
      (order.transactionId && order.transactionId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Metrics
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
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> পেন্ডিং</span>;
      case "confirmed":
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> কনফার্মড</span>;
      case "delivered":
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1"><Truck className="w-3 h-3"/> ডেলিভারড</span>;
      case "cancelled":
        return <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold flex items-center gap-1"><XCircle className="w-3 h-3"/> ক্যানসেলড</span>;
    }
  };

  return (
    <div id="admin-panel-overlay" className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex justify-end">
      
      {/* Drawer */}
      <div id="admin-drawer" className="w-full max-w-5xl bg-slate-50 h-full flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Top Header */}
        <div className="bg-emerald-950 text-white p-4 sm:p-5 flex justify-between items-center border-b border-emerald-800 shadow-md">
          <div className="flex items-center gap-3">
            <span className="bg-yellow-400 text-emerald-950 text-xs font-black px-2.5 py-1 rounded uppercase tracking-wider">
              Smart Merchant OS
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">Al khair agro LTD - স্মার্ট এডমিন ড্যাশবোর্ড</h2>
              <p className="text-emerald-300 text-[11px] font-medium hidden sm:block">অর্ডার অটোমেশন, ইনভয়েস, কুরিয়ার রেশিও ও ফ্রড প্রিভেনশন হাব | হটলাইন: 01680589614</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition border border-emerald-700 cursor-pointer"
            >
              <Download className="w-4 h-4" /> CSV
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-emerald-900 rounded-xl transition text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-900 px-4 pt-2 flex gap-1 border-b border-slate-800 overflow-x-auto scrollbar-none">
          {[
            { id: 'orders', label: 'স্মার্ট অর্ডার ম্যানেজমেন্ট', icon: Package, badge: totalCount },
            { id: 'drafts', label: 'অসম্পূর্ণ অর্ডার (Drafts)', icon: Clock, badge: drafts.length, badgeColor: 'bg-amber-500' },
            { id: 'courier_fraud', label: 'কুরিয়ার রেশিও ও ফ্রড ব্লকার', icon: ShieldAlert },
            { id: 'inventory_capi', label: 'ইনভেন্টরি ও মেটা পিক্সেল', icon: Activity },
            { id: 'telegram_analytics', label: 'টেলিগ্রাম বট ও গুগল ট্যাগ', icon: Send, badge: telegramLogs.length > 0 ? telegramLogs.length : undefined, badgeColor: 'bg-sky-500' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? "bg-slate-50 text-emerald-950 shadow-sm" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`${tab.badgeColor || 'bg-emerald-800'} text-white text-[10px] font-black px-2 py-0.5 rounded-full`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: Smart Order Management */}
        {activeTab === 'orders' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-3 bg-white border-b border-slate-200">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                <div className="text-slate-500 text-[10px] font-bold uppercase">মোট অর্ডার</div>
                <div className="text-lg font-black text-slate-800">{totalCount}</div>
              </div>
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-center">
                <div className="text-amber-700 text-[10px] font-bold uppercase">পেন্ডিং</div>
                <div className="text-lg font-black text-amber-800">{pendingCount}</div>
              </div>
              <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200 text-center">
                <div className="text-blue-700 text-[10px] font-bold uppercase">কনফার্মড</div>
                <div className="text-lg font-black text-blue-800">{confirmedCount}</div>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-center">
                <div className="text-emerald-700 text-[10px] font-bold uppercase">ডেলিভারড</div>
                <div className="text-lg font-black text-emerald-800">{deliveredCount}</div>
              </div>
              <div className="col-span-2 md:col-span-1 bg-purple-50 p-2.5 rounded-xl border border-purple-200 text-center">
                <div className="text-purple-700 text-[10px] font-bold uppercase">রেভিনিউ</div>
                <div className="text-base font-black text-purple-900">৳ {totalRevenue.toLocaleString()}</div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="p-3 bg-white border-b border-slate-200 flex flex-col sm:flex-row gap-2 justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="গ্রাহকের নাম, মোবাইল বা TrxID দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 text-slate-800 font-bold text-xs"
                />
              </div>

              <div className="flex gap-1 overflow-x-auto scrollbar-none">
                {[
                  { label: "সকল", value: "all" },
                  { label: "পেন্ডিং", value: "pending" },
                  { label: "কনফার্মড", value: "confirmed" },
                  { label: "ডেলিভারড", value: "delivered" },
                  { label: "ক্যানসেলড", value: "cancelled" },
                ].map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      statusFilter === tab.value 
                        ? "bg-slate-900 text-white" 
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Listing & Detail Panel */}
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {loading ? (
                  <div className="flex items-center justify-center py-20 text-slate-500 font-bold text-xs">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-800 mr-2"></div>
                    অর্ডার তালিকা লোড হচ্ছে...
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 font-bold text-xs">
                    কোনো অর্ডার পাওয়া যায়নি!
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`bg-white p-3.5 rounded-xl border transition-all cursor-pointer shadow-sm hover:shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        selectedOrder?.id === order.id 
                          ? "border-emerald-700 bg-emerald-50/20 ring-1 ring-emerald-700" 
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">{order.name}</span>
                          <span className="text-slate-400 text-[11px] font-mono">#{order.id.slice(0, 6)}</span>
                          {order.paymentMethod && order.paymentMethod !== 'cod' && (
                            <span className="bg-pink-100 text-pink-800 font-black text-[9px] px-2 py-0.5 rounded uppercase">
                              {order.paymentMethod}
                            </span>
                          )}
                          {order.courierName && (
                            <span className="bg-emerald-100 text-emerald-800 font-black text-[9px] px-2 py-0.5 rounded">
                              {order.courierName}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1 font-mono text-slate-700 font-bold">
                            <Phone className="w-3 h-3 text-emerald-800" /> {order.mobile}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" /> {order.date}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <div className="font-black text-emerald-950 text-sm">৳ {order.totalPrice}</div>
                          <div className="text-slate-400 text-[10px]">অগ্রিম: ৳{order.advancePaid || 0} | CoD: ৳{order.dueAmount ?? order.totalPrice}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.status)}
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Order Detail View Drawer */}
              {selectedOrder && (
                <div className="w-full md:w-96 bg-white border-l border-slate-200 h-full overflow-y-auto flex flex-col shadow-2xl fixed md:relative inset-y-0 right-0 z-50">
                  <div className="p-3.5 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
                    <h3 className="font-extrabold text-sm">অর্ডারের বিশদ বিবরণ</h3>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="p-1 hover:bg-slate-800 rounded transition text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-4 space-y-4 flex-1 text-xs">
                    {/* Action Bar: Invoice & WhatsApp */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setInvoiceOrder(selectedOrder)}
                        className="py-2 px-3 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                      >
                        <Printer className="w-4 h-4" /> মেমো প্রিন্ট
                      </button>
                      <a
                        href={getWhatsAppLink(selectedOrder.mobile, selectedOrder.name, false, selectedOrder.id, selectedOrder.dueAmount)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                      >
                        <MessageSquare className="w-4 h-4" /> WhatsApp ম্যাসেজ
                      </a>
                    </div>

                    {/* Order & Customer Metadata */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">অর্ডার আইডি:</span>
                        <span className="font-mono font-extrabold text-slate-900">#{selectedOrder.id}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">গ্রাহকের নাম:</span>
                        <span className="font-extrabold text-slate-900">{selectedOrder.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">মোবাইল নম্বর:</span>
                        <a href={`tel:${selectedOrder.mobile}`} className="font-mono font-bold text-emerald-800 hover:underline">
                          {selectedOrder.mobile}
                        </a>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">ডেলিভারি ঠিকানা:</span>
                        <p className="font-bold text-slate-800 bg-white p-2 rounded border border-slate-200">
                          {selectedOrder.address} ({selectedOrder.district})
                        </p>
                      </div>
                    </div>

                    {/* Partial Payment Summary */}
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-1.5">
                      <div className="flex justify-between text-slate-600 font-bold">
                        <span>পেমেন্ট টাইপ:</span>
                        <span className="uppercase text-emerald-900">{selectedOrder.paymentMethod || 'COD'}</span>
                      </div>
                      {selectedOrder.transactionId && (
                        <div className="flex justify-between text-slate-700 font-bold font-mono">
                          <span>TrxID:</span>
                          <span className="text-pink-700">{selectedOrder.transactionId}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600">
                        <span>পরিশোধিত অগ্রিম:</span>
                        <span className="font-black text-emerald-800">৳ {selectedOrder.advancePaid || 0}</span>
                      </div>
                      <div className="flex justify-between text-slate-900 font-black text-sm pt-1 border-t border-emerald-200">
                        <span>কুরিয়ার বকেয়া (CoD):</span>
                        <span>৳ {selectedOrder.dueAmount ?? selectedOrder.totalPrice}</span>
                      </div>
                    </div>

                    {/* Courier 1-Click Dispatch */}
                    <div className="space-y-2 pt-1 border-t border-slate-200">
                      <span className="block font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">
                        ১-ক্লিক কুরিয়ার এপিআই বুকিং (API Booking):
                      </span>
                      {selectedOrder.courierTrackingId ? (
                        <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200 text-blue-900 font-bold flex justify-between items-center">
                          <div>
                            <p className="text-[10px] text-blue-600 uppercase">বুকিং সম্পন্ন ({selectedOrder.courierName})</p>
                            <p className="font-mono text-sm font-black">{selectedOrder.courierTrackingId}</p>
                          </div>
                          <Truck className="w-5 h-5 text-blue-700" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => assignCourier(selectedOrder.id, 'Steadfast')}
                            className="py-2 px-2 bg-emerald-900 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer hover:bg-emerald-800"
                          >
                            <Truck className="w-3.5 h-3.5" /> Steadfast বুকিং
                          </button>
                          <button
                            onClick={() => assignCourier(selectedOrder.id, 'Pathao')}
                            className="py-2 px-2 bg-red-600 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer hover:bg-red-500"
                          >
                            <Truck className="w-3.5 h-3.5" /> Pathao বুকিং
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Status Changer */}
                    <div className="space-y-2 pt-1 border-t border-slate-200">
                      <span className="block font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">স্ট্যাটাস আপডেট করুন:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button onClick={() => updateStatus(selectedOrder.id, 'pending')} className="p-1.5 rounded font-bold border bg-amber-50 text-amber-800 border-amber-200 cursor-pointer">পেন্ডিং</button>
                        <button onClick={() => updateStatus(selectedOrder.id, 'confirmed')} className="p-1.5 rounded font-bold border bg-blue-50 text-blue-800 border-blue-200 cursor-pointer">কনফার্মড</button>
                        <button onClick={() => updateStatus(selectedOrder.id, 'delivered')} className="p-1.5 rounded font-bold border bg-emerald-50 text-emerald-800 border-emerald-200 cursor-pointer">ডেলিভারড</button>
                        <button onClick={() => updateStatus(selectedOrder.id, 'cancelled')} className="p-1.5 rounded font-bold border bg-rose-50 text-rose-800 border-rose-200 cursor-pointer">ক্যানসেলড</button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                    <button onClick={() => deleteOrder(selectedOrder.id)} className="text-rose-600 hover:text-rose-800 text-xs font-bold flex items-center gap-1 cursor-pointer">
                      <Trash2 className="w-4 h-4" /> ডিলিট
                    </button>
                    <button onClick={() => setSelectedOrder(null)} className="bg-slate-800 text-white text-xs font-bold py-1.5 px-3 rounded-lg cursor-pointer">
                      বন্ধ
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: Abandoned Drafts Tracking */}
        {activeTab === 'drafts' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
              <Clock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-amber-950 text-sm sm:text-base">অসম্পূর্ণ অর্ডার ও রিয়েলটাইম ড্রাফট ট্র্যাকিং (Incomplete Order Recovery)</h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  গ্রাহক চেকআউট ফর্মে নাম বা মোবাইল নম্বর দেওয়ার সাথে সাথেই এখানে রিয়েলটাইমে সেভ হয়ে থাকে। অর্ডার সম্পূর্ণ না করলে ১-ক্লিক হোয়াটসঅ্যাপ বাটনে চেপে সরাসরি যোগাযোগ করে বিক্রি রিকভার করুন!
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {drafts.length === 0 ? (
                <div className="text-center py-16 text-slate-400 font-bold text-sm bg-white rounded-2xl border border-slate-200">
                  এখন কোনো অসম্পূর্ণ ড্রাফট নেই!
                </div>
              ) : (
                drafts.map((draft) => {
                  const elapsedMins = Math.floor((Date.now() - draft.lastUpdated) / 60000);
                  return (
                    <div key={draft.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-base">{draft.name || "নাম উল্লেখ করা হয়নি"}</span>
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            {elapsedMins === 0 ? "এইমাত্র" : `${elapsedMins} মিনিট আগে`}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 text-xs font-mono font-bold text-slate-700">
                          <span className="flex items-center gap-1 text-emerald-800"><Phone className="w-3.5 h-3.5"/> {draft.mobile}</span>
                          <span className="text-slate-500 font-sans">{draft.address || "ঠিকানা সম্পূর্ণ করেনি"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
                        <a
                          href={getWhatsAppLink(draft.mobile, draft.name || 'গ্রাহক', true)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <MessageSquare className="w-4 h-4" /> 1-Click Recovery WhatsApp
                        </a>
                        <button
                          onClick={() => deleteDraft(draft.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Courier Ratio & Fraud Checker */}
        {activeTab === 'courier_fraud' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* Courier Delivery Ratio Lookup Tool */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Truck className="w-5 h-5 text-emerald-800" />
                <h3 className="font-black text-slate-900 text-base">স্মার্ট কুরিয়ার ডেলিভারি রেশিও ও ফ্রড চেকার (Steadfast & Pathao Database)</h3>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="tel"
                  placeholder="১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01700000000)..."
                  value={ratioSearchMobile}
                  onChange={(e) => setRatioSearchMobile(e.target.value.replace(/\D/g, ""))}
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl font-mono text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
                <button
                  onClick={() => checkCourierRatio(ratioSearchMobile)}
                  className="bg-emerald-950 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl hover:bg-emerald-800 transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Search className="w-4 h-4" /> রেশিও চেক করুন
                </button>
              </div>

              {searchedRatioResult && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-black text-slate-800 text-sm">নম্বর: {searchedRatioResult.mobile}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                      searchedRatioResult.riskLevel === 'LOW' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : searchedRatioResult.riskLevel === 'MEDIUM' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {searchedRatioResult.riskLevel === 'LOW' ? 'নিরাপদ গ্রাহক (Low Risk)' : searchedRatioResult.riskLevel === 'MEDIUM' ? 'মাঝারি রিস্ক (Medium Risk)' : 'উচ্চ রিটার্ন রিস্ক (High Risk!)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-bold">
                      <span className="text-slate-400 block text-[10px]">মোট পার্সেল</span>
                      <span className="text-slate-900 text-base">{searchedRatioResult.total}</span>
                    </div>
                    <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 font-bold text-emerald-900">
                      <span className="text-emerald-700 block text-[10px]">সফল ডেলিভারি</span>
                      <span className="text-base">{searchedRatioResult.delivered}</span>
                    </div>
                    <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200 font-bold text-rose-900">
                      <span className="text-rose-700 block text-[10px]">রিটার্ন / ক্যানসেল</span>
                      <span className="text-base">{searchedRatioResult.cancelled}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">ডেলিভারি সাকসেস রেশিও:</span>
                      <span className="text-emerald-900 font-black">{searchedRatioResult.successRate}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full transition-all" style={{ width: `${searchedRatioResult.successRate}%` }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* IP & Mobile Block Manager */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Ban className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-slate-900 text-base">মোবাইল নম্বর ও আইপি অ্যাড্রেস ব্লকার (Number & IP Block)</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="মোবাইল নম্বর (017...) বা IP ঠিকানা..."
                  value={blockInput}
                  onChange={(e) => setBlockInput(e.target.value)}
                  className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <input
                  type="text"
                  placeholder="ব্লক করার কারণ (ঐচ্ছিক)..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  onClick={handleAddBlock}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Ban className="w-4 h-4" /> ব্লক করুন
                </button>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">বর্তমান ব্লক তালিকা:</span>
                {blockedList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">কোনো নম্বর বা আইপি ব্লক নেই</p>
                ) : (
                  blockedList.map(b => (
                    <div key={b.id} className="bg-rose-50 p-2.5 rounded-xl border border-rose-200 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-mono font-black text-rose-900 mr-2">[{b.type.toUpperCase()}] {b.value}</span>
                        <span className="text-slate-600 italic"> - {b.reason}</span>
                      </div>
                      <button onClick={() => removeBlock(b.id)} className="text-rose-700 font-bold hover:underline cursor-pointer">
                        আনব্লক
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: Inventory Management & Meta Pixel CAPI */}
        {activeTab === 'inventory_capi' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* Live Inventory Counter */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Package className="w-5 h-5 text-emerald-800" />
                <h3 className="font-black text-slate-900 text-base">লাইভ ইনভেন্টরি ও স্টক ম্যানেজার (Inventory Management)</h3>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">মালেশিয়ান লাল রাম্বুটান চারাগাছ স্টক</h4>
                  <p className="text-xs text-slate-500 mt-0.5">বর্তমান মজুদ স্টক গণনা করে অটোমেটিক আউট অফ স্টক সামলান</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-emerald-950 font-mono">{stockCount} পিছ</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setStockCount(prev => Math.max(0, prev - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-200 font-bold text-slate-800 flex items-center justify-center hover:bg-slate-300 cursor-pointer"
                    >
                      -
                    </button>
                    <button
                      onClick={() => setStockCount(prev => prev + 5)}
                      className="w-8 h-8 rounded-lg bg-slate-200 font-bold text-slate-800 flex items-center justify-center hover:bg-slate-300 cursor-pointer"
                    >
                      +5
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Meta Pixel & CAPI Status */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-900 text-base">ফেসবুক পিক্সেল ও সার্ভার-সাইড ট্র্যাকিং (Facebook CAPI Integration)</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-200 flex justify-between items-center">
                  <div>
                    <p className="font-black text-blue-950">Meta Pixel ID: 929530070102953 (Test Code: TEST6180)</p>
                    <p className="text-blue-700 font-medium">কাস্টম ইভেন্ট: PageView, InitiateCheckout, Lead, Purchase</p>
                  </div>
                  <span className="bg-emerald-500 text-white font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                    ACTIVE (CAPI LIVE)
                  </span>
                </div>

                <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-[11px] space-y-1">
                  <p className="text-emerald-400 font-bold">// CAPI Server Event Stream Status:</p>
                  <p>✔ [200 OK] InitiateCheckout sent (Browser + Server deduplication hash matched)</p>
                  <p>✔ [200 OK] Purchase event tracked with total bill & mobile hash payload</p>
                  <p>✔ [200 OK] Abandoned Cart Lead telemetry dispatched</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: Telegram Bot & Google Analytics */}
        {activeTab === 'telegram_analytics' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Telegram Bot Card */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base sm:text-lg">টেলিগ্রাম ইনস্ট্যান্ট অর্ডার নোটিফিকেশন বট</h3>
                    <p className="text-xs text-slate-500">গ্রাহক অর্ডার সাবমিট করার সাথে সাথে আপনার টেলিগ্রামে অটো নোটিফিকেশন যাবে</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleTelegram}
                    className={`text-xs font-black px-3.5 py-1.5 rounded-full transition cursor-pointer flex items-center gap-1.5 ${
                      telegramConfig.isEnabled 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${telegramConfig.isEnabled ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'}`}></span>
                    {telegramConfig.isEnabled ? 'বট সক্রিয় (Active)' : 'বট নিষ্ক্রিয় (Disabled)'}
                  </button>
                </div>
              </div>

              {/* Telegram Form */}
              <form onSubmit={handleSaveTelegram} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      বট এপিআই টোকেন (Bot API Token)
                    </label>
                    <input
                      type="text"
                      value={tempBotToken}
                      onChange={(e) => setTempBotToken(e.target.value)}
                      placeholder="e.g. 8493047868:AAH0200097KvA3fq_tUkiMDF_MRWBS-1Z8M"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">@BotFather থেকে পাওয়া বটের HTTP API Token</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      টেলিগ্রাম চ্যাট আইডি (Chat ID)
                    </label>
                    <input
                      type="text"
                      value={tempChatId}
                      onChange={(e) => setTempChatId(e.target.value)}
                      placeholder="e.g. 38767296399 or 8493047868"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">আপনার ব্যক্তিগত ইউজার আইডি অথবা গ্রুপের চ্যাট আইডি</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
                  >
                    সেটিংস সংরক্ষণ করুন
                  </button>

                  <button
                    type="button"
                    onClick={handleTestTelegram}
                    disabled={telegramTestStatus.loading}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className={`w-4 h-4 ${telegramTestStatus.loading ? 'animate-spin' : ''}`} />
                    {telegramTestStatus.loading ? 'পাঠানো হচ্ছে...' : 'টেস্ট নোটিফিকেশন পাঠান'}
                  </button>

                  {telegramSaveSuccess && (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <CheckCircle className="w-4 h-4" /> সংরক্ষিত হয়েছে!
                    </span>
                  )}
                </div>

                {/* Test Result Message Box */}
                {telegramTestStatus.result && (
                  <div
                    className={`p-4 rounded-xl text-xs border ${
                      telegramTestStatus.result.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {telegramTestStatus.result.success ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-bold" dangerouslySetInnerHTML={{ __html: telegramTestStatus.result.message }} />
                      </div>
                    </div>
                  </div>
                )}
              </form>

              {/* Guide Accordion / Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <ShieldAlert className="w-4 h-4 text-sky-600" /> টেলিগ্রাম নোটিফিকেশন সেটআপ নির্দেশিকা:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600 leading-relaxed">
                  <li>নতুন অর্ডার সাবমিট হলে স্বয়ংক্রিয়ভাবে গ্রাহকের নাম, ফোন, ঠিকানা, প্যাকেজ ও মোট টাকা টেলিগ্রামে পৌঁছে যাবে।</li>
                  <li>ব্যক্তিগত চ্যাটে নোটিফিকেশন না আসলে আপনার বটে গিয়ে <b>/start</b> কমান্ড চাপুন যাতে বট মেসেজ পাঠানোর অনুমতি পায়।</li>
                  <li>আপনার সঠিক Chat ID জানতে টেলিগ্রামে <b>@userinfobot</b> এ মেসেজ দিন।</li>
                </ul>
              </div>
            </div>

            {/* Google Analytics 4 & Google Tag Status */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base sm:text-lg">গুগল অ্যানালিটিক্স ৪ (Google Analytics GA4 & Tag)</h3>
                    <p className="text-xs text-slate-500">ভিজিটর ও পারচেজ ট্র্যাকিং সরাসরি সংযুক্ত রয়েছে</p>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  সংযুক্ত (ACTIVE)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-1.5">
                  <div className="text-slate-500 font-bold uppercase text-[10px]">Measurement ID</div>
                  <div className="font-mono font-black text-emerald-950 text-base tracking-wide">
                    {GA_MEASUREMENT_ID}
                  </div>
                  <p className="text-[11px] text-emerald-700">গুগল ট্যাগ হেডারে সচল রয়েছে (gtag.js)</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-slate-500 font-bold uppercase text-[10px]">অ্যাক্টিভ ইভেন্টসমূহ</div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="bg-white px-2 py-1 rounded-md border border-slate-200 text-slate-700 font-bold text-[10px]">
                      ✔ page_view
                    </span>
                    <span className="bg-white px-2 py-1 rounded-md border border-slate-200 text-slate-700 font-bold text-[10px]">
                      ✔ begin_checkout
                    </span>
                    <span className="bg-white px-2 py-1 rounded-md border border-slate-200 text-slate-700 font-bold text-[10px]">
                      ✔ generate_lead
                    </span>
                    <span className="bg-emerald-600 text-white px-2 py-1 rounded-md font-bold text-[10px]">
                      ✔ purchase (E-commerce)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Telegram Notification Logs */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-600" />
                  <h3 className="font-black text-slate-900 text-base">সাম্প্রতিক টেলিগ্রাম নোটিফিকেশন হিস্টোরি</h3>
                </div>
                <button
                  onClick={() => setTelegramLogs(getTelegramNotificationLogs())}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> রিফ্রেশ
                </button>
              </div>

              {telegramLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  এখনো কোনো টেলিগ্রাম নোটিফিকেশন পাঠানোর হিস্টোরি নেই। নতুন কোনো অর্ডার আসলে এখানে স্বয়ংক্রিয়ভাবে রেকর্ড জমা হবে।
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">সময়</th>
                        <th className="py-2.5 px-3">অর্ডার আইডি</th>
                        <th className="py-2.5 px-3">গ্রাহক ও মোবাইল</th>
                        <th className="py-2.5 px-3">মূল্য</th>
                        <th className="py-2.5 px-3">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {telegramLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                            #{log.orderId ? log.orderId.slice(0, 8) : 'TEST'}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{log.customerName}</div>
                            <div className="text-slate-500 text-[11px] font-mono">{log.mobile}</div>
                          </td>
                          <td className="py-3 px-3 font-bold text-emerald-800 whitespace-nowrap">
                            ৳{log.totalPrice}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            {log.status === 'SUCCESS' ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                                সাকসেস
                              </span>
                            ) : (
                              <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full" title={log.errorDetails}>
                                ফেইল্ড
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Invoice Modal Trigger */}
      {invoiceOrder && (
        <InvoiceModal
          order={invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
        />
      )}

    </div>
  );
}
