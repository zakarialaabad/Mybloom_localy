'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSWRConfig } from 'swr';
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
  const { mutate } = useSWRConfig();

  // Form state
  const [code, setCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [promoType, setPromoType] = useState('Influencers');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [maxUses, setMaxUses] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (message: string) => {
    setToastMsg(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3200);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');

      if (!code.trim()) {
        showToast('Coupon Code is required.');
        setIsSaving(false);
        return;
      }
      if (!discountValue) {
        showToast('Discount Value is required.');
        setIsSaving(false);
        return;
      }

      await adminCouponService.create({
        code: code.toUpperCase().trim(),
        company_name: companyName.trim() || null,
        promo_type: promoType,
        type: discountType,
        value: parseFloat(discountValue),
        usage_limit: maxUses ? parseInt(maxUses) : undefined,
        expires_at: endDate || null,
        is_active: true,
      });

      // Invalidate + revalidate SWR cache so the list page refetches fresh data
      await mutate(() => true, undefined, { revalidate: true });

      showToast('Coupon created successfully!');
      setTimeout(() => router.push('/gestion-bloom-secure/dashboard/coupons'), 1200);
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast(errorMsg || 'Failed to create coupon.');
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {toastVisible && (
        <div
          style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 200, animation: 'toastIn 0.3s ease-out' }}
          className="flex items-center gap-3 bg-white border border-[#da2966] text-[#da2966] px-5 py-3.5 rounded-t-[24px] sm:rounded-[24px] rounded-b-none sm:rounded-b-[24px] w-full sm:w-auto shadow-[0_8px_32px_rgba(218,41,102,0.2)] text-[14px] font-bold whitespace-nowrap pointer-events-none"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          {toastMsg}
        </div>
      )}

      {/* Header Container */}
      <div className="bg-white border-b border-gray-100">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-24 max-w-[1400px] mx-auto py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
          <div>
            <Link
              href="/gestion-bloom-secure/dashboard/coupons"
              className="inline-flex items-center gap-2 text-[#da2966] font-medium text-[13px] hover:underline mb-4 transition-all"
            >
              <ArrowLeft size={16} strokeWidth={2.5} />
              Retour aux codes promo
            </Link>
            <h1 className="text-[28px] sm:text-[34px] font-serif font-bold text-[#333] tracking-tight leading-tight mb-1">
              Créer un nouveau code promo
            </h1>
            <p className="text-[14px] text-gray-500">
              Définissez vos détails de promotion et vos règles de remboursement
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#ed3269] hover:bg-[#d42255] text-white font-medium text-[14px] transition-all shadow-sm disabled:opacity-60 w-full sm:w-auto"
            >
              <Save size={16} strokeWidth={2.5} />
              {isSaving ? 'Énregistrement...' : 'Enregistrer le code promo'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-24 max-w-[1400px] mx-auto py-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
          
          {/* Card 1: Basic Information */}
          <div className="bg-white rounded-[16px] p-5 sm:p-8 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 text-[#da2966] mb-8">
              <Info size={20} strokeWidth={2} />
              <h2 className="text-[16px] sm:text-[18px] font-serif font-bold tracking-wide">Informations de base</h2>
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
                  label="Nom de la campagne"
                  placeholder="p.ex. Ramadan 2026"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#444] mb-3">Type de promotion</label>
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
              <h2 className="text-[16px] sm:text-[18px] font-serif font-bold tracking-wide">Validité</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <TextInput
                  label="Date de début"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div>
                <TextInput
                  label="Date de fin"
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
              <h2 className="text-[16px] sm:text-[18px] font-serif font-bold tracking-wide">Paramétres de réduction</h2>
            </div>

            <div className="space-y-5">
              <div>
                <SelectField
                  label="Type de réduction"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'percent' | 'fixed')}
                  options={[
                    { value: 'percent', label: 'Pourcentage (%)' },
                    { value: 'fixed', label: 'Montant fixe (DH)' },
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