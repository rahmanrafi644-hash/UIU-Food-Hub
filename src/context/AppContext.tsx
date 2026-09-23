import React, { createContext, useContext, useState, useEffect } from 'react';
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
} from '../types';
import {
  INITIAL_OUTLETS,
  INITIAL_FOOD_ITEMS,
  INITIAL_TABLES,
  calculateStockStatus,
} from '../data/initialData';

const STORAGE_KEY = 'UIU_FOOD_HUB_STATE_V2';

interface AppContextType {
  // Auth
  user: User | null;
  login: (email: string, role: 'student' | 'vendor') => boolean;
  logout: () => void;

  // Data
  outlets: CampusOutlet[];
  inventory: FoodItem[];
  tables: CampusTable[];
  cart: CartItem[];
  orders: Order[];
  tableBookings: TableBooking[];
  reports: CustomerReport[];
  notifications: AppNotification[];

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
    paymentMethod: PaymentMethod;
  }) => { success: boolean; orderId?: string; error?: string };
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  // Inventory & Restock
  addStockIntake: (itemId: string, quantity: number) => void;
  applyAiRestockRecommendation: (itemName: string, outletName: string, refillAmount: number) => void;

  // Tables
  bookTable: (params: {
    outletId: string;
    tableNumber: string;
    date: string;
    time: string;
    durationMinutes: number;
    guests: number;
    phone: string;
  }) => { success: boolean; error?: string };

  // Customer Reports
  submitReport: (params: {
    outletId: string;
    category: ReportCategory;
    description: string;
  }) => { success: boolean };
  updateReportStatus: (reportId: string, status: ReportStatus) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;

  // Reset Demo Presentation
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial historical orders for realistic demand graph and vendor demonstration
const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: 'UIU-ORD-1001',
    studentId: 'stu-1',
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
    paymentMethod: 'bKash',
    status: 'Completed',
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 'UIU-ORD-1002',
    studentId: 'stu-2',
    studentName: 'Nusrat Jahan',
    outletId: 'brew',
    outletName: 'Brew',
    items: [
      { item: INITIAL_FOOD_ITEMS.find((f) => f.id === 'brew-cappuccino')!, quantity: 1 },
      { item: INITIAL_FOOD_ITEMS.find((f) => f.id === 'brew-cold-coffee')!, quantity: 1 },
    ],
    subtotal: 300,
    total: 300,
    pickupType: 'ASAP',
    paymentMethod: 'Nagad',
    status: 'Ready',
    createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'UIU-ORD-1003',
    studentId: 'stu-3',
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
    pickupTime: '1:45 PM',
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial persistent state if available
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

  const persisted = loadState();

  const [user, setUser] = useState<User | null>(persisted?.user || null);
  const [outlets] = useState<CampusOutlet[]>(INITIAL_OUTLETS);
  const [inventory, setInventory] = useState<FoodItem[]>(persisted?.inventory || INITIAL_FOOD_ITEMS);
  const [tables, setTables] = useState<CampusTable[]>(persisted?.tables || INITIAL_TABLES);
  const [cart, setCart] = useState<CartItem[]>(persisted?.cart || []);
  const [orders, setOrders] = useState<Order[]>(persisted?.orders || INITIAL_DEMO_ORDERS);
  const [tableBookings, setTableBookings] = useState<TableBooking[]>(persisted?.tableBookings || []);
  const [reports, setReports] = useState<CustomerReport[]>(persisted?.reports || []);
  const [notifications, setNotifications] = useState<AppNotification[]>(
    persisted?.notifications || INITIAL_DEMO_NOTIFICATIONS
  );

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user,
          inventory,
          tables,
          cart,
          orders,
          tableBookings,
          reports,
          notifications,
        })
      );
    } catch (e) {
      console.error('Error persisting state to localStorage:', e);
    }
  }, [user, inventory, tables, cart, orders, tableBookings, reports, notifications]);

  // Auth
  const login = (email: string, role: 'student' | 'vendor'): boolean => {
    if (role === 'student') {
      setUser({
        id: 'stu-uiu-01',
        name: 'Sayed Rafy (Student)',
        email: email || 'student@uiu.ac.bd',
        role: 'student',
        studentId: '011211048',
        phone: '+880 1711-223344',
      });
    } else {
      setUser({
        id: 'ven-uiu-01',
        name: "Khan's Kitchen & Campus Vendors",
        email: email || 'vendor@uiu.ac.bd',
        role: 'vendor',
        phone: '+880 1812-998877',
      });
    }
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  // Cart operations
  const addToCart = (item: FoodItem, quantity: number = 1): { success: boolean; message?: string } => {
    // Check current live inventory
    const currentItem = inventory.find((i) => i.id === item.id);
    if (!currentItem || currentItem.stock <= 0) {
      return { success: false, message: 'Item is currently Sold Out!' };
    }

    const existingIndex = cart.findIndex((c) => c.item.id === item.id);
    const existingQuantity = existingIndex >= 0 ? cart[existingIndex].quantity : 0;
    const requestedTotal = existingQuantity + quantity;

    if (requestedTotal > currentItem.stock) {
      return {
        success: false,
        message: `Only ${currentItem.stock} portions available in stock.`,
      };
    }

    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity = requestedTotal;
      setCart(updated);
    } else {
      setCart([...cart, { item: currentItem, quantity }]);
    }

    return { success: true };
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
  const cartTotal = cartSubtotal; // Prototype total

  // Create Order - Deducts from shared inventory!
  const createOrder = ({
    outletId,
    pickupType,
    pickupDate,
    pickupTime,
    paymentMethod,
  }: {
    outletId: string;
    pickupType: PickupType;
    pickupDate?: string;
    pickupTime?: string;
    paymentMethod: PaymentMethod;
  }) => {
    if (cart.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    // Verify stock availability
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
    const newOrderId = `UIU-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Deduct from SHARED INVENTORY & recalculate stock status
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

    // 2. Create the real order record
    const newOrder: Order = {
      id: newOrderId,
      studentId: user?.studentId || '011211048',
      studentName: user?.name || 'UIU Student',
      outletId: targetOutlet.id,
      outletName: targetOutlet.name,
      items: [...cart],
      subtotal: cartSubtotal,
      total: cartTotal,
      pickupType,
      pickupDate: pickupType === 'Schedule Pickup' ? pickupDate : 'Today',
      pickupTime: pickupType === 'Schedule Pickup' ? pickupTime : 'Within 15 mins (ASAP)',
      paymentMethod,
      status: 'Placed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    // 3. Add student & vendor notifications
    const studentNotif: AppNotification = {
      id: `notif-${Date.now()}-1`,
      recipientRole: 'student',
      title: 'Order Placed!',
      message: `Your order #${newOrderId} at ${targetOutlet.name} is placed. Pick up: ${newOrder.pickupTime}.`,
      type: 'order',
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    const vendorNotif: AppNotification = {
      id: `notif-${Date.now()}-2`,
      recipientRole: 'vendor',
      title: 'New Student Order Incoming',
      message: `Order #${newOrderId} received from ${newOrder.studentName} for ${newOrder.items.length} items.`,
      type: 'order',
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setNotifications((prev) => [studentNotif, vendorNotif, ...prev]);

    // 4. Clear cart
    clearCart();

    return { success: true, orderId: newOrderId };
  };

  // Vendor updates order status
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o))
    );

    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder) {
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        recipientRole: 'student',
        title: `Order Status: ${status}`,
        message:
          status === 'Ready'
            ? `Your order #${orderId} is READY for pickup at ${targetOrder.outletName} counter!`
            : status === 'Preparing'
            ? `The chef has started preparing your order #${orderId}.`
            : `Order #${orderId} marked as ${status}.`,
        type: 'order',
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // Vendor Stock Intake (Add stock)
  const addStockIntake = (itemId: string, quantity: number) => {
    if (quantity <= 0) return;

    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newStock = item.stock + quantity;
          return {
            ...item,
            stock: newStock,
            status: calculateStockStatus(newStock),
          };
        }
        return item;
      })
    );

    const item = inventory.find((i) => i.id === itemId);
    if (item) {
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        recipientRole: 'student',
        title: `Restock Alert: ${item.name}`,
        message: `Freshly prepared batch of ${item.name} (+${quantity} portions) is now available at ${item.outletName}!`,
        type: 'inventory',
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // Apply AI Recommendation Restock
  const applyAiRestockRecommendation = (itemName: string, outletName: string, refillAmount: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        const matchesName = item.name.toLowerCase().trim() === itemName.toLowerCase().trim();
        const matchesOutlet = !outletName || item.outletName.toLowerCase().includes(outletName.toLowerCase());
        if (matchesName && matchesOutlet) {
          const newStock = item.stock + refillAmount;
          return {
            ...item,
            stock: newStock,
            status: calculateStockStatus(newStock),
          };
        }
        return item;
      })
    );

    const notif: AppNotification = {
      id: `notif-ai-restock-${Date.now()}`,
      recipientRole: 'vendor',
      title: 'AI Restock Executed',
      message: `Successfully restocked ${refillAmount} portions of ${itemName} based on Gemini demand analysis.`,
      type: 'ai',
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Table Booking
  const bookTable = ({
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
  }) => {
    // Check conflicts
    const conflict = tableBookings.find(
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
        error: `${tableNumber} is already reserved for ${time} on ${date}. Please select another table or time.`,
      };
    }

    const outlet = outlets.find((o) => o.id === outletId) || outlets[0];
    const newBooking: TableBooking = {
      id: `TB-${Math.floor(100 + Math.random() * 900)}`,
      studentId: user?.studentId || '011211048',
      studentName: user?.name || 'UIU Student',
      studentPhone: phone || '+880 1711-223344',
      outletId: outlet.id,
      outletName: outlet.name,
      tableNumber,
      date,
      time,
      durationMinutes,
      guests,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };

    setTableBookings((prev) => [newBooking, ...prev]);

    // Update table status in table list
    setTables((prev) =>
      prev.map((t) => (t.outletId === outletId && t.tableNumber === tableNumber ? { ...t, status: 'Reserved' } : t))
    );

    // Notifications
    const studentNotif: AppNotification = {
      id: `notif-tb-${Date.now()}`,
      recipientRole: 'student',
      title: 'Table Booking Confirmed',
      message: `${tableNumber} booked at ${outlet.name} for ${date} at ${time} (${durationMinutes} mins).`,
      type: 'table',
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setNotifications((prev) => [studentNotif, ...prev]);

    return { success: true };
  };

  // Submit Issue Report
  const submitReport = ({
    outletId,
    category,
    description,
  }: {
    outletId: string;
    category: ReportCategory;
    description: string;
  }) => {
    const outlet = outlets.find((o) => o.id === outletId) || outlets[0];
    const newReport: CustomerReport = {
      id: `REP-${Math.floor(100 + Math.random() * 900)}`,
      studentId: user?.studentId || '011211048',
      studentName: user?.name || 'UIU Student',
      outletId: outlet.id,
      outletName: outlet.name,
      category,
      description,
      status: 'Open',
      createdAt: new Date().toISOString(),
    };

    setReports((prev) => [newReport, ...prev]);

    const notif: AppNotification = {
      id: `notif-rep-${Date.now()}`,
      recipientRole: 'vendor',
      title: `New Issue Reported: ${category}`,
      message: `A student reported an issue regarding ${outlet.name}: "${description.slice(0, 50)}..."`,
      type: 'report',
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    return { success: true };
  };

  const updateReportStatus = (reportId: string, status: ReportStatus) => {
    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status } : r)));
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Reset Demo Data: Restores exact starting conditions for presentation
  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setInventory(INITIAL_FOOD_ITEMS);
    setTables(INITIAL_TABLES);
    setCart([]);
    setOrders(INITIAL_DEMO_ORDERS);
    setTableBookings([]);
    setReports([]);
    setNotifications(INITIAL_DEMO_NOTIFICATIONS);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        outlets,
        inventory,
        tables,
        cart,
        orders,
        tableBookings,
        reports,
        notifications,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartTotal,
        createOrder,
        updateOrderStatus,
        addStockIntake,
        applyAiRestockRecommendation,
        bookTable,
        submitReport,
        updateReportStatus,
        markNotificationAsRead,
        clearNotifications,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
