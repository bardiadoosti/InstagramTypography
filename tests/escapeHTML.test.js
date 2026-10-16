import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

function loadEscapeHTML() {
  const htmlPath = path.resolve('story.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const match = htmlContent.match(/function\s+escapeHTML\s*\([^)]*\)\s*\{[\s\S]*?\n\s*\}/);
  if (!match) {
    throw new Error('escapeHTML function definition not found in story.html');
  }
  return new Function(`${match[0]}; return escapeHTML;`)();
}

const escapeHTML = loadEscapeHTML();

test('escapeHTML - basic special characters', () => {
  assert.equal(escapeHTML('foo & bar'), 'foo &amp; bar');
  assert.equal(escapeHTML('5 < 10'), '5 &lt; 10');
  assert.equal(escapeHTML('10 > 5'), '10 &gt; 5');
  assert.equal(escapeHTML('he said "hello"'), 'he said &quot;hello&quot;');
  assert.equal(escapeHTML("it's cool"), 'it&#39;s cool');
});

test('escapeHTML - XSS payloads', () => {
  assert.equal(
    escapeHTML('<script>alert("xss")</script>'),
    '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
  );
  assert.equal(
    escapeHTML('"><img src=x onerror=alert(1)>'),
    '&quot;&gt;&lt;img src=x onerror=alert(1)&gt;'
  );
  assert.equal(
    escapeHTML("'><svg/onload=alert(1)>"),
    '&#39;&gt;&lt;svg/onload=alert(1)&gt;'
  );
});

test('escapeHTML - normal strings and edge cases', () => {
  assert.equal(escapeHTML('Hello World'), 'Hello World');
  assert.equal(escapeHTML('متن فارسی'), 'متن فارسی');
  assert.equal(escapeHTML(''), '');
  assert.equal(escapeHTML(null), '');
  assert.equal(escapeHTML(undefined), '');
  assert.equal(escapeHTML(123), '');
});
