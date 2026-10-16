import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

function getEscapeHtml() {
  const htmlPath = path.resolve('slides.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const match = htmlContent.match(/function escapeHtml\s*\([^)]*\)\s*\{[\s\S]*?\n    \}/);
  if (!match) {
    throw new Error('Could not find escapeHtml function definition in slides.html');
  }
  return new Function(`return ${match[0]}`)();
}

const escapeHtml = getEscapeHtml();

test('escapeHtml - null, undefined, and empty input', () => {
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(undefined), '');
  assert.equal(escapeHtml(''), '');
});

test('escapeHtml - standard string without HTML', () => {
  assert.equal(escapeHtml('Hello World'), 'Hello World');
  assert.equal(escapeHtml('سلام دنیا'), 'سلام دنیا');
});

test('escapeHtml - escapes HTML tags and special characters', () => {
  assert.equal(escapeHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  assert.equal(escapeHtml("'<img src=x onerror=alert(1)>'"), '&#39;&lt;img src=x onerror=alert(1)&gt;&#39;');
  assert.equal(escapeHtml('a & b'), 'a &amp; b');
});

test('escapeHtml - handles numbers and booleans safely', () => {
  assert.equal(escapeHtml(123), '123');
  assert.equal(escapeHtml(0), '0');
  assert.equal(escapeHtml(true), 'true');
});
