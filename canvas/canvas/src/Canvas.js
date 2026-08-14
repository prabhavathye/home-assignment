'use strict';

/**
 * Canvas represents a 2D drawing surface addressed with 1-based coordinates,
 * where (1,1) is the top-left cell, x grows to the right and y grows downward.
 */
class Canvas {
  constructor(width, height) {
    if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
      throw new Error('Width and height must be positive integers');
    }
    this.width = width;
    this.height = height;
    this.grid = Array.from({ length: height }, () => Array(width).fill(' '));
  }

  isInBounds(x, y) {
    return Number.isInteger(x) && Number.isInteger(y) &&
      x >= 1 && x <= this.width && y >= 1 && y <= this.height;
  }

  _assertInBounds(x, y) {
    if (!this.isInBounds(x, y)) {
      throw new Error(`Point (${x},${y}) is outside the canvas (1..${this.width}, 1..${this.height})`);
    }
  }

  _set(x, y, char) {
    this.grid[y - 1][x - 1] = char;
  }

  _get(x, y) {
    return this.grid[y - 1][x - 1];
  }

  /**
   * Draws a horizontal or vertical line between two points using 'x'.
   */
  drawLine(x1, y1, x2, y2) {
    this._assertInBounds(x1, y1);
    this._assertInBounds(x2, y2);

    if (x1 !== x2 && y1 !== y2) {
      throw new Error('Only horizontal or vertical lines are supported');
    }

    if (x1 === x2) {
      const yStart = Math.min(y1, y2);
      const yEnd = Math.max(y1, y2);
      for (let y = yStart; y <= yEnd; y++) this._set(x1, y, 'x');
    } else {
      const xStart = Math.min(x1, x2);
      const xEnd = Math.max(x1, x2);
      for (let x = xStart; x <= xEnd; x++) this._set(x, y1, 'x');
    }
  }

  /**
   * Draws a rectangle given its upper-left (x1,y1) and lower-right (x2,y2) corners.
   */
  drawRectangle(x1, y1, x2, y2) {
    this._assertInBounds(x1, y1);
    this._assertInBounds(x2, y2);

    if (x1 > x2 || y1 > y2) {
      throw new Error('Upper-left corner must be above and to the left of the lower-right corner');
    }

    this.drawLine(x1, y1, x2, y1); // top edge
    this.drawLine(x1, y2, x2, y2); // bottom edge
    this.drawLine(x1, y1, x1, y2); // left edge
    this.drawLine(x2, y1, x2, y2); // right edge
  }

  /**
   * Flood-fills the region connected to (x,y) with the given colour character,
   * matching the "bucket fill" behaviour of paint programs (4-directional fill).
   */
  bucketFill(x, y, colour) {
    this._assertInBounds(x, y);
    if (typeof colour !== 'string' || colour.length !== 1) {
      throw new Error('Colour must be a single character');
    }

    const target = this._get(x, y);
    if (target === colour) return;

    const stack = [[x, y]];
    while (stack.length > 0) {
      const [cx, cy] = stack.pop();
      if (!this.isInBounds(cx, cy)) continue;
      if (this._get(cx, cy) !== target) continue;

      this._set(cx, cy, colour);
      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }
  }

  /**
   * Renders the canvas as a bordered ASCII rectangle.
   */
  render() {
    const border = '-'.repeat(this.width + 2);
    const rows = this.grid.map((row) => '|' + row.join('') + '|');
    return [border, ...rows, border].join('\n');
  }
}

module.exports = Canvas;
