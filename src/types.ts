export interface Order {
  id: string;
  name: string;
  address: string;
  mobile: string;
  note: string;
  price: number;
  deliveryCharge: number;
  totalPrice: number;
  date: string; // "DD-MM-YYYY HH:mm"
  timestamp: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  district: string;
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
