const fs = require('fs');
const file = 'src/components/LocataireFormModal.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/reset\(\{[\s\S]+?\}\);/m, `reset({
        nom: existing.last_name || existing.nom || '', 
        prenom: existing.first_name || existing.prenom || '', 
        email: existing.email || '',
        telephone: existing.phone || existing.telephone || '', 
        date_naissance: existing.birth_date || existing.date_naissance || '',
        profession: existing.profession || '', 
        piece_identite_type: existing.id_type || existing.piece_identite_type || 'cni',
        piece_identite_numero: existing.id_number || existing.piece_identite_numero || '',
        garant_nom: existing.garant?.nom || '', 
        garant_prenom: existing.garant?.prenom || '',
        garant_telephone: existing.garant?.telephone || '', 
        garant_email: existing.garant?.email || '',
        garant_profession: existing.garant?.profession || '',
        garant_revenu_mensuel: existing.garant?.revenu_mensuel || 0,
        garant_entite: existing.garant?.entite || '', 
        garant_details: existing.garant?.details || '',
      });`);

c = c.replace(/const onSubmit = \(data: LocataireFormData\) => \{[\s\S]+?\}\);[\s\n]+};/m, `const onSubmit = (data: LocataireFormData) => {
    const backendData = {
      first_name: data.prenom,
      last_name: data.nom,
      email: data.email,
      phone: data.telephone,
      birth_date: data.date_naissance || null,
      profession: data.profession || '',
      id_type: data.piece_identite_type || 'cni',
      id_number: data.piece_identite_numero || '',
      // Ensure these go correctly. If garant needs to be separated later, we do it, but let's pass all.
      ...data
    };
    
    // some fields are passed back as the backend expects snake_case naming mostly
    
    const mutation = isEdit
      ? updateMut.mutateAsync({ id: locataireId!, data: backendData })
      : createMut.mutateAsync(backendData);
      
    mutation.then(() => { 
        toast({ title: isEdit ? 'Locataire modifié' : 'Locataire créé' }); 
        onOpenChange(false); 
        reset(); 
    })
    .catch((err) => {
        console.error(err);
        toast({ title: 'Erreur', description: 'Vérifiez les champs saisis', variant: 'destructive' });
    });
  };`);

fs.writeFileSync(file, c);
