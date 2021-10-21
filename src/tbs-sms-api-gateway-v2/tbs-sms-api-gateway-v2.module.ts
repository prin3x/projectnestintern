import { HttpModule, Module } from '@nestjs/common';
import { TbsSmsApiGatewayV2Service } from './tbs-sms-api-gateway-v2.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  providers: [TbsSmsApiGatewayV2Service],
  exports: [TbsSmsApiGatewayV2Service],
})
export class TbsSmsApiGatewayV2Module {}
