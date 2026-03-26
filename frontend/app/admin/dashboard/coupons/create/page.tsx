'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Info,
  Clock,
  PercentCircle,
  Settings2
} from 'lucide-react';
import { adminCouponService } from '@/services/api';
import { TextInput, SelectField, RadioGroup } from '@/components/FormField';
import { ErrorAlert } from '@/components/ErrorAlert';

export default function CreateCouponPage() {
  const router = useRouter();

  // Form state
  const [code, setCode] = useState('');
  const [campaign, setCampaign] = useState('');
  const [promoType, setPromoType] = useState('Influencers');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [maxUses, setMaxUses] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');

      if (!code.trim()) {
        setError('Coupon Code is required.');
        setIsSaving(false);
        return;
      }
      if (!discountValue) {
        setError('Discount Value is required.');
        setIsSaving(false);
        return;
      }

      await adminCouponService.create({
        code: code.toUpperCase().trim(),
        type: discountType,
        value: parseFloat(discountValue),
        usage_limit: maxUses ? parseInt(maxUses) : undefined,
        expires_at: endDate || null,
        is_active: true,
      });

      router.push('/admin/dashboard/coupons');
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(errorMsg || 'Failed to create coupon.');
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      {/* Header Container */}
      <div className="bg-white border-b border-gray-100">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-24 max-w-[1400px] mx-auto py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
          <div>
            <Link
              href="/admin/dashboard/coupons"
              className="inline-flex items-center gap-2 text-[#da2966] font-medium text-[13px] hover:underline mb-4 transition-all"
            >
              <ArrowLeft size={16} strokeWidth={2.5} />
              Back to Coupon
            </Link>
            <h1 className="text-[28px] sm:text-[34px] font-serif font-bold text-[#333] tracking-tight leading-tight mb-1">
              Create New Coupon
            </h1>
            <p className="text-[14px] text-gray-500">
              Define your luxury promotion details and redemption rules
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
            <Link
              href="/admin/dashboard/coupons"
              className="px-6 py-2.5 rounded-full border border-gray-200 text-[#555] font-medium text-[14px] hover:bg-gray-50 transition-all font-serif italic text-center w-full sm:w-auto"
            >
              Discard
            </Link>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#ed3269] hover:bg-[#d42255] text-white font-medium text-[14px] transition-all shadow-sm disabled:opacity-60 w-full sm:w-auto"
            >
              <Save size={16} strokeWidth={2.5} />
              {isSaving ? 'Saving...' : 'Save Coupon'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-24 max-w-[1400px] mx-auto py-8">
        {error && <ErrorAlert message={error} onClose={() => setError('')} title="Error" />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
          
          {/* Card 1: Basic Information */}
          <div className="bg-white rounded-[16px] p-5 sm:p-8 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 text-[#da2966] mb-8">
              <Info size={20} strokeWidth={2} />
              <h2 className="text-[16px] sm:text-[18px] font-serif font-bold tracking-wide">Basic Information</h2>
            </div>

            <div className="space-y-5">
              <div>
                <TextInput
                  label="Coupon Code"
                  placeholder="e.g. SUMMER2026"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                />
              </div>
              <div>
                <TextInput
                  label="Campaign Name"
                  placeholder="e.g. summer 2026"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#444] mb-3">Promotion Type</label>
                <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                    onClick={() => setPromoType('Influencers')}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-semibold border transition-all ${
                      promoType === 'Influencers'
                        ? 'bg-pink-50 border-pink-100 text-[#da2966]'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 ${
                      promoType === 'Influencers' ? 'border-[#da2966] bg-[#da2966]/20' : 'border-gray-300'
                    }`}>
                      {promoType === 'Influencers' && <span className="w-1.5 h-1.5 bg-[#da2966] rounded-full" />}
                    </span>
                    Influencers
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromoType('Top Client')}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-semibold border transition-all ${
                      promoType === 'Top Client'
                        ? 'bg-pink-50 border-pink-100 text-[#da2966]'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 ${
                      promoType === 'Top Client' ? 'border-[#da2966] bg-[#da2966]/20' : 'border-gray-300'
                    }`}>
                      {promoType === 'Top Client' && <span className="w-1.5 h-1.5 bg-[#da2966] rounded-full" />}
                    </span>
                    Top Client
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Validity */}
          <div className="bg-white rounded-[16px] p-5 sm:p-8 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 text-[#da2966] mb-8">
              <Clock size={20} strokeWidth={2} />
              <h2 className="text-[16px] sm:text-[18px] font-serif font-bold tracking-wide">Validity</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <TextInput
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div>
                <TextInput
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Card 3: Discount Settings */}
          <div className="bg-white rounded-[16px] p-5 sm:p-8 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 text-[#da2966] mb-8">
              <PercentCircle size={20} strokeWidth={2} />
              <h2 className="text-[16px] sm:text-[18px] font-serif font-bold tracking-wide">Discount Settings</h2>
            </div>

            <div className="space-y-5">
              <div>
                <SelectField
                  label="Discount Type"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'percent' | 'fixed')}
                  options={[
                    { value: 'percent', label: 'Percentage (%)' },
                    { value: 'fixed', label: 'Fixed Amount (DH)' },
                  ]}
                />
              </div>

              <div>
                <TextInput
                  label="Discount Value"
                  type="number"
                  placeholder="0"
                  min="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  hint={discountType === 'percent' ? 'Enter percentage value' : 'Enter amount in DH'}
                  required
                />
              </div>
            </div>
          </div>

          {/* Card 4: Usage Rules */}
          <div className="bg-white rounded-[16px] p-5 sm:p-8 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 text-[#da2966] mb-8">
              <Settings2 size={20} strokeWidth={2} />
              <h2 className="text-[16px] sm:text-[18px] font-serif font-bold tracking-wide">Usage Rules</h2>
            </div>

            <div>
              <TextInput
                label="Max Total Uses"
                type="number"
                placeholder="0"
                min="0"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                hint="Leave empty for unlimited uses"
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
