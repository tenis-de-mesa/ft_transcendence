import { S3Client } from '@aws-sdk/client-s3';
import { Provider } from '@nestjs/common';

export const s3ClientProvider: Provider = {
  provide: S3Client,
  useFactory: () => {
    const REGION = 'sa-east-1';
    const s3Client = new S3Client({ region: REGION });
    return s3Client;
  },
};
