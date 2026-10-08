import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esc, paragraphs, list, document } from '../kit/html.js';

test('esc escapes html special characters and tolerates nullish', () => {
  assert.equal(esc(`<a href="x">Tom & Jerry's</a>`), '&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;');
  assert.equal(esc(undefined), '');
  assert.equal(esc(0), '0');
});

test('paragraphs splits on blank lines and escapes', () => {
  assert.equal(paragraphs('Eins\n\nZwei & drei'), '<p>Eins</p>\n<p>Zwei &amp; drei</p>');
  assert.equal(paragraphs('Nur eins', 'lead'), '<p class="lead">Nur eins</p>');
  assert.equal(paragraphs(''), '');
});

test('list renders escaped items with optional class', () => {
  assert.equal(list(['a', '<b>'], 'x'), '<ul class="x"><li>a</li><li>&lt;b&gt;</li></ul>');
  assert.equal(list(['a']), '<ul><li>a</li></ul>');
});

test('document renders a full html page', () => {
  const html = document({ lang: 'de', title: 'T', description: 'D', body: '<main></main>' });
  assert.match(html, /^<!doctype html>\n<html lang="de">/);
  assert.match(html, /<meta charset="utf-8">/);
  assert.match(html, /<title>T<\/title>/);
  assert.match(html, /<meta name="description" content="D">/);
  assert.match(html, /<body class="">\n<main><\/main>/);
});
