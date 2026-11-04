/**
 * Helper utility for safely processing and optimizing user-uploaded images
 * (Profile photos and Signature images) to avoid exceeding browser localStorage quotas.
 */

export interface ProcessedImageResult {
  dataUrl: string;
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
}

export const processImageFile = async (
  file: File,
  maxWidth: number = 600,
  maxHeight: number = 600,
  quality: number = 0.85
): Promise<ProcessedImageResult> => {
  return new Promise((resolve, reject) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      reject(new Error('Please select a valid image file (JPG, PNG, or WEBP).'));
      return;
    }

    // Limit original file size to 3MB
    if (file.size > 3 * 1024 * 1024) {
      reject(new Error('Image file is too large. Please select an image smaller than 3MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        reject(new Error('Image data is empty.'));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Could not load image. File may be corrupted.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio scaling
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to raw dataUrl if canvas context is unavailable
          resolve({
            dataUrl: rawDataUrl,
            fileName: file.name,
            fileSize: file.size,
            width: img.width,
            height: img.height,
          });
          return;
        }

        // Draw image smoothly
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Keep PNG transparency if file is PNG, otherwise use JPEG
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressedDataUrl = canvas.toDataURL(outputType, quality);

        resolve({
          dataUrl: compressedDataUrl,
          fileName: file.name,
          fileSize: Math.round((compressedDataUrl.length * 3) / 4),
          width,
          height,
        });
      };

      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  });
};
