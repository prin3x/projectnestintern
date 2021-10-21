import { Expose, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UserTemplateDefaultDto {
  @IsNotEmpty()
  template: string;
}
export class UserTemplateDto {
  @Expose({ name: 'acc_id' })
  @Type(() => Number)
  @IsNumber(undefined, { message: 'acc_id must be number' })
  accId: number;

  userTemplateRequestId: number;

  @IsNotEmpty()
  template: string;
}
