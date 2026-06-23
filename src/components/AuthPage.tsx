import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Mail, 
  Lock, 
  Phone, 
  Key, 
  ArrowRight, 
  Chrome, 
  ShieldAlert, 
  CheckCircle2, 
  Activity, 
  Sparkles,
  LockKeyhole
} from 'lucide-react';
import { Merchant } from '../types';

interface AuthPageProps {
  merchants: Merchant[];
  onLogin: (userType: 'merchant' | 'admin', merchantId: string | null) => void;
  onNavigate: (view: string) => void;
}

export default function AuthPage({ merchants, onLogin, onNavigate }: AuthPageProps) {
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mobile: '',
    otp: '',
  });

  const [error, setError] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpTimer, setOtpTimer] = useState<number>(0);
  const [showTwoFactor, setShowTwoFactor] = useState<boolean>(false);
  const [tfaCode, setTfaCode] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Timer for OTP code retry
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Prebuild fast checks
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsAuthenticating(true);

    setTimeout(() => {
      // 1. Check Admin Profile
      const emailLower = formData.email.toLowerCase();
      if ((emailLower === 'admin@aaravpay.com') && formData.password === 'admin123') {
        setIsAuthenticating(false);
        setShowTwoFactor(true); // Trigger 2FA step for Admin
        return;
      }

      // 2. Check Merchants
      const found = merchants.find(m => m.email.toLowerCase() === formData.email.toLowerCase());
      if (found) {
        if (formData.password === 'merchant123' || formData.password === 'sharma123' || found.panNumber) {
          setIsAuthenticating(false);
          // Auto route to Merchant profile
          onLogin('merchant', found.id);
          return;
        }
      }

      setIsAuthenticating(false);
      setError('Invalid login credentials. Try our quick-use presets!');
    }, 1200);
  };

  const handleRequestOtp = (e: React.MouseEvent) => {
    e.preventDefault();
    setError('');

    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }

    const foundByMobile = merchants.find(m => m.mobile === formData.mobile);
    if (!foundByMobile && formData.mobile !== '9876543210') {
      setError('Mobile number is not registered as an active merchant.');
      return;
    }

    setOtpSent(true);
    setOtpTimer(60);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.otp !== '4820' && formData.otp !== '1234') {
      setError('Incorrect OTP. Try entering 4820.');
      return;
    }

    setIsAuthenticating(true);

    setTimeout(() => {
      setIsAuthenticating(false);
      const foundByMobile = merchants.find(m => m.mobile === formData.mobile);
      if (foundByMobile) {
        onLogin('merchant', foundByMobile.id);
      } else {
        // Fallback default Skyline
        onLogin('merchant', 'mer_01');
      }
    }, 1000);
  };

  const handleSimulateGoogleAuth = () => {
    setError('');
    setIsAuthenticating(true);

    // Simulated Oauth popup delay
    setTimeout(() => {
      setIsAuthenticating(false);
      // Log in as default Active Merchant Skyline Retail
      onLogin('merchant', 'mer_01');
    }, 1500);
  };

  const handleVerifyTwoFactor = (e: React.FormEvent) => {
    e.preventDefault();
    if (tfaCode !== '9999' && tfaCode !== '8888') {
      setError('Invalid 2FA Authenticator Code. Try entering 9999.');
      return;
    }

    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      onLogin('admin', null);
    }, 1000);
  };

  const fillCredentialPreset = (type: 'admin' | 'merchant') => {
    setError('');
    setOtpSent(false);
    if (type === 'admin') {
      setFormData({
        email: 'admin@aaravpay.com',
        password: 'admin123',
        mobile: '',
        otp: '',
      });
      setLoginMethod('password');
    } else {
      setFormData({
        email: 'aravind@skylineretail.in',
        password: 'merchant123',
        mobile: '',
        otp: '',
      });
      setLoginMethod('password');
    }
  };

  return (
    <div className="relative max-w-md mx-auto px-4 py-16">
      
      {/* Visual background orbs */}
      <div className="absolute -top-10 -right-10 w-52 h-52 bg-indigo-500/15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-52 h-52 bg-cyan-500/15 rounded-full blur-[80px] pointer-events-none" />

      <div className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        
        {/* Gateway Color Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        <AnimatePresence mode="wait">
          {!showTwoFactor ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="text-center mb-6">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 mx-auto mb-3">
                  <Lock className="w-5 h-5 animate-pulse" />
                </div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">Access Gateway Center</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select your verification node to log in securely.</p>
              </div>

              {/* Login Method Tab Toggles */}
              <div className="flex border-b border-slate-100 dark:border-slate-900 pb-3 mb-6">
                <button
                  type="button"
                  id="auth-tab-pass"
                  onClick={() => {
                    setLoginMethod('password');
                    setError('');
                  }}
                  className={`flex-1 text-center py-2 text-xs font-bold transition-all border-b-2 outline-none cursor-pointer ${
                    loginMethod === 'password'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Password Login
                </button>
                <button
                  type="button"
                  id="auth-tab-otp"
                  onClick={() => {
                    setLoginMethod('otp');
                    setError('');
                  }}
                  className={`flex-1 text-center py-2 text-xs font-bold transition-all border-b-2 outline-none cursor-pointer ${
                    loginMethod === 'otp'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Mobile OTP
                </button>
              </div>

              {/* Central Auth Error Screen */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-950/20 text-[11px] text-red-600 dark:text-red-400 rounded-lg flex items-start space-x-2 border border-red-200/50">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* FORM FIELDS */}
              {loginMethod === 'password' ? (
                <form id="auth-form-password" onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Registered Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        id="auth-input-email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full text-sm pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl outline-none focus:bg-white dark:focus:bg-black transition-all"
                        placeholder="e.g. keypartner@store.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Security Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        id="auth-input-password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full text-sm pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl outline-none focus:bg-white dark:focus:bg-black transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="auth-btn-password-submit"
                    disabled={isAuthenticating}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm tracking-wide transition shadow-lg shadow-indigo-500/10 cursor-pointer flex items-center justify-center space-x-2"
                  >
                    {isAuthenticating ? (
                      <>
                        <Activity className="w-4 h-4 animate-spin text-white" />
                        <span>Validating Certificate...</span>
                      </>
                    ) : (
                      <>
                        <span>Validate credentials</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  {!otpSent ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Registered Phone Number</label>
                        <div className="relative font-semibold">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <span className="absolute left-9 top-1/2 -translate-y-1/2 text-xs text-slate-500 dark:text-slate-400 font-bold">+91</span>
                          <input
                            type="tel"
                            id="auth-input-mobile"
                            maxLength={10}
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/[^0-9]/g, '') })}
                            className="w-full text-sm pl-18 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl outline-none focus:bg-white dark:focus:bg-black transition-all"
                            placeholder="e.g. 9876543210"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        id="auth-btn-otp-request"
                        onClick={handleRequestOtp}
                        className="w-full py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-bold text-xs cursor-pointer tracking-wider hover:bg-indigo-500 transition"
                      >
                        Request Secure Verification Key
                      </button>
                    </div>
                  ) : (
                    <form id="auth-form-otp" onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="p-2.5 bg-indigo-500/5 rounded-lg border border-indigo-500/10 text-center text-xs text-slate-500 dark:text-slate-400">
                        One-Time Passcode sent containing 4 digits. Use <strong className="font-bold text-indigo-500">4820</strong> for instant validation!
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Enter OTP Key</label>
                        <div className="relative">
                          <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            maxLength={4}
                            id="auth-input-otp"
                            value={formData.otp}
                            onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/[^0-9]/g, '') })}
                            className="w-full text-center text-lg font-black tracking-widest py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl outline-none"
                            placeholder="0 0 0 0"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-550 dark:text-slate-400">
                        <span>OTP Code Valid</span>
                        <span>0:{otpTimer < 10 ? `0${otpTimer}` : otpTimer} s</span>
                      </div>

                      <button
                        type="submit"
                        id="auth-btn-otp-submit"
                        disabled={isAuthenticating}
                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm cursor-pointer hover:shadow-md transition"
                      >
                        {isAuthenticating ? 'Handshaking bank...' : 'Confirm authentication'}
                      </button>

                      <div className="text-center">
                        <button
                          type="button"
                          id="auth-btn-otp-reset"
                          disabled={otpTimer > 0}
                          onClick={() => {
                            setOtpSent(false);
                            setFormData({ ...formData, otp: '' });
                          }}
                          className={`text-[10px] font-bold ${otpTimer > 0 ? 'text-slate-350 cursor-not-allowed' : 'text-indigo-500'}`}
                        >
                          Request code again
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* GOOGLE FEDERATION */}
              <div className="relative flex items-center justify-center my-6">
                <div className="absolute inset-x-0 h-px bg-slate-100 dark:bg-slate-900" />
                <span className="relative px-3 bg-white dark:bg-slate-950 text-[10px] uppercase font-bold tracking-widest text-slate-400">Or federated sign in</span>
              </div>

              <button
                type="button"
                id="auth-btn-google"
                onClick={handleSimulateGoogleAuth}
                className="w-full py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-xs font-bold tracking-wide transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Chrome className="w-4 h-4 text-red-500" />
                <span>Sign in with Google API</span>
              </button>

              {/* DEMO ACCOUNTS HELPER BOX */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-900">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center space-x-1.5 mb-2.5">
                  <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span>Preset Authority Nodes for Debugging</span>
                </span>
                
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() => fillCredentialPreset('merchant')}
                    className="p-2 text-left bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-50 hover:border-indigo-200 dark:hover:bg-indigo-950/40 dark:border-indigo-950/50 border border-slate-200/50 dark:border-slate-800/50 rounded-lg transition"
                  >
                    <span className="block font-bold text-slate-850 dark:text-slate-200">Skyline Merchant</span>
                    <span className="text-[9px] text-slate-500">Auto-fill keys</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillCredentialPreset('admin')}
                    className="p-2 text-left bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-950/40 dark:border-purple-950/50 border border-slate-200/50 dark:border-slate-800/50 rounded-lg transition"
                  >
                    <span className="block font-bold text-slate-850 dark:text-slate-200">System Admin</span>
                    <span className="text-[9px] text-slate-500">Auto-fill keys + 2FA</span>
                  </button>
                </div>
              </div>

            </motion.div>
          ) : (
            <motion.div
              key="2fa"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="text-center mb-6">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 mx-auto mb-3">
                  <LockKeyhole className="w-5 h-5 animate-bounce" />
                </div>
                <h2 className="text-lg font-black text-slate-950 dark:text-white">Two-Factor Authentication</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Admin level security requires direct Google 2FA codes.</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-950/20 text-[10px] text-red-600 dark:text-red-400 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyTwoFactor} className="space-y-4">
                <div className="p-3 bg-purple-500/5 rounded-lg border border-purple-500/10 text-center text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Enter your Authenticator Code. Use <strong className="font-bold text-purple-600 dark:text-purple-400">9999</strong> for instant access.
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">6-Digit Google Auth Code</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={tfaCode}
                    onChange={(e) => setTfaCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full text-center text-xl font-black py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl tracking-widest outline-none"
                    placeholder="— — — —"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTwoFactor(false);
                      setFormData({ ...formData, password: '' });
                      setError('');
                    }}
                    className="flex-1 py-2 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-50 transition"
                  >
                    Choose different Account
                  </button>

                  <button
                    type="submit"
                    id="auth-btn-2fa-submit"
                    className="flex-1 py-2.5 bg-purple-600 dark:bg-purple-500 text-white rounded-xl font-bold text-xs tracking-wider cursor-pointer hover:bg-purple-500 transition"
                  >
                    Confirm 2FA
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
