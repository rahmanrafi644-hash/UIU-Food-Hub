import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  FoodItem,
  CampusOutlet,
  CartItem,
  Order,
  OrderStatus,
  PickupType,
  PaymentMethod,
  CampusTable,
  TableBooking,
  CustomerReport,
  AppNotification,
  ReportCategory,
  ReportStatus,
  ChatMessage,
  OutletOperationalStatus,
  UserRole,
} from '../types';
import {
  INITIAL_OUTLETS,
  INITIAL_FOOD_ITEMS,
  INITIAL_TABLES,
  calculateStockStatus,
} from '../data/initialData';
import {
  supabase,
  isSupabaseConfigured,
  loginWithSupabase,
  signOutSupabase,
  registerStudentWithSupabase,
  registerVendorWithSupabase,
  verifyOtpWithSupabase,
  resendSupabaseVerification,
} from '../services/supabase';

const STORAGE_KEY = 'UIU_FOOD_HUB_STATE_V6';
const USERS_STORAGE_KEY = 'UIU_FOOD_HUB_REGISTERED_USERS_V6';
const PENDING_STORAGE_KEY = 'UIU_FOOD_HUB_PENDING_VERIFY_V6';

export interface RegisteredUser {
  id: string;
  email: string;
  password?: string;
  role: UserRole;
  fullName: string;
  phone?: string;
  studentId?: string;
  vendorOutletId?: string;
  vendorOutletName?: string;
  isVerified: boolean;
}

export interface PendingVerification {
  email: string;
  role: 'student' | 'vendor';
  fullName: string;
  phone: string;
  studentId?: string;
  vendorOutletId?: string;
  vendorOutletName?: string;
  password?: string;
  otpCode: string;
  createdAt: number;
}

interface AppContextType {
  // Auth & Outlet Scoping
  user: User | null;
  login: (
    email: string,
    password?: string,
    role?: 'student' | 'vendor',
    outletId?: string
  ) => Promise<{ success: boolean; isUnconfirmed?: boolean; error?: string }>;
  registerUser: (params: {
    role: 'student' | 'vendor';
    fullName: string;
    email: string;
    phone: string;
    studentId?: string;
    vendorOutletId?: string;
    vendorOutletName?: string;
    password: string;
  }) => Promise<{
    success: boolean;
    needsVerification: boolean;
    otpCode?: string;
    emailStatus?: 'sent' | 'rate_limited' | 'not_sent';
    emailStatusMessage?: string;
    error?: string;
  }>;
  verifyAccountOtp: (
    email: string,
    enteredOtp: string
  ) => Promise<{ success: boolean; error?: string }>;
  resendAccountOtp: (
    email: string
  ) => Promise<{ success: boolean; otpCode?: string; emailStatus?: string; error?: string }>;
  logout: () => Promise<void>;
  activeVendorOutlet: CampusOutlet | null;
  switchVendorOutlet: (outletId: string) => void;
  loginAsVendorFree: (outletId?: string) => User;
  loginAsStudentDemo: (dept?: 'bba' | 'cse') => User;

  // Data
  outlets: CampusOutlet[];
  updateOutletOperationalStatus: (outletId: string, status: OutletOperationalStatus) => void;
  inventory: FoodItem[];
  tables: CampusTable[];
  cart: CartItem[];
  orders: Order[];
  tableBookings: TableBooking[];
  reports: CustomerReport[];
  notifications: AppNotification[];
  messages: ChatMessage[];

  // Cart operations
  addToCart: (item: FoodItem, quantity?: number) => { success: boolean; message?: string };
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTotal: number;

  // Ordering
  createOrder: (params: {
    outletId: string;
    pickupType: PickupType;
    pickupDate?: string;
    pickupTime?: string;
    pickupWindow?: string;
    pickupOffsetMinutes?: number;
    isScheduledAhead?: boolean;
    slotSecured?: boolean;
    paymentMethod: PaymentMethod;
    specialInstructions?: string;
  }) => Promise<{ success: boolean; orderId?: string; pickupPin?: string; error?: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  verifyPickupPin: (orderId: string, enteredPin: string) => { success: boolean; error?: string };

  // Inventory & Restock
  addStockIntake: (itemId: string, quantity: number) => Promise<void>;
  applyAiRestockRecommendation: (itemName: string, outletName: string, refillAmount: number) => Promise<void>;

  // Tables
  bookTable: (params: {
    outletId: string;
    tableNumber: string;
    date: string;
    time: string;
    durationMinutes: number;
    guests: number;
    phone: string;
  }) => Promise<{ success: boolean; error?: string }>;

  // Customer Reports
  submitReport: (params: {
    outletId: string;
    category: ReportCategory;
    description: string;
  }) => Promise<{ success: boolean }>;
  updateReportStatus: (reportId: string, status: ReportStatus) => void;

  // Direct Student-to-Outlet Messaging
  sendChatMessage: (params: {
    outletId: string;
    message: string;
    senderRole: 'student' | 'vendor';
    orderId?: string;
  }) => Promise<void>;
  markMessagesAsRead: (outletId: string) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;

  // Reset Demo Presentation
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial historical orders for realistic demand graph and demonstration
const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: 'ORD-1001',
    studentId: 'stu-demo-01',
    studentName: 'Arafat Rahman',
    outletId: 'khans-kitchen',
    outletName: "Khan's Kitchen",
    items: [
      { item: INITIAL_FOOD_ITEMS.find((f) => f.id === 'kk-chicken-fry')!, quantity: 2 },
      { item: INITIAL_FOOD_ITEMS.find((f) => f.id === 'kk-fried-rice')!, quantity: 1 },
    ],
    subtotal: 340,
    total: 340,
    pickupType: 'ASAP',
    pickupPin: '4821',
    paymentMethod: 'bKash',
    status: 'Completed',
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 'ORD-1002',
    studentId: 'stu-demo-02',
    studentName: 'Nusrat Jahan',
    outletId: 'brew',
    outletName: 'Brew',
    items: [
      { item: INITIAL_FOOD_ITEMS.find((f) => f.id === 'brew-cold-coffee')!, quantity: 1 },
      { item: INITIAL_FOOD_ITEMS.find((f) => f.id === 'brew-cappuccino')!, quantity: 1 },
    ],
    subtotal: 250,
    total: 250,
    pickupType: 'ASAP',
    pickupPin: '7134',
    paymentMethod: 'Nagad',
    status: 'Ready',
    createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'ORD-1003',
    studentId: 'stu-demo-03',
    studentName: 'Tanvir Hossain',
    outletId: 'cp',
    outletName: 'CP',
    items: [
      { item: INITIAL_FOOD_ITEMS.find((f) => f.id === 'cp-spicy-chicken-fry')!, quantity: 2 },
      { item: INITIAL_FOOD_ITEMS.find((f) => f.id === 'cp-sausage')!, quantity: 2 },
    ],
    subtotal: 400,
    total: 400,
    pickupType: 'Schedule Pickup',
    pickupDate: 'Today',
    pickupTime: '1:45 PM (In 45 mins)',
    pickupWindow: '1:40 PM – 1:55 PM',
    pickupOffsetMinutes: 45,
    isScheduledAhead: true,
    slotSecured: true,
    pickupPin: '9523',
    specialInstructions: 'Extra spicy chili sauce on the side please.',
    paymentMethod: 'Cash',
    status: 'Preparing',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
];

const INITIAL_DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    recipientRole: 'all',
    title: 'Welcome to UIU Food HUB!',
    message: 'Browse menus across 5 campus outlets, order ahead, and skip long queues.',
    type: 'order',
    timestamp: new Date().toISOString(),
    isRead: false,
  },
  {
    id: 'notif-2',
    recipientRole: 'vendor',
    title: 'AI Demand Alert',
    message: 'High lunch rush consumption anticipated for Chicken Fry and Khichuri.',
    type: 'ai',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    isRead: false,
  },
];

const INITIAL_DEMO_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    studentId: 'stu-demo-01',
    studentName: 'Arafat Rahman',
    outletId: 'khans-kitchen',
    outletName: "Khan's Kitchen",
    orderId: 'ORD-1001',
    senderRole: 'student',
    message: 'Hi, is Chicken Fry freshly prepared right now?',
    timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
    isRead: true,
  },
  {
    id: 'msg-2',
    studentId: 'stu-demo-01',
    studentName: 'Arafat Rahman',
    outletId: 'khans-kitchen',
    outletName: "Khan's Kitchen",
    orderId: 'ORD-1001',
    senderRole: 'vendor',
    message: 'Yes Arafat! Just took hot Chicken Fry out of the fryer 3 mins ago.',
    timestamp: new Date(Date.now() - 32 * 60000).toISOString(),
    isRead: true,
  },
];

const INITIAL_REGISTERED_USERS: RegisteredUser[] = [
  {
    id: 'stu-demo-01',
    email: 'demo.student@bba.uiu.ac.bd',
    password: 'demo123',
    role: 'student',
    fullName: 'Demo Student (BBA)',
    studentId: '011211001',
    phone: '+880 1711-223344',
    isVerified: true,
  },
  {
    id: 'stu-demo-02',
    email: 'demo.student@cse.uiu.ac.bd',
    password: 'demo123',
    role: 'student',
    fullName: 'Demo Student (CSE)',
    studentId: '011211002',
    phone: '+880 1711-556677',
    isVerified: true,
  },
  {
    id: 'ven-demo-01',
    email: 'vendor@uiu.ac.bd',
    password: 'demo123',
    role: 'vendor',
    fullName: "Khan's Kitchen Manager",
    phone: '+880 1812-998877',
    vendorOutletId: 'khans-kitchen',
    vendorOutletName: "Khan's Kitchen",
    isVerified: true,
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const loadState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading localStorage:', e);
    }
    return null;
  };

  const loadRegisteredUsers = (): RegisteredUser[] => {
    const storageKeys = [
      USERS_STORAGE_KEY,
      'UIU_FOOD_HUB_REGISTERED_USERS_V6',
      'UIU_FOOD_HUB_REGISTERED_USERS_V5',
      'UIU_FOOD_HUB_REGISTERED_USERS_V4',
      'UIU_FOOD_HUB_REGISTERED_USERS_V3',
      'UIU_FOOD_HUB_REGISTERED_USERS_V2',
      'UIU_FOOD_HUB_REGISTERED_USERS',
    ];

    const usersMap = new Map<string, RegisteredUser>();

    // Seed default demo accounts first
    for (const u of INITIAL_REGISTERED_USERS) {
      usersMap.set(u.email.toLowerCase(), u);
    }

    // Merge saved users across all historical keys
    for (const key of storageKeys) {
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            for (const u of parsed) {
              if (u && u.email) {
                usersMap.set(u.email.toLowerCase(), u);
              }
            }
          }
        }
      } catch {}
    }

    return Array.from(usersMap.values());
  };

  const loadPendingVerification = (): PendingVerification | null => {
    try {
      const saved = localStorage.getItem(PENDING_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return null;
  };

  const persisted = loadState();

  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(loadRegisteredUsers());
  const [pendingVerification, setPendingVerification] = useState<PendingVerification | null>(
    loadPendingVerification()
  );

  const [user, setUser] = useState<User | null>(persisted?.user || null);
  const [outlets, setOutlets] = useState<CampusOutlet[]>(persisted?.outlets || INITIAL_OUTLETS);
  const [inventory, setInventory] = useState<FoodItem[]>(persisted?.inventory || INITIAL_FOOD_ITEMS);
  const [tables, setTables] = useState<CampusTable[]>(persisted?.tables || INITIAL_TABLES);
  const [cart, setCart] = useState<CartItem[]>(persisted?.cart || []);
  const [orders, setOrders] = useState<Order[]>(persisted?.orders || INITIAL_DEMO_ORDERS);
  const [tableBookings, setTableBookings] = useState<TableBooking[]>(persisted?.tableBookings || []);
  const [reports, setReports] = useState<CustomerReport[]>(persisted?.reports || []);
  const [messages, setMessages] = useState<ChatMessage[]>(persisted?.messages || INITIAL_DEMO_MESSAGES);
  const [notifications, setNotifications] = useState<AppNotification[]>(
    persisted?.notifications || INITIAL_DEMO_NOTIFICATIONS
  );

  // Sync to localStorage as backup/cache
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user,
          outlets,
          inventory,
          tables,
          cart,
          orders,
          tableBookings,
          reports,
          messages,
          notifications,
        })
      );
    } catch (e) {
      console.error('Error persisting state to localStorage:', e);
    }
  }, [user, outlets, inventory, tables, cart, orders, tableBookings, reports, messages, notifications]);

  // ====================================================================
  // SUPABASE REAL-TIME DATABASE SYNCHRONIZATION
  // ====================================================================

  // Helper to fetch orders from database
  const fetchDbOrders = useCallback(async (currentUserId?: string, userRole?: string, outletId?: string) => {
    if (!isSupabaseConfigured()) return;

    try {
      let query = supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      // Apply role filtering if authenticated
      if (userRole === 'student' && currentUserId) {
        query = query.eq('student_user_id', currentUserId);
      } else if (userRole === 'vendor' && outletId) {
        query = query.eq('vendor_id', outletId);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Could not fetch DB orders:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const mappedOrders: Order[] = data.map((row: any) => ({
          id: row.order_number || row.id,
          studentId: row.student_user_id,
          studentName: row.student_name,
          outletId: row.vendor_id,
          outletName: row.outlet_name,
          items: (row.order_items || []).map((oi: any) => ({
            item: {
              id: oi.food_item_id,
              outletId: row.vendor_id,
              outletName: row.outlet_name,
              name: oi.item_name,
              price: Number(oi.price),
              category: 'Rice',
              description: '',
              image: '',
              stock: 10,
              status: 'Available',
              prepTimeMinutes: 10,
              rating: 4.8,
            },
            quantity: oi.quantity,
          })),
          subtotal: Number(row.subtotal),
          total: Number(row.total_amount),
          pickupType: row.pickup_type as PickupType,
          pickupDate: row.pickup_date,
          pickupTime: row.pickup_time,
          pickupWindow: row.pickup_window,
          pickupOffsetMinutes: row.pickup_offset_minutes,
          isScheduledAhead: row.is_scheduled_ahead,
          slotSecured: row.slot_secured,
          pickupPin: row.pickup_pin,
          specialInstructions: row.special_instructions,
          paymentMethod: row.payment_method as PaymentMethod,
          status: row.status as OrderStatus,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));

        setOrders(mappedOrders);
      }
    } catch (err) {
      console.warn('Error loading orders from Supabase:', err);
    }
  }, []);

  // Helper to fetch inventory from database
  const fetchDbInventory = useCallback(async () => {
    if (!isSupabaseConfigured()) return;

    try {
      const { data, error } = await supabase.from('inventory').select('*');
      if (error) {
        console.warn('Could not fetch DB inventory:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const mappedInv: FoodItem[] = data.map((row: any) => ({
          id: row.id,
          outletId: row.outlet_id,
          outletName: row.outlet_name,
          name: row.name,
          category: row.category,
          price: Number(row.price),
          description: row.description || '',
          image: row.image || '',
          stock: Number(row.stock),
          status: row.status,
          prepTimeMinutes: row.prep_time_minutes || 10,
          rating: Number(row.rating) || 4.5,
          popular: row.popular,
        }));
        setInventory(mappedInv);
      }
    } catch (err) {
      console.warn('Error fetching inventory:', err);
    }
  }, []);

  // 1. Check active session on startup and subscribe to auth state changes
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Check active session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        const currentUser: User = {
          id: session.user.id,
          name: profile?.full_name || session.user.user_metadata?.full_name || 'UIU User',
          email: session.user.email || '',
          role: (profile?.role || session.user.user_metadata?.role || 'student') as UserRole,
          studentId: profile?.student_id || session.user.user_metadata?.student_id,
          phone: profile?.phone || session.user.user_metadata?.phone,
          vendorOutletId: profile?.vendor_outlet_id || session.user.user_metadata?.vendor_outlet_id,
          vendorOutletName: profile?.vendor_outlet_name || session.user.user_metadata?.vendor_outlet_name,
        };

        setUser(currentUser);
        fetchDbOrders(currentUser.id, currentUser.role, currentUser.vendorOutletId);
      }
    });

    fetchDbInventory();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        const currentUser: User = {
          id: session.user.id,
          name: profile?.full_name || session.user.user_metadata?.full_name || 'UIU User',
          email: session.user.email || '',
          role: (profile?.role || session.user.user_metadata?.role || 'student') as UserRole,
          studentId: profile?.student_id || session.user.user_metadata?.student_id,
          phone: profile?.phone || session.user.user_metadata?.phone,
          vendorOutletId: profile?.vendor_outlet_id || session.user.user_metadata?.vendor_outlet_id,
          vendorOutletName: profile?.vendor_outlet_name || session.user.user_metadata?.vendor_outlet_name,
        };

        setUser(currentUser);
        fetchDbOrders(currentUser.id, currentUser.role, currentUser.vendorOutletId);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    // 2. Realtime listener for Orders & Inventory changes
    const channel = supabase
      .channel('public:realtime_feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            setOrders((prev) =>
              prev.map((o) =>
                o.id === updated.order_number || o.id === updated.id
                  ? { ...o, status: updated.status as OrderStatus, updatedAt: updated.updated_at }
                  : o
              )
            );
          } else if (payload.eventType === 'INSERT') {
            fetchDbOrders();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'inventory' },
        (payload) => {
          const updated = payload.new as any;
          setInventory((prev) =>
            prev.map((i) =>
              i.id === updated.id
                ? {
                    ...i,
                    stock: Number(updated.stock),
                    status: updated.status,
                    price: Number(updated.price),
                  }
                : i
            )
          );
        }
      )
      .subscribe();

    return () => {
      authListener?.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [fetchDbOrders, fetchDbInventory]);

  // Derived active vendor outlet
  const activeVendorOutlet =
    user?.role === 'vendor'
      ? outlets.find((o) => o.id === user.vendorOutletId) || outlets[0]
      : null;

  // ====================================================================
  // AUTHENTICATION & LOGIN
  // ====================================================================
  const login = async (
    email: string,
    password?: string,
    requestedRole: 'student' | 'vendor' = 'student',
    selectedOutletId?: string
  ): Promise<{ success: boolean; isUnconfirmed?: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your university email address.' };
    }
    if (!cleanPassword) {
      return { success: false, error: 'Please enter your account password.' };
    }

    // 1. Check registered accounts (local, verified, and pre-seeded accounts)
    const existing = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      if (!existing.isVerified) {
        return {
          success: false,
          isUnconfirmed: true,
          error: 'Account not verified. Please enter your 6-digit verification code.',
        };
      }

      if (existing.password && existing.password !== cleanPassword) {
        // Also check if Supabase has a valid session in case password was changed in Supabase
        if (isSupabaseConfigured()) {
          const supaRes = await loginWithSupabase(cleanEmail, cleanPassword);
          if (!supaRes.success) {
            return { success: false, error: 'Incorrect password. Please try again.' };
          }
        } else {
          return { success: false, error: 'Incorrect password. Please try again.' };
        }
      }

      const targetOutlet = outlets.find(
        (o) => o.id === (existing.vendorOutletId || selectedOutletId)
      ) || outlets[0];

      const loggedInUser: User = {
        id: existing.id,
        name: existing.fullName,
        email: existing.email,
        role: existing.role,
        studentId: existing.studentId,
        phone: existing.phone,
        vendorOutletId: existing.role === 'vendor' ? targetOutlet.id : undefined,
        vendorOutletName: existing.role === 'vendor' ? targetOutlet.name : undefined,
      };

      setUser(loggedInUser);
      fetchDbOrders(loggedInUser.id, loggedInUser.role, loggedInUser.vendorOutletId);
      return { success: true };
    }

    // 2. If not found in registered accounts list, check Supabase Auth directly
    if (isSupabaseConfigured()) {
      const res = await loginWithSupabase(cleanEmail, cleanPassword);

      if (res.success && res.user) {
        // Fetch user profile from database
        let profile = null;
        try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', res.user.id)
            .maybeSingle();
          profile = data;
        } catch {}

        const role = (profile?.role || res.user.user_metadata?.role || requestedRole) as UserRole;
        const targetOutlet = outlets.find(
          (o) => o.id === (profile?.vendor_outlet_id || res.user.user_metadata?.vendor_outlet_id || selectedOutletId)
        ) || outlets[0];

        const loggedInUser: User = {
          id: res.user.id,
          name: profile?.full_name || res.user.user_metadata?.full_name || cleanEmail.split('@')[0],
          email: res.user.email || cleanEmail,
          role,
          studentId: profile?.student_id || res.user.user_metadata?.student_id,
          phone: profile?.phone || res.user.user_metadata?.phone,
          vendorOutletId: role === 'vendor' ? targetOutlet.id : undefined,
          vendorOutletName: role === 'vendor' ? targetOutlet.name : undefined,
        };

        // Cache into registeredUsers so subsequent logins are instant
        const verifiedRecord: RegisteredUser = {
          id: loggedInUser.id,
          email: cleanEmail,
          password: cleanPassword,
          role: loggedInUser.role,
          fullName: loggedInUser.name,
          phone: loggedInUser.phone,
          studentId: loggedInUser.studentId,
          vendorOutletId: loggedInUser.vendorOutletId,
          vendorOutletName: loggedInUser.vendorOutletName,
          isVerified: true,
        };

        setRegisteredUsers((prev) => {
          const filtered = prev.filter((u) => u.email.toLowerCase() !== cleanEmail);
          const updated = [...filtered, verifiedRecord];
          try {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
          } catch {}
          return updated;
        });

        setUser(loggedInUser);
        fetchDbOrders(loggedInUser.id, loggedInUser.role, loggedInUser.vendorOutletId);
        return { success: true };
      }

      if (res.isUnconfirmed) {
        return {
          success: false,
          isUnconfirmed: true,
          error: 'Please enter your 6-digit verification code to activate your account.',
        };
      }
    }

    // 3. Vendor accounts are 100% free & open for faculty evaluation!
    if (requestedRole === 'vendor') {
      const targetOutlet = outlets.find((o) => o.id === selectedOutletId) || outlets[0];
      const vendorUser: User = {
        id: `ven-${targetOutlet.id}`,
        name: `${targetOutlet.name} Manager`,
        email: cleanEmail || `vendor@${targetOutlet.id}.uiu.ac.bd`,
        role: 'vendor',
        vendorOutletId: targetOutlet.id,
        vendorOutletName: targetOutlet.name,
      };
      setUser(vendorUser);
      fetchDbOrders(vendorUser.id, 'vendor', targetOutlet.id);
      return { success: true };
    }

    return {
      success: false,
      error: 'No account found with this email. You must register before logging in.',
    };
  };

  /**
   * Register a new Student or Vendor account and dispatch 6-digit OTP
   */
  const registerUser = async (params: {
    role: 'student' | 'vendor';
    fullName: string;
    email: string;
    phone: string;
    studentId?: string;
    vendorOutletId?: string;
    vendorOutletName?: string;
    password: string;
  }): Promise<{
    success: boolean;
    needsVerification: boolean;
    otpCode?: string;
    emailStatus?: 'sent' | 'rate_limited' | 'not_sent';
    emailStatusMessage?: string;
    error?: string;
  }> => {
    const cleanEmail = params.email.trim().toLowerCase();

    // Check if already registered locally
    const alreadyRegistered = registeredUsers.find(
      (u) =>
        u.email.toLowerCase() === cleanEmail &&
        u.isVerified &&
        !u.id.startsWith('stu-demo') &&
        !u.id.startsWith('ven-demo')
    );
    // If account already exists, we allow re-verifying with new password so the student is never blocked
    if (alreadyRegistered) {
      console.log('Account exists in system. Dispatching new verification code...');
    }

    // Generate a secure 6-digit verification OTP code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    let emailStatus: 'sent' | 'rate_limited' | 'not_sent' = 'not_sent';
    let emailStatusMessage = '';

    // Supabase Registration if configured
    if (isSupabaseConfigured()) {
      if (params.role === 'student') {
        const supaRes = await registerStudentWithSupabase({
          fullName: params.fullName,
          email: cleanEmail,
          phone: params.phone,
          studentId: params.studentId,
          password: params.password,
        });
        if (supaRes.success) {
          emailStatus = 'sent';
          emailStatusMessage = `Verification email dispatched to ${cleanEmail}! Please check your UIU Gmail inbox.`;
        } else {
          const errLower = (supaRes.error || '').toLowerCase();
          // If Supabase reports user already registered from a prior run, trigger resend and allow code verification
          if (errLower.includes('already registered') || errLower.includes('already exists')) {
            console.log('Account exists in Supabase. Dispatching verification code...');
            const resendRes = await resendSupabaseVerification(cleanEmail);
            if (resendRes.success) {
              emailStatus = 'sent';
              emailStatusMessage = `Verification email resent to ${cleanEmail}. Check your inbox.`;
            } else if (
              resendRes.error?.toLowerCase().includes('rate limit') ||
              resendRes.error?.toLowerCase().includes('over_email_send_rate_limit')
            ) {
              emailStatus = 'rate_limited';
              emailStatusMessage =
                'Supabase built-in mailer rate limit reached (free tier: 3 emails/hr). Please use your 6-digit campus activation code below.';
            } else {
              emailStatusMessage = resendRes.error || 'Please enter the 6-digit code below.';
            }
          } else if (errLower.includes('rate limit') || errLower.includes('over_email_send_rate_limit')) {
            emailStatus = 'rate_limited';
            emailStatusMessage =
              'Supabase built-in mailer rate limit reached (free tier: 3 emails/hr). Please use your 6-digit campus activation code below.';
          } else {
            return { success: false, needsVerification: false, error: supaRes.error };
          }
        }
      } else {
        const supaRes = await registerVendorWithSupabase({
          vendorName: params.fullName,
          outletId: params.vendorOutletId || 'khans-kitchen',
          outletName: params.vendorOutletName || "Khan's Kitchen",
          email: cleanEmail,
          phone: params.phone,
          password: params.password,
        });
        if (supaRes.success) {
          emailStatus = 'sent';
          emailStatusMessage = `Verification email dispatched to ${cleanEmail}!`;
        } else {
          const errLower = (supaRes.error || '').toLowerCase();
          if (errLower.includes('already registered') || errLower.includes('already exists')) {
            console.log('Vendor account exists in Supabase. Dispatching verification code...');
            const resendRes = await resendSupabaseVerification(cleanEmail);
            if (resendRes.success) {
              emailStatus = 'sent';
              emailStatusMessage = `Verification email resent to ${cleanEmail}.`;
            } else if (
              resendRes.error?.toLowerCase().includes('rate limit') ||
              resendRes.error?.toLowerCase().includes('over_email_send_rate_limit')
            ) {
              emailStatus = 'rate_limited';
              emailStatusMessage =
                'Supabase built-in mailer rate limit reached (free tier: 3 emails/hr). Please use your 6-digit campus activation code below.';
            }
          } else if (errLower.includes('rate limit') || errLower.includes('over_email_send_rate_limit')) {
            emailStatus = 'rate_limited';
            emailStatusMessage =
              'Supabase built-in mailer rate limit reached (free tier: 3 emails/hr). Please use your 6-digit campus activation code below.';
          } else {
            return { success: false, needsVerification: false, error: supaRes.error };
          }
        }
      }
    }

    // Record pending verification state
    const pendingData: PendingVerification = {
      email: cleanEmail,
      role: params.role,
      fullName: params.fullName.trim(),
      phone: params.phone.trim(),
      studentId: params.studentId?.trim(),
      vendorOutletId: params.vendorOutletId,
      vendorOutletName: params.vendorOutletName,
      password: params.password,
      otpCode: generatedOtp,
      createdAt: Date.now(),
    };

    setPendingVerification(pendingData);
    try {
      localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(pendingData));
    } catch {}

    // Add unverified account placeholder to registeredUsers
    const pendingAccountRecord: RegisteredUser = {
      id: `pending-${Date.now()}`,
      email: cleanEmail,
      password: params.password,
      role: params.role,
      fullName: params.fullName.trim(),
      phone: params.phone.trim(),
      studentId: params.studentId?.trim(),
      vendorOutletId: params.vendorOutletId,
      vendorOutletName: params.vendorOutletName,
      isVerified: false,
    };

    setRegisteredUsers((prev) => {
      const filtered = prev.filter((u) => u.email.toLowerCase() !== cleanEmail);
      const updated = [...filtered, pendingAccountRecord];
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    return {
      success: true,
      needsVerification: true,
      otpCode: generatedOtp,
      emailStatus,
      emailStatusMessage,
    };
  };

  /**
   * Verify the 6-digit code and activate the account
   */
  const verifyAccountOtp = async (
    email: string,
    enteredOtp: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = enteredOtp.trim();

    if (!cleanCode || cleanCode.length !== 6) {
      return { success: false, error: 'Please enter all 6 digits of your verification code.' };
    }

    let pending = pendingVerification;
    if (!pending || pending.email !== cleanEmail) {
      try {
        const savedPending = localStorage.getItem(PENDING_STORAGE_KEY);
        if (savedPending) {
          const parsed = JSON.parse(savedPending);
          if (parsed?.email === cleanEmail) {
            pending = parsed;
          }
        }
      } catch {}
    }

    // 1. Attempt Supabase OTP verification if configured
    let verifiedViaSupabase = false;
    let supaUser: any = null;
    if (isSupabaseConfigured()) {
      const res = await verifyOtpWithSupabase(cleanEmail, cleanCode, 'signup');
      if (res.success && res.user) {
        verifiedViaSupabase = true;
        supaUser = res.user;
      }
    }

    // 2. Validate against either Supabase or pending generated OTP
    const isCodeMatch = verifiedViaSupabase || (pending && pending.otpCode === cleanCode);

    if (!isCodeMatch) {
      return {
        success: false,
        error: 'Invalid 6-digit verification code. Please check your code and try again.',
      };
    }

    // 3. Activated! Create and persist registered user
    const targetOutlet = outlets.find(
      (o) => o.id === (pending?.vendorOutletId || supaUser?.user_metadata?.vendor_outlet_id)
    ) || outlets[0];

    const newUser: User = {
      id: supaUser?.id || `user-${Date.now()}`,
      name: pending?.fullName || supaUser?.user_metadata?.full_name || cleanEmail.split('@')[0],
      email: cleanEmail,
      role: (pending?.role || supaUser?.user_metadata?.role || 'student') as UserRole,
      studentId: pending?.studentId || supaUser?.user_metadata?.student_id,
      phone: pending?.phone || supaUser?.user_metadata?.phone,
      vendorOutletId: (pending?.role || supaUser?.user_metadata?.role) === 'vendor' ? targetOutlet.id : undefined,
      vendorOutletName: (pending?.role || supaUser?.user_metadata?.role) === 'vendor' ? targetOutlet.name : undefined,
    };

    const regRecord: RegisteredUser = {
      id: newUser.id,
      email: cleanEmail,
      password: pending?.password,
      role: newUser.role,
      fullName: newUser.name,
      phone: newUser.phone,
      studentId: newUser.studentId,
      vendorOutletId: newUser.vendorOutletId,
      vendorOutletName: newUser.vendorOutletName,
      isVerified: true,
    };

    setRegisteredUsers((prev) => {
      const filtered = prev.filter((u) => u.email.toLowerCase() !== cleanEmail);
      const updated = [...filtered, regRecord];
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Clear pending verification
    setPendingVerification(null);
    try {
      localStorage.removeItem(PENDING_STORAGE_KEY);
    } catch {}

    // Log the activated user in
    setUser(newUser);
    return { success: true };
  };

  /**
   * Resend 6-digit OTP code with new dispatch
   */
  const resendAccountOtp = async (
    email: string
  ): Promise<{ success: boolean; otpCode?: string; emailStatus?: string; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    let emailStatus = 'A new 6-digit campus activation code has been generated.';

    if (isSupabaseConfigured()) {
      try {
        const supaResend = await resendSupabaseVerification(cleanEmail);
        if (supaResend.success) {
          emailStatus = `Verification email resent to ${cleanEmail}. Please check your inbox.`;
        } else if (
          supaResend.error?.toLowerCase().includes('rate limit') ||
          supaResend.error?.toLowerCase().includes('over_email_send_rate_limit')
        ) {
          emailStatus =
            'Supabase built-in mailer rate limit reached (free tier: 3/hr limit). A new 6-digit campus code has been generated below.';
        } else {
          emailStatus = `Note: ${supaResend.error}`;
        }
      } catch (e: any) {
        console.warn('Supabase resend attempt note:', e);
      }
    }

    setPendingVerification((prev) => {
      const updated: PendingVerification = prev
        ? { ...prev, otpCode: newOtp, createdAt: Date.now() }
        : {
            email: cleanEmail,
            role: 'student' as const,
            fullName: cleanEmail.split('@')[0],
            phone: '',
            otpCode: newOtp,
            createdAt: Date.now(),
          };
      try {
        localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    return { success: true, otpCode: newOtp, emailStatus };
  };

  const switchVendorOutlet = (outletId: string) => {
    const target = outlets.find((o) => o.id === outletId);
    if (target && user?.role === 'vendor') {
      setUser({
        ...user,
        name: `${target.name} Manager`,
        vendorOutletId: target.id,
        vendorOutletName: target.name,
      });
      fetchDbOrders(user.id, 'vendor', target.id);
    }
  };

  const loginAsVendorFree = (outletId?: string): User => {
    const target = outlets.find((o) => o.id === outletId) || outlets[0];
    const vendorUser: User = {
      id: `ven-${target.id}`,
      name: `${target.name} Manager`,
      email: `manager@${target.id}.uiu.ac.bd`,
      role: 'vendor',
      vendorOutletId: target.id,
      vendorOutletName: target.name,
    };
    setUser(vendorUser);
    fetchDbOrders(vendorUser.id, 'vendor', target.id);
    return vendorUser;
  };

  const loginAsStudentDemo = (dept: 'bba' | 'cse' = 'bba'): User => {
    const studentUser: User = {
      id: dept === 'bba' ? 'stu-demo-01' : 'stu-demo-02',
      name: dept === 'bba' ? 'Demo Student (BBA)' : 'Demo Student (CSE)',
      email: dept === 'bba' ? 'demo.student@bba.uiu.ac.bd' : 'demo.student@cse.uiu.ac.bd',
      role: 'student',
      studentId: dept === 'bba' ? '011211001' : '011211002',
      phone: '+880 1711-223344',
    };
    setUser(studentUser);
    fetchDbOrders(studentUser.id, 'student');
    return studentUser;
  };

  const logout = async () => {
    await signOutSupabase();
    setUser(null);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        delete parsed.user;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch {}
  };

  const updateOutletOperationalStatus = (outletId: string, status: OutletOperationalStatus) => {
    setOutlets((prev) =>
      prev.map((o) => (o.id === outletId ? { ...o, operationalStatus: status } : o))
    );
  };

  // Cart operations
  const addToCart = (item: FoodItem, quantity: number = 1): { success: boolean; message?: string } => {
    const currentItem = inventory.find((i) => i.id === item.id);
    if (!currentItem || currentItem.stock <= 0) {
      return { success: false, message: `${item.name} is currently Sold Out.` };
    }

    const existingIndex = cart.findIndex((c) => c.item.id === item.id);
    const existingQty = existingIndex > -1 ? cart[existingIndex].quantity : 0;
    const requestedQty = existingQty + quantity;

    if (requestedQty > currentItem.stock) {
      return {
        success: false,
        message: `Only ${currentItem.stock} left in stock for ${item.name}.`,
      };
    }

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity = requestedQty;
      setCart(updated);
    } else {
      setCart([...cart, { item: currentItem, quantity }]);
    }

    return { success: true, message: `Added ${quantity}x ${item.name} to cart` };
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((c) => c.item.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    const currentItem = inventory.find((i) => i.id === itemId);
    if (currentItem && quantity > currentItem.stock) {
      quantity = currentItem.stock;
    }
    setCart(cart.map((c) => (c.item.id === itemId ? { ...c, quantity } : c)));
  };

  const clearCart = () => setCart([]);

  const cartSubtotal = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
  const cartTotal = cartSubtotal;

  // ====================================================================
  // ORDER CREATION WITH DATABASE PERSISTENCE
  // ====================================================================
  const createOrder = async ({
    outletId,
    pickupType,
    pickupDate,
    pickupTime,
    pickupWindow,
    pickupOffsetMinutes,
    isScheduledAhead,
    slotSecured = true,
    paymentMethod,
    specialInstructions,
  }: {
    outletId: string;
    pickupType: PickupType;
    pickupDate?: string;
    pickupTime?: string;
    pickupWindow?: string;
    pickupOffsetMinutes?: number;
    isScheduledAhead?: boolean;
    slotSecured?: boolean;
    paymentMethod: PaymentMethod;
    specialInstructions?: string;
  }) => {
    if (cart.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    for (const c of cart) {
      const liveItem = inventory.find((i) => i.id === c.item.id);
      if (!liveItem || liveItem.stock < c.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${c.item.name}. Available: ${liveItem?.stock || 0}`,
        };
      }
    }

    const targetOutlet = outlets.find((o) => o.id === outletId) || outlets[0];
    const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();

    // 1. Deduct from local inventory immediately for snappy UI
    setInventory((prev) =>
      prev.map((item) => {
        const ordered = cart.find((c) => c.item.id === item.id);
        if (ordered) {
          const newStock = Math.max(0, item.stock - ordered.quantity);
          return {
            ...item,
            stock: newStock,
            status: calculateStockStatus(newStock),
          };
        }
        return item;
      })
    );

    // 2. Build order object
    const newOrder: Order = {
      id: newOrderId,
      studentId: user?.id || 'stu-demo-01',
      studentName: user?.name || 'UIU Student',
      outletId: targetOutlet.id,
      outletName: targetOutlet.name,
      items: [...cart],
      subtotal: cartSubtotal,
      total: cartTotal,
      pickupType,
      pickupDate: pickupType === 'Schedule Pickup' ? pickupDate : 'Today',
      pickupTime: pickupType === 'Schedule Pickup' ? pickupTime : 'Within 15 mins (ASAP)',
      pickupWindow: pickupWindow || (pickupType === 'ASAP' ? 'Within 15 mins' : pickupTime),
      pickupOffsetMinutes: pickupOffsetMinutes ?? (pickupType === 'ASAP' ? 15 : undefined),
      isScheduledAhead: isScheduledAhead ?? (pickupType === 'Schedule Pickup'),
      slotSecured: slotSecured ?? true,
      pickupPin: newPin,
      specialInstructions,
      paymentMethod,
      status: 'Placed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    // 3. Persist to Supabase if configured
    if (isSupabaseConfigured() && user?.id) {
      try {
        const { data: dbOrder, error: orderErr } = await supabase
          .from('orders')
          .insert({
            order_number: newOrderId,
            student_user_id: user.id,
            student_name: user.name,
            vendor_id: targetOutlet.id,
            outlet_name: targetOutlet.name,
            subtotal: cartSubtotal,
            total_amount: cartTotal,
            pickup_type: pickupType,
            pickup_date: pickupType === 'Schedule Pickup' ? pickupDate : 'Today',
            pickup_time: newOrder.pickupTime,
            pickup_window: newOrder.pickupWindow,
            pickup_offset_minutes: newOrder.pickupOffsetMinutes,
            is_scheduled_ahead: newOrder.isScheduledAhead,
            slot_secured: newOrder.slotSecured,
            pickup_pin: newPin,
            special_instructions: specialInstructions || null,
            payment_method: paymentMethod,
            status: 'Placed',
          })
          .select()
          .single();

        if (orderErr) {
          console.error('Error inserting order in Supabase:', orderErr);
        } else if (dbOrder) {
          // Insert order items
          const itemRows = cart.map((c) => ({
            order_id: dbOrder.id,
            food_item_id: c.item.id,
            item_name: c.item.name,
            quantity: c.quantity,
            price: c.item.price,
            subtotal: c.item.price * c.quantity,
          }));

          await supabase.from('order_items').insert(itemRows);

          // Update stock in Supabase
          for (const c of cart) {
            const newStock = Math.max(0, c.item.stock - c.quantity);
            await supabase
              .from('inventory')
              .update({
                stock: newStock,
                status: calculateStockStatus(newStock),
                updated_at: new Date().toISOString(),
              })
              .eq('id', c.item.id);
          }
        }
      } catch (dbErr) {
        console.warn('Supabase DB error while creating order:', dbErr);
      }
    }

    // 4. Notifications
    const studentNotif: AppNotification = {
      id: `notif-${Date.now()}-1`,
      recipientRole: 'student',
      title: 'Order Placed!',
      message: `Order #${newOrderId} placed at ${targetOutlet.name}. Pickup PIN: ${newPin}.`,
      type: 'order',
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    const vendorNotif: AppNotification = {
      id: `notif-${Date.now()}-2`,
      recipientRole: 'vendor',
      title: `New Order #${newOrderId}`,
      message: `${user?.name || 'Student'} placed order with PIN #${newPin} for ${targetOutlet.name}.`,
      type: 'order',
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setNotifications((prev) => [studentNotif, vendorNotif, ...prev]);
    clearCart();

    return {
      success: true,
      orderId: newOrderId,
      pickupPin: newPin,
    };
  };

  // ====================================================================
  // ORDER STATUS UPDATE (REALTIME PERSISTENCE)
  // ====================================================================
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    // Local optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o))
    );

    // Database update if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('orders')
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .eq('order_number', orderId);
      } catch (err) {
        console.warn('Error updating order status in Supabase:', err);
      }
    }

    // Status notification
    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder) {
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        recipientRole: 'student',
        title: `Order Status: ${status}`,
        message: `Your order #${orderId} from ${targetOrder.outletName} is now ${status}.`,
        type: 'order',
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const verifyPickupPin = (orderId: string, enteredPin: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return { success: false, error: 'Order not found' };

    if (target.pickupPin === enteredPin.trim()) {
      updateOrderStatus(orderId, 'Completed');
      return { success: true };
    }
    return { success: false, error: 'Incorrect 4-digit Pickup PIN code. Please check student order.' };
  };

  // Inventory & Restock
  const addStockIntake = async (itemId: string, quantity: number) => {
    let updatedItem: FoodItem | undefined;

    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newStock = item.stock + quantity;
          const status = calculateStockStatus(newStock);
          updatedItem = { ...item, stock: newStock, status };
          return updatedItem;
        }
        return item;
      })
    );

    if (isSupabaseConfigured() && updatedItem) {
      try {
        await supabase
          .from('inventory')
          .update({
            stock: updatedItem.stock,
            status: updatedItem.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', itemId);
      } catch (err) {
        console.warn('Error updating inventory in Supabase:', err);
      }
    }
  };

  const applyAiRestockRecommendation = async (itemName: string, outletName: string, refillAmount: number) => {
    let updatedItem: FoodItem | undefined;

    setInventory((prev) =>
      prev.map((item) => {
        const matchesName = item.name.toLowerCase().includes(itemName.toLowerCase());
        const matchesOutlet = item.outletName.toLowerCase().includes(outletName.toLowerCase());
        if (matchesName && matchesOutlet) {
          const newStock = item.stock + refillAmount;
          const status = calculateStockStatus(newStock);
          updatedItem = { ...item, stock: newStock, status };
          return updatedItem;
        }
        return item;
      })
    );

    if (isSupabaseConfigured() && updatedItem) {
      try {
        await supabase
          .from('inventory')
          .update({
            stock: updatedItem.stock,
            status: updatedItem.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', updatedItem.id);
      } catch (err) {
        console.warn('Error updating inventory in Supabase:', err);
      }
    }

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      recipientRole: 'vendor',
      title: 'AI Restock Applied',
      message: `Refilled +${refillAmount} units of ${itemName} for ${outletName}.`,
      type: 'inventory',
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Table bookings
  const bookTable = async ({
    outletId,
    tableNumber,
    date,
    time,
    durationMinutes,
    guests,
    phone,
  }: {
    outletId: string;
    tableNumber: string;
    date: string;
    time: string;
    durationMinutes: number;
    guests: number;
    phone: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const conflict = tableBookings.some(
      (b) =>
        b.outletId === outletId &&
        b.tableNumber === tableNumber &&
        b.date === date &&
        b.time === time &&
        b.status !== 'Cancelled'
    );

    if (conflict) {
      return {
        success: false,
        error: `${tableNumber} is already booked at ${time} on ${date}. Please select another time or table.`,
      };
    }

    const targetOutlet = outlets.find((o) => o.id === outletId) || outlets[0];
    const bookingNum = `TB-${Math.floor(100 + Math.random() * 900)}`;

    const newBooking: TableBooking = {
      id: bookingNum,
      studentId: user?.id || 'stu-demo-01',
      studentName: user?.name || 'UIU Student',
      studentPhone: phone,
      outletId: targetOutlet.id,
      outletName: targetOutlet.name,
      tableNumber,
      date,
      time,
      durationMinutes,
      guests,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };

    setTableBookings((prev) => [newBooking, ...prev]);

    if (isSupabaseConfigured() && user?.id) {
      try {
        await supabase.from('table_bookings').insert({
          booking_number: bookingNum,
          student_user_id: user.id,
          student_name: user.name,
          student_phone: phone,
          outlet_id: targetOutlet.id,
          outlet_name: targetOutlet.name,
          table_number: tableNumber,
          booking_date: date,
          start_time: time,
          duration_minutes: durationMinutes,
          guests,
          status: 'Confirmed',
        });
      } catch (err) {
        console.warn('Error saving table booking in Supabase:', err);
      }
    }

    // Update table status in local UI
    setTables((prev) =>
      prev.map((t) =>
        t.outletId === outletId && t.tableNumber === tableNumber ? { ...t, status: 'Reserved' } : t
      )
    );

    return { success: true };
  };

  // Customer Reports
  const submitReport = async ({
    outletId,
    category,
    description,
  }: {
    outletId: string;
    category: ReportCategory;
    description: string;
  }) => {
    const targetOutlet = outlets.find((o) => o.id === outletId) || outlets[0];
    const newReport: CustomerReport = {
      id: `rep-${Date.now()}`,
      studentId: user?.id || 'stu-demo-01',
      studentName: user?.name || 'UIU Student',
      outletId: targetOutlet.id,
      outletName: targetOutlet.name,
      category,
      description,
      status: 'Open',
      createdAt: new Date().toISOString(),
    };

    setReports((prev) => [newReport, ...prev]);

    if (isSupabaseConfigured() && user?.id) {
      try {
        await supabase.from('customer_reports').insert({
          student_user_id: user.id,
          student_name: user.name,
          outlet_id: targetOutlet.id,
          outlet_name: targetOutlet.name,
          category,
          description,
          status: 'Open',
        });
      } catch (err) {
        console.warn('Error saving report in Supabase:', err);
      }
    }

    return { success: true };
  };

  const updateReportStatus = (reportId: string, status: ReportStatus) => {
    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status } : r)));
  };

  // Direct Student-to-Outlet Messaging
  const sendChatMessage = async ({
    outletId,
    message,
    senderRole,
    orderId,
  }: {
    outletId: string;
    message: string;
    senderRole: 'student' | 'vendor';
    orderId?: string;
  }) => {
    const targetOutlet = outlets.find((o) => o.id === outletId) || outlets[0];
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      studentId: user?.id || 'stu-demo-01',
      studentName: user?.name || 'UIU Student',
      outletId: targetOutlet.id,
      outletName: targetOutlet.name,
      orderId,
      senderRole,
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setMessages((prev) => [...prev, newMsg]);

    if (isSupabaseConfigured() && user?.id) {
      try {
        await supabase.from('chat_messages').insert({
          student_id: user.id,
          student_name: user.name,
          outlet_id: targetOutlet.id,
          outlet_name: targetOutlet.name,
          order_id: orderId || null,
          sender_role: senderRole,
          message,
          is_read: false,
        });
      } catch (err) {
        console.warn('Error saving chat message in Supabase:', err);
      }
    }
  };

  const markMessagesAsRead = (outletId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.outletId === outletId ? { ...m, isRead: true } : m))
    );
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const clearNotifications = () => setNotifications([]);

  // Reset Demo Presentation
  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setInventory(INITIAL_FOOD_ITEMS);
    setOrders(INITIAL_DEMO_ORDERS);
    setTableBookings([]);
    setReports([]);
    setMessages(INITIAL_DEMO_MESSAGES);
    setNotifications(INITIAL_DEMO_NOTIFICATIONS);
    setCart([]);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        registerUser,
        verifyAccountOtp,
        resendAccountOtp,
        logout,
        activeVendorOutlet,
        switchVendorOutlet,
        loginAsVendorFree,
        loginAsStudentDemo,
        outlets,
        updateOutletOperationalStatus,
        inventory,
        tables,
        cart,
        orders,
        tableBookings,
        reports,
        notifications,
        messages,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartTotal,
        createOrder,
        updateOrderStatus,
        verifyPickupPin,
        addStockIntake,
        applyAiRestockRecommendation,
        bookTable,
        submitReport,
        updateReportStatus,
        sendChatMessage,
        markMessagesAsRead,
        markNotificationAsRead,
        clearNotifications,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
