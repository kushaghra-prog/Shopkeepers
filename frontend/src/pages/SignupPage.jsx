import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiHome, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', restaurantName: '', restaurantAddress: '' });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(form);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally { setLoading(false); }
  };

  const fields = [
    { name: 'name', label: 'Full Name', icon: FiUser, type: 'text', placeholder: 'Raj Kumar' },
    { name: 'email', label: 'Email', icon: FiMail, type: 'email', placeholder: 'you@email.com' },
    { name: 'password', label: 'Password', icon: FiLock, type: 'password', placeholder: '••••••••' },
    { name: 'phone', label: 'Phone', icon: FiPhone, type: 'tel', placeholder: '9876543210' },
    { name: 'restaurantName', label: 'Restaurant Name', icon: FiHome, type: 'text', placeholder: 'Spice Kitchen' },
    { name: 'restaurantAddress', label: 'Restaurant Address', icon: FiMapPin, type: 'text', placeholder: '123 MG Road, Bangalore' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 p-4">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-xl">S</div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Shopkeepers</h1>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">Create Account</h2>
          <p className="text-surface-500 mb-6">Set up your restaurant dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(f => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">{f.label}</label>
                <div className="relative">
                  <f.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                  <input type={f.type} name={f.name} value={form[f.name]} onChange={handleChange} className="input-field pl-11" placeholder={f.placeholder} required={['name', 'email', 'password'].includes(f.name)} />
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? <span className="flex items-center justify-center gap-2"><span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> Creating...</span> : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-500">
            Already have an account? <Link to="/login" className="text-brand-500 hover:text-brand-600 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
