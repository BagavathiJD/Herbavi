export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  measurementId: string; // references Measurement
  price: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface Measurement {
  id: string;
  name: string;
  status: 'Enabled' | 'Disabled';
  createdAt: string;
}

export interface ProductName {
  id: string;
  name: string;
  status: 'Enabled' | 'Disabled';
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  measurementName: string;
  price: number;
  totalAmount: number;
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  orderDate: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpend: number;
  status: 'Active' | 'Blocked';
  joinDate: string;
}

export interface SqlQueryLog {
  id: string;
  query: string;
  executedAt: string;
  durationMs: number;
  success: boolean;
  error?: string;
}

export interface DbMetrics {
  totalQueries: number;
  connectionPool: number;
  storageSizeKb: number;
  activeTransactions: number;
}

export interface AppUser {
  id: string;
  userName: string;
  email: string;
  phoneNumber: string;
  role: 'Admin' | 'Staff';
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Admin' | 'Staff';
  createdAt: string;
}
