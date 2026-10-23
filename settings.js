const SIZE = 5;

const ROPE_PATH = [
  [0, 0], [1, 0], [2, 0],
  [2, 1], [2, 2],
  [1, 2], [1, 3], [1, 4],
  [2, 4], [3, 4], [4, 4],
  [4, 3], [3, 3],
];

const PHOTOS = [
  { x: 0, y: 0, src: 'images/start-triangle.webp' },
  { x: 3, y: 3, src: 'images/goal-lying-elephant.webp' },
  { x: 4, y: 0, src: 'images/standing-red-elephant.webp' },
  { x: 0, y: 4, src: 'images/white-paper-elephant.webp' },
];

const DOT_PATH = [[0, 1], [0, 2], [0, 3]];
const DOT_COUNT = 8;

const MAZE_SEED = 2026;

const SCROLL_AMOUNT = 60;
