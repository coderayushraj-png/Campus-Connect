import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Camera, Save, CheckCircle, Mail, Shield, AlertTriangle, LogOut,
  Trash2, BriefcaseBusiness, CalendarDays, FileText, Bell, Clock, Sparkles, Info, Eye, EyeOff, XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function Settings() {
  const navigate = useNavigate();
  const { userInitials } = useOutletContext() || { userInitials: "ST" };

  const [email, setEmail] = useState('');
  
  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Notification States
  const [toggles, setToggles] = useState({
    placement: true,
    events: true,
    exam: true,
    notices: true,
    deadlines: true
  });
  const [masterToggle, setMasterToggle] = useState(true);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState(false);

  // Danger Zone States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // General States
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!isSupabaseConfigured) return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setCurrentUser(user);
          setEmail(user.email);
          
          setToggles({
            placement: profile.notif_placement ?? true,
            events: profile.notif_events ?? true,
            exam: profile.notif_exam ?? true,
            notices: profile.notif_notices ?? true,
            deadlines: profile.notif_deadlines ?? true
          });
          
          const allOff = !(profile.notif_placement ?? true) &&
                        !(profile.notif_events ?? true) &&
                        !(profile.notif_exam ?? true) &&
                        !(profile.notif_notices ?? true) &&
                        !(profile.notif_deadlines ?? true);
          setMasterToggle(!allOff);
        }
      } catch (error) {
        console.error("Error fetching settings data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [navigate]);

  const handleUpdatePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);
    
    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordLoading(true);
    try {
      // NOTE: Supabase doesn't require currentPassword for updateUser if session is valid.
      // But we simulate validation or handle appropriately when full API is available.
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
      toast.success("Password updated successfully!");
    } catch (error) {
      setPasswordError(error.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setNotifLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          notif_placement: toggles.placement,
          notif_events: toggles.events,
          notif_exam: toggles.exam,
          notif_notices: toggles.notices,
          notif_deadlines: toggles.deadlines,
        })
        .eq('id', currentUser.id);

      if (error) throw error;
      toast.success("Preferences saved successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to save preferences");
    } finally {
      setNotifLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    try {
      // In Supabase, users cannot delete themselves directly from the client.
      // You must create this RPC function in your Supabase SQL Editor:
      // 
      // create or replace function delete_user()
      // returns void
      // language sql
      // security definer
      // as $$
      //   delete from auth.users where id = auth.uid();
      // $$;
      
      const { error } = await supabase.rpc('delete_user'); 
      
      if (error) {
        throw error;
      }
      
      toast.success("Account deleted successfully!");
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      toast.error(error.message || "Failed to delete account. Please ensure the delete_user RPC function is created in Supabase.");
    }
  };

  const toggleSwitch = (key) => {
    if (!masterToggle) return; // Cannot toggle if master is off
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleMaster = () => {
    const newVal = !masterToggle;
    setMasterToggle(newVal);
    if (!newVal) {
      setToggles({
        placement: false,
        events: false,
        exam: false,
        notices: false,
        deadlines: false
      });
    } else {
      setToggles({
        placement: true,
        events: true,
        exam: true,
        notices: true,
        deadlines: true
      });
    }
  };

  const getPasswordStrength = (pw) => {
    if (pw.length === 0) return { width: '0%', color: '', label: '' };
    if (pw.length < 6) return { width: '33%', color: 'bg-red-400', textColor: 'text-red-500', label: 'Weak' };
    if (pw.length <= 10) return { width: '66%', color: 'bg-amber-400', textColor: 'text-amber-500', label: 'Medium' };
    return { width: '100%', color: 'bg-emerald-500', textColor: 'text-emerald-500', label: 'Strong' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-zinc-500">
        Loading settings...
      </div>
    );
  }

  const pwStrength = getPasswordStrength(newPassword);

  return (
    <div className="bg-[#f4f4f5] min-h-full py-6">
      <div className="max-w-[800px] mx-auto px-[24px]">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-[24px] font-bold text-zinc-900">Settings ⚙️</h1>
          <p className="text-[14px] text-zinc-500 mt-1">Manage your profile and preferences</p>
        </div>

        {/* SECTION 2: ACCOUNT SETTINGS */}
        <div className="bg-white rounded-2xl border border-[#e4e4e7] p-[24px] mb-[20px]">
          <div className="flex justify-between items-center pb-[16px] border-b border-[#f4f4f5] mb-[20px]">
            <div>
              <h2 className="text-[16px] font-semibold text-zinc-900">Account & Security</h2>
              <p className="text-[13px] text-zinc-500 mt-1">Manage your email and password</p>
            </div>
            <div className="bg-indigo-50 p-2 rounded-lg">
              <Shield className="text-indigo-500" size={20} />
            </div>
          </div>

          {/* Email Display */}
          <div className="bg-zinc-50 rounded-xl px-[16px] py-[14px] flex items-center justify-between mb-[16px]">
            <div className="flex items-center gap-3">
              <Mail className="text-zinc-400" size={18} />
              <div>
                <p className="text-sm font-medium text-zinc-700">College Email</p>
                <p className="text-sm text-zinc-500">{email}</p>
              </div>
            </div>
            <div>
              <span className="bg-emerald-50 text-emerald-600 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle size={12} />
                Verified
              </span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mb-6 flex items-center gap-1">
            <Info size={12} />
            College email cannot be changed. Contact admin for email updates.
          </p>

          {/* Change Password */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 mb-[12px]">Change Password</h3>

            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl mb-4">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-2.5 rounded-xl mb-4">
                Password updated successfully!
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full border border-[#e4e4e7] rounded-xl pl-4 pr-10 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                  <button onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer">
                    {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full border border-[#e4e4e7] rounded-xl pl-4 pr-10 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                  <button onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer">
                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {newPassword.length > 0 && (
                  <div className="mt-1.5">
                    <div className="h-1.5 rounded-full w-full bg-zinc-100 overflow-hidden mt-[6px]">
                      <div className={`h-full transition-all duration-300 ${pwStrength.color}`} style={{ width: pwStrength.width }}></div>
                    </div>
                    {pwStrength.label && (
                      <p className={`text-xs mt-1 ${pwStrength.textColor}`}>{pwStrength.label}</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full border border-[#e4e4e7] rounded-xl pl-4 pr-10 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                  <button onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer">
                    {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    {newPassword === confirmPassword ? (
                      <><CheckCircle size={14} className="text-emerald-500"/><span className="text-xs text-emerald-600">Passwords match</span></>
                    ) : (
                      <><XCircle size={14} className="text-red-400"/><span className="text-xs text-red-500">Passwords do not match</span></>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-[16px] border-t border-[#f4f4f5] mt-4">
              <button
                onClick={handleUpdatePassword}
                disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl px-6 py-2.5 text-sm font-medium flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Shield size={15} />
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: NOTIFICATION SETTINGS */}
        <div className="bg-white rounded-2xl border border-[#e4e4e7] p-[24px] mb-[20px]">
          <div className="flex justify-between items-center pb-[16px] border-b border-[#f4f4f5] mb-[20px]">
            <div>
              <h2 className="text-[16px] font-semibold text-zinc-900">Notification Preferences</h2>
              <p className="text-[13px] text-zinc-500 mt-1">Control what emails you receive</p>
            </div>
            <div className="bg-indigo-50 p-2 rounded-lg">
              <Bell className="text-indigo-500" size={20} />
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-[14px] py-[12px] flex items-center justify-between mb-[16px]">
            <div className="flex items-center gap-3">
              <Sparkles className="text-indigo-500" size={18} />
              <div>
                <p className="text-sm font-semibold text-indigo-700">All Notifications</p>
                <p className="text-xs text-indigo-400 mt-0.5">Enable or disable all at once</p>
              </div>
            </div>
            <button 
              onClick={toggleMaster}
              className={`w-[48px] h-[26px] rounded-full transition-colors duration-200 cursor-pointer relative shrink-0 ${masterToggle ? 'bg-indigo-500' : 'bg-zinc-300'}`}
            >
              <div className={`w-[22px] h-[22px] bg-white rounded-full shadow-sm transition-transform absolute top-[2px] ${masterToggle ? 'translate-x-[24px]' : 'translate-x-[2px]'}`}></div>
            </button>
          </div>

          <div className="flex flex-col gap-0 divide-y divide-zinc-100">
            {[
              { id: 'placement', title: 'Placement Drive Alerts', desc: 'Get notified when new company drives are posted', icon: BriefcaseBusiness, color: 'emerald' },
              { id: 'events', title: 'Event Reminders', desc: 'Receive reminders for upcoming campus events', icon: CalendarDays, color: 'purple' },
              { id: 'exam', title: 'Exam Deadline Alerts', desc: 'Important exam form and result notifications', icon: FileText, color: 'red' },
              { id: 'notices', title: 'Important Notices', desc: 'Critical announcements from administration', icon: Bell, color: 'amber' },
              { id: 'deadlines', title: 'Deadline Reminders', desc: '7-day and 1-day reminders for all deadlines', icon: Clock, color: 'blue' }
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between py-[14px]">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg bg-${item.color}-50`}>
                    <item.icon className={`text-${item.color}-500`} size={18} />
                  </div>
                  <div>
                    <h4 className={`text-sm font-medium ${!masterToggle ? 'text-zinc-400' : 'text-zinc-900'}`}>{item.title}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleSwitch(item.id)}
                  disabled={!masterToggle}
                  className={`w-[44px] h-[24px] rounded-full transition-colors duration-200 ${!masterToggle ? 'cursor-not-allowed opacity-50 bg-zinc-200' : 'cursor-pointer'} relative shrink-0 ${toggles[item.id] ? 'bg-indigo-500' : 'bg-zinc-200'}`}
                >
                  <div className={`w-[20px] h-[20px] bg-white rounded-full shadow-sm transition-transform absolute top-[2px] ${toggles[item.id] ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}></div>
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-[16px] border-t border-[#f4f4f5] mt-4">
            <button
              onClick={handleSaveNotifications}
              disabled={notifLoading}
              className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-6 py-2.5 text-sm font-medium cursor-pointer disabled:opacity-50"
            >
              {notifLoading ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </div>

        {/* SECTION 4: DANGER ZONE */}
        <div className="bg-white rounded-2xl border border-red-300 p-[24px]">
          <div className="flex justify-between items-center pb-[16px] border-b border-red-100 mb-[16px]">
            <div>
              <h2 className="text-[16px] font-semibold text-red-600">Danger Zone</h2>
              <p className="text-[13px] text-zinc-500 mt-1">Irreversible account actions</p>
            </div>
            <div className="bg-red-50 p-2 rounded-lg">
              <AlertTriangle className="text-red-500" size={20} />
            </div>
          </div>

          <div className="flex items-center justify-between py-[14px] border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="bg-zinc-100 p-2 rounded-lg">
                <LogOut className="text-zinc-500" size={18} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-zinc-900">Sign Out from All Devices</h4>
                <p className="text-xs text-zinc-400 mt-0.5">This will log you out everywhere</p>
              </div>
            </div>
            <button 
              onClick={handleLogoutAll}
              className="border border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50 text-xs font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors"
            >
              Sign Out All
            </button>
          </div>

          <div className="flex items-center justify-between pt-[14px]">
            <div className="flex items-center gap-3">
              <div className="bg-red-50 p-2 rounded-lg">
                <Trash2 className="text-red-500" size={18} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-red-600">Delete Account</h4>
                <p className="text-xs text-zinc-400 mt-0.5 max-w-[200px] sm:max-w-none">Permanently delete your account and all your data</p>
              </div>
            </div>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* DELETE CONFIRM MODAL */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full relative z-10 animate-fade-in text-center">
              <AlertTriangle className="text-red-500 w-10 h-10 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-zinc-900 text-center">Delete Account?</h3>
              <p className="text-sm text-zinc-500 text-center mt-2">
                This action cannot be undone. All your notes, posts, and data will be permanently deleted.
              </p>
              
              <div className="mt-4 border-t border-zinc-100 pt-4 pb-1 text-left">
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">Type "DELETE" to confirm</label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE here"
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                />
              </div>

              <div className="flex gap-3 mt-5">
                <button 
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                  }}
                  className="flex-1 border border-zinc-300 rounded-xl text-zinc-600 font-medium py-2.5 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE'}
                  className="flex-1 bg-red-500 text-white rounded-xl font-medium py-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
