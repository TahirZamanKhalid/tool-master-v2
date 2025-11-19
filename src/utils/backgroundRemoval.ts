// utils/backgroundRemoval.ts
import '@imgly/background-removal';

export interface RemovalProgress {
  progress: number;
  stage: 'loading' | 'processing' | 'complete';
  message: string;
}

export const loadImage = (blob: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

export const removeBackground = async (
  image: string | Blob | HTMLImageElement,
  backgroundColor?: string,
  onProgress?: (progress: number, stage: RemovalProgress['stage'], message: string) => void
): Promise<Blob> => {
  try {
    // Dynamic import to reduce initial bundle size
    const { removeBackground: imglyRemoveBackground } = await import('@imgly/background-removal');
    
    onProgress?.(10, 'loading', 'Loading AI model...');
    
    // Configure the removal
    const config = {
      progress: (key: string, current: number, total: number) => {
        const progressPercent = Math.round((current / total) * 80) + 10; // 10-90%
        onProgress?.(progressPercent, 'processing', 'Removing background...');
      },
      model: 'isnet' as const, // Options: 'isnet' (best) | 'isnet_fp16' (faster) | 'isnet_quint8' (fastest)
      output: {
        format: 'image/png' as const,
        quality: 1,
        type: 'foreground' as const,
      },
    };

    onProgress?.(15, 'processing', 'Processing image...');
    
    // Remove background
    const blob = await imglyRemoveBackground(image, config);
    
    // Apply background color if specified
    if (backgroundColor && backgroundColor !== 'transparent') {
      onProgress?.(90, 'processing', 'Applying background color...');
      const coloredBlob = await applyBackgroundColor(blob, backgroundColor);
      onProgress?.(100, 'complete', 'Complete!');
      return coloredBlob;
    }
    
    onProgress?.(100, 'complete', 'Complete!');
    return blob;
    
  } catch (error) {
    console.error('Background removal error:', error);
    throw new Error('Failed to remove background. Please try again with a different image.');
  }
};

const applyBackgroundColor = async (
  imageBlob: Blob,
  backgroundColor: string
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageBlob);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw image with transparency on top
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (PNG, JPG, or WebP)',
    };
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image size must be less than 10MB',
    };
  }
  
  return { valid: true };
};