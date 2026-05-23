
function blobToImageBitmap(blob) { return createImageBitmap(blob); }

async function compressBlobWithCanvas(blob, opts) {
  const { maxEdge = 1280, quality = 0.7, format = "image/jpeg" } = opts || {};
  const bmp = await blobToImageBitmap(blob);
  let { width, height } = bmp;
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  const outW = Math.max(1, Math.round(width * scale));
  const outH = Math.max(1, Math.round(height * scale));

  let canvas, ctx;
  if (typeof OffscreenCanvas !== "undefined") {
    canvas = new OffscreenCanvas(outW, outH);
    ctx = canvas.getContext("2d", { alpha: false });
  } else {
    canvas = Object.assign(document.createElement("canvas"), { width: outW, height: outH });
    ctx = canvas.getContext("2d", { alpha: false });
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, outW, outH);
  ctx.drawImage(bmp, 0, 0, outW, outH);

  const type = format || "image/jpeg";
  const q = typeof quality === "number" ? Math.min(Math.max(quality, 0.1), 0.95) : 0.7;

  const blobOut = await new Promise((resolve) => {
    if (canvas.convertToBlob) {
      canvas.convertToBlob({ type, quality: q }).then(resolve);
    } else {
      canvas.toBlob(resolve, type, q);
    }
  });
  bmp.close?.();
  return blobOut;
}
self.compressBlobWithCanvas = compressBlobWithCanvas;
