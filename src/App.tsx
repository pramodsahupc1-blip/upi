import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Compass, 
  QrCode, 
  Sliders, 
  LayoutDashboard, 
  Moon, 
  Sun, 
  CloudLightning, 
  ShieldCheck, 
  User, 
  LogOut, 
  CheckCircle, 
  Smartphone,
  Sparkles,
  Key
} from 'lucide-react';
import { loadState, saveState, AppState } from './utils/storage';
import { Merchant, Transaction, Settlement, FraudLog } from './types';

// Component imports
import LandingPage from './components/LandingPage';
import MerchantRegister from './components/MerchantRegister';
import AuthPage from './components/AuthPage';
import MerchantDashboard from './components/MerchantDashboard';
import AdminDashboard from './components/AdminDashboard';
import PaymentSimulator from './components/PaymentSimulator';

export default function App() {
  
  // App routing state
  const [navView, setNavView] = useState<string>('home');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Authority authentication state
  const [session, setSession] = useState<{
    userType: 'merchant' | 'admin' | null;
    merchantId: string | null;
  }>({
    userType: null,
    merchantId: null,
  });

  // Database State (merchants, transactions, settlements, fraudLogs)
  const [db, setDb] = useState<AppState>({
    merchants: [],
    transactions: [],
    settlements: [],
    fraudLogs: [],
  });

  // On mount: load database and theme state
  useEffect(() => {
    const state = loadState();
    setDb(state);

    // Initial check for dark mode
    const savedTheme = localStorage.getItem('upi_theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Sync state changes to local storage
  const syncState = (newDb: AppState) => {
    setDb(newDb);
    saveState(newDb);
  };

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('upi_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('upi_theme', 'light');
    }
  };

  // 1. Merchant registration callback
  const handleRegisterMerchant = (newMerchantData: Omit<Merchant, 'id' | 'apiKey' | 'webhookUrl' | 'createdAt' | 'kycSubmitted' | 'kycApprovedAt' | 'status'>) => {
    const randomId = 'mer_' + Math.random().toString(36).substring(3, 8);
    const mockApiKey = 'pk_live_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    
    const newMerchant: Merchant = {
      ...newMerchantData,
      id: randomId,
      status: 'Pending', // pending until approved by admin
      apiKey: mockApiKey,
      webhookUrl: 'https://api.gateway-sandbox.in/v1/callbacks/' + randomId,
      createdAt: new Date().toISOString(),
      kycSubmitted: true,
      kycApprovedAt: null,
    };

    const updatedMerchants = [newMerchant, ...db.merchants];
    syncState({
      ...db,
      merchants: updatedMerchants,
    });
  };

  // 2. Authentication Login Handling
  const handleLogin = (userType: 'merchant' | 'admin', merchantId: string | null) => {
    setSession({
      userType,
      merchantId,
    });
    // Direct routing
    if (userType === 'admin') {
      setNavView('admin');
    } else {
      setNavView('dashboard');
    }
  };

  const handleLogout = () => {
    setSession({
      userType: null,
      merchantId: null,
    });
    setNavView('home');
  };

  // 3. Settlement Withdrawal Request (Merchant Panel)
  const handleAddSettlementRequest = (amount: number) => {
    if (!session.merchantId) return;
    const currentMerchant = db.merchants.find(m => m.id === session.merchantId);
    if (!currentMerchant) return;

    const newSettle: Settlement = {
      id: 'set_' + Math.random().toString(36).substring(3, 8),
      merchantId: currentMerchant.id,
      merchantName: currentMerchant.businessName,
      amount,
      bankAccount: currentMerchant.bankAccount,
      upiId: currentMerchant.upiId,
      status: 'Pending',
      requestedAt: new Date().toISOString(),
      settledAt: null,
      utr: null,
    };

    const updatedSettlements = [newSettle, ...db.settlements];
    syncState({
      ...db,
      settlements: updatedSettlements,
    });
  };

  // 4. Update Webhook API details (Merchant Panel Settings)
  const handleUpdateMerchantSettings = (updates: Partial<Merchant>) => {
    if (!session.merchantId) return;
    
    const updatedMerchants = db.merchants.map(m => {
      if (m.id === session.merchantId) {
        return { ...m, ...updates };
      }
      return m;
    });

    syncState({
      ...db,
      merchants: updatedMerchants,
    });
  };

  // 5. Approve Merchant (Admin Control Panel)
  const handleApproveMerchant = (merchantId: string) => {
    const updatedMerchants = db.merchants.map(m => {
      if (m.id === merchantId) {
        return { ...m, status: 'Active' as const, kycApprovedAt: new Date().toISOString() };
      }
      return m;
    });

    syncState({
      ...db,
      merchants: updatedMerchants,
    });
  };

  // 6. Suspend Merchant (Admin Control Panel)
  const handleSuspendMerchant = (merchantId: string) => {
    const updatedMerchants = db.merchants.map(m => {
      if (m.id === merchantId) {
        return { ...m, status: 'Suspended' as const };
      }
      return m;
    });

    syncState({
      ...db,
      merchants: updatedMerchants,
    });
  };

  // 7. Process Settlement Approval (Admin Control Panel)
  const handleProcessSettlementApproval = (settlementId: string) => {
    const updatedSettlements = db.settlements.map(s => {
      if (s.id === settlementId) {
        return { 
          ...s, 
          status: 'Completed' as const, 
          settledAt: new Date().toISOString(),
          utr: 'UTR' + Math.floor(Math.random() * 900000000000 + 100000000000).toString(),
        };
      }
      return s;
    });

    syncState({
      ...db,
      settlements: updatedSettlements,
    });
  };

  // 8. Refund Capture event (Admin Control Panel)
  const handleRefundPayment = (transactionId: string) => {
    const updatedTxns = db.transactions.map(t => {
      if (t.id === transactionId) {
        return { ...t, isRefunded: true, refundedAt: new Date().toISOString() };
      }
      return t;
    });

    syncState({
      ...db,
      transactions: updatedTxns,
    });
  };

  // 9. Process Simulator Payment Event
  const handleAddSimulatedTransaction = (newTxnData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTxnId = 'tx_' + Math.floor(Math.random() * 9000 + 1000);
    const newTxn: Transaction = {
      ...newTxnData,
      id: newTxnId,
      createdAt: new Date().toISOString(),
    };

    let updatedFraudLogs = [...db.fraudLogs];

    // If simulating threat vector, trigger a corresponding fraud security log as well
    if (newTxnData.riskScore > 75) {
      const locationGrid = ['Mumbai, Maharashtra', 'New Delhi, Delhi', 'Kolkata, West Bengal', 'Bangalore, Karnataka', 'Chennai, Tamil Nadu'];
      const deviceGrid = ['Spoofing Server Node - Linux x86', 'Bot Device Emulator - Android 12', 'Unidentified proxy crawler v42'];
      const randomIp = `103.${Math.floor(Math.random() * 140)}.${Math.floor(Math.random() * 240)}.${Math.floor(Math.random() * 240)}`;
      
      const newFraud: FraudLog = {
        id: 'fr_' + Math.floor(Math.random() * 900 + 100),
        ipAddress: randomIp,
        device: deviceGrid[Math.floor(Math.random() * deviceGrid.length)],
        merchantName: newTxnData.merchantName,
        amount: newTxnData.amount,
        riskRating: 'Critical',
        reason: newTxnData.riskAnalysis || 'Critical risk rating block. Blacklisted IP address range matched serial requests velocity parameters.',
        createdAt: new Date().toISOString(),
        location: locationGrid[Math.floor(Math.random() * locationGrid.length)],
      };
      
      updatedFraudLogs = [newFraud, ...updatedFraudLogs];
    }

    const updatedTxns = [newTxn, ...db.transactions];

    syncState({
      ...db,
      transactions: updatedTxns,
      fraudLogs: updatedFraudLogs,
    });
  };

  const activeMerchantObject = useMemo(() => {
    if (session.userType === 'merchant' && session.merchantId) {
      return db.merchants.find(m => m.id === session.merchantId);
    }
    return null;
  }, [db.merchants, session]);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 to-slate-100 dark:from-[#090A15] dark:via-[#0F1122] dark:to-[#070810] text-slate-800 dark:text-slate-100 transition-colors duration-300 flex flex-col justify-between font-sans relative overflow-x-hidden">
      
      {/* Premium Ambient Backdrops (Dynamic Glass Glows) */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-purple-600/10 dark:bg-purple-600/15 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[180px] pointer-events-none z-0" />

      {/* ----------------- GLOBAL TOP NAVIGATION BAR ----------------- */}
      <nav className="sticky top-0 z-50 bg-white/40 dark:bg-[#0E101F]/40 border-b border-white/20 dark:border-white/10 backdrop-blur-xl px-6 py-4 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 relative z-10">
          
          {/* Logo brand */}
          <div 
            id="brand-logo-nav"
            className="flex items-center space-x-2.5 cursor-pointer scale-100 hover:scale-102 transition active:scale-98"
            onClick={() => setNavView('home')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-indigo-500/15">
              AP
            </div>
            <div>
              <span className="font-black tracking-wider text-slate-950 dark:text-white text-base">
                AARAV <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">PAY</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase py-0.5 px-2 bg-gradient-to-r from-teal-500/10 to-indigo-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 rounded-full">
                MDR 0% Sandbox
              </span>
            </div>
          </div>

          {/* Navigation link choices */}
          <div className="flex items-center space-x-2 md:space-x-4">
            
            <button
              type="button"
              id="nav-btn-sim"
              onClick={() => setNavView('pay')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 outline-none cursor-pointer ${
                navView === 'pay'
                  ? 'bg-indigo-600/15 dark:bg-white/10 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CloudLightning className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Gateway Simulator</span>
            </button>

            {/* Authenticated user quick dashboard access */}
            {session.userType === 'merchant' && (
              <button
                type="button"
                id="nav-btn-dashboard"
                onClick={() => setNavView('dashboard')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 outline-none cursor-pointer ${
                  navView === 'dashboard'
                    ? 'bg-indigo-600/15 dark:bg-white/10 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>My Console</span>
              </button>
            )}

            {session.userType === 'admin' && (
              <button
                type="button"
                id="nav-btn-admin"
                onClick={() => setNavView('admin')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 outline-none cursor-pointer ${
                  navView === 'admin'
                    ? 'bg-purple-600/15 dark:bg-white/10 text-purple-700 dark:text-purple-300'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Control Room</span>
              </button>
            )}

            {!session.userType && (
              <div className="hidden sm:flex items-center space-x-1">
                <button
                  type="button"
                  id="nav-btn-register"
                  onClick={() => setNavView('register')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition hover:text-indigo-600 dark:hover:text-indigo-400 ${
                    navView === 'register' ? 'text-indigo-500' : 'text-slate-500'
                  }`}
                >
                  Merchant Registration
                </button>
              </div>
            )}

            {/* General Mode login / signout button */}
            {session.userType ? (
              <button
                type="button"
                id="nav-btn-signout"
                onClick={handleLogout}
                className="hidden sm:flex items-center space-x-1 p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-bold cursor-pointer text-slate-500"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                type="button"
                id="nav-btn-login-trig"
                onClick={() => setNavView('login')}
                className={`px-4 py-1.5 bg-slate-950 dark:bg-white/5 border dark:border-white/10 text-white dark:text-slate-200 text-xs font-semibold rounded-xl transition hover:opacity-90 tracking-wide outline-none cursor-pointer ${
                  navView === 'login' ? 'ring-2 ring-indigo-500 dark:ring-indigo-400' : ''
                }`}
              >
                Sign In
              </button>
            )}

            {/* LIGHT/DARK THEME TOGGLER */}
            <button
              type="button"
              id="theme-toggler-btn"
              onClick={toggleTheme}
              className="p-2 border border-slate-200 dark:border-white/10 hover:bg-slate-150 dark:hover:bg-white/5 rounded-xl transition shrink-0 cursor-pointer text-slate-500 dark:text-slate-400"
              title="Toggle theme preset"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>

          </div>
        </div>
      </nav>

      {/* -------------------- MAIN WORKSPACE CONTENT -------------------- */}
      <main className="flex-grow z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={navView}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
          >
            {/* Landing screen */}
            {navView === 'home' && (
              <LandingPage 
                onNavigate={(view) => {
                  if (view === 'dashboard' && !session.merchantId) {
                    setNavView('login');
                  } else if (view === 'admin' && session.userType !== 'admin') {
                    setNavView('login');
                  } else {
                    setNavView(view);
                  }
                }}
                isDarkMode={isDarkMode}
              />
            )}

            {/* Merchant KYC register screen */}
            {navView === 'register' && (
              <MerchantRegister
                onRegister={handleRegisterMerchant}
                onNavigate={setNavView}
              />
            )}

            {/* Authentication Gateway panel picker */}
            {navView === 'login' && (
              <AuthPage
                merchants={db.merchants}
                onLogin={handleLogin}
                onNavigate={setNavView}
              />
            )}

            {/* Merchant Dashboard panel */}
            {navView === 'dashboard' && activeMerchantObject && (
              <MerchantDashboard
                merchant={activeMerchantObject}
                transactions={db.transactions}
                settlements={db.settlements}
                onTriggerSettlement={handleAddSettlementRequest}
                onUpdateMerchantSettings={handleUpdateMerchantSettings}
                onLogout={handleLogout}
                onNavigate={setNavView}
              />
            )}

            {/* Admin Dashboard Control Center panels */}
            {navView === 'admin' && session.userType === 'admin' && (
              <AdminDashboard
                merchants={db.merchants}
                transactions={db.transactions}
                settlements={db.settlements}
                fraudLogs={db.fraudLogs}
                onApproveMerchant={handleApproveMerchant}
                onSuspendMerchant={handleSuspendMerchant}
                onProcessSettlement={handleProcessSettlementApproval}
                onRefundPayment={handleRefundPayment}
                onLogout={handleLogout}
                onNavigate={setNavView}
              />
            )}

            {/* UPI Checkout Payment Gateway phone Simulator */}
            {navView === 'pay' && (
              <PaymentSimulator
                merchants={db.merchants}
                onAddTransaction={handleAddSimulatedTransaction}
                onNavigate={setNavView}
              />
            )}

          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}
