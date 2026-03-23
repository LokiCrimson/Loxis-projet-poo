const fs = require('fs');
let code = fs.readFileSync('src/components/BienFormModal.tsx', 'utf8');

code = code.replace(
  /console\.error\(e\);\s*toast[^;]+;/g, 
  "console.error('API Error:', e.response?.data || e.message || e); toast({ title: 'Erreur Serveur', description: JSON.stringify(e.response?.data || 'Erreur'), variant: 'destructive'});"
);

fs.writeFileSync('src/components/BienFormModal.tsx', code);
