// Copia client/build -> server/public
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'client', 'build');
const dst = path.join(__dirname, '..', 'server', 'public');

function copyDir(srcDir, dstDir) {
    if (!fs.existsSync(dstDir)) fs.mkdirSync(dstDir, { recursive: true });
    for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
        const s = path.join(srcDir, entry.name);
        const d = path.join(dstDir, entry.name);
        if (entry.isDirectory()) copyDir(s, d);
        else fs.copyFileSync(s, d);
    }
}

if (!fs.existsSync(src)) {
    console.error('Build de client no encontrado. Ejecutá: npm run build (raíz)');
    process.exit(1);
}

copyDir(src, dst);
console.log('✅ Copiado client/build -> server/public');
