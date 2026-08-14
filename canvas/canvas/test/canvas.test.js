'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Canvas = require('../src/Canvas');

test('creates a blank canvas of the given size, rendered with a border', () => {
  const canvas = new Canvas(5, 3);
  const expected = [
    '-------',
    '|     |',
    '|     |',
    '|     |',
    '-------',
  ].join('\n');
  assert.equal(canvas.render(), expected);
});

test('rejects a non-positive canvas size', () => {
  assert.throws(() => new Canvas(0, 5));
  assert.throws(() => new Canvas(5, -1));
});

test('draws a horizontal line', () => {
  const canvas = new Canvas(6, 4);
  canvas.drawLine(1, 2, 6, 2);
  const expected = [
    '--------',
    '|      |',
    '|xxxxxx|',
    '|      |',
    '|      |',
    '--------',
  ].join('\n');
  assert.equal(canvas.render(), expected);
});

test('draws a vertical line', () => {
  const canvas = new Canvas(6, 4);
  canvas.drawLine(6, 3, 6, 4);
  const expected = [
    '--------',
    '|      |',
    '|      |',
    '|     x|',
    '|     x|',
    '--------',
  ].join('\n');
  assert.equal(canvas.render(), expected);
});

test('draws a line regardless of endpoint order', () => {
  const canvas = new Canvas(4, 4);
  canvas.drawLine(4, 1, 1, 1);
  assert.equal(canvas.render().split('\n')[1], '|xxxx|');
});

test('rejects a diagonal line', () => {
  const canvas = new Canvas(6, 4);
  assert.throws(() => canvas.drawLine(1, 1, 3, 3), /horizontal or vertical/);
});

test('rejects out-of-bounds coordinates', () => {
  const canvas = new Canvas(6, 4);
  assert.throws(() => canvas.drawLine(0, 1, 3, 1));
  assert.throws(() => canvas.drawLine(1, 1, 7, 1));
});

test('draws a rectangle', () => {
  const canvas = new Canvas(9, 6);
  canvas.drawRectangle(3, 2, 7, 6);
  const expected = [
    '-----------',
    '|         |',
    '|  xxxxx  |',
    '|  x   x  |',
    '|  x   x  |',
    '|  x   x  |',
    '|  xxxxx  |',
    '-----------',
  ].join('\n');
  assert.equal(canvas.render(), expected);
});

test('rejects a rectangle with corners in the wrong order', () => {
  const canvas = new Canvas(9, 6);
  assert.throws(() => canvas.drawRectangle(7, 6, 3, 2));
});

test('bucket fill flood-fills a fully enclosed region', () => {
  const canvas = new Canvas(9, 6);
  canvas.drawRectangle(3, 2, 7, 6);
  canvas.bucketFill(5, 4, 'o');
  const rendered = canvas.render().split('\n');
  // Interior cells became 'o'; the rectangle border of 'x' is untouched.
  assert.match(rendered[2], /^\|  xxxxx  \|$/);
  assert.match(rendered[3], /^\|  xooox  \|$/);
  assert.match(rendered[6], /^\|  xxxxx  \|$/);
});

test('bucket fill on the exterior only fills outside the shape', () => {
  const canvas = new Canvas(9, 6);
  canvas.drawRectangle(3, 2, 7, 6);
  canvas.bucketFill(1, 1, '-');
  const rendered = canvas.render().split('\n');
  // Interior stays blank; exterior blanks become '-'
  assert.match(rendered[1], /^\|---------\|$/);
  assert.match(rendered[2], /^\|--xxxxx--\|$/);
});

test('bucket fill does nothing if target already matches colour', () => {
  const canvas = new Canvas(4, 4);
  const before = canvas.render();
  canvas.bucketFill(2, 2, ' ');
  assert.equal(canvas.render(), before);
});

test('bucket fill rejects out-of-bounds start point', () => {
  const canvas = new Canvas(4, 4);
  assert.throws(() => canvas.bucketFill(0, 0, 'x'));
});

test('bucket fill rejects multi-character colours', () => {
  const canvas = new Canvas(4, 4);
  assert.throws(() => canvas.bucketFill(1, 1, 'ab'));
});
