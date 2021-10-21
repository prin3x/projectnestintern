import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from 'nestjs-config';
import { AuthDTO } from './auth.dto';
import { AuthPayload, AuthResponse } from './auth.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  login(fd: AuthDTO): Promise<AuthResponse> {
    this.logger.verbose({
      message: { fn: this.login.name, data: { username: fd.username } },
    });

    const appUsername = this.configService.get('app.username');
    const appPassword = this.configService.get('app.password');

    if (!appUsername || !appPassword) throw new UnauthorizedException();

    if (fd.username !== appUsername || fd.password != appPassword)
      throw new UnauthorizedException();

    const adminId = 1;
    const payload: AuthPayload = { id: adminId };
    const jwtSignOptions = { subject: adminId.toString() };
    const token = this.jwtService.sign(payload, jwtSignOptions);

    return Promise.resolve({ token } as AuthResponse);
  }
}
