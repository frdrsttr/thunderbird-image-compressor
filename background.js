
function isImageAttachment(att) {
  const ct = (att.contentType || "").toLowerCase();
  const name = (att.name || "").toLowerCase();
  return /^image\/(jpeg|jpg|png|webp)$/.test(ct) || /\.(jpe?g|png|webp)$/i.test(name);
}

async function getAttachments(tabId) {
  if (browser.compose.listAttachments) {
    return await browser.compose.listAttachments(tabId);
  }
  const details = await browser.compose.getComposeDetails(tabId);
  return details.attachments || [];
}

browser.composeAction.onClicked.addListener(async (tab) => {
  const tabId = tab.id;
  const atts = await getAttachments(tabId);
  const images = atts.filter(isImageAttachment);
  if (!images.length) return;

  const defaults = { maxEdge: 1280, quality: 0.7, format: "image/jpeg" };

  for (const att of images) {
    try {
      const srcBlob = await browser.compose.getAttachmentFile(att.id);
      if (!srcBlob || !srcBlob.size) continue;

      const outBlob = await compressBlobWithCanvas(srcBlob, defaults);
      const base = (att.name || "image").replace(/\.(jpe?g|png|webp)$/i, "");

      const newFile = new File([outBlob], base + ".jpg", { type: "image/jpeg" });

      await browser.compose.addAttachment(tabId, { file: newFile, name: newFile.name });
      await browser.compose.removeAttachment(tabId, att.id);
    } catch (e) {
      console.error("Replace error:", att?.name, e);
    }
  }
});
