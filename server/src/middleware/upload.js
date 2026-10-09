import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME = {
  'application/pdf': '%PDF',
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/webp': 'RIFF',
  'application/msword': [0xd0, 0xcf, 0x11, 0xe0],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [0x50, 0x4b, 0x03, 0x04],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [0x50, 0x4b, 0x03, 0x04],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': [0x50, 0x4b, 0x03, 0x04],
};

const magicMatches = (buffer, mimeType) => {
  const sig = ALLOWED_MIME[mimeType];
  if (!sig) return false;
  if (typeof sig === 'string') {
    if (sig === '%PDF') return buffer.slice(0, 4).toString('latin1') === '%PDF';
    return buffer.slice(0, 4).toString('latin1') === sig;
  }
  return sig.every((byte, i) => buffer[i] === byte);
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME[file.mimetype]) {
      return cb(new Error('File type not allowed. Upload PDF, DOC(X), XLSX, PPTX, PNG, JPEG or WEBP.'));
    }
    cb(null, true);
  },
});

export async function validateFileContent(filePath, mimeType) {
  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(8);
  fs.readSync(fd, buffer, 0, 8, 0);
  fs.closeSync(fd);
  if (!magicMatches(buffer, mimeType)) {
    fs.unlinkSync(filePath);
    throw Object.assign(new Error('File content does not match its declared type.'), { status: 400 });
  }
}

export { UPLOAD_DIR };
