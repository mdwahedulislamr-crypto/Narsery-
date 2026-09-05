export interface Order {
  id: string;
  name: string;
  address: string;
  mobile: string;
  note: string;
  price: number;
  deliveryCharge: number;
  totalPrice: number;
  district: string;
  date: string; // "DD-MM-YYYY HH:mm"
  timestamp: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  
  // Extended Merchant OS Fields
  packageName?: string;
  packageQty?: number;
  paymentMethod?: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'bank';
  paymentType?: 'full' | 'partial_delivery' | 'advance_500';
  transactionId?: string;
  advancePaid?: number;
  dueAmount?: number;
  courierName?: string;
  courierTrackingId?: string;
  courierRatio?: { successRate: number; totalOrders: number; returns: number };
  isFraudRisk?: boolean;
  ipAddress?: string;
}

export interface DraftOrder {
  id: string;
  name: string;
  mobile: string;
  address: string;
  note?: string;
  deliveryArea?: string;
  lastUpdated: number;
  dateStr: string;
  status: 'incomplete';
}

export interface BlockedItem {
  id: string;
  type: 'mobile' | 'ip';
  value: string;
  reason: string;
  createdAt: number;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  avatarColor: string;
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  iconName: string;
}
