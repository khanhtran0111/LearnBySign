const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3002; // Test port khác để tránh conflict

// Serve static files
const gifStagePath = path.join(__dirname, '..', '..', 'gif_stage');
console.log('Serving files from:', gifStagePath);

app.use('/media', express.static(gifStagePath, {
  setHeaders: (res, filePath) => {
    console.log('Requesting file:', filePath);
    if (filePath.endsWith('.gif')) {
      res.set('Content-Type', 'image/gif');
    }
    res.set('Access-Control-Allow-Origin', '*');
  },
  etag: false,
}));

// List available GIFs
app.get('/list', (req, res) => {
  const stage02 = path.join(gifStagePath, '02_Simple_Words', 'gifs');
  
  if (fs.existsSync(stage02)) {
    const files = fs.readdirSync(stage02);
    const gifs = files.filter(f => f.endsWith('.gif'));
    
    res.json({
      folder: stage02,
      count: gifs.length,
      files: gifs.slice(0, 10), // First 10
      sampleUrls: gifs.slice(0, 3).map(f => 
        `http://localhost:${PORT}/media/02_Simple_Words/gifs/${f.replace(/ /g, '%20')}`
      )
    });
  } else {
    res.status(404).json({ error: 'Folder not found' });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅ Test server running at http://localhost:${PORT}`);
  console.log(`📝 List GIFs: http://localhost:${PORT}/list`);
  console.log(`\n🧪 Test URLs:`);
  console.log(`   http://localhost:${PORT}/media/02_Simple_Words/gifs/bạn.gif`);
  console.log(`   http://localhost:${PORT}/media/02_Simple_Words/gifs/ông%20bà.gif`);
  console.log(`\nPress Ctrl+C to stop`);
});
