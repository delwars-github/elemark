export type UserRole = 'COMPANY' | 'SELLER';

export type UnitType = 'piece' | 'box' | 'carton' | 'coil';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  businessName: string; // Shop Name for Seller, Company Name for Company
  phone: string;
  email: string;
  address: string;
  city: string;
  tradeLicense?: string;
  nid?: string;
  logo?: string;
  rating?: number;
  creditLimit: number;
  availableCredit: number;
  verified: boolean;
  joinedDate: string;
}

export type ProductCategory =
  | 'Cables & Wires'
  | 'Switches & Sockets'
  | 'Circuit Breakers & MCB'
  | 'LED Lighting & Fixtures'
  | 'Distribution Boxes & DB'
  | 'Conduits & Fittings'
  | 'Fans & Ventilation'
  | 'Solar & Inverters'
  | 'Electrician Tools & Meters'
  | 'Earthing & Lightning';

export interface Product {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  brand: string;
  category: ProductCategory;
  description: string;
  features: string[];
  pricePerUnit: number; // Retail / MRP
  wholesalePrice: number; // Wholesale bulk price
  moq: number; // Minimum Order Quantity
  stockQuantity: number;
  unitType: UnitType;
  warrantyDuration: string; // e.g. "12 Months Replacement", "2 Years Guarantee"
  discountPercentage: number;
  tags: string[];
  images: string[];
  rating: number;
  reviewsCount: number;
  isHidden?: boolean;
  isFlashDeal?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export type PaymentMethod =
  | 'full'
  | 'partial'
  | 'due'
  | 'cod'
  | 'bkash'
  | 'nagad'
  | 'rocket'
  | 'bank';

export type PaymentChannel = 'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer' | 'Cash on Delivery';

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderTimelineItem {
  status: OrderStatus;
  label: string;
  timestamp: string;
  completed: boolean;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  buyerShopName: string;
  buyerPhone: string;
  buyerAddress: string;
  companyId: string;
  companyName: string;
  items: CartItem[];
  subtotal: number;
  bulkDiscount: number;
  couponDiscount: number;
  deliveryCharge: number;
  vatAmount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  paymentChannel: PaymentChannel;
  paymentStatus: 'PAID' | 'PARTIAL' | 'DUE';
  status: OrderStatus;
  timeline: OrderTimelineItem[];
  createdAt: string;
  invoiceNumber: string;
  notes?: string;
}

export interface LedgerEntry {
  id: string;
  orderId?: string;
  buyerId: string;
  buyerName: string;
  buyerShopName: string;
  companyId: string;
  companyName: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  previousBalance: number;
  newBalance: number;
  type: 'PURCHASE' | 'PAYMENT' | 'ADJUSTMENT';
  paymentChannel?: PaymentChannel;
  referenceReceiptNo?: string;
  date: string;
  timestamp: number;
  note?: string;
  productSummary?: string;
}

export interface CompanyLedgerSummary {
  companyId: string;
  companyName: string;
  totalPurchased: number;
  totalPaid: number;
  totalDue: number;
  lastTransactionDate: string;
  orderCount: number;
}

export interface SellerLedgerSummary {
  buyerId: string;
  buyerShopName: string;
  buyerName: string;
  buyerPhone: string;
  totalPurchased: number;
  totalPaid: number;
  totalDue: number;
  lastPaymentDate: string;
  orderCount: number;
}

export interface PaymentReceipt {
  id: string;
  receiptNo: string;
  orderId?: string;
  buyerId: string;
  buyerName: string;
  companyId: string;
  companyName: string;
  amountPaid: number;
  previousDue: number;
  remainingDue: number;
  paymentChannel: PaymentChannel;
  date: string;
  status: 'CONFIRMED' | 'PENDING';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: UserRole;
  receiverId: string;
  text: string;
  timestamp: string;
  read: boolean;
  productContext?: {
    id: string;
    title: string;
    image: string;
    price: number;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'ORDER' | 'PAYMENT' | 'DUE' | 'PROMO' | 'SYSTEM';
  timestamp: string;
  read: boolean;
  linkId?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  buyerName: string;
  buyerShop: string;
  rating: number;
  comment: string;
  date: string;
  verifiedBuyer: boolean;
}

export type Language = 'en' | 'bn';
export type ThemeMode = 'light' | 'dark';

