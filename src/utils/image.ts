export const resizeBase64Image = (base64: string, width: number, height: number): Promise<string> => {
    // Create a canvas element
    const canvas = document.createElement('canvas') as HTMLCanvasElement;

    // Create an image element from the base64 string
    const image = new Image();
    image.src = base64;

    // Return a Promise that resolves when the image has loaded
    return new Promise((resolve, reject) => {
        image.onload = () => {
            canvas.width = width;
            canvas.height = height;


            // Draw the image to the canvas
            canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height);
            // Resolve the Promise with the resized image as a base64 string
            resolve(canvas.toDataURL());
        };

        image.onerror = reject;
    });
};

export async function CC() {
    return (await import('canvas-capture')).default;
}

