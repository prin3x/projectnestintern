import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from './user.entity';

export const TABLE_USER = 'user';

@Injectable()
export class UserService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  get(accId: number): Promise<User> {
    this.logger.verbose({ message: { fn: this.get.name, data: { accId } } });

    if (isNaN(accId) || accId < 1) throw new BadRequestException('acc_id is invalid.');

    const status = UserStatus.Block;

    const qb = this.userRepository
      .createQueryBuilder(TABLE_USER)
      .where(`${TABLE_USER}.status != :status`, { status })
      .andWhere(`${TABLE_USER}.acc_id = :id`, { id: accId });

    return qb.getOne();
  }
}
