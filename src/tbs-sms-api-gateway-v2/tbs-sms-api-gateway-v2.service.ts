import {
  HttpService,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from 'nestjs-config';

enum ConfigurationUrlKey {
  DEFAULT_USER_TEMPLATE = 'default_user_template',
}

@Injectable()
export class TbsSmsApiGatewayV2Service {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {}

  async reloadDefaultUserTemplate() {
    this.logger.verbose({ message: { fn: this.reloadDefaultUserTemplate.name } });

    const smsV2BeUsername = this.configService.get(
      'tbs-sms-api-gateway-v2.SMSv2BEUsername'
    );
    const smsV2BePassword = this.configService.get(
      'tbs-sms-api-gateway-v2.SMSv2BEPassword'
    );
    const smsV2Urls: string = this.configService.get('tbs-sms-api-gateway-v2.SMSv2URL');

    if (!smsV2Urls) throw new InternalServerErrorException('SMSv2URL is empty.');

    // ? Production have 2 processes for loadbalance. So must be reload config them.
    const subSmsV2Urls = smsV2Urls.split(',');
    const smsV2UrlsLength = subSmsV2Urls.length;

    for (let i = 0; i < smsV2UrlsLength; i++) {
      const smsV2Url = subSmsV2Urls[i];
      const url = `${smsV2Url}/OCnPeCmOoRbEy/configuration/${ConfigurationUrlKey.DEFAULT_USER_TEMPLATE}`;

      this.logger.verbose({
        message: { fn: this.reloadDefaultUserTemplate.name, data: { url } },
      });

      try {
        const resp = await this.httpService
          .put(url, undefined, {
            auth: {
              username: smsV2BeUsername,
              password: smsV2BePassword,
            },
          })
          .toPromise();

        this.logger.log({
          message: {
            fn: this.reloadDefaultUserTemplate.name,
            data: { url },
            response: resp?.data || '',
            statusCode: resp?.status || 0,
          },
        });
      } catch (e) {
        this.logger.error({
          message: {
            fn: this.reloadDefaultUserTemplate.name,
            data: { url },
            message: e.message || '-',
            response: e?.response?.data || '',
            statusCode: e?.response?.status || 0,
          },
        });

        throw new InternalServerErrorException();
      }
    }
  }
}
