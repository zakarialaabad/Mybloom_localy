'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReviewFormModal, { ReviewFormSaveData } from '@/components/admin/ReviewFormModal';
import { AdminSelect } from '@/components/admin/AdminSelect';
import IngredientSelectModal from '@/components/admin/IngredientSelectModal';
import CreateIngredientModal from '@/components/admin/CreateIngredientModal';
import ProductTypeSelector from '@/components/admin/ProductTypeSelector';

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
const ChevronRight = () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4.5 9.5l3.5-3.5-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;

const FaceIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const HairIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2c-4 0-7 2-7 6 0 7 7 14 7 14s7-7 7-14c0-4-3-6-7-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const BodyIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M8 10h8M6 14h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.5"/></svg>;
const HomeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const WomenIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="10" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M12 16v6M9 19h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const MenIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="10" cy="14" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M14.24 9.76L20 4M20 4h-5M20 4v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;

const TYPE_ICON_MAP: Record<string, JSX.Element> = {
  Visage: <FaceIcon />,
  Cheveux: <HairIcon />,
  Corps: <BodyIcon />,
  'Soins Visage': <FaceIcon />,
};

const Card = ({ title, icon, action, children, className = '' }: any) => (
  <div className={`bg-white rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 p-8 flex flex-col h-full ${className}`}>
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
         {icon}
         <h2 className="text-[16px] sm:text-[18px] font-bold text-[#da2966]">{title}</h2>
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
      {active && <span className="text-[12px] font-bold text-[#da2966]">Actif</span>}
      <div className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors ${active ? 'bg-[#da2966]' : 'bg-gray-200'}`}>
        <div className={`w-4 h-4 bg-white rounded-full transition-transform transform shadow-sm ${active ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </div>
  </div>
);

const IngredientCircle = ({ thumb, add }: { thumb?: string, add?: boolean }) => {
  if (add) {
    return (
      <div className="flex flex-col items-center gap-4">
        <button className="w-[150px] h-[150px] rounded-full border-[2.5px] border-dashed border-[#da2966] bg-white flex flex-col items-center justify-center gap-1.5 hover:bg-[#fff0f3] transition-colors shrink-0">
          <span className="text-[#da2966] font-bold text-[16px] sm:text-[18px] sm:text-[20px] sm:text-[24px] leading-none mb-1">+</span>
          <span className="text-[#da2966] text-[13px] font-bold">AJOUTER</span>
        </button>
        {/* Invisible spacer to perfectly align the circles with the text row */}
        <span className="text-[14px] font-bold text-transparent select-none whitespace-nowrap" aria-hidden="true">&nbsp;</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-4 group">
      <div className="w-[150px] h-[150px] rounded-full border-[2.5px] border-[#da2966] p-1.5 bg-white relative cursor-pointer shrink-0">
        <div className="w-full h-full rounded-full overflow-hidden relative">
          <img src={thumb} alt="Ingredient" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2.5 transition-opacity z-10">
            <button className="w-10 h-10 rounded-full bg-white text-gray-700 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:text-[#da2966] transition-colors"><EditIcon/></button>
            <button className="w-10 h-10 rounded-full bg-white text-gray-700 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:text-red-500 transition-colors"><TrashIcon/></button>
          </div>
        </div>
      </div>
      <span className="text-[14px] font-bold text-[#333]">Cocoa Butter</span>
    </div>
  );
};


export default function AddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Phase 2: Product Data State ---
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    category_id: '',
    brand_id: '',
    name: '',
    short_description: '',
    full_description: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [productType, setProductType] = useState('Corps');
  const [gender, setGender] = useState('Women');

  // --- Phase 5: Status Settings ---
  // Allow multiple independent status selections
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);

  // --- Phase 6: Ingredients State ---
  const [ingredients, setIngredients] = useState<any[]>([]); 
  const [availableIngredients, setAvailableIngredients] = useState<{id: number; name: string; image_url: string | null}[]>([]);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [isCreateIngredientModalOpen, setIsCreateIngredientModalOpen] = useState(false);
  const [editingIngredientSlot, setEditingIngredientSlot] = useState<number | null>(null);
  const [ingredientInitialId, setIngredientInitialId] = useState('');

  const openIngredientModal = (slot?: number) => {
    const actualSlot = slot ?? ingredients.length;
    setEditingIngredientSlot(actualSlot);
    const ing = ingredients[actualSlot];
    const matched = ing ? availableIngredients.find(a => a.name === ing.name) : undefined;
    setIngredientInitialId(matched ? String(matched.id) : '');
    setIsIngredientModalOpen(true);
  };

  // --- Phase 7: Reviews State ---
  const [reviews, setReviews] = useState<any[]>([]);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);


  // --- Phase 8: FAQs State ---
  const [faqs, setFaqs] = useState<any[]>([]);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch categories and brands from API on mount
    const fetchSelectData = async () => {
      const apiBase = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const authHeaders: Record<string, string> = { Accept: 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) };
      try {
        const catRes = await fetch(`${apiBase}/v1/categories`, { headers: authHeaders });
        const brandRes = await fetch(`${apiBase}/v1/brands`, { headers: authHeaders });
        const typeRes = await fetch(`${apiBase}/v1/product-types`, { headers: authHeaders });
        const ingrRes = await fetch(`${apiBase}/v1/ingredients`, { headers: authHeaders });
        
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.data || []);
        }
        if (brandRes.ok) {
          const brandData = await brandRes.json();
          setBrands(brandData.data || []);
        }
        if (typeRes.ok) {
          const typeData = await typeRes.json();
          const types = typeData.data || [];
          setProductTypes(types);
          if (types.length > 0) setProductType(types.find((t: any) => t.name === 'Corps')?.name || types[0].name);
        }
        if (ingrRes.ok) {
          const ingrData = await ingrRes.json();
          setAvailableIngredients(ingrData.data || []);
        }
      } catch (error) {
        console.error("Error fetching dependencies:", error);
      }
    };
    fetchSelectData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    const errorKey = e.target.name === 'short_description' ? 'subtitle' : 
                     e.target.name === 'full_description' ? 'description' : 
                     e.target.name;
    setErrors(prev => ({ ...prev, [errorKey]: '' }));
  };

  // --- Phase 3: Product Media State ---
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      if (images.length >= 4) {
        showToast('Vous avez atteint le maximum de 4 photos.');
        e.target.value = '';
        return;
      }

      const duplicates: string[] = [];
      const unique = selectedFiles.filter(f => {
        const isDup = images.some(existing => existing.name === f.name && existing.size === f.size);
        if (isDup) duplicates.push(f.name);
        return !isDup;
      });

      if (duplicates.length > 0) {
        showToast(`"${duplicates[0]}" est déjà ajouté.`);
      }

      const remainingSlots = 4 - images.length;
      const filesToAdd = unique.slice(0, remainingSlots);

      if (unique.length > remainingSlots) {
        showToast(`Il ne reste que ${remainingSlots} emplacement${remainingSlots !== 1 ? 's' : ''} — les photos supplémentaires ont été ignorées.`);
      }

      if (filesToAdd.length > 0) {
        setImages([...images, ...filesToAdd]);
        setImagePreviews([...imagePreviews, ...filesToAdd.map(f => URL.createObjectURL(f))]);
      }

      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  // --- Phase 4: Pricing Variants State ---
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

  const handleAddVariantClick = () => {
    if (variants.length >= 3) {
      showToast('Maximum 3 variantes de taille autorisées.');
      return;
    }
    if (draftVariant !== null) {
      showToast('Veuillez valider la ligne ouverte avant d\'en ajouter une autre.');
      setEntryRowHighlight(true);
      setTimeout(() => setEntryRowHighlight(false), 2000);
      return;
    }
    setDraftVariant(emptyVariant());
    setEditingVariantIndex(null);
  };

  const handleValidateDraft = () => {
    if (!draftVariant || !draftVariant.size || !draftVariant.price) {
      showToast('Veuillez remplir au moins Taille et Prix.');
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

  // --- Handlers for Phases 6, 7 & 8 ---
  // Confirm selection from dropdown (IngredientSelectModal callback)
  const handleIngredientConfirmed = (ingredient: { id: number; name: string; image_url: string | null }) => {
    if (editingIngredientSlot === null) return;
    const thumb = ingredient.image_url ?? `https://placehold.co/150x150?text=${encodeURIComponent(ingredient.name)}`;
    const updated = [...ingredients];
    while (updated.length <= editingIngredientSlot) updated.push(null);
    updated[editingIngredientSlot] = { name: ingredient.name, thumb, file: undefined };
    setIngredients(updated);
    setEditingIngredientSlot(null);
  };

  // New ingredient saved to backend (CreateIngredientModal callback)
  const handleIngredientCreated = (ingredient: { id: number; name: string; image_url: string | null }) => {
    setAvailableIngredients(prev => [...prev, ingredient]);
    const thumb = ingredient.image_url ?? `https://placehold.co/150x150?text=${encodeURIComponent(ingredient.name)}`;
    
    if (editingIngredientSlot !== null && editingIngredientSlot < 3) {
      // Place in the specific slot that was being edited
      const updated = [...ingredients];
      while (updated.length <= editingIngredientSlot) updated.push(null);
      updated[editingIngredientSlot] = { name: ingredient.name, thumb, file: undefined };
      setIngredients(updated);
      setEditingIngredientSlot(null);
    } else {
      // Fallback: append (shouldn't happen if button logic is correct)
      setIngredients(prev => [...prev, { name: ingredient.name, thumb, file: undefined }]);
    }
  };

  const handleAddReview = (data: ReviewFormSaveData) => {
    const photoUrl = data.photoFile ? URL.createObjectURL(data.photoFile) : '';
    setReviews(prev => [...prev, {
      reviewer_name: data.reviewer_name,
      rating: data.rating,
      date: data.date,
      photoUrl,
      photoFile: data.photoFile ?? undefined,
    }]);
  };

  const handleAddFaq = () => {
    if (!newFaq.question && !newFaq.answer) {
      showToast('Please fill in both the question and answer fields.');
      return;
    }
    if (!newFaq.question) {
      showToast('Please fill in the question field.');
      return;
    }
    if (!newFaq.answer) {
      showToast('Please fill in the answer field.');
      return;
    }
    if (editingFaqIndex !== null) {
      const uf = [...faqs];
      if (uf[editingFaqIndex]) {
         uf[editingFaqIndex] = newFaq;
         setFaqs(uf);
      }
      setEditingFaqIndex(null);
    } else {
      setFaqs([...faqs, newFaq]);
    }
    setNewFaq({ question: '', answer: '' });
  };

  const handleEditFaq = (index: number) => {
    setNewFaq(faqs[index]);
    setEditingFaqIndex(index);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('subtitle', formData.short_description);
      data.append('description', formData.full_description);
      data.append('category_id', formData.category_id);
      data.append('brand_id', formData.brand_id);
      data.append('gender', gender.toLowerCase());
      data.append('is_featured', isBestSeller ? '1' : '0');
      data.append('is_gift', isGift ? '1' : '0');
      data.append('is_recommended', isRecommended ? '1' : '0');
      const selectedType = productTypes.find((t: any) => t.name === productType);
      if (selectedType) data.append('product_type_id', String(selectedType.id));
      const validVariants = variants.filter(v => v.size && v.price);
        data.append('variants', JSON.stringify(validVariants));
        data.append('faqs', JSON.stringify(faqs));
        // Strip non-serializable File objects before encoding reviews to JSON
        data.append('reviews_array', JSON.stringify(reviews.map((r) => ({
          reviewer_name: r.reviewer_name,
          rating: r.rating,
          date: r.date,
          comment: r.comment || '',
        }))));
        // Append each review's photo file as review_photos_{i} — backend reads this key
        reviews.forEach((review, i) => {
          if (review.photoFile instanceof File) {
            data.append(`review_photos_${i}`, review.photoFile);
          }
        });
        const processedIngredients = ingredients.map((ing) => ({ name: ing.name }));
        data.append('manual_ingredients', JSON.stringify(processedIngredients));
        ingredients.forEach((ing, i) => {
          if (ing.file) data.append(`ingredient_images_${i}`, ing.file);
        });
        images.forEach((img, i) => {
          data.append(`images[${i}]`, img);
        });
        if (validVariants.length > 0) {
          // Mirror backend rule: 1 variant → index 0; 2 variants → largest (index 1); 3 variants → middle (index 1)
          const sorted = [...validVariants].sort((a, b) => Number(a.size) - Number(b.size));
          const defaultV = sorted.length === 1 ? sorted[0] : sorted[1];
          data.append('price', defaultV.price);
          data.append('stock', defaultV.stock);
        } else {
          data.append('price', '0');
          data.append('stock', '0');
        }
      const apiBase = process.env.NEXT_PUBLIC_API_URL;
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      const res = await fetch(`${apiBase}/v1/admin/products`, {
        method: 'POST',
        headers: { Accept: 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
        body: data,
      });
      const jsonData = await res.json();
      if (!res.ok) {
        if (jsonData.errors) {
          const formattedErrors: Record<string, string> = {};
          Object.keys(jsonData.errors).forEach(key => {
            formattedErrors[key] = jsonData.errors[key][0];
          });
          setErrors(formattedErrors);
          showToast('Please fix the validation errors.');
        } else {
          showToast('Failed to save product. ' + (jsonData.message || 'Please check the fields.'));
        }
        return;
      }
      showToast('Product created successfully!');
      setTimeout(() => router.push('/gestion-bloom-secure/dashboard/products'), 1200);
    } catch (err) {
      console.error('Network Error:', err);
      showToast('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 space-y-6 min-h-screen bg-[#fcfcfc] max-w-7xl mx-auto">
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
          className="flex items-center gap-3 bg-white border border-[#da2966] text-[#da2966] px-5 py-3.5 rounded-t-[24px] sm:rounded-t-[24px] sm:rounded-[24px] rounded-b-none sm:rounded-b-[24px] w-full sm:w-auto rounded-b-none sm:rounded-b-[24px] w-full sm:w-auto shadow-[0_8px_32px_rgba(218,41,102,0.2)] text-[14px] font-bold whitespace-nowrap pointer-events-none"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          {toastMsg}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-4">
        <div className="min-w-0">
          <Link href="/gestion-bloom-secure/dashboard/products" className="inline-flex items-center gap-2 text-[#da2966] text-[14px] font-semibold hover:underline mb-3">
            <ArrowLeft /> Back to Products
          </Link>
          <h1 className="text-[22px] sm:text-[28px] lg:text-[32px] font-bold text-[#333] leading-tight font-serif tracking-tight">Add New Product</h1>
          <p className="text-[13px] sm:text-[15px] text-gray-400 mt-1">Create a new listing for your luxury collection</p>
        </div>
        <div className="flex items-center gap-3 sm:mt-8 shrink-0">
          <button onClick={handleSubmit} disabled={isSubmitting} className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#da2966] text-white text-[13px] sm:text-[14px] font-semibold flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(218,41,102,0.25)] transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#c22158]'}`}>
            <SaveIcon /> {isSubmitting ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>

      {/* SEC 1: Details & Media */}
      <div className="flex flex-col lg:grid lg:grid-cols-[1.4fr_1fr] gap-4 sm:p-6">
        <Card title="Product Details" icon={<DetailsIcon />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[#333]">Category</label>
              <AdminSelect
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                error={errors.category_id}
              >
                <option value="">Select Category</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </AdminSelect>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-[#333]">Brand <span className="font-normal text-gray-400 text-[11px]">(Optional)</span></label>
              <AdminSelect
                name="brand_id"
                value={formData.brand_id}
                onChange={handleInputChange}
                error={errors.brand_id}
              >
                <option value="">Select Brand</option>
                {brands.map((brand: any) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </AdminSelect>
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
              {errors.name && <span className="text-red-500 text-[12px] font-bold mt-1 block">{errors.name}</span>}
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <label className="text-[13px] font-bold text-[#333]">Gender</label>
            <div className="flex items-center gap-3">
              {[
                { name: 'Women', icon: <WomenIcon/> },
                { name: 'Men', icon: <MenIcon/> }
              ].map(g => (
                <button
                  key={g.name}
                  onClick={() => setGender(g.name)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors ${
                    gender === g.name 
                      ? 'bg-[#fff0f3] text-[#da2966]' 
                      : 'border border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <span className={gender === g.name ? 'text-[#da2966]' : 'text-gray-400'}>{g.icon}</span> {g.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <label className="text-[13px] font-bold text-[#333]">Product Type</label>
            <ProductTypeSelector productTypes={productTypes} selected={productType} onSelect={setProductType} icon={TYPE_ICON_MAP[productType] ?? <BodyIcon />} />
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
              {errors.subtitle && <span className="text-red-500 text-[12px] font-bold mt-1 block">{errors.subtitle}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#333]">Full Description</label>
            <textarea 
              name="full_description"
              value={formData.full_description}
              onChange={handleInputChange}
              placeholder="Describe the fragrance notes , key ingredients, and benefits..." 
              className="w-full h-32 px-4 py-3 rounded-xl bg-[#f8f8f8] border-none text-[14px] font-medium text-[#333] placeholder:text-[#ccc] focus:outline-none focus:ring-1 focus:ring-[#da2966]/40 resize-none resize-y"
            ></textarea>
              {errors.description && <span className="text-red-500 text-[12px] font-bold mt-1 block">{errors.description}</span>}
            <div className="flex justify-end pr-1"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M9 1L1 9" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/><path d="M5 9H9V5" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
          </div>
        </Card>

        <Card title="Product Media" icon={<CameraIcon />}>
          <div className="flex gap-4 mb-6">
            <div className="w-[84px] flex flex-col gap-3 shrink-0">
              {imagePreviews.slice(1, 4).map((preview, idx) => (
                <div key={idx} className="w-[84px] h-[84px] rounded-[16px] overflow-hidden relative border border-gray-100 p-1 bg-white shadow-sm">
                  <div className="w-full h-full rounded-[10px] overflow-hidden">
                    <img src={preview} className="w-full h-full object-cover" alt="" />
                  </div>
                  <button onClick={() => removeImage(idx + 1)} className="absolute top-1 right-1 w-5 h-5 bg-white text-[#da2966] rounded-full flex items-center justify-center shadow-sm">
                     <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 2.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </div>
              ))}
              
              {images.length < 4 && (
                <button onClick={() => fileInputRef.current?.click()} className="w-[84px] h-[84px] rounded-[16px] border-2 border-dashed border-[#da2966] bg-white flex flex-col items-center justify-center gap-1 hover:bg-[#fff0f3] transition-colors">
                  <span className="text-[#da2966] font-bold text-[16px] leading-none">+</span>
                  <span className="text-[#da2966] text-[10px] font-bold">ADD</span>
                </button>
              )}
            </div>
            
            <div className="flex-1 bg-gray-50 rounded-[20px] relative overflow-hidden flex flex-col items-center justify-center border border-gray-100">
               {imagePreviews.length > 0 ? (
                 <>
                   <img src={imagePreviews[0]} className="w-full h-full object-cover" alt="Cover" />
                   <button onClick={() => removeImage(0)} className="absolute top-4 left-4 w-8 h-8 bg-white text-red-500 rounded-full flex items-center justify-center shadow-md">
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
          <div onClick={() => fileInputRef.current?.click()} className="w-full min-h-[120px] rounded-2xl border-2 border-dashed border-[#da2966] bg-[#fcfcfc] flex flex-col items-center justify-center py-4 px-4 hover:bg-[#fff0f3] transition-colors cursor-pointer overflow-hidden">
            <CloudUploadIcon />
            <p className="text-[13px] sm:text-[14px] font-bold text-[#333] mt-2 mb-1 text-center leading-snug">Glissez-déposez des photos ici</p>
            <p className="text-[11px] font-medium text-gray-400 text-center">Maximum 4 photos autorisées</p>
            <p className="text-[10px] text-gray-400 mt-1 text-center">JPG ou PNG · 10 Mo max</p>
          </div>
        </Card>
      </div>

      {/* SEC 2: Pricing */}
      <Card 
        title="Pricing & Variants" 
        icon={<TagIcon />} 
        action={<button onClick={handleAddVariantClick} className="text-[#da2966] text-[13px] font-bold hover:underline">+ Add Size Variant</button>}
      >
        <div className="w-full text-left overflow-x-auto no-scrollbar pb-2">
          <div className="min-w-[900px]">
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
                  onChange={e => { const u = [...variants]; u[index] = {...u[index], size: e.target.value}; setVariants(u); }}
                  className={`w-full h-12 text-center rounded-xl text-[14px] font-bold text-[#333] focus:outline-none ${editingVariantIndex === index ? 'bg-white border border-yellow-100/50 shadow-sm' : 'bg-transparent border-none'}`} />
                <AdminSelect
                  variant="row"
                  value={v.unit}
                  disabled={editingVariantIndex !== index}
                  onChange={e => { const u = [...variants]; u[index] = {...u[index], unit: e.target.value}; setVariants(u); }}
                  className={editingVariantIndex === index ? 'bg-white border border-yellow-100/50 shadow-sm' : 'bg-transparent border-none'}
                >
                  <option value="ml">ml</option>
                  <option value="g">g</option>
                </AdminSelect>
                <div className={`flex rounded-xl h-12 items-center overflow-hidden ${editingVariantIndex === index ? 'bg-white shadow-sm border border-yellow-100/50' : 'bg-transparent'}`}>
                  <input type="text" value={v.price}
                    readOnly={editingVariantIndex !== index}
                    onChange={e => { const u = [...variants]; u[index] = {...u[index], price: e.target.value}; setVariants(u); }}
                    placeholder="120" className="w-full text-center bg-transparent text-[14px] font-bold text-[#333] focus:outline-none" />
                  <div className="h-6 w-px bg-gray-200"></div>
                  <span className="text-[13px] font-bold text-[#da2966] px-4">DH</span>
                </div>
                <div className={`flex rounded-xl h-12 items-center overflow-hidden ${editingVariantIndex === index ? 'bg-white shadow-sm border border-yellow-100/50' : 'bg-transparent'}`}>
                  <input type="text" value={v.promotion}
                    readOnly={editingVariantIndex !== index}
                    onChange={e => { const u = [...variants]; u[index] = {...u[index], promotion: e.target.value}; setVariants(u); }}
                    placeholder="0" className="w-full text-center bg-transparent text-[14px] font-bold text-[#333] focus:outline-none" />
                  <div className="h-6 w-px bg-gray-200"></div>
                  <span className="text-[14px] font-bold text-[#da2966] px-4">%</span>
                </div>
                <div className="flex items-center justify-center bg-[#fce8ef] text-[#da2966] h-12 rounded-xl text-[14px] font-extrabold">
                  {(Number(v.price || 0) * (1 - Number(v.promotion || 0) / 100)).toFixed(2)} DH
                </div>
                <input type="text" value={v.stock}
                  readOnly={editingVariantIndex !== index}
                  onChange={e => { const u = [...variants]; u[index] = {...u[index], stock: e.target.value}; setVariants(u); }}
                  className={`w-full text-center h-12 rounded-xl text-[14px] font-bold text-[#333] focus:outline-none ${editingVariantIndex === index ? 'bg-white border border-yellow-100/50 shadow-sm' : 'bg-transparent border-none'}`} />
                <div className="flex items-center gap-2">
                  {editingVariantIndex === index
                    ? <button onClick={() => handleSaveEditVariant(index)} className="h-10 px-3 bg-[#0f834d] hover:bg-[#0c6b3e] text-white text-[12px] font-bold rounded-xl flex items-center gap-1"><CheckIcon /> Save</button>
                    : <button onClick={() => handleEditVariant(index)} className="flex items-center justify-center text-gray-500 hover:text-[#da2966] w-9 h-9 rounded-full border border-gray-200 bg-white shadow-sm transition-colors"><EditIcon/></button>
                  }
                  <button onClick={() => handleDeleteVariant(index)} className="flex items-center justify-center text-gray-500 hover:text-red-500 w-9 h-9 rounded-full border border-gray-200 bg-white shadow-sm transition-colors"><TrashIcon/></button>
                </div>
              </div>
            ))}

            {/* Draft (new) row */}
            {draftVariant !== null && (
              <div
                className={`grid grid-cols-[1fr_1.2fr_1.5fr_1.5fr_1.5fr_1fr_1fr] gap-4 px-6 py-5 items-center rounded-[20px] transition-colors duration-300 ${entryRowHighlight ? 'bg-[#fff0f3]' : 'bg-[#ffffe9]'}`}
                style={entryRowHighlight ? { animation: 'rowPulse 2s ease-out forwards' } : {}}
              >
                <input type="text" value={draftVariant.size} onChange={e => setDraftVariant({...draftVariant, size: e.target.value})} placeholder="20" className="w-full h-12 text-center rounded-xl bg-white border border-yellow-100/50 text-[14px] font-bold text-[#333] focus:outline-none shadow-sm" />
                <AdminSelect
                  variant="row"
                  value={draftVariant.unit}
                  onChange={e => setDraftVariant({...draftVariant, unit: e.target.value})}
                  className="bg-white border border-yellow-100/50 shadow-sm"
                >
                  <option value="ml">ml</option>
                  <option value="g">g</option>
                </AdminSelect>
                <div className="flex bg-white rounded-xl shadow-sm h-12 items-center overflow-hidden border border-yellow-100/50">
                  <input type="text" value={draftVariant.price} onChange={e => setDraftVariant({...draftVariant, price: e.target.value})} placeholder="120" className="w-full text-center bg-transparent text-[14px] font-bold text-[#333] focus:outline-none" />
                  <div className="h-6 w-px bg-gray-200"></div>
                  <span className="text-[13px] font-bold text-[#da2966] px-4">DH</span>
                </div>
                <div className="flex bg-white rounded-xl shadow-sm h-12 items-center overflow-hidden border border-yellow-100/50">
                  <input type="text" value={draftVariant.promotion} onChange={e => setDraftVariant({...draftVariant, promotion: e.target.value})} placeholder="0" className="w-full text-center bg-transparent text-[14px] font-bold text-[#333] focus:outline-none" />
                  <div className="h-6 w-px bg-gray-200"></div>
                  <span className="text-[14px] font-bold text-[#da2966] px-4">%</span>
                </div>
                <div className="flex items-center justify-center bg-[#fce8ef] text-[#da2966] h-12 rounded-xl text-[14px] font-extrabold shadow-sm">
                  {(Number(draftVariant.price || 0) * (1 - Number(draftVariant.promotion || 0) / 100)).toFixed(2)} DH
                </div>
                <input type="text" value={draftVariant.stock} onChange={e => setDraftVariant({...draftVariant, stock: e.target.value})} placeholder="33" className="w-full text-center h-12 rounded-xl bg-white border border-yellow-100/50 text-[14px] font-bold text-[#333] shadow-sm focus:outline-none" />
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
        </div>
      </Card>

      {/* SEC 3: Stats & Ingredients */}
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_1.5fr] gap-4 sm:p-6">
        <Card title="Status Settings" icon={<SettingsIcon />}>
          <div className="space-y-4">
            <ToggleRow label="Make as Best Seller" active={isBestSeller} onClick={() => setIsBestSeller(!isBestSeller)} />
            <ToggleRow label="Make as Pack" active={isGift} border={true} onClick={() => setIsGift(!isGift)} />
            <ToggleRow label="Make as Recommendation" active={isRecommended} onClick={() => setIsRecommended(!isRecommended)} />
          </div>
        </Card>
        
        <Card title="Ingredients" icon={<LeafIcon />} action={<button onClick={() => { const emptySlot = ingredients.findIndex((ing, i) => i < 3 && !ing); if (emptySlot < 3) { setEditingIngredientSlot(emptySlot); setIsCreateIngredientModalOpen(true); } else { showToast('Maximum 3 ingredients allowed.'); } }} className="text-[#da2966] text-[13px] font-bold hover:underline">+ New Ingredient</button>}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:p-6 mt-2 w-full">
            {[0, 1, 2].map((slot) => {
              const ing = ingredients[slot];
              return (
                <div key={slot} className="flex flex-col items-center gap-3 group">
                  {/* Single fixed circle — shape never changes */}
                  <div className={`relative w-full aspect-square rounded-full overflow-hidden transition-colors ${ing ? 'border-[2.5px] border-[#da2966]' : 'border-[2.5px] border-dashed border-[#da2966]'}`}>
                    {/* +ADD layer — always underneath */}
                    <button
                      onClick={() => !ing && openIngredientModal(slot)}
                      className="absolute inset-0 rounded-full bg-white flex flex-col items-center justify-center hover:bg-[#fff0f3] transition-colors"
                    >
                      <span className="text-[#da2966] font-bold text-[16px] sm:text-[18px] sm:text-[20px] sm:text-[24px] leading-none mb-1">+</span>
                      <span className="text-[#da2966] text-[12px] font-bold">ADD</span>
                    </button>
                    {/* Image layer — sits on top and covers +ADD completely */}
                    {ing && (
                      <>
                        <img src={ing.thumb} alt={ing.name} className="absolute inset-0 w-full h-full object-cover" />
                        {/* Hover edit + delete overlay */}
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity z-10">
                          <button
                            onClick={(e) => { e.stopPropagation(); openIngredientModal(slot); }}
                            className="w-9 h-9 rounded-full bg-white text-gray-700 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:text-[#da2966] transition-colors"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setIngredients(ingredients.filter((_, i) => i !== slot)); }}
                            className="w-9 h-9 rounded-full bg-white text-gray-700 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:text-red-500 transition-colors"
                          >
                            <TrashIcon />
                          </button>
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
        <div className="flex items-center gap-4 sm:p-6 py-6 overflow-x-auto w-full px-4 scrollbar-hide">
          {reviews.map((rev, idx) => (
            <div key={idx} className="relative group shrink-0 w-[240px] flex flex-col">
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
                    <button onClick={() => setReviews(reviews.filter((_, i) => i !== idx))} className="w-10 h-10 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.1)] flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors"><TrashIcon/></button> 
                  </div>
                </div>
                <div className="space-y-[4px] text-center w-full flex flex-col items-center">
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
          ))}

          <div onClick={() => setIsReviewFormOpen(true)} className="w-[180px] h-[180px] rounded-full border-[2.5px] border-dashed border-[#da2966] bg-white flex flex-col items-center justify-center gap-2 hover:bg-[#fff0f3] transition-colors shrink-0 cursor-pointer">
            <span className="text-[#da2966] font-bold text-[28px] leading-none mb-1">+</span>
            <span className="text-[#da2966] text-[14px] font-bold">ADD</span>
          </div>
        </div>
      </Card>

      {/* SEC 5: FAQ */}
      <Card title="Product FAQ" icon={<ChatIcon />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:p-6 md:gap-10">
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-[#ffffe9] rounded-[20px] border border-yellow-100 px-6 py-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[14px] text-[#333]">{faq.question}</h4>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleEditFaq(idx)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow text-gray-500 hover:text-[#da2966]"><EditIcon/></button>
                    <button onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))} className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow text-gray-500 hover:text-red-500"><TrashIcon/></button>
                  </div>
                </div>
                <p className="text-[13px] font-bold text-[#555] mt-4 leading-relaxed pr-8">
                  {faq.answer}
                </p>
              </div>
            ))}
            
            {faqs.length === 0 && (
              <p className="text-[13px] text-gray-400 font-medium">No FAQs added yet.</p>
            )}
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
              ></textarea>
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
      
      <div className="pb-10"></div>

      {/* --- MODALS --- */}
      
      {/* 1. Select Ingredient Modal */}
      <IngredientSelectModal
        isOpen={isIngredientModalOpen}
        onClose={() => { setIsIngredientModalOpen(false); setEditingIngredientSlot(null); }}
        availableIngredients={availableIngredients}
        initialSelectedId={ingredientInitialId}
        isEditing={editingIngredientSlot !== null && !!(ingredients[editingIngredientSlot ?? -1])}
        onConfirm={handleIngredientConfirmed}
      />

      {/* 2. Create Custom Ingredient Modal */}
      <CreateIngredientModal
        isOpen={isCreateIngredientModalOpen}
        onClose={() => { setIsCreateIngredientModalOpen(false); setEditingIngredientSlot(null); }}
        onCreated={handleIngredientCreated}
      />

      {/* 2. Add Review Modal */}
      <ReviewFormModal
        isOpen={isReviewFormOpen}
        onClose={() => setIsReviewFormOpen(false)}
        onSave={handleAddReview}
      />

    </div>
  );
}