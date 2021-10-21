export interface ListBasicOperation {
  page: number;
  skip: number;
  limit: number;
  orderBy: string;
  order: 'ASC' | 'DESC';
  search: string;
  startDate: Date;
  endDate: Date;
}

export interface ListQueryParams {
  page: number;
  limit: number;
  order_by: string;
  order: string;
  search: string;
  start_date: Date;
  end_date: Date;
}

export interface ResponseList {
  items: any[];
  itemCount: number;
  page: number;
  total: number;
  optional?: any;
}
