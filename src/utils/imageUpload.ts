/**
 * Image upload and client-side optimization utility
 * Resizes and compresses images so they load instantly and comfortably fit within localStorage quotas.
 */

export interface ProcessedImage {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  fileName: string;
}

/**
 * Resizes and compresses an image File or Blob to a clean web-optimized Data URL (JPEG/WebP)
 * @param file The uploaded image File
 * @param maxWidth Max width/height dimension (default: 1200px)
 * @param quality Compression quality from 0.1 to 1.0 (default: 0.85)
 */
export async function processAndOptimizeImage(
  file: File,
  maxWidth = 1200,
  quality = 0.85
): Promise<ProcessedImage> {
  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (JPG, PNG, WebP, GIF).');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read image file.'));
    };

    reader.onload = (readerEvent) => {
      const rawDataUrl = readerEvent.target?.result as string;
      if (!rawDataUrl) {
        reject(new Error('Empty image data.'));
        return;
      }

      // If it's a small SVG or GIF, preserve animation or vector sharpness directly
      if (file.type === 'image/svg+xml' || (file.type === 'image/gif' && file.size < 500 * 1024)) {
        resolve({
          dataUrl: rawDataUrl,
          originalSize: file.size,
          compressedSize: file.size,
          width: 0,
          height: 0,
          fileName: file.name,
        });
        return;
      }

      const img = new Image();
      img.onerror = () => {
        // Fallback: use raw data URL if image decoding fails in canvas
        resolve({
          dataUrl: rawDataUrl,
          originalSize: file.size,
          compressedSize: file.size,
          width: 0,
          height: 0,
          fileName: file.name,
        });
      };

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate aspect-preserving dimensions
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            dataUrl: rawDataUrl,
            originalSize: file.size,
            compressedSize: file.size,
            width,
            height,
            fileName: file.name,
          });
          return;
        }

        // Draw image onto canvas with high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to web-friendly JPEG data URL
        try {
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          // Estimate compressed size from base64 string
          const compressedSize = Math.round((compressedDataUrl.length * 3) / 4);

          resolve({
            dataUrl: compressedDataUrl,
            originalSize: file.size,
            compressedSize,
            width,
            height,
            fileName: file.name,
          });
        } catch {
          // If toDataURL throws, fallback to rawDataUrl
          resolve({
            dataUrl: rawDataUrl,
            originalSize: file.size,
            compressedSize: file.size,
            width,
            height,
            fileName: file.name,
          });
        }
      };

      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes to readable string (e.g. "1.2 MB" or "180 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
