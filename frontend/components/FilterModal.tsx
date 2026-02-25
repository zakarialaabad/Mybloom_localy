'use client';

import { X, ChevronUp, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterModal({ isOpen, onClose }: FilterModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('Boss');
  const [selectedGender, setSelectedGender] = useState('Woman');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const brands = [
    { name: 'Boss', count: 12 },
    { name: 'Prada', count: 18 },
    { name: 'Lancome', count: 10 },
    { name: 'Dior', count: 20 },
    { name: 'Chanel', count: 13 },
    { name: 'Balenciaga', count: 13 },
    { name: 'Versace', count: 22 },
  ];

  const genders = [
    { name: 'Woman', count: 110 },
    { name: 'Man', count: 40 },
    { name: 'Child', count: 20 },
  ];

  // Mock data for the price histogram to match the reference shape
  const histogramHeights = [
    2, 2, 3, 5, 4, 8, 12, 8, 15, 10, 18, 15, 25, 45, 80, 100, 85, 70, 65, 50, 55, 40, 45, 30, 20, 15, 10, 5, 5, 3, 2, 2
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 z-[101] w-full max-w-[400px] bg-[#f9f9f9] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-center p-6 relative bg-white border-b border-gray-100 shrink-0">
          <h2 className="text-2xl font-serif font-bold text-gray-800">Filter</h2>
          <button 
            onClick={onClose}
            className="absolute right-6 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Brand Section */}
          <div className="bg-white p-6 rounded-sm shadow-sm">
            <div className="flex justify-between items-center mb-4 cursor-pointer">
              <h3 className="font-serif text-lg text-gray-500">Brand</h3>
              <ChevronUp className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="bg-[#f9f9f9] rounded-sm p-2.5 flex items-center gap-2 mb-5">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search brand..." 
                className="bg-transparent border-none focus:outline-none text-sm w-full placeholder:text-gray-400 text-gray-600 font-sans"
              />
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
              {brands.map((brand) => (
                <label key={brand.name} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${selectedBrand === brand.name ? 'border-gray-800' : 'border-gray-300 group-hover:border-gray-400'}`}>
                    {selectedBrand === brand.name && <div className="w-2 h-2 bg-gray-800 rounded-full" />}
                  </div>
                  <span className={`font-serif text-[15px] ${selectedBrand === brand.name ? 'text-gray-800' : 'text-gray-600'}`}>
                    {brand.name} <span className="font-sans text-gray-400 text-xs ml-1">({brand.count})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Section */}
          <div className="bg-white p-6 rounded-sm shadow-sm">
            <div className="flex justify-between items-center mb-8 cursor-pointer">
              <h3 className="font-serif text-lg text-gray-500">Price</h3>
              <ChevronUp className="w-4 h-4 text-gray-400" />
            </div>

            {/* Histogram */}
            <div className="px-2">
              <div className="flex items-end justify-between h-20 gap-[2px] mb-2">
                {histogramHeights.map((height, i) => (
                  <div 
                    key={i} 
                    className="w-full bg-[#cda873] rounded-t-[1px] opacity-80" 
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              
              {/* Slider Track */}
              <div className="relative h-0.5 bg-gray-200 w-full">
                <div className="absolute left-[10%] right-[15%] h-full bg-[#cda873]"></div>
                {/* Handles */}
                <div className="absolute left-[10%] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-100 rounded-full shadow-sm cursor-pointer"></div>
                <div className="absolute right-[15%] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-100 rounded-full shadow-sm cursor-pointer"></div>
              </div>

              {/* Min/Max Labels */}
              <div className="flex justify-between mt-5 text-[11px] font-serif text-gray-400 px-1">
                <span>Minimum</span>
                <span>Maximum</span>
              </div>

              {/* Min/Max Inputs */}
              <div className="flex justify-between mt-2">
                <div className="border border-gray-100 rounded-full px-5 py-2 text-xs text-gray-500 font-serif">
                  80 MAD
                </div>
                <div className="border border-gray-100 rounded-full px-5 py-2 text-xs text-gray-500 font-serif">
                  400 MAD
                </div>
              </div>
            </div>
          </div>

          {/* Gender Section */}
          <div className="bg-white p-6 rounded-sm shadow-sm">
            <div className="flex justify-between items-center mb-5 cursor-pointer">
              <h3 className="font-serif text-lg text-gray-500">Gender</h3>
              <ChevronUp className="w-4 h-4 text-gray-400" />
            </div>

            <div className="space-y-4">
              {genders.map((gender) => (
                <label key={gender.name} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${selectedGender === gender.name ? 'border-gray-800' : 'border-gray-300 group-hover:border-gray-400'}`}>
                    {selectedGender === gender.name && <div className="w-2 h-2 bg-gray-800 rounded-full" />}
                  </div>
                  <span className={`font-serif text-[15px] ${selectedGender === gender.name ? 'text-gray-800' : 'text-gray-600'}`}>
                    {gender.name} <span className="font-sans text-gray-400 text-xs ml-1">({gender.count})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}