import React, { useState, useMemo } from 'react';
import { 
  Users, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Compass, 
  Search, 
  UserCheck, 
  ShieldAlert, 
  Sliders, 
  TrendingUp, 
  Terminal, 
  LogOut, 
  Activity, 
  CreditCard, 
  Download, 
  RefreshCcw, 
  ArrowUpRight,
  Sparkles,
  Zap,
  Lock,
  Check,
  UserX
} from 'lucide-react';
import { 
  AreaChart, Area, 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Merchant, Transaction, Settlement, FraudLog } from '../types';

interface AdminDashboardProps {
  merchants: Merchant[];
  transactions: Transaction[];
  settlements: Settlement[];
  fraudLogs: FraudLog[];
  onApproveMerchant: (merchantId: string) => void;
  onSuspendMerchant: (merchantId: string) => void;
  onProcessSettlement: (settlementId: string) => void;
  onRefundPayment: (transactionId: string) => void;
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

export default function AdminDashboard({
  merchants,
  transactions,
  settlements,
  fraudLogs,
  onApproveMerchant,
  onSuspendMerchant,
  onProcessSettlement,
  onRefundPayment,
  onLogout,
  onNavigate
}: AdminDashboardProps) {
  
  const [activeTab, setActiveTab] = useState<'overview' | 'merchants' | 'settlements' | 'transactions' | 'security' | 'settings'>('overview');
  
  // Filtering & Search states
  const [merchantSearch, setMerchantSearch] = useState<string>('');
  const [txnSearch, setTxnSearch] = useState<string>('');
  const [txnStatusFilter, setTxnStatusFilter] = useState<string>('all');

  // Security filters
  const [ipRiskFilter, setIpRiskFilter] = useState<string>('all');
  const [exportStatus, setExportStatus] = useState<string>('');

  // Compute stats across database
  const stats = useMemo(() => {
    const successPayments = transactions.filter(t => t.status === 'Success');
    const totalRevenue = successPayments.reduce((acc, t) => acc + t.amount, 0);
    const activeMerCount = merchants.filter(m => m.status === 'Active').length;
    const pendingSettleCount = settlements.filter(s => s.status === 'Pending').length;
    
    return {
      totalVolume: transactions.length,
      totalRevenue,
      successVolume: successPayments.length,
      failedVolume: transactions.filter(t => t.status === 'Failed').length,
      activeMerchants: activeMerCount,
      pendingSettlements: pendingSettleCount,
      totalMerchants: merchants.length
    };
  }, [transactions, merchants, settlements]);

  // Prepared chart analytics for admin
  // 1. Daily revenue trend
  const dailyChartData = useMemo(() => {
    const sorted = [...transactions].reverse();
    const map: Record<string, { success: number; failed: number }> = {};
    
    sorted.forEach(tx => {
      const dateStr = new Date(tx.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      if (!map[dateStr]) {
        map[dateStr] = { success: 0, failed: 0 };
      }
      if (tx.status === 'Success') {
        map[dateStr].success += tx.amount;
      } else if (tx.status === 'Failed') {
        map[dateStr].failed += tx.amount;
      }
    });

    return Object.keys(map).slice(-7).map(k => ({
      name: k,
      Revenue: map[k].success,
      Loss: map[k].failed,
    }));
  }, [transactions]);

  // 2. Settlement stats
  const settlementBarData = useMemo(() => {
    const completed = settlements.filter(s => s.status === 'Completed').reduce((acc, s) => acc + s.amount, 0);
    const pending = settlements.filter(s => s.status === 'Pending').reduce((acc, s) => acc + s.amount, 0);
    
    return [
      { name: 'Completed Cashflow', Amount: completed },
      { name: 'Pending Settlements', Amount: pending }
    ];
  }, [settlements]);

  // 3. Payment methods distribution
  const paymentMethodPieData = useMemo(() => {
    const map: Record<string, number> = {
      'QR Code': 0,
      'UPI ID': 0,
      'UPI Intent': 0,
      'Collect Request': 0,
    };
    transactions.forEach(t => {
      if (t.status === 'Success') {
        map[t.paymentMethod] = (map[t.paymentMethod] || 0) + 1;
      }
    });
    return Object.keys(map).map(k => ({
      name: k,
      value: map[k]
    }));
  }, [transactions]);

  const COLORS = ['#6366f1', '#06b6d4', '#a855f7', '#ec4899'];

  // Handle Export CSV simulation
  const handleExportDataSim = () => {
    setExportStatus("Compiling transaction ledger parameters...");
    setTimeout(() => {
      setExportStatus("CSV generated successfully: UPI_Payment_Gateway_Ledger_Export.csv");
      setTimeout(() => {
        setExportStatus("");
      }, 4000);
    }, 1500);
  };

  // Filter lists based on search
  const filteredMerchants = useMemo(() => {
    return merchants.filter(m => 
      m.businessName.toLowerCase().includes(merchantSearch.toLowerCase()) ||
      m.ownerName.toLowerCase().includes(merchantSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(merchantSearch.toLowerCase())
    );
  }, [merchants, merchantSearch]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = 
        t.customerName.toLowerCase().includes(txnSearch.toLowerCase()) ||
        t.merchantName.toLowerCase().includes(txnSearch.toLowerCase()) ||
        t.id.toLowerCase().includes(txnSearch.toLowerCase());
      
      const matchStatus = 
        txnStatusFilter === 'all' || 
        (txnStatusFilter === 'refunded' && t.isRefunded) ||
        t.status.toLowerCase() === txnStatusFilter.toLowerCase();
      
      return matchSearch && matchStatus;
    });
  }, [transactions, txnSearch, txnStatusFilter]);

  const filteredFraudLogs = useMemo(() => {
    if (ipRiskFilter === 'all') return fraudLogs;
    return fraudLogs.filter(f => f.riskRating.toLowerCase() === ipRiskFilter.toLowerCase());
  }, [fraudLogs, ipRiskFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Admin Title Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="text-xl md:text-2xl font-black text-slate-950 dark:text-white flex items-center space-x-2.5">
            <Sliders className="w-6 h-6 text-indigo-500 shrink-0" />
            <span>Admin Control Cabinet</span>
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
            Authority node: <strong className="font-bold">SYSTEM ADMIN</strong> &bull; Host ports routing: ACTIVE
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            id="admin-btn-sim"
            onClick={() => onNavigate('pay')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer hover:shadow-lg"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Open Payment Sandbox Simulator</span>
          </button>

          <button
            type="button"
            id="admin-btn-logout"
            onClick={onLogout}
            className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-slate-655 dark:text-slate-350 transition flex items-center space-x-1.5 cursor-pointer text-xs font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Control Node</span>
          </button>
        </div>
      </div>

      {/* ADMIN TAB NAVIGATION */}
      <div className="flex overflow-x-auto space-x-1 border-b border-slate-150 dark:border-slate-850 pb-px mb-8 scrollbar-none">
        {(['overview', 'merchants', 'settlements', 'transactions', 'security', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            id={`a-tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-xs font-bold tracking-wide capitalize whitespace-nowrap transition-all border-b-2 outline-none cursor-pointer ${
              activeTab === tab
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* -------------------- OVERVIEW MODULE -------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Stats Panels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
            
            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Total Revenue</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">₹{stats.totalRevenue.toLocaleString('en-IN')}</h3>
              <span className="text-[9px] text-emerald-500 block mt-2 font-bold flex items-center space-x-0.5">
                <CheckCircle className="w-3 h-3 text-emerald-500 inline mr-1" />
                <span>MDR Captured</span>
              </span>
            </div>

            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Total Txs</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">{stats.totalVolume}</h3>
              <span className="text-[9px] text-indigo-500 block mt-2 font-bold">
                Success rate: {stats.totalVolume ? Math.round((stats.successVolume / stats.totalVolume) * 100) : 100}%
              </span>
            </div>

            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Active Merchants</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">{stats.activeMerchants}</h3>
              <span className="text-[9px] text-slate-450 block mt-2 font-semibold">Total firms: {stats.totalMerchants}</span>
            </div>

            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-sm bg-gradient-to-tr from-amber-50 to-white dark:from-amber-950/10 dark:to-slate-950">
              <span className="text-[10px] uppercase font-bold text-amber-600">Pending Settlement</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">{stats.pendingSettlements}</h3>
              <button 
                type="button" 
                onClick={() => setActiveTab('settlements')}
                className="text-[9px] text-amber-600 block mt-2 font-black uppercase hover:underline"
              >
                Clear Ledger &rarr;
              </button>
            </div>

            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Payments Success</span>
              <h3 className="text-xl font-black text-emerald-600 mt-1">{stats.successVolume}</h3>
              <span className="text-[9px] text-slate-450 block mt-2 font-semibold">Fully settled dynamic checkouts</span>
            </div>

            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Payments Failed</span>
              <h3 className="text-xl font-black text-red-600 mt-1">{stats.failedVolume}</h3>
              <span className="text-[9px] text-slate-450 block mt-2 font-semibold">Includes connection expirations</span>
            </div>

          </div>

          {/* Graphical Analytics Section - Chart Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Area Chart: Revenue Trend */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">India-Wide Transaction Trends</h3>
                  <p className="text-[10px] text-slate-450">Active payments vs connection drops</p>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>Success Capital</span>
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span className="text-slate-400">Failed/Loss Block</span>
                </div>
              </div>

              <div className="h-[280px] text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAdminRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01}/>
                      </linearGradient>
                      <linearGradient id="colorAdminLoss" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" dark:stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="Revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAdminRev)" />
                    <Area type="monotone" dataKey="Loss" stroke="#f43f5e" strokeWidth={1.5} fillOpacity={1} fill="url(#colorAdminLoss)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Payment methods distribution */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Method Popularity</h3>
                <p className="text-[10px] text-slate-450 mb-6">Channel split across successful payments</p>

                <div className="h-[180px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {paymentMethodPieData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Legends list */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-900 mt-4 text-[10px]">
                {paymentMethodPieData.map((entry, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="truncate text-slate-650 dark:text-slate-300 font-medium">
                      {entry.name} ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* -------------------- MERCHANT MANAGEMENT -------------------- */}
      {activeTab === 'merchants' && (
        <div className="space-y-6">
          
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                id="search-merchants"
                value={merchantSearch}
                onChange={(e) => setMerchantSearch(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-white rounded-xl outline-none"
                placeholder="Search registered merchants (Business name, contact ID)"
              />
            </div>
            <span className="text-[10px] font-bold text-slate-450 uppercase">Displaying {filteredMerchants.length} merchants</span>
          </div>

          {/* Merchants Directory lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMerchants.map((mer) => (
              <div 
                key={mer.id}
                className="bg-white dark:bg-slate-950 rounded-2xl p-6 border border-slate-150 dark:border-slate-850 shadow-sm relative overflow-hidden"
              >
                {/* ID Tag top right */}
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                  <span className="font-mono text-[9px] font-bold text-slate-400">ID: {mer.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    mer.status === 'Active'
                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                      : mer.status === 'Pending'
                        ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 animate-pulse'
                        : 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                  }`}>
                    {mer.status}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white pr-20 text-sm">{mer.businessName}</h4>
                    <span className="text-[10px] text-slate-450 block mt-0.5">Promoter: <strong className="font-bold">{mer.ownerName}</strong> &bull; Registered {new Date(mer.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* KYC specifics */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-850 space-y-2 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-450">Contact Points:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{mer.email} &bull; +91 {mer.mobile}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">Identifiers:</span>
                      <strong className="text-slate-700 dark:text-slate-300 font-mono uppercase">PAN: {mer.panNumber} &bull; GSTIN: {mer.gstNumber || 'MICRO'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">Payout Node:</span>
                      <strong className="text-slate-700 dark:text-slate-300 font-mono">{mer.bankName} (Acct ending {mer.bankAccount?.slice(-4) || '5019'})</strong>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 dark:border-slate-900 justify-end">
                    {mer.status !== 'Active' && (
                      <button
                        type="button"
                        id={`btn-approve-${mer.id}`}
                        onClick={() => onApproveMerchant(mer.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all flex items-center space-x-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Approve Merchant &amp; KYC</span>
                      </button>
                    )}

                    {mer.status === 'Active' && (
                      <button
                        type="button"
                        id={`btn-suspend-${mer.id}`}
                        onClick={() => onSuspendMerchant(mer.id)}
                        className="px-3.5 py-1.5 border border-red-200 dark:border-red-950/40 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-650 dark:text-red-400 text-xs font-bold rounded-lg transition"
                      >
                        <UserX className="w-3.5 h-3.5 mr-1" />
                        <span>Suspend Account</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* -------------------- SETTLEMENTS LEDGER CLEARANCE -------------------- */}
      {activeTab === 'settlements' && (
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Active Settlement Queue</h3>
              <p className="text-[10px] text-slate-450 mt-0.5">Approve and compute dynamic bank transfers for instant merchant withdrawals.</p>
            </div>
            <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded">
              {stats.pendingSettlements} Actions Pending
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-[10px] font-bold uppercase tracking-wider text-slate-450 border-b border-slate-150 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Beneficiary Merchant</th>
                  <th className="px-4 py-3">Settlement Amount</th>
                  <th className="px-4 py-3">Requested Date</th>
                  <th className="px-4 py-3">Target Bank Detail</th>
                  <th className="px-4 py-3">Current Status</th>
                  <th className="px-4 py-3">Cabinet Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                {settlements.filter(s => s.status === 'Pending').length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-xs text-slate-450 italic">
                      No pending settlement requests. All withdrawal ledgers cleared!
                    </td>
                  </tr>
                ) : (
                  settlements.filter(s => s.status === 'Pending').map((set) => (
                    <tr key={set.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition">
                      <td className="px-4 py-3.5">
                        <strong className="text-xs block font-bold text-slate-950 dark:text-white">{set.merchantName}</strong>
                        <span className="text-[10px] text-slate-450 font-mono lowercase">{set.upiId}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <strong className="text-sm font-black text-slate-900 dark:text-white">₹{set.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                      </td>
                      <td className="px-4 py-3.5 text-slate-450">
                        {new Date(set.requestedAt).toLocaleDateString()} &bull; {new Date(set.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[10px] text-slate-600 dark:text-slate-400">
                        Acct: {set.bankAccount}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-100 dark:bg-amber-950/40 text-amber-700 animate-pulse">
                          Pending Setup
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          id={`btn-settle-${set.id}`}
                          onClick={() => onProcessSettlement(set.id)}
                          className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-lg text-xs font-bold tracking-wide transition cursor-pointer"
                        >
                          Approve Payout
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------- TRANSACTION MONITOR -------------------- */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs">
          
          {/* Controls table filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-900 pb-5">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Global UPI Ledger Logs</h3>
              <p className="text-[10px] text-slate-450 mt-0.5">Audit transaction details, triggers refunds, and exports reports.</p>
            </div>

            <div className="flex flex-wrap gap-2.5 items-center">
              
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  id="search-transactions"
                  value={txnSearch}
                  onChange={(e) => setTxnSearch(e.target.value)}
                  className="pl-8 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-white rounded-lg outline-none w-[180px]"
                  placeholder="ID, Customer, Firm"
                />
              </div>

              {/* Status selectors */}
              <select
                id="filter-txn-status"
                value={txnStatusFilter}
                onChange={(e) => setTxnStatusFilter(e.target.value)}
                className="text-xs px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg outline-none"
              >
                <option value="all">All statuses</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="processing">Processing</option>
                <option value="refunded">Refunded Payments</option>
              </select>

              {/* Export simulator CTA */}
              <button
                type="button"
                id="btn-export-csv"
                onClick={handleExportDataSim}
                className="px-3.5 py-1.5 border border-indigo-200 dark:border-indigo-850 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Ledger (CSV)</span>
              </button>

            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-[10px] font-bold uppercase tracking-wider text-slate-450 border-b border-slate-150 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Transaction ID</th>
                  <th className="px-4 py-3">Beneficiary Merchant</th>
                  <th className="px-4 py-3">Customer Profile</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-xs text-slate-400">
                      No results match current search filters. Check sandbox simulator!
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition text-slate-700 dark:text-slate-300">
                      <td className="px-4 py-3.5 font-mono text-[10px] font-bold text-slate-500">
                        {tx.id}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                        {tx.merchantName}
                      </td>
                      <td className="px-4 py-3.5">
                        <strong className="text-xs block text-slate-900 dark:text-white font-medium">{tx.customerName}</strong>
                        <span className="text-[10px] text-slate-450 block font-mono">{tx.upiId}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <strong className="text-xs font-black text-slate-950 dark:text-white">₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-900 px-2.5 py-0.5 rounded text-slate-650 dark:text-slate-350">{tx.paymentMethod}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-450 font-medium">
                        {new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${
                          tx.status === 'Success'
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                            : tx.status === 'Processing'
                              ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 animate-pulse'
                              : 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                        }`}>
                          {tx.isRefunded ? 'Refunded' : tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {tx.status === 'Success' && !tx.isRefunded && (
                          <button
                            type="button"
                            id={`btn-refund-${tx.id}`}
                            onClick={() => onRefundPayment(tx.id)}
                            className="px-2 py-1 text-[10px] font-black border border-red-200 dark:border-red-900 hover:bg-rose-50 dark:hover:bg-rose-950/10 text-red-650 dark:text-red-400 rounded-md transition cursor-pointer"
                          >
                            Refund Payment
                          </button>
                        )}
                        {tx.isRefunded && (
                          <span className="text-[10px] text-slate-400 italic">Settled to refund</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* -------------------- SECURITY CENTER -------------------- */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 md:col-span-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 block mb-1.5">Fraud Engine Status</span>
              <strong className="text-base flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-emerald-400" />
                <span>AI SHIELD LIVE</span>
              </strong>
              <p className="text-[10px] text-slate-400 leading-relaxed mt-4">
                Anti-fraud filters scoring parameters: device IDs, IP reputations, bank handshake latency, serial collections velocities, routing headers.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-150 dark:border-slate-850 md:col-span-3">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-850 dark:text-slate-200">Device Handshake Parameters</span>
                
                <select
                  id="filter-risk"
                  value={ipRiskFilter}
                  onChange={(e) => setIpRiskFilter(e.target.value)}
                  className="text-xs px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-705"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="space-y-3">
                {filteredFraudLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-850 text-xs flex justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <strong className="font-mono text-slate-800 dark:text-slate-100">{log.ipAddress}</strong>
                        <span className="text-[9px] text-slate-450 font-medium">({log.location})</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">{log.reason}</p>
                      <span className="text-[9px] block text-slate-450 mt-1.5 font-mono">Device Trace ID: {log.device} &bull; amount ₹{log.amount}</span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black ${
                        log.riskRating === 'Critical' 
                          ? 'bg-red-500/10 text-red-650' 
                          : log.riskRating === 'High'
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {log.riskRating}
                      </span>
                      <span className="block text-[8px] text-slate-400 mt-1">{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* -------------------- SETTINGS VIEW -------------------- */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs max-w-2xl">
          <div className="border-b border-slate-100 dark:border-slate-900 pb-3 mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white">Authority Settings Cabinet</h3>
            <p className="text-[10px] text-slate-450 mt-0.5">Control direct bank connection ports, commission MDR values, and SMTP settings.</p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">System MDR Rate Commission (%)</label>
                <input
                  type="number"
                  defaultValue="0.80"
                  step="0.05"
                  className="w-full text-xs p-2 mt-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">T+0 Settlement Bank Host</label>
                <select className="w-full text-xs p-2 mt-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800">
                  <option>NPCI Secondary Host Core</option>
                  <option>Axis Bank Host Node</option>
                  <option>ICICI Multi-Direct Node</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">AI Fraud Auto-Block Score Level</label>
                <input
                  type="number"
                  defaultValue="85"
                  className="w-full text-xs p-2 mt-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">SMTP System Notifications</label>
                <select className="w-full text-xs p-2 mt-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800">
                  <option>Active - upi@gateway.in</option>
                  <option>Hold queues - Disabled</option>
                </select>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-900" />

            <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-[10px] text-slate-500 dark:text-slate-400">
              Only authorized staff accounts with Level-5 permission controls may mutate the host settlement queue or default commission keys. Handshakes are audited dynamically in security logs.
            </div>
          </div>
        </div>
      )}

      {exportStatus && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl flex items-center space-x-3 text-xs max-w-sm animate-bounce">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          <span>{exportStatus}</span>
        </div>
      )}

    </div>
  );
}
