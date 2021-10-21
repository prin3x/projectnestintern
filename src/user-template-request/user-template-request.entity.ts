import { User } from 'src/user/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserTemplateRequest {
  @PrimaryGeneratedColumn() id: number;
  @Column({ name: 'acc_id' }) accId: number;
  @Column() status: UserTemplateRequestStatus;
  @Column() type: UserTemplateRequestType;
  @Column({ name: 'template_name' }) templateName: string;
  @Column() template: string;
  @Column() remarks: string;
  @Column({ name: 'approve_date' }) approveDate: Date;
  @Column({ name: 'approve_by' }) approveby: number;
  @Column({ name: 'reject_date' }) rejectDate: Date;
  @Column({ name: 'reject_by' }) rejectby: number;
  @Column() syscreate: Date;
  @Column() sysupdate: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'acc_id' })
  userDetail: User;
}

export enum UserTemplateRequestStatus {
  Approved = 'approved',
  Deleted = 'deleted',
  Pending = 'pending',
  Rejected = 'rejected',
}

export enum UserTemplateRequestType {
  Marketing = 'marketing',
  Notify = 'notify',
  Otp = 'otp',
}
