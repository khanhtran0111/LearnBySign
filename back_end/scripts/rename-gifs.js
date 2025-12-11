// Script to rename GIF files to URL-safe names
// Run: node scripts/rename-gifs.js

const fs = require('fs');
const path = require('path');

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose Unicode
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (ô→o, à→a)
    .replace(/đ/g, 'd') // Vietnamese đ
    .replace(/Đ/g, 'd')
    .replace(/[^\w\s-]/g, '') // Remove special chars except word, space, hyphen
    .replace(/\s+/g, '_') // Replace spaces with underscore
    .replace(/-+/g, '_') // Replace hyphens with underscore
    .replace(/_+/g, '_') // Collapse multiple underscores
    .trim();
}

function renameGifsInFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    console.log(`⚠️  Folder not found: ${folderPath}`);
    return { renamed: 0, skipped: 0 };
  }

  const files = fs.readdirSync(folderPath);
  const gifs = files.filter(f => f.endsWith('.gif'));
  
  let renamed = 0;
  let skipped = 0;

  console.log(`\n📁 Processing: ${folderPath}`);
  console.log(`   Found ${gifs.length} GIF files`);

  gifs.forEach(file => {
    const baseName = file.replace('.gif', '');
    const newName = slugify(baseName) + '.gif';
    
    if (file === newName) {
      skipped++;
      return;
    }

    const oldPath = path.join(folderPath, file);
    const newPath = path.join(folderPath, newName);

    try {
      // Check if target already exists
      if (fs.existsSync(newPath)) {
        console.log(`   ⚠️  Skip (target exists): ${file} → ${newName}`);
        skipped++;
        return;
      }

      fs.renameSync(oldPath, newPath);
      console.log(`   ✅ Renamed: ${file} → ${newName}`);
      renamed++;
    } catch (err) {
      console.error(`   ❌ Error renaming ${file}:`, err.message);
      skipped++;
    }
  });

  return { renamed, skipped };
}

function main() {
  console.log('🔄 Starting GIF rename process...\n');

  const gifStageRoot = path.join(__dirname, '..', '..', 'gif_stage');
  
  const folders = [
    path.join(gifStageRoot, '01_Alphabet_Numbers', 'gifs'),
    path.join(gifStageRoot, '02_Simple_Words', 'gifs'),
    path.join(gifStageRoot, '03_Complex_Words', 'gifs'),
    path.join(gifStageRoot, '04_Advanced', 'gifs'),
  ];

  let totalRenamed = 0;
  let totalSkipped = 0;

  folders.forEach(folder => {
    const result = renameGifsInFolder(folder);
    totalRenamed += result.renamed;
    totalSkipped += result.skipped;
  });

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Total renamed: ${totalRenamed} files`);
  console.log(`⏭️  Total skipped: ${totalSkipped} files`);
  console.log('='.repeat(60));

  if (totalRenamed > 0) {
    console.log('\n⚠️  Important: Run seed script again to update URLs in database:');
    console.log('   node scripts/seed-basic-advanced-lessons.js');
  }
}

main();
