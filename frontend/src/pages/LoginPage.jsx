import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck, FiShield, FiTrendingUp, FiPieChart } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const features = [
  { icon: FiShield, text: 'Real-time order tracking & management' },
  { icon: FiTrendingUp, text: 'Revenue analytics & growth insights' },
  { icon: FiPieChart, text: 'Menu, inventory & delivery control' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-900">
      {/* Left - Animated Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden"
        style={{
          background: 'linear-gradient(-45deg, #4f46e5, #7c3aed, #ec4899, #f97316, #4f46e5)',
          backgroundSize: '400% 400%',
          animation: 'gradient-shift 8s ease infinite',
        }}>
        {/* Floating animated blobs */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute rounded-full opacity-20 bg-white"
            style={{
              width: 80 + i * 40, height: 80 + i * 40,
              top: `${10 + i * 15}%`, left: `${5 + i * 12}%`,
              animation: `float ${4 + i * 0.8}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }} />
        ))}

        <div className={`relative z-10 text-white max-w-lg transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 shadow-2xl"
            style={{ animation: 'float 5s ease-in-out infinite' }}>
            <span className="text-4xl font-black">S</span>
          </div>

          <h1 className="text-5xl font-black mb-4 tracking-tight">Shopkeepers</h1>
          <p className="text-xl text-white/80 mb-10 leading-relaxed">
            Your premium restaurant management dashboard. Track every order, optimize your menu, and grow revenue.
          </p>

          <div className="space-y-5">
            {features.map((f, i) => (
              <div key={i} className={`flex items-center gap-4 transition-all duration-700`}
                style={{ transitionDelay: `${800 + i * 200}ms`, opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(0)' : 'translateX(-20px)' }}>
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <f.icon size={22} />
                </div>
                <span className="text-lg text-white/90">{f.text}</span>
              </div>
            ))}
          </div>

          {/* Stats bar */}
          <div className="flex gap-8 mt-12 pt-8 border-t border-white/20">
            {[{ n: '1K+', l: 'Orders/month' }, { n: '99%', l: 'Uptime' }, { n: '4.9★', l: 'Rating' }].map((s, i) => (
              <div key={i}>
                <p className="text-2xl font-bold">{s.n}</p>
                <p className="text-sm text-white/60">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Login Form with Glassmorphism */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/30">S</div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Shopkeepers</h1>
          </div>

          {/* Glass card */}
          <div className="bg-white/70 dark:bg-surface-800/70 backdrop-blur-xl border border-surface-200/50 dark:border-surface-700/50 rounded-3xl p-8 shadow-2xl shadow-surface-900/5 dark:shadow-black/20">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Welcome back</h2>
            <p className="text-surface-500 mb-8">Sign in to your restaurant dashboard</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Email</label>
                <div className="relative group">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="input-field pl-12 !py-3 !rounded-xl group-focus-within:shadow-lg group-focus-within:shadow-brand-500/10 transition-shadow duration-300"
                    placeholder="admin@restaurant.com" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Password</label>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    className="input-field pl-12 pr-12 !py-3 !rounded-xl group-focus-within:shadow-lg group-focus-within:shadow-brand-500/10 transition-shadow duration-300"
                    placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors">
                    {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-base flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: 'linear-gradient(-45deg, #f97316, #ea580c, #f97316, #fb923c)',
                  backgroundSize: '300% 300%',
                  animation: loading ? 'none' : 'gradient-shift 4s ease infinite',
                }}>
                {loading ? (
                  <><span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> Signing in...</>
                ) : (
                  <>Sign In <FiArrowRight size={18} /></>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-surface-500">
              Don't have an account? <Link to="/signup" className="text-brand-500 hover:text-brand-600 font-semibold">Sign up</Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-4 rounded-2xl bg-surface-100/80 dark:bg-surface-800/50 backdrop-blur border border-surface-200/50 dark:border-surface-700/50">
            <div className="flex items-center gap-2 mb-1">
              <FiCheck className="text-emerald-500" size={14} />
              <p className="text-xs font-medium text-surface-500">Demo credentials</p>
            </div>
            <p className="text-sm font-medium text-surface-700 dark:text-surface-300">admin@restaurant.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
