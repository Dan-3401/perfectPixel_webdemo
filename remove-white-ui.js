import { removeWhite } from './remove-white-core.js';
const el = id => document.getElementById(id);
const original = el('original'), result = el('result');
const ctx = result.getContext('2d');
let source = null, current = null, name = 'pixel', loadId = 0;
const tolerance = () => Math.max(0, Math.min(100, Number(el('tolerance').value) || 0));
const color = () => el('color').value.match(/[a-f0-9]{2}/gi).map(value => parseInt(value, 16));
function show(message) { el('status').textContent = message; }
function draw() {
  ctx.putImageData(new ImageData(current, result.width, result.height), 0, 0);
  for (const canvas of [original, result]) canvas.style.width = Math.max(canvas.width, Math.min(440, canvas.width * 8)) + 'px';
}
function process() {
  if (!source) return;
  const output = removeWhite(source.data, source.width, source.height, tolerance(), el('mode').value === 'all', null, color());
  current = output.data; draw();
  show(`${source.width} × ${source.height} · 已去除 ${output.removed.toLocaleString()} 个像素。棋盘格表示透明。`);
}
async function load(url, filename) {
  const id = ++loadId;
  const image = new Image(); image.src = url;
  try {
    await image.decode();
    if (id !== loadId) return;
    if (image.width * image.height > 16000000) throw new Error('图片过大，请使用不超过 1600 万像素的图片。');
    name = filename.replace(/\.[^.]+$/, '');
    for (const canvas of [original, result]) { canvas.width = image.width; canvas.height = image.height; }
    const originalCtx = original.getContext('2d'); originalCtx.drawImage(image, 0, 0);
    source = originalCtx.getImageData(0, 0, image.width, image.height);
    el('save').disabled = el('reset').disabled = false; process();
  } catch (error) { show(`无法载入图片：${error.message}`); }
}
el('file').addEventListener('change', async event => {
  const file = event.target.files[0]; if (!file) return;
  const url = URL.createObjectURL(file);
  await load(url, file.name); URL.revokeObjectURL(url);
});
el('tolerance').addEventListener('change', process);
el('color').addEventListener('input', () => { el('color-value').textContent = el('color').value.toUpperCase(); });
el('color').addEventListener('change', process);
original.addEventListener('click', event => {
  if (!source) return;
  const bounds = original.getBoundingClientRect();
  const x = Math.max(0, Math.min(source.width - 1, Math.floor((event.clientX - bounds.left) * source.width / bounds.width)));
  const y = Math.max(0, Math.min(source.height - 1, Math.floor((event.clientY - bounds.top) * source.height / bounds.height)));
  const i = (y * source.width + x) * 4;
  if (!source.data[i + 3]) { show('该像素已经透明，请点击有颜色的背景区域。'); return; }
  el('color').value = '#' + [...source.data.slice(i, i + 3)].map(value => value.toString(16).padStart(2, '0')).join('');
  el('color-value').textContent = el('color').value.toUpperCase();
  process();
});
el('mode').addEventListener('change', process);
el('reset').addEventListener('click', process);
result.addEventListener('click', event => {
  if (!current) return;
  const bounds = result.getBoundingClientRect();
  const x = Math.min(result.width - 1, Math.floor((event.clientX - bounds.left) * result.width / bounds.width));
  const y = Math.min(result.height - 1, Math.floor((event.clientY - bounds.top) * result.height / bounds.height));
  const output = removeWhite(current, result.width, result.height, tolerance(), false, y * result.width + x, color());
  current = output.data; draw(); show(`本次补去 ${output.removed.toLocaleString()} 个像素。可点“重新处理”撤销所有补去。`);
});
el('save').addEventListener('click', () => {
  const scale = Number(el('scale').value);
  if (result.width * result.height * scale * scale > 64000000) { show('导出图片过大，请降低导出倍率。'); return; }
  const canvas = document.createElement('canvas'); canvas.width = result.width * scale; canvas.height = result.height * scale;
  const output = canvas.getContext('2d'); output.imageSmoothingEnabled = false;
  output.drawImage(result, 0, 0, canvas.width, canvas.height);
  canvas.toBlob(blob => {
    if (!blob) { show('导出失败，请降低导出倍率。'); return; }
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = `${name}-transparent-${scale}x.png`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    show(`已导出 ${canvas.width} × ${canvas.height} 透明 PNG。`);
  }, 'image/png');
});
try {
  const pending = sessionStorage.getItem('perfectPixel-remove-white');
  if (pending) { sessionStorage.removeItem('perfectPixel-remove-white'); load(pending, 'perfect-pixel.png'); }
} catch { /* File import remains available if storage is disabled. */ }
