const fs=require('fs'); let c=fs.readFileSync('src/pages/BiensPage.tsx', 'utf8');
const st=c.indexOf('view === \\'grid\\'');
const end=c.indexOf('<div className=\"p-4\">', st);
console.log(c.substring(st, end+200));
