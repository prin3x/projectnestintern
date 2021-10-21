import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { AppConfigModule } from 'src/config/app-config.module';
import { UserTemplateRequestModule } from 'src/user-template-request/user-template-request.module';
import { UserTemplateModule } from 'src/user-template/user-template.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [AppConfigModule, UserTemplateModule, UserTemplateRequestModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
