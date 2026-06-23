import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  QrCode, 
  RefreshCw, 
  Settings, 
  Key, 
  Plus, 
  TrendingUp, 
  HelpCircle, 
  LogOut, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Globe, 
  Copy, 
  CloudLightning,
  Sparkles,
  Play,
  Check
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Merchant, Transaction, Settlement } from '../types';

interface MerchantDashboardProps {
  merchant: Merchant;
  transactions: Transaction[];
  settlements: Settlement[];
  onTriggerSettlement: (amount: number) => void;
  onUpdateMerchantSettings: (updates: Partial<Merchant>) => void;
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

export default function MerchantDashboard({ 
  merchant, 
  transactions, 
  settlements, 
  onTriggerSettlement,
  onUpdateMerchantSettings,
  onLogout,
  onNavigate
}: MerchantDashboardProps) {
  
  const [activeTab, setActiveTab] = useState<'overview' | 'qr' | 'settlements' | 'developer' | 'settings'>('overview');
  
  // States for dynamic QR generator
  const [qrAmount, setQrAmount] = useState<string>('500');
  const [qrCustomer, setQrCustomer] = useState<string>('Roshni Patel');
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // States for Settlement processing
  const [settleAmountInput, setSettleAmountInput] = useState<string>('');
  const [settleMessage, setSettleMessage] = useState<string>('');

  // States for API webhooks editing
  const [webhookUrlInput, setWebhookUrlInput] = useState<string>(merchant.webhookUrl);
  const [upiIdInput, setUpiIdInput] = useState<string>(merchant.upiId);
  const [apiSuccessMessage, setApiSuccessMessage] = useState<string>('');

  // Filter transactions owned by this merchant
  const myTransactions = useMemo(() => {
    return transactions.filter(t => t.merchantId === merchant.id);
  }, [transactions, merchant.id]);

  // Filter settlements owned by this merchant
  const mySettlements = useMemo(() => {
    return settlements.filter(s => s.merchantId === merchant.id);
  }, [settlements, merchant.id]);

  // Compute stats
  const stats = useMemo(() => {
    const success = myTransactions.filter(t => t.status === 'Success' && !t.isRefunded);
    const revenue = success.reduce((acc, t) => acc + t.amount, 0);
    
    // Total settled funds
    const totalSettled = mySettlements
      .filter(s => s.status === 'Completed')
      .reduce((acc, s) => acc + s.amount, 0);

    const pendingSettlements = mySettlements
      .filter(s => s.status === 'Pending')
      .reduce((acc, s) => acc + s.amount, 0);

    const successfulVolume = success.length;
    const failedVolume = myTransactions.filter(t => t.status === 'Failed').length;

    // Available for settlement (Total revenue - total settled - pending in queue)
    const availableBalance = Math.max(0, revenue - totalSettled - pendingSettlements);

    return {
      revenue,
      totalSettled,
      pendingSettlements,
      availableBalance,
      successfulVolume,
      failedVolume,
      totalVolume: myTransactions.length
    };
  }, [myTransactions, mySettlements]);

  // Prepared chart analytics
  const chartData = useMemo(() => {
    // Sort transactions by date and group by day
    const reversed = [...myTransactions].reverse();
    const map: Record<string, number> = {};
    
    // Default mock empty values if no transactions
    if (reversed.length === 0) {
      return [
        { name: 'Mon', Amount: 0 },
        { name: 'Tue', Amount: 0 },
        { name: 'Wed', Amount: 0 },
        { name: 'Thu', Amount: 0 },
        { name: 'Fri', Amount: 0 },
      ];
    }

    reversed.forEach(tx => {
      if (tx.status === 'Success') {
        const dateStr = new Date(tx.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
        map[dateStr] = (map[dateStr] || 0) + tx.amount;
      }
    });

    return Object.keys(map).map(k => ({
      name: k,
      Amount: map[k]
    }));
  }, [myTransactions]);

  const handleGenerateQR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrAmount || isNaN(Number(qrAmount))) return;
    
    // Generate simulated dynamic UPI QR Code deep link standard
    // upi://pay?pa=merchantupi@bank&pn=MerchantName&am=Amount&cu=INR&tn=Ref_ID
    const formattedUrl = `upi://pay?pa=${encodeURIComponent(merchant.upiId)}&pn=${encodeURIComponent(merchant.businessName)}&am=${qrAmount}&cu=INR&tn=${encodeURIComponent('TxnSim_' + Math.floor(Math.random() * 9000))}`;
    setGeneratedUrl(formattedUrl);
  };

  const handleCopyApikey = () => {
    navigator.clipboard.writeText(merchant.apiKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const submitSettlementRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setSettleMessage('');
    const amt = Number(settleAmountInput);

    if (isNaN(amt) || amt <= 0) {
      setSettleMessage('Enter a valid settlement amount.');
      return;
    }

    if (amt > stats.availableBalance) {
      setSettleMessage(`Insufficient balance. Highest trigger available is ₹${stats.availableBalance.toLocaleString('en-IN')}`);
      return;
    }

    onTriggerSettlement(amt);
    setSettleAmountInput('');
    setSettleMessage('Quick Settlement requested successfully! Sent to admin nodes for instant clearance.');
  };

  const saveApiSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setApiSuccessMessage('');
    
    onUpdateMerchantSettings({
      webhookUrl: webhookUrlInput,
      upiId: upiIdInput,
    });
    
    setApiSuccessMessage('UPI Webhook channels updated successfully.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Merchant Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-xl md:text-2xl font-black text-slate-950 dark:text-white">
              {merchant.businessName}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              merchant.status === 'Active' 
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                : merchant.status === 'Pending'
                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                  : 'bg-red-500/10 text-red-600 border-red-500/20'
            }`}>
              {merchant.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Owner Profile: <strong className="font-bold">{merchant.ownerName}</strong> &bull; API Sandbox Endpoint Active
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            id="merchant-btn-simulator"
            onClick={() => onNavigate('pay')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
          >
            <CloudLightning className="w-3.5 h-3.5" />
            <span>Launch Payment Gateway Simulator</span>
          </button>

          <button
            type="button"
            id="merchant-btn-logout"
            onClick={onLogout}
            className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-slate-600 dark:text-slate-350 transition flex items-center space-x-1.5 cursor-pointer text-xs font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD TAB CONTROLS */}
      <div className="flex overflow-x-auto space-x-1 border-b border-slate-150 dark:border-slate-850 pb-px mb-8 scrollbar-none">
        {(['overview', 'qr', 'settlements', 'developer', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            id={`m-tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-xs font-bold tracking-wide capitalize whitespace-nowrap transition-all border-b-2 outline-none cursor-pointer ${
              activeTab === tab
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {tab === 'qr' ? 'Dynamic QR Generator' : tab}
          </button>
        ))}
      </div>

      {/* -------------------- OVERVIEW VIEW -------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-8 relative z-10">
          
          {/* OVERVIEW METRIC CARD PANELS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Metric 1 */}
            <div className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-md p-6 rounded-2xl border border-white/20 dark:border-white/[0.05] shadow-xs relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-450 dark:text-slate-500">Total Collected</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹{stats.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-[10px] font-semibold text-emerald-500 flex items-center space-x-1 mt-4">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+24.2% Growth Index (15d)</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-md p-6 rounded-2xl border border-white/20 dark:border-white/[0.05] shadow-xs relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-450 dark:text-slate-500">Settled to Bank</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹{stats.totalSettled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-4 font-semibold">
                Pending Settlements: <strong className="font-bold text-slate-700 dark:text-slate-350">₹{stats.pendingSettlements.toLocaleString('en-IN')}</strong>
              </p>
            </div>

            {/* Metric 3 */}
            <div className="bg-white/40 dark:bg-white/[0.04] backdrop-blur-md p-6 rounded-2xl border border-white/25 dark:border-white/10 shadow-xs relative overflow-hidden bg-gradient-to-tr from-white/10 to-white/40 dark:from-slate-900/10 dark:to-slate-950/20">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500">Available to Settle</span>
                  <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">₹{stats.availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3.5">
                <button
                  type="button"
                  id="overview-btn-settle-tab"
                  onClick={() => setActiveTab('settlements')}
                  className="text-[9px] font-black uppercase text-indigo-500 hover:text-indigo-600 tracking-wider flex items-center space-x-1 cursor-pointer"
                >
                  <span>Request Quick Settlement &rarr;</span>
                </button>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-md p-6 rounded-2xl border border-white/20 dark:border-white/[0.05] shadow-xs relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-450 dark:text-slate-500">Handshake Volume</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {stats.successfulVolume} <span className="text-xs font-normal text-slate-450">/ {stats.totalVolume} txs</span>
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-4 font-semibold">
                MDR success rate: <strong className="font-bold text-slate-700 dark:text-slate-350">{stats.totalVolume ? Math.round((stats.successfulVolume / stats.totalVolume) * 100) : 100}%</strong>
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-4">
            
            {/* Transaction Analytics Area Chart */}
            <div className="lg:col-span-8 bg-white/40 dark:bg-white/[0.02] backdrop-blur-md p-6 rounded-2xl border border-white/20 dark:border-white/[0.05] shadow-xs">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Revenue Growth Trend</h3>
                  <p className="text-[10px] text-slate-450">T+0 dynamic ledger verification logs</p>
                </div>
                <span className="text-[10px] font-bold text-indigo-500 uppercase bg-white/20 dark:bg-white/5 border border-white/20 dark:border-white/5 px-2.5 py-1 rounded">
                  Daily Collections Index
                </span>
              </div>

              <div className="h-[280px] w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#11122a', borderColor: '#2e305e', borderRadius: '12px', color: '#fff' }} />
                    <Area type="monotone" dataKey="Amount" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Live payment feed list (Recent payments) */}
            <div className="lg:col-span-4 bg-white/40 dark:bg-white/[0.02] backdrop-blur-md p-6 rounded-2xl border border-white/20 dark:border-white/[0.05] shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Live Transaction Stream</h3>
                <p className="text-[10px] text-slate-450 mb-4">Latest payments received on UPI ports</p>

                <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                  {myTransactions.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      No payments recorded yet. Run payments in Gateway Simulator to trigger events here!
                    </div>
                  ) : (
                    myTransactions.slice(0, 6).map((tx) => (
                      <div 
                        key={tx.id} 
                        className="flex items-center justify-between p-2.5 bg-white/30 dark:bg-slate-900/40 rounded-xl border border-white/10 dark:border-white/5 border-l-4 border-l-blue-500"
                      >
                        <div className="truncate pr-2">
                          <strong className="text-xs block font-bold text-slate-800 dark:text-slate-200 truncate">{tx.customerName}</strong>
                          <span className="text-[9px] text-slate-450 block font-mono">{tx.paymentMethod} &bull; {new Date(tx.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <strong className="text-xs font-black text-slate-950 dark:text-white block">₹{tx.amount.toLocaleString()}</strong>
                          <span className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[8px] font-bold ${
                            tx.status === 'Success' 
                              ? 'bg-emerald-500/10 text-emerald-600' 
                              : tx.status === 'Processing'
                                ? 'bg-blue-500/10 text-blue-500 animate-pulse'
                                : 'bg-red-500/10 text-red-600'
                          }`}>
                            {tx.isRefunded ? 'Refunded' : tx.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-900 mt-4 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-mono">
                  {isSyncing ? 'Synchronizing gateway ports...' : 'Dynamic Node Feed active'}
                </span>
                <button
                  type="button"
                  id="dashboard-btn-refresh-feed"
                  onClick={() => {
                    setIsSyncing(true);
                    setTimeout(() => setIsSyncing(false), 1500);
                  }}
                  disabled={isSyncing}
                  className="p-1 px-2.5 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 transition cursor-pointer disabled:opacity-50"
                >
                  {isSyncing ? 'Syncing...' : 'Sync Nodes'}
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* -------------------- DYNAMIC QR GENERATOR -------------------- */}
      {activeTab === 'qr' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Input Panel */}
          <div className="md:col-span-6 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs">
            <div className="border-b border-slate-100 dark:border-slate-900 pb-3 mb-5">
              <h3 className="font-bold text-slate-900 dark:text-white">Dynamic UPI QR Merchant Generator</h3>
              <p className="text-[10px] text-slate-450 mt-0.5">Prompt real-time dynamic checkout payloads containing parameters.</p>
            </div>

            <form onSubmit={handleGenerateQR} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Customer Reference Name</label>
                <input
                  type="text"
                  id="qr-input-cust"
                  value={qrCustomer}
                  onChange={(e) => setQrCustomer(e.target.value)}
                  className="w-full text-sm px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl outline-none"
                  placeholder="e.g. Roshni Patel"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Transaction Amount (₹)</label>
                <div className="relative font-bold">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    id="qr-input-amt"
                    value={qrAmount}
                    onChange={(e) => setQrAmount(e.target.value)}
                    className="w-full text-base font-black pl-8 pr-12 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl outline-none"
                    placeholder="e.g. 500"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-650">INR</span>
                </div>
              </div>

              <button
                type="submit"
                id="qr-btn-generate"
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Compile Parameterized QR Code
              </button>
            </form>
          </div>

          {/* Result Presentation Panel */}
          <div className="md:col-span-6 flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs text-center min-h-[340px]">
            {generatedUrl ? (
              <div className="space-y-6 flex flex-col items-center">
                <div className="relative p-6 bg-slate-50 dark:bg-white rounded-3xl border border-slate-200 shadow-md">
                  
                  {/* High Fidelity Mock QR Code SVG */}
                  <svg className="w-48 h-48 mx-auto" viewBox="0 0 100 100">
                    {/* Corner anchors */}
                    <rect x="0" y="0" width="25" height="25" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
                    <rect x="5" y="5" width="15" height="15" fill="#fff" />
                    <rect x="9" y="9" width="7" height="7" fill="#6366f1" />

                    <rect x="75" y="0" width="25" height="25" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
                    <rect x="80" y="5" width="15" height="15" fill="#fff" />
                    <rect x="84" y="9" width="7" height="7" fill="#6366f1" />

                    <rect x="0" y="75" width="25" height="25" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
                    <rect x="5" y="80" width="15" height="15" fill="#fff" />
                    <rect x="9" y="84" width="7" height="7" fill="#6366f1" />

                    {/* QR Pixel Noise Simulation */}
                    <path d="M 35,5 h 5 v 5 h -5 z M 45,5 h 10 v 5 h -10 z M 60,5 h 5 v 15 h -5 z M 35,15 h 15 v 5 h -15 z M 55,15 h 5 v 5 h -5 z M 30,25 h 10 v 5 h -10 z M 45,25 h 5 v 5 h -5 z M 55,25 h 20 v 5 h -20 z M 5,35 v 15 h 5 v -15 z M 15,35 h 15 v 5 h -15 z M 40,35 h 5 v 15 h -5 z M 55,35 h 10 v 5 h -10 z M 70,35 h 15 v 5 h -15 z M 15,45 h 10 v 5 h -10 z M 25,45 h 10 v 5 h -10 z M 50,45 h 15 v 5 h -15 z M 75,45 h 10 v 5 h -10 z M 30,55 h 20 v 5 h -20 z M 60,55 h 10 v 10 h -10 z M 75,55 h 5 v 5 h -5 z M 35,65 h 10 v 5 h -10 z M 50,65 h 5 v 5 h -5 z M 70,65 h 15 v 5 h -15 z M 35,75 h 5 v 15 h -5 z M 45,75 h 15 v 5 h -15 z M 65,75 h 10 v 5 h -10 z M 85,75 h 5 v 5 h -5 z M 45,85 h 30 v 5 h -30 z M 80,85 h 10 v 10 h -10 z M 35,95 h 25 v 5 h -25 z" fill="#1e1b4b" />
                    
                    {/* Small center dynamic logo */}
                    <rect x="40" y="40" width="20" height="20" rx="4" fill="#6366f1" />
                    <text x="50" y="52" fill="#fff" fontSize="8" fontWeight="black" textAnchor="middle">UPI</text>
                  </svg>

                  <div className="mt-4">
                    <span className="block text-[10px] font-black uppercase text-indigo-600 font-mono">Dynamic scan code</span>
                    <strong className="text-sm font-bold text-slate-800">{merchant.businessName}</strong>
                  </div>
                </div>

                <div className="space-y-3 w-full max-w-sm">
                  <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-[10px] text-slate-500 dark:text-slate-400">
                    QR Parameters: Amount = <strong>₹{qrAmount}</strong> &bull; Customer = <strong>{qrCustomer}</strong>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      id="qr-btn-copy-string"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedUrl);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isCopied ? 'Copied' : 'Copy Pay string'}</span>
                    </button>

                    <button
                      type="button"
                      id="qr-btn-download"
                      onClick={() => {
                        setIsDownloaded(true);
                        setTimeout(() => setIsDownloaded(false), 2000);
                      }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-white ${
                        isDownloaded ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-500'
                      }`}
                    >
                      {isDownloaded ? 'Downloaded!' : 'Download QR Receipt'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                  <QrCode className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-white">QR Code Not Drafted</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Enter merchant parameter values on the left and click compile to design your dynamic billing QR instantly.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* -------------------- SETTLEMENTS VIEW -------------------- */}
      {activeTab === 'settlements' && (
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Settle Action form */}
            <div className="md:col-span-4 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs">
              <div className="border-b border-slate-100 dark:border-slate-900 pb-3 mb-5">
                <h3 className="font-bold text-slate-900 dark:text-white">Trigger Quick Settlement</h3>
                <p className="text-[10px] text-slate-450 mt-0.5">Transfer outstanding collected funds directly into HDFC Node.</p>
              </div>

              <div className="mb-4 p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                <span className="block text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider">Available Balance</span>
                <strong className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">₹{stats.availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>

              <form onSubmit={submitSettlementRequest} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Withdrawal Amount (₹)</label>
                  <input
                    type="number"
                    id="settle-input-amt"
                    value={settleAmountInput}
                    onChange={(e) => setSettleAmountInput(e.target.value)}
                    className="w-full text-base font-black px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl outline-none"
                    placeholder="e.g. 1000"
                    required
                  />
                </div>

                <button
                  type="submit"
                  id="settle-btn-submit"
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Initiate T+0 Settlement
                </button>
              </form>

              {settleMessage && (
                <div className="mt-4 p-2.5 bg-slate-100 dark:bg-slate-900 text-[10px] text-slate-650 dark:text-slate-300 rounded-lg">
                  {settleMessage}
                </div>
              )}
            </div>

            {/* Settle Ledger list */}
            <div className="md:col-span-8 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs">
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">Settlement Logs &amp; Bank UTRs</h3>
              <p className="text-[10px] text-slate-450 mb-4 font-semibold">T+0 direct payout transaction ledgers</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-[10px] font-bold uppercase tracking-wider text-slate-450 border-b border-slate-150 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Settlement ID</th>
                      <th className="px-4 py-3">Amount Requested</th>
                      <th className="px-4 py-3">Requested At</th>
                      <th className="px-4 py-3">UTR Reference</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                    {mySettlements.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-xs text-slate-400">
                          No settlement records found. Trigger your first payout above!
                        </td>
                      </tr>
                    ) : (
                      mySettlements.map((set) => (
                        <tr key={set.id}>
                          <td className="px-4 py-3.5 font-mono text-[10px] font-bold text-slate-600 dark:text-slate-400">
                            {set.id}
                          </td>
                          <td className="px-4 py-3.5 font-black text-slate-900 dark:text-white">
                            ₹{set.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3.5 text-slate-450">
                            {new Date(set.requestedAt).toLocaleDateString()} &bull; {new Date(set.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-4 py-3.5">
                            {set.utr ? (
                              <span className="font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                                {set.utr}
                              </span>
                            ) : (
                              <span className="text-[9px] font-semibold text-slate-400 italic">Processing at bank queue...</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${
                              set.status === 'Completed'
                                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                                : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 animate-pulse'
                            }`}>
                              {set.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* -------------------- DEVELOPER ENDPOINTS -------------------- */}
      {activeTab === 'developer' && (
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Keys panel */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-900 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white">API Credentials (Sandbox Mode)</h3>
                <p className="text-[10px] text-slate-450 mt-0.5">Configure active gateway authorization credentials.</p>
              </div>

              <div>
                <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Sandbox Integration Key</span>
                <div className="relative mt-1 bg-slate-950 p-3 rounded-lg border border-slate-900 font-mono text-xs text-slate-300 break-all select-all flex items-center justify-between">
                  <code>{merchant.apiKey}</code>
                  <button
                    type="button"
                    onClick={handleCopyApikey}
                    className="p-1 hover:bg-slate-800 rounded transition text-slate-450 ml-3 shrink-0"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-900" />

              {/* Edit sandbox URL webhook configuration form */}
              <form onSubmit={saveApiSettings} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Developer Webhook URL</label>
                  <input
                    type="url"
                    id="dev-input-webhook"
                    value={webhookUrlInput}
                    onChange={(e) => setWebhookUrlInput(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl outline-none"
                    placeholder="https://api.yourdomain.com/v1/payout-webhook"
                  />
                  <span className="text-[9px] text-slate-400 dark:text-slate-550 block mt-1">We send transaction results dynamically to this client address</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">UPI ID Configuration</label>
                  <input
                    type="text"
                    id="dev-input-upiid"
                    value={upiIdInput}
                    onChange={(e) => setUpiIdInput(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    id="dev-btn-save"
                    className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-xs cursor-pointer"
                  >
                    Save API Preferences
                  </button>
                </div>

                {apiSuccessMessage && (
                  <div className="p-2.5 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 text-[9px] font-bold rounded-lg text-center animate-fade-in">
                    {apiSuccessMessage}
                  </div>
                )}
              </form>
            </div>

            {/* Snippets / Log console */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-900 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white">Webhook Response Simulation Payload</h3>
                <p className="text-[10px] text-slate-450 mt-0.5">Sample API call response sent to your server on successful UPI sweeps.</p>
              </div>

              <div className="relative">
                <pre className="text-[10px] font-mono bg-slate-950 text-slate-300 p-4 rounded-xl overflow-x-auto border border-slate-800 leading-relaxed">
                  <code>{`{
  "event": "payment.captured",
  "merchant_id": "${merchant.id}",
  "payment_id": "tx_${Math.floor(Math.random() * 900 + 100)}",
  "amount": 149900,
  "currency": "INR",
  "status": "captured",
  "method": "upi_intent",
  "vpa": "customer@okaxis",
  "bank_ref": "NPCI-${Math.floor(Math.random() * 900000 + 100000)}",
  "risk_score": 8,
  "created_at": ${Math.floor(Date.now() / 1000)}
}`}</code>
                </pre>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* -------------------- SETTINGS VIEW -------------------- */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-xs max-w-2xl">
          <div className="border-b border-slate-100 dark:border-slate-900 pb-3 mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white">Business Account Settings</h3>
            <p className="text-[10px] text-slate-450 mt-0.5">Manage your registered bank nodes, PAN/GST records, and payout security.</p>
          </div>

          <div className="space-y-6 text-sm">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Business Entity Name</span>
                <strong className="block text-slate-800 dark:text-slate-200 mt-1">{merchant.businessName}</strong>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Promoter Name</span>
                <strong className="block text-slate-800 dark:text-slate-200 mt-1">{merchant.ownerName}</strong>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mobile Contact</span>
                <strong className="block text-slate-800 dark:text-slate-200 mt-1">+91 {merchant.mobile}</strong>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Billing Email</span>
                <strong className="block text-slate-800 dark:text-slate-200 mt-1">{merchant.email}</strong>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">GSTIN Profile</span>
                <strong className="block text-slate-800 dark:text-slate-200 mt-1 font-mono uppercase">{merchant.gstNumber || 'VERIFIED_MICRO'}</strong>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">PAN Number</span>
                <strong className="block text-slate-800 dark:text-slate-200 mt-1 font-mono uppercase">{merchant.panNumber}</strong>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-900" />

            <div>
              <span className="block text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2.5">Saved Bank Settlement Node</span>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="block text-[9px] text-slate-450 dark:text-slate-500 uppercase">Bank Name</span>
                  <strong className="text-slate-800 dark:text-slate-200 text-xs">{merchant.bankName}</strong>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-450 dark:text-slate-500 uppercase">Account Number</span>
                  <strong className="text-slate-800 dark:text-slate-200 text-xs text-slate-700 dark:text-slate-350 font-mono">••••••••{merchant.bankAccount?.slice(-4) || '5019'}</strong>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-450 dark:text-slate-500 uppercase">IFSC Code Node</span>
                  <strong className="text-slate-800 dark:text-slate-200 text-xs font-mono">{merchant.ifscCode}</strong>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-900" />

            <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-[10px] text-slate-500 dark:text-slate-400 flex items-start space-x-2.5 leading-relaxed">
              <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <span>To modify corporate account variables or update linked corporate nodes, trigger an administration service call by writing directly to our help desk <strong className="font-bold text-slate-700 dark:text-slate-300">support@upigateway.in</strong>.</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
