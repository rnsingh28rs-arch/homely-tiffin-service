export type CityLocation = "Greater Noida" | "Noida";
export type OrderStatus = "pending" | "approved" | "out_for_delivery" | "delivered" | "rejected";

export interface OrderItem {
  id: string;
  customerName: string;
  phone: string;
  city: CityLocation;
  address: string;
  mealPlan: string;
  planType: "Daily" | "Monthly";
  slot: "Lunch" | "Dinner";
  mealAmount: number;
  deliveryCharge: number;
  amount: number;
  estimatedTime: string;
  utrNumber: string;
  paymentSlip?: string;
  status: OrderStatus;
  createdAt: string;
  timestamp: number;
}

const ORDERS_STORAGE_KEY = "bmb_orders_clean_queue_v910";

export const getStoredOrders = (): OrderItem[] => {
  try {
    const data = localStorage.getItem(ORDERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveStoredOrders = (orders: OrderItem[]): void => {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("bmb_orders_updated"));
};

export const createOrder = (orderData: Omit<OrderItem, "id" | "status" | "createdAt" | "timestamp">): OrderItem => {
  const newOrder: OrderItem = {
    ...orderData,
    id: "BMB-" + Math.floor(100000 + Math.random() * 900000),
    status: "pending",
    createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    timestamp: Date.now(),
  };

  const existing = getStoredOrders();
  const updated = [newOrder, ...existing];
  saveStoredOrders(updated);
  return newOrder;
};

export const updateOrderStatus = (orderId: string, newStatus: OrderStatus): void => {
  const existing = getStoredOrders();
  const updated = existing.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord));
  saveStoredOrders(updated);
};
