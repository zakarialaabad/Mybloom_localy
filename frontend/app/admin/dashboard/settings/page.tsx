'use client';

import React from 'react';
import Image from 'next/image';
import { 
  Info, 
  User, 
  ShieldCheck, 
  Eye, 
  X,
  Save
} from 'lucide-react';

export default function GeneralSettingsPage() {
  return (
    <div className="p-8 max-w-[1240px] mx-auto w-full">
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
        <div className="mt-4 md:mt-0">
          <button className="flex items-center gap-2 bg-[#423835] text-white px-6 py-3 rounded-[8px] text-[13px] font-bold shadow-sm hover:bg-[#2d2624] transition-colors italic">
            <Save size={16} strokeWidth={2.5} />
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* ─── Profile Information Section ───────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white rounded-[20px] border border-[#f2e6ea] p-8 shadow-[0_2px_15px_rgba(0,0,0,0.01)] h-full">
            <div className="flex items-center gap-2 mb-8 text-[#da2966]">
              <Info size={22} strokeWidth={2.5} />
              <h2 className="text-[20px] font-serif font-bold">Profile Information</h2>
            </div>

            <div className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-[13px] font-bold text-[#444] mb-3">Username</label>
                <div className="relative">
                  <input 
                    type="text" 
                    defaultValue="@ mybloomLoubna"
                    className="w-full bg-[#f8f8f8] border-none rounded-[12px] px-5 py-4 text-[15px] text-gray-600 focus:ring-1 focus:ring-[#da2966] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email & Phone Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[13px] font-bold text-[#444] mb-3">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue="mybloom@gmail.com"
                    className="w-full bg-[#f8f8f8] border-none rounded-[12px] px-5 py-4 text-[15px] text-gray-600 focus:ring-1 focus:ring-[#da2966] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#444] mb-3">Phone Number</label>
                  <input 
                    type="text" 
                    defaultValue="06 11 95 50 60"
                    className="w-full bg-[#f8f8f8] border-none rounded-[12px] px-5 py-4 text-[15px] text-gray-600 focus:ring-1 focus:ring-[#da2966] outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Photo de profil Section ────────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white rounded-[20px] border border-[#f2e6ea] p-8 shadow-[0_2px_15px_rgba(0,0,0,0.01)] flex flex-col items-center h-full">
            <div className="w-full flex items-center gap-2 mb-10 text-[#da2966]">
              <User size={22} strokeWidth={2.5} />
              <h2 className="text-[20px] font-serif font-bold">Photo de profil</h2>
            </div>

            <div className="relative">
              {/* Decorative dotted border overlay */}
              <div className="absolute inset-[-15px] rounded-full border-2 border-dotted border-[#da2966] opacity-40"></div>
              
              <div className="relative w-[200px] h-[200px] rounded-full overflow-hidden border-4 border-white shadow-xl">
                <Image 
                  src="/public_Image/MybLoom.jpg" 
                  alt="Profile" 
                  fill 
                  className="object-cover"
                />
              </div>

              <button className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white border border-[#f2e6ea] flex items-center justify-center text-[#da2966] shadow-lg hover:scale-110 transition-transform">
                <X size={20} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>

        {/* ─── Security Section ───────────────────────────────────────────────── */}
        <div className="col-span-12 mt-4">
          <div className="bg-white rounded-[20px] border border-[#f2e6ea] p-8 shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2 text-[#da2966]">
                <ShieldCheck size={22} strokeWidth={2.5} />
                <h2 className="text-[20px] font-serif font-bold">Security</h2>
              </div>
              <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">
                Last changed 3 months ago
              </span>
            </div>

            <div className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-[13px] font-bold text-[#444] mb-3">Current Password</label>
                <div className="relative">
                  <input 
                    type="password" 
                    defaultValue="password123"
                    className="w-full bg-[#f8f8f8] border-none rounded-[12px] px-5 py-4 text-[15px] text-gray-600 focus:ring-1 focus:ring-[#da2966] outline-none transition-all"
                  />
                  <button className="absolute right-5 top-1/2 -translate-y-1/2 text-[#da2966]">
                    <Eye size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* New Password & Confirm Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div>
                  <label className="block text-[13px] font-bold text-[#444] mb-3">New Password</label>
                  <input 
                    type="text" 
                    placeholder="Min. 8 characters"
                    className="w-full bg-[#f8f8f8] border-none rounded-[12px] px-5 py-4 text-[15px] text-gray-400 focus:ring-1 focus:ring-[#da2966] outline-none transition-all"
                  />
                  {/* Strength Bar */}
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex gap-2 h-[3px]">
                      <div className="flex-1 rounded-full bg-[#b09d6d]"></div>
                      <div className="flex-1 rounded-full bg-[#b09d6d]"></div>
                      <div className="flex-1 rounded-full bg-[#b09d6d]"></div>
                      <div className="flex-1 rounded-full bg-gray-100"></div>
                    </div>
                    <div className="flex justify-end pr-1">
                      <span className="text-[10px] font-extrabold text-[#b09d6d] uppercase tracking-widest">Strong</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#444] mb-3">Confirm New Passowrd</label>
                  <input 
                    type="text" 
                    placeholder="Repeat new password"
                    className="w-full bg-[#f8f8f8] border-none rounded-[12px] px-5 py-4 text-[15px] text-gray-400 focus:ring-1 focus:ring-[#da2966] outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}