// Four-connected flood fill preserves enclosed white details and hard pixel edges.
export function removeWhite(data, width, height, tolerance = 15, all = false, seed = null, color = [255, 255, 255]) {
  const out = new Uint8ClampedArray(data);
  const count = width * height;
  const seen = new Uint8Array(count);
  const queue = new Int32Array(count);
  let head = 0, tail = 0, removed = 0;
  const matches = (i) => out[i * 4 + 3] === 0 || (Math.abs(out[i * 4] - color[0]) <= tolerance && Math.abs(out[i * 4 + 1] - color[1]) <= tolerance && Math.abs(out[i * 4 + 2] - color[2]) <= tolerance);
  const add = (i) => { if (!seen[i] && matches(i)) { seen[i] = 1; queue[tail++] = i; } };
  if (all) { for (let i = 0; i < count; i++) add(i); }
  else if (seed !== null) { if (seed >= 0 && seed < count) add(seed); }
  else {
    for (let x = 0; x < width; x++) { add(x); add((height - 1) * width + x); }
    for (let y = 0; y < height; y++) { add(y * width); add(y * width + width - 1); }
  }
  while (head < tail) {
    const i = queue[head++];
    if (out[i * 4 + 3] !== 0) removed++;
    out[i * 4 + 3] = 0;
    if (i % width > 0) add(i - 1);
    if (i % width < width - 1) add(i + 1);
    if (i >= width) add(i - width);
    if (i < count - width) add(i + width);
  }
  return { data: out, removed };
}
