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
  ChatMessage,
  OutletOperationalStatus,
} from '../types';
import {
  INITIAL_OUTLETS,
  INITIAL_FOOD_ITEMS,
  INITIAL_TABLES,
  calculateStockStatus,
} from '../data/initialData';

const STORAGE_KEY = 'UIU_FOOD_HUB_STATE_V3';

interface AppContextType {
  // Auth & Outlet Scoping
  user: User | null;
  login: (email: string, role: 'student' | 'vendor', outletId?: string) => boolean;
  logout: () => void;
  activeVendorOutlet: CampusOutlet | null;
  switchVendorOutlet: (outletId: string) => void;

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
  }) => { success: boolean; orderId?: string; pickupPin?: string; error?: string };
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  verifyPickupPin: (orderId: string, enteredPin: string) => { success: boolean; error?: string };

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

  // Direct Student-to-Outlet Messaging
  sendChatMessage: (params: {
    outletId: string;
    message: string;
    senderRole: 'student' | 'vendor';
    orderId?: string;
  }) => void;
  markMessagesAsRead: (outletId: string) => void;

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
    pickupPin: '4821',
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
    pickupPin: '7134',
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
    studentId: 'stu-1',
    studentName: 'Arafat Rahman',
    outletId: 'khans-kitchen',
    outletName: "Khan's Kitchen",
    orderId: 'UIU-ORD-1001',
    senderRole: 'student',
    message: 'Hi, is Chicken Fry freshly prepared right now?',
    timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
    isRead: true,
  },
  {
    id: 'msg-2',
    studentId: 'stu-1',
    studentName: 'Arafat Rahman',
    outletId: 'khans-kitchen',
    outletName: "Khan's Kitchen",
    orderId: 'UIU-ORD-1001',
    senderRole: 'vendor',
    message: 'Yes Arafat! Just took hot Chicken Fry out of the fryer 3 mins ago.',
    timestamp: new Date(Date.now() - 32 * 60000).toISOString(),
    isRead: true,
  },
  {
    id: 'msg-3',
    studentId: 'stu-uiu-01',
    studentName: 'Sayed Rafy (Student)',
    outletId: 'brew',
    outletName: 'Brew',
    senderRole: 'student',
    message: 'Hello Brew team, do you have cold coffee available today?',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    isRead: false,
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

  const persisted = loadState();

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

  // Sync to localStorage
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

  // Active vendor outlet derived from user state
  const activeVendorOutlet =
    user?.role === 'vendor'
      ? outlets.find((o) => o.id === user.vendorOutletId) || outlets[0]
      : null;

  // Auth & Branch Selection
  const login = (email: string, role: 'student' | 'vendor', selectedOutletId?: string): boolean => {
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
      const targetOutlet = outlets.find((o) => o.id === selectedOutletId) || outlets[0];
      setUser({
        id: `ven-${targetOutlet.id}`,
        name: `${targetOutlet.name} Manager`,
        email: email || 'vendor@uiu.ac.bd',
        role: 'vendor',
        phone: '+880 1812-998877',
        vendorOutletId: targetOutlet.id,
        vendorOutletName: targetOutlet.name,
      });
    }
    return true;
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
    }
  };

  const logout = () => {
    setUser(null);
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
  const cartTotal = cartSubtotal;

  // Create Order
  const createOrder = ({
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
    const newOrderId = `UIU-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();

    // 1. Deduct from shared inventory
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

    // 2. Create the real order record with PIN and instructions
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

    // 3. Notifications
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
      message: `Order #${newOrderId} received from ${newOrder.studentName} (${newOrder.items.length} items).`,
      type: 'order',
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setNotifications((prev) => [studentNotif, vendorNotif, ...prev]);
    clearCart();

    return { success: true, orderId: newOrderId, pickupPin: newPin };
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
            ? `Your order #${orderId} is READY for pickup at ${targetOrder.outletName}! Show PIN: ${targetOrder.pickupPin}.`
            : status === 'Preparing'
            ? `The chef at ${targetOrder.outletName} has started preparing your order #${orderId}.`
            : `Order #${orderId} marked as ${status}.`,
        type: 'order',
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // Verify PIN to hand over order
  const verifyPickupPin = (orderId: string, enteredPin: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }
    if (order.pickupPin.trim() === enteredPin.trim()) {
      updateOrderStatus(orderId, 'Completed');
      return { success: true };
    }
    return { success: false, error: `Invalid PIN. Please check student order screen.` };
  };

  // Direct Student-to-Outlet Messaging
  const sendChatMessage = ({
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
      studentId: user?.studentId || 'stu-uiu-01',
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

    // Send notification to opposite role
    const notif: AppNotification = {
      id: `notif-chat-${Date.now()}`,
      recipientRole: senderRole === 'student' ? 'vendor' : 'student',
      title:
        senderRole === 'student'
          ? `Message from ${newMsg.studentName}`
          : `Reply from ${targetOutlet.name}`,
      message: message.slice(0, 50),
      type: 'report',
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const markMessagesAsRead = (outletId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.outletId === outletId ? { ...m, isRead: true } : m))
    );
  };

  // Vendor Stock Intake
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

    setTables((prev) =>
      prev.map((t) => (t.outletId === outletId && t.tableNumber === tableNumber ? { ...t, status: 'Reserved' } : t))
    );

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

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Reset Demo Data
  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setOutlets(INITIAL_OUTLETS);
    setInventory(INITIAL_FOOD_ITEMS);
    setTables(INITIAL_TABLES);
    setCart([]);
    setOrders(INITIAL_DEMO_ORDERS);
    setTableBookings([]);
    setReports([]);
    setMessages(INITIAL_DEMO_MESSAGES);
    setNotifications(INITIAL_DEMO_NOTIFICATIONS);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        activeVendorOutlet,
        switchVendorOutlet,
        outlets,
        updateOutletOperationalStatus,
        inventory,
        tables,
        cart,
        orders,
        tableBookings,
        reports,
        messages,
        notifications,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartTotal,
        createOrder,
        updateOrderStatus,
        verifyPickupPin,
        sendChatMessage,
        markMessagesAsRead,
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
