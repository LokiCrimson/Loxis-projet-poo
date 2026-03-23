const fs = require('fs');
let code = fs.readFileSync('src/components/BienFormModal.tsx', 'utf8');

code = code.replace(
  'const onSubmit = async (data: BienFormData) => {',
  'const onSubmit = async (data: BienFormData) => {\n    data.zip_code = data.zip_code || "00000";\n    data.base_charges = data.base_charges || 0;\n    data.guarantee_deposit = data.guarantee_deposit || 0;'
);

fs.writeFileSync('src/components/BienFormModal.tsx', code);
