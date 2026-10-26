import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Helper to load env file with correct encoding (handles UTF-16 LE BOM from Windows/PowerShell)
import fs from 'fs';

const loadEnv = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  const buffer = fs.readFileSync(filePath);
  const encoding = (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) ? 'utf16le' : 'utf8';
  dotenv.config({ path: filePath, encoding });
};

// Load both root and backend environment variables
loadEnv(path.resolve(__dirname, '../.env'));
loadEnv(path.resolve(__dirname, '.env'));

import('./server.js');
