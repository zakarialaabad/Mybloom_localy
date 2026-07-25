'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Monitor,
  Play,
  RefreshCw,
  Smartphone,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { adminVideoService, HeroVideo } from '@/services/api';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';

type DeviceType = 'desktop' | 'mobile';

const ACCEPTED_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const MAX_VIDEO_SIZE = 200 * 1024 * 1024;
const ALERT_VISIBLE_MS = 3000;
const ALERT_EXIT_MS = 320;

function getFileName(path: string) {
  return decodeURIComponent(path.split('/').pop() ?? path);
}

function getVideoSrc(video: HeroVideo) {
  return video.stream_url || video.url;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }).response;
    return response?.data?.message || response?.data?.errors?.video?.[0] || fallback;
  }

  return fallback;
}

function UploadArea({
  type,
  onUploaded,
}: {
  type: DeviceType;
  onUploaded: (video: HeroVideo) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateFile = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Format invalide. Utilisez une vidéo MP4, WebM ou OGG.';
    }

    if (file.size > MAX_VIDEO_SIZE) {
      return 'Fichier trop volumineux. La limite est de 200 Mo.';
    }

    return null;
  };

  const handleFile = async (file: File) => {
    const validationError = validateFile(file);
    setError(validationError);
    setSuccess(null);
    setProgress(0);

    if (validationError) return;

    setUploading(true);
    try {
      const form = new FormData();
      form.append('type', type);
      form.append('video', file);

      const video = await adminVideoService.store(form, (event) => {
        if (!event.total) return;
        setProgress(Math.round((event.loaded / event.total) * 100));
      });

      setSuccess(`${getFileName(video.path)} ajouté avec succès.`);
      await onUploaded(video);
    } catch (err) {
      setError(getErrorMessage(err, "Échec de l'upload. Vérifiez le fichier puis réessayez."));
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div
        className={`rounded-[16px] border-2 border-dashed bg-white p-5 sm:p-6 transition-colors ${
          dragActive ? 'border-[#da2966] bg-[#fff7f9]' : 'border-[#f0c8d3] hover:bg-gray-50'
        } ${uploading ? 'pointer-events-none opacity-80' : 'cursor-pointer'}`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          const file = event.dataTransfer.files[0];
          if (file) void handleFile(file);
        }}
        role="button"
        tabIndex={0}
        aria-label={`Upload ${type} hero video`}
        onKeyDown={(event) => {
          if ((event.key === 'Enter' || event.key === ' ') && !uploading) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/ogg,.mp4,.webm,.ogg"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />

        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-4">
          <div className="h-12 w-12 rounded-full bg-[#da2966] text-white flex items-center justify-center shadow-[0_8px_18px_rgba(218,41,102,0.25)] shrink-0">
            {uploading ? <Loader2 size={22} className="animate-spin" /> : <UploadCloud size={22} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold text-[#111]">
              {uploading ? 'Upload en cours...' : `Ajouter une vidéo ${type === 'desktop' ? 'desktop' : 'mobile'}`}
            </p>
            <p className="mt-1 text-[13px] text-gray-500">
              Glissez une vidéo ici ou cliquez pour choisir un fichier. MP4, WebM ou OGG, 200 Mo max.
            </p>
            {uploading && (
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-[#da2966] transition-[width]" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-[10px] border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-[10px] border border-green-100 bg-green-50 px-4 py-3 text-[13px] font-medium text-green-700">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`h-9 w-9 rounded-[8px] border flex items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
        danger
          ? 'border-red-100 text-red-500 hover:bg-red-50'
          : 'border-gray-100 text-gray-500 hover:border-[#f2c8d4] hover:bg-[#fff7f9] hover:text-[#da2966]'
      }`}
    >
      {children}
    </button>
  );
}

function VideoCard({
  video,
  index,
  total,
  busy,
  onToggle,
  onDelete,
  onMoveUp,
  onMoveDown,
  onPreview,
}: {
  video: HeroVideo;
  index: number;
  total: number;
  busy: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onPreview: () => void;
}) {
  const filename = getFileName(video.path);

  return (
    <article className={`rounded-[16px] border bg-white shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden ${video.is_active ? 'border-[#f2e6ea]' : 'border-gray-100'}`}>
      <div className="grid gap-4 p-4 sm:grid-cols-[180px_1fr] sm:p-5">
        <button
          type="button"
          onClick={onPreview}
          className="group relative aspect-video overflow-hidden rounded-[12px] bg-gray-950 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#da2966]/30"
          aria-label={`Preview ${filename}`}
        >
          <video
            src={getVideoSrc(video)}
            poster={video.thumbnail_url ?? undefined}
            className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
            muted
            preload="metadata"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/15">
            <span className="h-11 w-11 rounded-full bg-white/90 text-[#da2966] flex items-center justify-center shadow-sm">
              <Play size={18} fill="currentColor" />
            </span>
          </span>
        </button>

        <div className="min-w-0 flex flex-col justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#fff0f3] px-2.5 py-1 text-[11px] font-extrabold text-[#da2966]">
                Ordre {video.display_order}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${video.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {video.is_active ? 'Visible' : 'Masquée'}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-500">
                {video.type === 'desktop' ? 'Desktop' : 'Mobile'}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${video.is_legacy ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                {video.is_legacy ? 'Legacy' : 'Upload'}
              </span>
            </div>

            <h3 className="mt-3 truncate text-[15px] font-bold text-[#111]">{filename}</h3>
            <p className="mt-1 break-all text-[12px] text-gray-400">{video.path}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <IconButton label="Move up" onClick={onMoveUp} disabled={busy || index === 0}>
              <ArrowUp size={16} />
            </IconButton>
            <IconButton label="Move down" onClick={onMoveDown} disabled={busy || index === total - 1}>
              <ArrowDown size={16} />
            </IconButton>
            <IconButton label="Preview video" onClick={onPreview} disabled={busy}>
              <Play size={15} />
            </IconButton>
            <IconButton label={video.is_active ? 'Deactivate video' : 'Activate video'} onClick={onToggle} disabled={busy}>
              {busy ? <Loader2 size={15} className="animate-spin" /> : video.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
            </IconButton>
            <IconButton label="Delete video" onClick={onDelete} disabled={busy} danger>
              <Trash2 size={16} />
            </IconButton>
          </div>
        </div>
      </div>
    </article>
  );
}

function PreviewModal({ video, onClose }: { video: HeroVideo; onClose: () => void }) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-4xl overflow-hidden rounded-[16px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.25)]" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="truncate text-[14px] font-bold text-[#111]">{getFileName(video.path)}</p>
            <p className="text-[12px] font-medium text-gray-400">{video.type === 'desktop' ? 'Desktop' : 'Mobile'} preview</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
            aria-label="Close preview"
          >
            <X size={16} />
          </button>
        </div>
        <div className="bg-black">
          <video
            src={getVideoSrc(video)}
            poster={video.thumbnail_url ?? undefined}
            className="max-h-[70vh] w-full object-contain"
            controls
            autoPlay
            muted
            playsInline
          />
        </div>
      </div>
    </div>
  );
}

export default function VideosPage() {
  const [videos, setVideos] = useState<HeroVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<DeviceType>('desktop');
  const [pageError, setPageError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [alertLeaving, setAlertLeaving] = useState(false);
  const [mutatingIds, setMutatingIds] = useState<Set<number>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<HeroVideo | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<HeroVideo | null>(null);

  const setBusy = (id: number, busy: boolean) => {
    setMutatingIds((prev) => {
      const next = new Set(prev);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const fetchVideos = useCallback(async (withMainSpinner = false) => {
    if (withMainSpinner) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await adminVideoService.list();
      setVideos(data);
      setPageError(null);
    } catch (err) {
      setPageError(getErrorMessage(err, 'Impossible de charger les vidéos.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchVideos(true);
  }, [fetchVideos]);

  useEffect(() => {
    if (!pageError && !notice) return undefined;

    setAlertLeaving(false);
    const hideTimer = window.setTimeout(() => {
      setAlertLeaving(true);
    }, ALERT_VISIBLE_MS);
    const clearTimer = window.setTimeout(() => {
      setNotice(null);
      setPageError(null);
      setAlertLeaving(false);
    }, ALERT_VISIBLE_MS + ALERT_EXIT_MS);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(clearTimer);
    };
  }, [pageError, notice]);

  const groupedVideos = useMemo(() => {
    const byType = (type: DeviceType) =>
      videos
        .filter((video) => video.type === type)
        .sort((a, b) => a.display_order - b.display_order || a.id - b.id);

    return {
      desktop: byType('desktop'),
      mobile: byType('mobile'),
    };
  }, [videos]);

  const activeVideos = groupedVideos[tab];
  const activeCount = activeVideos.filter((video) => video.is_active).length;

  const replaceTypeVideos = (type: DeviceType, updated: HeroVideo[]) => {
    setVideos((prev) => [
      ...prev.filter((video) => video.type !== type),
      ...updated,
    ]);
  };

  const handleUploaded = useCallback(async () => {
    setNotice('Vidéo ajoutée. La liste et la section Hero ont été synchronisées.');
    await fetchVideos(false);
  }, [fetchVideos]);

  const handleToggle = async (video: HeroVideo) => {
    setBusy(video.id, true);
    setNotice(null);
    try {
      await adminVideoService.update(video.id, { is_active: !video.is_active });
      await fetchVideos(false);
      setNotice(video.is_active ? 'Vidéo masquée dans la section Hero.' : 'Vidéo visible dans la section Hero.');
    } catch (err) {
      setPageError(getErrorMessage(err, 'Impossible de modifier la visibilité.'));
    } finally {
      setBusy(video.id, false);
    }
  };

  const handleMove = async (video: HeroVideo, direction: 'up' | 'down') => {
    const siblings = groupedVideos[video.type];
    const index = siblings.findIndex((item) => item.id === video.id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (index < 0 || swapIndex < 0 || swapIndex >= siblings.length) return;

    const reordered = [...siblings];
    [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];

    setBusy(video.id, true);
    setBusy(reordered[index].id, true);
    setNotice(null);

    try {
      const updated = await adminVideoService.reorder(video.type, reordered.map((item) => item.id));
      replaceTypeVideos(video.type, updated);
      setNotice('Ordre des vidéos synchronisé.');
    } catch (err) {
      setPageError(getErrorMessage(err, "Impossible d'enregistrer le nouvel ordre."));
      await fetchVideos(false);
    } finally {
      setBusy(video.id, false);
      setBusy(reordered[index].id, false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    setNotice(null);
    try {
      await adminVideoService.destroy(deleteTarget.id);
      await fetchVideos(false);
      setNotice('Vidéo supprimée. Les ordres ont été recalculés.');
      setDeleteTarget(null);
    } catch (err) {
      setPageError(getErrorMessage(err, 'Impossible de supprimer cette vidéo.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-5 sm:p-8 max-w-[1240px] mx-auto w-full">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[24px] sm:text-[32px] font-bold text-[#111] tracking-tight">Hero Videos</h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-gray-500">
            Gérez les vidéos affichées dans la section Hero du site. Les listes desktop et mobile gardent un ordre indépendant, recalculé automatiquement après chaque changement.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void fetchVideos(false)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-bold text-gray-600 shadow-sm transition-colors hover:border-[#f2c8d4] hover:text-[#da2966] disabled:opacity-50"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {(pageError || notice) && (
        <div className={`overflow-hidden rounded-[12px] border text-[13px] font-semibold transition-all duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          alertLeaving
            ? 'mb-0 max-h-0 -translate-y-2 border-transparent px-4 py-0 opacity-0'
            : 'mb-5 max-h-24 translate-y-0 px-4 py-3 opacity-100'
        } ${
          pageError ? 'border-red-100 bg-red-50 text-red-600' : 'border-green-100 bg-green-50 text-green-700'
        }`}>
          <div className="flex items-center gap-2">
            {pageError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            {pageError || notice}
          </div>
        </div>
      )}

      <div className="mb-6 flex rounded-[12px] bg-gray-100 p-1">
        {(['desktop', 'mobile'] as const).map((type) => {
          const selected = tab === type;
          const Icon = type === 'desktop' ? Monitor : Smartphone;
          const count = groupedVideos[type].length;

          return (
            <button
              key={type}
              type="button"
              onClick={() => setTab(type)}
              className={`flex-1 rounded-[10px] px-3 py-3 text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
                selected ? 'bg-white text-[#da2966] shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-pressed={selected}
            >
              <Icon size={16} />
              {type === 'desktop' ? 'Desktop' : 'Mobile'}
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${selected ? 'bg-[#fff0f3] text-[#da2966]' : 'bg-white text-gray-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <section className="space-y-5">
          <div className="rounded-[16px] border border-[#f2e6ea] bg-white p-5 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#fff0f3] text-[#da2966] flex items-center justify-center">
                {tab === 'desktop' ? <Monitor size={18} /> : <Smartphone size={18} />}
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-[#111]">Upload {tab === 'desktop' ? 'desktop' : 'mobile'}</h2>
                <p className="text-[12px] text-gray-400">Le prochain ordre est {activeVideos.length + 1}.</p>
              </div>
            </div>
            <UploadArea type={tab} onUploaded={handleUploaded} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[14px] border border-[#f2e6ea] bg-white p-4">
              <p className="text-[12px] font-semibold text-gray-400">Total</p>
              <p className="mt-1 text-[28px] font-bold text-[#111]">{activeVideos.length}</p>
            </div>
            <div className="rounded-[14px] border border-[#f2e6ea] bg-white p-4">
              <p className="text-[12px] font-semibold text-gray-400">Visibles</p>
              <p className="mt-1 text-[28px] font-bold text-[#da2966]">{activeCount}</p>
            </div>
          </div>
        </section>

        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-bold text-[#111]">
              Vidéos {tab === 'desktop' ? 'desktop' : 'mobile'}
            </h2>
            <p className="text-[12px] font-semibold text-gray-400">
              Ordre {activeVideos.length ? `1-${activeVideos.length}` : 'vide'}
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-[16px] border border-[#f2e6ea] bg-white">
              <Loader2 size={28} className="animate-spin text-[#da2966]" />
            </div>
          ) : activeVideos.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[16px] border border-dashed border-[#f0c8d3] bg-white px-6 text-center">
              <UploadCloud size={30} className="text-[#da2966]" />
              <p className="mt-3 text-[15px] font-bold text-[#111]">Aucune vidéo {tab === 'desktop' ? 'desktop' : 'mobile'}</p>
              <p className="mt-1 text-[13px] text-gray-400">Ajoutez une vidéo pour l&apos;afficher dans la section Hero.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeVideos.map((video, index) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  index={index}
                  total={activeVideos.length}
                  busy={mutatingIds.has(video.id)}
                  onToggle={() => void handleToggle(video)}
                  onDelete={() => setDeleteTarget(video)}
                  onMoveUp={() => void handleMove(video, 'up')}
                  onMoveDown={() => void handleMove(video, 'down')}
                  onPreview={() => setPreviewVideo(video)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {previewVideo && <PreviewModal video={previewVideo} onClose={() => setPreviewVideo(null)} />}

      {deleteTarget && (
        <DeleteConfirmModal
          title="Supprimer la vidéo"
          description={`Supprimer "${getFileName(deleteTarget.path)}" ? Cette action est irréversible.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
          confirmLabel="Supprimer"
          cancelLabel="Annuler"
        />
      )}
    </div>
  );
}
