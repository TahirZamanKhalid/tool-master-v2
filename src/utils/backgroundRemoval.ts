import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_IMAGE_DIMENSION = 1024;

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

export const removeBackground = async (
  imageElement: HTMLImageElement,
  backgroundColor?: string,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  try {
    console.log('Starting background removal process...');
    onProgress?.(10);
    
    const segmenter = await pipeline('image-segmentation', 'Xenova/modnet', {
      device: 'webgpu',
    });
    
    onProgress?.(30);
    
    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize image if needed and draw it to canvas
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`);
    
    onProgress?.(40);
    
    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Image converted to base64');
    
    onProgress?.(50);
    
    // Process the image with the segmentation model
    console.log('Processing with segmentation model...');
    const result = await segmenter(imageData);
    
    onProgress?.(70);
    
    console.log('Segmentation result:', result);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    // Create a new canvas for the masked image
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Draw original image onto subject canvas
    outputCtx.drawImage(canvas, 0, 0);
    
    onProgress?.(80);
    
    // Apply the mask (auto-detect inversion using center sampling)
    const maskRaw = (result[0].mask && (result[0].mask as any).data) as any;
    let mask: Float32Array;
    if (maskRaw instanceof Float32Array) {
      mask = maskRaw;
    } else if (maskRaw instanceof Uint8Array || maskRaw instanceof Uint8ClampedArray) {
      mask = new Float32Array(maskRaw.length);
      for (let i = 0; i < maskRaw.length; i++) mask[i] = maskRaw[i] / 255;
    } else if (Array.isArray(maskRaw)) {
      mask = new Float32Array(maskRaw.length);
      for (let i = 0; i < maskRaw.length; i++) mask[i] = maskRaw[i];
    } else {
      throw new Error('Unsupported mask data type');
    }
    // Canvas dimensions
    const w = outputCanvas.width;
    const h = outputCanvas.height;

    // Decide mask resolution
    const maskMeta = (result[0].mask as any) || {};
    const mW = (maskMeta.width ?? maskMeta.shape?.[1] ?? maskMeta.dims?.[1]) ?? Math.max(1, Math.round(Math.sqrt(mask.length * (w / h))));
    const mH = (maskMeta.height ?? maskMeta.shape?.[0] ?? maskMeta.dims?.[0]) ?? Math.max(1, Math.round(mask.length / mW));

    // Helper to sample mask value at canvas pixel (x,y)
    const sampleMask = (x: number, y: number) => {
      const mx = Math.min(mW - 1, Math.max(0, Math.floor((x / w) * mW)));
      const my = Math.min(mH - 1, Math.max(0, Math.floor((y / h) * mH)));
      return mask[my * mW + mx] ?? 0;
    };

    // Sample center region to decide if mask needs inversion
    const x0 = Math.floor(w * 0.3);
    const x1 = Math.floor(w * 0.7);
    const y0 = Math.floor(h * 0.3);
    const y1 = Math.floor(h * 0.7);
    let sumCenter = 0;
    let countCenter = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        sumCenter += sampleMask(x, y);
        countCenter++;
      }
    }
    const avgCenter = sumCenter / Math.max(1, countCenter);
    const invert = avgCenter < 0.5; // if center is mostly background by mask, invert it

    const outputImageData = outputCtx.getImageData(0, 0, w, h);
    const data = outputImageData.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const m = sampleMask(x, y);
        const use = invert ? (1 - m) : m; // 1 => keep subject
        data[idx + 3] = Math.round(use * 255);
      }
    }
    outputCtx.putImageData(outputImageData, 0, 0);
    console.log('Mask applied successfully', { invert, mW, mH });

    onProgress?.(95);

    // If background color is requested, composite subject over solid color
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = w;
    finalCanvas.height = h;
    const finalCtx = finalCanvas.getContext('2d');
    if (!finalCtx) throw new Error('Could not get final canvas context');

    if (backgroundColor) {
      finalCtx.fillStyle = backgroundColor;
      finalCtx.fillRect(0, 0, w, h); // base background
    } else {
      // Otherwise start with fully transparent
      finalCtx.clearRect(0, 0, w, h);
    }
    finalCtx.drawImage(outputCanvas, 0, 0); // draw subject with alpha

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      finalCanvas.toBlob(
        (blob) => {
          if (blob) {
            onProgress?.(100);
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

