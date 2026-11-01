import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  UserRole,
  Product,
  CartItem,
  Order,
  LedgerEntry,
  NotificationItem,
  Language,
  ThemeMode,
  CompanyLedgerSummary,
  PaymentChannel,
  OrderStatus,
} from '../types';
import {
  mockCompanies,
  mockDefaultSeller,
  initialProducts,
  initialOrders,
  initialLedgerEntries,
  initialNotifications,
} from '../constants/mockData';
import { translations } from '../constants/translations';
import { lightColors, darkColors, ThemeColors } from '../theme/colors';
import { apiService } from '../services/api';

const STORAGE_KEYS = {
  USER: '@voltmart_user',
  LANGUAGE: '@voltmart_lang',
  THEME: '@voltmart_theme',
  PRODUCTS: '@voltmart_products',
  ORDERS: '@voltmart_orders',
  LEDGER: '@voltmart_ledger',
  CART: '@voltmart_cart',
  WISHLIST: '@voltmart_wishlist',
  NOTIFICATIONS: '@voltmart_notifs',
  ONBOARDED: '@voltmart_onboarded',
};

interface StoreContextType {
  // Auth & User
  user: User | null;
  role: UserRole;
  isOnboarded: boolean;
  login: (phone: string, role: UserRole, businessName?: string) => Promise<boolean>;
  signup: (userData: Partial<User>) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => void;
  setOnboarded: (val: boolean) => void;

  // Language & Theme
  language: Language;
  t: (typeof translations)['en'];
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  themeMode: ThemeMode;
  colors: ThemeColors;
  toggleThemeMode: () => void;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleHideProduct: (id: string) => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => { success: boolean; message?: string };
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: {
    itemCount: number;
    subtotal: number;
    bulkDiscount: number;
    estimatedDelivery: number;
    estimatedVat: number;
    total: number;
  };

  // Wishlist & Compare
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  compareList: string[];
  addToCompare: (productId: string) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;

  // Orders
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'invoiceNumber' | 'timeline'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;

  // Ledger & Payments (বাকি খাতা)
  ledger: LedgerEntry[];
  payDueInstallment: (
    companyId: string,
    companyName: string,
    amount: number,
    channel: PaymentChannel,
    orderId?: string
  ) => Promise<LedgerEntry>;
  companyWiseLedgerList: CompanyLedgerSummary[];
  sellerTotalPurchased: number;
  sellerTotalPaid: number;
  sellerTotalDue: number;

  // Company Dashboard Computations
  companyProducts: Product[];
  companyOrders: Order[];
  companyTotalRevenue: number;
  companyTotalDueReceivable: number;
  companyPendingOrdersCount: number;

  // Notifications
  notifications: NotificationItem[];
  markAllNotificationsRead: () => void;
  unreadNotificationsCount: number;

  // Active Bottom Tab
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(mockDefaultSeller);
  const [role, setRole] = useState<UserRole>('SELLER');
  const [isOnboarded, setIsOnboarded] = useState<boolean>(true);
  const [language, setLanguageState] = useState<Language>('en');
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(['prod_1', 'prod_3']);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [ledger, setLedger] = useState<LedgerEntry[]>(initialLedgerEntries);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<string>('Home');

  // Load persistent data from AsyncStorage
  useEffect(() => {
    const loadState = async () => {
      try {
        const [
          savedUser,
          savedLang,
          savedTheme,
          savedProducts,
          savedOrders,
          savedLedger,
          savedCart,
          savedWishlist,
          savedOnboarded,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.USER),
          AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
          AsyncStorage.getItem(STORAGE_KEYS.THEME),
          AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS),
          AsyncStorage.getItem(STORAGE_KEYS.ORDERS),
          AsyncStorage.getItem(STORAGE_KEYS.LEDGER),
          AsyncStorage.getItem(STORAGE_KEYS.CART),
          AsyncStorage.getItem(STORAGE_KEYS.WISHLIST),
          AsyncStorage.getItem(STORAGE_KEYS.ONBOARDED),
        ]);

        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          setRole(parsed.role);
        }
        if (savedLang) setLanguageState(savedLang as Language);
        if (savedTheme) setThemeModeState(savedTheme as ThemeMode);
        if (savedProducts) setProducts(JSON.parse(savedProducts));
        if (savedOrders) setOrders(JSON.parse(savedOrders));
        if (savedLedger) setLedger(JSON.parse(savedLedger));
        if (savedCart) setCart(JSON.parse(savedCart));
        if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
        if (savedOnboarded !== null) setIsOnboarded(savedOnboarded === 'true');

        // Sync live products from VoltMart backend API if server is reachable
        apiService.getProducts().then(liveProds => {
          if (liveProds && liveProds.length > 0) {
            setProducts(liveProds);
            AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(liveProds));
          }
        }).catch(() => {
          // Keep local / cached products if API server not yet started
        });
      } catch (e) {
        console.error('Failed to load state from storage', e);
      }
    };
    loadState();
  }, []);

  // Save helpers
  const saveUserData = async (u: User | null) => {
    setUser(u);
    if (u) {
      setRole(u.role);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    }
  };

  const setOnboarded = async (val: boolean) => {
    setIsOnboarded(val);
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, String(val));
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  };

  const toggleLanguage = () => {
    const next = language === 'en' ? 'bn' : 'en';
    setLanguage(next);
  };

  const toggleThemeMode = async () => {
    const next = themeMode === 'light' ? 'dark' : 'light';
    setThemeModeState(next);
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, next);
  };

  const login = async (phone: string, targetRole: UserRole, businessName?: string): Promise<boolean> => {
    if (targetRole === 'COMPANY') {
      const matchComp = mockCompanies.find(c => c.phone === phone) || {
        ...mockCompanies[0],
        phone,
        businessName: businessName || mockCompanies[0].businessName,
      };
      await saveUserData(matchComp);
      setRole('COMPANY');
      setActiveTab('Dashboard');
    } else {
      const seller: User = {
        ...mockDefaultSeller,
        phone,
        businessName: businessName || mockDefaultSeller.businessName,
      };
      await saveUserData(seller);
      setRole('SELLER');
      setActiveTab('Home');
    }
    return true;
  };

  const signup = async (userData: Partial<User>): Promise<boolean> => {
    const isCompany = userData.role === 'COMPANY';
    const newUser: User = {
      id: isCompany ? `comp_${Date.now()}` : `seller_${Date.now()}`,
      role: userData.role || 'SELLER',
      name: userData.name || 'New Member',
      businessName: userData.businessName || (isCompany ? 'Super Electricals Ltd.' : 'Apex Hardware Store'),
      phone: userData.phone || '01700000000',
      email: userData.email || 'business@voltmart.com',
      address: userData.address || 'Nawabpur Road, Dhaka',
      city: userData.city || 'Dhaka',
      tradeLicense: userData.tradeLicense || 'TRAD/2026/99182',
      nid: userData.nid,
      logo: isCompany
        ? 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      rating: 5.0,
      creditLimit: isCompany ? 5000000 : 250000,
      availableCredit: isCompany ? 4500000 : 250000,
      verified: true,
      joinedDate: 'Oct 2026',
    };
    await saveUserData(newUser);
    return true;
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
    setActiveTab('Home');
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'COMPANY') {
      const company = mockCompanies[0]; // Super Star Group
      setUser(company);
      setRole('COMPANY');
      setActiveTab('Dashboard');
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(company));
    } else {
      const seller = mockDefaultSeller;
      setUser(seller);
      setRole('SELLER');
      setActiveTab('Home');
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(seller));
    }
  };

  // Products actions
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    let created: Product;
    try {
      created = await apiService.createProduct(productData);
    } catch {
      created = {
        ...productData,
        id: `prod_${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
    }
    const updated = [created, ...products.filter(p => p.id !== created.id)];
    setProducts(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    apiService.updateProduct(id, updates).catch(() => {});
    const updated = products.map(p => (p.id === id ? { ...p, ...updates } : p));
    setProducts(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
  };

  const deleteProduct = async (id: string) => {
    apiService.deleteProduct(id).catch(() => {});
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
  };

  const toggleHideProduct = async (id: string) => {
    const updated = products.map(p => (p.id === id ? { ...p, isHidden: !p.isHidden } : p));
    setProducts(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
  };

  // Cart actions
  const addToCart = (product: Product, quantity = product.moq): { success: boolean; message?: string } => {
    const existingIndex = cart.findIndex(item => item.product.id === product.id);
    let updatedCart: CartItem[];

    if (existingIndex > -1) {
      const current = cart[existingIndex];
      const newQty = current.quantity + quantity;
      updatedCart = [...cart];
      updatedCart[existingIndex] = {
        ...current,
        quantity: newQty,
        subtotal: newQty * current.unitPrice,
      };
    } else {
      const validQty = Math.max(quantity, product.moq);
      const newItem: CartItem = {
        product,
        quantity: validQty,
        unitPrice: product.wholesalePrice,
        subtotal: validQty * product.wholesalePrice,
      };
      updatedCart = [newItem, ...cart];
    }

    setCart(updatedCart);
    AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(updatedCart));
    return { success: true };
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const item = cart.find(c => c.product.id === productId);
    if (!item) return;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updated = cart.map(c => {
      if (c.product.id === productId) {
        return {
          ...c,
          quantity,
          subtotal: quantity * c.unitPrice,
        };
      }
      return c;
    });
    setCart(updated);
    AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(updated));
  };

  const removeFromCart = (productId: string) => {
    const updated = cart.filter(c => c.product.id !== productId);
    setCart(updated);
    AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(updated));
  };

  const clearCart = () => {
    setCart([]);
    AsyncStorage.removeItem(STORAGE_KEYS.CART);
  };

  const cartTotal = React.useMemo(() => {
    const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
    // 5% bulk discount for totals above 25,000 BDT
    const bulkDiscount = subtotal >= 25000 ? Math.round(subtotal * 0.05) : 0;
    const estimatedDelivery = cart.length > 0 ? 450 : 0;
    const estimatedVat = Math.round((subtotal - bulkDiscount) * 0.05); // 5% B2B VAT
    const total = subtotal - bulkDiscount + estimatedDelivery + estimatedVat;

    return {
      itemCount,
      subtotal,
      bulkDiscount,
      estimatedDelivery,
      estimatedVat,
      total,
    };
  }, [cart]);

  // Wishlist actions
  const toggleWishlist = (productId: string) => {
    const exists = wishlist.includes(productId);
    const updated = exists ? wishlist.filter(id => id !== productId) : [...wishlist, productId];
    setWishlist(updated);
    AsyncStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(updated));
  };

  // Compare actions
  const addToCompare = (productId: string): boolean => {
    if (compareList.includes(productId)) return true;
    if (compareList.length >= 3) return false;
    setCompareList([...compareList, productId]);
    return true;
  };

  const removeFromCompare = (productId: string) => {
    setCompareList(compareList.filter(id => id !== productId));
  };

  const clearCompare = () => setCompareList([]);

  // Orders & Ledger Integration
  const createOrder = async (
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'invoiceNumber' | 'timeline'>
  ): Promise<Order> => {
    const orderId = `ord_${Date.now()}`;
    const orderNum = `VM-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceNum = `INV-${orderData.companyId.replace('comp_', '').toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      orderNumber: orderNum,
      invoiceNumber: invoiceNum,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      timeline: [
        {
          status: 'placed',
          label: 'Order Placed',
          timestamp: 'Just now',
          completed: true,
          note: 'Submitted to manufacturer',
        },
        {
          status: 'confirmed',
          label: 'Awaiting Company Confirmation',
          timestamp: 'Pending',
          completed: false,
        },
        {
          status: 'packed',
          label: 'Packaging & Quality Check',
          timestamp: 'Pending',
          completed: false,
        },
        {
          status: 'shipped',
          label: 'In Transit',
          timestamp: 'Pending',
          completed: false,
        },
        {
          status: 'delivered',
          label: 'Delivered to Shop',
          timestamp: 'Pending',
          completed: false,
        },
      ],
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));

    // Async sync with VoltMart backend API
    apiService.createOrder({
      id: orderId,
      orderNumber: orderNum,
      sellerId: orderData.buyerId,
      sellerName: orderData.buyerName,
      sellerShop: orderData.buyerShopName,
      companyId: orderData.companyId,
      companyName: orderData.companyName,
      items: orderData.items.map(it => ({
        productId: it.product.id,
        title: it.product.title,
        image: it.product.images[0] || '',
        quantity: it.quantity,
        unitPrice: it.product.pricePerUnit,
        wholesalePrice: it.product.wholesalePrice,
        unitType: it.product.unitType,
      })),
      totalAmount: orderData.totalAmount,
      discountAmount: 0,
      paidAmount: orderData.paidAmount,
      dueAmount: orderData.dueAmount,
      status: 'placed',
      paymentMethod: orderData.paymentChannel,
      paymentStatus: orderData.dueAmount === 0 ? 'paid' : orderData.paidAmount > 0 ? 'partial' : 'due',
    }).catch(() => {});

    // Also record in Ledger (বাকি খাতা)
    const productSummary = orderData.items.map(i => `${i.product.title.substring(0, 25)}... (${i.quantity} ${i.product.unitType})`).join(', ');
    const previousCompanyDue = ledger
      .filter(l => l.companyId === orderData.companyId && l.buyerId === orderData.buyerId)
      .reduce((acc, curr) => acc + (curr.dueAmount || 0), 0);

    const newLedgerEntry: LedgerEntry = {
      id: `led_${Date.now()}`,
      orderId,
      buyerId: orderData.buyerId,
      buyerName: orderData.buyerName,
      buyerShopName: orderData.buyerShopName,
      companyId: orderData.companyId,
      companyName: orderData.companyName,
      totalAmount: orderData.totalAmount,
      paidAmount: orderData.paidAmount,
      dueAmount: orderData.dueAmount,
      previousBalance: previousCompanyDue,
      newBalance: previousCompanyDue + orderData.dueAmount,
      type: 'PURCHASE',
      paymentChannel: orderData.paymentChannel,
      referenceReceiptNo: `RCP-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      timestamp: Date.now(),
      productSummary,
      note: orderData.dueAmount > 0
        ? `Partial wholesale payment (৳${orderData.paidAmount.toLocaleString()}); Outstanding Due ৳${orderData.dueAmount.toLocaleString()}`
        : '100% full wholesale payment received.',
    };

    const updatedLedger = [newLedgerEntry, ...ledger];
    setLedger(updatedLedger);
    await AsyncStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(updatedLedger));

    // Clear cart after successful order
    clearCart();

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: 'Order Submitted 🚀',
      message: `Your wholesale order ${orderNum} for ৳${orderData.totalAmount.toLocaleString()} has been placed.`,
      type: 'ORDER',
      timestamp: 'Just now',
      read: false,
      linkId: orderId,
    };
    setNotifications([newNotif, ...notifications]);

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, note?: string) => {
    apiService.updateOrderStatus(orderId, status, note).catch(() => {});
    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        const updatedTimeline = ord.timeline.map(t => {
          if (t.status === status) {
            return {
              ...t,
              completed: true,
              timestamp: 'Just now',
              note: note || t.note,
            };
          }
          return t;
        });
        return {
          ...ord,
          status,
          timeline: updatedTimeline,
        };
      }
      return ord;
    });
    setOrders(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
  };

  // Pay Due / কিস্তি পরিশোধ
  const payDueInstallment = async (
    companyId: string,
    companyName: string,
    amount: number,
    channel: PaymentChannel,
    orderId?: string
  ): Promise<LedgerEntry> => {
    const buyerId = user ? user.id : 'seller_bismillah';
    const buyerName = user ? user.name : 'Al-Haj Rafiqul Islam';
    const buyerShopName = user ? user.businessName : 'Bismillah Electric Store';

    // Calculate current due for company
    const currentDue = ledger
      .filter(l => l.companyId === companyId && l.buyerId === buyerId)
      .reduce((acc, curr) => {
        if (curr.type === 'PURCHASE') return acc + curr.dueAmount;
        if (curr.type === 'PAYMENT') return acc - curr.paidAmount;
        return acc;
      }, 0);

    const paymentEntry: LedgerEntry = {
      id: `led_pay_${Date.now()}`,
      orderId,
      buyerId,
      buyerName,
      buyerShopName,
      companyId,
      companyName,
      totalAmount: 0,
      paidAmount: amount,
      dueAmount: 0,
      previousBalance: currentDue,
      newBalance: Math.max(0, currentDue - amount),
      type: 'PAYMENT',
      paymentChannel: channel,
      referenceReceiptNo: `PAY-RCP-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      timestamp: Date.now(),
      note: `Installment due payment of ৳${amount.toLocaleString()} received via ${channel}. Remaining balance: ৳${Math.max(0, currentDue - amount).toLocaleString()}`,
    };

    const updatedLedger = [paymentEntry, ...ledger];
    setLedger(updatedLedger);
    await AsyncStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(updatedLedger));

    // Sync with VoltMart backend API
    apiService.payLedgerInstallment({
      sellerId: buyerId,
      companyId,
      amount,
      paymentMethod: channel,
      orderId,
      notes: paymentEntry.note,
    }).catch(() => {});

    // Add payment notification
    const payNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: 'Payment Received ✅',
      message: `Due installment of ৳${amount.toLocaleString()} paid to ${companyName} via ${channel}.`,
      type: 'PAYMENT',
      timestamp: 'Just now',
      read: false,
    };
    setNotifications([payNotif, ...notifications]);

    return paymentEntry;
  };

  // Ledger summary calculations
  const sellerLedgerEntries = React.useMemo(() => {
    const currentBuyerId = user?.role === 'SELLER' ? user.id : 'seller_bismillah';
    return ledger.filter(l => l.buyerId === currentBuyerId);
  }, [ledger, user]);

  const companyWiseLedgerList: CompanyLedgerSummary[] = React.useMemo(() => {
    const map: Record<string, CompanyLedgerSummary> = {};

    mockCompanies.forEach(c => {
      map[c.id] = {
        companyId: c.id,
        companyName: c.businessName,
        totalPurchased: 0,
        totalPaid: 0,
        totalDue: 0,
        lastTransactionDate: '-',
        orderCount: 0,
      };
    });

    sellerLedgerEntries.forEach(item => {
      if (!map[item.companyId]) {
        map[item.companyId] = {
          companyId: item.companyId,
          companyName: item.companyName,
          totalPurchased: 0,
          totalPaid: 0,
          totalDue: 0,
          lastTransactionDate: item.date,
          orderCount: 0,
        };
      }
      if (item.type === 'PURCHASE') {
        map[item.companyId].totalPurchased += item.totalAmount;
        map[item.companyId].totalPaid += item.paidAmount;
        map[item.companyId].totalDue += item.dueAmount;
        map[item.companyId].orderCount += 1;
        map[item.companyId].lastTransactionDate = item.date;
      } else if (item.type === 'PAYMENT') {
        map[item.companyId].totalPaid += item.paidAmount;
        map[item.companyId].totalDue = Math.max(0, map[item.companyId].totalDue - item.paidAmount);
        map[item.companyId].lastTransactionDate = item.date;
      }
    });

    return Object.values(map);
  }, [sellerLedgerEntries]);

  const sellerTotalPurchased = React.useMemo(() => {
    return companyWiseLedgerList.reduce((acc, curr) => acc + curr.totalPurchased, 0);
  }, [companyWiseLedgerList]);

  const sellerTotalPaid = React.useMemo(() => {
    return companyWiseLedgerList.reduce((acc, curr) => acc + curr.totalPaid, 0);
  }, [companyWiseLedgerList]);

  const sellerTotalDue = React.useMemo(() => {
    return companyWiseLedgerList.reduce((acc, curr) => acc + curr.totalDue, 0);
  }, [companyWiseLedgerList]);

  // Company Dashboard Computations
  const loggedCompanyId = user?.role === 'COMPANY' ? user.id : 'comp_superstar';

  const companyProducts = React.useMemo(() => {
    return products.filter(p => p.companyId === loggedCompanyId);
  }, [products, loggedCompanyId]);

  const companyOrders = React.useMemo(() => {
    return orders.filter(o => o.companyId === loggedCompanyId);
  }, [orders, loggedCompanyId]);

  const companyTotalRevenue = React.useMemo(() => {
    return companyOrders.reduce((acc, o) => acc + o.paidAmount, 0);
  }, [companyOrders]);

  const companyTotalDueReceivable = React.useMemo(() => {
    return companyOrders.reduce((acc, o) => acc + o.dueAmount, 0);
  }, [companyOrders]);

  const companyPendingOrdersCount = React.useMemo(() => {
    return companyOrders.filter(o => o.status === 'placed' || o.status === 'confirmed').length;
  }, [companyOrders]);

  // Notifications
  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const t = translations[language];
  const colors = themeMode === 'light' ? lightColors : darkColors;

  return (
    <StoreContext.Provider
      value={{
        user,
        role,
        isOnboarded,
        login,
        signup,
        logout,
        switchRole,
        setOnboarded,
        language,
        t,
        setLanguage,
        toggleLanguage,
        themeMode,
        colors,
        toggleThemeMode,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleHideProduct,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        wishlist,
        toggleWishlist,
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        orders,
        createOrder,
        updateOrderStatus,
        ledger,
        payDueInstallment,
        companyWiseLedgerList,
        sellerTotalPurchased,
        sellerTotalPaid,
        sellerTotalDue,
        companyProducts,
        companyOrders,
        companyTotalRevenue,
        companyTotalDueReceivable,
        companyPendingOrdersCount,
        notifications,
        markAllNotificationsRead,
        unreadNotificationsCount,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
