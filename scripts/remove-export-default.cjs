const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../dist/content.js');

let code = fs.readFileSync(file, 'utf8');
// export default require_content(); 또는 export default ...;으로 끝나는 줄 제거
code = code.replace(/^\s*export\s+default\s+.*;\s*$/gm, '');

fs.writeFileSync(file, code);
console.log('Patched dist/content.js: export default 제거 완료');
