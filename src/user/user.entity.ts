import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ name: 'acc_id' }) accID: number;
  @Column({ name: 'user_name' }) userName: string;
  @Column() status: UserStatus;
}

export enum UserStatus {
  Normal = 0,
  Block = 1,
  Trial = 3,
}
