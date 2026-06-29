import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import ErrorResponse from '../utils/errorResponse';
import crypto from 'crypto';

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

export const getPresignedUrl = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { filename, filetype } = req.body;
    if (!filename || !filetype) {
        return next(new ErrorResponse('Please provide filename and filetype', 400));
    }

    const uniqueId = crypto.randomBytes(8).toString('hex');
    const ext = filename.split('.').pop();
    const key = `uploads/${Date.now()}-${uniqueId}.${ext}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME || '',
        Key: key,
        ContentType: filetype,
    });

    const presignedUrl = await getSignedUrl(s3Client as any, command as any, { expiresIn: 3600 });
    const objectUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    res.status(200).json({
        success: true,
        data: {
            presignedUrl,
            objectUrl,
            key
        }
    });
});

export const deleteObject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body;
    if (!key) {
        return next(new ErrorResponse('Please provide key', 400));
    }

    // Extract the relative key if an absolute URL is sent by accident
    let s3Key = key;
    if (key.startsWith('http')) {
        const url = new URL(key);
        s3Key = url.pathname.substring(1);
    }

    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME || '',
        Key: s3Key,
    });

    await s3Client.send(command);

    res.status(200).json({
        success: true,
        data: {}
    });
});
