import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

// Dynamically load detectRTL function from slides.html
function loadDetectRTL() {
  const htmlPath = path.resolve('slides.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const match = htmlContent.match(/function\s+detectRTL\s*\([^)]*\)\s*\{[\s\S]*?\n\s*\}/);
  if (!match) {
    throw new Error('detectRTL function definition not found in slides.html');
  }
  return new Function(`${match[0]}; return detectRTL;`)();
}

const detectRTL = loadDetectRTL();

test('detectRTL - English / LTR text', () => {
  assert.equal(detectRTL('Hello World'), false);
  assert.equal(detectRTL('The Art of Deep Focus'), false);
  assert.equal(detectRTL('1234567890'), false);
  assert.equal(detectRTL('https://example.com'), false);
});

test('detectRTL - Persian text', () => {
  assert.equal(detectRTL('سلام دنیا'), true);
  assert.equal(detectRTL('رازهای کوچک آرامش در زندگی مدرن'), true);
  assert.equal(detectRTL('اینستااسلاید - سازنده اسلایدهای متنی'), true);
});

test('detectRTL - Arabic text', () => {
  assert.equal(detectRTL('مرحبا بك'), true);
  assert.equal(detectRTL('اللغة العربية'), true);
  assert.equal(detectRTL('بسم الله الرحمن الرحيم'), true);
});

test('detectRTL - Emojis, numbers, and punctuation only', () => {
  assert.equal(detectRTL('🚀✨🔥👍'), false);
  assert.equal(detectRTL('!@#$%^&*()_+-=[]{}|;:\'",.<>?/'), false);
  assert.equal(detectRTL('12345 !@# 🚀'), false);
});

test('detectRTL - Empty strings and whitespace', () => {
  assert.equal(detectRTL(''), false);
  assert.equal(detectRTL('   '), false);
  assert.equal(detectRTL('\n\t\r'), false);
});

test('detectRTL - Mixed LTR and RTL text', () => {
  assert.equal(detectRTL('Hello سلام'), true);
  assert.equal(detectRTL('سلام Hello'), true);
  assert.equal(detectRTL('Version 1.0 نسخه اولیه'), true);
});

test('detectRTL - Unicode ranges coverage', () => {
  // \u0600-\u06FF (Arabic)
  assert.equal(detectRTL('\u0627'), true, 'Arabic range U+0627');
  // \u0750-\u077F (Arabic Supplement)
  assert.equal(detectRTL('\u0750'), true, 'Arabic Supplement U+0750');
  // \u08A0-\u08FF (Arabic Extended-A)
  assert.equal(detectRTL('\u08A0'), true, 'Arabic Extended-A U+08A0');
  // \uFB50-\uFDFF (Arabic Presentation Forms-A)
  assert.equal(detectRTL('\uFB50'), true, 'Arabic Presentation Forms-A U+FB50');
  // \uFE70-\uFEFF (Arabic Presentation Forms-B)
  assert.equal(detectRTL('\uFE70'), true, 'Arabic Presentation Forms-B U+FE70');

  // Non-RTL Unicode samples
  assert.equal(detectRTL('\u0041'), false, 'Latin A U+0041');
  assert.equal(detectRTL('\u0410'), false, 'Cyrillic А U+0410');
  assert.equal(detectRTL('\u4E00'), false, 'CJK U+4E00');
});
