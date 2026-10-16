import fs from 'node:fs';
import path from 'node:path';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Read music.html
const htmlContent = fs.readFileSync(path.resolve('music.html'), 'utf8');

// Extract formatTime function from music.html
const formatTimeMatch = htmlContent.match(/function formatTime\(totalSeconds\) \{[\s\S]*?\n    \}/);

if (!formatTimeMatch) {
  throw new Error('formatTime function not found in music.html');
}

const formatTimeSrc = formatTimeMatch[0];
const formatTime = new Function(`${formatTimeSrc}; return formatTime;`)();

describe('formatTime utility function in music.html', () => {
  test('formats 0 seconds correctly as 0:00', () => {
    assert.equal(formatTime(0), '0:00');
  });

  test('formats single digit seconds with leading zero', () => {
    assert.equal(formatTime(5), '0:05');
    assert.equal(formatTime(9), '0:09');
  });

  test('formats double digit seconds under a minute', () => {
    assert.equal(formatTime(10), '0:10');
    assert.equal(formatTime(59), '0:59');
  });

  test('formats exactly one minute', () => {
    assert.equal(formatTime(60), '1:00');
  });

  test('formats multiple minutes and seconds', () => {
    assert.equal(formatTime(65), '1:05');
    assert.equal(formatTime(125), '2:05');
    assert.equal(formatTime(3599), '59:59');
    assert.equal(formatTime(3600), '60:00');
  });

  test('handles floating point input by flooring', () => {
    assert.equal(formatTime(65.7), '1:05');
    assert.equal(formatTime(0.99), '0:00');
  });

  test('handles negative inputs by clamping to 0', () => {
    assert.equal(formatTime(-5), '0:00');
    assert.equal(formatTime(-0.5), '0:00');
  });
});
