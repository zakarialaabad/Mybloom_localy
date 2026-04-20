'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { adminBannerService, Banner } from '@/services/api';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';

// ── Slot config ───────────────────────────────────────────────────────────────

const HOMEPAGE_POSITIONS = [1, 2, 3, 4] as const;

// ── Upload area component ─────────────────────────────────────────────────────

function UploadArea({
  position,
  onUploaded,
}: {
  position: number;
  onUploaded: (banner: Banner) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('type', 'homepage_slot');
      form.append('position', String(position));
      form.append('image', file);
      const banner = await adminBannerService.store(form);
      onUploaded(banner);
    } catch (err) {
      console.error('[BannersPage] upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className="flex-1 w-full h-full min-h-[160px] border-2 border-dashed border-[#da2966] bg-white flex flex-col items-center justify-center p-3 text-center group cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpg,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      {uploading ? (
        <Loader2 size={24} className="text-[#da2966] animate-spin mb-2" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-[#da2966] flex items-center justify-center text-white mb-2 shadow-[0_4px_10px_rgba(218,41,102,0.3)] group-hover:scale-110 transition-transform shrink-0">
          <UploadCloud size={20} strokeWidth={2} />
        </div>
      )}
      <p className="text-[12px] sm:text-[13px] font-bold text-[#111] mb-1 leading-snug">
        {uploading ? 'Téléchargement...' : 'Déposer une photo'}
      </p>
      <p className="text-[10px] text-gray-400 font-medium leading-snug">
        JPG · PNG · 10 Mo max
      </p>
    </div>
  );
}

// ── Filled slot component ─────────────────────────────────────────────────────

function FilledSlot({
  banner,
  onRequestDelete,
  deleting,
}: {
  banner: Banner;
  onRequestDelete: () => void;
  deleting?: boolean;
}) {
  return (
    <div className="relative w-full h-full group">
      <Image
        src={banner.image_path}
        alt={banner.title ?? 'Banner'}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <div className="absolute top-3 left-3 z-10">
        <button
          onClick={(e) => { e.stopPropagation(); onRequestDelete(); }}
          disabled={deleting}
          className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#da2966] border border-[#da2966] shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:bg-[#da2966] hover:text-white transition-colors disabled:opacity-60"
          aria-label="Remove banner"
        >
          {deleting ? <Loader2 size={16} className="animate-spin" /> : <X size={18} strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BannersPage() {
  const [homepageBanners, setHomepageBanners] = useState<Banner[]>([]);
  const [heroBanner, setHeroBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Hero banner upload ─────────────────────────────────────────────────────
  const heroInputRef = useRef<HTMLInputElement>(null);
  const [heroUploading, setHeroUploading] = useState(false);

  const loadBanners = useCallback(async () => {
    try {
      const all = await adminBannerService.list();
      setHomepageBanners(all.filter((b) => b.type === 'homepage_slot'));
      setHeroBanner(all.find((b) => b.type === 'collection_hero') ?? null);
    } catch (err) {
      console.error('[BannersPage] load failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBanners(); }, [loadBanners]);

  const handleHomepageUploaded = (banner: Banner) => {
    setHomepageBanners((prev) => {
      const next = prev.filter((b) => b.position !== banner.position);
      return [...next, banner].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    });
  };

  const executeDelete = async () => {
    if (!confirmTarget) return;
    setIsDeleting(true);
    try {
      await adminBannerService.destroy(confirmTarget.id);
      if (confirmTarget.type === 'homepage_slot') {
        setHomepageBanners((prev) => prev.filter((b) => b.id !== confirmTarget.id));
      } else {
        setHeroBanner(null);
      }
      setConfirmTarget(null);
    } catch (err) {
      console.error('[BannersPage] delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleHeroUpload = async (file: File) => {
    setHeroUploading(true);
    try {
      const form = new FormData();
      form.append('type', 'collection_hero');
      form.append('image', file);
      if (heroBanner) {
        const updated = await adminBannerService.update(heroBanner.id, form);
        setHeroBanner(updated);
      } else {
        const created = await adminBannerService.store(form);
        setHeroBanner(created);
      }
    } catch (err) {
      console.error('[BannersPage] hero upload failed:', err);
    } finally {
      setHeroUploading(false);
    }
  };

  const handleHeroDeleteRequest = () => {
    if (heroBanner) setConfirmTarget(heroBanner);
  };

  // Helper — get homepage banner by position
  const slotBanner = (pos: number) => homepageBanners.find((b) => b.position === pos);

  const activeCount = homepageBanners.length;

  return (
    <div className="p-5 sm:p-8 max-w-[1240px] mx-auto w-full">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-10 pb-6 border-b border-gray-100">
        <h1 className="text-[22px] sm:text-[28px] lg:text-[32px] font-serif font-bold text-[#111] tracking-tight mb-2">
          Gestion des images promotionnelles
        </h1>
        <p className="text-[15px] text-gray-500 font-medium">
          Organisez l'expérience visuelle de votre vitrine
        </p>
      </div>

      <div className="space-y-8">
        {/* ─── Homepage Slots ──────────────────────────────────────────── */}
        <div className="bg-white rounded-[10px] border border-[#f2e6ea] p-4 sm:p-6 lg:p-5 sm:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[16px] font-bold text-[#da2966]">Emplacements de la page d'accueil</h2>
            <span className="text-[13px] text-gray-400 font-medium">
              {loading ? '\u2026' : `${activeCount} emplacements actifs`}
            </span>
          </div>

          {/* Grid identical to frontend ValentinesSection component */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            {/* Slot 1 — large banner */}
            <div className="relative w-full aspect-square lg:aspect-[1.12/1] overflow-hidden border border-gray-100 bg-gray-50">
              {loading ? (
                <div className="absolute inset-0 bg-gray-100 animate-pulse" />
              ) : slotBanner(1) ? (
                <FilledSlot banner={slotBanner(1)!} onRequestDelete={() => setConfirmTarget(slotBanner(1)!)} deleting={isDeleting && confirmTarget?.id === slotBanner(1)?.id} />
              ) : (
                <UploadArea position={1} onUploaded={handleHomepageUploaded} />
              )}
            </div>

            {/* Slots 2, 3, 4 */}
            <div className="flex flex-col lg:grid lg:grid-rows-[1fr_1fr] gap-4">
              
              {/* Slot 2 (Top Row) */}
              <div className="relative overflow-hidden w-full h-[250px] lg:h-full lg:min-h-0 border border-gray-100 bg-gray-50">
                {loading ? (
                  <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                ) : slotBanner(2) ? (
                  <FilledSlot banner={slotBanner(2)!} onRequestDelete={() => setConfirmTarget(slotBanner(2)!)} deleting={isDeleting && confirmTarget?.id === slotBanner(2)?.id} />
                ) : (
                  <UploadArea position={2} onUploaded={handleHomepageUploaded} />
                )}
              </div>

              {/* Slots 3 & 4 (Bottom Row) */}
              <div className="flex flex-col sm:grid sm:grid-cols-5 gap-4 w-full lg:h-full lg:min-h-0">
                
                {/* Slot 3 */}
                <div className="sm:col-span-3 relative overflow-hidden border border-gray-100 bg-gray-50 h-[160px] sm:h-[200px] lg:h-full w-full">
                  {loading ? (
                    <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                  ) : slotBanner(3) ? (
                    <FilledSlot banner={slotBanner(3)!} onRequestDelete={() => setConfirmTarget(slotBanner(3)!)} deleting={isDeleting && confirmTarget?.id === slotBanner(3)?.id} />
                  ) : (
                    <UploadArea position={3} onUploaded={handleHomepageUploaded} />
                  )}
                </div>

                {/* Slot 4 */}
                <div className="sm:col-span-2 relative overflow-hidden border border-gray-100 bg-gray-50 h-[160px] sm:h-[200px] lg:h-full w-full">
                  {loading ? (
                    <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                  ) : slotBanner(4) ? (
                    <FilledSlot banner={slotBanner(4)!} onRequestDelete={() => setConfirmTarget(slotBanner(4)!)} deleting={isDeleting && confirmTarget?.id === slotBanner(4)?.id} />
                  ) : (
                    <UploadArea position={4} onUploaded={handleHomepageUploaded} />
                  )}
                </div>
                
              </div>
            </div>
          </div>
        </div>

        {/* ─── Collection Hero Banner ───────────────────────────────────── */}
        <div className="bg-white rounded-[10px] border border-[#f2e6ea] p-4 sm:p-6 lg:p-5 sm:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[16px] font-bold text-[#da2966]">Banni\u00e8re h\u00e9ro de la collection</h2>
            {heroBanner && (
              <button
                onClick={handleHeroDeleteRequest}
                className="text-[13px] text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                Supprimer
              </button>
            )}
          </div>

          <div
            className="relative w-full aspect-[2/1] sm:aspect-[3/1] lg:aspect-[4/1] overflow-hidden border border-gray-100 bg-gray-50 group cursor-pointer"
            onClick={() => !heroBanner && heroInputRef.current?.click()}
          >
            <input
              ref={heroInputRef}
              type="file"
              accept="image/jpg,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleHeroUpload(f); }}
            />

            {loading ? (
              <div className="absolute inset-0 bg-gray-100 animate-pulse" />
            ) : heroBanner ? (
              <>
                <Image
                  src={heroBanner.image_path}
                  alt={heroBanner.title ?? 'Hero Banner'}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
                <div className="absolute top-3 left-3 z-20 pointer-events-auto">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleHeroDeleteRequest(); }}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#da2966] border border-[#da2966] shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:bg-[#da2966] hover:text-white transition-colors"
                    aria-label="Remove hero banner"
                  >
                    {heroUploading ? <Loader2 size={16} className="animate-spin" /> : <X size={18} strokeWidth={2.5} />}
                  </button>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 sm:p-6 border-2 border-dashed border-[#da2966] bg-white transition-colors hover:bg-gray-50">
                {heroUploading ? (
                  <Loader2 size={32} className="text-[#da2966] animate-spin mb-2" />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[#da2966] flex items-center justify-center text-white mb-3 shadow-[0_4px_10px_rgba(218,41,102,0.3)] group-hover:scale-110 transition-transform">
                      <UploadCloud size={24} strokeWidth={2} />
                    </div>
                    <p className="text-[13px] sm:text-[14px] font-bold text-[#111] mb-1 leading-snug text-center">Banni\u00e8re h\u00e9ro de la collection</p>
                    <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium text-center">JPG · PNG · 10 Mo max</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Delete Confirmation Modal ──────────────────────────────────── */}
      {confirmTarget && (
        <DeleteConfirmModal
          title="Supprimer cette bannière ?"
          description="Cette action est irréversible. La bannière sera définitivement supprimée."
          onConfirm={executeDelete}
          onCancel={() => { if (!isDeleting) setConfirmTarget(null); }}
          deleting={isDeleting}
        />
      )}
    </div>
  );
}
