'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ErrorAlert } from '@/components/ErrorAlert';
import useCartStore from '@/store/cart';
import { shippingService, couponService, orderService, ShippingMethod, CouponValidateResult } from '@/services/api';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants';

export default function CheckoutPage() {
  const router        = useRouter();
  const items         = useCartStore((s) => s.items);
  const subtotal      = useCartStore((s) => s.subtotal());
  const clearCart     = useCartStore((s) => s.clearCart);
  const appliedCoupon = useCartStore((s) => s.appliedCoupon);
  const clearCoupon   = useCartStore((s) => s.clearCoupon);

  /* ── Shipping methods ─────────────────────────────────────────── */
  const [shippingMethods,  setShippingMethods]  = useState<ShippingMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);

  useEffect(() => {
    shippingService.list().then((methods) => {
      setShippingMethods(methods);
      if (methods.length > 0) setSelectedMethodId(methods[0].id);
    }).catch(() => {});
  }, []);

  const selectedMethod = shippingMethods.find((m) => m.id === selectedMethodId) ?? null;
  const shippingCost   = selectedMethod
    ? (selectedMethod.free_over !== null && subtotal >= selectedMethod.free_over ? 0 : selectedMethod.price)
    : 0;

  /* ── Form state ───────────────────────────────────────────────── */
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [city,      setCity]      = useState('');
  const [quartier,  setQuartier]  = useState('');
  const [zip,       setZip]       = useState('');
  const [address,   setAddress]   = useState('');

  /* ── Coupon ───────────────────────────────────────────────────── */
  const [couponCode,    setCouponCode]    = useState('');
  const [couponResult,  setCouponResult]  = useState<CouponValidateResult | null>(null);
  const [couponError,   setCouponError]   = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [autoValidated, setAutoValidated] = useState(false);
  const [couponAlert,   setCouponAlert]   = useState<string | null>(null);
  const [shippingAlert, setShippingAlert] = useState<string | null>(null);

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const couponDiscount = couponResult?.savings_amount ?? 0;
  const total          = Math.max(0, subtotal + shippingCost - couponDiscount);

  // Auto-hide coupon alert after 4 seconds
  useEffect(() => {
    if (couponAlert) {
      const timer = setTimeout(() => setCouponAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [couponAlert]);

  // Auto-hide shipping alert after 4 seconds
  useEffect(() => {
    if (shippingAlert) {
      const timer = setTimeout(() => setShippingAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [shippingAlert]);

  // Auto-charger le coupon depuis le store au montage de la page (une seule fois)
  useEffect(() => {
    if (appliedCoupon && appliedCoupon.code && !autoValidated) {
      setCouponCode(appliedCoupon.code);
      setAutoValidated(true);
      // Revalider le coupon automatiquement
      (async () => {
        setCouponLoading(true);
        try {
          const result = await couponService.validate(appliedCoupon.code, subtotal);
          if (result.valid) {
            setCouponResult(result);
          } else {
            // Coupon invalide ou expiré - afficher une alerte stylisée
            setCouponAlert(`Code promo invalide ou expiré: ${result.message || 'Le code n\'est plus valide.'}`);
            setCouponError(result.message || 'Code invalide.');
            clearCoupon();
          }
        } catch {
          setCouponAlert('Code promo invalide ou expiré.');
          setCouponError('Code invalide ou expiré.');
          clearCoupon();
        } finally {
          setCouponLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedCoupon, autoValidated, subtotal]);

  const handleCoupon = async () => {
    setCouponError('');
    setCouponAlert(null);
    setCouponResult(null);
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const result = await couponService.validate(couponCode.trim(), subtotal);
      if (result.valid) {
        setCouponResult(result);
      } else {
        setCouponError(result.message || 'Code invalide.');
        setCouponAlert(`Code promo invalide: ${result.message || 'Le code n\'est pas valide.'}`);
      }
    } catch {
      setCouponError('Code invalide ou expiré.');
      setCouponAlert('Code promo invalide ou expiré.');
    } finally {
      setCouponLoading(false);
    }
  };

  /* ── Submit ───────────────────────────────────────────────────── */
  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState('');
  // Imperative lock — prevents double-submit when React state update hasn't re-rendered yet
  const submittingRef = useRef(false);

  // Format phone number with spaces as user types
  const formatPhoneDisplay = (value: string): string => {
    // Remove all non-digits and special chars (keep only digits and +)
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // If it starts with +212 or 0, format it nicely
    if (cleaned.startsWith('+212')) {
      // +212 6 12 34 56 78
      const parts = cleaned.slice(4); // Remove +212
      return '+212 ' + parts.match(/.{1,2}/g)?.join(' ') || parts;
    } else if (cleaned.startsWith('0')) {
      // 06 12 34 56 78
      return cleaned.match(/.{1,2}/g)?.join(' ') || cleaned;
    } else if (cleaned.startsWith('212')) {
      // Auto-convert 212 to +212
      const parts = cleaned.slice(3);
      return '+212 ' + parts.match(/.{1,2}/g)?.join(' ') || parts;
    } else {
      // Treat as local number starting with 6, 5, or 7
      return cleaned.match(/.{1,2}/g)?.join(' ') || cleaned;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneDisplay(e.target.value);
    setPhone(formatted);
  }

  // Normalize Moroccan phone numbers
  const normalizePhone = (value: string): string => {
    // Remove all spaces and hyphens
    let normalized = value.replace(/[\s\-]/g, '');
    
    // If starts with 0, convert to +212
    if (normalized.startsWith('0')) {
      normalized = '+212' + normalized.slice(1);
    }
    
    return normalized;
  };

  const isValidPhone = (value: string): boolean => {
    const normalized = normalizePhone(value);
    // Accept +212 followed by 5, 6 or 7, then 8 digits
    return /^\+212[567]\d{8}$/.test(normalized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current || !selectedMethodId || items.length === 0) return;

    setPhoneTouched(true);
    if (!isValidPhone(phone)) {
      setSubmitError('Veuillez entrer un numéro valide: 0612345678 ou +212612345678');
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    setSubmitError('');
    submittingRef.current = true;
    setSubmitting(true);
    try {
      // Construire le payload sans coupon_code si pas de coupon validé
      const payload: any = {
        customer_name: `${firstName} ${lastName}`.trim(),
        customer_phone: normalizedPhone,
        shipping_address: { city, quartier, zip, address },
        shipping_method_id: selectedMethodId,
        items: items.map((i) => ({
          product_id: i.productId,
          size_id: i.sizeId,
          quantity: i.quantity,
        })),
      };
      
      // Ajouter coupon_code seulement si un coupon est validé
      if (couponResult && couponCode.trim()) {
        payload.coupon_code = couponCode.trim();
      }

      const result = await orderService.place(payload);
      clearCart();
      
      // Télécharger automatiquement le PDF de la commande
      try {
        const pdfUrl = `${process.env.NEXT_PUBLIC_API_URL}/v1/invoices/${result.order_number}/download?phone=${encodeURIComponent(normalizedPhone)}`;
        try {
          const response = await fetch(pdfUrl);
          if (response.ok) {
            const contentType = response.headers.get('Content-Type') || '';
            if (contentType.includes('application/pdf')) {
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `invoice-${result.order_number}.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
            } else {
              const text = await response.text();
              try { console.error('Invoice endpoint returned non-pdf content:', JSON.parse(text)); } catch { console.error('Invoice endpoint returned non-pdf content:', text); }
              // Fallback to let browser handle it
              const fallback = document.createElement('a');
              fallback.href = pdfUrl;
              fallback.target = '_blank';
              fallback.rel = 'noopener noreferrer';
              document.body.appendChild(fallback);
              fallback.click();
              document.body.removeChild(fallback);
            }
          } else {
            try {
              const err = await response.json();
              console.error('Invoice download failed:', response.status, err);
            } catch (e) {
              console.error('Invoice download failed with status', response.status);
            }
            const fallback = document.createElement('a');
            fallback.href = pdfUrl;
            fallback.target = '_blank';
            fallback.rel = 'noopener noreferrer';
            document.body.appendChild(fallback);
            fallback.click();
            document.body.removeChild(fallback);
          }
        } catch (e) {
          console.error('Erreur lors du téléchargement du PDF:', e);
          try { window.open(pdfUrl, '_blank', 'noopener'); } catch {}
        }
      } catch (pdfError) {
        console.error('Erreur inattendue lors du téléchargement du PDF:', pdfError);
      }
      
      // Store order details in sessionStorage to avoid PII in URL params
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('order_success', JSON.stringify({
          order: result.order_number,
          total: result.total,
          name: `${firstName} ${lastName}`,
          phone: normalizedPhone,
          city,
        }));
      }
      router.push('/success');
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      setSubmitError(msg ?? 'Une erreur est survenue. Réessayez.');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

          {/* ✅ Breadcrumb — FIXED */}
          <div className="text-sm text-gray-400 mb-8 font-serif">
            <Link href="/" className="hover:text-gray-800">Accueil</Link>
            {' / '}
            <Link href="/collection" className="hover:text-gray-800">Collection</Link>
            {' / '}
            <span className="text-gray-800">Paiement</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-12">

              {/* ── Left: Shipping Form ─────────────────────────────── */}
              <div className="flex-1 lg:w-1/2">
                <h1 className="text-2xl font-serif font-bold text-gray-800 mb-8">Adresse de livraison</h1>

                <div className="space-y-6">
                  {/* Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 font-serif">Prénom *</label>
                      <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} type="text" className="w-full border border-gray-200 rounded-sm px-4 py-3 focus:outline-none focus:border-[#b89b72] font-serif" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 font-serif">Nom de famille *</label>
                      <input required value={lastName} onChange={(e) => setLastName(e.target.value)} type="text" className="w-full border border-gray-200 rounded-sm px-4 py-3 focus:outline-none focus:border-[#b89b72] font-serif" />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 font-serif">Numéro de téléphone *</label>
                    <div className={`flex border rounded-sm focus-within:border-[#b89b72] ${
                      phoneTouched && phone && !isValidPhone(phone)
                        ? 'border-red-400'
                        : 'border-gray-200'
                    }`}>
                      <span className="bg-gray-50 border-r border-gray-200 px-4 py-3 font-serif text-gray-700 text-sm">MAR</span>
                      <input required value={phone} onChange={handlePhoneChange} onBlur={() => setPhoneTouched(true)} type="tel" placeholder="06 12 34 56 78" className="flex-1 px-4 py-3 focus:outline-none font-serif text-gray-600" />
                    </div>
                    {phoneTouched && phone && !isValidPhone(phone) && (
                      <p className="mt-1 text-xs text-red-600 font-serif">Numéro invalide. Entrez 06XXXXXXXX ou +212612345678</p>
                    )}
                  </div>

                  {/* City / Quartier / Zip */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 font-serif">Ville *</label>
                      <input required value={city} onChange={(e) => setCity(e.target.value)} type="text" className="w-full border border-gray-200 rounded-sm px-4 py-3 focus:outline-none focus:border-[#b89b72] font-serif text-gray-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 font-serif">Quartier *</label>
                      <input required value={quartier} onChange={(e) => setQuartier(e.target.value)} type="text" className="w-full border border-gray-200 rounded-sm px-4 py-3 focus:outline-none focus:border-[#b89b72] font-serif text-gray-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 font-serif">Code postal</label>
                      <input value={zip} onChange={(e) => setZip(e.target.value)} type="text" className="w-full border border-gray-200 rounded-sm px-4 py-3 focus:outline-none focus:border-[#b89b72] font-serif text-gray-600" />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 font-serif">Adresse *</label>
                    <input required value={address} onChange={(e) => setAddress(e.target.value)} type="text" className="w-full border border-gray-200 rounded-sm px-4 py-3 focus:outline-none focus:border-[#b89b72] font-serif text-gray-600" />
                  </div>

                  {/* Shipping Methods */}
                  <div className="pt-6">
                    <h2 className="text-xl font-serif font-bold text-gray-800 mb-6">Mode d&apos;expédition</h2>
                    {shippingMethods.length === 0 ? (
                      <p className="font-serif italic text-gray-400 text-sm">Chargement…</p>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {shippingMethods.map((method) => {
                            const methodIsFree = method.free_over !== null && subtotal >= method.free_over;
                            const displayPrice = methodIsFree ? 0 : method.price;
                            const isActive     = selectedMethodId === method.id;
                            const isDisabled   = isFreeShipping;
                            
                            return (
                              <label
                                key={method.id}
                                className={`border rounded-sm p-4 transition-colors flex flex-col ${
                                  isDisabled 
                                    ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' 
                                    : isActive 
                                      ? 'border-2 border-[#b89b72] bg-[#fdfbf9] cursor-pointer' 
                                      : 'border-gray-200 hover:border-[#b89b72] cursor-pointer'
                                }`}
                                onClick={(e) => {
                                  if (isDisabled) {
                                    e.preventDefault();
                                    setShippingAlert('🎉 Félicitations ! Votre commande bénéficie de la livraison gratuite car elle dépasse 600 DH.');
                                  }
                                }}
                              >
                                <input 
                                  type="radio" 
                                  name="shipping" 
                                  className="sr-only" 
                                  checked={isActive} 
                                  onChange={() => !isDisabled && setSelectedMethodId(method.id)}
                                  disabled={isDisabled}
                                />
                                <div className="flex justify-between items-start mb-1">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-gray-800' : 'border-gray-400'}`}>
                                      {isActive && <div className="w-2 h-2 rounded-full bg-gray-800" />}
                                    </div>
                                    <span className="font-serif font-bold text-gray-800 text-sm">{method.name}</span>
                                  </div>
                                  <span className="font-serif font-bold text-gray-900 text-sm">{displayPrice} Dh</span>
                                </div>
                                <span className="text-xs text-gray-500 font-serif ml-6">{method.description}</span>
                              </label>
                            );
                          })}
                        </div>
                        
                        {isFreeShipping && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-sm">
                            <p className="text-sm font-serif text-green-800">
                              ✓ Vous bénéficiez de la livraison gratuite pour toute commande à partir de {FREE_SHIPPING_THRESHOLD} DH
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {submitError && <p className="mt-6 text-sm text-red-600 font-serif">{submitError}</p>}
              </div>

              {/* ── Right: Order Summary ─────────────────────────────── */}
              <div className="lg:w-1/2 bg-[#fcfcfc] p-4 md:p-8 border border-gray-100 rounded-sm h-fit">
                <h2 className="text-lg font-serif font-bold text-gray-800 mb-6 md:mb-8">Your Cart</h2>

                {/* Items */}
                <div className="space-y-6 mb-8 bg-white rounded-[12px] shadow-sm overflow-y-auto max-h-[280px] p-4 border border-gray-100">
                  {items.length === 0 ? (
                    <p className="font-serif italic text-gray-400 text-sm text-center py-4">Your cart is empty.</p>
                  ) : items.map((item, idx) => (
                    <div key={`${item.productId}-${item.sizeLabel}-${idx}`} className="flex gap-4 items-center">
                      <div className="relative w-20 h-20 bg-gray-100 rounded-sm shrink-0 border border-gray-200">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl && item.imageUrl.startsWith('http') ? item.imageUrl : item.imageUrl ? '/' + item.imageUrl : 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=200'} alt={item.productName} fill className="object-cover mix-blend-multiply p-2" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 rounded-sm" />
                        )}
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-600 text-white text-[10px] flex items-center justify-center rounded-full font-serif">{item.quantity}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-serif font-bold text-gray-900 text-sm">{item.productName}</h4>
                        {item.sizeLabel && <p className="font-serif italic text-xs text-gray-400 mt-0.5">{item.sizeLabel}</p>}
                        {item.productType && <p className="font-serif italic text-xs text-gray-400 mt-0.5">{item.productType}</p>}
                      </div>
                      <div className="font-serif font-bold italic text-gray-900 text-base">{item.unitPrice * item.quantity} DH</div>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="mb-6 md:mb-8">
                  {/* Coupon Alert */}
                  {couponAlert && (
                    <div className="mb-4">
                      <ErrorAlert 
                        message={couponAlert}
                        title="Erreur de code promo"
                        onClose={() => setCouponAlert(null)}
                        dismissible={true}
                      />
                    </div>
                  )}
                  
                  {/* Shipping Alert */}
                  {shippingAlert && (
                    <div className="mb-4">
                      <div className="bg-green-50 border-2 border-green-500 rounded-sm p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="font-serif font-bold text-green-800 text-sm mb-1">Livraison Gratuite</h3>
                            <p className="font-serif text-green-700 text-sm">{shippingAlert}</p>
                          </div>
                          <button
                            onClick={() => setShippingAlert(null)}
                            className="text-green-600 hover:text-green-800 font-bold text-lg leading-none"
                            aria-label="Fermer"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600 font-serif mb-3">If you have a coupon code, please apply it below</p>
                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value); setCouponResult(null); setCouponError(''); }}
                      placeholder="Coupon"
                      className={`min-w-0 flex-1 border-2 border-dashed rounded-sm px-3 md:px-4 py-3 text-sm focus:outline-none font-serif ${
                        couponResult ? 'border-[#2e7d32] text-[#2e7d32] bg-[#f4fbf5]' : 'border-gray-200 bg-white'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleCoupon}
                      disabled={couponLoading}
                      className={`px-4 md:px-6 py-3 rounded-sm font-serif italic text-sm whitespace-nowrap transition-colors ${
                        couponResult ? 'bg-[#005c2b] text-white cursor-default' : 'bg-[#4a403a] text-white hover:bg-[#3a322d]'
                      }`}
                    >
                      {couponResult ? 'Coupon validé ✓' : couponLoading ? '…' : 'Appliquer'}
                    </button>
                  </div>
                  {couponResult && <p className="mt-2 text-xs text-[#2e7d32] font-serif">✓ {couponResult.message}</p>}
                  {couponError  && <p className="mt-2 text-xs text-red-500 font-serif">{couponError}</p>}
                </div>

                {/* Summary */}
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="font-serif font-bold text-gray-800 text-sm">Sous-total</span>
                    <span className="font-serif font-bold italic text-gray-900">{subtotal} DH</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-serif font-bold text-gray-800 text-sm">Expédition</span>
                    <span className="font-serif font-bold italic text-gray-900">{shippingCost === 0 ? 'Gratuit' : `${shippingCost} DH`}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-bold text-gray-800 text-sm">Coupon</span>
                      <span className="font-serif font-bold italic text-[#2e7d32]">- {couponDiscount} DH</span>
                    </div>
                  )}
                  <hr className="border-gray-200 my-4" />
                  <div className="flex justify-between items-center">
                    <span className="font-serif font-bold text-gray-800">Total</span>
                    <span className="font-serif font-bold italic text-xl text-gray-900">{total.toFixed(2)} DH</span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting || items.length === 0}
                  className="block w-full text-center bg-[#4a403a] text-white py-4 rounded-sm font-serif italic text-base hover:bg-[#3a322d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Traitement…' : 'Acheter maintenant ›'}
                </button>
              </div>

            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
