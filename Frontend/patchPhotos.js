const fs = require('fs');
let code = fs.readFileSync('src/components/BienFormModal.tsx', 'utf8');

// 1. Add uploadPhotoBien import
code = code.replace(
    /import \{ useCreateBien\, useUpdateBien/, 
    "import { uploadPhotoBien } from '@/services/biens.service';\nimport { useCreateBien, useUpdateBien"
);
// Make sure we have X, Trash icons from lucide-react
if (!code.includes('X,')) code = code.replace('Upload ', 'Upload, X, ');
if (!code.includes('Trash')) code = code.replace('Upload,', 'Upload, Trash,');

// 2. Add photos state
code = code.replace(
    /const \[selectedCategorie\, setSelectedCategorie\] = useState\(''\);/,
    "const [selectedCategorie, setSelectedCategorie] = useState('');\n  const [photos, setPhotos] = useState<File[]>([]);\n  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);"
);

// 3. Update onSubmit to execute photo upload
const newOnSubmit = \const onSubmit = async (data: BienFormData) => {
    try {
      const payload = {
        category: data.categorie,
        property_type: data.type_bien,
        reference: data.reference,
        address: data.adresse,
        city: data.ville,
        zip_code: data.code_postal || '00000',
        surface_area: data.surface,
        rooms_count: data.nombre_pieces || 1,
        description: data.description || '',
        base_rent_hc: data.loyer_hc,
        base_charges: data.charges || 0,
        guarantee_deposit: data.depot_garantie || 0,
        status: data.statut === 'vacant' ? 'VACANT' : data.statut
      };

      const mutation = isEdit
        ? updateMutation.mutateAsync({ id: bienId!, data: payload })
        : createMutation.mutateAsync(payload);

      const response: any = await mutation;
      const bId = isEdit ? bienId : (response.id || (response.data && response.data.id));

      if (bId && photos.length > 0) {
        // Upload all photos
        await Promise.all(photos.map((p, index) => uploadPhotoBien(bId, p, index === 0)));
      }

      toast({ title: isEdit ? 'Bien modifié' : 'Bien créé', description: 'Opération réussie.' });
      onOpenChange(false);
      reset();
      setPhotos([]);
      setPhotoPreviews([]);
    } catch (e: any) {
      console.error('API Error:', e.response?.data || e);
      toast({ title: 'Erreur', description: JSON.stringify(e.response?.data || 'Vérifiez les champs.'), variant: 'destructive' });
    }
  };\;

code = code.replace(/const onSubmit = async \(data: BienFormData\) => \{[\s\S]*?\}\s*catch[^\}]+\}\n\s*\};/, newOnSubmit);

// 4. Update the photos TabsContent
const photoContent = \
            <TabsContent value="photos" className="mt-4">
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-center cursor-pointer relative" onClick={() => document.getElementById('photo-upload')?.click()}>
                <input 
                   type="file" 
                   id="photo-upload" 
                   multiple 
                   accept="image/*" 
                   className="hidden" 
                   onChange={(e) => {
                      if (e.target.files) {
                         const newFiles = Array.from(e.target.files);
                         setPhotos(prev => [...prev, ...newFiles]);
                         setPhotoPreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
                      }
                   }} 
                />
                <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Cliquez pour ajouter des photos</p>
                <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WEBP  Max 10 photos</p>
              </div>
              {photoPreviews.length > 0 && (
                 <div className="grid grid-cols-3 gap-2 mt-4">
                    {photoPreviews.map((src, i) => (
                       <div key={i} className="relative group rounded-md overflow-hidden border h-24">
                          <img src={src} alt="preview" className="object-cover w-full h-full" />
                          <button type="button" className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100"
                             onClick={(e) => {
                                e.stopPropagation();
                                setPhotos(prev => prev.filter((_, idx) => idx !== i));
                                setPhotoPreviews(prev => prev.filter((_, idx) => idx !== i));
                             }}
                          >
                             <Trash className="w-3 h-3" />
                          </button>
                       </div>
                    ))}
                 </div>
              )}
            </TabsContent>\;

code = code.replace(/<TabsContent value="photos" className="mt-4">[\s\S]*?<\/TabsContent>/, photoContent);

// Add cleanup of object urls
if (!code.includes('URL.revokeObjectURL')) {
   code = code.replace('const watchedCategorie = watch(\'categorie\');', "const watchedCategorie = watch('categorie');\n  useEffect(() => {\n    return () => photoPreviews.forEach(URL.revokeObjectURL);\n  }, [photoPreviews]);");
}

fs.writeFileSync('src/components/BienFormModal.tsx', code);
console.log('Fixed BienFormModal.tsx');
