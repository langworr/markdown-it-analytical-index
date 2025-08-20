import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert';
import markdownit from 'markdown-it';
import testgen from 'markdown-it-testgen';

// importa sempre dal bundle già compilato
import analyticalIndex from '../dist/analytical-index.esm.js';

// funzione di utilità per generare i test dai fixture
function generate(fixturePath, md, env) {
  testgen.load(fixturePath, {}, function (data) {
    data.meta = data.meta || {};
    const desc = data.meta.desc || path.relative(fixturePath, data.file);

    (data.meta.skip ? describe.skip : describe)(desc, function () {
      data.fixtures.forEach(function (fixture) {
        it('line ' + (fixture.first.range[0] - 1), function () {
          assert.strictEqual(
            md.render(fixture.first.text, { ...(env || {}) }),
            fixture.second.text.replace(/\u21a9(?!\ufe0e)/g, '\u21a9\ufe0e')
          );
        });
      });
    });
  });
}

describe('analyticalIndex.txt', function () {
  const md = markdownit().use(analyticalIndex);
  const fixturesPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    'fixtures',
    'analyticalIndex.txt'
  );
  generate(fixturesPath, md);
});

describe('custom docId in env', function () {
  const md = markdownit().use(analyticalIndex);
  const fixturesPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    'fixtures',
    'analyticalIndex-prefixed.txt'
  );
  generate(fixturesPath, md, { docId: 'test-doc-id' });
});
