'use client';

import React from 'react';
import { 
  Filter, 
  ArrowUpDown, 
  Search, 
  Trash2,
  ArrowLeft,
  ArrowRight,
  Plus,
  Ticket,
  Package,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default function CouponsPage() {
  const coupons = [
    {
      code: 'GLAM20',
      campaign: 'Summer 2026',
      type: 'Influencers',
      typeStyle: 'bg-blue-100 text-[#3b82f6]',
      value: '20%',
      valueStyle: 'text-gray-500',
      expiry: 'OCT 24, 2026',
      expiryStyle: 'text-gray-500',
      progress: {
        current: 12,
        max: 50,
        percentage: 24,
      },
      status: 'Active',
    },
    {
      code: 'MYBLOOM',
      campaign: 'Welcome Clt',
      type: 'Influencers',
      typeStyle: 'bg-blue-100 text-[#3b82f6]',
      value: '30%',
      valueStyle: 'text-gray-500',
      expiry: 'OCT 24, 2026',
      expiryStyle: 'text-gray-500',
      progress: {
        current: 12,
        max: 50,
        percentage: 24,
      },
      status: 'Inactive',
    },
    {
      code: 'GLAM20',
      campaign: 'Summer 2026',
      type: 'Top Client',
      typeStyle: 'bg-pink-100 text-[#da2966]',
      value: '20%',
      valueStyle: 'text-gray-500',
      expiry: 'Expired',
      expiryStyle: 'text-red-500 font-bold',
      progress: {
        current: 50,
        max: 50,
        percentage: 100,
      },
      status: 'Inactive',
    },
    {
      code: 'GLAM20',
      campaign: 'Summer 2026',
      type: 'Top Client',
      typeStyle: 'bg-pink-100 text-[#da2966]',
      value: 'Free Shipping',
      valueStyle: 'text-orange-500 font-bold',
      expiry: 'OCT 24, 2026',
      expiryStyle: 'text-gray-500',
      progress: {
        current: 12,
        max: 50,
        percentage: 24,
      },
      status: 'Active',
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-[#eefaf3] text-[#0f8e5c]';
      case 'Inactive':
        return 'bg-gray-100 text-[#555]';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-[#0f8e5c]';
      case 'Inactive': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto w-full">
      {/* ─── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#111] tracking-tight mb-2">
            Promo Codes
          </h1>
          <p className="text-[14px] text-gray-500">
            Mange and track your premium campaign discount across all collections.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="flex items-center gap-2 bg-[#423835] text-white px-5 py-3 rounded-[8px] text-[13px] font-bold shadow-sm hover:bg-[#2d2624] transition-colors">
            <Plus size={16} strokeWidth={3} />
            Create New Code
          </button>
        </div>
      </div>

      {/* ─── Stat Cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Card 1: Active Coupons */}
        <div className="bg-white rounded-[16px] border border-[#faeef1] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-6">
            <div className="w-[52px] h-[52px] rounded-full bg-[#faeef1] flex items-center justify-center text-[#da2966]">
              <Ticket size={24} strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-1 bg-[#eefaf3] text-[#0f8e5c] px-2.5 py-1 rounded-[6px] text-[13px] font-bold">
              <TrendingUp size={14} strokeWidth={3} />
              15%
            </div>
          </div>
          <p className="text-[14px] text-gray-500 font-medium mb-1">Active Coupons</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-[36px] font-serif font-bold text-[#111] leading-none tracking-tight">124</h2>
          </div>
          <p className="text-[12px] text-gray-400 mt-2">vs. last month</p>
        </div>

        {/* Card 2: Total Redemptions */}
        <div className="bg-white rounded-[16px] border border-[#faeef1] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-6">
            <div className="w-[52px] h-[52px] rounded-full bg-[#faeef1] flex items-center justify-center text-[#da2966]">
              <Package size={24} strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-1 bg-[#eefaf3] text-[#0f8e5c] px-2.5 py-1 rounded-[6px] text-[13px] font-bold">
              <TrendingUp size={14} strokeWidth={3} />
              5%
            </div>
          </div>
          <p className="text-[14px] text-gray-500 font-medium mb-1">Total Redemptions</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-[36px] font-serif font-bold text-[#111] leading-none tracking-tight">890</h2>
          </div>
          <p className="text-[12px] text-gray-400 mt-2">vs. last month</p>
        </div>

        {/* Card 3: Expiring Soon */}
        <div className="bg-white rounded-[16px] border border-[#faeef1] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-6">
            <div className="w-[52px] h-[52px] rounded-full bg-[#fdf2f4] flex items-center justify-center text-[#da2966]">
              <Clock size={24} strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-1 bg-[#fdf2f4] text-[#da2966] px-2.5 py-1 rounded-[6px] text-[13px] font-bold">
              <TrendingDown size={14} strokeWidth={3} />
              8%
            </div>
          </div>
          <p className="text-[14px] text-gray-500 font-medium mb-1">Expiring Soon</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-[36px] font-serif font-bold text-[#111] leading-none tracking-tight">12</h2>
          </div>
          <p className="text-[12px] text-gray-400 mt-2">vs. last month</p>
        </div>

      </div>

      {/* ─── Codes Table Area ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[16px] border border-[#f2e6ea] shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-100">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-[8px] text-[13px] font-bold text-[#444] hover:bg-gray-50 transition-colors">
              <Filter size={16} className="text-gray-500" strokeWidth={2.5} />
              Filter
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-[8px] text-[13px] font-bold text-[#444] hover:bg-gray-50 transition-colors">
              <ArrowUpDown size={16} className="text-gray-500" strokeWidth={2.5} />
              Sort
            </button>
            <div className="relative flex-1 md:w-[320px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search code or campaign..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-[8px] text-[13px] focus:outline-none focus:border-[#da2966] focus:ring-1 focus:ring-[#da2966] transition-all"
              />
            </div>
          </div>
          <div className="text-[13px] text-gray-500 font-medium whitespace-nowrap">
            Showing 1-10 of 120
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-[#fffcfd]">
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-[#da2966]">Code</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-[#da2966]">Campaign</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-[#da2966]">Type</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-[#da2966]">Value</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-[#da2966]">Expiry</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-[#da2966]">Usage Progress</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-[#da2966]">Status</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-[#da2966]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  
                  {/* Code */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="bg-[#f4f6fa] text-[#111] font-extrabold text-[13px] px-3 py-1.5 rounded-[4px] tracking-wide">
                      {coupon.code}
                    </span>
                  </td>

                  {/* Campaign */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="text-[13px] font-medium text-gray-500">{coupon.campaign}</span>
                  </td>

                  {/* Type */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`px-3 py-1.5 rounded-full text-[12px] font-bold ${coupon.typeStyle}`}>
                      {coupon.type}
                    </span>
                  </td>

                  {/* Value */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`text-[13px] ${coupon.valueStyle}`}>
                      {coupon.value}
                    </span>
                  </td>

                  {/* Expiry */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`text-[13px] font-medium ${coupon.expiryStyle}`}>
                      {coupon.expiry}
                    </span>
                  </td>

                  {/* Usage Progress */}
                  <td className="px-6 py-5 whitespace-nowrap w-[200px]">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold">
                        <span>{coupon.progress.current < 10 ? `0${coupon.progress.current}` : coupon.progress.current}/{coupon.progress.max}</span>
                        <span>{coupon.progress.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-[3px]">
                        <div 
                          className="bg-[#da2966] h-[3px] rounded-full" 
                          style={{ width: `${coupon.progress.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-extrabold ${getStatusStyle(coupon.status)}`}>
                      <span className={`w-2 h-2 rounded-full ${getStatusDotColor(coupon.status)}`}></span>
                      {coupon.status}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#fdf2f4] hover:text-[#da2966] transition-colors">
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-5 border-t border-gray-100 flex items-center justify-between">
          <button className="flex items-center gap-1.5 text-[13px] font-bold text-[#da2966] hover:text-[#b11b4e] transition-colors disabled:opacity-50">
            <ArrowLeft size={16} strokeWidth={2} />
            Previous
          </button>
          
          <div className="flex items-center gap-1 hidden sm:flex">
            <button className="w-8 h-8 rounded-full bg-[#da2966] text-white flex items-center justify-center text-[13px] font-bold shadow-sm">1</button>
            <button className="w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center text-[13px] font-medium transition-colors">2</button>
            <button className="w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center text-[13px] font-medium transition-colors">3</button>
            <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-[13px]">...</span>
            <button className="w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center text-[13px] font-medium transition-colors">12</button>
          </div>

          <button className="flex items-center gap-1.5 text-[13px] font-bold text-[#da2966] hover:text-[#b11b4e] transition-colors">
            Next
            <ArrowRight size={16} strokeWidth={2} />
          </button>
        </div>

      </div>
    </div>
  );
}