export type UserRole = 'student' | 'vendor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  phone?: string;
  avatar?: string;
}

export type StockStatus = 'Available' | 'Low Stock' | 'Sold Out';

export interface FoodItem {
  id: string;
  outletId: string;
  outletName: string;
  name: string;
  category: 'Rice' | 'Chicken' | 'Snacks' | 'Coffee' | 'Juice' | 'Other';
  price: number; // in BDT ৳
  description: string;
  image: string;
  stock: number;
  status: StockStatus;
  prepTimeMinutes: number;
  rating: number;
  popular?: boolean;
}

export interface CampusOutlet {
  id: string;
  name: string;
  location: string; // e.g. "Level 1 Cafeteria", "Level 4 Food Court"
  image: string;
  description: string;
  openingHours: string;
  rating: number;
  totalItems: number;
  tablesCount: number;
}

export interface CartItem {
  item: FoodItem;
  quantity: number;
}

export type OrderStatus = 'Placed' | 'Preparing' | 'Ready' | 'Completed';
export type PickupType = 'ASAP' | 'Schedule Pickup';
export type PaymentMethod = 'Cash' | 'bKash' | 'Nagad' | 'Rocket';

export interface Order {
  id: string;
  studentId: string;
  studentName: string;
  outletId: string;
  outletName: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  pickupType: PickupType;
  pickupDate?: string;
  pickupTime?: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export type TableStatus = 'Available' | 'Reserved' | 'Occupied';

export interface CampusTable {
  id: string;
  outletId: string;
  outletName: string;
  tableNumber: string; // e.g. "Table 01"
  capacity: number;
  status: TableStatus;
}

export interface TableBooking {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  outletId: string;
  outletName: string;
  tableNumber: string;
  date: string;
  time: string;
  durationMinutes: number; // 30, 60, 90, 120
  guests: number;
  status: 'Confirmed' | 'Active' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export type ReportCategory =
  | 'Food quality'
  | 'Missing item'
  | 'Long waiting time'
  | 'Payment issue'
  | 'Other';

export type ReportStatus = 'Open' | 'Reviewing' | 'Resolved';

export interface CustomerReport {
  id: string;
  studentId: string;
  studentName: string;
  outletId: string;
  outletName: string;
  category: ReportCategory;
  description: string;
  status: ReportStatus;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  recipientRole: UserRole | 'all';
  title: string;
  message: string;
  type: 'order' | 'inventory' | 'ai' | 'table' | 'report';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface AiDemandRecommendationItem {
  item: string;
  outlet: string;
  currentStock: number;
  expectedDemand: number;
  recommendedRefill: number;
  risk: 'HIGH SHORTAGE RISK' | 'MODERATE RISK' | 'OPTIMAL';
  reason: string;
}

export interface AiDemandAnalysis {
  summary: string;
  riskLevel: 'high' | 'moderate' | 'low';
  analyzedAt: string;
  engine: string;
  liveApiUsed: boolean;
  items: AiDemandRecommendationItem[];
  agentActionPlan: string[];
}
