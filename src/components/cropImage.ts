export const getCroppedImg = async (imageSrc: string, pixelCrop: any) => {
  const image = new Image();
  image.src = imageSrc;

  // Wait for the image to load
  await new Promise((resolve) => {
    image.onload = resolve;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Set canvas dimensions to the cropped area dimensions
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped portion of the image onto the new canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise<File | null>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        resolve(null);
        return;
      }
      const file = new File([blob], 'cropped.jpeg', { type: 'image/jpeg' });
      resolve(file);
    }, 'image/jpeg');
  });
};