import Tesseract from 'tesseract.js';
import fs from 'fs';

const PLATE_REGEX = /[A-Z0-9]{2,3}[-\s]?[A-Z0-9]{2,4}[-\s]?[A-Z0-9]{2,4}/gi;

export async function recognizePlateFromImage(imagePath) {
  if (process.env.PLATE_RECOGNIZER_API_KEY) {
    return recognizeWithPlateRecognizer(imagePath);
  }
  return recognizeWithTesseract(imagePath);
}

async function recognizeWithTesseract(imagePath) {
  const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
    logger: () => {},
  });
  const cleaned = text.replace(/\s+/g, ' ').trim().toUpperCase();
  const matches = cleaned.match(PLATE_REGEX);
  if (matches?.length) {
    return normalizePlate(matches[0]);
  }
  const lines = cleaned.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const alnum = line.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    if (alnum.length >= 5 && alnum.length <= 12) {
      return alnum;
    }
  }
  return null;
}

async function recognizeWithPlateRecognizer(imagePath) {
  const FormData = (await import('form-data')).default;
  const fetch = (await import('node-fetch')).default;
  const form = new FormData();
  form.append('upload', fs.createReadStream(imagePath));
  const res = await fetch('https://api.platerecognizer.com/v1/plate-reader/', {
    method: 'POST',
    headers: { Authorization: `Token ${process.env.PLATE_RECOGNIZER_API_KEY}` },
    body: form,
  });
  const data = await res.json();
  const plate = data?.results?.[0]?.plate?.toUpperCase();
  return plate ? normalizePlate(plate) : null;
}

export function normalizePlate(plate) {
  return plate.replace(/[\s-]/g, '').toUpperCase();
}
