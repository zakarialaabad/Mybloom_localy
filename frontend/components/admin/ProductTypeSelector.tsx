'use client';

import React, { useState, useMemo } from 'react';

interface ProductType {
  id: number;
  name: string;
  icon?: JSX.Element;
}

interface ProductTypeSelectorProps {
  productTypes: ProductType[];
  selected: string;
  onSelect: (typeName: string) => void;
  icon?: JSX.Element;
}

// Categorize product types
const categorizeTypes = (types: ProductType[]) => {
  const fragranceKeywords = ['Floral', 'Oriental', 'Fruité', 'Gourmand', 'Chypré', 'Ambré', 'Aromatique', 'Aquatique', 'Aldéhydé', 'Boisé', 'Blanc', 'Musqué', 'Épicé', 'Fougère'];
  
  const fragrance: ProductType[] = [];
  const general: ProductType[] = [];

  types.forEach(type => {
    const hasFragranceKeyword = fragranceKeywords.some(keyword => type.name.includes(keyword));
    if (hasFragranceKeyword) {
      fragrance.push(type);
    } else {
      general.push(type);
    }
  });

  return { fragrance, general };
};

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="2"/>
    <path d="M14 14l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default function ProductTypeSelector({
  productTypes,
  selected,
  onSelect,
  icon,
}: ProductTypeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (productTypes.length === 0) {
    return (
      <div className="text-[13px] text-gray-400">
        No product types available
      </div>
    );
  }

  const { fragrance, general } = categorizeTypes(productTypes);

  // Filter based on search query
  const filteredFragrance = fragrance.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredGeneral = general.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasResults = filteredFragrance.length > 0 || filteredGeneral.length > 0;

  const TypeButton = ({ type }: { type: ProductType }) => (
    <button
      key={type.id}
      onClick={() => onSelect(type.name)}
      className={`relative h-[42px] px-3 py-2 rounded-[10px] text-[12px] font-semibold transition-all duration-200 flex items-center justify-center text-center group overflow-hidden whitespace-nowrap ${
        selected === type.name
          ? 'bg-[#da2966] text-white shadow-[0_4px_12px_rgba(218,41,102,0.25)]'
          : 'border border-gray-200 bg-white text-gray-600 hover:border-[#da2966]/40 hover:bg-[#fff0f3]'
      }`}
    >
      {/* Animated background on hover */}
      {selected !== type.name && (
        <span className="absolute inset-0 bg-gradient-to-br from-[#da2966]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      )}

      {/* Content */}
      <span className="relative truncate px-1">
        {type.name}
      </span>

      {/* Checkmark for selected */}
      {selected === type.name && (
        <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-3 h-3 bg-white/20 rounded-full">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </button>
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Search Field - More visible when many items */}
      {productTypes.length > 10 && (
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search product types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-[12px] border border-gray-200 rounded-[8px] focus:outline-none focus:border-[#da2966] focus:ring-1 focus:ring-[#da2966]/20 transition-colors"
          />
        </div>
      )}

      {/* No Results Message */}
      {searchQuery && !hasResults && (
        <div className="text-center py-4">
          <p className="text-[13px] text-gray-400">
            No product types match "{searchQuery}"
          </p>
        </div>
      )}

      {/* Fragrance Families Section */}
      {filteredFragrance.length > 0 && (
        <div className="flex flex-col gap-2">
          {searchQuery === '' && (
            <p className="text-[12px] font-bold text-gray-500 px-1">Fragrance Families</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {filteredFragrance.map(type => (
              <TypeButton key={type.id} type={type} />
            ))}
          </div>
        </div>
      )}

      {/* General Products Section */}
      {filteredGeneral.length > 0 && (
        <div className="flex flex-col gap-2">
          {searchQuery === '' && (
            <p className="text-[12px] font-bold text-gray-500 px-1">General Products</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {filteredGeneral.map(type => (
              <TypeButton key={type.id} type={type} />
            ))}
          </div>
        </div>
      )}

      {/* Selected Type Summary */}
      {selected && (
        <div className="bg-gradient-to-r from-[#fff0f3] to-[#fcfcfc] border border-[#da2966]/10 rounded-[10px] px-3.5 py-2.5 flex items-center gap-2.5 mt-1">
          <div className="w-2 h-2 bg-[#da2966] rounded-full shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-gray-500">Selected Type</p>
            <p className="text-[12px] font-bold text-[#da2966] truncate">
              {selected}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
