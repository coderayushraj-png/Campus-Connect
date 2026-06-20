import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Camera, Save, CheckCircle, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function Profile() {
  const navigate = useNavigate();
  const { userInitials } = useOutletContext() || { userInitials: "ST" };

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [semester, setSemester] = useState('1');
  const [bio, setBio] = useState('');
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  
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

        setCurrentUser(user);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setName(profile.name || user.user_metadata?.full_name || user.user_metadata?.name || '');
          setPhone(profile.phone || '');
          setBranch(profile.branch || 'CSE');
          setSemester((profile.semester || 1).toString());
          setBio(profile.bio || '');
        } else {
          setName(user.user_metadata?.full_name || user.user_metadata?.name || '');
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [navigate]);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("Full Name is required");
      return;
    }
    if (phone.trim() && phone.trim().length !== 10) {
      toast.error("Phone Number must be 10 digits");
      return;
    }

    setProfileLoading(true);
    setProfileSuccess(false);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          name: name.trim(),
          phone: phone.trim() || null,
          branch: branch,
          semester: parseInt(semester),
          bio: bio.trim() || null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;
      
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to save profile");
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-zinc-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="bg-[#f4f4f5] min-h-full py-6">
      <div className="max-w-[800px] mx-auto px-[24px]">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-[24px] font-bold text-zinc-900">Profile 👤</h1>
          <p className="text-[14px] text-zinc-500 mt-1">Manage your personal details</p>
        </div>

        {/* SECTION 1: PROFILE SETTINGS */}
        <div className="bg-white rounded-2xl border border-[#e4e4e7] p-[24px] mb-[20px]">
          <div className="flex justify-between items-center pb-[16px] border-b border-[#f4f4f5] mb-[20px]">
            <div>
              <h2 className="text-[16px] font-semibold text-zinc-900">Profile Information</h2>
              <p className="text-[13px] text-zinc-500 mt-1">Update your personal details</p>
            </div>
            <div className="text-indigo-500 text-[20px] bg-indigo-50 p-2 rounded-lg">
              <span className="font-bold flex items-center justify-center h-5 w-5 rounded-full">{userInitials}</span>
            </div>
          </div>

          <div className="flex items-center gap-[20px] p-[16px] bg-zinc-50 rounded-xl mb-[20px]">
            <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[24px] font-bold text-white shrink-0">
              {userInitials}
            </div>
            <div>
              <h3 className="text-[18px] font-semibold text-zinc-900">{name || currentUser?.email || 'Student'}</h3>
              <button 
                className="border border-zinc-200 text-zinc-600 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 mt-2 opacity-50 cursor-not-allowed"
                disabled
              >
                <Camera size={13} />
                Change Photo (Coming Soon)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-[#e4e4e7] rounded-xl px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full border border-[#e4e4e7] rounded-xl px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full border border-[#e4e4e7] rounded-xl px-4 py-2.5 text-sm text-zinc-900 cursor-pointer focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
              >
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="ME">ME</option>
                <option value="CE">CE</option>
                <option value="EE">EE</option>
                <option value="IT">IT</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full border border-[#e4e4e7] rounded-xl px-4 py-2.5 text-sm text-zinc-900 cursor-pointer focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => {
                  if (e.target.value.length <= 200) setBio(e.target.value);
                }}
                rows={3}
                placeholder="Tell something about yourself... your interests, clubs you are part of, etc."
                className="w-full border border-[#e4e4e7] rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
              />
              <div className="text-xs text-zinc-400 text-right mt-1">
                {bio.length} / 200 characters
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-[16px] border-t border-[#f4f4f5] mt-[16px]">
            {profileSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-2 rounded-xl flex items-center gap-2">
                <CheckCircle size={15} />
                Profile updated successfully!
              </div>
            ) : (
              <button
                onClick={handleSaveProfile}
                disabled={profileLoading}
                className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-6 py-2.5 text-sm font-medium flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save size={15} />
                {profileLoading ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
