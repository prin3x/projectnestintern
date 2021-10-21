import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, UpdateResult } from 'typeorm';
import { ListBasicOperation } from '../app/app.interface';
import { UserTemplateDto } from '../user-template/user-template.dto';
import { UserTemplateService } from '../user-template/user-template.service';
import {
  UserTemplateRequestRejectedDto,
  UserTemplateRequestUpdateDto,
} from './user-template-request.dto';
import {
  UserTemplateRequest,
  UserTemplateRequestStatus,
  UserTemplateRequestType,
} from './user-template-request.entity';

const TABLE_USER_TEMPLATE_REQUEST = 'user_template_request';

@Injectable()
export class UserTemplateRequestService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectRepository(UserTemplateRequest)
    private readonly userTemplateRequestRepository: Repository<UserTemplateRequest>,
    private readonly userTemplateService: UserTemplateService
  ) {}

  async approved(id: number, adminId: number): Promise<UpdateResult> {
    this.logger.verbose({ message: { fn: this.approved.name, data: { id } } });

    if (isNaN(id) || id < 1)
      throw new BadRequestException('user_template_request_id is invalid.');

    const dUserTemplateRequest = await this.get(id);
    if (!dUserTemplateRequest)
      throw new NotFoundException('user_template_request not found');

    if (dUserTemplateRequest.status != UserTemplateRequestStatus.Pending)
      throw new ForbiddenException('This template has been approved or rejected.');

    const set = new UserTemplateRequest();
    set.status = UserTemplateRequestStatus.Approved;
    set.approveDate = new Date();
    set.approveby = adminId;

    const resUpdate = await this.userTemplateRequestRepository.update({ id }, set);

    // TODO: Copy to user_template (denormalize).
    if (resUpdate.affected && resUpdate.affected > 0)
      await this.userTemplateService.insert(
        {
          accId: dUserTemplateRequest.accId,
          userTemplateRequestId: id,
          template: dUserTemplateRequest.template,
        } as UserTemplateDto,
        false
      );

    return Promise.resolve(resUpdate);
  }

  async deleted(id: number): Promise<UpdateResult> {
    this.logger.verbose({
      message: { fn: this.deleted.name, data: { id } },
    });

    if (isNaN(id) || id < 1)
      throw new BadRequestException('user_template_request_id is invalid.');

    const dUserTemplateRequest = await this.get(id);
    if (!dUserTemplateRequest)
      throw new NotFoundException('user_template_request not found');

    const set = new UserTemplateRequest();
    set.status = UserTemplateRequestStatus.Deleted;

    const resUpdate = await this.userTemplateRequestRepository.update({ id }, set);

    if (resUpdate.affected && resUpdate.affected > 0) {
      try {
        await this.userTemplateService.deleteByUserTemplateRequestId(id);
      } catch (e) {
        this.logger.warn({
          message: {
            fn: this.deleted.name,
            message: e.message || '-',
            response: e?.response?.data || '',
            statusCode: e?.response?.status || 0,
          },
        });
      }
    }

    return Promise.resolve(resUpdate);
  }

  get(id: number): Promise<UserTemplateRequest> {
    this.logger.verbose({
      message: { fn: this.get.name, data: { id } },
    });

    if (isNaN(id) || id < 1)
      throw new BadRequestException('user_template_request_id is invalid.');

    const status = UserTemplateRequestStatus.Deleted;

    const qb = this.userTemplateRequestRepository
      .createQueryBuilder(TABLE_USER_TEMPLATE_REQUEST)
      .where(`${TABLE_USER_TEMPLATE_REQUEST}.status != :status`, { status })
      .andWhere(`${TABLE_USER_TEMPLATE_REQUEST}.id = :id`, { id });

    return qb.getOne();
  }

  list(
    opt: ListBasicOperation,
    status: UserTemplateRequestStatus | UserTemplateRequestStatus[],
    type: UserTemplateRequestType | UserTemplateRequestType[]
  ): Promise<[UserTemplateRequest[], number]> {
    this.logger.verbose({
      message: { fn: this.list.name, data: { opt, status, type } },
    });

    if (!this._validOrderBy(opt.orderBy))
      throw new BadRequestException('order by field is invalid');

    const qb = this.userTemplateRequestRepository
      .createQueryBuilder(TABLE_USER_TEMPLATE_REQUEST)
      .leftJoinAndSelect(`${TABLE_USER_TEMPLATE_REQUEST}.userDetail`, 'userDetail');

    if (status instanceof Array)
      qb.where(`${TABLE_USER_TEMPLATE_REQUEST}.status in (:status)`, { status });
    else qb.where(`${TABLE_USER_TEMPLATE_REQUEST}.status=:status`, { status });

    if (type instanceof Array)
      qb.andWhere(`${TABLE_USER_TEMPLATE_REQUEST}.type in (:type)`, { type });
    else qb.andWhere(`${TABLE_USER_TEMPLATE_REQUEST}.type=:type`, { type });

    if (opt.startDate && opt.endDate)
      qb.andWhere(
        new Brackets((qb) => {
          qb.where(
            `${TABLE_USER_TEMPLATE_REQUEST}.created_date between :start_date and :end_date`,
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
          qb.where(`${TABLE_USER_TEMPLATE_REQUEST}.acc_id = :search`, { search }).orWhere(
            `userDetail.user_name = :search`,
            { search }
          );
        })
      );
    }

    qb.orderBy(`${TABLE_USER_TEMPLATE_REQUEST}.${opt.orderBy}`, opt.order)
      .skip(opt.skip)
      .take(opt.limit);

    return qb.getManyAndCount();
  }

  async rejected(
    id: number,
    fd: UserTemplateRequestRejectedDto,
    adminId: number
  ): Promise<UpdateResult> {
    this.logger.verbose({ message: { fn: this.rejected.name, data: { id, fd } } });

    if (isNaN(id) || id < 1)
      throw new BadRequestException('user_template_request_id is invalid.');

    const dUserTemplateRequest = await this.get(id);
    if (!dUserTemplateRequest)
      throw new NotFoundException('user_template_request not found');

    if (dUserTemplateRequest.status != UserTemplateRequestStatus.Pending)
      throw new ForbiddenException('This template has been approved or rejected.');

    const set = new UserTemplateRequest();
    set.status = UserTemplateRequestStatus.Rejected;
    set.remarks = fd.remarks;
    set.rejectDate = new Date();
    set.rejectby = adminId;

    return this.userTemplateRequestRepository.update({ id }, set);
  }

  async update(id: number, fd: UserTemplateRequestUpdateDto): Promise<UpdateResult> {
    this.logger.verbose({ message: { fn: this.update.name, data: { id, fd } } });

    if (isNaN(id) || id < 1)
      throw new BadRequestException('user_template_request_id is invalid.');

    const dUserTemplateRequest = await this.get(id);
    if (!dUserTemplateRequest)
      throw new NotFoundException('user_template_request not found');

    if (dUserTemplateRequest.status != UserTemplateRequestStatus.Pending)
      throw new ForbiddenException('This template has been approved or rejected.');

    const set = new UserTemplateRequest();
    set.type = fd.type;
    set.templateName = fd.templateName;
    set.template = fd.template;

    return this.userTemplateRequestRepository.update({ id }, set);
  }

  validUserTemplateRequestStatus(status: string): UserTemplateRequestStatus {
    switch (status) {
      case UserTemplateRequestStatus.Approved:
      case UserTemplateRequestStatus.Pending:
      case UserTemplateRequestStatus.Rejected:
        return <UserTemplateRequestStatus>status;
      default:
        throw new BadRequestException('UserTemplateRequestStatus is invalid.');
    }
  }

  validUserTemplateRequestType(type: string): UserTemplateRequestType {
    switch (type) {
      case UserTemplateRequestType.Marketing:
      case UserTemplateRequestType.Notify:
      case UserTemplateRequestType.Otp:
        return <UserTemplateRequestType>type;
      default:
        throw new BadRequestException('UserTemplateRequestType is invalid.');
    }
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
