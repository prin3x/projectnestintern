import { BadRequestException, Injectable } from '@nestjs/common';
import { ListBasicOperation, ListQueryParams } from './app.interface';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  parseQueryString(q: ListQueryParams): ListBasicOperation {
    const rtn: ListBasicOperation = {
      page: +q.page || 1,
      limit: +q.limit ? (+q.limit > 100 ? 100 : +q.limit) : 10,
      skip: (q.page - 1) * q.limit,
      orderBy: q.order_by || 'id',
      order: 'ASC',
      search: q.search ? q.search.trim() : '',
      startDate: undefined,
      endDate: undefined,
    };

    q.order = q.order ? q.order.toUpperCase() : '';
    rtn.order = q.order != 'ASC' && q.order != 'DESC' ? 'ASC' : q.order;
    rtn.skip = (rtn.page - 1) * rtn.limit;

    if (q.start_date && q.end_date) {
      if (!this.chkDate(q.start_date))
        throw new BadRequestException(
          'start_date is invalid.',
          'general.start_date.invalid'
        );

      if (!this.chkDate(q.end_date))
        throw new BadRequestException('end_date is invalid.', 'general.end_date.invalid');

      if (!this.chkDateRange(q.start_date, q.end_date))
        throw new BadRequestException(
          'Range date is invalid.',
          'general.range-date.invalid'
        );

      rtn.startDate = q.start_date;
      rtn.endDate = q.end_date;
    }

    return rtn;
  }

  chkDate(date: any): boolean {
    return !isNaN(Date.parse(date));
  }

  chkDateRange(startDate: any, endDate: any): boolean {
    return !(Date.parse(startDate) > Date.parse(endDate));
  }
}
