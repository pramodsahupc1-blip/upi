import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Key, 
  Sparkles,
  Link2
} from 'lucide-react';
import { Merchant } from '../types';

interface MerchantRegisterProps {
  onRegister: (merchant: Omit<Merchant, 'id' | 'apiKey' | 'webhookUrl' | 'createdAt' | 'kycSubmitted' | 'kycApprovedAt' | 'status'>) => void;
  onNavigate: (view: string) => void;
}

export default function MerchantRegister({ onRegister, onNavigate }: MerchantRegisterProps) {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    mobile: '',
    email: '',
    gstNumber: '',
    panNumber: '',
    bankAccount: '',
    bankName: 'HDFC Bank',
    ifscCode: '',
    upiId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationProgress, setVerificationProgress] = useState<string[]>([]);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [newlyCreatedKeys, setNewlyCreatedKeys] = useState<{ apiKey: string; upiId: string } | null>(null);

  const validateStep = (currentStep: number) => {
    const curErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.businessName.trim()) curErrors.businessName = 'Business name is required';
      if (!formData.ownerName.trim()) curErrors.ownerName = 'Owner name is required';
      if (!/^[6-9]\d{9}$/.test(formData.mobile)) curErrors.mobile = 'Enter a valid 10-digit mobile number';
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) curErrors.email = 'Enter a valid email address';
    } else if (currentStep === 2) {
      if (!formData.gstNumber.trim() && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(formData.gstNumber.toUpperCase())) {
        curErrors.gstNumber = 'Enter a valid 15-character GSTIN (e.g. 27AAAAA1111A1Z1)';
      }
      if (!/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(formData.panNumber.toUpperCase())) {
        curErrors.panNumber = 'Enter a valid 10-character PAN number (e.g. ABCDE1234F)';
      }
    } else if (currentStep === 3) {
      if (!/^\d{9,18}$/.test(formData.bankAccount)) curErrors.bankAccount = 'Enter a valid bank account number (9 to 18 digits)';
      if (!formData.bankName) curErrors.bankName = 'Select a bank name';
      if (!/^[A-Z]{4}0[A-Z\d]{6}$/.test(formData.ifscCode.toUpperCase())) {
        curErrors.ifscCode = 'Enter a valid 11-Digit IFSC Code (e.g. HDFC0000124)';
      }
      if (!formData.upiId.includes('@')) {
        curErrors.upiId = 'Enter a valid UPI ID (must contain @, e.g. store@axis)';
      }
    }

    setErrors(curErrors);
    return Object.keys(curErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
  };

  // Simulate AI/Database lookup in GSTN, NSDL, NPCI systems
  const handleVerifyBusiness = () => {
    if (!validateStep(2)) return;

    setIsVerifying(true);
    setVerificationProgress([]);
    
    const checkpoints = [
      'Querying GST State servers with 15-digit GSTIN...',
      'Matching GST Profile against Ministry of Corporate Affairs database...',
      'Verifying Company PAN registration on NSDL server...',
      'Checking promoter PAN identity details for KYC clearance...',
      'NPCI bank node handshake successful. Verification completed.'
    ];

    checkpoints.forEach((msg, idx) => {
      setTimeout(() => {
        setVerificationProgress((prev) => [...prev, msg]);
        if (idx === checkpoints.length - 1) {
          setIsVerified(true);
          setIsVerifying(false);
        }
      }, (idx + 1) * 900);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    // Trigger state save
    onRegister({
      businessName: formData.businessName,
      ownerName: formData.ownerName,
      mobile: formData.mobile,
      email: formData.email,
      gstNumber: formData.gstNumber.toUpperCase(),
      panNumber: formData.panNumber.toUpperCase(),
      bankAccount: formData.bankAccount,
      bankName: formData.bankName,
      ifscCode: formData.ifscCode.toUpperCase(),
      upiId: formData.upiId.toLowerCase(),
    });

    // Mock API generation visual response
    const mockApiKey = 'pk_live_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    setNewlyCreatedKeys({
      apiKey: mockApiKey,
      upiId: formData.upiId.toLowerCase()
    });
    setStep(4);
  };

  return (
    <div className="relative max-w-2xl mx-auto px-4 py-12">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-purple-500/15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-500/15 rounded-full blur-[80px] pointer-events-none" />

      {/* Progress Stepper Header */}
      {step < 4 && (
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Merchant Onboarding</h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">Submit your details to activate dynamic instant UPI Collections.</p>
          
          <div className="flex items-center justify-center space-x-4 mt-8 max-w-sm mx-auto">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s 
                      ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md shadow-blue-500/20 scale-110' 
                      : step > s 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-450'
                  }`}>
                    {step > s ? '✓' : s}
                  </div>
                  <span className={`ml-2 text-xs font-semibold hidden sm:inline ${step === s ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
                    {s === 1 ? 'Contacts' : s === 2 ? 'Identity' : 'Bank Node'}
                  </span>
                </div>
                {s < 3 && <div className={`h-0.5 w-10 ${step > s ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-800'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Actual Form Cards */}
      <div className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        
        {/* Subtle glow border */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
              className="space-y-5"
            >
              <div className="border-b border-slate-100 dark:border-slate-900 pb-3 mb-2 flex items-center space-x-2">
                <User className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-800 dark:text-white">Business Owner &amp; Contact Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Business Entity Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      id="register-input-business"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border ${
                        errors.businessName ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                      } bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:bg-white dark:focus:bg-black transition-all`}
                      placeholder="e.g. Skyline Retail Pvt Ltd"
                    />
                  </div>
                  {errors.businessName && <p className="text-[10px] text-red-500 mt-1">{errors.businessName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Owner / Promoter Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      id="register-input-owner"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border ${
                        errors.ownerName ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                      } bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:bg-white dark:focus:bg-black transition-all`}
                      placeholder="e.g. Aravind Sharma"
                    />
                  </div>
                  {errors.ownerName && <p className="text-[10px] text-red-500 mt-1">{errors.ownerName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      id="register-input-mobile"
                      value={formData.mobile}
                      maxLength={10}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/[^0-9]/g, '') })}
                      className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border ${
                        errors.mobile ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                      } bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:bg-white dark:focus:bg-black transition-all`}
                      placeholder="e.g. 9876543210"
                    />
                  </div>
                  {errors.mobile && <p className="text-[10px] text-red-500 mt-1">{errors.mobile}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      id="register-input-email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border ${
                        errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                      } bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:bg-white dark:focus:bg-black transition-all`}
                      placeholder="e.g. corporate@company.com"
                    />
                  </div>
                  {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  id="register-btn-step1-next"
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 dark:bg-blue-500 hover:bg-blue-500 text-white rounded-xl font-bold text-sm tracking-wide transition cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
              className="space-y-5"
            >
              <div className="border-b border-slate-100 dark:border-slate-900 pb-3 mb-2 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-800 dark:text-white">Business Identification (KYC)</h3>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-lg mb-2">
                We are mandated by NPCI and RBI standards to collect verification files. Try entering a mock details grid, then click <strong className="font-bold text-indigo-600 dark:text-indigo-400">Verify Business</strong> to simulate a secure validation node handshake.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">GST Identification Number (GSTIN)</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      id="register-input-gstin"
                      value={formData.gstNumber}
                      onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                      className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border uppercase ${
                        errors.gstNumber ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                      } bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:bg-white dark:focus:bg-black transition-all`}
                      placeholder="e.g. 27AAAAA1111A1Z1"
                    />
                  </div>
                  {errors.gstNumber ? (
                    <p className="text-[10px] text-red-500 mt-1">{errors.gstNumber}</p>
                  ) : (
                    <p className="text-[9px] text-slate-400 dark:text-slate-550 mt-1">Format: 2 digits + 10-char PAN + 1 entity-digit + Z + 1 check-char</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Permanent Account Number (PAN)</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      id="register-input-pan"
                      value={formData.panNumber}
                      maxLength={10}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                      className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border uppercase ${
                        errors.panNumber ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                      } bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:bg-white dark:focus:bg-black transition-all`}
                      placeholder="e.g. ABCDE1234F"
                    />
                  </div>
                  {errors.panNumber && <p className="text-[10px] text-red-500 mt-1">{errors.panNumber}</p>}
                </div>

                {/* VERIFICATION HANDSHAKE SIMULATION SECTION */}
                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center space-x-2">
                      <Cpu className="w-4 h-4 text-indigo-500" />
                      <span>Security Handshake Node</span>
                    </span>
                    {!isVerified && !isVerifying && (
                      <button
                        type="button"
                        id="register-btn-verify-firm"
                        onClick={handleVerifyBusiness}
                        className="px-3.5 py-1.5 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs tracking-wide transition cursor-pointer"
                      >
                        Verify Business Detail
                      </button>
                    )}
                    {isVerified && (
                      <span className="text-xs text-emerald-500 dark:text-emerald-400 font-bold flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Corporate Node Verified</span>
                      </span>
                    )}
                  </div>

                  {/* Progressive logger logs feedback */}
                  {(isVerifying || verificationProgress.length > 0) && (
                    <div className="space-y-1.5 font-mono text-[9px] bg-slate-950 text-emerald-400 p-3 rounded-lg max-h-[140px] overflow-y-auto border border-slate-800 leading-relaxed">
                      {verificationProgress.map((prog, idx) => (
                        <div key={idx} className="flex items-start space-x-2 animate-fade-in">
                          <span className="text-indigo-400 shrink-0">[{idx + 1}]</span>
                          <span>{prog}</span>
                        </div>
                      ))}
                      {isVerifying && (
                        <div className="flex items-center space-x-2 text-slate-400 italic">
                          <Activity className="w-3 h-3 text-cyan-400 animate-spin shrink-0" />
                          <span>Polling government nodes...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  id="register-btn-step2-prev"
                  onClick={handlePrev}
                  className="flex items-center space-x-2 px-5 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs cursor-pointer transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  id="register-btn-step2-next"
                  onClick={handleNext}
                  disabled={!isVerified}
                  className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide cursor-pointer transition ${
                    isVerified 
                      ? 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-500' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15 }}
              className="space-y-5"
            >
              <div className="border-b border-slate-100 dark:border-slate-900 pb-3 mb-2 flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-800 dark:text-white">Settlement Bank Node &amp; UPI ID Config</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Settlement Bank Name</label>
                  <select
                    id="register-input-bankname"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full text-sm pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:bg-white dark:focus:bg-black transition-all"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Bank Account Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      id="register-input-bankacc"
                      maxLength={18}
                      value={formData.bankAccount}
                      onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value.replace(/[^0-9]/g, '') })}
                      className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border ${
                        errors.bankAccount ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                      } bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:bg-white dark:focus:bg-black transition-all`}
                      placeholder="e.g. 918273645019"
                    />
                  </div>
                  {errors.bankAccount && <p className="text-[10px] text-red-500 mt-1">{errors.bankAccount}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Bank IFSC Code</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      id="register-input-ifsc"
                      maxLength={11}
                      value={formData.ifscCode}
                      onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                      className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border uppercase ${
                        errors.ifscCode ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                      } bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:bg-white dark:focus:bg-black transition-all`}
                      placeholder="e.g. HDFC0000124"
                    />
                  </div>
                  {errors.ifscCode ? (
                    <p className="text-[10px] text-red-500 mt-1">{errors.ifscCode}</p>
                  ) : (
                    <p className="text-[9px] text-slate-400 dark:text-slate-550 mt-1">11 alphanumeric characters. 5th character is always 0</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Payout/Store UPI ID</label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      id="register-input-upiid"
                      value={formData.upiId}
                      onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                      className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border lowercase ${
                        errors.upiId ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                      } bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:bg-white dark:focus:bg-black transition-all`}
                      placeholder="e.g. promotername@okhdfc"
                    />
                  </div>
                  {errors.upiId && <p className="text-[10px] text-red-500 mt-1">{errors.upiId}</p>}
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  id="register-btn-step3-prev"
                  onClick={handlePrev}
                  className="flex items-center space-x-2 px-5 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs cursor-pointer transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  id="register-btn-submit-kyc"
                  onClick={handleSubmit}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm tracking-wide hover:shadow-lg hover:shadow-blue-500/20 active:translate-y-0.5 transition cursor-pointer"
                >
                  <span>Submit KYC Details</span>
                  <ShieldCheck className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && newlyCreatedKeys && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="text-center space-y-6 py-4"
            >
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Merchant Registered Successfully!</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Your business lookup is verified and your KYC packet is compiled for admin approval. You can now use your credentials in the Payment Gateway Simulator.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-left space-y-4 max-w-md mx-auto">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center space-x-1.5 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Sandbox credentials</span>
                  </span>
                  <span className="text-[10px] uppercase font-mono font-bold bg-amber-500/15 text-amber-600 border border-amber-500/25 px-2 py-0.5 rounded">
                    KYC Pending Approval
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Assigned Merchant UPI ID</span>
                    <strong className="text-sm font-mono text-slate-800 dark:text-slate-200">{newlyCreatedKeys.upiId}</strong>
                  </div>

                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Sandbox API Auth Key</span>
                    </div>
                    <div className="relative mt-1 bg-slate-950 p-2.5 rounded-lg border border-slate-850 font-mono text-[10px] text-slate-300 break-all select-all flex items-center justify-between">
                      <code>{newlyCreatedKeys.apiKey}</code>
                      <Key className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-3" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto pt-4">
                <button
                  type="button"
                  id="register-btn-dashboard-go"
                  onClick={() => onNavigate('login')}
                  className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm cursor-pointer"
                >
                  <span>Go to Merchant Login</span>
                </button>

                <button
                  type="button"
                  id="register-btn-sim-go"
                  onClick={() => onNavigate('pay')}
                  className="flex items-center justify-center space-x-2 px-5 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs cursor-pointer transition"
                >
                  <span>Test Simulator Gateway</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
