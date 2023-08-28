export interface IDatabaseConfig {
  getDatabaseHost(): string;
  getDatabasePort(): number;
  getDatabaseName(): string;
  getDatabaseUser(): string;
  getDatabasePassword(): string;
}
