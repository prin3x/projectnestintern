import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from 'nestjs-config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthPayload } from './auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any): Promise<AuthPayload> {
    this.logger.verbose({
      message: {
        fn: this.validate.name,
        data: {
          token: req.headers['authorization'] || '',
          payload,
        },
      },
    });

    const rtn: AuthPayload = {
      id: +payload.sub || 0,
    };

    return Promise.resolve(rtn);
  }
}
