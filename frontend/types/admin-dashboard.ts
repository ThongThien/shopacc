export interface AdminDashboard {
  adminBalance: number;
  revenueThisMonth: number;
  revenueAllTime: number;
  totalUsers: number;
  totalListings: number;
  publishedListings: number;
  soldListings: number;
  totalOrders: number;
  ordersThisMonth: number;
  topOrders: AdminTopOrder[];
}

export interface AdminTopOrder {
  orderId: number;
  orderCode: string;
  username: string;
  totalPrice: number;
  createdAt: string;
}
