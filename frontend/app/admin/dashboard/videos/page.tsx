'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Monitor, Smartphone, Trash2, UploadCloud, Loader2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { adminVideoService, HeroVideo } from '@/services/api';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';

// ── Upload area ───────────────────────────────────────────────────────────────

function UploadArea({
  type,
  onUploaded,
}: {
  type: 'desktop' | 'mobile';
  onUploaded: (video: HeroVideo) => void;
}) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append('type', type);
      form.append('video', file);
      const video = await adminVideoService.store(form);
      onUploaded(video);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.response?.data?.errors?.video?.[0] ?? 'Échec de l\'upload.';
      setError(msg);
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
    <div className="flex flex-col gap-2">
      <div
        className="border-2 border-dashed border-[#da2966] bg-white rounded-lg flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors min-h-[120px]"
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/ogg,.mp4,.webm,.ogg"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {uploading ? (
          <Loader2 size={28} className="text-[#da2966] animate-spin mb-2" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#da2966] flex items-center justify-center text-white mb-2 shadow-[0_4px_10px_rgba(218,41,102,0.3)]">
            <UploadCloud size={20} strokeWidth={2} />
          </div>
        )}
        <p className="text-[13px] font-bold text-[#111] mb-1">
          {uploading ? 'Téléchargement...' : 'Déposer une vidéo'}
        </p>
        <p className="text-[11px] text-gray-400">MP4 · WebM · OGG · 200 Mo max</p>
      </div>
      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}

// ── Video row ─────────────────────────────────────────────────────────────────

function VideoRow({
  video,
  onToggle,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  video: HeroVideo;
  onToggle: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const filename = video.path.split('/').pop() ?? video.path;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${video.is_active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
      {/* Thumbnail / preview icon */}
      <div className="w-16 h-10 rounded bg-gray-900 flex items-center justify-center shrink-0 overflow-hidden">
        <video
          src={video.url}
          className="w-full h-full object-cover"
          muted
          preload="none"
          poster=""
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-gray-800 truncate">{filename}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${video.is_legacy ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
            {video.is_legacy ? 'Legacy' : 'Backend'}
          </span>
          <span className="text-[10px] text-gray-400">Ordre: {video.display_order}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Monter"
        >
          <ArrowUp size={14} />
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Descendre"
        >
          <ArrowDown size={14} />
        </button>
        <button
          onClick={onToggle}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors"
          title={video.is_active ? 'Masquer' : 'Afficher'}
        >
          {video.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          title="Supprimer"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function VideosPage() {
  const [videos,  setVideos]  = useState<HeroVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<'desktop' | 'mobile'>('desktop');

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<HeroVideo | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    adminVideoService
      .list()
      .then(setVideos)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const byType = (type: 'desktop' | 'mobile') =>
    videos
      .filter((v) => v.type === type)
      .sort((a, b) => a.display_order - b.display_order);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const handleUploaded = useCallback((video: HeroVideo) => {
    setVideos((prev) => [...prev, video]);
  }, []);

  const handleToggle = useCallback(async (video: HeroVideo) => {
    try {
      const updated = await adminVideoService.update(video.id, { is_active: !video.is_active });
      setVideos((prev) => prev.map((v) => (v.id === video.id ? updated : v)));
    } catch {}
  }, []);

  const handleMove = useCallback(async (video: HeroVideo, direction: 'up' | 'down') => {
    const siblings = byType(video.type);
    const idx = siblings.findIndex((v) => v.id === video.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) return;

    const sibling = siblings[swapIdx];
    try {
      const [a, b] = await Promise.all([
        adminVideoService.update(video.id,   { display_order: sibling.display_order }),
        adminVideoService.update(sibling.id, { display_order: video.display_order }),
      ]);
      setVideos((prev) =>
        prev.map((v) => (v.id === a.id ? a : v.id === b.id ? b : v)),
      );
    } catch {}
  }, [videos]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminVideoService.destroy(deleteTarget.id);
      setVideos((prev) => prev.filter((v) => v.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {} finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

  // ── Render ─────────────────────────────────────────────────────────────────

  const desktopVideos = byType('desktop');
  const mobileVideos  = byType('mobile');
  const activeTab     = tab === 'desktop' ? desktopVideos : mobileVideos;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vidéos d'arrière-plan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez les vidéos de la section héro de la page d'accueil.
          Les vidéos legacy (orange) sont hébergées sur le frontend ; les nouvelles (vert) sur le backend.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['desktop', 'mobile'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t
                ? 'bg-[#da2966] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t === 'desktop' ? <Monitor size={15} /> : <Smartphone size={15} />}
            {t === 'desktop' ? 'Bureau' : 'Mobile'}
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${tab === t ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {t === 'desktop' ? desktopVideos.length : mobileVideos.length}
            </span>
          </button>
        ))}
      </div>

      {/* Upload */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">
          Ajouter une vidéo {tab === 'desktop' ? 'Bureau' : 'Mobile'}
        </h2>
        <UploadArea type={tab} onUploaded={handleUploaded} />
      </div>

      {/* Video list */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">
          Vidéos {tab === 'desktop' ? 'Bureau' : 'Mobile'} ({activeTab.length})
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={28} className="text-[#da2966] animate-spin" />
          </div>
        ) : activeTab.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Aucune vidéo {tab === 'desktop' ? 'bureau' : 'mobile'} pour l'instant.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {activeTab.map((video, idx) => (
              <VideoRow
                key={video.id}
                video={video}
                isFirst={idx === 0}
                isLast={idx === activeTab.length - 1}
                onToggle={() => handleToggle(video)}
                onDelete={() => setDeleteTarget(video)}
                onMoveUp={() => handleMove(video, 'up')}
                onMoveDown={() => handleMove(video, 'down')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {deleteTarget && (
        <DeleteConfirmModal
          title="Supprimer la vidéo"
          description={`Supprimer "${deleteTarget.path.split('/').pop()}" ? Cette action est irréversible.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
