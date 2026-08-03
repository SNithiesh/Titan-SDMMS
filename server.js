import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static production build files from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback for single page application routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`  TITAN SDMMS LOCAL PLANT SERVER IS RUNNING LIVE!      `);
  console.log(`=======================================================`);
  console.log(`  ➜ Local Access:   http://localhost:${PORT}`);
  console.log(`  ➜ Network Access: http://192.168.18.22:${PORT}`);
  console.log(`=======================================================`);
  console.log(`  Operators & Supervisors can open the link above on any`);
  console.log(`  mobile phone or laptop connected to Wi-Fi to install! `);
  console.log(`=======================================================`);
});
