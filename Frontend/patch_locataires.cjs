const fs = require('fs');

function patchFile(file) {
  if (!fs.existsSync(file)) return;
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/loc\.prenom/g, '(loc.first_name || loc.prenom)');
  c = c.replace(/loc\.nom/g, '(loc.last_name || loc.nom)');
  c = c.replace(/loc\.telephone/g, '(loc.phone || loc.telephone)');
  c = c.replace(/loc\.date_naissance/g, '(loc.birth_date || loc.date_naissance)');
  c = c.replace(/loc\.piece_identite_type/g, '(loc.id_type || loc.piece_identite_type)');
  c = c.replace(/loc\.piece_identite_numero/g, '(loc.id_number || loc.piece_identite_numero)');
  c = c.replace(/loc\.actif/g, '(loc.is_active ?? loc.actif)');
  fs.writeFileSync(file, c);
}

patchFile('src/pages/LocatairesPage.tsx');
patchFile('src/pages/LocataireDetailPage.tsx');
console.log('patched view files');
