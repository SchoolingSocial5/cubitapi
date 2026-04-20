import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

/**
 * Upload a buffer to S3 and return the public URL
 * @param buffer - File buffer
 * @param fileName - Original filename or desired name
 * @param mimeType - Mime type of the file
 */
export const uploadToS3 = async (buffer: Buffer, fileName: string, mimeType: string): Promise<string> => {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
        throw new Error('AWS_S3_BUCKET_NAME is not defined in environment variables');
    }

    const key = `verification-docs/${Date.now()}-${fileName}`;

    try {
        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: bucketName,
                Key: key,
                Body: buffer,
                ContentType: mimeType,
            },
        });

        await upload.done();

        // Construct the S3 URL
        return `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    } catch (error: any) {
        console.error('S3 Upload Error:', error);
        throw new Error(`Failed to upload to S3: ${error.message}`);
    }
};

/**
 * Delete a file from S3 using its URL
 * @param url Document or image URL
 */
export const deleteFromS3 = async (url: string): Promise<void> => {
    try {
        if (!url || !url.includes('amazonaws.com')) return;

        const bucketName = process.env.AWS_S3_BUCKET_NAME;
        if (!bucketName) {
            throw new Error('AWS_S3_BUCKET_NAME is not defined in environment variables');
        }

        // Extract key from URL: https://bucket.s3.region.amazonaws.com/key
        const urlParts = url.split('.amazonaws.com/');
        if (urlParts.length < 2) return;

        const key = urlParts[1];

        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
        });

        await s3Client.send(command);
        console.log(`S3: Deleted file ${key}`);
    } catch (error: any) {
        console.error('S3 Delete Error:', error);
        // We don't throw here to avoid failing the whole deletion process
        // but it might be better to log properly
    }
};
