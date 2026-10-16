import fs from 'node:fs';
import path from 'node:path';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

const htmlContent = fs.readFileSync(path.resolve('story.html'), 'utf8');

const match = htmlContent.match(/async function loadSavedCustomFonts\(\) \{[\s\S]*?\n    \}/);

if (!match) {
  throw new Error('loadSavedCustomFonts function not found in story.html');
}

const functionCode = match[0];

describe('loadSavedCustomFonts in story.html', () => {
  test('restores custom fonts concurrently and handles partial failures', async () => {
    const loadedFontFaces = [];
    const loadCallOrder = [];

    class MockFontFace {
      constructor(family, buffer) {
        this.family = family;
        this.buffer = buffer;
      }
      async load() {
        loadCallOrder.push(this.family);
        if (this.family === 'FailFont') {
          throw new Error('Simulated load error');
        }
        return this;
      }
    }

    const mockFonts = [];
    const mockDocumentFonts = {
      add(fontFace) {
        loadedFontFaces.push(fontFace);
      }
    };

    const mockStoredFonts = [
      { id: '1', name: 'Font One', family: 'FontOne', buffer: new ArrayBuffer(8) },
      { id: '2', name: 'Font Failure', family: 'FailFont', buffer: new ArrayBuffer(8) },
      { id: '3', name: 'Font Three', family: 'FontThree', buffer: new ArrayBuffer(8) }
    ];

    let renderFontsListCalled = false;
    let renderCanvasCalled = false;

    function renderFontsList() {
      renderFontsListCalled = true;
    }

    function renderCanvas() {
      renderCanvasCalled = true;
    }

    function openDatabase() {
      return Promise.resolve({
        transaction: () => ({
          objectStore: () => ({
            getAll: () => {
              const req = {
                result: mockStoredFonts,
                onsuccess: null,
                onerror: null
              };
              setTimeout(() => {
                if (req.onsuccess) req.onsuccess();
              }, 0);
              return req;
            }
          })
        })
      });
    }

    const context = {
      openDatabase,
      STORE_NAME: 'custom_fonts',
      FontFace: MockFontFace,
      document: { fonts: mockDocumentFonts },
      customFonts: mockFonts,
      renderFontsList,
      renderCanvas,
      console: { warn: () => {} }
    };

    const fn = new Function(
      'openDatabase',
      'STORE_NAME',
      'FontFace',
      'document',
      'customFonts',
      'renderFontsList',
      'renderCanvas',
      'console',
      `${functionCode}; return loadSavedCustomFonts;`
    )(
      context.openDatabase,
      context.STORE_NAME,
      context.FontFace,
      context.document,
      context.customFonts,
      context.renderFontsList,
      context.renderCanvas,
      context.console
    );

    await fn();

    assert.equal(renderFontsListCalled, true, 'renderFontsList should be called');
    assert.equal(renderCanvasCalled, true, 'renderCanvas should be called');
    assert.equal(mockFonts.length, 2, 'Only successful fonts should be in customFonts');
    assert.equal(mockFonts[0].family, 'FontOne');
    assert.equal(mockFonts[1].family, 'FontThree');
    assert.equal(loadedFontFaces.length, 2, 'Two fonts added to document.fonts');
  });
});
