const fs = require('fs');
let code = fs.readFileSync('src/pages/BienDetailPage.tsx', 'utf8');

// 1. imports
if (!code.includes('BienFormModal')) {
   code = code.replace(
      "import { EmptyState } from '@/components/EmptyState';",
      "import { EmptyState } from '@/components/EmptyState';\nimport { BienFormModal } from '@/components/BienFormModal';\nimport { useState } from 'react';"
   );
}

// 2. Add state
if (!code.includes('const [isEditOpen, setIsEditOpen] = useState(false);')) {
   code = code.replace(
      "const { data: baux = [] } = useBaux",
      "const [isEditOpen, setIsEditOpen] = useState(false);\n  const { data: baux = [] } = useBaux"
   );
}

// 3. Update the Modifier Button
code = code.replace(
   /<Button variant="outline"><Pencil className="mr-2 h-4 w-4" \/>Modifier<\/Button>/,
   '<Button variant="outline" onClick={() => setIsEditOpen(true)}><Pencil className="mr-2 h-4 w-4" />Modifier</Button>'
);

// 4. Update the Photo representation
const oldPhotoSection = /\{\/\* Photo \*\/\}\s*<div className=\{cn\('relative h-56 rounded-xl bg-gradient-to-br', gradients\[bienId % gradients\.length\]\)\}>\s*<div className="absolute inset-0 flex items-center justify-center">\s*<Building2 className="h-16 w-16 text-card\/30" \/>\s*<\/div>\s*<\/div>/;

const newPhotoSection = \{/* Photo */}
      <div className={cn('relative h-56 rounded-xl bg-gradient-to-br', gradients[bienId % gradients.length], 'overflow-hidden group')}>
        {bien?.main_photo ? (
          <>
             <img src={bien.main_photo} alt={bien.reference} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
             <div className="absolute top-4 right-4 bg-black/50 p-2 rounded-full backdrop-blur-md">
                 <a href={bien.main_photo} download target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                 </a>
             </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="h-16 w-16 text-card/30" />
          </div>
        )}
      </div>\;

code = code.replace(oldPhotoSection, newPhotoSection);

// 5. Append Modal at the bottom
if (!code.includes('<BienFormModal open={isEditOpen}')) {
   code = code.replace(
      "    </div>\n  );\n}",
      "      <BienFormModal open={isEditOpen} onOpenChange={setIsEditOpen} bienId={bienId} />\n    </div>\n  );\n}"
   );
}

fs.writeFileSync('src/pages/BienDetailPage.tsx', code);
console.log('Fixed BienDetailPage.tsx');
