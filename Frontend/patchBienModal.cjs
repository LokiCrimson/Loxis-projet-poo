const fs = require('fs');
let f = 'src/components/BienFormModal.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(/status: data\.statut === 'vacant' \? 'VACANT' : data\.statut/g, "status: data.statut === 'vacant' ? 'VACANT' : (data.statut === 'en_travaux' ? 'UNDER_WORK' : (data.statut === 'loue' ? 'RENTED' : data.statut))");

c = c.replace(/statut: String\(existingBien\.status \|\| existingBien\.statut \|\| 'vacant'\)\.toLowerCase\(\),/g, 
`statut: (existingBien.status === 'UNDER_WORK' ? 'en_travaux' : (existingBien.status === 'RENTED' ? 'loue' : 'vacant')),`);

c = c.replace(/depot_garantie: existingBien\.guarantee_deposit \|\| existingBien\.depot_garantie \|\| 0,/g, 
`depot_garantie: Number(existingBien.guarantee_deposit || existingBien.depot_garantie || 0),`);

c = c.replace(/loyer_hc: existingBien\.base_rent_hc \|\| existingBien\.loyer_hc \|\| 0,/g, 
`loyer_hc: Number(existingBien.base_rent_hc || existingBien.loyer_hc || 0),`);

c = c.replace(/charges: existingBien\.base_charges \|\| existingBien\.charges \|\| 0,/g, 
`charges: Number(existingBien.base_charges || existingBien.charges || 0),`);

c = c.replace(/surface: existingBien\.surface_area \|\| existingBien\.surface \|\| 0,/g, 
`surface: Number(existingBien.surface_area || existingBien.surface || 0),`);

fs.writeFileSync(f, c);
console.log('patched BienFormModal');
