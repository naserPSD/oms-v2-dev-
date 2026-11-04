// src/config/aws-s3.service.ts
import {
  DeleteObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { config } from 'dotenv';

config(); // Load environment variables

@Injectable()
export class AwsS3Service {
  private s3: S3Client;
  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_DEFAULT_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File,
  ): Promise<{ Location: string; key: string }> {
    try {
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}-${file.originalname}`;

      const params: PutObjectCommandInput = {
        Bucket: process.env.AWS_BUCKET as string,
        Key: uniqueFileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL: 'public-read', // Make the file publicly accessible
      };

      const fileUploadToAws = await this.s3.send(new PutObjectCommand(params));

      const fileUrl = `${process.env.ASSETS_URL}/${uniqueFileName}`;

      return { Location: fileUrl, key: uniqueFileName };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  async uploadFileByName(
    file: Express.Multer.File,
    filename: string,
  ): Promise<{ Location: string; key: string }> {
    try {
      const params: PutObjectCommandInput = {
        Bucket: process.env.AWS_BUCKET as string,
        Key: filename,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL: 'public-read', // Make the file publicly accessible
      };

      const fileUploadToAws = await this.s3.send(new PutObjectCommand(params));

      const fileUrl = `${process.env.ASSETS_URL}/${process.env.ASSETS_DIR}/${filename}`;

      return { Location: fileUrl, key: filename };
    } catch (error) {
      // console.error('Error uploading file to S3:', error);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const params = {
        Bucket: process.env.AWS_BUCKET as string,
        Key: key,
      };

      await this.s3.send(new DeleteObjectCommand(params));
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new InternalServerErrorException('Failed to delete file from S3');
    }
  }
}
