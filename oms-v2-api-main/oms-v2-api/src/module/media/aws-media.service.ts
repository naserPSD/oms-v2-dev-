import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AwsMedia } from './entities/aws-media.entity';
import {
  S3,
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { config } from 'dotenv';

config(); // Load environment variables

const streamPipeline = promisify(pipeline);

@Injectable()
export class AwsMediaService {
  private s3: S3;
  private bucket = process.env.AWS_BUCKET;
  private localDir = path.join(
    process.cwd(),
    'static',
    process.env.ASSETS_DIR || '',
  );

  constructor(
    @InjectRepository(AwsMedia)
    private repo: Repository<AwsMedia>,
  ) {
    this.s3 = new S3({
      region: process.env.AWS_DEFAULT_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    // Ensure local directory exists
    if (!fs.existsSync(this.localDir)) {
      fs.mkdirSync(this.localDir, { recursive: true });
    }
  }

  /**
   * Upload file (from request)
   */
  async uploadFile(
    file: Express.Multer.File,
    extra: Partial<AwsMedia> = {},
  ): Promise<AwsMedia> {
    if (!file) throw new BadRequestException('No file provided');

    const ext = path.extname(file.originalname).replace('.', '');

    let awsMedia = this.repo.create({
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      extension: ext,
      folderPath: process.env.AWS_S3_DEFAULT_FOLDER,
      ...extra,
    });
    awsMedia = await this.repo.save(awsMedia);

    // Generate unique filename
    const filename = `${awsMedia.id}_${uuidv4()}.${ext}`;
    const localPath = path.join(this.localDir, filename);

    // Save locally
    await fs.promises.writeFile(localPath, file.buffer);

    // Upload to AWS
    const key = `${process.env.AWS_S3_DEFAULT_FOLDER}/${filename}`;
    try {
      const parallelUpload = new Upload({
        client: this.s3,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: fs.createReadStream(localPath),
          ContentType: file.mimetype,
        },
      });
      await parallelUpload.done();
    } catch (err) {
      await fs.promises.unlink(localPath);
      throw new BadRequestException('AWS upload failed: ' + err.message);
    }

    // Update DB
    awsMedia.filename = filename;
    awsMedia.awsKey = key;
    return this.repo.save(awsMedia);
  }

  /**
   * Upload file that already exists locally by path
   */
  async uploadFileByName(
    localFilePath: string,
    originalName: string,
    extra: Partial<AwsMedia> = {},
  ): Promise<AwsMedia> {
    if (!fs.existsSync(localFilePath)) {
      throw new NotFoundException('Local file not found: ' + localFilePath);
    }

    const ext = path.extname(originalName).replace('.', '');
    const stats = await fs.promises.stat(localFilePath);

    let awsMedia = this.repo.create({
      originalName,
      size: stats.size,
      mimeType: 'application/octet-stream', // default, you can improve with mime-types lib
      extension: ext,
      folderPath: process.env.AWS_S3_DEFAULT_FOLDER,
      ...extra,
    });
    awsMedia = await this.repo.save(awsMedia);

    const filename = `${awsMedia.id}_${uuidv4()}.${ext}`;
    const targetPath = path.join(this.localDir, filename);

    // Copy file to local cache dir
    await fs.promises.copyFile(localFilePath, targetPath);

    // Upload to AWS
    const key = `${process.env.AWS_S3_DEFAULT_FOLDER}/${filename}`;
    try {
      const parallelUpload = new Upload({
        client: this.s3,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: fs.createReadStream(targetPath),
          ContentType: 'application/octet-stream',
        },
      });
      await parallelUpload.done();
    } catch (err) {
      await fs.promises.unlink(targetPath);
      throw new BadRequestException('AWS upload failed: ' + err.message);
    }

    awsMedia.filename = filename;
    awsMedia.awsKey = key;
    return this.repo.save(awsMedia);
  }

  /**
   * Retrieve file metadata from local cache, or fetch from AWS if missing and ensure it's cached locally
   */
  async getFile(id: number): Promise<AwsMedia> {
    const awsMedia = await this.repo.findOne({ where: { id } });
    if (!awsMedia) throw new NotFoundException('File not found');

    const localPath = path.join(this.localDir, awsMedia.filename);

    if (!fs.existsSync(localPath)) {
      if (!awsMedia.awsKey) throw new NotFoundException('AWS key missing');

      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: awsMedia.awsKey,
      });

      const response = await this.s3.send(command);
      if (!response.Body) throw new NotFoundException('AWS file not found');

      // Save file locally
      await streamPipeline(
        response.Body as any,
        fs.createWriteStream(localPath),
      );
    }

    return awsMedia;
  }

  /**
   * Get fileUrl by ID or filename
   */
  async getFileUrlByIdOrFilename(
    idOrFilename: number | string,
  ): Promise<string> {
    let awsMedia: AwsMedia | null = null;

    if (
      typeof idOrFilename === 'number' ||
      /^\d+$/.test(idOrFilename.toString())
    ) {
      // If numeric → search by ID
      awsMedia = await this.repo.findOne({
        where: { id: Number(idOrFilename) },
      });
    } else {
      // Otherwise treat as filename
      awsMedia = await this.repo.findOne({
        where: { filename: idOrFilename.toString() },
      });
    }

    if (!awsMedia) {
      throw new NotFoundException('File not found');
    }

    const localPath = path.join(this.localDir, awsMedia.filename);

    if (!fs.existsSync(localPath)) {
      if (!awsMedia.awsKey) {
        throw new NotFoundException('AWS key missing');
      }

      // Download from AWS → save locally
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: awsMedia.awsKey,
      });

      const response = await this.s3.send(command);
      if (!response.Body) {
        throw new NotFoundException('AWS file not found');
      }

      await streamPipeline(
        response.Body as any,
        fs.createWriteStream(localPath),
      );
    }

    return awsMedia.fileUrl;
  }

  /**
   * Delete file from local + AWS + DB
   */
  async deleteFile(id: number): Promise<void> {
    const awsMedia = await this.repo.findOne({ where: { id } });
    if (!awsMedia) throw new NotFoundException('File not found');

    const localPath = path.join(this.localDir, awsMedia.filename);

    // Delete local file if exists
    if (fs.existsSync(localPath)) {
      await fs.promises.unlink(localPath);
    }

    // Delete from AWS
    if (awsMedia.awsKey) {
      try {
        await this.s3.send(
          new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: awsMedia.awsKey,
          }),
        );
      } catch (err) {
        throw new BadRequestException(
          'Failed to delete from AWS: ' + err.message,
        );
      }
    }

    // Delete DB record
    await this.repo.remove(awsMedia);
  }
}
