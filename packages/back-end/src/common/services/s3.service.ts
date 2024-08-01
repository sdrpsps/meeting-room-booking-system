import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import * as multer from 'multer';

@Injectable()
export class S3Service {
  private s3: AWS.S3;
  private logger = new Logger(S3Service.name);

  constructor(private readonly configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get('S3_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('S3_SECRET_ACCESS_KEY'),
      endpoint: this.configService.get('S3_ENDPOINT_URL'),
      region: this.configService.get('S3_REGION'),
    });
  }

  private generateFileName(file: Express.Multer.File): string {
    return `${Date.now()}-${file.originalname}`;
  }

  private multerStorage() {
    return multer.memoryStorage();
  }

  private async uploadFileToS3(
    file: Express.Multer.File,
    fileName: string,
  ): Promise<AWS.S3.ManagedUpload.SendData> {
    const params = {
      Bucket: this.configService.get('S3_BUCKET_NAME'),
      Key: `${this.configService.get('S3_UPLOAD_KEY')}/${fileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    return this.s3.upload(params).promise();
  }

  getMulterOptions() {
    return {
      storage: this.multerStorage(),
      fileFilter: (req: any, file: any, cb: any) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB file size limit
    };
  }

  async uploadFile(file: Express.Multer.File) {
    const fileName = this.generateFileName(file);
    try {
      const data = await this.uploadFileToS3(file, fileName);
      const url = `${this.configService.get('S3_FILE_PREFIX_URL')}/${data.Key}`;
      this.logger.log(`File uploaded successfully: ${url}`);

      return url;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw error;
    }
  }
}