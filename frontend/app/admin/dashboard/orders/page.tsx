'use client';

import React from 'react';
import { 
  Filter, 
  ArrowUpDown, 
  Search, 
  Eye, 
  MoreVertical, 
  ArrowLeft, 
  ArrowRight,
  TrendingUp,
  ListTodo,
  ClipboardCheck,
  PackageCheck
} from 'lucide-react';

export default function OrdersPage() {
  const orders = [
    {
      id: '#ORD-0012',
      customer: { name: 'Imane Olhime', phone: '+212 6 24 22 36 55', initials: 'IO' },
      date: 'OCT 24, 2026',
      items: '3 items',
      total: '433.00 Dhs',
      status: 'Pending',
    },
    {
      id: '#ORD-0013',
      customer: { name: 'Khoulod Olm', phone: '+212 6 24 22 36 55', initials: 'KO' },
      date: 'OCT 24, 2026',
      items: '2 items',
      total: '433.00 Dhs',
      status: 'Confirmed',
    },
    {
      id: '#ORD-0014',
      customer: { name: 'Zineb Laghzal', phone: '+212 6 24 22 36 55', initials: 'ZL' },
      date: 'OCT 24, 2026',
      items: '1 item',
      total: '433.00 Dhs',
      status: 'Delivered',
    },
    {
      id: '#ORD-0014',
      customer: { name: 'Oumaima Alim', phone: '+212 6 24 22 36 55', initials: 'OA' },
      date: 'OCT 24, 2026',
      items: '1 item',
      total: '433.00 Dhs',
      status: 'Shipped',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-gray-100 text-gray-600';
      case 'Confirmed':
        return 'bg-blue-50 text-blue-600';
      case 'Delivered':
        return 'bg-[#eefcf2] text-[#0f8e5c]'; // green
      case 'Shipped':
        return 'bg-purple-50 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-gray-400';
      case 'Confirmed': return 'bg-blue-500';
      case 'Delivered': return 'bg-[#0f8e5c]';
      case 'Shipped': return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto w-full">
      {/* ─── Header ───────────────────────────────────────────────────────────── */}
      <div className="mb-8 border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-serif font-bold text-[#111] tracking-tight mb-2">
          Order Management
        </h1>
        <p className="text-[14px] text-gray-500">
          Mange and track customer orders across all channels. Prioritize pending shipments and review delivered items.
        </p>
      </div>

      {/* ─── Stat Cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-white rounded-[16px] border border-[#faeef1] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-6">
            <div className="w-[52px] h-[52px] rounded-full bg-[#faeef1] flex items-center justify-center text-[#da2966]">
              <ListTodo size={24} strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-1 bg-[#eefaf3] text-[#0f8e5c] px-2.5 py-1 rounded-[6px] text-[12px] font-bold">
              <TrendingUp size={14} strokeWidth={3} />
              15%
            </div>
          </div>
          <p className="text-[14px] text-gray-500 font-medium mb-1">All Orders</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-[36px] font-serif font-bold text-[#111] leading-none tracking-tight">1,248</h2>
          </div>
          <p className="text-[12px] text-gray-400 mt-2">vs. last month</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-[16px] border border-[#faeef1] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-6">
            <div className="w-[52px] h-[52px] rounded-full bg-[#faeef1] flex items-center justify-center text-[#da2966]">
              <ClipboardCheck size={24} strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-1 bg-[#eefaf3] text-[#0f8e5c] px-2.5 py-1 rounded-[6px] text-[12px] font-bold">
              <TrendingUp size={14} strokeWidth={3} />
              5%
            </div>
          </div>
          <p className="text-[14px] text-gray-500 font-medium mb-1">Confirmed</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-[36px] font-serif font-bold text-[#111] leading-none tracking-tight">1240</h2>
          </div>
          <p className="text-[12px] text-gray-400 mt-2">vs. last month</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-[16px] border border-[#faeef1] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-6">
            <div className="w-[52px] h-[52px] rounded-full bg-[#faeef1] flex items-center justify-center text-[#da2966]">
              <PackageCheck size={24} strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-1 bg-[#eefaf3] text-[#0f8e5c] px-2.5 py-1 rounded-[6px] text-[12px] font-bold">
              <TrendingUp size={14} strokeWidth={3} />
              8%
            </div>
          </div>
          <p className="text-[14px] text-gray-500 font-medium mb-1">Delivered</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-[36px] font-serif font-bold text-[#111] leading-none tracking-tight">1240</h2>
          </div>
          <p className="text-[12px] text-gray-400 mt-2">vs. last month</p>
        </div>
      </div>

      {/* ─── Orders Table Area ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[16px] border border-[#f2e6ea] shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-100">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-[8px] text-[13px] font-bold text-[#444] hover:bg-gray-50 transition-colors">
              <Filter size={16} className="text-gray-500" strokeWidth={2.5} />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-[8px] text-[13px] font-bold text-[#444] hover:bg-gray-50 transition-colors">
              <ArrowUpDown size={16} className="text-gray-500" strokeWidth={2.5} />
              Sort
            </button>
            <div className="relative flex-1 md:w-[280px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search orders..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-[8px] text-[13px] focus:outline-none focus:border-[#da2966] focus:ring-1 focus:ring-[#da2966] transition-all"
              />
            </div>
          </div>
          <div className="text-[13px] text-gray-500 font-medium whitespace-nowrap">
            Showing 1-10 of 1,248
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-[#fffcfd]">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#da2966]">Order ID</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#da2966]">Customer</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#da2966]">Date</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#da2966]">Items</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#da2966]">Total</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#da2966]">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#da2966]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  
                  {/* Order ID */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-[14px] font-bold text-[#222]">{order.id}</span>
                  </td>

                  {/* Customer */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-[38px] h-[38px] rounded-full bg-[#fdf2f4] text-[#da2966] flex items-center justify-center font-bold text-[14px]">
                        {order.customer.initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-[#333]">{order.customer.name}</span>
                        <span className="text-[12px] text-gray-400 mt-0.5">{order.customer.phone}</span>
                      </div>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-[14px] text-gray-500 font-medium uppercase text-[12px]">{order.date}</span>
                  </td>

                  {/* Items */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-[14px] text-gray-500">{order.items}</span>
                  </td>

                  {/* Total */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-[14px] font-medium text-gray-500">{order.total}</span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold ${getStatusColor(order.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(order.status)}`}></span>
                      {order.status}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <button className="w-8 h-8 rounded-full bg-[#fdf2f4] flex items-center justify-center text-[#da2966] hover:bg-[#faeef1] transition-colors">
                        <Eye size={16} strokeWidth={2.5} />
                      </button>
                      <button className="text-[#da2966] hover:bg-[#fdf2f4] rounded-full p-1 transition-colors">
                        <MoreVertical size={18} strokeWidth={2.5} />
                      </button>
                    </div>
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