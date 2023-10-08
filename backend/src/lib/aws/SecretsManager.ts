import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

@Injectable()
export class SecretsManager implements OnModuleInit {
  private secrets: Record<string, string> = {};
  private readonly REGION = 'sa-east-1';
  private readonly secretName = 'testenv';
  private secretsManagerClient: SecretsManagerClient;

  constructor() {
    this.secretsManagerClient = new SecretsManagerClient({
      region: this.REGION,
    });
  }

  async onModuleInit() {
    await this.fetchSecrets();
  }

  private async fetchSecrets() {
    try {
      const response = await this.secretsManagerClient.send(
        new GetSecretValueCommand({
          SecretId: this.secretName,
          VersionStage: 'AWSCURRENT',
        }),
      );
      this.secrets = JSON.parse(response.SecretString);
    } catch (error) {
      console.error(`Failed to fetch secrets: ${error.message}`);
    }
  }

  getSecret(key: string): string {
    return this.secrets[key];
  }
}
