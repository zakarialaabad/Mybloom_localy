'use client';

import React from 'react';
import Image from 'next/image';
import { 
  Star, 
  TrendingUp, 
  Eye, 
  Edit3, 
  Trash2, 
  Plus, 
  ArrowLeft, 
  ArrowRight,
  Sparkles,
  MessageSquare
} from 'lucide-react';

export default function ReviewsPage() {
  const reviews = [
    {
      id: 1,
      conversationImg: '/public_Image/MybLoom.jpg', // Placeholder
      client: 'Zineb Elmakoudi',
      note: 5,
      date: 'OCT 24, 2026',
    },
    {
      id: 2,
      conversationImg: '/public_Image/MybLoom.jpg', // Placeholder
      client: 'Zineb Elmakoudi',
      note: 5,
      date: 'OCT 24, 2026',
    },
    {
      id: 3,
      conversationImg: '/public_Image/MybLoom.jpg', // Placeholder
      client: 'Zineb Elmakoudi',
      note: 5,
      date: 'OCT 24, 2026',
    },
    {
      id: 4,
      conversationImg: '/public_Image/MybLoom.jpg', // Placeholder
      client: 'Zineb Elmakoudi',
      note: 5,
      date: 'OCT 24, 2026',
    },
  ];

  return (
    <div className="p-8 max-w-[1240px] mx-auto w-full">
      {/* ─── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-10 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-[32px] font-serif font-bold text-[#111] tracking-tight mb-2">
            Review Management
          </h1>
          <p className="text-[15px] text-gray-500 font-medium">
            Analyze performance and curate your brand's best feedback
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="flex items-center gap-2 bg-[#423835] text-white px-6 py-3 rounded-[8px] text-[13px] font-bold shadow-sm hover:bg-[#2d2624] transition-colors italic">
            + Ajouter un avis
          </button>
        </div>
      </div>

      {/* ─── Stat Cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* Card 1: Global Average */}
        <div className="bg-white rounded-[20px] border border-[#f2e6ea] p-7 shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-start mb-6">
            <div className="w-[56px] h-[56px] rounded-full bg-[#fdf2f4] flex items-center justify-center text-[#da2966]">
              <div className="relative">
                <Star size={24} fill="currentColor" />
                <div className="absolute -right-1 -top-1 w-3 h-3 bg-[#da2966] rounded-full border-2 border-white"></div>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-[#eefaf3] text-[#0f8e5c] px-3 py-1 rounded-[6px] text-[13px] font-bold">
              <TrendingUp size={14} strokeWidth={3} />
              15%
            </div>
          </div>
          <p className="text-[14px] text-gray-400 font-bold mb-2">Global Average</p>
          <div className="flex items-baseline gap-1">
            <h2 className="text-[38px] font-serif font-bold text-[#111] tracking-tighter">4.7</h2>
            <span className="text-[20px] font-serif text-[#da2966] font-bold">/5.0</span>
          </div>
          <p className="text-[12px] text-gray-400 mt-2 font-medium">vs. last month</p>
        </div>

        {/* Card 2: Total Reviews */}
        <div className="bg-white rounded-[20px] border border-[#f2e6ea] p-7 shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-start mb-6">
            <div className="w-[56px] h-[56px] rounded-full bg-[#fdf2f4] flex items-center justify-center text-[#da2966]">
              <Sparkles size={24} strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-1 bg-[#eefaf3] text-[#0f8e5c] px-3 py-1 rounded-[6px] text-[13px] font-bold">
              <TrendingUp size={14} strokeWidth={3} />
              5%
            </div>
          </div>
          <p className="text-[14px] text-gray-400 font-bold mb-2">Total Reviews</p>
          <h2 className="text-[38px] font-serif font-bold text-[#111] tracking-tighter">2,488</h2>
          <p className="text-[12px] text-gray-400 mt-2 font-medium">vs. last month</p>
        </div>

        {/* Card 3: Most Reviewed */}
        <div className="bg-white rounded-[20px] border border-[#f2e6ea] p-7 shadow-[0_2px_15px_rgba(0,0,0,0.01)]">
          <div className="flex justify-between items-start mb-6">
            <div className="w-[56px] h-[56px] rounded-full overflow-hidden border-2 border-[#fdf2f4]">
              <Image src="/public_Image/MybLoom.jpg" alt="Over Dose" width={56} height={56} className="object-cover" />
            </div>
            <div className="flex items-center gap-1 bg-[#eefaf3] text-[#0f8e5c] px-3 py-1 rounded-[6px] text-[13px] font-bold">
              <TrendingUp size={14} strokeWidth={3} />
              8%
            </div>
          </div>
          <p className="text-[14px] text-gray-400 font-bold mb-2">Most Reviewed</p>
          <h2 className="text-[32px] font-serif font-bold text-[#111] tracking-tighter">Over Dose</h2>
          <p className="text-[12px] text-gray-400 mt-2 font-medium">480 Reviews</p>
        </div>

      </div>

      {/* ─── Table Section ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[20px] border border-[#f2e6ea] shadow-[0_2px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        
        <div className="p-6 flex items-center justify-between border-b border-gray-100 bg-white">
          <h3 className="text-[16px] font-bold text-[#111]">Avis Publies en accueil</h3>
          <div className="text-[13px] text-gray-400 font-medium">
            Showing 1-10 of 120
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-[#fffcfd]">
                <th className="px-8 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#da2966]">Conversation</th>
                <th className="px-8 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#da2966]">Client</th>
                <th className="px-8 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#da2966]">Note</th>
                <th className="px-8 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#da2966]">Date</th>
                <th className="px-8 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#da2966]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  
                  {/* Conversation Img */}
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="relative w-[100px] h-[60px] rounded-[8px] overflow-hidden border border-gray-100">
                      <Image 
                        src={review.conversationImg} 
                        alt="Conversation" 
                        fill 
                        className="object-cover"
                      />
                    </div>
                  </td>

                  {/* Client */}
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className="text-[15px] font-medium text-gray-500">{review.client}</span>
                  </td>

                  {/* Note */}
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          className={i < review.note ? "text-[#b09d6d] fill-[#b09d6d]" : "text-gray-200"} 
                        />
                      ))}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className="text-[14px] font-medium text-gray-500">{review.date}</span>
                  </td>

                  {/* Actions */}
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#fdf2f4] hover:text-[#da2966] transition-all">
                        <Eye size={16} strokeWidth={2.5} />
                      </button>
                      <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#fdf2f4] hover:text-[#da2966] transition-all">
                        <Edit3 size={16} strokeWidth={2.5} />
                      </button>
                      <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#fdf2f4] hover:text-[#da2966] transition-all">
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-white">
          <button className="flex items-center gap-1.5 text-[14px] font-bold text-[#da2966] hover:text-[#b11b4e] transition-colors">
            <ArrowLeft size={16} strokeWidth={2.5} />
            Previous
          </button>
          
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full bg-[#da2966] text-white flex items-center justify-center text-[14px] font-bold shadow-md">1</button>
            <button className="w-9 h-9 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center text-[14px] font-medium transition-colors">2</button>
            <button className="w-9 h-9 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center text-[14px] font-medium transition-colors">3</button>
            <span className="w-9 h-9 flex items-center justify-center text-gray-400 text-[14px]">...</span>
            <button className="w-9 h-9 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center text-[14px] font-medium transition-colors">12</button>
          </div>

          <button className="flex items-center gap-1.5 text-[14px] font-bold text-[#da2966] hover:text-[#b11b4e] transition-colors">
            Next
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </div>

      </div>
    </div>
  );
}