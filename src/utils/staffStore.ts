export interface StaffMember {
  id: string;
  name: string;
  phone: string;
  role: "Head Chef" | "Assistant Cook" | "Kitchen Helper" | "Packaging Staff" | "Delivery Rider" | "Store Manager";
  idProof: string; // Aadhaar / Voter ID Number
  joiningDate: string;
  salaryType: "monthly" | "daily";
  baseSalary: number; // Monthly fixed or per-day wage
  shift: "Morning (6 AM - 2 PM)" | "Evening (2 PM - 10 PM)" | "Full Day (8 AM - 8 PM)";
  hubLocation: string; // e.g. Central Kitchen KP-3, Galgotias Hub
  status: "active" | "on_leave" | "inactive";
  createdAt: string;
}

export interface SalaryPayment {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: string;
  monthYear: string;
  daysWorked: number;
  baseSalary: number;
  advanceDeducted: number;
  netPaid: number;
  paymentMode: "UPI" | "Cash" | "Bank Transfer";
  paidAt: string;
  remarks?: string;
}

const STAFF_STORAGE_KEY = "bmb_staff_directory_v1";
const SALARY_STORAGE_KEY = "bmb_salary_ledger_v1";

const DEFAULT_STAFF: StaffMember[] = [
  {
    id: "STF-101",
    name: "Rameshwar Singh",
    phone: "9876543210",
    role: "Head Chef",
    idProof: "AADHAAR-8921-3412-9012",
    joiningDate: "2026-01-10",
    salaryType: "monthly",
    baseSalary: 22000,
    shift: "Full Day (8 AM - 8 PM)",
    hubLocation: "Central Kitchen, KP-3",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "STF-102",
    name: "Vikas Kumar",
    phone: "9811223344",
    role: "Delivery Rider",
    idProof: "AADHAAR-5541-9922-1100",
    joiningDate: "2026-02-01",
    salaryType: "monthly",
    baseSalary: 14000,
    shift: "Morning (6 AM - 2 PM)",
    hubLocation: "Galgotias Gate 1 & 2 Hub",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "STF-103",
    name: "Suresh Rawat",
    phone: "9911883322",
    role: "Kitchen Helper",
    idProof: "AADHAAR-7711-2233-4455",
    joiningDate: "2026-03-01",
    salaryType: "daily",
    baseSalary: 550,
    shift: "Morning (6 AM - 2 PM)",
    hubLocation: "Central Kitchen, KP-3",
    status: "active",
    createdAt: new Date().toISOString(),
  },
];

export const getStoredStaff = (): StaffMember[] => {
  try {
    const data = localStorage.getItem(STAFF_STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_STAFF;
  } catch {
    return DEFAULT_STAFF;
  }
};

export const addStaffMember = (member: Omit<StaffMember, "id" | "createdAt">): StaffMember => {
  const newStaff: StaffMember = {
    ...member,
    id: "STF-" + Math.floor(100 + Math.random() * 900),
    createdAt: new Date().toISOString(),
  };
  const existing = getStoredStaff();
  const updated = [newStaff, ...existing];
  localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("bmb_staff_updated"));
  return newStaff;
};

export const updateStaffStatus = (staffId: string, status: "active" | "on_leave" | "inactive"): void => {
  const existing = getStoredStaff();
  const updated = existing.map((st) => (st.id === staffId ? { ...st, status } : st));
  localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("bmb_staff_updated"));
};

export const deleteStaffMember = (staffId: string): void => {
  const existing = getStoredStaff();
  const updated = existing.filter((st) => st.id !== staffId);
  localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("bmb_staff_updated"));
};

export const getStoredSalaryLedger = (): SalaryPayment[] => {
  try {
    const data = localStorage.getItem(SALARY_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const recordSalaryPayment = (payment: Omit<SalaryPayment, "id" | "paidAt">): SalaryPayment => {
  const now = new Date();
  const newPayment: SalaryPayment = {
    ...payment,
    id: "PAY-" + Math.floor(1000 + Math.random() * 9000),
    paidAt: now.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
  };
  const existing = getStoredSalaryLedger();
  const updated = [newPayment, ...existing];
  localStorage.setItem(SALARY_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("bmb_payroll_updated"));
  return newPayment;
};
