import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  CheckCircle, 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  QrCode, 
  Activity, 
  Lock, 
  Terminal, 
  MessageSquare,
  HelpCircle,
  Plus,
  Minus,
  Sparkles,
  RefreshCw,
  Globe,
  Award,
  ArrowUpRight
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  isDarkMode: boolean;
}

export default function LandingPage({ onNavigate, isDarkMode }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<'curl' | 'node' | 'python'>('curl');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [demoStep, setDemoStep] = useState<number>(0);
  const [demoAmount, setDemoAmount] = useState<string>('500');
  const [demoStatus, setDemoStatus] = useState<'idle' | 'generating' | 'scanned' | 'verifying' | 'success'>('idle');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Auto run demo simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (demoStatus === 'generating') {
      timer = setTimeout(() => setDemoStatus('scanned'), 1200);
    } else if (demoStatus === 'scanned') {
      timer = setTimeout(() => setDemoStatus('verifying'), 1200);
    } else if (demoStatus === 'verifying') {
      timer = setTimeout(() => setDemoStatus('success'), 1500);
    } else if (demoStatus === 'success') {
      timer = setTimeout(() => setDemoStatus('idle'), 4000);
    }
    return () => clearTimeout(timer);
  }, [demoStatus]);

  const handleStartDemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoAmount || isNaN(Number(demoAmount))) return;
    setDemoStatus('generating');
  };

  const codeSnippets = {
    curl: `curl -X POST https://api.aaravpay.com/v1/payments/create \\
  -H "Authorization: Bearer pk_live_51Msk72H..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": ${demoAmount}.00,
    "currency": "INR",
    "upi_id": "merchant@aaravpay",
    "customer_name": "Rita Roy",
    "callback_url": "https://callback.yoursite.com"
  }'`,
    node: `const AaravPay = require('aaravpay-sdk');
const gateway = new AaravPay({ apiKey: 'pk_live_51Msk72H...' });

const payment = await gateway.payments.create({
  amount: parseFloat('${demoAmount}.00'),
  currency: 'INR',
  upiId: 'merchant@aaravpay',
  customerName: 'Rita Roy',
  callbackUrl: 'https://callback.yoursite.com'
});

console.log(\`Dynamic QR: \${payment.qr_string}\`);`,
    python: `import aaravpay

client = aaravpay.Client(api_key='pk_live_51Msk72H...')

payment = client.payments.create(
    amount=${demoAmount}.00,
    currency='INR',
    upi_id='merchant@aaravpay',
    customer_name='Rita Roy',
    callback_url='https://callback.yoursite.com'
)

print(f"Checkout URL: {payment.checkout_url}")`
  };

  const pricingModels = [
    {
      name: 'Starter Plan',
      description: 'Ideal for early-stage startups and small stores.',
      price: billingCycle === 'monthly' ? '₹0/mo' : '₹0/mo',
      fee: '1.2% per transaction',
      features: [
        'Instant Static & Dynamic QRs',
        'Direct UPI Intent Checkout',
        'Standard Settlement (T+1 Days)',
        'Email Support (Response within 24h)',
        'Standard Developer API Sandbox',
        'Basic Dashboard Analytics',
      ],
      tag: 'Free Trial',
      cta: 'Get Started',
      view: 'register'
    },
    {
      name: 'Business Pro',
      description: 'Best for growing businesses & high transaction volumes.',
      price: billingCycle === 'monthly' ? '₹1,499/mo' : '₹1,199/mo',
      fee: '0.8% per transaction',
      features: [
        'Universal Auto-Settlement Engine',
        'AI Fraud Detection Shield',
        'Unlimited API and SDK access',
        'Dedicated Priority Live Chat',
        'Custom Webhooks & SMTP Integration',
        'Advanced Revenue Forecasting Charts',
        'Multi-Bank Integration Out-of-the-Box',
      ],
      tag: 'Most Popular',
      cta: 'Scale Up Now',
      view: 'register',
      highlight: true
    },
    {
      name: 'Enterprise Sky_Tier',
      description: 'Custom bespoke infrastructure for large organizations.',
      price: 'Custom Price',
      fee: 'As low as 0.25% per tx',
      features: [
        'Dedicated Private Server Node',
        'Zero-Latency Settlement Queue (T+0 mins)',
        'Custom Webhook Failover Redundancy',
        'Strict SLA: 99.99% Node Uptime',
        'Custom Web Client Whitelabeling',
        'Direct Account Team Manager',
        'Continuous Vulnerability Scans',
      ],
      tag: 'Enterprise Elite',
      cta: 'Contact Sales',
      view: 'contact'
    }
  ];

  const faqs = [
    {
      q: "What is a UPI Payment Gateway and how does it work?",
      a: "A UPI Payment Gateway streamlines merchant acceptance of payments via Unified Payments Interface (UPI). It dynamically generates QR codes, initiates deep linking for UPI apps (GPay, PhonePe, Paytm), verifies merchant verification tokens, and registers settlement events instantly back into your ledger."
    },
    {
      q: "Are there any setup fees or hidden charges?",
      a: "No setup fees, hidden monthly maintenance, or security deposit requirements! Our pricing is completely transparent—just a simple transaction MDR or flat subscription for our Business tier. Standard UPI zero-MDR option is fully supported built-in."
    },
    {
      q: "How does the Real-Time Settlement Engine function?",
      a: "While typical providers settle in T+1 or T+2, our platform utilizes multi-bank host integration to settle funds in T+0 (within 30 minutes) directly into your linked corporate bank account. This provides your business with active, uninterrupted capital flow."
    },
    {
      q: "How does the AI Fraud Protection system protect my business?",
      a: "Our gateway scans device fingerprints, transaction intervals, host geolocations, and bank response headers to compute a real-time risk index (0-100). Suspicious transaction velocities are instantly queued for manual check or blocked with 2FA, lowering chargeback liability to near-zero."
    },
    {
      q: "Can I embed the API easily into React or Node.js backends?",
      a: "Absolutely! We provide straightforward developer APIs, simple webhook signals, and standard Node, Python, and React SDK snippets. Generate your sandbox API keys in under 2 minutes directly inside our Merchant Console."
    }
  ];

  return (
    <div className="relative overflow-hidden selection:bg-purple-500 selection:text-white">
      
      {/* ------------------ HERO SECTION ------------------ */}
      <section className="relative px-6 pt-20 pb-20 md:pt-32 md:pb-28">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7 flex flex-col space-y-6 relative z-10">
            <div className="inline-flex items-center space-x-2 bg-white/20 dark:bg-white/[0.04] backdrop-blur-md border border-white/30 dark:border-white/10 px-4 py-1.5 rounded-full text-xs font-semibold text-cyan-600 dark:text-cyan-400 w-fit cursor-default hover:border-purple-500/40 transition shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Host Settlement Engine Enabled</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none text-slate-900 dark:text-white">
              Fast, Secure & Instant <br className="hidden md:inline" />
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent">
                AARAV PAY
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              Accept merchant UPI payments, initiate deep-linked payouts, and process automated bank settlements with India's most developer-friendly payment platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                id="hero-btn-get-started"
                className="group relative flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white cursor-pointer hover:shadow-lg hover:shadow-blue-500/20 active:translate-y-0.5 transition-all outline-none"
                onClick={() => onNavigate('register')}
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>

              <button
                id="hero-btn-login"
                className="flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl font-semibold border border-white/20 text-slate-800 dark:text-slate-200 bg-white/20 dark:bg-white/[0.03] backdrop-blur-md cursor-pointer hover:bg-slate-100/50 dark:hover:bg-white/5 transition"
                onClick={() => onNavigate('login')}
              >
                <span>Login to Dashboard</span>
              </button>

              <button
                id="hero-btn-admin"
                className="flex items-center justify-center space-x-2 px-4 py-3.5 rounded-xl font-medium text-slate-500 dark:text-slate-400 text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                onClick={() => onNavigate('admin')}
              >
                <span>Admin Panel Portal &rarr;</span>
              </button>
            </div>

            {/* Feature Badges under landing buttons */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200/50 dark:border-white/10 max-w-lg">
              <div>
                <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">99.99%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Host Api Uptime</div>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">&lt; 30 min</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Settlements (T+0)</div>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">0% Fee</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Starter Core MDR</div>
              </div>
            </div>
          </div>

          {/* Right Hero Demo Simulation */}
          <div className="lg:col-span-5 relative flex justify-center z-10">
            
            {/* Visual glow frame */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 rounded-3xl blur-2xl transform rotate-3 scale-105" />

            <div className="relative w-full max-w-sm bg-white/40 dark:bg-white/[0.02] border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden p-6">
              
              {/* Dynamic simulated phone header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
                  <span className="text-[11px] font-mono tracking-wider uppercase text-slate-500 dark:text-slate-400">LIVE GATEWAY DEMO</span>
                </div>
                <ShieldCheck className="w-4 h-4 text-cyan-500" />
              </div>

              {/* Input for demo simulation */}
              <form onSubmit={handleStartDemo} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Enter Gateway Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-semibold text-sm">₹</span>
                    <input
                      type="number"
                      value={demoAmount}
                      onChange={(e) => setDemoAmount(e.target.value)}
                      disabled={demoStatus !== 'idle'}
                      className="w-full text-base font-semibold pl-8 pr-12 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-black transition-all"
                      placeholder="e.g. 500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono uppercase bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">INR</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                  {demoStatus === 'idle' && (
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:shadow-md hover:from-blue-500 hover:to-indigo-500 transition cursor-pointer"
                    >
                      Process Dynamic Transaction Flow
                    </button>
                  )}

                  {/* GATEWAY LOADING STATE CHUTE */}
                  {demoStatus !== 'idle' && (
                    <div className="flex flex-col items-center py-4 space-y-3">
                      {demoStatus === 'generating' && (
                        <>
                          <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin" />
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Generating Secure UPI QR Node...</p>
                        </>
                      )}

                      {demoStatus === 'scanned' && (
                        <>
                          <div className="relative p-2 bg-indigo-500/10 rounded-2xl">
                            <QrCode className="w-12 h-12 text-indigo-500" />
                            <div className="absolute inset-x-0 top-1/2 h-1 bg-cyan-400/80 animate-bounce" />
                          </div>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">QR Generated &amp; Customer Scanned</p>
                          <span className="text-[10px] text-zinc-500 font-mono">User: kiran@paytm</span>
                        </>
                      )}

                      {demoStatus === 'verifying' && (
                        <>
                          <Activity className="w-8 h-8 text-purple-500 animate-pulse" />
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Decrypting UPI Pin Payload &amp; Verifying Bank Node...</p>
                        </>
                      )}

                      {demoStatus === 'success' && (
                        <>
                          <CheckCircle className="w-10 h-10 text-emerald-500 animate-bounce" />
                          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Transaction Confirmed!</p>
                          <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Received ₹{Number(demoAmount).toLocaleString('en-IN')}</p>
                          <div className="text-[9px] font-mono uppercase bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-300">
                            UTR: TXN {Math.floor(Math.random() * 900000 + 100000)}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </form>

              {/* Developer Tab Preview underneath transaction panel */}
              <div className="mt-4 border-t border-slate-100 dark:border-slate-900 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex space-x-1.5 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                    {(['curl', 'node', 'python'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`text-[10px] px-2.5 py-1 rounded-md font-mono transition-all lowercase ${
                          activeTab === tab
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="flex space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  </div>
                </div>

                <div className="relative">
                  <pre className="text-[9px] font-mono bg-slate-950 text-slate-300 p-3 rounded-lg overflow-x-auto max-h-[120px] border border-slate-800">
                    <code>{codeSnippets[activeTab]}</code>
                  </pre>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ------------------ FEATURES SECTION ------------------ */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col space-y-3">
            <h2 className="text-xs font-bold tracking-widest uppercase text-indigo-600 dark:text-indigo-400">
              POWERFUL CAPABILITIES
            </h2>
            <p className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
              Revolutionizing How Businesses Collect UPI Payments
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
              A robust fintech ecosystem with advanced automation, anti-fraud telemetry, and high-performance routing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-md p-8 rounded-2xl border border-white/20 dark:border-white/[0.05] hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all group shadow-sm hover:shadow-lg hover:shadow-blue-500/5">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Instant Real-Time Transfers</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Direct peer-to-merchant settlements triggered dynamically of actual bank nodes. Settlements run 24/7/365 with ZERO hold queues.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-md p-8 rounded-2xl border border-white/20 dark:border-white/[0.05] hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all group shadow-sm hover:shadow-lg hover:shadow-indigo-500/5">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 transition">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Smart QR Code payments</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Generate dynamic QR codes mapped precisely with billing values or use static QRs for physically fast customer self-scans.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-md p-8 rounded-2xl border border-white/20 dark:border-white/[0.05] hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all group shadow-sm hover:shadow-lg hover:shadow-purple-500/5">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 mb-6 group-hover:scale-110 transition">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Merchant Live Dashboard</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Track revenue, payment success indexes, active API credentials, settlements, and customers from one modern central UI.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-md p-8 rounded-2xl border border-white/20 dark:border-white/[0.05] hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all group shadow-sm hover:shadow-lg hover:shadow-cyan-500/5">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-500 mb-6 group-hover:scale-110 transition">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Military Grade Security</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                E2E payload encryption, device verification tokens, secure Webhooks logs, and automated PCI-DSS standard compliant structures.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-md p-8 rounded-2xl border border-white/20 dark:border-white/[0.05] hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all group shadow-sm hover:shadow-lg hover:shadow-emerald-500/5">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Robust Developer SDKs</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Connect your servers utilizing simple webhook endpoints, customizable pricing web views, and prebuilt SDK helpers for Node, Python, and cURL.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-md p-8 rounded-2xl border border-white/20 dark:border-white/[0.05] hover:border-red-500/50 dark:hover:border-red-500/50 transition-all group shadow-sm hover:shadow-lg hover:shadow-red-500/5">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 mb-6 group-hover:scale-110 transition">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Automated AI Fraud Shield</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Integrated real-time smart risk profiling calculating device reputation scores, geofence, and velocity patterns to prevent scams.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ------------------ ARCHITECTURE & SAAS ROADMAP ------------------ */}
      <section className="py-20 bg-slate-50/50 dark:bg-slate-950/20 border-y border-slate-100 dark:border-slate-900/50 relative z-10">
        <div className="max-w-7xl mx-auto px-6 space-y-24">
          
          {/* Step 1: Merchant Journey */}
          <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">
                The Merchant Experience
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                The Core Merchant Journey Blueprint
              </h2>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                A streamlined, automated SaaS onboarding flow that guarantees rapid merchant activation and secure transactions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
              {[
                { step: '01', title: 'Create Account', desc: 'SaaS Signup is instant; promoters instantly register basic admin details.' },
                { step: '02', title: 'Complete KYC', desc: 'Real-time corporate PAN check, GST matching, and instant penny-drop bank link.' },
                { step: '03', title: 'Connect Provider', desc: 'Select any licensed aggregator (Razorpay, Cashfree, PhonePe) to route payments.' },
                { step: '04', title: 'Go Live / Collect', desc: 'Instantly accept UPI payments using dynamic QR displays or payment links.' },
                { step: '05', title: 'Auto Sweep', desc: 'Receive webhooks and generate payouts straight into linked nodes.' },
              ].map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-4 hover:border-indigo-500/45 dark:hover:border-indigo-500/45 transition">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-xs">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</h4>
                    <p className="text-[11px] text-slate-450 mt-1 pb-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Architecture Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                AARAV PAY SaaS Engine
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                Modern Resilient Multi-Provider API Architecture
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                AARAV PAY functions as an exquisite control center for merchant analytics, custom payment interfaces, dynamic billing QR codes, and API webhooks. 
                Rather than carrying out banking processing natively, request traffic is automated and securely dispatched via high-performance authorized payment providers.
              </p>

              <div className="space-y-4 text-xs">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">Merchant Web Dashboard Control:</strong>
                    <span className="text-slate-500 dark:text-slate-400 block mt-0.5 mt-0.5">Full control over payment APIs, API keys, dynamic QR builders, and accounting metrics.</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">Dynamic Gateway API Router:</strong>
                    <span className="text-slate-500 dark:text-slate-400 block mt-0.5">Intelligent failover algorithms dispatching intents immediately across Razorpay / Cashfree / PhonePe based on active uptime indices.</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">Webhook Sweep Integration:</strong>
                    <span className="text-slate-500 dark:text-slate-400 block mt-0.5">Captures payload endpoints immediately on successful status updates, executing instant merchant ledger logging.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Graphic Visualizer */}
            <div className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800/60 pb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500">Live Traffic Routing Web Graph</span>
              </div>

              <div className="space-y-3 font-mono text-[9px]">
                
                {/* Visual Nodes */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-900 flex items-center justify-between">
                  <div className="text-slate-700 dark:text-slate-350">1. Customer UPI App (GPay/PhonePe...)</div>
                  <span className="text-indigo-500 text-[8px] font-bold">INITIATES TRANSACTION</span>
                </div>

                <div className="flex justify-center my-1 text-slate-400 text-xs">⬇</div>

                <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center justify-between">
                  <div className="text-indigo-600 dark:text-indigo-300 font-bold">2. AARAV PAY Checkout Engine</div>
                  <span className="text-indigo-500 text-[8px] font-bold">API KEY RULES CHECK &amp; RISK LEVEL</span>
                </div>

                <div className="flex justify-center my-1 text-slate-400 text-xs">⬇</div>

                {/* Split routing block */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-900 space-y-2">
                  <div className="text-slate-500 text-[8px] uppercase font-bold tracking-wider">3. Automated Route Dispatch (Aggregators)</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 border border-blue-500/30 bg-blue-500/5 text-blue-500 rounded text-center font-bold">
                      Razorpay Node
                    </div>
                    <div className="p-2 border border-purple-500/30 bg-purple-500/5 text-purple-500 rounded text-center font-bold">
                      Cashfree Node
                    </div>
                    <div className="p-2 border border-indigo-500/35 bg-indigo-500/5 text-indigo-500 rounded text-center">
                      PhonePe API
                    </div>
                  </div>
                </div>

                <div className="flex justify-center my-1 text-slate-400 text-xs">⬇</div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-slate-700 dark:text-slate-350">4. UPI UPI Core (NPCI Node Router)</div>
                  <span className="text-emerald-500 text-[8px] font-bold">SUCCESSIVE WEBHOOK PUSH</span>
                </div>

              </div>
            </div>

          </div>


          {/* Step 3: Database Evolution Roadmap */}
          <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">
                SaaS Schema Scaling
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                Database Evolution Roadmap
              </h2>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                Scaling out database tables in phases to transition from robust startups to global enterprise platforms.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Phase 1 */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-indigo-500/20 relative space-y-6">
                <span className="absolute -top-3 left-4 bg-indigo-600 text-white font-mono text-[9px] font-black uppercase px-2.5 py-1 rounded-full">
                  Phase 1 (MVP Sandbox)
                </span>
                
                <div className="space-y-2 mt-2">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Core Ledger Tables</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Designed strictly around instant business launch and reliable payment validation rules.
                  </p>
                </div>

                <ul className="space-y-2.5 font-mono text-[10px] text-slate-750 dark:text-slate-350">
                  <li className="flex items-center space-x-2 pl-1 border-l-2 border-indigo-500">
                    <strong>User:</strong> Promoter identity profile records.
                  </li>
                  <li className="flex items-center space-x-2 pl-1 border-l-2 border-indigo-500">
                    <strong>Merchant:</strong> Active corporate parameters &amp; bank routes.
                  </li>
                  <li className="flex items-center space-x-2 pl-1 border-l-2 border-indigo-500">
                    <strong>Transaction:</strong> Payment IDs, customer details, risk metrics.
                  </li>
                  <li className="flex items-center space-x-2 pl-1 border-l-2 border-indigo-500">
                    <strong>Settlement:</strong> Requested withdrawals &amp; bank UTR receipts.
                  </li>
                  <li className="flex items-center space-x-2 pl-1 border-l-2 border-indigo-500">
                    <strong>ApiKey / Webhook:</strong> API token records &amp; callbacks.
                  </li>
                </ul>
              </div>

              {/* Phase 2 */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-6">
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[9px] font-black uppercase px-2.5 py-1 rounded-full inline-block">
                  Phase 2 (Growth)
                </span>

                <div className="space-y-2">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Multi-Aquirer Credentials</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Unlocks autonomous merchant-specific credentials for advanced API integrations.
                  </p>
                </div>

                <ul className="space-y-2.5 font-mono text-[10px] text-slate-750 dark:text-slate-350">
                  <li className="flex items-center space-x-2 pl-1 border-l-2 border-slate-300 dark:border-slate-700">
                    <strong>PaymentProvider:</strong> Dynamic multi-bank routing list.
                  </li>
                  <li className="flex items-center space-x-2 pl-1 border-l-2 border-slate-300 dark:border-slate-700">
                    <strong>ProviderCredential:</strong> API secret storage for aggregators.
                  </li>
                  <li className="flex items-center space-x-2 pl-1 border-l-2 border-slate-300 dark:border-slate-700">
                    <strong>PaymentLink:</strong> Dynamic expires parameters, custom redirects.
                  </li>
                  <li className="flex items-center space-x-2 pl-1 border-l-2 border-slate-300 dark:border-slate-700">
                    <strong>Subscription:</strong> SaaS plan tracking (pro / free / scale checks).
                  </li>
                </ul>
              </div>

              {/* Phase 3 */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-6">
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[9px] font-black uppercase px-2.5 py-1 rounded-full inline-block">
                  Phase 3 (Enterprise Grid)
                </span>

                <div className="space-y-2">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">White-Label &amp; Routing Splits</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Engineered to handle automated ledger splits and custom branded checkout routes.
                  </p>
                </div>

                <ul className="space-y-2.5 font-mono text-[10px] text-slate-750 dark:text-slate-350">
                  <li className="flex items-center space-x-2 pl-1 border-l-2 border-slate-300 dark:border-slate-700">
                    <strong>MerchantTheme:</strong> Complete white-label interface custom settings.
                  </li>
                  <li className="flex items-center space-x-2 pl-1 border-l-2 border-slate-300 dark:border-slate-700">
                    <strong>LedgerEntry:</strong> Detailed internal double-entry accounting records.
                  </li>
                  <li className="flex items-center space-x-2 pl-1 border-l-2 border-slate-300 dark:border-slate-700">
                    <strong>SplitConfig:</strong> Split payments mapping, seller marketplace commissions.
                  </li>
                  <li className="flex items-center space-x-2 pl-1 border-l-2 border-slate-300 dark:border-slate-700">
                    <strong>AiRiskEngineLog:</strong> Predictive neural threat vector logs.
                  </li>
                </ul>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ------------------ PRICING SECTION ------------------ */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col space-y-3">
            <h2 className="text-xs font-bold tracking-widest uppercase text-indigo-600 dark:text-indigo-400">
              TRANSPARENT TARIFFS
            </h2>
            <p className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
              A Pricing Plan for Every Scale
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Deploy payments instantly without hidden transaction fees or startup overheads.
            </p>

            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center space-x-3 pt-6">
              <span className={`text-sm font-semibold ${billingCycle === 'monthly' ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
                Monthly
              </span>
              <button
                type="button"
                className="w-12 h-6 rounded-full bg-indigo-600 p-0.5 transition duration-300 relative focus:outline-none"
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annually' : 'monthly')}
              >
                <div 
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition duration-300 ${
                    billingCycle === 'annually' ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-sm font-semibold flex items-center space-x-1.5 ${billingCycle === 'annually' ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
                <span>Annually</span>
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Save 20%
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch relative z-10">
            {pricingModels.map((plan, i) => (
              <div
                key={i}
                className={`relative flex flex-col justify-between p-8 rounded-2xl border transition-all backdrop-blur-md ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-[#14152A]/80 to-[#0A0B14]/80 text-white border-indigo-500 shadow-xl shadow-indigo-500/10'
                    : 'bg-white/40 dark:bg-white/[0.02] text-slate-800 dark:text-slate-100 border-white/20 dark:border-white/[0.05] hover:shadow-lg hover:shadow-indigo-500/5'
                }`}
              >
                {/* Visual Popular Flag */}
                {plan.highlight && (
                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-md">
                    {plan.tag}
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className={`text-sm font-semibold uppercase tracking-wider ${plan.highlight ? 'text-cyan-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                      {plan.name}
                    </span>
                    {!plan.highlight && (
                      <span className="text-[11px] font-bold bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/5 text-slate-650 dark:text-slate-450 px-2.5 py-1 rounded-full">
                        {plan.tag}
                      </span>
                    )}
                  </div>

                  <p className={`text-xs mb-6 ${plan.highlight ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    <span className="text-3xl md:text-4xl font-extrabold">{plan.price}</span>
                    <span className={`text-xs block mt-1 ${plan.highlight ? 'text-purple-300' : 'text-slate-400'}`}>
                      MDR fee: <strong className="font-bold">{plan.fee}</strong>
                    </span>
                  </div>

                  <div className={`h-px w-full my-6 ${plan.highlight ? 'bg-[#292A44]' : 'bg-white/20 dark:bg-white/5'}`} />

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-xs font-medium">
                        <CheckCircle className={`w-4 h-4 mr-3 shrink-0 ${plan.highlight ? 'text-cyan-400' : 'text-emerald-500'}`} />
                        <span className={plan.highlight ? 'text-slate-200' : 'text-slate-600 dark:text-slate-300'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  id={`pricing-${i}-cta`}
                  onClick={() => onNavigate(plan.view)}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition cursor-pointer active:translate-y-0.5 ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 hover:opacity-95'
                      : 'bg-white/30 dark:bg-white/5 text-slate-800 dark:text-slate-100 border border-white/20 dark:border-white/5 hover:bg-white/50 dark:hover:bg-white/10 shadow-xs'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ------------------ CONTACT & FAQS ------------------ */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left FAQ */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-col space-y-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">FAQ HELPDESK</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Frequently Solved Queries</h2>
              </div>

              <div className="space-y-4 pt-4">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-md border border-white/20 dark:border-white/[0.05] rounded-xl overflow-hidden transition-all hover:border-indigo-500/30 dark:hover:border-indigo-500/30 shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-white/5 transition outline-none"
                    >
                      <span className="flex items-center space-x-3">
                        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{faq.q}</span>
                      </span>
                      {openFaq === idx ? (
                        <Minus className="w-4 h-4 text-indigo-500 shrink-0" />
                      ) : (
                        <Plus className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    <AnimatePresence>
                      {openFaq === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-6 pb-5 pt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/10">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Quick Help Section */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-gradient-to-tr from-[#14152A]/90 via-[#0A0B14]/90 to-[#121634]/90 p-8 rounded-2xl border border-white/10 text-white relative overflow-hidden shadow-2xl backdrop-blur-md">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />
                
                <h3 className="text-xl font-bold mb-2 flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                  <span>24/7 Corporate Support</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Got an issue with transaction integrations, merchant settlement webhooks, or dynamic routing keys? Write our specialists or jump on our priority channels instantly.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 bg-white/[0.04] p-3 rounded-lg border border-white/10 backdrop-blur-sm">
                    <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Email Support Ticket</div>
                      <div className="text-[11px] text-slate-400">support@aaravpay.com</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-white/[0.04] p-3 rounded-lg border border-white/10 backdrop-blur-sm">
                    <MessageSquare className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Live Integration Desk</div>
                      <div className="text-[11px] text-slate-400">Available 24x7 inside Merchant console</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                  <button
                    type="button"
                    onClick={() => onNavigate('register')}
                    className="inline-flex items-center space-x-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
                  >
                    <span>Register your business now</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ------------------ FOOTER ------------------ */}
      <footer className="border-t border-slate-200 dark:border-white/10 py-12 px-6 relative z-10 bg-white/20 dark:bg-black/20 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
              AP
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-800 dark:text-white">
              AARAV PAY
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <button type="button" onClick={() => onNavigate('home')} className="hover:text-slate-900 dark:hover:text-white transition cursor-pointer">Home</button>
            <button type="button" onClick={() => onNavigate('register')} className="hover:text-slate-900 dark:hover:text-white transition cursor-pointer">Merchant Registration</button>
            <button type="button" onClick={() => onNavigate('login')} className="hover:text-slate-900 dark:hover:text-white transition cursor-pointer">Merchant Login</button>
            <button type="button" onClick={() => onNavigate('admin')} className="p-1 px-2.5 rounded bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/5 text-[10px] uppercase font-bold text-slate-700 dark:text-slate-300 hover:bg-indigo-500/10 transition cursor-pointer">Admin Portal Access</button>
          </div>

          <p className="text-[11px] text-slate-450 dark:text-slate-500 text-center md:text-right">
            &copy; 2026 AARAV PAY Enterprise. Built with premium Fintech standards. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
