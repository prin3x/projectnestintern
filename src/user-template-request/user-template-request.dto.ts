import { Expose } from 'class-transformer';
import { IsIn, IsNotEmpty } from 'class-validator';
import { UserTemplateRequestType } from './user-template-request.entity';

export class UserTemplateRequestRejectedDto {
  @IsNotEmpty()
  remarks: string;
}

export class UserTemplateRequestUpdateDto {
  @IsIn([
    UserTemplateRequestType.Marketing,
    UserTemplateRequestType.Notify,
    UserTemplateRequestType.Otp,
  ])
  type: UserTemplateRequestType;

  @Expose({ name: 'template_name' })
  @IsNotEmpty()
  templateName: string;

  @IsNotEmpty()
  template: string;
}
