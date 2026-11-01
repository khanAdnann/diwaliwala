/**
 * Utility helpers for downloading high-resolution PNGs, sharing via WhatsApp,
 * and copying festive messages to the clipboard.
 */

export function downloadDataUrlAsPng(dataUrl, filename = 'diwaliwala-creation.png') {
  if (!dataUrl) {
    throw new Error('No image data available to download.');
  }
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function shareViaWhatsApp(text) {
  const cleanText = text?.trim() || '🪔 Wishing you and your family a joyous and prosperous Happy Diwali! ✨';
  const encoded = encodeURIComponent(cleanText);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}

export async function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  // Fallback for non-HTTPS local testing
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    return true;
  } finally {
    document.body.removeChild(textArea);
  }
}

