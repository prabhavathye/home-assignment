# Canvas

A simple command-line drawing program. Runs entirely in memory — every fresh
run of `start.sh` starts with a clean slate, nothing is persisted.

## Running

```
./start.sh
```

This launches an interactive prompt. No install step is required — the
program uses only Node.js's standard library (`node >= 18`).

You can also pipe a script of commands in non-interactively:

```
printf 'C 20 4\nL 1 2 6 2\nL 6 3 6 4\nR 14 1 18 3\nB 10 3 o\nQ\n' | ./start.sh
```

## Commands

| Command       | Description                                                                 |
|---------------|-------------------------------------------------------------------------------|
| `C w h`         | Create a new canvas of width `w` and height `h`                             |
| `L x1 y1 x2 y2` | Draw a horizontal or vertical line from `(x1,y1)` to `(x2,y2)` using `x`     |
| `R x1 y1 x2 y2` | Draw a rectangle with upper-left `(x1,y1)` and lower-right `(x2,y2)` using `x` |
| `B x y c`       | Bucket-fill the region connected to `(x,y)` with colour character `c`       |
| `Q`             | Quit                                                                         |

Coordinates are 1-based; `(1,1)` is the top-left cell of the canvas.

## Project layout

```
start.sh          Executable entry point
src/Canvas.js      Core drawing logic (canvas state, line/rect/fill, render)
src/index.js       CLI: reads commands from stdin, dispatches, prints the canvas
test/canvas.test.js  Unit tests for src/Canvas.js
```

## Tests

```
npm test
```

Runs the unit test suite (using Node's built-in test runner — no extra
dependencies needed).

## Design notes

- **State**: the canvas is held in memory as a 2D array of single characters.
  Nothing is written to disk, so each process start is guaranteed clean.
- **Lines**: only horizontal and vertical lines are supported, per the
  requirements; a diagonal request is rejected with an error rather than
  silently drawn incorrectly.
- **Rectangles**: implemented by drawing four lines (reusing the line logic),
  which keeps the corner-overlap behaviour consistent with `L`.
- **Bucket fill**: an iterative 4-directional flood fill (stack-based, so it
  won't blow the call stack on large canvases). It fills the connected region
  matching the character at the start point, mirroring typical paint-tool
  behaviour.
- **CLI vs. core logic**: `Canvas.js` has no knowledge of stdin/stdout, so it
  can be unit-tested directly and reused by a different UI (e.g. a future
  browser front-end) without change.
