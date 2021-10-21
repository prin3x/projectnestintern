import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ListQueryParams, ResponseList } from '../app/app.interface';
import { AppService } from '../app/app.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  UserTemplateRequestRejectedDto,
  UserTemplateRequestUpdateDto,
} from './user-template-request.dto';
import {
  UserTemplateRequestStatus,
  UserTemplateRequestType,
} from './user-template-request.entity';
import { UserTemplateRequestService } from './user-template-request.service';

@Controller('user-template-request')
@UseGuards(JwtAuthGuard)
export class UserTemplateRequestController {
  constructor(
    private readonly appService: AppService,
    private readonly userTemplateRequestService: UserTemplateRequestService
  ) {}

  @Get()
  async list(
    @Query() q: ListQueryParams,
    @Query('status') qStatus: string,
    @Query('type') qType: string
  ) {
    const queryParams = this.appService.parseQueryString(q);

    let status: UserTemplateRequestStatus | UserTemplateRequestStatus[] = [
      UserTemplateRequestStatus.Approved,
      UserTemplateRequestStatus.Pending,
      UserTemplateRequestStatus.Rejected,
    ];
    let type: UserTemplateRequestType | UserTemplateRequestType[] = [
      UserTemplateRequestType.Marketing,
      UserTemplateRequestType.Notify,
      UserTemplateRequestType.Otp,
    ];

    if (qStatus)
      status = this.userTemplateRequestService.validUserTemplateRequestStatus(qStatus);

    if (qType)
      type = this.userTemplateRequestService.validUserTemplateRequestType(qStatus);

    const [dUserTemplateRequest, totalUserTemplateRequest] =
      await this.userTemplateRequestService.list(queryParams, status, type);

    return {
      items: dUserTemplateRequest,
      itemCount: dUserTemplateRequest.length,
      page: queryParams.page,
      total: totalUserTemplateRequest,
    } as ResponseList;
  }

  @Get(':id')
  async get(@Param('id') id: number) {
    const dUserTemplate = await this.userTemplateRequestService.get(+id);

    if (!dUserTemplate) throw new NotFoundException();

    return { data: dUserTemplate };
  }

  @Patch(':id')
  async update(@Body() fd: UserTemplateRequestUpdateDto, @Param('id') id: number) {
    id = +id;

    await this.userTemplateRequestService.update(id, fd);

    return { id, data: fd };
  }

  @Patch(':id/approve')
  async approve(@Param('id') id: number) {
    id = +id;

    await this.userTemplateRequestService.approved(id, 1);

    return { id };
  }

  @Patch(':id/reject')
  async reject(@Param('id') id: number, @Body() fd: UserTemplateRequestRejectedDto) {
    id = +id;

    await this.userTemplateRequestService.rejected(id, fd, 1);

    return { id, data: fd };
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    id = +id;

    await this.userTemplateRequestService.deleted(id);

    return { id };
  }
}
