const fs=require('fs');
let c = fs.readFileSync('src/pages/BienDetailPage.tsx','utf8');

c = c.replace(/formatFCFA\(bien\.base_rent_hc\)/g, 'formatFCFA(Number(bien.base_rent_hc || 0))');
c = c.replace(/formatFCFA\(bien\.base_charges\)/g, 'formatFCFA(Number(bien.base_charges || 0))');
c = c.replace(/formatFCFA\(bien\.guarantee_deposit\)/g, 'formatFCFA(Number(bien.guarantee_deposit || 0))');
c = c.replace(/formatFCFA\(bien\.base_rent_hc \+ bien\.base_charges\)/g, 'formatFCFA(Number(bien.base_rent_hc || 0) + Number(bien.base_charges || 0))');

c = c.replace(/bien\.surface_area/g, '(bien.surface_area || bien.surface || 0)');
c = c.replace(/bien\.rooms_count/g, '(bien.rooms_count || bien.nombre_pieces || 1)');
c = c.replace(/bien\.city/g, '(bien.city || bien.ville || \"\")');

fs.writeFileSync('src/pages/BienDetailPage.tsx', c);
console.log('BienDetailPage numbers fixed!');
