import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { validate } from 'class-validator';
import { Strategy } from 'passport-local';
import { AuthDTO } from './auth.dto';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    await this._checkAuthBody(username, password);

    const res = await this.authService.login({
      username,
      password,
    });

    return res;
  }

  private async _checkAuthBody(username: string, password: string): Promise<AuthDTO> {
    const body = new AuthDTO();
    body.username = username;
    body.password = password;

    await validate(body).then((e) => {
      if (!e[0]) return;

      const objConstraints = Object.keys(e[0].constraints);
      const errorMessage = objConstraints
        ? e[0].constraints[objConstraints[objConstraints.length - 1]]
        : 'Form data is invalid.';

      throw new BadRequestException(errorMessage, `auth.${e[0].property}.invalid`);
    });

    return Promise.resolve(body);
  }
}
