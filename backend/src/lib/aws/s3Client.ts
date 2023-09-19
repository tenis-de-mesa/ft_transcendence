import { S3Client } from "@aws-sdk/client-s3";
const REGION = "sa-east-1"; 
const s3Client = new S3Client({ region: REGION });
export { s3Client };