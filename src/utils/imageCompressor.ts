/**
 * Compresses an image file with proper aspect ratio and hardware decoding
 * Prevents black bars, half-black artifacts, and orientation distortion
 */
export async function compressImageToBase64(
  file: File,
  maxWidth = 720,
  maxHeight = 960,
  quality = 0.75
): Promise<string> {
  // Gracefully handle if caller passed (file, maxWidth, quality)
  if (maxHeight <= 1 && quality === 0.75) {
    quality = maxHeight;
    maxHeight = 960;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Failed to read image file'));
        return;
      }

      const img = new Image();
      img.src = dataUrl;

      const onImageReady = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Preserve aspect ratio within maxWidth and maxHeight bounds
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Try image/webp first for small KB, then image/jpeg
        try {
          const webpUrl = canvas.toDataURL('image/webp', quality);
          if (webpUrl && webpUrl.startsWith('data:image/webp')) {
            resolve(webpUrl);
            return;
          }
        } catch {
          // fallback
        }

        try {
          const jpegUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(jpegUrl);
        } catch {
          resolve(dataUrl);
        }
      };

      // Use decode() to guarantee the complete image bitmap is fully decoded
      if ('decode' in img) {
        try {
          await img.decode();
          onImageReady();
          return;
        } catch {
          // Fallback to onload if decode fails
        }
      }

      img.onload = onImageReady;
      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
}
