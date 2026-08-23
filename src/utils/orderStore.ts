export type OrderStatus = "pending" | "approved" | "out_for_delivery" | "delivered" | "rejected";

export type CityLocation = "Greater Noida" | "Noida";

export interface OrderItem {
  id: string;
  customerName: string;
  phone: string;
  city: CityLocation;
  address: string;
  mealPlan: string;
  planType: "Daily" | "Monthly" | "Trial";
  slot: "Lunch" | "Dinner" | "Both (Lunch & Dinner)";
  mealAmount: number;
  deliveryCharge: number;
  amount: number;
  estimatedTime: string;
  utrNumber: string;
  paymentSlip: string;
  status: OrderStatus;
  rejectionReason?: string;
  createdAt: string;
}

const ORDER_STORAGE_KEY = "bmb_cloud_orders_database_v3";

export const getStoredOrders = (): OrderItem[] => {
  try {
    const data = localStorage.getItem(ORDER_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const createOrder = (orderData: Omit<OrderItem, "id" | "status" | "createdAt">): OrderItem => {
  const newOrder: OrderItem = {
    ...orderData,
    id: "BMB-" + Math.floor(100000 + Math.random() * 900000),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const existing = getStoredOrders();
  const updated = [newOrder, ...existing];
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("bmb_orders_updated"));
  return newOrder;
};

export const updateOrderStatus = (orderId: string, status: OrderStatus, rejectionReason?: string): void => {
  const existing = getStoredOrders();
  const updated = existing.map((ord) => {
    if (ord.id === orderId) {
      return { ...ord, status, rejectionReason: status === "rejected" ? rejectionReason : undefined };
    }
    return ord;
  });
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("bmb_orders_updated"));
};
