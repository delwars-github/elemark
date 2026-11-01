import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Order, LedgerEntry, User } from '../types';

const API_STORAGE_KEY = '@voltmart_custom_api_url';

// Default endpoints: Live Render Cloud API is primary, followed by Android Emulator & LAN fallbacks
const DEFAULT_URLS = [
  'https://elemark-api-1.onrender.com/api',
  'http://10.0.2.2:5000/api',
  'http://192.168.0.100:5000/api',
  'http://localhost:5000/api',
];

let activeApiUrl: string = DEFAULT_URLS[0];

export const getApiUrl = async (): Promise<string> => {
  try {
    const saved = await AsyncStorage.getItem(API_STORAGE_KEY);
    if (saved) {
      const sanitized = saved.replace('elemark-api.onrender.com', 'elemark-api-1.onrender.com');
      activeApiUrl = sanitized;
      return sanitized;
    }
  } catch (e) {
    // ignore
  }
  return activeApiUrl;
};

export const setApiUrl = async (url: string): Promise<void> => {
  activeApiUrl = url;
  await AsyncStorage.setItem(API_STORAGE_KEY, url);
};

// Helper fetch with timeout
const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const baseUrl = await getApiUrl();
  const fullUrl = `${baseUrl.replace(/\/$/, '')}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `API error ${response.status}`);
    }
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Transform API Product -> Elemark Product format
export const normalizeProduct = (apiProd: any): Product => {
  return {
    id: apiProd.id,
    companyId: apiProd.companyId || 'comp_brb',
    companyName: apiProd.companyName || 'BRB Cable Industries Ltd',
    companyLogo: apiProd.companyLogo || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=120&auto=format&fit=crop&q=80',
    title: apiProd.title,
    brand: apiProd.brand || 'BRB',
    category: apiProd.category || 'Cables & Wires',
    description: apiProd.description || '',
    features: Array.isArray(apiProd.features) ? apiProd.features : [],
    pricePerUnit: apiProd.unitPrice ?? apiProd.pricePerUnit ?? 0,
    wholesalePrice: apiProd.wholesalePrice ?? 0,
    moq: apiProd.moq ?? 1,
    stockQuantity: apiProd.stock ?? apiProd.stockQuantity ?? 100,
    unitType: apiProd.unitType || 'piece',
    warrantyDuration: apiProd.warranty ?? apiProd.warrantyDuration ?? '1 Year Warranty',
    discountPercentage: apiProd.discountPercent ?? apiProd.discountPercentage ?? 0,
    tags: Array.isArray(apiProd.tags) ? apiProd.tags : [],
    images: Array.isArray(apiProd.images) && apiProd.images.length > 0
      ? apiProd.images
      : ['https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=500&auto=format&fit=crop&q=80'],
    rating: apiProd.rating ?? 4.8,
    reviewsCount: apiProd.reviewCount ?? apiProd.reviewsCount ?? 24,
    isHidden: apiProd.isHidden ?? false,
    isFlashDeal: apiProd.isFlashDeal ?? false,
    isBestSeller: apiProd.isBestSeller ?? true,
    isNewArrival: apiProd.isNewArrival ?? false,
  };
};

export const apiService = {
  // Health check
  checkHealth: async (): Promise<boolean> => {
    try {
      const data = await apiFetch('/health');
      return data?.status === 'ok';
    } catch {
      return false;
    }
  },

  // Products
  getProducts: async (params?: { category?: string; search?: string; companyId?: string }): Promise<Product[]> => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.companyId) query.append('companyId', params.companyId);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiFetch(`/products${qs}`);
    if (res.success && Array.isArray(res.products)) {
      return res.products.map(normalizeProduct);
    }
    return [];
  },

  getProductById: async (id: string): Promise<Product | null> => {
    try {
      const res = await apiFetch(`/products/${id}`);
      return res.product ? normalizeProduct(res.product) : null;
    } catch {
      return null;
    }
  },

  createProduct: async (productData: Partial<Product>): Promise<Product> => {
    const payload = {
      ...productData,
      unitPrice: productData.pricePerUnit,
      stock: productData.stockQuantity,
      warranty: productData.warrantyDuration,
      discountPercent: productData.discountPercentage,
    };
    const res = await apiFetch('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeProduct(res.product);
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product> => {
    const payload: any = { ...updates };
    if (updates.pricePerUnit !== undefined) payload.unitPrice = updates.pricePerUnit;
    if (updates.stockQuantity !== undefined) payload.stock = updates.stockQuantity;
    if (updates.warrantyDuration !== undefined) payload.warranty = updates.warrantyDuration;
    if (updates.discountPercentage !== undefined) payload.discountPercent = updates.discountPercentage;

    const res = await apiFetch(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return normalizeProduct(res.product);
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    const res = await apiFetch(`/products/${id}`, { method: 'DELETE' });
    return !!res.success;
  },

  // Orders
  getOrders: async (filter?: { sellerId?: string; companyId?: string; status?: string }): Promise<Order[]> => {
    const query = new URLSearchParams();
    if (filter?.sellerId) query.append('sellerId', filter.sellerId);
    if (filter?.companyId) query.append('companyId', filter.companyId);
    if (filter?.status) query.append('status', filter.status);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiFetch(`/orders${qs}`);
    return res.orders || [];
  },

  createOrder: async (orderData: any): Promise<Order> => {
    const res = await apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return res.order;
  },

  updateOrderStatus: async (orderId: string, status: string, note?: string): Promise<Order> => {
    const res = await apiFetch(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
    return res.order;
  },

  // Ledger & Payments
  getLedger: async (sellerId?: string): Promise<LedgerEntry[]> => {
    const qs = sellerId ? `?sellerId=${sellerId}` : '';
    const res = await apiFetch(`/ledger${qs}`);
    return res.transactions || [];
  },

  payLedgerInstallment: async (payload: {
    sellerId: string;
    companyId: string;
    amount: number;
    paymentMethod: string;
    orderId?: string;
    notes?: string;
  }): Promise<any> => {
    const res = await apiFetch('/ledger/pay', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.transaction;
  },

  // Companies
  getCompanies: async (): Promise<any[]> => {
    const res = await apiFetch('/companies');
    return res.companies || [];
  },

  // Analytics
  getAnalytics: async (companyId?: string): Promise<any> => {
    const qs = companyId ? `?companyId=${companyId}` : '';
    const res = await apiFetch(`/analytics/dashboard${qs}`);
    return res.analytics || null;
  },
};

