const imageExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.bmp',
    '.tiff',
    '.svg',
];

export const getFileExtension = (image_key: string): string => {
    const lastDotIndex = image_key.lastIndexOf('.');

    if (lastDotIndex === -1) {
        return '.jpg';
    }

    const extension = image_key.substring(lastDotIndex).toLowerCase();

    const isValidExtension = imageExtensions.some(
        (ext) => extension === ext || extension.startsWith(`${ext}?`),
    );

    return isValidExtension ? extension.split('?')[0] : '.jpg';
};
