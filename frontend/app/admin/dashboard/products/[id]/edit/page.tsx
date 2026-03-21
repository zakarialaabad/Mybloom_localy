'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { createPortal } from 'react-dom';
import { adminProductService, adminCategoryService, adminProductTypeService, brandService } from '@/services/api';

// === Icons ===
const ArrowLeft = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="none"><path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const SaveIcon = () => (
  <svg viewBox="0 0 20 20" width="14" height="14" fill="none"><path d="M4 4a2 2 0 012-2h8l4 4v10a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6H6V2M6 20v-6h8v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const EditIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const DetailsIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="#da2966" strokeWidth="1.5"/><path d="M8 9h8M8 13h5" stroke="#da2966" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const CameraIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="14" rx="2" stroke="#da2966" strokeWidth="1.5"/><circle cx="12" cy="13" r="4" stroke="#da2966" strokeWidth="1.5"/><path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2" stroke="#da2966" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const TagIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 15a4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4 4 4 0 014 4z" stroke="#da2966" strokeWidth="1.5"/><path d="M3 15v4a2 2 0 002 2h4M21 9V5a2 2 0 00-2-2h-4" stroke="#da2966" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="15" cy="15" r="1.5" fill="#da2966"/></svg>;
const SettingsIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="#da2966" strokeWidth="1.5"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h.09a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.5.28.82.8 1 1.51h.09a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="#da2966" strokeWidth="1.5"/></svg>;
const LeafIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 22V12M12 12C12 12 7 10 5 6c2 0 5 1 7 6zM12 12c0 0 5-2 7-6-2 0-5 1-7 6z" stroke="#da2966" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const StarIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#da2966" stroke="#da2966" strokeWidth="1.5" strokeLinejoin="round"/></svg>;
const ChatIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="#da2966" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const CloudUploadIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M7 16V12M7 12L5 14M7 12L9 14" stroke="#da2966" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 16.2C21.2 15.6 22 14.4 22 13c0-2-1.5-3.5-3.5-3.5h-.4C17.3 6.9 14.8 5 12 5c-3.3 0-6 2.7-6 6 0 .2 0 .4.1.6C4.4 11.9 3 13.3 3 15c0 1.6 1.3 3 3 3h13c1.7 0 3-1.3 3-3z" fill="#da2966" stroke="#da2966" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ChevronDown = () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ChevronUp = () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 7.5L6 4l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;

const FaceIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const HairIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2c-4 0-7 2-7 6 0 7 7 14 7 14s7-7 7-14c0-4-3-6-7-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const BodyIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M8 10h8M6 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.5"/></svg>;
const HomeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const WomenIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="10" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M12 16v6M9 19h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const MenIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="10" cy="14" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M14.24 9.76L20 4M20 4h-5M20 4v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;

const TYPE_ICON_MAP: Record<string, JSX.Element> = {
  Face: <FaceIcon />,
  Hair: <HairIcon />,
  Body: <BodyIcon />,
  Home: <HomeIcon />,
};

const Card = ({ title, icon, action, children, className = '' }: any) => (
  <div className={`bg-white rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 p-8 flex flex-col h-full ${className}`}>
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
         {icon}
         <h2 className="text-[18px] font-bold text-[#da2966]">{title}</h2>
      </div>
      {action && <div>{action}</div>}
    </div>
    <div className="flex-1">
      {children}
    </div>
  </div>
);

const ToggleRow = ({ label, active, border, onClick }: { label: string, active: boolean, border?: boolean, onClick?: () => void }) => (
  <div onClick={onClick} className={`flex items-center justify-between px-6 py-4 w-full h-[60px] ${border ? 'bg-white border border-dashed border-gray-200' : 'bg-[#f8f8f8]'} rounded-full cursor-pointer`}>
    <span className="text-[14px] font-bold text-[#333]">{label}</span>
    <div className="flex items-center gap-3">
      {active && <span className="text-[12px] font-bold text-[#da2966]">Active</span>}
      <div className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors ${active ? 'bg-[#da2966]' : 'bg-gray-200'}`}>
        <div className={`w-4 h-4 bg-white rounded-full transition-transform transform shadow-sm ${active ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </div>
  </div>
);

// ─── Image entry types ────────────────────────────────────────────────────────
type ImageEntry =
  | { type: 'existing'; id: number; url: string }
  | { type: 'new'; file: File; preview: string };

// ─── Review entry types ───────────────────────────────────────────────────────
interface ReviewEntry {
  id?: number;
  reviewer_name: string;
  rating: number;
  comment: string;
  date: string;
  photoUrl: string;
  photoFile?: File;
}

// ─── FAQ entry types ──────────────────────────────────────────────────────────
interface FaqEntry {
  id?: number;
  question: string;
  answer: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);

  // --- Product Data State ---
  const [formData, setFormData] = useState({
    category_id: '',
    brand_id: '',
    name: '',
    short_description: '',
    full_description: ''
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [productType, setProductType] = useState('Body');
  const [gender, setGender] = useState('Women');

  // --- Status Settings ---
  const [activeStatus, setActiveStatus] = useState<string>('none');

  // --- Ingredients State ---
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [editingIngredientSlot, setEditingIngredientSlot] = useState<number | null>(null);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientFile, setNewIngredientFile] = useState<File | null>(null);
  const ingredientFileInputRef = useRef<HTMLInputElement>(null);

  const openIngredientModal = (slot: number) => {
    setEditingIngredientSlot(slot);
    setNewIngredientName(ingredients[slot]?.name ?? '');
    setNewIngredientFile(null);
    setIsIngredientModalOpen(true);
  };

  // --- Reviews State ---
  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [deletedReviewIds, setDeletedReviewIds] = useState<number[]>([]);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [newReview, setNewReview] = useState({ reviewer_name: '', rating: 0, comment: '', date: '' });
  const [newReviewPhotoFile, setNewReviewPhotoFile] = useState<File | null>(null);
  const [newReviewPhotoUrl, setNewReviewPhotoUrl] = useState<string>('');
  const reviewPhotoInputRef = useRef<HTMLInputElement>(null);
  const [reviewPage, setReviewPage] = useState(0);

  // --- FAQs State ---
  const [faqs, setFaqs] = useState<FaqEntry[]>([]);
  const [newFaq, setNewFaq] = useState<FaqEntry>({ question: '', answer: '' });
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Image State ---
  const [imageEntries, setImageEntries] = useState<ImageEntry[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);

  // --- Variant State ---
  type Variant = { size: string; unit: string; price: string; promotion: string; stock: string };
  const emptyVariant = (): Variant => ({ size: '', unit: 'ml', price: '', promotion: '0', stock: '' });
  const [variants, setVariants] = useState<Variant[]>([]);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);
  const [draftVariant, setDraftVariant] = useState<Variant | null>(null);
  const [entryRowHighlight, setEntryRowHighlight] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (message: string) => {
    setToastMsg(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3200);
  };

  // ── Load select data + product data on mount ──────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cats, brnds, types] = await Promise.all([
          adminCategoryService.list(),
          brandService.list(),
          adminProductTypeService.list(),
        ]);

        setCategories(cats);
        setBrands(brnds);
        setProductTypes(types);

        // Now fetch the product
        const product = await adminProductService.get(productId);

        // Prefill basic fields
        setFormData({
          category_id: String(product.category?.id ?? ''),
          brand_id: String(product.brand?.id ?? ''),
          name: product.name ?? '',
          short_description: product.subtitle ?? '',
          full_description: product.description ?? '',
        });

        // Gender (capitalize)
        const g = product.gender ?? 'women';
        setGender(g.charAt(0).toUpperCase() + g.slice(1));

        // Product type
        if (product.product_type?.name) {
          setProductType(product.product_type.name);
        } else if (types.length > 0) {
          setProductType(types[0].name);
        }

        // Status
        if (product.is_featured) setActiveStatus('best_seller');
        else if (product.is_gift) setActiveStatus('gift');
        else if (product.is_recommended) setActiveStatus('recommended');
        else setActiveStatus('none');

        // Images
        setImageEntries(
          (product.images ?? [])
            .sort((a, b) => a.sort_order - b.sort_order)
            .map(img => ({ type: 'existing', id: img.id, url: img.image_url }))
        );

        // Variants — prefill from product.variants (new system)
        if (product.variants && product.variants.length > 0) {
          setVariants(product.variants.map(v => ({
            size: String(v.size),
            unit: 'ml',
            price: String(v.price),
            promotion: String(v.promotion_percent ?? 0),
            stock: String(v.stock_quantity ?? ''),
          })));
        }

        // Ingredients
        setIngredients(
          (product.ingredients ?? []).map(ing => ({
            name: ing.name,
            thumb: ing.image_url || `https://placehold.co/150x150?text=${encodeURIComponent(ing.name)}`,
            file: undefined,
            existingId: ing.id,
          }))
        );

        // Reviews (existing from DB)
        setReviews(
          (product.all_reviews ?? []).map(r => ({
            id: r.id,
            reviewer_name: r.reviewer_name,
            rating: r.rating,
            comment: r.comment ?? '',
            date: r.date ?? '',
            photoUrl: r.photo_url ?? '',
          }))
        );

        // FAQs
        setFaqs(
          (product.faqs ?? []).map(f => ({
            id: f.id,
            question: f.question,
            answer: f.answer,
          }))
        );

      } catch (err) {
        console.error('Error loading product:', err);
        showToast('Failed to load product data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [productId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── Image handlers ────────────────────────────────────────────────────────
  const allImagePreviews = imageEntries.map(e => e.type === 'existing' ? e.url : e.preview);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const total = imageEntries.length;
      if (total >= 4) {
        showToast('You have reached the maximum of 4 photos.');
        e.target.value = '';
        return;
      }
      const selectedFiles = Array.from(e.target.files);
      const remaining = 4 - total;
      const filesToAdd = selectedFiles.slice(0, remaining);
      if (selectedFiles.length > remaining) {
        showToast(`Only ${remaining} slot${remaining !== 1 ? 's' : ''} remaining — extra photos were skipped.`);
      }
      const newEntries: ImageEntry[] = filesToAdd.map(f => ({
        type: 'new',
        file: f,
        preview: URL.createObjectURL(f),
      }));
      setImageEntries([...imageEntries, ...newEntries]);
      e.target.value = '';
    }
  };

  const removeImageAt = (index: number) => {
    const entry = imageEntries[index];
    if (entry.type === 'existing') {
      setDeletedImageIds([...deletedImageIds, entry.id]);
    } else {
      URL.revokeObjectURL(entry.preview);
    }
    setImageEntries(imageEntries.filter((_, i) => i !== index));
  };

  // ── Variant handlers ──────────────────────────────────────────────────────
  const handleAddVariantClick = () => {
    if (variants.length >= 3) {
      showToast('Maximum 3 size variants allowed.');
      return;
    }
    if (draftVariant !== null) {
      showToast('Please validate the open row before adding another.');
      setEntryRowHighlight(true);
      setTimeout(() => setEntryRowHighlight(false), 2000);
      return;
    }
    setDraftVariant(emptyVariant());
    setEditingVariantIndex(null);
  };

  const handleValidateDraft = () => {
    if (!draftVariant || !draftVariant.size || !draftVariant.price) {
      showToast('Please fill in at least Size and Price.');
      return;
    }
    setVariants([...variants, draftVariant]);
    setDraftVariant(null);
  };

  const handleEditVariant = (index: number) => {
    setEditingVariantIndex(index);
  };

  const handleSaveEditVariant = (index: number) => {
    setEditingVariantIndex(null);
  };

  const handleDeleteVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
    if (editingVariantIndex === index) setEditingVariantIndex(null);
  };

  // ── Ingredient handlers ───────────────────────────────────────────────────
  const handleAddIngredient = () => {
    if (!newIngredientName || editingIngredientSlot === null) return;
    const updated = [...ingredients];
    // Ensure the sparse array covers the target slot
    while (updated.length <= editingIngredientSlot) updated.push(null);
    const prevThumb = updated[editingIngredientSlot]?.thumb;
    updated[editingIngredientSlot] = {
      name: newIngredientName,
      thumb: newIngredientFile
        ? URL.createObjectURL(newIngredientFile)
        : prevThumb || `https://placehold.co/150x150?text=${encodeURIComponent(newIngredientName)}`,
      file: newIngredientFile ?? updated[editingIngredientSlot]?.file ?? undefined,
    };
    setIngredients(updated);
    setIsIngredientModalOpen(false);
    setEditingIngredientSlot(null);
    setNewIngredientName('');
    setNewIngredientFile(null);
  };

  // ── Review handlers ───────────────────────────────────────────────────────
  const handleAddReview = () => {
    if (!newReview.reviewer_name) {
      showToast("Please enter the reviewer's full name.");
      return;
    }
    const photoUrl = newReviewPhotoFile ? URL.createObjectURL(newReviewPhotoFile) : '';
    setReviews([...reviews, {
      reviewer_name: newReview.reviewer_name,
      rating: newReview.rating,
      comment: newReview.comment,
      date: newReview.date || new Date().toISOString().split('T')[0],
      photoUrl,
      photoFile: newReviewPhotoFile ?? undefined,
    }]);
    setReviewPage(Math.floor((reviews.length + 1) / 4));
    setNewReview({ reviewer_name: '', rating: 0, comment: '', date: '' });
    setNewReviewPhotoFile(null);
    setNewReviewPhotoUrl('');
    setIsReviewFormOpen(false);
  };

  const handleDeleteReview = (idx: number) => {
    const rev = reviews[idx];
    if (rev.id) setDeletedReviewIds([...deletedReviewIds, rev.id]);
    const updated = reviews.filter((_, i) => i !== idx);
    setReviews(updated);
    const maxPage = Math.floor(updated.length / 4);
    if (reviewPage > maxPage) setReviewPage(maxPage);
  };

  // ── FAQ handlers ──────────────────────────────────────────────────────────
  const handleAddFaq = () => {
    if (!newFaq.question && !newFaq.answer) {
      showToast('Please fill in both the question and answer fields.');
      return;
    }
    if (!newFaq.question) { showToast('Please fill in the question field.'); return; }
    if (!newFaq.answer) { showToast('Please fill in the answer field.'); return; }

    if (editingFaqIndex !== null) {
      const updated = [...faqs];
      if (updated[editingFaqIndex]) {
        updated[editingFaqIndex] = { ...updated[editingFaqIndex], ...newFaq };
        setFaqs(updated);
      }
      setEditingFaqIndex(null);
    } else {
      setFaqs([...faqs, { question: newFaq.question, answer: newFaq.answer }]);
    }
    setNewFaq({ question: '', answer: '' });
  };

  const handleEditFaq = (index: number) => {
    setNewFaq(faqs[index]);
    setEditingFaqIndex(index);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('_method', 'PUT');
      data.append('name', formData.name);
      data.append('subtitle', formData.short_description);
      data.append('description', formData.full_description);
      data.append('category_id', formData.category_id);
      data.append('brand_id', formData.brand_id);
      data.append('gender', gender.toLowerCase());
      data.append('is_featured', activeStatus === 'best_seller' ? '1' : '0');
      data.append('is_gift', activeStatus === 'gift' ? '1' : '0');
      data.append('is_recommended', activeStatus === 'recommended' ? '1' : '0');

      const selectedType = productTypes.find((t: any) => t.name === productType);
      if (selectedType) data.append('product_type_id', String(selectedType.id));

      const validVariants = variants.filter(v => v.size && v.price);
      data.append('variants', JSON.stringify(validVariants));
      if (validVariants.length > 0) {
        // Mirror backend rule: 1 variant → index 0; 2 variants → largest (index 1); 3 variants → middle (index 1)
        const sorted = [...validVariants].sort((a, b) => Number(a.size) - Number(b.size));
        const defaultV = sorted.length === 1 ? sorted[0] : sorted[1];
        data.append('price', defaultV.price);
        data.append('stock', defaultV.stock);
      }

      data.append('faqs', JSON.stringify(faqs));

      // Only send new reviews (without id)
      const newReviews = reviews.filter(r => !r.id);
      const sanitizedNewReviews = newReviews.map(r => ({
        reviewer_name: r.reviewer_name,
        rating: r.rating,
        comment: r.comment,
        date: r.date,
      }));
      data.append('reviews_array', JSON.stringify(sanitizedNewReviews));
      // Send review photo files for new reviews
      newReviews.forEach((review, i) => {
        if (review.photoFile) {
          data.append(`review_photos_${i}`, review.photoFile);
        }
      });
      data.append('deleted_review_ids', JSON.stringify(deletedReviewIds));

      // Ingredients
      const processedIngredients = ingredients.map(ing => ({ name: ing.name }));
      data.append('manual_ingredients', JSON.stringify(processedIngredients));
      ingredients.forEach((ing, i) => {
        if (ing.file) data.append(`ingredient_images_${i}`, ing.file);
      });

      // Images
      data.append('deleted_image_ids', JSON.stringify(deletedImageIds));
      let newImgIndex = 0;
      imageEntries.forEach(entry => {
        if (entry.type === 'new') {
          data.append(`images[${newImgIndex}]`, entry.file);
          newImgIndex++;
        }
      });

      const tokenMatch = document.cookie.match(/(?:^|;\s*)admin_token=([^;]+)/);
      const adminToken = tokenMatch ? decodeURIComponent(tokenMatch[1]) : '';
      const apiBase = process.env.NEXT_PUBLIC_API_URL;

      const res = await fetch(`${apiBase}/v1/admin/products/${productId}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: data,
      });

      const jsonData = await res.json();
      if (!res.ok) {
        console.error('Validation Errors:', jsonData);
        showToast('Failed to save product. ' + (jsonData.message || 'Please check the fields.'));
        return;
      }
      showToast('Product updated successfully!');
      setTimeout(() => router.push('/admin/dashboard/products'), 1200);
    } catch (err) {
      console.error('Network Error:', err);
      showToast('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Review pagination ─────────────────────────────────────────────────────
  const reviewAddButtonPage = Math.floor(reviews.length / 4);
  const reviewTotalPages = reviewAddButtonPage + 1;
  const currentPageReviews = reviews.slice(reviewPage * 4, (reviewPage + 1) * 4);
  const showAddOnCurrentPage = reviewPage === reviewAddButtonPage;

  // ── Render ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#da2966] border-t-transparent rounded-full animate-spin" />
          <p className="text-[14px] text-gray-400 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-8 space-y-6 min-h-screen bg-[#fcfcfc] max-w-7xl mx-auto">
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes rowPulse {
          0%   { box-shadow: 0 0 0 3px rgba(218,41,102,0.7); }
          55%  { box-shadow: 0 0 0 6px rgba(218,41,102,0.25); }
          100% { box-shadow: 0 0 0 0   rgba(218,41,102,0); }
        }
      `}</style>

      {toastVisible && (
        <div
          style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 200, animation: 'toastIn 0.3s ease-out' }}
          className="flex items-center gap-3 bg-white border border-[#da2966] text-[#da2966] px-5 py-3.5 rounded-2xl shadow-[0_8px_32px_rgba(218,41,102,0.2)] text-[14px] font-bold whitespace-nowrap pointer-events-none"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          {toastMsg}
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-start justify-between pb-4">
        <div>
          <Link href="/admin/dashboard/products" className="inline-flex items-center gap-2 text-[#da2966] text-[14px] font-semibold hover:underline mb-3">
            <ArrowLeft /> Back to Products
          </Link>
          <h1 className="text-[32px] font-bold text-[#333] leading-tight font-serif tracking-tight">Edit Product</h1>
          <p className="text-[15px] text-gray-400 mt-1">Update the details for this listing</p>
        </div>
        <div className="flex items-center gap-4 mt-8">
          <Link href="/admin/dashboard/products" className="px-6 py-3 rounded-xl border border-gray-200 bg-white text-[14px] font-semibold text-[#333] hover:bg-gray-50 shadow-sm transition-colors">
            Discard
          </Link>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-xl bg-[#da2966] text-white text-[14px] font-semibold flex items-center gap-2 shadow-[0_4px_12px_rgba(218,41,102,0.25)] transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#c22158]'}`}
          >
            <SaveIcon /> {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* SEC 1: Details & Media */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-6">
        <Card title="Product Details" icon={<DetailsIcon />}>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[#333]">Category</label>
              <div className="relative">
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full h-12 px-4 rounded-xl bg-[#f8f8f8] border-none text-[14px] font-medium text-[#333] focus:outline-none focus:ring-1 focus:ring-[#da2966]/40 appearance-none"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><ChevronDown /></div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[#333]">Brand <span className="font-normal text-gray-400 text-[11px]">(Optional)</span></label>
              <div className="relative">
                <select
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleInputChange}
                  className="w-full h-12 px-4 rounded-xl bg-[#f8f8f8] border-none text-[14px] font-medium text-[#333] focus:outline-none focus:ring-1 focus:ring-[#da2966]/40 appearance-none"
                >
                  <option value="">Select Brand</option>
                  {brands.map((brand: any) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><ChevronDown /></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <label className="text-[13px] font-bold text-[#333]">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g Rose Damascena Elixir"
              className="w-full h-12 px-4 rounded-xl bg-[#f8f8f8] border-none text-[14px] font-medium text-[#333] placeholder:text-[#ccc] focus:outline-none focus:ring-1 focus:ring-[#da2966]/40"
            />
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <label className="text-[13px] font-bold text-[#333]">Gender</label>
            <div className="flex items-center gap-3">
              {[{ name: 'Women', icon: <WomenIcon /> }, { name: 'Men', icon: <MenIcon /> }].map(g => (
                <button
                  key={g.name}
                  onClick={() => setGender(g.name)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors ${gender === g.name ? 'bg-[#fff0f3] text-[#da2966]' : 'border border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
                >
                  <span className={gender === g.name ? 'text-[#da2966]' : 'text-gray-400'}>{g.icon}</span> {g.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <label className="text-[13px] font-bold text-[#333]">Product Type</label>
            <div className="flex items-center gap-3">
              {productTypes.map(t => (
                <button
                  key={t.id}
                  onClick={() => setProductType(t.name)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors ${productType === t.name ? 'bg-[#fff0f3] text-[#da2966]' : 'border border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
                >
                  <span className={productType === t.name ? 'text-[#da2966]' : 'text-gray-400'}>{TYPE_ICON_MAP[t.name] ?? <BodyIcon />}</span> {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <label className="text-[13px] font-bold text-[#333]">Short Description</label>
            <input
              type="text"
              name="short_description"
              value={formData.short_description}
              onChange={handleInputChange}
              placeholder="One sentence summary ..."
              className="w-full h-12 px-4 rounded-xl bg-[#f8f8f8] border-none text-[14px] font-medium text-[#333] placeholder:text-[#ccc] focus:outline-none focus:ring-1 focus:ring-[#da2966]/40"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#333]">Full Description</label>
            <textarea
              name="full_description"
              value={formData.full_description}
              onChange={handleInputChange}
              placeholder="Describe the fragrance notes, key ingredients, and benefits..."
              className="w-full h-32 px-4 py-3 rounded-xl bg-[#f8f8f8] border-none text-[14px] font-medium text-[#333] placeholder:text-[#ccc] focus:outline-none focus:ring-1 focus:ring-[#da2966]/40 resize-none resize-y"
            />
            <div className="flex justify-end pr-1"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M9 1L1 9" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/><path d="M5 9H9V5" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
          </div>
        </Card>

        <Card title="Product Media" icon={<CameraIcon />}>
          <div className="flex gap-4 mb-6">
            <div className="w-[84px] flex flex-col gap-3 shrink-0">
              {allImagePreviews.slice(1, 4).map((preview, idx) => (
                <div key={idx} className="w-[84px] h-[84px] rounded-[16px] overflow-hidden relative border border-gray-100 p-1 bg-white shadow-sm">
                  <div className="w-full h-full rounded-[10px] overflow-hidden">
                    <img src={preview} className="w-full h-full object-cover" alt="" />
                  </div>
                  <button onClick={() => removeImageAt(idx + 1)} className="absolute top-1 right-1 w-5 h-5 bg-white text-[#da2966] rounded-full flex items-center justify-center shadow-sm">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 2.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </div>
              ))}
              {imageEntries.length < 4 && (
                <button onClick={() => fileInputRef.current?.click()} className="w-[84px] h-[84px] rounded-[16px] border-2 border-dashed border-[#da2966] bg-white flex flex-col items-center justify-center gap-1 hover:bg-[#fff0f3] transition-colors">
                  <span className="text-[#da2966] font-bold text-[16px] leading-none">+</span>
                  <span className="text-[#da2966] text-[10px] font-bold">ADD</span>
                </button>
              )}
            </div>

            <div className="flex-1 bg-gray-50 rounded-[20px] relative overflow-hidden flex flex-col items-center justify-center border border-gray-100">
              {allImagePreviews.length > 0 ? (
                <>
                  <img src={allImagePreviews[0]} className="w-full h-full object-cover" alt="Cover" />
                  <button onClick={() => removeImageAt(0)} className="absolute top-4 left-4 w-8 h-8 bg-white text-red-500 rounded-full flex items-center justify-center shadow-md">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6m0-6l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                  <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#da2966] text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm tracking-wider uppercase">Cover Photo</span>
                </>
              ) : (
                <span className="text-gray-400 text-sm font-medium">No Cover Photo</span>
              )}
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
            multiple
            accept="image/jpeg, image/png"
          />
          <div onClick={() => fileInputRef.current?.click()} className="w-full h-[120px] rounded-2xl border-2 border-dashed border-[#da2966] bg-[#fcfcfc] flex flex-col items-center justify-center hover:bg-[#fff0f3] transition-colors cursor-pointer">
            <CloudUploadIcon />
            <p className="text-[14px] font-bold text-[#333] mt-2 mb-1">Glissez-déposez des photos ici</p>
            <p className="text-[11px] font-medium text-gray-400">Maximum 4 photos autorisées</p>
            <p className="text-[10px] text-gray-400 mt-1">Format JPG ou PNG - taille maximale : 10 Mo par photo</p>
          </div>
        </Card>
      </div>

      {/* SEC 2: Pricing */}
      <Card
        title="Pricing & Variants"
        icon={<TagIcon />}
        action={<button onClick={handleAddVariantClick} className="text-[#da2966] text-[13px] font-bold hover:underline">+ Add Size Variant</button>}
      >
        <div className="w-full text-left">
          <div className="grid grid-cols-[1fr_1.2fr_1.5fr_1.5fr_1.5fr_1fr_1fr] gap-4 px-6 py-4 text-[13px] font-bold text-[#da2966] capitalize opacity-90 items-center border-b border-gray-50 mb-3">
            <div>Size</div>
            <div>Unit</div>
            <div>Base Price (DH)</div>
            <div>Promotion (%)</div>
            <div>Final Price</div>
            <div>Stock</div>
            <div>Actions</div>
          </div>

          {/* Saved variants rows */}
          {variants.map((v, index) => (
            <div key={index} className="grid grid-cols-[1fr_1.2fr_1.5fr_1.5fr_1.5fr_1fr_1fr] gap-4 px-6 py-4 items-center rounded-[20px] bg-[#f8f8f8] mb-2">
              <input type="text" value={v.size}
                readOnly={editingVariantIndex !== index}
                onChange={e => { const u = [...variants]; u[index] = { ...u[index], size: e.target.value }; setVariants(u); }}
                className={`w-full h-12 text-center rounded-xl text-[14px] font-bold text-[#333] focus:outline-none ${editingVariantIndex === index ? 'bg-white border border-yellow-100/50 shadow-sm' : 'bg-transparent border-none'}`} />
              <div className="relative">
                <select value={v.unit} disabled={editingVariantIndex !== index}
                  onChange={e => { const u = [...variants]; u[index] = { ...u[index], unit: e.target.value }; setVariants(u); }}
                  className={`w-full appearance-none h-12 px-6 rounded-xl text-[14px] font-bold text-[#333] focus:outline-none pb-1 ${editingVariantIndex === index ? 'bg-white border border-yellow-100/50 shadow-sm' : 'bg-transparent border-none'}`}>
                  <option value="ml">ml</option>
                  <option value="g">g</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><ChevronUp /></div>
              </div>
              <div className={`flex rounded-xl h-12 items-center overflow-hidden ${editingVariantIndex === index ? 'bg-white shadow-sm border border-yellow-100/50' : 'bg-transparent'}`}>
                <input type="text" value={v.price}
                  readOnly={editingVariantIndex !== index}
                  onChange={e => { const u = [...variants]; u[index] = { ...u[index], price: e.target.value }; setVariants(u); }}
                  placeholder="120" className="w-full text-center bg-transparent text-[14px] font-bold text-[#333] focus:outline-none" />
                <div className="h-6 w-px bg-gray-200" /><span className="text-[13px] font-bold text-[#da2966] px-4">DH</span>
              </div>
              <div className={`flex rounded-xl h-12 items-center overflow-hidden ${editingVariantIndex === index ? 'bg-white shadow-sm border border-yellow-100/50' : 'bg-transparent'}`}>
                <input type="text" value={v.promotion}
                  readOnly={editingVariantIndex !== index}
                  onChange={e => { const u = [...variants]; u[index] = { ...u[index], promotion: e.target.value }; setVariants(u); }}
                  placeholder="0" className="w-full text-center bg-transparent text-[14px] font-bold text-[#333] focus:outline-none" />
                <div className="h-6 w-px bg-gray-200" /><span className="text-[14px] font-bold text-[#da2966] px-4">%</span>
              </div>
              <div className="flex items-center justify-center bg-[#fce8ef] text-[#da2966] h-12 rounded-xl text-[14px] font-extrabold">
                {(Number(v.price || 0) * (1 - Number(v.promotion || 0) / 100)).toFixed(2)} DH
              </div>
              <input type="text" value={v.stock}
                readOnly={editingVariantIndex !== index}
                onChange={e => { const u = [...variants]; u[index] = { ...u[index], stock: e.target.value }; setVariants(u); }}
                className={`w-full text-center h-12 rounded-xl text-[14px] font-bold text-[#333] focus:outline-none ${editingVariantIndex === index ? 'bg-white border border-yellow-100/50 shadow-sm' : 'bg-transparent border-none'}`} />
              <div className="flex items-center gap-2">
                {editingVariantIndex === index
                  ? <button onClick={() => handleSaveEditVariant(index)} className="h-10 px-3 bg-[#0f834d] hover:bg-[#0c6b3e] text-white text-[12px] font-bold rounded-xl flex items-center gap-1"><CheckIcon /> Save</button>
                  : <button onClick={() => handleEditVariant(index)} className="flex items-center justify-center text-gray-500 hover:text-[#da2966] w-9 h-9 rounded-full border border-gray-200 bg-white shadow-sm transition-colors"><EditIcon /></button>
                }
                <button onClick={() => handleDeleteVariant(index)} className="flex items-center justify-center text-gray-500 hover:text-red-500 w-9 h-9 rounded-full border border-gray-200 bg-white shadow-sm transition-colors"><TrashIcon /></button>
              </div>
            </div>
          ))}

          {/* Draft (new) row */}
          {draftVariant !== null && (
            <div
              className={`grid grid-cols-[1fr_1.2fr_1.5fr_1.5fr_1.5fr_1fr_1fr] gap-4 px-6 py-5 items-center rounded-[20px] transition-colors duration-300 ${entryRowHighlight ? 'bg-[#fff0f3]' : 'bg-[#ffffe9]'}`}
              style={entryRowHighlight ? { animation: 'rowPulse 2s ease-out forwards' } : {}}
            >
              <input type="text" value={draftVariant.size} onChange={e => setDraftVariant({ ...draftVariant, size: e.target.value })} placeholder="20" className="w-full h-12 text-center rounded-xl bg-white border border-yellow-100/50 text-[14px] font-bold text-[#333] focus:outline-none shadow-sm" />
              <div className="relative">
                <select value={draftVariant.unit} onChange={e => setDraftVariant({ ...draftVariant, unit: e.target.value })} className="w-full appearance-none h-12 px-6 rounded-xl bg-white border border-yellow-100/50 text-[14px] font-bold text-[#333] focus:outline-none shadow-sm pb-1">
                  <option value="ml">ml</option>
                  <option value="g">g</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><ChevronUp /></div>
              </div>
              <div className="flex bg-white rounded-xl shadow-sm h-12 items-center overflow-hidden border border-yellow-100/50">
                <input type="text" value={draftVariant.price} onChange={e => setDraftVariant({ ...draftVariant, price: e.target.value })} placeholder="120" className="w-full text-center bg-transparent text-[14px] font-bold text-[#333] focus:outline-none" />
                <div className="h-6 w-px bg-gray-200" /><span className="text-[13px] font-bold text-[#da2966] px-4">DH</span>
              </div>
              <div className="flex bg-white rounded-xl shadow-sm h-12 items-center overflow-hidden border border-yellow-100/50">
                <input type="text" value={draftVariant.promotion} onChange={e => setDraftVariant({ ...draftVariant, promotion: e.target.value })} placeholder="0" className="w-full text-center bg-transparent text-[14px] font-bold text-[#333] focus:outline-none" />
                <div className="h-6 w-px bg-gray-200" /><span className="text-[14px] font-bold text-[#da2966] px-4">%</span>
              </div>
              <div className="flex items-center justify-center bg-[#fce8ef] text-[#da2966] h-12 rounded-xl text-[14px] font-extrabold shadow-sm">
                {(Number(draftVariant.price || 0) * (1 - Number(draftVariant.promotion || 0) / 100)).toFixed(2)} DH
              </div>
              <input type="text" value={draftVariant.stock} onChange={e => setDraftVariant({ ...draftVariant, stock: e.target.value })} placeholder="33" className="w-full text-center h-12 rounded-xl bg-white border border-yellow-100/50 text-[14px] font-bold text-[#333] shadow-sm focus:outline-none" />
              <button onClick={handleValidateDraft} className="h-12 w-full max-w-[100px] bg-[#0f834d] hover:bg-[#0c6b3e] text-white text-[13px] font-extrabold rounded-xl flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(15,131,77,0.25)] transition-colors">
                <CheckIcon /> Validate
              </button>
            </div>
          )}

          {variants.length === 0 && draftVariant === null && (
            <div className="py-8 text-center text-[14px] text-gray-400 font-medium">
              No variants yet — click &ldquo;+ Add Size Variant&rdquo; to add one.
            </div>
          )}
        </div>
      </Card>

      {/* SEC 3: Status & Ingredients */}
      <div className="grid grid-cols-[1fr_1.5fr] gap-6">
        <Card title="Status Settings" icon={<SettingsIcon />}>
          <div className="space-y-4">
            <ToggleRow label="Make as Best Seller" active={activeStatus === 'best_seller'} onClick={() => setActiveStatus(activeStatus === 'best_seller' ? 'none' : 'best_seller')} />
            <ToggleRow label="Make as Gift" active={activeStatus === 'gift'} border={true} onClick={() => setActiveStatus(activeStatus === 'gift' ? 'none' : 'gift')} />
            <ToggleRow label="Make as Recommendation" active={activeStatus === 'recommended'} onClick={() => setActiveStatus(activeStatus === 'recommended' ? 'none' : 'recommended')} />
          </div>
        </Card>

        <Card title="Ingredients" icon={<LeafIcon />}>
          <div className="grid grid-cols-3 gap-6 mt-2 w-full">
            {[0, 1, 2].map((slot) => {
              const ing = ingredients[slot];
              return (
                <div key={slot} className="flex flex-col items-center gap-3 group">
                  <div className={`relative w-full aspect-square rounded-full overflow-hidden transition-colors ${ing ? 'border-[2.5px] border-[#da2966]' : 'border-[2.5px] border-dashed border-[#da2966]'}`}>
                    <button
                      onClick={() => openIngredientModal(slot)}
                      className="absolute inset-0 rounded-full bg-white flex flex-col items-center justify-center hover:bg-[#fff0f3] transition-colors"
                    >
                      <span className="text-[#da2966] font-bold text-[24px] leading-none mb-1">+</span>
                      <span className="text-[#da2966] text-[12px] font-bold">ADD</span>
                    </button>
                    {ing && (
                      <>
                        <img src={ing.thumb} alt={ing.name} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity z-10">
                          <button onClick={(e) => { e.stopPropagation(); openIngredientModal(slot); }} className="w-9 h-9 rounded-full bg-white text-gray-700 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:text-[#da2966] transition-colors"><EditIcon /></button>
                          <button onClick={(e) => { e.stopPropagation(); const u = [...ingredients]; u[slot] = null; setIngredients(u); }} className="w-9 h-9 rounded-full bg-white text-gray-700 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:text-red-500 transition-colors"><TrashIcon /></button>
                        </div>
                      </>
                    )}
                  </div>
                  <span className={`text-[13px] font-bold text-center truncate w-full ${ing ? 'text-[#333]' : 'text-transparent select-none'}`}>
                    {ing ? ing.name : '\u00a0'}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* SEC 4: Reviews */}
      <Card
        title="Curated Reviews"
        icon={<StarIcon />}
        action={<button onClick={() => setIsReviewFormOpen(true)} className="text-[#da2966] text-[13px] font-bold hover:underline">+ Add Manual Review</button>}
      >
        <div>
          {/* Reviews row — up to 4 cards per page */}
          <div className="flex items-stretch gap-6 py-6 px-4 flex-wrap">
            {currentPageReviews.map((rev, i) => {
              const idx = reviewPage * 4 + i;
              return (
                <div key={rev.id ?? idx} className="relative group shrink-0 w-[240px] flex flex-col">
                  <div className="border-[2.5px] border-[#da2966] p-4 pb-5 bg-white flex flex-col items-center relative" style={{ borderRadius: '0px 64px 0px 64px' }}>
                    <div className="relative rounded-[20px] overflow-hidden mb-4 w-full aspect-[5/4] bg-[#f3f3f3]">
                      {rev.photoUrl ? (
                        <img src={rev.photoUrl} alt={rev.reviewer_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M8 6V5a2 2 0 012-2h4a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10">
                        <button onClick={() => handleDeleteReview(idx)} className="w-10 h-10 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.1)] flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors"><TrashIcon /></button>
                      </div>
                    </div>
                    <div className="space-y-[4px] text-center w-full flex flex-col items-center">
                      <span className="text-[11px] bg-[#fdfdfd] text-[#444] border border-gray-100 font-medium px-3 py-1.5 rounded-[10px] inline-block shadow-sm">
                        {rev.comment}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 text-center px-2">
                    <p className="text-[13px] font-bold text-[#333]">{rev.reviewer_name}</p>
                    <div className="text-[#facc15] text-[13px] space-x-[2px] mt-1 tracking-widest flex justify-center">
                      {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">{rev.date}</p>
                  </div>
                </div>
              );
            })}

            {showAddOnCurrentPage && (
              <div
                onClick={() => setIsReviewFormOpen(true)}
                className="w-[180px] h-[180px] self-center rounded-full border-[2.5px] border-dashed border-[#da2966] bg-white flex flex-col items-center justify-center gap-2 hover:bg-[#fff0f3] transition-colors shrink-0 cursor-pointer"
              >
                <span className="text-[#da2966] font-bold text-[28px] leading-none mb-1">+</span>
                <span className="text-[#da2966] text-[14px] font-bold">ADD</span>
              </div>
            )}
          </div>

          {/* Pagination — only visible when there are multiple pages */}
          {reviewTotalPages > 1 && (
            <div className="flex items-center justify-between px-4 pb-4 pt-2 border-t border-gray-50 mt-2">
              <button
                onClick={() => setReviewPage(p => Math.max(0, p - 1))}
                disabled={reviewPage === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-colors ${
                  reviewPage === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-[#da2966] hover:bg-[#fff0f3]'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: reviewTotalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setReviewPage(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === reviewPage ? 'bg-[#da2966]' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setReviewPage(p => Math.min(reviewTotalPages - 1, p + 1))}
                disabled={reviewPage === reviewTotalPages - 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-colors ${
                  reviewPage === reviewTotalPages - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-[#da2966] hover:bg-[#fff0f3]'
                }`}
              >
                Next
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* SEC 5: FAQ */}
      <Card title="Product FAQ" icon={<ChatIcon />}>
        <div className="grid grid-cols-2 gap-10">
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-[#ffffe9] rounded-[20px] border border-yellow-100 px-6 py-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[14px] text-[#333]">{faq.question}</h4>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleEditFaq(idx)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow text-gray-500 hover:text-[#da2966]"><EditIcon /></button>
                    <button onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))} className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow text-gray-500 hover:text-red-500"><TrashIcon /></button>
                  </div>
                </div>
                <p className="text-[13px] font-bold text-[#555] mt-4 leading-relaxed pr-8">{faq.answer}</p>
              </div>
            ))}
            {faqs.length === 0 && <p className="text-[13px] text-gray-400 font-medium">No FAQs added yet.</p>}
          </div>

          <div className="flex flex-col h-full">
            <div className="flex flex-col gap-2 mb-6">
              <label className="text-[13px] font-bold text-[#333]">Question</label>
              <input
                type="text"
                value={newFaq.question}
                onChange={e => setNewFaq({ ...newFaq, question: e.target.value })}
                placeholder="e.g. Is this suitable for sensitive skin?"
                className="w-full h-12 px-5 rounded-xl bg-[#f8f8f8] border-none text-[14px] font-medium text-[#333] placeholder:text-[#ccc] focus:outline-none focus:ring-1 focus:ring-[#da2966]/40"
              />
            </div>
            <div className="flex flex-col gap-2 flex-1 relative mb-6">
              <label className="text-[13px] font-bold text-[#333]">Answer</label>
              <textarea
                value={newFaq.answer}
                onChange={e => setNewFaq({ ...newFaq, answer: e.target.value })}
                placeholder="Provide a detailed and helpful answer..."
                className="w-full flex-1 min-h-[140px] px-5 py-4 rounded-xl bg-[#f8f8f8] border-none text-[14px] font-medium text-[#333] placeholder:text-[#ccc] focus:outline-none focus:ring-1 focus:ring-[#da2966]/40 resize-none"
              />
              <div className="absolute right-3 bottom-3 text-gray-400"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M5 9H9V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
            </div>
            <div className="flex justify-end">
              <button onClick={handleAddFaq} className="px-8 py-3.5 rounded-xl bg-[#da2966] text-white text-[14px] font-bold hover:bg-[#c22158] transition-colors shadow-[0_4px_12px_rgba(218,41,102,0.25)]">
                {editingFaqIndex !== null ? 'Update FAQ' : '+ Add FAQ'}
              </button>
            </div>
          </div>
        </div>
      </Card>

      <div className="pb-10" />

      {/* ── MODALS ── */}

      {/* 1. Add / Edit Ingredient Modal */}
      {isIngredientModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
            <button
              onClick={() => { setIsIngredientModalOpen(false); setEditingIngredientSlot(null); setNewIngredientName(''); setNewIngredientFile(null); }}
              className="absolute top-6 right-6 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >✕</button>
            <h3 className="text-[24px] font-bold text-[#da2966] mb-8 flex items-center justify-center gap-2">
              <LeafIcon /> Ingredients
            </h3>
            <div className="mb-8">
              <label className="text-[14px] font-bold text-[#333] block mb-4">Ingredient Image</label>
              <input type="file" ref={ingredientFileInputRef} onChange={(e) => setNewIngredientFile(e.target.files?.[0] || null)} accept="image/*" className="hidden" />
              <div onClick={() => ingredientFileInputRef.current?.click()} className="w-full py-12 border-2 border-dashed border-[#da2966] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#fff0f3] transition-colors gap-3">
                {newIngredientFile ? (
                  <><CloudUploadIcon /><span className="text-[13px] text-[#333] font-bold">{newIngredientFile.name}</span></>
                ) : (
                  <><CloudUploadIcon /><p className="text-[14px] text-[#333] font-medium">Drag & drop or click to upload</p></>
                )}
              </div>
            </div>
            <div className="mb-8">
              <label className="text-[14px] font-bold text-[#333] block mb-3">Ingredient Name</label>
              <input type="text" value={newIngredientName} onChange={e => setNewIngredientName(e.target.value)} placeholder="e.g Hyaluronic Acid" className="w-full h-12 px-4 rounded-xl bg-[#f8f8f8] border-none text-[14px] font-medium text-[#333] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#da2966]/40" />
            </div>
            <button onClick={handleAddIngredient} className="w-full h-12 rounded-xl bg-[#da2966] text-white font-bold text-[14px] hover:bg-[#c22158] transition-colors flex items-center justify-center gap-2">
              + {editingIngredientSlot !== null && ingredients[editingIngredientSlot] ? 'Update Ingredient' : 'Add Ingredient'}
            </button>
          </div>
        </div>
      , document.body)}

      {/* 2. Add Review Modal */}
      {isReviewFormOpen && createPortal(
        <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
            <button
              onClick={() => { setIsReviewFormOpen(false); setNewReviewPhotoFile(null); setNewReviewPhotoUrl(''); setNewReview({ reviewer_name: '', rating: 0, comment: '', date: '' }); }}
              className="absolute top-6 right-6 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >✕</button>
            <h3 className="text-[24px] font-bold text-[#da2966] mb-8 flex items-center justify-center gap-2">
              <StarIcon /> Curated Reviews
            </h3>
            <div className="mb-6">
              <label className="text-[14px] font-bold text-[#333] block mb-3">Customer Photo</label>
              <input type="file" ref={reviewPhotoInputRef} accept="image/*" onChange={(e) => { const file = e.target.files?.[0] || null; setNewReviewPhotoFile(file); setNewReviewPhotoUrl(file ? URL.createObjectURL(file) : ''); }} className="hidden" />
              <div onClick={() => reviewPhotoInputRef.current?.click()} className="w-full py-10 border-2 border-dashed border-[#da2966] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#fff0f3] transition-colors gap-3">
                {newReviewPhotoUrl ? (
                  <img src={newReviewPhotoUrl} alt="preview" className="h-20 w-20 object-cover rounded-xl" />
                ) : (
                  <><CloudUploadIcon /><p className="text-[14px] text-[#333] font-medium">Drag & drop or click to upload</p></>
                )}
              </div>
            </div>
            <div className="mb-6">
              <label className="text-[14px] font-bold text-[#333] block mb-3">Full Name</label>
              <input type="text" value={newReview.reviewer_name} onChange={e => setNewReview({ ...newReview, reviewer_name: e.target.value })} placeholder="e.g Ayoub laghzal" className="w-full h-12 px-4 rounded-xl bg-[#f8f8f8] border-none text-[14px] font-medium text-[#333] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#da2966]/40" />
            </div>
            <div className="mb-8">
              <p className="text-[11px] font-extrabold text-[#888] uppercase tracking-[0.18em] text-center mb-4">Rate the experience</p>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setNewReview({ ...newReview, rating: star })} className="text-[32px] leading-none transition-colors" style={{ color: star <= newReview.rating ? '#facc15' : '#d1d5db' }}>★</button>
                ))}
              </div>
            </div>
            <button onClick={handleAddReview} className="w-full h-12 rounded-xl bg-[#da2966] text-white font-bold text-[14px] hover:bg-[#c22158] transition-colors flex items-center justify-center gap-2">
              + Add Review
            </button>
          </div>
        </div>
      , document.body)}

    </div>
  );
}
