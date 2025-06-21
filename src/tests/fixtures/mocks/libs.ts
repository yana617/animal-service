export const imageKeyMock = 'mock-key';
export const imageNameMock = 'test.jpg';

jest.mock('@aws-sdk/client-s3', () => ({
    S3Client: jest.fn(() => ({
        send: jest.fn(),
    })),
    DeleteObjectCommand: jest.fn(),
}));

jest.mock('multer', () => {
    const multer = (): any => ({
        any: () => (req: any, res: any, next: any) => {
            req.files = [
                {
                    fieldname: 'file',
                    originalname: imageNameMock,
                    encoding: '7bit',
                    mimetype: 'image/jpeg',
                    size: 1024,
                    bucket: 'mock-bucket',
                    key: imageKeyMock,
                    location: `https://mock-bucket.s3.amazonaws.com/${imageKeyMock}`,
                    etag: 'mock-etag',
                },
            ];
            next();
        },
    });
    return multer;
});
