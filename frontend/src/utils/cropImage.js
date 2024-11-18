export const getCroppedImg = (imageSrc, pixelCrop) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = 500;
      canvas.height = 550;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        500,
        550
      );

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "cropped-image.jpeg", {
            type: "image/jpeg",
          });
          resolve(file);
        } else {
          reject(new Error("Canvas is empty"));
        }
      }, "image/jpeg");
    };
    image.onerror = (error) => reject(error);
  });
};
