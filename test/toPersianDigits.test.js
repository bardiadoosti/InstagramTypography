const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

function getToPersianDigits() {
  const htmlPath = path.join(__dirname, '..', 'slides.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const match = htmlContent.match(/function toPersianDigits\s*\([^)]*\)\s*\{[\s\S]*?\n    \}/);
  if (!match) {
    throw new Error('Could not find toPersianDigits function definition in slides.html');
  }
  return new Function(`return ${match[0]}`)();
}

const toPersianDigits = getToPersianDigits();

test('toPersianDigits - null and undefined inputs', () => {
  assert.equal(toPersianDigits(null), '');
  assert.equal(toPersianDigits(undefined), '');
});

test('toPersianDigits - basic English digit conversion', () => {
  assert.equal(toPersianDigits('0123456789'), '۰۱۲۳۴۵۶۷۸۹');
  assert.equal(toPersianDigits('123'), '۱۲۳');
  assert.equal(toPersianDigits('0'), '۰');
});

test('toPersianDigits - numeric inputs (numbers)', () => {
  assert.equal(toPersianDigits(123), '۱۲۳');
  assert.equal(toPersianDigits(0), '۰');
  assert.equal(toPersianDigits(42.5), '۴۲.۵');
});

test('toPersianDigits - mixed text and digits', () => {
  assert.equal(toPersianDigits('Slide 1 of 5'), 'Slide ۱ of ۵');
  assert.equal(toPersianDigits('اسلاید ۱ از ۵'), 'اسلاید ۱ از ۵');
  assert.equal(toPersianDigits('Hello 2026 World!'), 'Hello ۲۰۲۶ World!');
});

test('toPersianDigits - non-digit strings and empty strings', () => {
  assert.equal(toPersianDigits(''), '');
  assert.equal(toPersianDigits('Hello World'), 'Hello World');
  assert.equal(toPersianDigits('متن بدون عدد'), 'متن بدون عدد');
});

test('toPersianDigits - already Persian/Arabic digits', () => {
  assert.equal(toPersianDigits('۰۱۲۳۴۵۶۷۸۹'), '۰۱۲۳۴۵۶۷۸۹');
});
