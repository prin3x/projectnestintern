import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from 'nestjs-redis';
import { Brackets, Repository, UpdateResult } from 'typeorm';
import { ListBasicOperation } from '../app/app.interface';
import { UserService } from '../user/user.service';
import { UserTemplateDto } from './user-template.dto';
import { UserTemplate, UserTemplateStatus } from './user-template.entity';

const TABLE_USER_TEMPLATE = 'user_template';

@Injectable()
export class UserTemplateService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectRepository(UserTemplate)
    private readonly userTemplateRepository: Repository<UserTemplate>,

    private readonly redisService: RedisService,
    private readonly userService: UserService
  ) {}

  delete(id: number): Promise<UpdateResult> {
    return this._updateStatus(id, UserTemplateStatus.Deleted);
  }

  async deleteByUserTemplateRequestId(
    userTemplateRequestId: number
  ): Promise<UpdateResult> {
    this.logger.verbose({
      message: {
        fn: this.deleteByUserTemplateRequestId.name,
        data: { userTemplateRequestId },
      },
    });

    if (isNaN(userTemplateRequestId) || userTemplateRequestId < 1)
      throw new BadRequestException('user_template_request_id is invalid.');

    const dUserTemplate = await this.getByUserTemplateRequestId(userTemplateRequestId);
    if (!dUserTemplate) throw new NotFoundException('user_template not found');

    const set = new UserTemplate();
    set.status = UserTemplateStatus.Deleted;

    const resUpdate = await this.userTemplateRepository.update(
      { userTemplateRequestId },
      set
    );

    this.deleteCache(dUserTemplate.accId);

    return Promise.resolve(resUpdate);
  }

  disable(id: number): Promise<UpdateResult> {
    return this._updateStatus(id, UserTemplateStatus.Disabled);
  }

  enable(id: number): Promise<UpdateResult> {
    return this._updateStatus(id, UserTemplateStatus.Ready);
  }

  async insert(fd: UserTemplateDto, isDefault: boolean): Promise<UserTemplate> {
    this.logger.verbose({
      message: { fn: this.insert.name, data: { fd, isDefault } },
    });

    if (!isDefault) {
      const dUser = await this.userService.get(fd.accId);
      if (!dUser) throw new NotFoundException('User not found');
    }

    const set = new UserTemplate();
    set.accId = fd.accId;
    set.userTemplateRequestId = fd.userTemplateRequestId || 0;
    set.template = fd.template;

    const resInsert = await this.userTemplateRepository.save(set);

    this.deleteCache(fd.accId);

    return Promise.resolve(resInsert);
  }

  get(id: number): Promise<UserTemplate> {
    this.logger.verbose({
      message: { fn: this.get.name, data: { id } },
    });

    if (isNaN(id) || id < 1)
      throw new BadRequestException('user_template_id is invalid.');

    const status = UserTemplateStatus.Deleted;

    const qb = this.userTemplateRepository
      .createQueryBuilder(TABLE_USER_TEMPLATE)
      .where(`${TABLE_USER_TEMPLATE}.status != :status`, { status })
      .andWhere(`${TABLE_USER_TEMPLATE}.id = :id`, { id });

    return qb.getOne();
  }

  getByUserTemplateRequestId(userTemplateRequestId: number): Promise<UserTemplate> {
    this.logger.verbose({
      message: {
        fn: this.getByUserTemplateRequestId.name,
        data: { userTemplateRequestId },
      },
    });

    if (isNaN(userTemplateRequestId) || userTemplateRequestId < 1)
      throw new BadRequestException('user_template_request_id is invalid.');

    const status = UserTemplateStatus.Deleted;

    const qb = this.userTemplateRepository
      .createQueryBuilder(TABLE_USER_TEMPLATE)
      .where(`${TABLE_USER_TEMPLATE}.status != :status`, { status })
      .andWhere(`${TABLE_USER_TEMPLATE}.userTemplateRequestId = :userTemplateRequestId`, {
        userTemplateRequestId,
      });

    return qb.getOne();
  }

  list(
    opt: ListBasicOperation,
    status: UserTemplateStatus | UserTemplateStatus[],
    isDefault: boolean
  ) {
    this.logger.verbose({
      message: { fn: this.list.name, data: { opt, status, isDefault } },
    });

    if (!this._validOrderBy(opt.orderBy))
      throw new BadRequestException('order by field is invalid');

    const qb = this.userTemplateRepository
      .createQueryBuilder(TABLE_USER_TEMPLATE)
      .leftJoinAndSelect(`${TABLE_USER_TEMPLATE}.userDetail`, 'userDetail')
      .leftJoinAndSelect(
        `${TABLE_USER_TEMPLATE}.userTemplateRequestDetail`,
        'userTemplateRequestDetail'
      );

    if (status instanceof Array)
      qb.where(`${TABLE_USER_TEMPLATE}.status in (:status)`, { status });
    else qb.where(`${TABLE_USER_TEMPLATE}.status=:status`, { status });

    if (isDefault) qb.andWhere(`${TABLE_USER_TEMPLATE}.accId = 0`);
    else qb.andWhere(`${TABLE_USER_TEMPLATE}.accId > 0`);

    if (opt.startDate && opt.endDate)
      qb.andWhere(
        new Brackets((qb) => {
          qb.where(
            `${TABLE_USER_TEMPLATE}.created_date between :start_date and :end_date`,
            {
              start_date: opt.startDate,
              end_date: opt.endDate,
            }
          );
        })
      );

    if (opt.search) {
      const search = opt.search;
      qb.andWhere(
        new Brackets((qb) => {
          qb.where(`${TABLE_USER_TEMPLATE}.acc_id = :search`, { search }).orWhere(
            `userDetail.user_name = :search`,
            { search }
          );
        })
      );
    }

    qb.orderBy(`${TABLE_USER_TEMPLATE}.${opt.orderBy}`, opt.order)
      .skip(opt.skip)
      .take(opt.limit);

    return qb.getManyAndCount();
  }

  async update(
    id: number,
    fd: UserTemplateDto,
    isDefault: boolean
  ): Promise<UpdateResult> {
    this.logger.verbose({
      message: { fn: this.update.name, data: { id, fd } },
    });

    if (isNaN(id) || id < 1)
      throw new BadRequestException('user_template_id is invalid.');

    const dUserTemplate = await this.get(id);
    if (!dUserTemplate) throw new NotFoundException('user_template not found');

    if (!isDefault) {
      const dUser = await this.userService.get(fd.accId);
      if (!dUser) throw new NotFoundException('User not found');
    }

    const set = new UserTemplate();
    set.accId = fd.accId;
    set.template = fd.template;

    const resUpdate = await this.userTemplateRepository.update({ id }, set);

    this.deleteCache(fd.accId);

    return Promise.resolve(resUpdate);
  }

  validUserTemplateStatus(status: string): UserTemplateStatus {
    switch (status) {
      case UserTemplateStatus.Ready:
      case UserTemplateStatus.Disabled:
        return <UserTemplateStatus>status;
      default:
        throw new BadRequestException('UserTemplateStatus is invalid.');
    }
  }

  private async deleteCache(accId: number) {
    if (typeof accId === 'undefined') {
      this.logger.error({
        message: { fn: this.get.name, data: { accId }, message: 'accId is undefined.' },
      });
      return;
    }

    const key = `ta:${accId}`;

    try {
      await this.redisService.getClient().del(key);
    } catch (e) {
      this.logger.error({
        message: { fn: this.get.name, data: { accId }, message: e.message },
      });
    }
  }

  private async _updateStatus(
    id: number,
    status: UserTemplateStatus
  ): Promise<UpdateResult> {
    this.logger.verbose({
      message: { fn: this._updateStatus.name, data: { id, status } },
    });

    if (isNaN(id) || id < 1)
      throw new BadRequestException('user_template_id is invalid.');

    const dUserTemplate = await this.get(id);
    if (!dUserTemplate) throw new NotFoundException('user_template not found');

    const set = new UserTemplate();
    set.status = status;

    const resUpdate = await this.userTemplateRepository.update({ id }, set);

    this.deleteCache(dUserTemplate.accId);

    return Promise.resolve(resUpdate);
  }

  private _validOrderBy(orderBy: string): boolean {
    switch (orderBy) {
      case 'id':
      case 'acc_id':
      case 'syscreate':
      case 'sysupdate':
        return true;
    }

    return false;
  }
}
