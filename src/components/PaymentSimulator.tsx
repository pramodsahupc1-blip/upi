import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  QrCode, 
  ArrowUpRight, 
  Activity, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  Globe, 
  SmartphoneIcon, 
  HelpCircle,
  Sparkles,
  RefreshCw,
  Building2,
  Lock
} from 'lucide-react';
import { Merchant, Transaction } from '../types';

interface PaymentSimulatorProps {
  merchants: Merchant[];
  onAddTransaction: (txn: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onNavigate: (view: string) => void;
}

export default function PaymentSimulator({ merchants, onAddTransaction, onNavigate }: PaymentSimulatorProps) {
  
  // Choose merchant to pay
  const activeMerchants = merchants.filter(m => m.status === 'Active');
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>(activeMerchants[0]?.id || 'mer_01');
  
  // Payment states
  const [customerName, setCustomerName] = useState<string>('Kiran Rao');
  const [customerUpi, setCustomerUpi] = useState<string>('kiran@paytm');
  const [payAmount, setPayAmount] = useState<string>('799');
  const [paymentMethod, setPaymentMethod] = useState<'QR Code' | 'UPI ID' | 'UPI Intent' | 'Collect Request'>('UPI Intent');
  const [selectedApp, setSelectedApp] = useState<'GooglePay' | 'PhonePe' | 'Paytm' | 'BHIM'>('GooglePay');

  // Interactive triggers
  const [simRisk, setSimRisk] = useState<'low' | 'critical'>('low');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed' | 'flagged'>('idle');
  const [statusTimer, setStatusTimer] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  
  const currentSelectedMerchant = merchants.find(m => m.id === selectedMerchantId) || merchants[0];

  const handleTriggerPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || isNaN(Number(payAmount)) || Number(payAmount) <= 0) {
      setValidationError('Kindly specify a valid transaction amount.');
      return;
    }

    setValidationError('');
    setPaymentStatus('processing');
    
    // Simulate transaction delay
    setTimeout(() => {
      
      const amtNum = Number(payAmount);
      
      // Compute mock risk metrics
      const riskScore = simRisk === 'critical' ? Math.floor(Math.random() * 20 + 80) : Math.floor(Math.random() * 15 + 3);
      const riskAnalysis = simRisk === 'critical' 
        ? 'High Risk: VPN proxy active. Handshake mismatch detected between device header and provider node.' 
        : 'Low Risk: Handshake fully authorized on trusted cellular network.';

      if (simRisk === 'critical') {
        setPaymentStatus('flagged');
        onAddTransaction({
          merchantId: currentSelectedMerchant.id,
          merchantName: currentSelectedMerchant.businessName,
          customerName: customerName,
          amount: amtNum,
          upiId: customerUpi,
          paymentMethod: paymentMethod,
          status: 'Failed',
          riskScore: riskScore,
          riskAnalysis: riskAnalysis,
          isRefunded: false,
          refundedAt: null,
        });
        return;
      }

      // Randomly fail 5% of standard payments for realism
      const finalStatus = Math.random() > 0.05 ? 'Success' : 'Failed';
      setPaymentStatus(finalStatus === 'Success' ? 'success' : 'failed');

      // Propagate state to top level state manager
      onAddTransaction({
        merchantId: currentSelectedMerchant.id,
        merchantName: currentSelectedMerchant.businessName,
        customerName: customerName,
        amount: amtNum,
        upiId: customerUpi,
        paymentMethod: paymentMethod,
        status: finalStatus,
        riskScore: riskScore,
        riskAnalysis: riskAnalysis,
        isRefunded: false,
        refundedAt: null,
      });

    }, 2000);
  };

  return (
    <div className="relative max-w-4xl mx-auto px-4 py-8 z-10">
      
      {/* Header bar */}
      <div className="text-center mb-10 flex flex-col space-y-2">
        <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 tracking-wider uppercase flex items-center justify-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Sandbox Terminal</span>
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">UPI Payment Checkout Sandbox</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Test dynamic merchant QR code sweeps, customer collect authorizations, intents, and AI risk engines in a secure playground environment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Play control settings - Left Column */}
        <div className="md:col-span-7 bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl space-y-5">
          
          <div className="border-b border-slate-150/40 dark:border-white/10 pb-3 mb-2 flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-indigo-500" />
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Configure Play Parameters</h4>
          </div>

          <form onSubmit={handleTriggerPayment} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Select Destination Merchant */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide flex items-center space-x-1">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span>Beneficiary Merchant</span>
                </label>
                <select
                  id="pay-merchant-select"
                  value={selectedMerchantId}
                  onChange={(e) => setSelectedMerchantId(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl bg-white/30 dark:bg-slate-900/60 border border-white/20 dark:border-white/5 text-slate-800 dark:text-white font-semibold outline-none focus:border-indigo-500 transition-all cursor-pointer"
                >
                  {activeMerchants.map((mer) => (
                    <option key={mer.id} value={mer.id} className="dark:bg-[#121320] dark:text-white">
                      {mer.businessName} ({mer.upiId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount field */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Paying Amount (₹)</label>
                <div className="relative font-bold">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    id="pay-input-amt"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full text-sm pl-8 pr-4 py-2 bg-white/30 dark:bg-slate-900/60 border border-white/20 dark:border-white/5 text-slate-800 dark:text-white rounded-xl outline-none focus:border-indigo-500 focus:bg-white/60 dark:focus:bg-black/40 transition-all font-mono"
                    placeholder="e.g. 799"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Reference Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Payer Reference Name</label>
                <input
                  type="text"
                  id="pay-input-payer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/30 dark:bg-slate-900/60 border border-white/20 dark:border-white/5 text-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:bg-white/60 dark:focus:bg-black/40 transition-all"
                  placeholder="e.g. Kiran Rao"
                  required
                />
              </div>

              {/* Customer UPI vpa */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Payer UPI ID (VPA)</label>
                <input
                  type="text"
                  id="pay-input-vpa"
                  value={customerUpi}
                  onChange={(e) => setCustomerUpi(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/30 dark:bg-slate-900/60 border border-white/20 dark:border-white/5 text-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:bg-white/60 dark:focus:bg-black/40 transition-all"
                  placeholder="e.g. payer@ybl"
                  required
                />
              </div>
            </div>

            {/* Choose payment channels */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Gateway Checkout Channel</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['QR Code', 'UPI ID', 'UPI Intent', 'Collect Request'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    id={`pay-channel-${method.replace(/\s+/g, '')}`}
                    onClick={() => setPaymentMethod(method)}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer outline-none flex flex-col items-center justify-center space-y-1.5 backdrop-blur-sm ${
                      paymentMethod === method
                        ? 'border-indigo-500 bg-white/40 dark:bg-white/[0.07] text-indigo-650 dark:text-indigo-400 font-bold shadow-xs'
                        : 'border-white/20 dark:border-white/5 bg-white/10 dark:bg-white/[0.01] hover:bg-white/30 dark:hover:bg-white/5 text-slate-550 dark:text-slate-400'
                    }`}
                  >
                    {method === 'QR Code' ? (
                      <QrCode className="w-4 h-4" />
                    ) : method === 'UPI Intent' ? (
                      <Smartphone className="w-4 h-4" />
                    ) : method === 'UPI ID' ? (
                      <Send className="w-4 h-4" />
                    ) : (
                      <Activity className="w-4 h-4" />
                    )}
                    <span className="text-[10px] block leading-none">{method}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI FRAUD DISPATCH TOGGLE */}
            <div className="p-4 bg-white/20 dark:bg-white/[0.04] rounded-xl border border-white/20 dark:border-white/5 space-y-2 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>Interactive Threat Vector Trigger</span>
                </span>
                
                <div className="flex space-x-1.5 bg-black/10 dark:bg-slate-800 p-0.5 rounded-lg border border-white/10">
                  <button
                    type="button"
                    onClick={() => setSimRisk('low')}
                    className={`text-[9px] font-black uppercase px-2.5 py-1 rounded cursor-pointer ${simRisk === 'low' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                  >
                    Low Risk
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimRisk('critical')}
                    className={`text-[9px] font-black uppercase px-2.5 py-1 rounded cursor-pointer ${simRisk === 'critical' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-rose-450'}`}
                  >
                    Threat Bot
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-relaxed">
                Choose <strong className="font-bold text-rose-600 dark:text-rose-400">Threat Bot</strong> to trigger malicious fingerprint headers, rate spamming, or proxies inside the transactional queue. Watching it immediately blocks the port and flags security triggers inside the administrative controls!
              </p>
            </div>

            {validationError && (
              <div className="text-xs text-rose-500 font-bold bg-rose-550/10 border border-rose-500/20 p-2.5 rounded-xl text-center">
                {validationError}
              </div>
            )}

            <button
              type="submit"
              id="payment-btn-submit"
              disabled={paymentStatus === 'processing'}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-extrabold text-sm tracking-wide rounded-xl shadow-lg cursor-pointer text-center"
            >
              Pay via Gateway Terminal (₹{payAmount || '0.00'})
            </button>
          </form>
        </div>

        {/* Visual Simulated Device Screen feedback - Right Column */}
        <div className="md:col-span-5 flex flex-col justify-center items-center">
          
          <div className="relative w-full max-w-xs bg-[#090A15]/95 border-[6px] border-[#252844] rounded-3xl h-[460px] overflow-hidden p-5 shadow-2xl flex flex-col justify-between text-white text-center backdrop-blur-md">
            
            {/* Phone notch visual */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-b-xl" />

            {/* Time / network simulation top row */}
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1.5">
              <span>NPCI SECURE CONNECTION</span>
              <div className="flex space-x-1 items-center">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>5G H+</span>
              </div>
            </div>

            {/* SCREEN BODY DYNAMICS */}
            <AnimatePresence mode="wait">
              
              {paymentStatus === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 my-auto"
                >
                  <SmartphoneIcon className="w-16 h-16 text-indigo-500 mx-auto animate-pulse" />
                  
                  <div className="space-y-1.5">
                    <h5 className="font-black text-sm uppercase tracking-widest text-slate-205">Waiting for Checkout</h5>
                    <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                      Select your paying parameters on the left and click Pay to wake the portal.
                    </p>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl mx-auto max-w-[200px]">
                    <span className="text-[9px] block text-slate-450 uppercase">Active Merchant</span>
                    <strong className="text-xs text-sky-400 text-indigo-300 break-words">{currentSelectedMerchant?.businessName || 'Skyline Ltd'}</strong>
                  </div>
                </motion.div>
              )}

              {paymentStatus === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 my-auto"
                >
                  <RefreshCw className="w-12 h-12 text-cyan-500 animate-spin mx-auto" />
                  
                  <div className="space-y-1">
                    <h5 className="text-sm font-bold tracking-wide">Processing Handshake</h5>
                    <p className="text-[10px] text-slate-400 max-w-[220px] mx-auto leading-relaxed">
                      Handshaking UPI provider nodes &amp; encrypting pin authorization packets...
                    </p>
                  </div>
                </motion.div>
              )}

              {paymentStatus === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5 my-auto"
                >
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto border border-emerald-500/20 animate-bounce">
                    <CheckCircle className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-emerald-500 tracking-wider font-mono">Status: Pay Completed</span>
                    <h4 className="text-lg font-black tracking-tight">₹{Number(payAmount).toLocaleString('en-IN')}</h4>
                    <p className="text-[10px] text-slate-400">Captured safely for {currentSelectedMerchant?.businessName}</p>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 inline-block">
                    <span className="text-[8px] font-mono uppercase tracking-widest text-slate-500 block">Bank UTR Transaction Token</span>
                    <strong className="font-mono text-[9px] text-slate-300">NPCI-{Math.floor(Math.random() * 900000 + 100000)}</strong>
                  </div>

                  <div>
                    <button
                      type="button"
                      id="sim-success-btn-reset"
                      onClick={() => setPaymentStatus('idle')}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-350 text-[10px] font-bold rounded-lg transition"
                    >
                      Run another simulation
                    </button>
                  </div>
                </motion.div>
              )}

              {paymentStatus === 'failed' && (
                <motion.div
                  key="failed"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5 my-auto"
                >
                  <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto border border-red-500/20">
                    <XCircle className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-red-500 tracking-wider font-mono">Status: TRANSACTION REJECTED</span>
                    <h4 className="text-lg font-black tracking-tight">₹{Number(payAmount).toLocaleString('en-IN')}</h4>
                    <p className="text-[10px] text-slate-400">Payer cancelled authorization or timer expired.</p>
                  </div>

                  <div>
                    <button
                      type="button"
                      id="sim-failed-btn-reset"
                      onClick={() => setPaymentStatus('idle')}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-350 text-[10px] font-bold rounded-lg transition"
                    >
                      Retry Checkout
                    </button>
                  </div>
                </motion.div>
              )}

              {paymentStatus === 'flagged' && (
                <motion.div
                  key="flagged"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5 my-auto"
                >
                  <div className="w-14 h-14 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mx-auto border border-rose-500/20 animate-pulse">
                    <ShieldAlert className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] uppercase font-black text-rose-500 tracking-widest font-mono bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded inline-block">
                      BLOCKED BY AI SHIELD
                    </span>
                    <h4 className="text-base font-black tracking-tight text-white">Security Violation Alert</h4>
                    <p className="text-[9px] text-slate-400 max-w-[210px] mx-auto leading-relaxed">
                      This transaction was denied. Proxy/robot signatures were logged to the network's system admins for audit.
                    </p>
                  </div>

                  <div className="bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/10 text-left">
                    <span className="text-[8px] font-bold text-rose-450 dark:text-rose-400 uppercase tracking-widest">Fraud Index parameters:</span>
                    <span className="block text-[8px] text-slate-400 mt-1">&bull; VPN proxy detection active</span>
                    <span className="block text-[8px] text-slate-400 mt-0.5">&bull; Risk rating: CRITICAL (92)</span>
                  </div>

                  <div>
                    <button
                      type="button"
                      id="sim-flagged-btn-reset"
                      onClick={() => setPaymentStatus('idle')}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-350 text-[10px] font-bold rounded-lg transition"
                    >
                      Clear Security Alarm
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Bottom visual phone home bar indicator */}
            <div className="w-32 h-1 bg-slate-800 rounded-full mx-auto" />

          </div>
        </div>

      </div>
    </div>
  );
}
