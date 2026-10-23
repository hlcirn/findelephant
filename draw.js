const W = 1920;
const H = 1071;
const LINE_Y = H * 0.737;

function makeRandom(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function edgePoint(dx, dy) {
  if (dx === 1) return [W + 10, LINE_Y];
  if (dx === -1) return [-10, LINE_Y];
  if (dy === 1) return [W / 2, H + 10];
  return [W / 2, -10];
}

function linePath(rand, from, to) {
  let cx = W / 2;
  let cy = LINE_Y;
  let c1 = [
    from[0] + (cx - from[0]) * 0.55 + (rand() - 0.5) * W * 0.08,
    from[1] + (cy - from[1]) * 0.55 + (rand() - 0.5) * H * 0.12,
  ];
  let c2 = [
    to[0] + (cx - to[0]) * 0.55 + (rand() - 0.5) * W * 0.08,
    to[1] + (cy - to[1]) * 0.55 + (rand() - 0.5) * H * 0.12,
  ];
  let n = v => v.toFixed(1);
  return 'M' + n(from[0]) + ' ' + n(from[1]) +
         ' C' + n(c1[0]) + ' ' + n(c1[1]) +
         ' ' + n(c2[0]) + ' ' + n(c2[1]) +
         ' ' + n(to[0]) + ' ' + n(to[1]);
}

function drawRoom(seed, rope, dots) {
  let rand = makeRandom(seed);
  let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice">';
  svg += '<rect width="' + W + '" height="' + H + '" fill="#fff"/>';
  if (rope) {
    let d = linePath(rand, edgePoint(rope[0][0], rope[0][1]), edgePoint(rope[1][0], rope[1][1]));
    svg += '<path d="' + d + '" fill="none" stroke="#1d1d1d" stroke-width="5" stroke-linecap="round"/>';
  }
  if (dots) {
    for (let t of dots) {
      let x = W / 2 + (rand() - 0.5) * W * 0.06;
      let y = t * H;
      svg += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (H * 0.032).toFixed(1) + '" fill="#c0281f"/>';
    }
  }
  svg += '</svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}
