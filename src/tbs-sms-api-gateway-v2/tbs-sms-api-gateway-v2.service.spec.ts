import { Test, TestingModule } from '@nestjs/testing';
import { TbsSmsApiGatewayV2Service } from './tbs-sms-api-gateway-v2.service';

describe('TbsSmsApiGatewayV2Service', () => {
  let service: TbsSmsApiGatewayV2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TbsSmsApiGatewayV2Service],
    }).compile();

    service = module.get<TbsSmsApiGatewayV2Service>(TbsSmsApiGatewayV2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
