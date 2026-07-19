import { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiHome, FiMapPin, FiLock, FiSave } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateProfile: updateCtx } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || '', phone: user?.phone || '',
    restaurantName: user?.restaurantName || '', restaurantAddress: user?.restaurantAddress || '',
    cuisine: user?.cuisine?.join(', ') || '',
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...profile, cuisine: profile.cuisine.split(',').map(c => c.trim()).filter(Boolean) };
      const res = await api.put('/auth/profile', data);
      updateCtx(res.data);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwords.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setChangingPass(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setChangingPass(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Profile Section */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-6 flex items-center gap-2"><FiUser className="text-brand-500" /> Profile Settings</h3>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Full Name</label>
              <div className="relative"><FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
              <input value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))} className="input-field pl-10" /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Email</label>
              <div className="relative"><FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
              <input value={user?.email || ''} className="input-field pl-10 opacity-60 cursor-not-allowed" disabled /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Phone</label>
              <div className="relative"><FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
              <input value={profile.phone} onChange={e => setProfile(p => ({...p, phone: e.target.value}))} className="input-field pl-10" /></div>
            </div>
          </div>

          <hr className="border-surface-200 dark:border-surface-700" />
          <h4 className="text-sm font-semibold text-surface-500 uppercase tracking-wider">Restaurant Details</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Restaurant Name</label>
              <div className="relative"><FiHome className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
              <input value={profile.restaurantName} onChange={e => setProfile(p => ({...p, restaurantName: e.target.value}))} className="input-field pl-10" /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Cuisine Types</label>
              <input value={profile.cuisine} onChange={e => setProfile(p => ({...p, cuisine: e.target.value}))} className="input-field" placeholder="North Indian, Chinese, South Indian" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Address</label>
            <div className="relative"><FiMapPin className="absolute left-3.5 top-3 text-surface-400" size={16} />
            <textarea value={profile.restaurantAddress} onChange={e => setProfile(p => ({...p, restaurantAddress: e.target.value}))} className="input-field pl-10" rows={2} /></div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <FiSave size={16} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-6 flex items-center gap-2"><FiLock className="text-brand-500" /> Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Current Password</label>
            <input type="password" value={passwords.currentPassword} onChange={e => setPasswords(p => ({...p, currentPassword: e.target.value}))} className="input-field" required />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">New Password</label><input type="password" value={passwords.newPassword} onChange={e => setPasswords(p => ({...p, newPassword: e.target.value}))} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Confirm Password</label><input type="password" value={passwords.confirmPassword} onChange={e => setPasswords(p => ({...p, confirmPassword: e.target.value}))} className="input-field" required /></div>
          </div>
          <button type="submit" disabled={changingPass} className="btn-primary flex items-center gap-2">
            {changingPass ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <FiLock size={16} />}
            {changingPass ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
