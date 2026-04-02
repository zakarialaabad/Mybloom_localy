$f = (Get-ChildItem -LiteralPath "C:\Users\acer\Desktop\Parfum\frontend\app\admin\dashboard\products\[id]\edit" -Force)[0].FullName
$c = Get-Content -LiteralPath $f -Raw

# Change 1: Add availableIngredients and newIngredientSelectedId states
$old1 = "  // --- Ingredients State ---`r`n  const [ingredients, setIngredients] = useState<any[]>([]);`r`n  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);`r`n  const [editingIngredientSlot, setEditingIngredientSlot] = useState<number | null>(null);`r`n  const [newIngredientName, setNewIngredientName] = useState('');`r`n  const [newIngredientFile, setNewIngredientFile] = useState<File | null>(null);`r`n  const ingredientFileInputRef = useRef<HTMLInputElement>(null);"
$new1 = "  // --- Ingredients State ---`r`n  const [ingredients, setIngredients] = useState<any[]>([]);`r`n  const [availableIngredients, setAvailableIngredients] = useState<{id: number; name: string; image_url: string | null}[]>([]);`r`n  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);`r`n  const [editingIngredientSlot, setEditingIngredientSlot] = useState<number | null>(null);`r`n  const [newIngredientSelectedId, setNewIngredientSelectedId] = useState('');`r`n  const [newIngredientName, setNewIngredientName] = useState('');`r`n  const [newIngredientFile, setNewIngredientFile] = useState<File | null>(null);`r`n  const ingredientFileInputRef = useRef<HTMLInputElement>(null);"
Write-Host "Change 1 found: $($c.Contains($old1))"
$c = $c.Replace($old1, $new1)

# Change 2: Update openIngredientModal function
$old2 = "  const openIngredientModal = (slot: number) => {`r`n    setEditingIngredientSlot(slot);`r`n    setNewIngredientName(ingredients[slot]?.name ?? '');`r`n    setNewIngredientFile(null);`r`n    setIsIngredientModalOpen(true);`r`n  };"
$new2 = "  const openIngredientModal = (slot: number) => {`r`n    setEditingIngredientSlot(slot);`r`n    const ing = ingredients[slot];`r`n    if (ing) {`r`n      const matched = availableIngredients.find(a => a.name === ing.name);`r`n      if (matched) {`r`n        setNewIngredientSelectedId(String(matched.id));`r`n        setNewIngredientName(matched.name);`r`n      } else {`r`n        setNewIngredientSelectedId('custom');`r`n        setNewIngredientName(ing.name);`r`n      }`r`n    } else {`r`n      setNewIngredientSelectedId('');`r`n      setNewIngredientName('');`r`n    }`r`n    setNewIngredientFile(null);`r`n    setIsIngredientModalOpen(true);`r`n  };"
Write-Host "Change 2 found: $($c.Contains($old2))"
$c = $c.Replace($old2, $new2)

# Change 3: Add ingredients fetch in Promise.all
$old3 = "        const [cats, brnds, types] = await Promise.all([`r`n          adminCategoryService.list(),`r`n          brandService.list(),`r`n          adminProductTypeService.list(),`r`n        ]);`r`n`r`n        setCategories(cats);`r`n        setBrands(brnds);`r`n        setProductTypes(types);"
$new3 = "        const [cats, brnds, types, ingrData] = await Promise.all([`r`n          adminCategoryService.list(),`r`n          brandService.list(),`r`n          adminProductTypeService.list(),`r`n          fetch('http://localhost:8000/api/v1/ingredients').then(r => r.ok ? r.json() : { data: [] }).catch(() => ({ data: [] })),`r`n        ]);`r`n`r`n        setCategories(cats);`r`n        setBrands(brnds);`r`n        setProductTypes(types);`r`n        setAvailableIngredients(ingrData.data || []);"
Write-Host "Change 3 found: $($c.Contains($old3))"
$c = $c.Replace($old3, $new3)

# Change 4: Update handleAddIngredient
$old4 = "  // -- Ingredient handlers ------------------------------------------------------------------------------------------`r`n  const handleAddIngredient = () => {`r`n    if (!newIngredientName || editingIngredientSlot === null) return;"
# Try the actual text from the file
$old4b = "  // -- Ingredient handlers"
Write-Host "Change 4b found: $($c.Contains($old4b))"

Set-Content -LiteralPath $f -Value $c -NoNewline
Write-Host "Saved after changes 1-3"
