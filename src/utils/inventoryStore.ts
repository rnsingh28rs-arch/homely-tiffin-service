export interface GroceryItem {
  id: string;
  name: string;
  qty: number;
  unit: "Kg" | "Litre" | "Pack" | "Dozen";
  ratePerUnit: number;
  totalCost: number;
}

export interface FundRequest {
  id: string;
  date: string;
  formattedTimestamp: string;
  requestedBy: "Chef" | "Manager";
  items: GroceryItem[];
  totalBudget: number;
  status: "pending" | "approved" | "rejected";
  adminRemarks?: string;
  approvedAt?: string;
}

const INVENTORY_STORAGE_KEY = "bmb_kitchen_funds_inventory_v1";

const DEFAULT_REQUESTS: FundRequest[] = [
  {
    id: "REQ-101",
    date: new Date().toISOString().split("T")[0],
    formattedTimestamp: "Today, Morning Shift",
    requestedBy: "Manager",
    items: [
      { id: "1", name: "Fresh Potatoes (Aloo)", qty: 20, unit: "Kg", ratePerUnit: 22, totalCost: 440 },
      { id: "2", name: "Premium Paneer", qty: 5, unit: "Kg", ratePerUnit: 340, totalCost: 1700 },
      { id: "3", name: "Chakki Fresh Atta", qty: 25, unit: "Kg", ratePerUnit: 36, totalCost: 900 },
      { id: "4", name: "Mustard Oil", qty: 5, unit: "Litre", ratePerUnit: 145, totalCost: 725 },
    ],
    totalBudget: 3765,
    status: "approved",
    adminRemarks: "Approved for Knowledge Park Kitchen Mandi Purchase",
    approvedAt: "Today, 08:30:15 AM",
  },
];

export const getStoredFundRequests = (): FundRequest[] => {
  try {
    const data = localStorage.getItem(INVENTORY_STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_REQUESTS;
  } catch {
    return DEFAULT_REQUESTS;
  }
};

export const createFundRequest = (
  items: GroceryItem[],
  requestedBy: "Chef" | "Manager"
): FundRequest => {
  const total = items.reduce((sum, item) => sum + item.totalCost, 0);
  const now = new Date();
  const newReq: FundRequest = {
    id: "REQ-" + Math.floor(100 + Math.random() * 900),
    date: now.toISOString().split("T")[0],
    formattedTimestamp: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    requestedBy,
    items,
    totalBudget: total,
    status: "pending",
  };

  const existing = getStoredFundRequests();
  const updated = [newReq, ...existing];
  localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("bmb_inventory_updated"));
  return newReq;
};

export const updateFundRequestStatus = (
  reqId: string,
  status: "approved" | "rejected",
  adminRemarks?: string
): void => {
  const existing = getStoredFundRequests();
  const now = new Date();
  const updated = existing.map((req) => {
    if (req.id === reqId) {
      return {
        ...req,
        status,
        adminRemarks,
        approvedAt: status === "approved" ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : undefined,
      };
    }
    return req;
  });
  localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("bmb_inventory_updated"));
};
