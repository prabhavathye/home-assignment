'use strict';

const readline = require('readline');
const Canvas = require('./Canvas');

const HELP_TEXT = [
  'Commands:',
  '  C w h          Create a new canvas of width w and height h',
  '  L x1 y1 x2 y2  Draw a horizontal or vertical line',
  '  R x1 y1 x2 y2  Draw a rectangle (upper-left to lower-right)',
  '  B x y c        Bucket-fill the area connected to (x,y) with colour c',
  '  Q              Quit',
].join('\n');

function parseInt10(token) {
  if (!/^-?\d+$/.test(token)) return NaN;
  return parseInt(token, 10);
}

/**
 * Parses a raw input line into a command object, or throws with a helpful message.
 */
function parseCommand(line) {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;

  const op = tokens[0].toUpperCase();

  switch (op) {
    case 'C': {
      if (tokens.length !== 3) throw new Error('Usage: C w h');
      const w = parseInt10(tokens[1]);
      const h = parseInt10(tokens[2]);
      if (Number.isNaN(w) || Number.isNaN(h)) throw new Error('Width and height must be integers');
      return { op, w, h };
    }
    case 'L': {
      if (tokens.length !== 5) throw new Error('Usage: L x1 y1 x2 y2');
      const [x1, y1, x2, y2] = tokens.slice(1).map(parseInt10);
      if ([x1, y1, x2, y2].some(Number.isNaN)) throw new Error('Coordinates must be integers');
      return { op, x1, y1, x2, y2 };
    }
    case 'R': {
      if (tokens.length !== 5) throw new Error('Usage: R x1 y1 x2 y2');
      const [x1, y1, x2, y2] = tokens.slice(1).map(parseInt10);
      if ([x1, y1, x2, y2].some(Number.isNaN)) throw new Error('Coordinates must be integers');
      return { op, x1, y1, x2, y2 };
    }
    case 'B': {
      if (tokens.length !== 4) throw new Error('Usage: B x y c');
      const x = parseInt10(tokens[1]);
      const y = parseInt10(tokens[2]);
      const c = tokens[3];
      if ([x, y].some(Number.isNaN)) throw new Error('Coordinates must be integers');
      if (c.length !== 1) throw new Error('Colour must be a single character');
      return { op, x, y, c };
    }
    case 'Q':
      if (tokens.length !== 1) throw new Error('Usage: Q');
      return { op };
    case 'HELP':
    case '?':
      return { op: 'HELP' };
    default:
      throw new Error(`Unknown command "${tokens[0]}". Type HELP for a list of commands.`);
  }
}

function main() {
  let canvas = null;

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });

  console.log('Canvas drawing program. Type HELP for commands, Q to quit.');
  process.stdout.write('enter command: ');

  rl.on('line', (line) => {
    let command;
    try {
      command = parseCommand(line);
    } catch (err) {
      console.log(`Error: ${err.message}`);
      process.stdout.write('enter command: ');
      return;
    }

    if (command === null) {
      process.stdout.write('enter command: ');
      return;
    }

    try {
      switch (command.op) {
        case 'HELP':
          console.log(HELP_TEXT);
          break;
        case 'C':
          canvas = new Canvas(command.w, command.h);
          console.log(canvas.render());
          break;
        case 'L':
          if (!canvas) throw new Error('Please create a canvas first using C w h');
          canvas.drawLine(command.x1, command.y1, command.x2, command.y2);
          console.log(canvas.render());
          break;
        case 'R':
          if (!canvas) throw new Error('Please create a canvas first using C w h');
          canvas.drawRectangle(command.x1, command.y1, command.x2, command.y2);
          console.log(canvas.render());
          break;
        case 'B':
          if (!canvas) throw new Error('Please create a canvas first using C w h');
          canvas.bucketFill(command.x, command.y, command.c);
          console.log(canvas.render());
          break;
        case 'Q':
          console.log('Bye!');
          rl.close();
          return;
        default:
          break;
      }
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }

    process.stdout.write('enter command: ');
  });

  rl.on('close', () => {
    process.exit(0);
  });
}

main();
