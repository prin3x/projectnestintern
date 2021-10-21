import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from '../app/app.service';
import { TbsSmsApiGatewayV2Module } from '../tbs-sms-api-gateway-v2/tbs-sms-api-gateway-v2.module';
import { UserModule } from '../user/user.module';
import { UserTemplateController } from './user-template.controller';
import { UserTemplate } from './user-template.entity';
import { UserTemplateService } from './user-template.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserTemplate]),
    UserModule,
    TbsSmsApiGatewayV2Module,
  ],
  providers: [UserTemplateService, AppService],
  controllers: [UserTemplateController],
  exports: [UserTemplateService],
})
export class UserTemplateModule {}
