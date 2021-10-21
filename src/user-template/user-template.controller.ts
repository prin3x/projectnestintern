import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ListQueryParams, ResponseList } from '../app/app.interface';
import { AppService } from '../app/app.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TbsSmsApiGatewayV2Service } from '../tbs-sms-api-gateway-v2/tbs-sms-api-gateway-v2.service';
import { UserTemplateDefaultDto, UserTemplateDto } from './user-template.dto';
import { UserTemplateStatus } from './user-template.entity';
import { UserTemplateService } from './user-template.service';

@Controller('user-template')
@UseGuards(JwtAuthGuard)
export class UserTemplateController {
  constructor(
    private readonly appService: AppService,
    private readonly tbsSmsApiGatewayv2Service: TbsSmsApiGatewayV2Service,
    private readonly userTemplateService: UserTemplateService
  ) {}

  @Post()
  async add(@Body() fd: UserTemplateDto) {
    const res = await this.userTemplateService.insert(fd, false);

    return { id: res.id, data: fd };
  }

  @Post('/default')
  async addDefault(@Body() fd: UserTemplateDefaultDto) {
    const res = await this.userTemplateService.insert(
      {
        accId: 0,
        template: fd.template,
      } as UserTemplateDto,
      true
    );

    return { id: res.id, data: fd };
  }

  @Get()
  async list(@Query() q: ListQueryParams, @Query('status') qStatus: string) {
    const queryParams = this.appService.parseQueryString(q);

    let status: UserTemplateStatus | UserTemplateStatus[] = [
      UserTemplateStatus.Ready,
      UserTemplateStatus.Disabled,
    ];

    if (qStatus) status = this.userTemplateService.validUserTemplateStatus(qStatus);

    const [dUserTemplate, totalUserTemplate] = await this.userTemplateService.list(
      queryParams,
      status,
      false
    );

    return {
      items: dUserTemplate,
      itemCount: dUserTemplate.length,
      page: queryParams.page,
      total: totalUserTemplate,
    } as ResponseList;
  }

  @Get('default')
  async listDefault(@Query() q: ListQueryParams, @Query('status') qStatus: string) {
    const queryParams = this.appService.parseQueryString(q);

    let status: UserTemplateStatus | UserTemplateStatus[] = [
      UserTemplateStatus.Ready,
      UserTemplateStatus.Disabled,
    ];

    if (qStatus) status = this.userTemplateService.validUserTemplateStatus(qStatus);

    const [dUserTemplate, totalUserTemplate] = await this.userTemplateService.list(
      queryParams,
      status,
      true
    );

    return {
      items: dUserTemplate,
      itemCount: dUserTemplate.length,
      page: queryParams.page,
      total: totalUserTemplate,
    } as ResponseList;
  }

  @Get('variable-keys')
  getVariableKeys() {
    const items = [
      { label: 'Username', value: '__USERNAME__' },
      { label: 'Password', value: '__PASSWORD__' },
      { label: 'Email', value: '__EMAIL__' },
      { label: 'Phone number', value: '__PHONENUMBER__' },
      { label: 'Bank Account', value: '__BANKACCOUNT__' },
      { label: 'Bank Name', value: '__BANKNAME__' },
      { label: 'OTP Number', value: '__OTPNUMBER__' },
      { label: 'OTP Time', value: '__OTPTIME__' },
      { label: 'OTP Ref', value: '__OTPREF__' },
      { label: 'Amount ', value: '__AMOUNT__' },
    ];

    return {
      items,
      itemCount: items.length,
      page: 1,
      total: items.length,
    } as ResponseList;
  }

  @Get(':id')
  async get(@Param('id') id: number) {
    const dUserTemplate = await this.userTemplateService.get(+id);

    if (!dUserTemplate) throw new NotFoundException();

    return { data: dUserTemplate };
  }

  @Patch(':id')
  async update(@Body() fd: UserTemplateDto, @Param('id') id: number) {
    id = +id;

    await this.userTemplateService.update(id, fd, false);

    return { id, data: fd };
  }

  @Patch(':id/default')
  async updateDefault(@Body() fd: UserTemplateDefaultDto, @Param('id') id: number) {
    id = +id;

    await this.userTemplateService.update(
      id,
      {
        accId: 0,
        template: fd.template,
      } as UserTemplateDto,
      true
    );

    return { id, data: fd };
  }

  @Patch(':id/disabled')
  async disabled(@Param('id') id: number) {
    id = +id;

    await this.userTemplateService.disable(id);

    return { id };
  }

  @Patch(':id/enabled')
  async enabled(@Param('id') id: number) {
    id = +id;

    await this.userTemplateService.enable(id);

    return { id };
  }

  @Put('reload-default-template')
  async reloadDefaultTemplate() {
    await this.tbsSmsApiGatewayv2Service.reloadDefaultUserTemplate();

    return { success: true };
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    id = +id;

    await this.userTemplateService.delete(id);

    return { id };
  }
}
