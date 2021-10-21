import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from 'src/app/app.service';
import { UserTemplateModule } from 'src/user-template/user-template.module';
import { UserTemplateRequestController } from './user-template-request.controller';
import { UserTemplateRequest } from './user-template-request.entity';
import { UserTemplateRequestService } from './user-template-request.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserTemplateRequest]), UserTemplateModule],
  providers: [UserTemplateRequestService, AppService],
  controllers: [UserTemplateRequestController],
})
export class UserTemplateRequestModule {}
