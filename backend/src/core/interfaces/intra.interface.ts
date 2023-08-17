export interface IIntraConfig {
  getAuthURL(): string;
  getTokenURL(): string;
  getFetchURL(): string;
  getRedirectURL(): string;
  getClientID(): string;
  getClientSecret(): string;
  getSessionSecret(): string;
}
