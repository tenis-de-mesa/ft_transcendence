import axios from 'axios';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-oauth2';
import { AuthService } from '../auth.service';
import { IntraDto } from '../dto';

@Injectable()
export class IntraStrategy extends PassportStrategy(Strategy, 'intra') {
  constructor(private readonly authService: AuthService) {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: process.env.INTRA_CLIENT_ID,
      clientSecret: process.env.INTRA_CLIENT_SECRET,
      callbackURL: process.env.BACKEND_HOSTNAME + '/auth/login',
    });
  }

  async validate(token: string): Promise<any> {
    const endpoint = process.env.INTRA_FETCH_URL;

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
