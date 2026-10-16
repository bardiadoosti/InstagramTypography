import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

test('slides.html - no unsafe innerHTML concatenation with slide user text in renderThumbnails or openGridViewModal', () => {
  const htmlPath = path.resolve('slides.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  // Verify renderThumbnails does not assign user snippet directly into innerHTML string template
  const renderThumbnailsMatch = htmlContent.match(/function renderThumbnails\s*\(\)\s*\{[\s\S]*?\n    \}/);
  assert.ok(renderThumbnailsMatch, 'renderThumbnails function should be found');
  assert.equal(
    renderThumbnailsMatch[0].includes('thumb.innerHTML = `'),
    false,
    'renderThumbnails should not use innerHTML string interpolation'
  );
  assert.ok(
    renderThumbnailsMatch[0].includes('.textContent ='),
    'renderThumbnails should use textContent to safely render snippet'
  );

  // Verify openGridViewModal does not assign slide text directly into innerHTML string template
  const openGridViewModalMatch = htmlContent.match(/function openGridViewModal\s*\(\)\s*\{[\s\S]*?\n    \}/);
  assert.ok(openGridViewModalMatch, 'openGridViewModal function should be found');
  assert.equal(
    openGridViewModalMatch[0].includes('card.innerHTML = `'),
    false,
    'openGridViewModal should not use innerHTML string interpolation'
  );
  assert.ok(
    openGridViewModalMatch[0].includes('.textContent = text') || openGridViewModalMatch[0].includes('.textContent ='),
    'openGridViewModal should use textContent to safely render slide text'
  );
});
