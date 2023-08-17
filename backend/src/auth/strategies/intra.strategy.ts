import axios from 'axios';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-oauth2';
import { AuthService } from '../auth.service';
import { IntraDto } from '../dto';
import { EnvironmentConfigService } from '../../config/env.service';

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
      callbackURL: config.getBackendHostname() + '/auth/login',
    });
  }

  async validate(token: string): Promise<any> {
    const endpoint = this.config.getFetchURL();

    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const dto: IntraDto = {
      id: response.data.id,
      login: response.data.login,
    };

    return this.authService.validateIntraUser(dto);
  }
}
