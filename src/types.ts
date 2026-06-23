export interface Merchant {
  id: string;
  businessName: string;
  ownerName: string;
  mobile: string;
  email: string;
  gstNumber: string;
  panNumber: string;
  bankAccount: string;
  bankName: string;
  ifscCode: string;
  upiId: string;
  status: 'Pending' | 'Active' | 'Suspended';
  apiKey: string;
  webhookUrl: string;
  createdAt: string;
  kycSubmitted: boolean;
  kycApprovedAt: string | null;
}

export interface Transaction {
  id: string;
  merchantId: string;
  merchantName: string;
  customerName: string;
  amount: number;
  upiId: string;
  paymentMethod: 'QR Code' | 'UPI ID' | 'UPI Intent' | 'Collect Request';
  status: 'Success' | 'Failed' | 'Processing' | 'Pending';
  createdAt: string;
  riskScore: number; // 0 to 100
  riskAnalysis: string;
  isRefunded: boolean;
  refundedAt: string | null;
}

export interface Settlement {
  id: string;
  merchantId: string;
  merchantName: string;
  amount: number;
  bankAccount: string;
  upiId: string;
  status: 'Pending' | 'Completed';
  requestedAt: string;
  settledAt: string | null;
  utr: string | null;
}

export interface FraudLog {
  id: string;
  ipAddress: string;
  device: string;
  merchantName: string;
  amount: number;
  riskRating: 'Low' | 'Medium' | 'High' | 'Critical';
  reason: string;
  createdAt: string;
  location: string;
}

export interface AdminStats {
  totalTransactions: number;
  totalRevenue: number;
  activeMerchants: number;
  pendingSettlements: number;
  successfulPayments: number;
  failedPayments: number;
}
