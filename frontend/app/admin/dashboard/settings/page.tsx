'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  Info, 
  User, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  X,
  Save,
  UploadCloud
} from 'lucide-react';
import { adminProfileService } from '@/services/api';

export default function GeneralSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    phone: ''
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>('/public_Image/MybLoom.jpg');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [strength, setStrength] = useState({ length: false, upper: false, lower: false, number: false, special: false });

  // Status message state
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await adminProfileService.getProfile();
      setProfile({
        username: data.username || '',
        email: data.email || '',
        phone: data.phone || ''
      });
      if (data.profile_image) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.split('/api')[0] || 'http://127.0.0.1:8000';
        setImagePreview(data.profile_image.startsWith('http') ? data.profile_image : `${baseUrl}${data.profile_image}`);
      } else {
        setImagePreview('/public_Image/MybLoom.jpg');
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });

    if (name === 'new_password') {
      setStrength({
        length: value.length >= 8,
        upper: /[A-Z]/.test(value),
        lower: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[\W_]/.test(value),
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('/public_Image/MybLoom.jpg');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const saveProfile = async () => {
    setIsSavingProfile(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('username', profile.username);
      formData.append('email', profile.email);
      formData.append('phone', profile.phone);
      if (imageFile) {
        formData.append('profile_image', imageFile);
      }

      await adminProfileService.updateProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Auto-hide message after 3s
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to update profile' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const savePassword = async () => {
    if (passwords.new_password !== passwords.new_password_confirmation) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    
    // Check strength 
    const isStrong = Object.values(strength).every(Boolean);
    if (!isStrong) {
      setMessage({ type: 'error', text: 'Please ensure new password meets all security requirements' });
      return;
    }

    setIsSavingPassword(true);
    setMessage(null);
    try {
      await adminProfileService.changePassword(passwords);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswords({ current_password: '', new_password: '', new_password_confirmation: '' });
      setStrength({ length: false, upper: false, lower: false, number: false, special: false });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to change password' });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const strengthScore = Object.values(strength).filter(Boolean).length;

  if (isLoading) {
    return <div className="p-5 sm:p-8 max-w-[1240px] flex justify-center items-center h-[50vh]">Loading profile...</div>;
  }

  return (
    <div className="p-5 sm:p-8 max-w-[1240px] mx-auto w-full">
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      
      {message && (
        <div
          style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 200, animation: 'toastIn 0.3s ease-out' }}
          className="flex items-center gap-3 bg-white border border-[#da2966] text-[#da2966] shadow-[0_8px_32px_rgba(218,41,102,0.2)] px-5 py-3.5 rounded-2xl text-[14px] font-bold whitespace-nowrap pointer-events-none"
        >
          {message.type === 'success' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M8 12.5l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          )}
          {message.text}
        </div>
      )}

      {/* ─── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-10 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-[32px] font-serif font-bold text-[#111] tracking-tight mb-2">
            Account Settings
          </h1>
          <p className="text-[15px] text-gray-500 font-medium">
            Manage your luxury boutique's profile and secure your credentials
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* ─── Profile Information Section ───────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-8 order-2 lg:order-1">
          <div className="bg-white rounded-[20px] border border-[#f2e6ea] p-5 sm:p-8 shadow-[0_2px_15px_rgba(0,0,0,0.01)] h-full">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2 text-[#da2966]">
                <Info size={22} strokeWidth={2.5} />
                <h2 className="text-[16px] sm:text-[18px] sm:text-[20px] font-serif font-bold">Profile Information</h2>
              </div>
              <button 
                onClick={saveProfile}
                disabled={isSavingProfile}
                className="flex items-center gap-2 bg-[#423835] text-white px-5 py-2.5 rounded-[8px] text-[13px] font-bold shadow-sm hover:bg-[#2d2624] transition-colors italic disabled:opacity-70"
              >
                <Save size={16} strokeWidth={2.5} />
                {isSavingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>

            <div className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-[13px] font-bold text-[#444] mb-3">Username</label>
                <div className="relative">
                  <input 
                    type="text" 
                    name="username"
                    value={profile.username}
                    onChange={handleProfileChange}
                    placeholder="@ mybloomLoubna"
                    className="w-full bg-[#f8f8f8] border-none rounded-[12px] px-5 py-4 text-[15px] text-gray-600 focus:ring-1 focus:ring-[#da2966] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email & Phone Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:p-6">
                <div>
                  <label className="block text-[13px] font-bold text-[#444] mb-3">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    className="w-full bg-[#f8f8f8] border-none rounded-[12px] px-5 py-4 text-[15px] text-gray-600 focus:ring-1 focus:ring-[#da2966] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#444] mb-3">Phone Number</label>
                  <input 
                    type="text" 
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    placeholder="06 11 95 50 60"
                    className="w-full bg-[#f8f8f8] border-none rounded-[12px] px-5 py-4 text-[15px] text-gray-600 focus:ring-1 focus:ring-[#da2966] outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Photo de profil Section ────────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-4 order-1 lg:order-2">
          <div className="bg-white rounded-[20px] border border-[#f2e6ea] p-5 sm:p-8 shadow-[0_2px_15px_rgba(0,0,0,0.01)] flex flex-col items-center h-full">
            <div className="w-full flex items-center gap-2 mb-10 text-[#da2966]">
              <User size={22} strokeWidth={2.5} />
              <h2 className="text-[16px] sm:text-[18px] sm:text-[20px] font-serif font-bold">Photo de profil</h2>
            </div>

            <div className="relative group">
              {/* Decorative dotted border overlay */}
              <div className="absolute inset-[-15px] rounded-full border-2 border-dotted border-[#da2966] opacity-40"></div>
              
              <div className="relative w-[200px] h-[200px] rounded-full overflow-hidden border-4 border-white shadow-xl cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {imagePreview ? (
                  <Image 
                    src={imagePreview} 
                    alt="Profile" 
                    fill 
                    className="object-cover transition-opacity group-hover:opacity-80"
                    unoptimized // to prevent missing remote pattern errors
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex justify-center items-center text-gray-400 group-hover:bg-gray-200 transition-colors">
                    <User size={40} />
                  </div>
                )}
                
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <UploadCloud className="text-white w-10 h-10" />
                </div>
              </div>

              {imagePreview && imagePreview !== '/public_Image/MybLoom.jpg' && (
                <button 
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white border border-[#f2e6ea] flex items-center justify-center text-[#da2966] shadow-lg hover:scale-110 transition-transform z-10"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>

        {/* ─── Security Section ───────────────────────────────────────────────── */}
        <div className="col-span-12 mt-4">
          <div className="bg-white rounded-[20px] border border-[#f2e6ea] p-5 sm:p-8 shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2 text-[#da2966]">
                <ShieldCheck size={22} strokeWidth={2.5} />
                <h2 className="text-[16px] sm:text-[18px] sm:text-[20px] font-serif font-bold">Security</h2>
              </div>
              <button 
                onClick={savePassword}
                disabled={isSavingPassword}
                className="flex items-center gap-2 bg-[#423835] text-white px-5 py-2.5 rounded-[8px] text-[13px] font-bold shadow-sm hover:bg-[#2d2624] transition-colors italic disabled:opacity-70"
              >
                <Save size={16} strokeWidth={2.5} />
                {isSavingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>

            <div className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-[13px] font-bold text-[#444] mb-3">Current Password</label>
                <div className="relative max-w-xl">
                  <input 
                    type={showCurrentPassword ? "text" : "password"} 
                    name="current_password"
                    value={passwords.current_password}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    className="w-full bg-[#f8f8f8] border-none rounded-[12px] px-5 py-4 text-[15px] text-gray-600 focus:ring-1 focus:ring-[#da2966] outline-none transition-all"
                  />
                  <button 
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#da2966]"
                  >
                    {showCurrentPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                  </button>
                </div>
              </div>

              {/* New Password & Confirm Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:p-8 items-start pt-2">
                <div>
                  <label className="block text-[13px] font-bold text-[#444] mb-3">New Password</label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? "text" : "password"}
                      name="new_password"
                      value={passwords.new_password}
                      onChange={handlePasswordChange}
                      placeholder="Min. 8 characters"
                      className="w-full bg-[#f8f8f8] border-none rounded-[12px] px-5 py-4 pr-12 text-[15px] text-gray-600 focus:ring-1 focus:ring-[#da2966] outline-none transition-all"
                    />
                    <button 
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#da2966]"
                    >
                      {showNewPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                    </button>
                  </div>
                  
                  {/* Strength Bar */}
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex gap-2 h-[3px]">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div 
                          key={level} 
                          className={`flex-1 rounded-full transition-colors ${
                            strengthScore >= level 
                              ? (strengthScore === 5 ? 'bg-green-500' : strengthScore >= 3 ? 'bg-[#da2966]' : 'bg-[#b09d6d]') 
                              : 'bg-gray-100'
                          }`}
                        ></div>
                      ))}
                    </div>
                    <div className="flex justify-between pr-1">
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                        {strengthScore === 5 ? 'Strong' : strengthScore >= 3 ? 'Medium' : strengthScore > 0 ? 'Weak' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#444] mb-3">Confirm New Password</label>
                  <div className="relative">
                    <input 
                      type="password"
                      name="new_password_confirmation"
                      value={passwords.new_password_confirmation}
                      onChange={handlePasswordChange}
                      placeholder="Repeat new password"
                      className={`w-full bg-[#f8f8f8] border ${
                        passwords.new_password_confirmation && passwords.new_password !== passwords.new_password_confirmation 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-none focus:ring-[#da2966]'
                      } rounded-[12px] px-5 py-4 text-[15px] text-gray-600 outline-none transition-all`}
                    />
                  </div>
                  {passwords.new_password_confirmation && passwords.new_password !== passwords.new_password_confirmation && (
                    <span className="text-red-500 text-xs mt-2 block font-medium">Passwords do not match</span>
                  )}
                </div>
              </div>
              
              {/* Password Requirement hints */}
              {passwords.new_password && strengthScore < 5 && (
                 <div className="mt-3 text-[12px] text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="font-bold text-gray-700 mb-1">Password must contain:</p>
                    <ul className="grid grid-cols-2 gap-1 gap-x-4">
                      <li className={strength.length ? 'text-green-600' : ''}>✓ At least 8 characters</li>
                      <li className={strength.upper ? 'text-green-600' : ''}>✓ Uppercase letter</li>
                      <li className={strength.lower ? 'text-green-600' : ''}>✓ Lowercase letter</li>
                      <li className={strength.number ? 'text-green-600' : ''}>✓ Number</li>
                      <li className={strength.special ? 'text-green-600' : ''}>✓ Special character</li>
                    </ul>
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}