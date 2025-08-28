// Test script to check environment values
import { env } from '../src/lib/env.js';

console.log('Environment values:');
console.log('OCR Provider:', env.ocr.provider);
console.log('Mistral API Key:', env.ocr.mistral.apiKey);
console.log('Mistral API Key type:', typeof env.ocr.mistral.apiKey);
console.log('Mistral API Key length:', env.ocr.mistral.apiKey?.length);
console.log('Is empty string?', env.ocr.mistral.apiKey === '');
console.log('Is undefined?', env.ocr.mistral.apiKey === undefined);
