import axios from 'axios';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, VerifyCallback } from 'passport-oauth2';
import { AuthService } from '../auth.service';
import { EnvironmentConfigService } from '../../config/env.service';
import { CreateUserDto } from '../../users/dto';
import { AuthProvider } from '../../core/entities';

@Injectable()
export class IntraStrategy extends PassportStrategy(Strategy, 'intra') {
  constructor(
    private readonly authService: AuthService,
    private readonly config: EnvironmentConfigService,
  ) {
    super({
      authorizationURL: config.getAuthURL(),
      tokenURL: config.getTokenURL(),
      clientID: config.getClientID(),
      clientSecret: config.getClientSecret(),
      callbackURL: config.getBackendHostname() + '/auth/login/intra',
    });
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    _profile: any,
    callback: VerifyCallback,
  ): Promise<any> {
    const endpoint = this.config.getFetchURL();

    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const dto: CreateUserDto = {
      intraId: response.data.id,
      login: response.data.login,
      provider: AuthProvider.INTRA,
    };

    const user = await this.authService.loginAsIntra(dto);

    callback(null, user);
  }
}
