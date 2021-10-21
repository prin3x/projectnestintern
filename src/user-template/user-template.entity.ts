import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserTemplateRequest } from '../user-template-request/user-template-request.entity';
import { User } from '../user/user.entity';

@Entity()
export class UserTemplate {
  @PrimaryGeneratedColumn() id: number;
  @Column({ name: 'acc_id' }) accId: number;
  @Column({ name: 'user_template_request_id' }) userTemplateRequestId: number;
  @Column() template: string;
  @Column() status: UserTemplateStatus;
  @Column() syscreate: Date;
  @Column() sysupdate: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'acc_id' })
  userDetail: User;

  @OneToOne(() => UserTemplateRequest)
  @JoinColumn({ name: 'user_template_request_id' })
  userTemplateRequestDetail: UserTemplateRequest;
}

export enum UserTemplateStatus {
  Ready = 'ready',
  Disabled = 'disabled',
  Deleted = 'deleted',
}
