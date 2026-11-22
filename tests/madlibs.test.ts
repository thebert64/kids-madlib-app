import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WORD_HINTS, cleanWord, fillTemplate, parseBlanks, segmentsToText } from '../lib/madlibs.ts';
import { MADLIB_TEMPLATES, getTemplate } from '../lib/madlibTemplates.ts';

test('parseBlanks finds blanks in order and normalizes kinds', () => {
  assert.deepEqual(parseBlanks('A {Adjective} {animal} ate { food }.'), ['adjective', 'animal', 'food']);
  assert.deepEqual(parseBlanks('No blanks here.'), []);
});

test('fillTemplate places words and keeps surrounding text', () => {
  const segments = fillTemplate('A {adjective} {animal}!', ['sparkly', 'llama']);
  assert.equal(segmentsToText(segments), 'A sparkly llama!');
  assert.deepEqual(
    segments.filter((s) => s.type === 'word').map((s) => (s.type === 'word' ? [s.kind, s.index] : null)),
    [['adjective', 0], ['animal', 1]]
  );
});

test('fillTemplate shows a placeholder for missing words', () => {
  assert.equal(segmentsToText(fillTemplate('{noun} and {noun}', ['cat'])), 'cat and ___');
});

test('cleanWord trims, collapses spaces and rejects bad input', () => {
  assert.equal(cleanWord('  big   red  '), 'big red');
  assert.equal(cleanWord('   '), null);
  assert.equal(cleanWord(42), null);
  assert.equal(cleanWord('x'.repeat(41)), null);
});

test('every template has unique ids, blanks, and only known word kinds', () => {
  const ids = new Set(MADLIB_TEMPLATES.map((t) => t.id));
  assert.equal(ids.size, MADLIB_TEMPLATES.length);
  for (const template of MADLIB_TEMPLATES) {
    const blanks = parseBlanks(template.text);
    assert.ok(blanks.length >= 5, `${template.id} needs at least 5 blanks`);
    for (const kind of blanks) {
      assert.ok(WORD_HINTS[kind], `${template.id} uses unknown kind "${kind}"`);
    }
    assert.ok(!/[{}]/.test(template.title), `${template.id} title must not contain blanks`);
  }
});

test('getTemplate looks up by id', () => {
  assert.equal(getTemplate('zoo-day')?.title, 'A Wild Day at the Zoo');
  assert.equal(getTemplate('nope'), undefined);
  assert.equal(getTemplate(null), undefined);
});
